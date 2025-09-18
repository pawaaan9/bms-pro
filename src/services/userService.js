// User service for handling user-related operations
import { useAuth } from '@/contexts/AuthContext';

export const getUserContext = () => {
  // This will be used by other services to get the current user context
  // and determine if they should filter data by parent user
  return {
    isSubUser: () => {
      // This will be implemented in components that use this service
      return false;
    },
    getParentUserId: () => {
      // This will be implemented in components that use this service
      return null;
    }
  };
};

// Helper function to get the appropriate user ID for data queries
export const getDataUserId = (user, parentUserData) => {
  // If user is a sub-user, use parent user ID for data queries
  if (user?.role === 'sub_user' && user?.parentUserId) {
    return user.parentUserId;
  }
  
  // For hall owners and super admins, use their own ID
  return user?.id;
};

// Helper function to get hall name for display
export const getHallName = (user, parentUserData) => {
  if (user?.role === 'hall_owner') {
    return user.hallName;
  }
  
  if (user?.role === 'sub_user' && parentUserData) {
    return parentUserData.hallName;
  }
  
  return null;
};

// Helper function to get user display name
export const getUserDisplayName = (user) => {
  if (user?.role === 'sub_user' && user?.name) {
    return user.name;
  }
  
  if (user?.role === 'hall_owner') {
    return 'Hall Owner';
  }
  
  if (user?.role === 'super_admin') {
    return 'Super Admin';
  }
  
  return 'User';
};
