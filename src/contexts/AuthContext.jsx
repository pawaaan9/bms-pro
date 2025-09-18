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
  const [token, setToken] = useState(null);
  const [parentUserData, setParentUserData] = useState(null);

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
        
        // If this is a sub-user, fetch parent user data
        if (userData.role === 'sub_user' && userData.parentUserId) {
          try {
            const parentResponse = await fetch(`http://localhost:5000/api/users/parent-data/${userData.parentUserId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (parentResponse.ok) {
              const parentData = await parentResponse.json();
              setParentUserData(parentData);
              console.log('Parent user data fetched:', parentData);
            }
          } catch (error) {
            console.error('Failed to fetch parent user data:', error);
          }
        }
        
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
    const storedToken = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (storedToken && role) {
      setToken(storedToken);
      // Fetch user profile data
      fetchUserProfile(storedToken).then(userData => {
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

  const login = async (authToken, role) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('role', role);
    setToken(authToken);
    
    // Fetch user profile data
    const userData = await fetchUserProfile(authToken);
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
    setToken(null);
    setParentUserData(null);
    // Redirect to login page and prevent back navigation
    window.location.replace('/login');
  };

  const isSuperAdmin = () => {
    return user?.role === 'super_admin';
  };

  const isHallOwner = () => {
    return user?.role === 'hall_owner';
  };

  const isSubUser = () => {
    return user?.role === 'sub_user';
  };

  const hasPermission = (permission) => {
    // Super admins and hall owners have full access
    if (isSuperAdmin() || isHallOwner()) {
      return true;
    }
    
    // Sub-users need specific permission
    if (isSubUser()) {
      return user?.permissions?.includes(permission) || false;
    }
    
    return false;
  };

  const canAccessPage = (pageName) => {
    // Map page names to permission IDs
    const pagePermissionMap = {
      'Dashboard': 'dashboard',
      'Calendar': 'calendar',
      'BookingsAll': 'bookings',
      'BookingsPending': 'bookings',
      'BookingsHolds': 'bookings',
      'BookingsConfirmed': 'bookings',
      'BookingsCompleted': 'bookings',
      'BookingsCancelled': 'bookings',
      'Invoices': 'invoices',
      'Resources': 'resources',
      'ResourcesHalls': 'resources',
      'ResourcesHolidays': 'resources',
      'ResourcesBlockouts': 'resources',
      'PricingRatecards': 'pricing',
      'PricingAddons': 'pricing',
      'Customers': 'customers',
      'Reports': 'reports',
      'CommsMessages': 'comms',
      'CommsTemplates': 'comms',
      'SettingsGeneral': 'settings',
      'SettingsPayments': 'settings',
      'SettingsTaxes': 'settings',
      'SettingsAvailability': 'settings',
      'SettingsPolicies': 'settings',
      'SettingsRoles': 'settings',
      'SettingsIntegrations': 'settings',
      'SettingsPrivacy': 'settings',
      'Audit': 'audit',
      'Help': 'help'
    };

    const permission = pagePermissionMap[pageName];
    return hasPermission(permission);
  };

  const getToken = () => {
    return token || localStorage.getItem('token');
  };

  const value = {
    user,
    token,
    parentUserData,
    getToken,
    login,
    logout,
    isSuperAdmin,
    isHallOwner,
    isSubUser,
    hasPermission,
    canAccessPage,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
