import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ThreeBackground from '../components/ThreeBackground';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalVoters: 0,
    totalCandidates: 0,
    totalVotes: 0
  });
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
      return;
    }

    // Fetch user info
    fetch('/api/auth/me', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => setUser(data))
      .catch(err => {
        console.error('Failed to fetch user:', err);
        if (err.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/');
        }
      });

    // Fetch voting stats (optional - will use defaults if endpoint doesn't exist)
    fetch('/api/stats', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => setStats(data))
      .catch(err => {
        // Endpoint might not exist - just use default stats
      });
  }, [navigate]);

  return (
    <div style={styles.container}>
      <ThreeBackground />
      <Navbar />
      
      <div style={styles.content}>
        <div style={styles.hero}>
          <h1 style={styles.title}>
            Welcome{user ? `, ${user.name}` : ''}! 🎉
          </h1>
          <p style={styles.subtitle}>
            Your voice matters. Cast your vote today!
          </p>
        </div>

        <div style={styles.statsGrid}>
          <div 
            style={{
              ...styles.statCard,
              ...(hoveredCard === 'stat1' ? styles.hoveredStatCard : {})
            }}
            onMouseEnter={() => setHoveredCard('stat1')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statNumber}>{stats.totalVoters}</div>
            <div style={styles.statLabel}>Total Voters</div>
          </div>

          <div 
            style={{
              ...styles.statCard,
              ...(hoveredCard === 'stat2' ? styles.hoveredStatCard : {})
            }}
            onMouseEnter={() => setHoveredCard('stat2')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.statIcon}>🎯</div>
            <div style={styles.statNumber}>{stats.totalCandidates}</div>
            <div style={styles.statLabel}>Candidates</div>
          </div>

          <div 
            style={{
              ...styles.statCard,
              ...(hoveredCard === 'stat3' ? styles.hoveredStatCard : {})
            }}
            onMouseEnter={() => setHoveredCard('stat3')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statNumber}>{stats.totalVotes}</div>
            <div style={styles.statLabel}>Votes Cast</div>
          </div>
        </div>

        <div style={styles.actionsGrid}>
          <div 
            style={{
              ...styles.actionCard,
              ...(hoveredCard === 'vote' ? styles.hoveredActionCard : {})
            }}
            onClick={() => navigate('/vote')}
            onMouseEnter={() => setHoveredCard('vote')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.actionIcon}>🗳️</div>
            <h3 style={styles.actionTitle}>Cast Your Vote</h3>
            <p style={styles.actionDescription}>
              Vote for your preferred candidate
            </p>
            <button style={styles.actionButton}>
              Vote Now →
            </button>
          </div>

          <div 
            style={{
              ...styles.actionCard,
              ...(hoveredCard === 'profile' ? styles.hoveredActionCard : {})
            }}
            onClick={() => navigate('/profile')}
            onMouseEnter={() => setHoveredCard('profile')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.actionIcon}>👤</div>
            <h3 style={styles.actionTitle}>Your Profile</h3>
            <p style={styles.actionDescription}>
              View and manage your profile
            </p>
            <button style={styles.actionButton}>
              Go to Profile →
            </button>
          </div>

          <div 
            style={{
              ...styles.actionCard,
              ...(hoveredCard === 'results' ? styles.hoveredActionCard : {})
            }}
            onClick={() => navigate('/results')}
            onMouseEnter={() => setHoveredCard('results')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.actionIcon}>📈</div>
            <h3 style={styles.actionTitle}>View Results</h3>
            <p style={styles.actionDescription}>
              See current voting results
            </p>
            <button style={styles.actionButton}>
              View Results →
            </button>
          </div>
        </div>

        <div style={styles.infoSection}>
          <h2 style={styles.infoTitle}>📢 How It Works</h2>
          <div style={styles.stepsGrid}>
            <div style={styles.step}>
              <div style={styles.stepNumber}>1</div>
              <h4 style={styles.stepTitle}>Register</h4>
              <p style={styles.stepText}>Create your account</p>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>2</div>
              <h4 style={styles.stepTitle}>Choose</h4>
              <p style={styles.stepText}>Select your candidate</p>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>3</div>
              <h4 style={styles.stepTitle}>Vote</h4>
              <p style={styles.stepText}>Cast your vote securely</p>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>4</div>
              <h4 style={styles.stepTitle}>Results</h4>
              <p style={styles.stepText}>See the outcome</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  hero: {
    textAlign: 'center',
    marginBottom: 50
  },
  title: {
    fontSize: 48,
    fontWeight: 700,
    color: 'white',
    margin: 0,
    marginBottom: 15,
    textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)'
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 20,
    marginBottom: 50
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(15px)',
    borderRadius: 20,
    padding: 30,
    textAlign: 'center',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer'
  },
  hoveredStatCard: {
    transform: 'translateY(-8px) scale(1.05)',
    background: 'rgba(255, 255, 255, 0.25)',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 20px 60px rgba(100, 200, 255, 0.5), 0 0 40px rgba(100, 200, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
  },
  statIcon: {
    fontSize: 48,
    marginBottom: 15
  },
  statNumber: {
    fontSize: 42,
    fontWeight: 700,
    color: 'white',
    marginBottom: 10
  },
  statLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 25,
    marginBottom: 50
  },
  actionCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(15px)',
    borderRadius: 20,
    padding: 30,
    textAlign: 'center',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
  },
  hoveredActionCard: {
    transform: 'translateY(-10px) scale(1.03)',
    background: 'rgba(255, 255, 255, 0.25)',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 25px 70px rgba(147, 112, 219, 0.5), 0 0 50px rgba(147, 112, 219, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
  },
  actionIcon: {
    fontSize: 56,
    marginBottom: 15
  },
  actionTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: 'white',
    margin: '0 0 12px 0'
  },
  actionDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20
  },
  actionButton: {
    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
    color: '#4a148c',
    border: 'none',
    padding: '12px 30px',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  infoSection: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    padding: 40,
    border: '2px solid rgba(255, 255, 255, 0.2)'
  },
  infoTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: 'white',
    textAlign: 'center',
    marginBottom: 40
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 30
  },
  step: {
    textAlign: 'center'
  },
  stepNumber: {
    width: 60,
    height: 60,
    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
    color: '#4a148c',
    fontSize: 28,
    fontWeight: 700,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px',
    boxShadow: '0 5px 20px rgba(255, 215, 0, 0.4)'
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: 'white',
    margin: '0 0 8px 0'
  },
  stepText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0
  }
};
