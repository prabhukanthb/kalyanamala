import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Welcome to Kalyanamala</h1>
      <p>Find your perfect match.</p>

      {isAuthenticated ? (
        <>
          <h2>Welcome, {user?.firstName}!</h2>
          <button onClick={() => navigate('/profile')} style={btnBlue}>My Profile</button>
        </>
      ) : (
        <>
          <button onClick={() => navigate('/login')} style={btnBlue}>Login</button>
          <button onClick={() => navigate('/register')} style={btnGreen}>Register</button>
        </>
      )}
    </div>
  );
};

const btnBlue = {
  padding: '10px 20px',
  margin: '10px',
  backgroundColor: '#2196F3',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

const btnGreen = {
  ...btnBlue,
  backgroundColor: '#4CAF50'
};

export default Home;
