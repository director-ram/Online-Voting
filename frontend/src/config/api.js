// API Configuration for Production Deployment
const API_URL = import.meta.env.VITE_API_URL || 'https://online-voting-3plz.onrender.com';

export const API_BASE_URL = API_URL;

// Helper function to get full image URL
export const getImageUrl = (path) => {
  if (!path) return null;
  
  // If path already starts with http, check if it's an old Railway URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    // Replace old Railway URL with current Render URL
    if (path.includes('railway.app')) {
      // Extract just the path part after the domain
      const pathPart = path.substring(path.indexOf('/uploads'));
      return `${API_BASE_URL}${pathPart}`;
    }
    return path;
  }
  
  // Otherwise, prepend the backend URL
  return `${API_BASE_URL}${path}`;
};

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add auth token if it exists
  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default { API_BASE_URL, apiCall, getImageUrl };
