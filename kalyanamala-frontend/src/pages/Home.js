import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);

  return (
    <div style={{ background: '#FBF6EE', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{
        background: 'linear-gradient(120deg,#5C1028 0%, #8B1E3F 45%, #b43b4a 100%)',
        color: '#fff',
        padding: '72px 24px 80px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 13, letterSpacing: 3, color: '#C9A227', textTransform: 'uppercase' }}>
          Mala community matrimony
        </div>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(36px, 6vw, 58px)',
          margin: '12px 0 10px',
          fontWeight: 700
        }}>
          Kalyanamala
        </h1>
        <p style={{ maxWidth: 560, margin: '0 auto 28px', fontSize: 18, lineHeight: 1.6, opacity: 0.95 }}>
          Profiles with unique IDs, family native places, and partner requirements —
          so matches are clear from the first look.
        </p>
        {isAuthenticated ? (
          <div>
            <div style={{ marginBottom: 18, fontSize: 16 }}>Welcome, {user?.firstName}.</div>
            <button onClick={() => navigate('/browse')} style={goldBtn}>Browse profiles</button>
            <button onClick={() => navigate('/profile')} style={ghostBtn}>My profile</button>
          </div>
        ) : (
          <div>
            <button onClick={() => navigate('/register')} style={goldBtn}>Create account</button>
            <button onClick={() => navigate('/login')} style={ghostBtn}>Login</button>
          </div>
        )}
      </div>

      <div style={{
        maxWidth: 1080, margin: '-40px auto 0', padding: '0 20px 64px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16
      }}>
        {[
          { title: 'Unique profile IDs', body: 'Every biodata has a lasting ID such as M00001 or F00002. Deleted IDs are never reused.' },
          { title: 'Family, side by side', body: 'Father and mother names, occupations, and native places sit together so the family picture is complete.' },
          { title: 'Partner requirement', body: 'What someone is looking for is part of the profile and the downloadable card — never email or phone.' },
          { title: 'Places that matter', body: 'Current city, present address, and native place, with PIN lookup for city and state.' }
        ].map((item) => (
          <div key={item.title} style={{
            background: '#fff', borderRadius: 14, padding: '22px 20px',
            boxShadow: '0 10px 30px rgba(92,16,40,0.08)', borderTop: '3px solid #C9A227'
          }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#8B1E3F', marginBottom: 8 }}>{item.title}</div>
            <div style={{ color: '#6B5348', lineHeight: 1.55, fontSize: 14 }}>{item.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const goldBtn = {
  padding: '12px 22px',
  margin: '6px',
  background: '#C9A227',
  color: '#5C1028',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: 15
};

const ghostBtn = {
  ...goldBtn,
  background: 'transparent',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.55)'
};

export default Home;
