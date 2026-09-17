const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const User = require('../models/User');
const Profile = require('../models/Profile');
const {
  PASSWORD_HINT,
  applyDefaultPassword,
  findUserByEmailOrPhone,
  publicUser
} = require('../utils/defaultPassword');
const { notifyTemporaryPassword } = require('../utils/notifyPassword');

// =========================
// AUTH MIDDLEWARE
// =========================
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
        message: 'Authorization token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }

    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication failed'
    });
  }
};

// =========================
// VALIDATION
// =========================
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  body('alternativePhone').optional({ checkFalsy: true }).matches(/^[0-9]{10}$/).withMessage('Alternative phone must be 10 digits'),
  body('firstName').trim().notEmpty().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional({ checkFalsy: true }).trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('surname').optional({ checkFalsy: true }).trim().isLength({ min: 2 }).withMessage('Surname must be at least 2 characters'),
  body().custom((_, { req }) => {
    const surname = String(req.body.surname || req.body.lastName || '').trim();
    if (surname.length < 2) {
      throw new Error('Surname must be at least 2 characters');
    }
    return true;
  }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match')
];

const loginValidation = [
  body('emailOrPhone').notEmpty().withMessage('Email or phone is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// =========================
// REGISTER
// =========================
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map((e) => e.msg)
      });
    }

    const {
      email,
      phone,
      alternativePhone,
      firstName,
      lastName,
      surname,
      password,
      role
    } = req.body;
    const resolvedSurname = String(surname || lastName || '').trim();
    const resolvedLastName = String(lastName || surname || '').trim();

    const existingUser = await User.findOne({
      $or: [{email},{phone}]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: existingUser.email === email
          ? 'Email already registered'
          : 'Phone already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS || '10', 10)
    );

    const user = await User.create({
      email,
      phone,
      alternativePhone: alternativePhone ? String(alternativePhone).trim() : null,
      firstName,
      lastName: resolvedLastName,
      surname: resolvedSurname,
      password: hashedPassword,
      role: role || 'user',
      status: 'active',
      isActive: true
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: `${process.env.JWT_EXPIRY || 30}d` }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: publicUser(user)
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
});

// =========================
// LOGIN
// =========================
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map((e) => e.msg)
      });
    }

    const { emailOrPhone, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email/phone or password is incorrect'
      });
    }

    if (user.status === 'deleted') {
      return res.status(403).json({
        error: 'Account deleted',
        message: 'This account has been deleted'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email/phone or password is incorrect'
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: `${process.env.JWT_EXPIRY || 30}d` }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: publicUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

// =========================
// LOGOUT
// =========================
router.post('/logout', authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// =========================
// CURRENT USER
// =========================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: publicUser(user)
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

// =========================
// UPDATE ACCOUNT (alt mobile)
// =========================
router.put(
  '/account',
  authMiddleware,
  body('alternativePhone').optional({ checkFalsy: true }).matches(/^[0-9]{10}$/).withMessage('Alternative phone must be 10 digits'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array().map((e) => e.msg)
        });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (req.body.alternativePhone !== undefined) {
        user.alternativePhone = req.body.alternativePhone || null;
      }
      if (req.body.surname !== undefined) {
        user.surname = String(req.body.surname || '').trim();
      }
      if (req.body.lastName !== undefined) {
        user.lastName = String(req.body.lastName || user.surname || '').trim();
      }

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Account updated',
        user: publicUser(user)
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to update account',
        message: error.message
      });
    }
  }
);

// =========================
// CHANGE PASSWORD
// =========================
router.put(
  '/change-password',
  authMiddleware,
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => value === req.body.newPassword).withMessage('Passwords do not match'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array().map((e) => e.msg)
        });
      }

      const { oldPassword, newPassword } = req.body;

      const user = await User.findById(req.userId).select('+password');
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Invalid password',
          message: 'Old password is incorrect'
        });
      }

      user.password = await bcrypt.hash(
        newPassword,
        parseInt(process.env.BCRYPT_ROUNDS || '10', 10)
      );

      user.passwordResetRequired = false;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Failed to change password',
        message: error.message
      });
    }
  }
);

// =========================
// FORGOT PASSWORD
// Identity must match registered email or mobile. Password becomes
// first 4 letters of name + @ + last 4 digits of registered mobile.
// =========================
router.post(
  '/forgot-password',
  body('emailOrPhone').notEmpty().withMessage('Registered email or mobile number is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array().map((e) => e.msg)
        });
      }

      const user = await findUserByEmailOrPhone(User, req.body.emailOrPhone);
      if (!user) {
        return res.status(404).json({
          error: 'No match',
          message: 'No account found with that registered email or mobile number. Contact admin if you need help.'
        });
      }

      const tempPassword = await applyDefaultPassword(user);
      await user.save();

      const deliveredVia = await notifyTemporaryPassword(user, tempPassword);
      const deliveryNote = deliveredVia.length
        ? `A temporary password was sent to your registered ${deliveredVia.join(' and ')}.`
        : 'Email/SMS is not configured, so use the default password format below or contact admin.';

      return res.status(200).json({
        success: true,
        message: `Your password was reset. ${deliveryNote}`,
        passwordHint: PASSWORD_HINT,
        deliveredVia
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Password reset failed',
        message: error.message
      });
    }
  }
);

// =========================
// RESET PASSWORD (logged-in admin fallback)
// =========================
router.post(
  '/reset-password',
  authMiddleware,
  body('emailOrPhone').notEmpty().withMessage('Email or phone is required'),
  async (req, res) => {
    try {
      if (req.userRole !== 'admin' && req.userRole !== 'subadmin') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Admin access required'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array().map((e) => e.msg)
        });
      }

      const user = await findUserByEmailOrPhone(User, req.body.emailOrPhone);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'No user found with that registered email or mobile number'
        });
      }

      const tempPassword = await applyDefaultPassword(user);
      await user.save();
      const deliveredVia = await notifyTemporaryPassword(user, tempPassword);

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully',
        tempPassword,
        passwordHint: PASSWORD_HINT,
        deliveredVia
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Password reset failed',
        message: error.message
      });
    }
  }
);

module.exports = router;
