import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreeBackground from '../components/ThreeBackground';
import AnimatedLoginHint from '../components/AnimatedLoginHint';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showRegisterHint, setShowRegisterHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  // Allowed email domains (legitimate providers)
  const ALLOWED_DOMAINS = [
    'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.co.uk',
    'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
    'icloud.com', 'me.com', 'mac.com',
    'protonmail.com', 'proton.me',
    'aol.com', 'zoho.com', 'mail.com',
    'yandex.com', 'gmx.com', 'fastmail.com'
  ];

  // Email validation
  const validateEmail = (email) => {
    if (!email) {
      setEmailError('');
      return false;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      return false;
    }

    // Extract domain
    const domain = email.split('@')[1]?.toLowerCase();
    
    // Check if domain is in allowed list
    if (!ALLOWED_DOMAINS.includes(domain)) {
      setEmailError(`Please use a legitimate email provider (Gmail, Yahoo, Outlook, etc.)`);
      return false;
    }

    setEmailError('');
    return true;
  };

  // Password strength checker - Simplified to only check 4 rules
  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ score: 0, label: '', color: '' });
      return { isValid: false, message: '' };
    }

    let score = 0;
    let feedback = [];
    let rulesCompleted = 0;

    // Uppercase letter check (REQUIRED)
    if (!/[A-Z]/.test(password)) {
      feedback.push('one uppercase letter');
    } else {
      score += 25;
      rulesCompleted++;
    }

    // Lowercase letter check (REQUIRED)
    if (!/[a-z]/.test(password)) {
      feedback.push('one lowercase letter');
    } else {
      score += 25;
      rulesCompleted++;
    }

    // Number check (REQUIRED)
    if (!/[0-9]/.test(password)) {
      feedback.push('one number');
    } else {
      score += 25;
      rulesCompleted++;
    }

    // Special character check (REQUIRED)
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('one special character (!@#$%^&*...)');
    } else {
      score += 25;
      rulesCompleted++;
    }

    // Set strength label and color based on rules completed
    let label = '';
    let color = '';
    if (rulesCompleted === 0) {
      label = 'Very Weak';
      color = '#dc2626';
    } else if (rulesCompleted === 1) {
      label = 'Weak';
      color = '#f59e0b';
    } else if (rulesCompleted === 2) {
      label = 'Fair';
      color = '#eab308';
    } else if (rulesCompleted === 3) {
      label = 'Good';
      color = '#84cc16';
    } else {
      label = 'Strong';
      color = '#22c55e';
    }

    setPasswordStrength({ score, label, color });

    return {
      isValid: rulesCompleted === 4, // All 4 rules must be met
      message: feedback.length > 0 ? `Password must contain ${feedback.join(', ')}` : ''
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowRegisterHint(false);
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN - No validation for login (user may have old password)
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error?.message || data.error || 'Login failed';
          const errorCode = data.error?.code;
          
          // Show animated hint if user not found
          if (errorCode === 'USER_NOT_FOUND') {
            setShowRegisterHint(true);
            setError(''); // Don't show generic error when we're showing the hint
          } else {
            throw new Error(errorMsg);
          }
          return;
        }

        localStorage.setItem('accessToken', data.accessToken);
        navigate('/home');
        
      } else {
        // REGISTER - Full validation
        
        // Validate email
        if (!validateEmail(formData.email)) {
          throw new Error(emailError || 'Invalid email address');
        }

        // Validate password strength
        const passwordCheck = checkPasswordStrength(formData.password);
        if (!passwordCheck.isValid) {
          throw new Error(passwordCheck.message || 'Password is too weak');
        }

        // Check password confirmation
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error?.message || data.error || 'Registration failed';
          throw new Error(errorMsg);
        }

        localStorage.setItem('accessToken', data.accessToken);
        navigate('/home');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Real-time validation
    if (name === 'email' && !isLogin) {
      validateEmail(value);
    }
    if (name === 'password' && !isLogin) {
      checkPasswordStrength(value);
    }
  };

  return (
    <div style={styles.container}>
      <ThreeBackground />
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            {isLogin ? '🔐 Login' : '📝 Register'}
          </h1>
          <p style={styles.subtitle}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {error && (
          <div style={styles.error}>
            ❌ {error}
          </div>
        )}

        {/* Animated hint when user not found */}
        {showRegisterHint && isLogin && (
          <AnimatedLoginHint 
            onRegisterClick={() => {
              setIsLogin(false);
              setShowRegisterHint(false);
              setError('');
            }}
          />
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required={!isLogin}
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email (Gmail, Yahoo, Outlook, etc.)"
              required
              style={{
                ...styles.input,
                ...(emailError && !isLogin ? styles.inputError : {})
              }}
            />
            {emailError && !isLogin && (
              <div style={styles.validationError}>
                ⚠️ {emailError}
              </div>
            )}
            {!isLogin && !emailError && formData.email && (
              <div style={styles.validationSuccess}>
                ✓ Valid email provider
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {!isLogin && formData.password && (
              <div style={styles.strengthContainer}>
                <div style={styles.strengthBar}>
                  <div 
                    style={{
                      ...styles.strengthFill,
                      width: `${passwordStrength.score}%`,
                      background: passwordStrength.color
                    }}
                  />
                </div>
                <div style={{...styles.strengthLabel, color: passwordStrength.color}}>
                  {passwordStrength.label && `Password Strength: ${passwordStrength.label}`}
                </div>
                {passwordStrength.score < 100 && (
                  <div style={styles.passwordHint}>
                    💡 Required: One uppercase, one lowercase, one number, and one special character
                  </div>
                )}
              </div>
            )}
          </div>

          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required={!isLogin}
                style={styles.input}
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div style={styles.validationError}>
                  ⚠️ Passwords do not match
                </div>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div style={styles.validationSuccess}>
                  ✓ Passwords match
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Please wait...' : (isLogin ? '🚀 Login' : '✨ Register')}
          </button>
        </form>

        <div style={styles.footer}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setShowRegisterHint(false);
              setFormData({
                email: '',
                password: '',
                name: '',
                confirmPassword: ''
              });
            }}
            style={styles.toggleButton}
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    padding: 40,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    width: '100%',
    maxWidth: 450,
    position: 'relative',
    zIndex: 1
  },
  header: {
    textAlign: 'center',
    marginBottom: 30
  },
  title: {
    fontSize: 42,
    fontWeight: 700,
    color: 'white',
    margin: 0,
    marginBottom: 10,
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0
  },
  error: {
    background: 'rgba(244, 67, 54, 0.2)',
    border: '2px solid rgba(244, 67, 54, 0.5)',
    color: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 14,
    fontWeight: 500
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  input: {
    padding: 15,
    fontSize: 16,
    borderRadius: 12,
    border: '2px solid rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    transition: 'all 0.3s',
    outline: 'none',
    fontFamily: 'inherit'
  },
  passwordWrapper: {
    position: 'relative'
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    fontSize: 20,
    cursor: 'pointer',
    padding: 5,
    opacity: 0.7,
    transition: 'opacity 0.3s'
  },
  submitButton: {
    padding: 16,
    fontSize: 18,
    fontWeight: 700,
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
    color: '#4a148c',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: 10,
    boxShadow: '0 10px 30px rgba(255, 215, 0, 0.3)'
  },
  footer: {
    marginTop: 25,
    textAlign: 'center'
  },
  toggleButton: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: 14,
    cursor: 'pointer',
    textDecoration: 'underline',
    transition: 'opacity 0.3s',
    padding: 0
  },
  inputError: {
    borderColor: '#ff4444',
    boxShadow: '0 0 0 2px rgba(255, 68, 68, 0.2)'
  },
  validationError: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 5,
    display: 'flex',
    alignItems: 'center',
    gap: 5
  },
  validationSuccess: {
    fontSize: 12,
    color: '#51cf66',
    marginTop: 5,
    display: 'flex',
    alignItems: 'center',
    gap: 5
  },
  strengthContainer: {
    marginTop: 10
  },
  strengthBar: {
    width: '100%',
    height: 6,
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden'
  },
  strengthFill: {
    height: '100%',
    transition: 'all 0.3s ease',
    borderRadius: 3
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: 600,
    marginTop: 5,
    textAlign: 'right'
  },
  passwordHint: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    padding: 10,
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    lineHeight: 1.4
  }
};
