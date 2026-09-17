import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider, AuthContext } from './context/AuthContext';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import CreateProfile from './pages/admin/CreateProfile';
import EditProfile from './pages/admin/EditProfile';
import BrowseProfiles from './pages/BrowseProfiles';
import { Privacy, Terms, Refund } from './pages/LegalPages';
import './site.css';

function AppContent() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="site-main">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/browse" element={<BrowseProfiles />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund" element={<Refund />} />
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/change-password"
          element={isAuthenticated ? <ChangePassword /> : <Navigate to="/login" replace />}
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
      </main>
      <SiteFooter />
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
