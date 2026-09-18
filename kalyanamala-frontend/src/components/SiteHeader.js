import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BRAND, HELPLINE_DISPLAY, HELPLINE_TEL, REGISTER_CTA } from '../siteConfig';

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About Us', hash: 'about' },
  { label: 'Search Profiles', to: '/browse' },
  { label: 'Membership', hash: 'membership' },
  { label: 'Success Stories', hash: 'stories' },
  { label: 'Services', hash: 'services' },
  { label: 'Contact Us', hash: 'contact' }
];

const SiteHeader = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const goHash = (id) => {
    setOpen(false);
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate(`/#${id}`);
  };

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="site-topbar">
        <div>
          Helpline:{' '}
          <a href={HELPLINE_TEL} aria-label={`Call the Vijayawada helpline ${HELPLINE_DISPLAY}`}>
            {HELPLINE_DISPLAY}
          </a>
        </div>
      </div>
      <div className="site-header-inner">
        <Link to="/" className="site-logo" onClick={() => setOpen(false)}>
          <span className="site-mark" aria-hidden="true">NK</span>
          {BRAND}
        </Link>
        <nav className={open ? 'site-nav open' : 'site-nav'} aria-label="Main">
          {NAV.map((item) => (
            item.hash ? (
              <button key={item.label} type="button" className="linkish" onClick={() => goHash(item.hash)}>
                {item.label}
              </button>
            ) : (
              <Link key={item.label} to={item.to} onClick={() => setOpen(false)}>{item.label}</Link>
            )
          ))}
          {isAuthenticated && (
            <>
              <Link to="/profile" onClick={() => setOpen(false)}>My Profile</Link>
              {(user?.role === 'admin' || user?.role === 'subadmin') && (
                <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>
              )}
              <span>Hi, {user?.firstName}</span>
              <button type="button" className="btn-ghost" onClick={handleLogout}>Logout</button>
            </>
          )}
          {!isAuthenticated && (
            <Link to="/login" className="nav-login" onClick={() => setOpen(false)}>Login</Link>
          )}
        </nav>
        <div className="header-cta">
          {!isAuthenticated && (
            <Link to="/register" className="btn-gold" onClick={() => setOpen(false)}>{REGISTER_CTA}</Link>
          )}
          <button type="button" className="menu-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
