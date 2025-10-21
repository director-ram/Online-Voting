import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('accessToken');
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          🗳️ <span style={styles.logoText}>VoteNow</span>
        </Link>

        <div style={styles.navLinks}>
          {isLoggedIn ? (
            <>
              <Link 
                to="/home" 
                style={{
                  ...styles.navLink,
                  ...(isActive('/home') ? styles.activeLink : {})
                }}
              >
                🏠 Home
              </Link>
              <Link 
                to="/vote" 
                style={{
                  ...styles.navLink,
                  ...(isActive('/vote') ? styles.activeLink : {})
                }}
              >
                📊 Vote
              </Link>
              <Link 
                to="/results" 
                style={{
                  ...styles.navLink,
                  ...(isActive('/results') ? styles.activeLink : {})
                }}
              >
                📈 Results
              </Link>
              <Link 
                to="/profile" 
                style={{
                  ...styles.navLink,
                  ...(isActive('/profile') ? styles.activeLink : {})
                }}
              >
                👤 Profile
              </Link>
              <button onClick={handleLogout} style={styles.logoutButton}>
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" style={styles.navLink}>
                🔐 Login
              </Link>
              <Link to="/register" style={styles.registerButton}>
                📝 Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
    backdropFilter: 'blur(10px)',
    padding: '15px 0',
    boxShadow: '0 5px 30px rgba(0, 0, 0, 0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontSize: 28,
    fontWeight: 700,
    color: 'white',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'transform 0.3s'
  },
  logoText: {
    letterSpacing: '1px'
  },
  navLinks: {
    display: 'flex',
    gap: 20,
    alignItems: 'center'
  },
  navLink: {
    color: 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    fontSize: 16,
    fontWeight: 600,
    padding: '8px 16px',
    borderRadius: 8,
    transition: 'all 0.3s',
    border: '2px solid transparent'
  },
  activeLink: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.3)'
  },
  logoutButton: {
    background: 'rgba(244, 67, 54, 0.3)',
    color: 'white',
    border: '2px solid rgba(244, 67, 54, 0.5)',
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  registerButton: {
    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
    color: '#4a148c',
    textDecoration: 'none',
    border: 'none',
    padding: '8px 20px',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 5px 15px rgba(255, 215, 0, 0.3)'
  }
};
