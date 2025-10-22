import React, { useEffect, useState } from 'react';

/**
 * AnimatedLoginHint - A 3D-style animated component that hints the user to register
 * Shows a friendly message when trying to login without an account
 */
export default function AnimatedLoginHint({ onRegisterClick }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in after mount
    setTimeout(() => setVisible(true), 50);
  }, []);

  return (
    <div style={{
      ...styles.container,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)'
    }}>
      {/* Animated icon */}
      <div style={styles.iconWrapper}>
        <div style={styles.icon}>👤</div>
        <div style={styles.iconShadow}></div>
      </div>

      {/* Message */}
      <div style={styles.messageBox}>
        <h3 style={styles.title}>Account Not Found</h3>
        <p style={styles.message}>
          Looks like you don't have an account yet. No worries! 
          Let's get you registered in seconds. 🚀
        </p>
        
        {/* CTA Button */}
        <button
          onClick={onRegisterClick}
          style={styles.ctaButton}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 24px rgba(255, 215, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.3)';
          }}
        >
          ✨ Create Account Now
        </button>
      </div>

      {/* Decorative elements */}
      <div style={styles.decorCircle1}></div>
      <div style={styles.decorCircle2}></div>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(75, 0, 130, 0.15) 100%)',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    padding: '24px 20px',
    marginBottom: 20,
    border: '2px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(138, 43, 226, 0.2)',
    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    overflow: 'hidden'
  },
  iconWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    height: 60
  },
  icon: {
    fontSize: 48,
    animation: 'bounce3d 2s ease-in-out infinite',
    filter: 'drop-shadow(0 4px 12px rgba(138, 43, 226, 0.4))',
    position: 'relative',
    zIndex: 2
  },
  iconShadow: {
    position: 'absolute',
    bottom: -10,
    width: 40,
    height: 8,
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '50%',
    filter: 'blur(8px)',
    animation: 'shadowPulse 2s ease-in-out infinite'
  },
  messageBox: {
    textAlign: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: 'white',
    margin: '0 0 10px 0',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    letterSpacing: '0.5px'
  },
  message: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    margin: '0 0 20px 0',
    lineHeight: 1.6,
    textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)'
  },
  ctaButton: {
    padding: '12px 32px',
    fontSize: 15,
    fontWeight: 700,
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
    color: '#4a148c',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '0 6px 20px rgba(255, 215, 0, 0.3)',
    position: 'relative',
    zIndex: 2
  },
  decorCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
    animation: 'float1 6s ease-in-out infinite',
    pointerEvents: 'none'
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(138, 43, 226, 0.15) 0%, transparent 70%)',
    animation: 'float2 7s ease-in-out infinite',
    pointerEvents: 'none'
  }
};

// Add CSS animations to the document head on mount
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes bounce3d {
      0%, 100% {
        transform: translateY(0) rotateX(0deg);
      }
      50% {
        transform: translateY(-12px) rotateX(10deg);
      }
    }

    @keyframes shadowPulse {
      0%, 100% {
        transform: scale(1);
        opacity: 0.3;
      }
      50% {
        transform: scale(0.8);
        opacity: 0.5;
      }
    }

    @keyframes float1 {
      0%, 100% {
        transform: translate(0, 0) rotate(0deg);
      }
      33% {
        transform: translate(10px, -10px) rotate(120deg);
      }
      66% {
        transform: translate(-5px, 5px) rotate(240deg);
      }
    }

    @keyframes float2 {
      0%, 100% {
        transform: translate(0, 0) rotate(0deg);
      }
      33% {
        transform: translate(-10px, 10px) rotate(-120deg);
      }
      66% {
        transform: translate(5px, -5px) rotate(-240deg);
      }
    }
  `;
  document.head.appendChild(styleSheet);
}
