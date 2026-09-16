import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate
} from 'react-router-dom';

import { AuthProvider, AuthContext } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import CreateProfile from './pages/admin/CreateProfile';
import EditProfile from './pages/admin/EditProfile';
import BrowseProfiles from './pages/BrowseProfiles';

const NavBar = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav
      style={{
        backgroundColor: '#333',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Link
        to="/"
        style={{
          color: 'white',
          textDecoration: 'none',
          fontSize: '20px',
          fontWeight: 'bold'
        }}
      >
        💍 Kalyanamala
      </Link>

      <div>
        {isAuthenticated ? (
          <>
            <span style={{ marginRight: '20px' }}>
              Hi, {user?.firstName}
              {user?.surname ? ` ${user.surname}` : ''}!
            </span>

<Link
              to="/browse"
              style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}
            >
              Browse
            </Link>
                
            <Link
              to="/profile"
              style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}
            >
              Profile
            </Link>

            {(user?.role === 'admin' || user?.role === 'subadmin') && (
              <Link
                to="/admin"
                style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}
              >
                Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              style={{
                padding: '8px 15px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '5px'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}
            >
              Login
            </Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

function AppContent() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';

  return (
    <div>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
  <Route path="/browse" element={<BrowseProfiles />} />

        <Route
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/admin"
          element={isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />}
        />

        <Route
          path="/admin/profiles/create"
          element={isAuthenticated && isAdmin ? <CreateProfile /> : <Navigate to="/" replace />}
        />

        <Route
          path="/admin/profiles/:id/edit"
          element={isAuthenticated && isAdmin ? <EditProfile /> : <Navigate to="/" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
