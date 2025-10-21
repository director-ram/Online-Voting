import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ThreeBackground from '../components/ThreeBackground';

// Realistic Fireworks Component
const Fireworks = ({ isActive }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!isActive || hasStartedRef.current) return;
    
    hasStartedRef.current = true; // Prevent double-triggering

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015;
        this.gravity = 0.15;
        this.size = Math.random() * 3 + 2;
      }

      update() {
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    const createFirework = (x, y) => {
      const colors = [
        '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
        '#ff00ff', '#00ffff', '#ffa500', '#ff1493',
        '#ffd700', '#ff6347', '#7fff00', '#ff69b4'
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particleCount = Math.random() * 50 + 50;

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(new Particle(x, y, color));
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(particle => {
        particle.update();
        particle.draw();
        return particle.alpha > 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Launch fireworks at random intervals
    const launchInterval = setInterval(() => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * (canvas.height * 0.5);
      createFirework(x, y);
    }, 400);

    // Initial burst
    setTimeout(() => {
      createFirework(canvas.width * 0.3, canvas.height * 0.3);
      createFirework(canvas.width * 0.7, canvas.height * 0.3);
    }, 100);

    animate();

    // Cleanup after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(launchInterval);
      setTimeout(() => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        particlesRef.current = [];
        // Hide canvas by removing it
        if (canvas) {
          canvas.style.display = 'none';
        }
      }, 2000);
    }, 5000);

    return () => {
      clearInterval(launchInterval);
      clearTimeout(timeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      hasStartedRef.current = false; // Reset for next time
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
};

// Add keyframe animation for winner card pulse
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fireworkPulse {
      0%, 100% {
        transform: scale(1);
        filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
      }
      50% {
        transform: scale(1.05);
        filter: drop-shadow(0 0 40px rgba(255, 215, 0, 1));
      }
    }
  `;
  if (!document.getElementById('firework-animations')) {
    style.id = 'firework-animations';
    document.head.appendChild(style);
  }
}

export default function Results() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isFinalized, setIsFinalized] = useState(false);
  const [winner, setWinner] = useState(null);
  const [votingStatus, setVotingStatus] = useState('');
  const [previousWinnerRevoked, setPreviousWinnerRevoked] = useState(false);
  const [revokedWinnerInfo, setRevokedWinnerInfo] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
      return;
    }

    // Reset fireworks state on load
    setShowFireworks(false);

    // Fetch results
    fetch('/api/candidates/results', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => {
        const resultsData = data.results || [];
        setResults(resultsData);
        setTotalVotes(data.total_votes || 0);
        setIsFinalized(data.is_finalized || false);
        setWinner(data.winner || null);
        setVotingStatus(data.voting_status || '');
        setPreviousWinnerRevoked(data.previous_winner_revoked || false);
        setRevokedWinnerInfo(data.revoked_winner_info || null);
        setLoading(false);

        // Trigger fireworks if voting is finalized and there's a winner
        if (data.is_finalized && data.winner) {
          // Small delay to ensure DOM is ready
          setTimeout(() => setShowFireworks(true), 800);
        }
      })
      .catch(err => {
        console.error('Failed to fetch results:', err);
        setLoading(false);
      });
  }, [navigate]);

  const getPercentage = (votes) => {
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  return (
    <div style={styles.container}>
      <ThreeBackground />
      <Navbar />
      
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>📈 Voting Results</h1>
          <p style={styles.subtitle}>
            Today's standings and statistics (resets daily)
          </p>
        </div>

        {/* Voting Status Banner */}
        {!loading && (
          <>
            <div style={isFinalized ? styles.finalizedBanner : styles.votingBanner}>
              <div style={styles.bannerIcon}>
                {isFinalized ? '🏆' : '🗳️'}
              </div>
              <div style={styles.bannerContent}>
                <h3 style={styles.bannerTitle}>
                  {isFinalized ? 'Official Results Declared!' : 'Voting In Progress'}
                </h3>
                <p style={styles.bannerText}>
                  {votingStatus}
                </p>
                {isFinalized && winner && winner.tie_broken && (
                  <p style={styles.tieBreakInfo}>
                    ⚖️ Tie broken by {winner.tie_breaking_method} order among: {winner.tied_candidates.join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Revoked Winner Notice */}
            {previousWinnerRevoked && revokedWinnerInfo && (
              <div style={styles.revokedWinnerBanner}>
                <div style={styles.bannerIcon}>⚠️</div>
                <div style={styles.bannerContent}>
                  <h3 style={styles.bannerTitle}>Winner Withdrew from Candidacy</h3>
                  <p style={styles.bannerText}>
                    The original winner, <strong>{revokedWinnerInfo.name}</strong> ({revokedWinnerInfo.party}) 
                    with <strong>{revokedWinnerInfo.vote_count} votes</strong>, has withdrawn their candidacy.
                  </p>
                  <p style={styles.bannerText}>
                    The winner has been automatically recalculated from the remaining active candidates.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}>⏳</div>
            <p style={styles.loadingText}>Loading results...</p>
          </div>
        ) : (
          <>
            <div style={styles.statsSection}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>📊</div>
                <div style={styles.statNumber}>{totalVotes}</div>
                <div style={styles.statLabel}>Total Votes</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>🎯</div>
                <div style={styles.statNumber}>{results.length}</div>
                <div style={styles.statLabel}>Candidates</div>
              </div>

              {winner && (
                <div style={{...styles.statCard, ...styles.winnerCard, position: 'relative'}}>
                  {/* Fireworks Animation on Winner Card */}
                  {isFinalized && <Fireworks isActive={showFireworks} />}
                  
                  <div style={styles.statIcon}>👑</div>
                  <div style={styles.winnerName}>{winner.name}</div>
                  <div style={styles.statLabel}>Current Leader</div>
                </div>
              )}
            </div>

            <div style={styles.resultsSection}>
              <h2 style={styles.sectionTitle}>🏆 Detailed Results</h2>
              
              {results.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📭</div>
                  <h3 style={styles.emptyTitle}>No Results Yet</h3>
                  <p style={styles.emptyText}>
                    No votes have been cast yet. Be the first to vote!
                  </p>
                </div>
              ) : (
                <div style={styles.resultsList}>
                  {results
                    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
                    .map((candidate, index) => {
                      const percentage = getPercentage(candidate.vote_count || 0);
                      const isWinner = isFinalized && winner && candidate.id === winner.id;
                      
                      return (
                        <div
                          key={candidate.id}
                          style={{
                            ...styles.resultCard,
                            ...(isWinner ? styles.winnerResultCard : {}),
                            ...(hoveredCard === candidate.id ? styles.hoveredResultCard : {}),
                            position: 'relative',
                          }}
                          onMouseEnter={() => setHoveredCard(candidate.id)}
                          onMouseLeave={() => setHoveredCard(null)}
                        >
                          {/* Fireworks on Winner's Result Card */}
                          {isWinner && <Fireworks isActive={showFireworks} />}
                          
                          <div style={styles.resultHeader}>
                            <div style={styles.resultRank}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </div>
                            
                            <div style={styles.resultPhoto}>
                              {candidate.profile_pic ? (
                                <img 
                                  src={candidate.profile_pic} 
                                  alt={candidate.name}
                                  style={styles.photoImg}
                                />
                              ) : (
                                <div style={styles.photoPlaceholder}>
                                  {candidate.name?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>

                            <div style={styles.resultInfo}>
                              <h3 style={styles.resultName}>
                                {candidate.name}
                                {isWinner && <span style={styles.crownIcon}> 👑</span>}
                              </h3>
                              <p style={styles.resultParty}>
                                {candidate.party || 'Independent'}
                              </p>
                            </div>

                            <div style={styles.resultStats}>
                              <div style={styles.voteCount}>
                                {candidate.vote_count || 0}
                              </div>
                              <div style={styles.voteLabel}>votes</div>
                            </div>
                          </div>

                          <div style={styles.progressSection}>
                            <div style={styles.progressBar}>
                              <div
                                style={{
                                  ...styles.progressFill,
                                  width: `${percentage}%`,
                                  background: isWinner ? 
                                    'linear-gradient(90deg, #ffd700 0%, #ffed4e 100%)' :
                                    'linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)'
                                }}
                              />
                            </div>
                            <div style={styles.percentage}>{percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
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
  votingBanner: {
    background: 'rgba(33, 150, 243, 0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    border: '3px solid rgba(33, 150, 243, 0.5)',
    boxShadow: '0 10px 30px rgba(33, 150, 243, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: 20
  },
  finalizedBanner: {
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 237, 78, 0.15) 100%)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    border: '3px solid #ffd700',
    boxShadow: '0 10px 40px rgba(255, 215, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: 20
  },
  bannerIcon: {
    fontSize: 64,
    minWidth: 64
  },
  bannerContent: {
    flex: 1
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: 'white',
    margin: '0 0 10px 0'
  },
  bannerText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
    lineHeight: 1.6
  },
  tieBreakInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
    fontStyle: 'italic'
  },
  revokedWinnerBanner: {
    background: 'rgba(255, 152, 0, 0.25)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    border: '3px solid rgba(255, 152, 0, 0.6)',
    boxShadow: '0 10px 30px rgba(255, 152, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    gap: 20
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
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 20,
    marginBottom: 50
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    padding: 30,
    textAlign: 'center',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
  },
  winnerCard: {
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 237, 78, 0.1) 100%)',
    border: '3px solid #ffd700',
    boxShadow: '0 10px 40px rgba(255, 215, 0, 0.4)',
    animation: 'fireworkPulse 2s ease-in-out infinite',
    overflow: 'hidden',
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
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  winnerName: {
    fontSize: 22,
    fontWeight: 700,
    color: '#ffd700',
    marginBottom: 10
  },
  resultsSection: {
    marginTop: 30
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30
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
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  resultCard: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(15px)',
    borderRadius: 20,
    padding: 25,
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer'
  },
  hoveredResultCard: {
    transform: 'translateX(10px) scale(1.02)',
    background: 'rgba(255, 255, 255, 0.25)',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 20px 60px rgba(147, 112, 219, 0.4), 0 0 40px rgba(147, 112, 219, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
  },
  winnerResultCard: {
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 237, 78, 0.05) 100%)',
    border: '3px solid #ffd700',
    boxShadow: '0 15px 40px rgba(255, 215, 0, 0.3)',
    animation: 'fireworkPulse 2s ease-in-out infinite',
    overflow: 'hidden',
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    marginBottom: 15
  },
  resultRank: {
    fontSize: 32,
    fontWeight: 700,
    minWidth: 60,
    textAlign: 'center'
  },
  resultPhoto: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid rgba(255, 255, 255, 0.3)'
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
    fontSize: 32,
    fontWeight: 700
  },
  resultInfo: {
    flex: 1
  },
  resultName: {
    fontSize: 24,
    fontWeight: 700,
    color: 'white',
    margin: '0 0 5px 0'
  },
  crownIcon: {
    fontSize: 28
  },
  resultParty: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0
  },
  resultStats: {
    textAlign: 'center'
  },
  voteCount: {
    fontSize: 36,
    fontWeight: 700,
    color: 'white'
  },
  voteLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  progressSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 15
  },
  progressBar: {
    flex: 1,
    height: 30,
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 15,
    overflow: 'hidden',
    border: '2px solid rgba(255, 255, 255, 0.1)'
  },
  progressFill: {
    height: '100%',
    transition: 'width 1s ease-out',
    borderRadius: 15
  },
  percentage: {
    fontSize: 20,
    fontWeight: 700,
    color: 'white',
    minWidth: 60,
    textAlign: 'right'
  }
};
