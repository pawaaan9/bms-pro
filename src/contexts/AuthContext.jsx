import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User profile fetched:', userData); // Debug log
        return userData;
      } else {
        console.error('Failed to fetch profile:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
    return null;
  };

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      // Fetch user profile data
      fetchUserProfile(token).then(userData => {
        if (userData) {
          setUser({ role, ...userData });
        } else {
          setUser({ role });
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    
    // Fetch user profile data
    const userData = await fetchUserProfile(token);
    if (userData) {
      setUser({ role, ...userData });
    } else {
      setUser({ role });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    // Redirect to login page and prevent back navigation
    window.location.replace('/login');
  };

  const isSuperAdmin = () => {
    return user?.role === 'super_admin';
  };

  const isHallOwner = () => {
    return user?.role === 'hall_owner';
  };

  const value = {
    user,
    login,
    logout,
    isSuperAdmin,
    isHallOwner,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
