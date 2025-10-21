import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import ThreeBackground from '../components/ThreeBackground';

const DEFAULT_AVATAR = '/default-avatar.svg';

// Add custom CSS for date picker styling
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    /* Custom Date Picker Styling */
    input[type="date"]::-webkit-calendar-picker-indicator {
      background: transparent;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>');
      cursor: pointer;
      opacity: 0.9;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.3s;
    }
    
    input[type="date"]::-webkit-calendar-picker-indicator:hover {
      opacity: 1;
      background-color: rgba(255, 255, 255, 0.1);
      transform: scale(1.1);
    }
    
    input[type="date"]::-webkit-datetime-edit-text,
    input[type="date"]::-webkit-datetime-edit-month-field,
    input[type="date"]::-webkit-datetime-edit-day-field,
    input[type="date"]::-webkit-datetime-edit-year-field {
      color: white;
      padding: 2px;
    }
    
    input[type="date"]::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    
    /* Style select options */
    select option {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px;
    }
    
    /* Placeholder text for all inputs */
    input::placeholder,
    textarea::placeholder {
      color: rgba(255, 255, 255, 0.5);
      font-style: italic;
    }
    
    /* Dropdown animation */
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Pulse animation for vote count */
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        filter: drop-shadow(0 4px 20px rgba(255, 215, 0, 0.8));
      }
      50% {
        transform: scale(1.05);
        filter: drop-shadow(0 6px 30px rgba(255, 215, 0, 1));
      }
    }
    
    /* Custom scrollbar for selects */
    select::-webkit-scrollbar {
      width: 8px;
    }
    
    select::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    select::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }
    
    select::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  `;
  if (!document.getElementById('profile-date-picker-styles')) {
    style.id = 'profile-date-picker-styles';
    document.head.appendChild(style);
  }
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [candidateStatus, setCandidateStatus] = useState(null);
  const [voteCount, setVoteCount] = useState(0);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fileRef = useRef(null);

  // Helper function to convert date to yyyy-MM-dd format
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return '';
      // Format as yyyy-MM-dd
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return '';
    }
  };

  // Candidate application form
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: '',
    party: 'Independent',
    description: ''
  });

  // Custom date picker state
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const datePickerRef = useRef(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setDatePickerOpen(false);
      }
    };
    
    if (datePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [datePickerOpen]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No access token found. User needs to login.');
      alert('Please login first to access your profile.');
      window.location.href = '/'; // Redirect to home/login
      return;
    }
    
    // Fetch user info
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.json() : Promise.reject(r)))
      .then(data => {
        setUser(data);
        setFormData(prev => ({ ...prev, name: data.name || '' }));
      })
      .catch((err) => {
        console.error('Failed to fetch user info:', err);
        if (err.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('accessToken');
          window.location.href = '/';
        }
      });
    
    // Function to fetch candidate status and vote count
    const fetchCandidateData = () => {
      fetch('/api/candidates/status', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => (r.ok ? r.json() : Promise.reject(r)))
        .then(data => {
          setCandidateStatus(data);
          if (data.is_candidate && data.candidate) {
            // If candidate exists (active or inactive), save their data for future use
            const candidate = data.candidate;
            
            // Pre-fill form data with existing candidate information
            setFormData({
              name: candidate.name || '',
              dob: formatDateForInput(candidate.dob),
              gender: candidate.gender || '',
              party: candidate.party || 'Independent',
              description: candidate.description || ''
            });
            
            // Use vote_count from candidate data if available
            const count = data.candidate.vote_count || 0;
            setVoteCount(count);
            // Also fetch separately to ensure latest count
            fetch('/api/candidates/votes', { headers: { Authorization: `Bearer ${token}` } })
              .then(r => (r.ok ? r.json() : Promise.reject(r)))
              .then(voteData => {
                setVoteCount(voteData.vote_count || 0);
              })
              .catch((err) => console.error('Failed to fetch votes:', err));
          } else {
            // Not a candidate
          }
        })
        .catch((err) => console.error('Failed to fetch candidate status:', err));
    };
    
    // Initial fetch
    fetchCandidateData();
    
    // Auto-refresh vote count every 10 seconds if user is a candidate
    const intervalId = setInterval(() => {
      if (candidateStatus?.is_candidate) {
        fetch('/api/candidates/votes', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => (r.ok ? r.json() : Promise.reject(r)))
          .then(voteData => setVoteCount(voteData.vote_count || 0))
          .catch(() => {});
      }
    }, 10000); // Refresh every 10 seconds
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [candidateStatus?.is_candidate]);

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  };

  const onUpload = async () => {
    const token = localStorage.getItem('accessToken');
    const file = fileRef.current?.files?.[0];
    if (!token || !file) return;
    const fd = new FormData();
    fd.append('profile_pic', file);
    setUploading(true);
    try {
      const res = await fetch('/api/auth/profile/picture', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Upload failed');
      setUser(u => ({ ...(u || {}), profile_pic: data.profile_pic }));
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      alert('Profile picture updated');
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onApplyAsCandidate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.error('No access token found in localStorage');
      alert('Session expired. Please logout and login again.');
      return;
    }

    // Detailed validation with specific messages
    if (!formData.name || formData.name.trim() === '') {
      alert('Please enter your full name');
      return;
    }

    if (!formData.dob) {
      alert('Please select your date of birth');
      return;
    }

    if (!formData.gender) {
      alert('Please select your gender');
      return;
    }

    if (!formData.description || formData.description.trim() === '') {
      alert('Please enter your description/manifesto');
      return;
    }

    setApplying(true);
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('dob', formData.dob);
    fd.append('gender', formData.gender);
    fd.append('party', formData.party || 'Independent');
    fd.append('description', formData.description);
    
    // Add profile pic if selected
    const file = fileRef.current?.files?.[0];
    if (file) {
      fd.append('profile_pic', file);
    }

    try {
      const res = await fetch('/api/candidates/apply', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data?.error?.message || 'Application failed');
      
      // Show different message for reactivation vs new application
      if (data.reactivated) {
        alert('🎉 Your candidacy has been successfully reactivated!');
      } else {
        alert('🎉 Successfully applied as a candidate!');
      }
      
      setShowApplyForm(false);
      
      // Refresh candidate status
      const statusRes = await fetch('/api/candidates/status', { headers: { Authorization: `Bearer ${token}` } });
      const statusData = await statusRes.json();
      setCandidateStatus(statusData);
      setVoteCount(0);
    } catch (err) {
      console.error('Application error:', err);
      alert(err.message || 'Application failed');
    } finally {
      setApplying(false);
    }
  };

  const onRevokeCandidacy = async () => {
    if (!confirm('Are you sure you want to revoke your candidacy?')) return;
    
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setRevoking(true);
    try {
      const res = await fetch('/api/candidates/revoke', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Revoke failed');
      
      alert('Candidacy revoked successfully');
      setCandidateStatus({ is_candidate: false, candidate: null });
      setVoteCount(0);
    } catch (err) {
      alert(err.message || 'Revoke failed');
    } finally {
      setRevoking(false);
    }
  };

  const onRefreshVotes = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setRefreshing(true);
    try {
      const res = await fetch('/api/candidates/votes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setVoteCount(data.vote_count || 0);
      }
    } catch (err) {
      console.error('Failed to refresh votes:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Custom date picker helpers
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  const handleDateSelect = () => {
    if (selectedDay && selectedMonth && selectedYear) {
      const monthNum = String(months.indexOf(selectedMonth) + 1).padStart(2, '0');
      const dayNum = String(selectedDay).padStart(2, '0');
      const dateStr = `${selectedYear}-${monthNum}-${dayNum}`;
      setFormData(prev => ({ ...prev, dob: dateStr }));
      setDatePickerOpen(false);
    }
  };

  const getFormattedDate = () => {
    if (formData.dob) {
      const date = new Date(formData.dob);
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    }
    return 'Select your date of birth';
  };

  const avatarSrc = preview || (user?.profile_pic || candidateStatus?.candidate?.profile_pic || DEFAULT_AVATAR);

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px'
    },
    card: {
      maxWidth: 900,
      margin: '0 auto',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: 20,
      padding: 40,
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      color: 'white'
    },
    title: {
      fontSize: 36,
      fontWeight: 'bold',
      marginBottom: 30,
      textAlign: 'center',
      background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 2px 10px rgba(0,0,0,0.2)'
    },
    avatarSection: {
      display: 'flex',
      gap: 24,
      alignItems: 'center',
      marginBottom: 40,
      paddingBottom: 30,
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
    },
    avatar: {
      width: 150,
      height: 150,
      borderRadius: '50%',
      objectFit: 'cover',
      border: '4px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    },
    button: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: 10,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 600,
      transition: 'all 0.3s',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    },
    candidateCard: {
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
      padding: 30,
      borderRadius: 15,
      marginBottom: 24,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    },
    voteCountBox: {
      padding: 30,
      background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
      borderRadius: 20,
      marginBottom: 30,
      textAlign: 'center',
      border: '4px solid #fff',
      boxShadow: '0 10px 40px rgba(255, 215, 0, 0.5), inset 0 2px 30px rgba(255, 255, 255, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    },
    voteNumber: {
      fontSize: 72,
      fontWeight: 'bold',
      color: '#4a148c',
      textShadow: '0 4px 10px rgba(74, 20, 140, 0.3), 0 0 50px rgba(255, 255, 255, 0.5)',
      display: 'block',
      marginTop: 15,
      marginBottom: 5,
      letterSpacing: '4px',
      animation: 'pulse 2s ease-in-out infinite'
    },
    input: {
      width: '100%',
      padding: 12,
      borderRadius: 8,
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: 14,
      outline: 'none',
      transition: 'all 0.3s ease'
    },
    dateInput: {
      width: '100%',
      padding: '12px 40px 12px 12px',
      borderRadius: 10,
      border: '2px solid rgba(255, 255, 255, 0.3)',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
      color: 'white',
      fontSize: 15,
      outline: 'none',
      transition: 'all 0.3s ease',
      fontWeight: 500,
      cursor: 'pointer',
      position: 'relative',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      letterSpacing: '0.5px'
    },
    dateInputContainer: {
      position: 'relative',
      display: 'inline-block',
      width: '100%'
    },
    calendarIcon: {
      position: 'absolute',
      right: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: 20,
      pointerEvents: 'none',
      opacity: 0.8
    },
    revokeButton: {
      background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: 10,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 600,
      boxShadow: '0 4px 15px rgba(255, 65, 108, 0.4)'
    },
    customDatePicker: {
      position: 'relative',
      width: '100%'
    },
    dateDisplay: {
      width: '100%',
      padding: 12,
      borderRadius: 10,
      border: '2px solid rgba(255, 255, 255, 0.3)',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
      color: 'white',
      fontSize: 15,
      fontWeight: 500,
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.3s ease'
    },
    datePickerDropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: 8,
      padding: 20,
      borderRadius: 15,
      border: '2px solid rgba(255, 255, 255, 0.3)',
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95))',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
      animation: 'slideDown 0.3s ease'
    },
    datePickerSelect: {
      width: '100%',
      padding: 10,
      borderRadius: 8,
      border: '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
      outline: 'none',
      marginBottom: 12
    },
    datePickerButton: {
      width: '100%',
      padding: 10,
      borderRadius: 8,
      border: 'none',
      background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
      color: '#667eea',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
    }
  };

  return (
    <div style={styles.pageContainer}>
      <ThreeBackground />
      <Navbar />
      <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>My Profile</h2>
        
        {/* Avatar Section */}
        <div style={styles.avatarSection}>
          <img src={avatarSrc} alt="avatar" style={styles.avatar} />
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 10,
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.15))';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
              }}
              >
                📁 Choose File
                <input 
                  ref={fileRef} 
                  type="file" 
                  accept="image/png,image/jpeg,image/jpg,image/gif" 
                  onChange={onPickFile}
                  style={{ display: 'none' }}
                />
              </label>
              {preview && (
                <div style={{ 
                  marginTop: 8, 
                  fontSize: 12, 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontStyle: 'italic'
                }}>
                  ✓ File selected
                </div>
              )}
            </div>
            <button 
              onClick={onUpload} 
              disabled={uploading || !fileRef.current?.files?.length}
              style={{ 
                ...styles.button, 
                opacity: uploading || !fileRef.current?.files?.length ? 0.5 : 1,
                cursor: uploading || !fileRef.current?.files?.length ? 'not-allowed' : 'pointer'
              }}
            >
              {uploading ? 'Uploading…' : '📤 Upload New Picture'}
            </button>
          </div>
        </div>

        {/* Candidate Status Section */}
        {candidateStatus?.is_candidate ? (
          <div style={styles.candidateCard}>
            {/* Show form if user clicked reapply */}
            {showApplyForm ? (
              <form onSubmit={onApplyAsCandidate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h3 style={{ marginTop: 0, fontSize: 24 }}>🔄 Reapply as a Candidate</h3>
                
                {/* Show info message for reapplying with saved data */}
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(102, 126, 234, 0.15)',
                  borderRadius: 8,
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  color: '#a0b0ff',
                  fontSize: 14,
                  lineHeight: 1.5
                }}>
                  ℹ️ <strong>Your previous candidate information has been loaded.</strong><br/>
                  You can review and update the details below before reapplying.
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: 10, fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                    ✨ Full Name *
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      borderRadius: 8,
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'all 0.3s',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 10, fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                    📅 Date of Birth *
                  </label>
                  <div style={styles.customDatePicker} ref={datePickerRef}>
                    <div 
                      style={styles.dateDisplay}
                      onClick={() => setDatePickerOpen(!datePickerOpen)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.6)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      <span style={{ opacity: formData.dob ? 1 : 0.6 }}>
                        {getFormattedDate()}
                      </span>
                      <span style={{ fontSize: 18 }}>📅</span>
                    </div>
                    
                    {datePickerOpen && (
                      <div style={styles.datePickerDropdown}>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ display: 'block', marginBottom: 6, fontSize: 12, opacity: 0.9 }}>Day</label>
                          <select
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                            style={styles.datePickerSelect}
                          >
                            <option value="">Select Day</option>
                            {days.map(day => (
                              <option key={day} value={day} style={{ background: '#667eea' }}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ display: 'block', marginBottom: 6, fontSize: 12, opacity: 0.9 }}>Month</label>
                          <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            style={styles.datePickerSelect}
                          >
                            <option value="">Select Month</option>
                            {months.map(month => (
                              <option key={month} value={month} style={{ background: '#667eea' }}>
                                {month}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: 'block', marginBottom: 6, fontSize: 12, opacity: 0.9 }}>Year</label>
                          <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            style={styles.datePickerSelect}
                          >
                            <option value="">Select Year</option>
                            {years.map(year => (
                              <option key={year} value={year} style={{ background: '#667eea' }}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <button
                          type="button"
                          onClick={applyDate}
                          style={styles.datePickerButton}
                        >
                          ✓ Apply Date
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 10, fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                    👤 Gender *
                  </label>
                  <select 
                    value={formData.gender}
                    onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      borderRadius: 8,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
                      color: 'white',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.border = '2px solid rgba(255, 255, 255, 0.6)';
                      e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">👨 Male</option>
                    <option value="Female">👩 Female</option>
                    <option value="Other">⚧️ Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 10, fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                    🏛️ Party Affiliation
                  </label>
                  <select 
                    value={formData.party}
                    onChange={e => setFormData(prev => ({ ...prev, party: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      borderRadius: 8,
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Independent">Independent</option>
                    <option value="TDP">Telugu Desam Party (TDP)</option>
                    <option value="YSRCP">YSR Congress Party (YSRCP)</option>
                    <option value="INC">Indian National Congress (INC)</option>
                    <option value="BJP">Bharatiya Janata Party (BJP)</option>
                    <option value="JSP">Jana Sena Party (JSP)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 10, fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                    📝 Description/Manifesto *
                  </label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      borderRadius: 8,
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'all 0.3s',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Describe your vision, goals, and why you want to be a candidate..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 10, fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                    📷 Profile Picture (Optional)
                  </label>
                  <input 
                    type="file" 
                    ref={fileRef}
                    accept="image/*"
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      borderRadius: 8,
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: 15,
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button 
                    type="button"
                    onClick={() => setShowApplyForm(false)}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      borderRadius: 8,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: 16,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={applying}
                    style={{
                      ...styles.button,
                      flex: 2,
                      opacity: applying ? 0.5 : 1
                    }}
                  >
                    {applying ? 'Submitting...' : '🔄 Reactivate Candidacy'}
                  </button>
                </div>
              </form>
            ) : (
              <>
            <h3 style={{ marginTop: 0, fontSize: 28, marginBottom: 25 }}>✓ You are a Candidate</h3>
            
            {/* VOTE COUNT BOX - TOP PRIORITY - BRIGHT GOLDEN */}
            <div style={styles.voteCountBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#4a148c' }}>🏆 Total Votes Received</div>
                <button
                  onClick={onRefreshVotes}
                  disabled={refreshing}
                  style={{
                    background: '#4a148c',
                    border: '2px solid #fff',
                    color: '#ffd700',
                    padding: '8px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 'bold',
                    opacity: refreshing ? 0.5 : 1,
                    boxShadow: '0 4px 10px rgba(74, 20, 140, 0.3)'
                  }}
                  title="Refresh vote count"
                >
                  {refreshing ? '⟳' : '🔄'} Refresh
                </button>
              </div>
              <span style={styles.voteNumber}>{voteCount}</span>
              <div style={{ fontSize: 14, color: '#4a148c', marginTop: 8, fontWeight: 600 }}>
                ⏰ Auto-refreshes every 10 seconds
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20, marginTop: 25 }}>
              <div>
                <strong style={{ fontSize: 14, opacity: 0.8 }}>Name:</strong>
                <div style={{ fontSize: 18, marginTop: 4 }}>{candidateStatus.candidate?.name}</div>
              </div>
              <div>
                <strong style={{ fontSize: 14, opacity: 0.8 }}>Party:</strong>
                <div style={{ fontSize: 18, marginTop: 4 }}>{candidateStatus.candidate?.party || 'Independent'}</div>
              </div>
              <div>
                <strong style={{ fontSize: 14, opacity: 0.8 }}>Position:</strong>
                <div style={{ fontSize: 18, marginTop: 4 }}>{candidateStatus.candidate?.position || 'Candidate'}</div>
              </div>
              <div>
                <strong style={{ fontSize: 14, opacity: 0.8 }}>Status:</strong>
                <div style={{ fontSize: 18, marginTop: 4 }}>
                  {candidateStatus.candidate?.is_active ? '🟢 Active' : '🔴 Inactive'}
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: 25 }}>
              <strong style={{ fontSize: 16, opacity: 0.9 }}>Description:</strong>
              <p style={{ margin: '8px 0 0 0', fontSize: 15, lineHeight: 1.6, opacity: 0.9 }}>
                {candidateStatus.candidate?.description}
              </p>
            </div>
            
            {/* Show revoke button only if candidate is active */}
            {candidateStatus.candidate?.is_active ? (
              <button 
                onClick={onRevokeCandidacy} 
                disabled={revoking}
                style={{ ...styles.revokeButton, opacity: revoking ? 0.5 : 1 }}
              >
                {revoking ? 'Revoking…' : 'Revoke Candidacy'}
              </button>
            ) : (
              <div>
                <div style={{
                  padding: '12px 20px',
                  background: 'rgba(255, 69, 58, 0.1)',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 69, 58, 0.3)',
                  color: '#ff453a',
                  textAlign: 'center',
                  fontSize: 15,
                  marginBottom: 15
                }}>
                  ⚠️ Your candidacy has been revoked
                </div>
                <button 
                  onClick={() => setShowApplyForm(true)}
                  style={{
                    ...styles.button,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    width: '100%'
                  }}
                >
                  🔄 Reapply as Candidate
                </button>
              </div>
            )}
            </>
            )}
          </div>
        ) : (
          <div style={{ ...styles.candidateCard, background: 'rgba(255, 255, 255, 0.05)' }}>
            <h3 style={{ marginTop: 0, fontSize: 24 }}>
              {candidateStatus?.is_candidate && !candidateStatus?.candidate?.is_active 
                ? '🔄 Reapply as a Candidate' 
                : 'Apply as a Candidate'}
            </h3>
            {!showApplyForm ? (
              <button 
                onClick={() => setShowApplyForm(true)}
                style={styles.button}
              >
                Apply Now
              </button>
            ) : (
              <form onSubmit={onApplyAsCandidate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Show info message if reapplying with saved data */}
                {candidateStatus?.is_candidate && !candidateStatus?.candidate?.is_active && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(102, 126, 234, 0.15)',
                    borderRadius: 8,
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    color: '#a0b0ff',
                    fontSize: 14,
                    lineHeight: 1.5
                  }}>
                    ℹ️ <strong>Your previous candidate information has been loaded.</strong><br/>
                    You can review and update the details below before reapplying.
                  </div>
                )}
                
                <div>
                  <label style={{ display: 'block', marginBottom: 10, fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                    ✨ Full Name *
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    style={{
                      ...styles.input,
                      padding: 12,
                      borderRadius: 10,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                      fontSize: 15,
                      fontWeight: 500,
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                    }}
                    placeholder="Enter your full name"
                    onFocus={(e) => {
                      e.target.style.border = '2px solid rgba(255, 255, 255, 0.6)';
                      e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                    }}
                    onBlur={(e) => {
                      e.target.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                    }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 10, fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                      📅 Date of Birth *
                    </label>
                    <div style={styles.customDatePicker} ref={datePickerRef}>
                      <div 
                        style={styles.dateDisplay}
                        onClick={() => setDatePickerOpen(!datePickerOpen)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.6)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                        }}
                      >
                        <span style={{ opacity: formData.dob ? 1 : 0.6 }}>
                          {getFormattedDate()}
                        </span>
                        <span style={{ fontSize: 18 }}>📅</span>
                      </div>
                      
                      {datePickerOpen && (
                        <div style={styles.datePickerDropdown}>
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, opacity: 0.9 }}>Day</label>
                            <select
                              value={selectedDay}
                              onChange={(e) => setSelectedDay(e.target.value)}
                              style={styles.datePickerSelect}
                            >
                              <option value="">Select Day</option>
                              {days.map(day => (
                                <option key={day} value={day} style={{ background: '#667eea' }}>
                                  {day}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, opacity: 0.9 }}>Month</label>
                            <select
                              value={selectedMonth}
                              onChange={(e) => setSelectedMonth(e.target.value)}
                              style={styles.datePickerSelect}
                            >
                              <option value="">Select Month</option>
                              {months.map(month => (
                                <option key={month} value={month} style={{ background: '#667eea' }}>
                                  {month}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 12, opacity: 0.9 }}>Year</label>
                            <select
                              value={selectedYear}
                              onChange={(e) => setSelectedYear(e.target.value)}
                              style={styles.datePickerSelect}
                            >
                              <option value="">Select Year</option>
                              {years.map(year => (
                                <option key={year} value={year} style={{ background: '#667eea' }}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <button
                            type="button"
                            onClick={handleDateSelect}
                            disabled={!selectedDay || !selectedMonth || !selectedYear}
                            style={{
                              ...styles.datePickerButton,
                              opacity: (!selectedDay || !selectedMonth || !selectedYear) ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (selectedDay && selectedMonth && selectedYear) {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                            }}
                          >
                            ✓ Set Date
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: 10, fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                      👤 Gender *
                    </label>
                    <select 
                      value={formData.gender}
                      onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      required
                      style={{
                        ...styles.input,
                        padding: 12,
                        borderRadius: 10,
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                        fontSize: 15,
                        fontWeight: 500,
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                      }}
                      onFocus={(e) => {
                        e.target.style.border = '2px solid rgba(255, 255, 255, 0.6)';
                        e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                      }}
                      onBlur={(e) => {
                        e.target.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                        e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      <option value="" style={{ background: '#667eea', color: 'white' }}>Select Gender</option>
                      <option value="male" style={{ background: '#667eea', color: 'white' }}>👨 Male</option>
                      <option value="female" style={{ background: '#667eea', color: 'white' }}>👩 Female</option>
                      <option value="other" style={{ background: '#667eea', color: 'white' }}>⚧️ Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: 10, fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                    🎯 Party Affiliation
                  </label>
                  <input 
                    type="text" 
                    value={formData.party}
                    onChange={e => setFormData(prev => ({ ...prev, party: e.target.value }))}
                    placeholder="Independent"
                    style={{
                      ...styles.input,
                      padding: 12,
                      borderRadius: 10,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                      fontSize: 15,
                      fontWeight: 500,
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                    }}
                    onFocus={(e) => {
                      e.target.style.border = '2px solid rgba(255, 255, 255, 0.6)';
                      e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                    }}
                    onBlur={(e) => {
                      e.target.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: 10, fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                    📝 Description / Manifesto *
                  </label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={5}
                    placeholder="Tell voters about yourself and your goals..."
                    style={{
                      ...styles.input,
                      padding: 14,
                      borderRadius: 10,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                      fontSize: 15,
                      fontWeight: 400,
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      lineHeight: 1.6,
                      minHeight: 120
                    }}
                    onFocus={(e) => {
                      e.target.style.border = '2px solid rgba(255, 255, 255, 0.6)';
                      e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                    }}
                    onBlur={(e) => {
                      e.target.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                    }}
                  />
                </div>
                
                {/* Profile Picture Upload */}
                <div>
                  <label style={{ display: 'block', marginBottom: 10, fontSize: 14, opacity: 0.9, fontWeight: 500 }}>
                    📷 Profile Picture (Optional)
                  </label>
                  
                  {/* Image Preview */}
                  {preview && (
                    <div style={{
                      marginBottom: 15,
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        position: 'relative',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '3px solid rgba(255, 255, 255, 0.5)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                      }}>
                        <img 
                          src={preview} 
                          alt="Preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    ref={fileRef}
                    accept="image/*"
                    onChange={onPickFile}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      borderRadius: 10,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                      color: 'white',
                      fontSize: 15,
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.border = '2px solid rgba(255, 255, 255, 0.6)';
                      e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                    }}
                  />
                  <div style={{
                    fontSize: 12,
                    opacity: 0.7,
                    marginTop: 8,
                    fontStyle: 'italic'
                  }}>
                    💡 This picture will be displayed on your candidate card in the voting section
                  </div>
                </div>
                
                {/* Form validation status */}
                <div style={{
                  padding: 12,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  fontSize: 13,
                  marginTop: 10
                }}>
                  <div style={{ marginBottom: 8, fontWeight: 'bold' }}>✓ Form Checklist:</div>
                  <div style={{ opacity: formData.name ? 1 : 0.5 }}>
                    {formData.name ? '✅' : '⬜'} Name: {formData.name || '(not filled)'}
                  </div>
                  <div style={{ opacity: formData.dob ? 1 : 0.5 }}>
                    {formData.dob ? '✅' : '⬜'} Date of Birth: {formData.dob || '(not selected)'}
                  </div>
                  <div style={{ opacity: formData.gender ? 1 : 0.5 }}>
                    {formData.gender ? '✅' : '⬜'} Gender: {formData.gender || '(not selected)'}
                  </div>
                  <div style={{ opacity: formData.party ? 1 : 0.5 }}>
                    {formData.party ? '✅' : '⬜'} Party: {formData.party || 'Independent'}
                  </div>
                  <div style={{ opacity: formData.description ? 1 : 0.5 }}>
                    {formData.description ? '✅' : '⬜'} Description: {formData.description ? `${formData.description.substring(0, 30)}...` : '(not filled)'}
                  </div>
                  <div style={{ opacity: preview ? 1 : 0.5 }}>
                    {preview ? '✅' : '⬜'} Profile Picture: {preview ? '(image selected)' : '(optional)'}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                  <button 
                    type="submit" 
                    disabled={applying || !formData.name || !formData.dob || !formData.gender || !formData.description}
                    style={{ 
                      ...styles.button, 
                      flex: 1, 
                      opacity: (applying || !formData.name || !formData.dob || !formData.gender || !formData.description) ? 0.5 : 1,
                      cursor: (applying || !formData.name || !formData.dob || !formData.gender || !formData.description) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {applying ? '⏳ Submitting…' : '✓ Submit Application'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowApplyForm(false);
                      // Reset form
                      setFormData(prev => ({
                        name: prev.name, // Keep user's name
                        dob: '',
                        gender: '',
                        party: 'Independent',
                        description: ''
                      }));
                    }}
                    disabled={applying}
                    style={{ 
                      ...styles.button, 
                      background: 'rgba(255, 255, 255, 0.2)',
                      opacity: applying ? 0.5 : 1,
                      cursor: applying ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ✕ Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

