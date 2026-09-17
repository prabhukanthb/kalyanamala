import React from 'react';
import { Link } from 'react-router-dom';
import {
  BRAND,
  EMAIL,
  HELPLINE_DISPLAY,
  HELPLINE_TEL,
  ORG,
  WHATSAPP_HREF
} from '../siteConfig';

const SiteFooter = () => (
  <footer className="site-footer">
    <div className="footer-grid">
      <div>
        <strong>{BRAND}</strong>
        <p>Exclusive mala matrimony, owned and operated by {ORG}. Main branch in Vijayawada. Twenty years of careful introductions for candidates and their parents.</p>
      </div>
      <div>
        <strong>Explore</strong>
        <p><Link to="/">Home</Link></p>
        <p><Link to="/browse">Search Profiles</Link></p>
        <p><Link to="/register">Register Free</Link></p>
        <p><Link to="/login">Login</Link></p>
      </div>
      <div>
        <strong>Policies</strong>
        <p><Link to="/privacy">Privacy Policy</Link></p>
        <p><Link to="/terms">Terms of Use</Link></p>
        <p><Link to="/refund">Refund Policy</Link></p>
      </div>
      <div>
        <strong>Contact</strong>
        <p><a href={HELPLINE_TEL}>{HELPLINE_DISPLAY}</a></p>
        <p><a href={WHATSAPP_HREF} target="_blank" rel="noreferrer">WhatsApp the branch</a></p>
        <p><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
        <p>
          <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">Facebook</a>
          {' · '}
          <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">Instagram</a>
          {' · '}
          <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noreferrer">YouTube</a>
        </p>
      </div>
    </div>
    <div className="footer-copy">
      © {new Date().getFullYear()} {ORG}. {BRAND} is for the Mala community. All rights reserved.
    </div>
  </footer>
);

export default SiteFooter;
