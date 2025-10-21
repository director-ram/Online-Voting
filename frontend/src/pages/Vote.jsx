import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ThreeBackground from '../components/ThreeBackground';
import { getImageUrl } from '../config/api';

export default function Vote() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [votingStatus, setVotingStatus] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
      return;
    }

    // Fetch voting status
    fetch('/api/voters/voting-status', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => {
        setVotingStatus(data);
      })
      .catch(err => {
        console.error('Failed to fetch voting status:', err);
      });

    // Fetch candidates
    fetch('/api/candidates', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => {
        setCandidates(data.candidates || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch candidates:', err);
        setLoading(false);
      });

    // Check if user has already voted (optional endpoint)
    fetch('/api/voters/status', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => {
        setHasVoted(data.has_voted || false);
      })
      .catch(err => {
        // Endpoint might not exist - assume user hasn't voted
      });
  }, [navigate]);

  const handleVote = async () => {
    if (!selectedCandidate) {
      alert('Please select a candidate first!');
      return;
    }

    if (hasVoted) {
      alert('You have already voted!');
      return;
    }

    const token = localStorage.getItem('accessToken');
    setVoting(true);

    try {
      const response = await fetch('/api/voters/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ candidate_id: selectedCandidate })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cast vote');
      }

      alert('✅ Vote cast successfully!');
      setHasVoted(true);
      setTimeout(() => navigate('/results'), 1500);
    } catch (err) {
      alert('❌ ' + err.message);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div style={styles.container}>
      <ThreeBackground />
      <Navbar />
      
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>🗳️ Cast Your Vote</h1>
          <p style={styles.subtitle}>
            {hasVoted ? 
              '✅ You have already voted today! Come back tomorrow to vote again.' : 
              'Select a candidate and cast your vote (resets daily)'
            }
          </p>
        </div>

        {/* Voting Status Banner */}
        {votingStatus && (
          <div style={votingStatus.is_open ? styles.openBanner : styles.closedBanner}>
            <div style={styles.bannerIcon}>
              {votingStatus.is_open ? '✅' : '⏰'}
            </div>
            <div style={styles.bannerContent}>
              <h3 style={styles.bannerTitle}>
                {votingStatus.is_open ? 'Voting is Open!' : 'Voting is Closed'}
              </h3>
              <p style={styles.bannerText}>{votingStatus.message}</p>
              <p style={styles.bannerTime}>
                🕐 Voting Hours: {votingStatus.voting_hours} | Current Time: {votingStatus.current_time}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}>⏳</div>
            <p style={styles.loadingText}>Loading candidates...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyTitle}>No Candidates Available</h3>
            <p style={styles.emptyText}>
              There are no candidates to vote for at the moment.
            </p>
          </div>
        ) : (
          <>
            <div style={styles.candidatesGrid}>
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  style={{
                    ...styles.candidateCard,
                    ...(selectedCandidate === candidate.id ? styles.selectedCard : {}),
                    ...(hasVoted ? styles.disabledCard : {}),
                    ...(hoveredCard === candidate.id && !hasVoted ? styles.hoveredCard : {})
                  }}
                  onClick={() => !hasVoted && setSelectedCandidate(candidate.id)}
                  onMouseEnter={() => !hasVoted && setHoveredCard(candidate.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={styles.candidatePhoto}>
                    {candidate.profile_pic ? (
                      <img 
                        src={getImageUrl(candidate.profile_pic)} 
                        alt={candidate.name}
                        style={styles.photoImg}
                      />
                    ) : (
                      <div style={styles.photoPlaceholder}>
                        {candidate.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>

                  {selectedCandidate === candidate.id && !hasVoted && (
                    <div style={styles.selectedBadge}>✓ Selected</div>
                  )}

                  <h3 style={styles.candidateName}>{candidate.name}</h3>
                  
                  <div style={styles.candidateInfo}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Party:</span>
                      <span style={styles.infoValue}>{candidate.party || 'Independent'}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Age:</span>
                      <span style={styles.infoValue}>
                        {candidate.dob ? 
                          new Date().getFullYear() - new Date(candidate.dob).getFullYear() : 
                          'N/A'
                        }
                      </span>
                    </div>
                  </div>

                  {candidate.description && (
                    <p style={styles.candidateDescription}>
                      {candidate.description}
                    </p>
                  )}

                  <button
                    style={{
                      ...styles.selectButton,
                      ...(selectedCandidate === candidate.id ? styles.selectedButton : {}),
                      ...(hasVoted ? styles.disabledButton : {})
                    }}
                    disabled={hasVoted}
                  >
                    {selectedCandidate === candidate.id ? '✓ Selected' : 'Select'}
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.voteSection}>
              <button
                onClick={handleVote}
                disabled={!selectedCandidate || hasVoted || voting || (votingStatus && !votingStatus.is_open)}
                style={{
                  ...styles.voteButton,
                  opacity: (!selectedCandidate || hasVoted || voting || (votingStatus && !votingStatus.is_open)) ? 0.5 : 1,
                  cursor: (!selectedCandidate || hasVoted || voting || (votingStatus && !votingStatus.is_open)) ? 'not-allowed' : 'pointer'
                }}
              >
                {voting ? '⏳ Casting Vote...' : 
                 hasVoted ? '✅ Already Voted' : 
                 (votingStatus && !votingStatus.is_open) ? '🔒 Voting Closed' :
                 '🗳️ Cast Vote'}
              </button>
            </div>
          </>
        )}
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
  header: {
    textAlign: 'center',
    marginBottom: 40
  },
  title: {
    fontSize: 42,
    fontWeight: 700,
    color: 'white',
    margin: 0,
    marginBottom: 12,
    textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)'
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0
  },
  openBanner: {
    background: 'rgba(76, 175, 80, 0.25)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    border: '3px solid rgba(76, 175, 80, 0.5)',
    boxShadow: '0 10px 30px rgba(76, 175, 80, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: 20
  },
  closedBanner: {
    background: 'rgba(244, 67, 54, 0.25)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    border: '3px solid rgba(244, 67, 54, 0.5)',
    boxShadow: '0 10px 30px rgba(244, 67, 54, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: 20
  },
  bannerIcon: {
    fontSize: 48,
    minWidth: 48
  },
  bannerContent: {
    flex: 1
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: 'white',
    margin: '0 0 8px 0'
  },
  bannerText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    margin: '0 0 5px 0'
  },
  bannerTime: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
    fontStyle: 'italic'
  },
  loading: {
    textAlign: 'center',
    padding: 60
  },
  spinner: {
    fontSize: 64,
    marginBottom: 20,
    animation: 'pulse 1.5s infinite'
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 600
  },
  emptyState: {
    textAlign: 'center',
    padding: 60,
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    border: '2px solid rgba(255, 255, 255, 0.2)'
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: 'white',
    margin: '0 0 12px 0'
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0
  },
  candidatesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 25,
    marginBottom: 40
  },
  candidateCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(15px)',
    borderRadius: 20,
    padding: 25,
    border: '2px solid rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
  },
  hoveredCard: {
    transform: 'translateY(-8px) scale(1.02)',
    background: 'rgba(255, 255, 255, 0.25)',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 20px 60px rgba(147, 112, 219, 0.5), 0 0 40px rgba(147, 112, 219, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
  },
  selectedCard: {
    border: '3px solid #ffd700',
    boxShadow: '0 15px 40px rgba(255, 215, 0, 0.4)',
    transform: 'translateY(-5px)'
  },
  disabledCard: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  candidatePhoto: {
    width: 120,
    height: 120,
    margin: '0 auto 20px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '4px solid rgba(255, 255, 255, 0.3)'
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
    color: '#4a148c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 48,
    fontWeight: 700
  },
  selectedBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    background: '#ffd700',
    color: '#4a148c',
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700
  },
  candidateName: {
    fontSize: 24,
    fontWeight: 700,
    color: 'white',
    textAlign: 'center',
    margin: '0 0 15px 0'
  },
  candidateInfo: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: 15
  },
  infoItem: {
    textAlign: 'center'
  },
  infoLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    display: 'block',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  infoValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: 600,
    display: 'block'
  },
  candidateDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 1.5
  },
  selectButton: {
    width: '100%',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    color: 'white',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  selectedButton: {
    background: '#ffd700',
    color: '#4a148c',
    border: '2px solid #ffd700'
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  voteSection: {
    textAlign: 'center'
  },
  voteButton: {
    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
    color: '#4a148c',
    border: 'none',
    padding: '18px 60px',
    borderRadius: 15,
    fontSize: 20,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 10px 30px rgba(255, 215, 0, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  }
};
