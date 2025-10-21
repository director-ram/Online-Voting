import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  
  // Redirect to login page with register mode
  React.useEffect(() => {
    navigate('/');
  }, [navigate]);

  return null;
}
