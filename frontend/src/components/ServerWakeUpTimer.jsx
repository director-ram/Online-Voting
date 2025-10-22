import React, { useEffect, useState } from 'react';

/**
 * ServerWakeUpTimer - Shows a live countdown when Render server is waking up
 * Render free tier sleeps after inactivity and takes ~50 seconds to wake
 */
export default function ServerWakeUpTimer({ onServerReady }) {
  const [timeRemaining, setTimeRemaining] = useState(50); // Render typically takes 50 seconds
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Countdown timer
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setChecking(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Start checking when countdown reaches 0
    if (checking) {
      checkServerHealth();
    }
  }, [checking]);

  const checkServerHealth = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        onServerReady?.();
      } else {
        // Still not ready, check again in 3 seconds
        setTimeout(checkServerHealth, 3000);
      }
    } catch (error) {
      // Still not ready, check again in 3 seconds
      setTimeout(checkServerHealth, 3000);
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated server icon */}
      <div style={styles.iconWrapper}>
        <div style={styles.serverIcon}>
          {timeRemaining > 0 ? '💤' : '⚡'}
        </div>
        <div style={styles.pulseRing}></div>
      </div>

      {/* Status message */}
      <div style={styles.messageBox}>
        <h3 style={styles.title}>
          {timeRemaining > 0 ? '🔄 Server Waking Up...' : '⏳ Almost There...'}
        </h3>
        
        {timeRemaining > 0 ? (
          <>
            <p style={styles.message}>
              Our server is waking up from sleep mode (free tier hosting).
            </p>
            
            {/* Live countdown timer */}
            <div style={styles.timerBox}>
              <div style={styles.timerCircle}>
                <svg style={styles.timerSvg} viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#ffd700"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * (50 - timeRemaining)) / 50}
                    style={{
                      transition: 'stroke-dashoffset 1s linear',
                      transform: 'rotate(-90deg)',
                      transformOrigin: '50% 50%'
                    }}
                  />
                </svg>
                <div style={styles.timerText}>
                  <span style={styles.timerNumber}>{timeRemaining}</span>
                  <span style={styles.timerLabel}>sec</span>
                </div>
              </div>
            </div>
            
            <p style={styles.hint}>
              💡 This happens after 15 minutes of inactivity. Usually takes ~50 seconds.
            </p>
          </>
        ) : (
          <>
            <p style={styles.message}>
              Checking server status... This will only take a few more seconds!
            </p>
            <div style={styles.dotsLoader}>
              <span style={styles.dot}>●</span>
              <span style={styles.dot}>●</span>
              <span style={styles.dot}>●</span>
            </div>
          </>
        )}
      </div>

      {/* Progress bar at bottom */}
      <div style={styles.progressBar}>
        <div 
          style={{
            ...styles.progressFill,
            width: `${((50 - timeRemaining) / 50) * 100}%`
          }}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    background: 'linear-gradient(135deg, rgba(67, 56, 202, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    padding: '30px 24px',
    marginBottom: 20,
    border: '2px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(67, 56, 202, 0.3)',
    overflow: 'hidden',
    animation: 'fadeIn 0.5s ease-out'
  },
  iconWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    height: 80
  },
  serverIcon: {
    fontSize: 56,
    animation: 'pulse 2s ease-in-out infinite',
    position: 'relative',
    zIndex: 2
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    border: '3px solid rgba(139, 92, 246, 0.6)',
    borderRadius: '50%',
    animation: 'pulseRing 2s ease-out infinite'
  },
  messageBox: {
    textAlign: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: 'white',
    margin: '0 0 12px 0',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    letterSpacing: '0.5px'
  },
  message: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    margin: '0 0 20px 0',
    lineHeight: 1.6
  },
  timerBox: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 20
  },
  timerCircle: {
    position: 'relative',
    width: 140,
    height: 140
  },
  timerSvg: {
    width: '100%',
    height: '100%'
  },
  timerText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  timerNumber: {
    fontSize: 42,
    fontWeight: 700,
    color: '#ffd700',
    textShadow: '0 2px 8px rgba(255, 215, 0, 0.5)',
    lineHeight: 1
  },
  timerLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0,
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  dotsLoader: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16
  },
  dot: {
    fontSize: 24,
    color: '#ffd700',
    animation: 'dotBounce 1.4s ease-in-out infinite'
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #ffd700 0%, #ffed4e 100%)',
    transition: 'width 1s linear',
    boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
  }
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    @keyframes pulseRing {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(1.4); opacity: 0; }
    }

    @keyframes dotBounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
    }
    
    ${styles.dot}:nth-child(1) { animation-delay: 0s; }
    ${styles.dot}:nth-child(2) { animation-delay: 0.2s; }
    ${styles.dot}:nth-child(3) { animation-delay: 0.4s; }
  `;
  document.head.appendChild(styleSheet);
}
