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

// Change user password using Firebase Client SDK
export const changePassword = async (currentPassword, newPassword) => {
  try {
    // Import Firebase Auth functions
    const { signInWithEmailAndPassword, updatePassword } = await import('firebase/auth');
    const { auth } = await import('../../firebase');
    
    // Get current user
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Get user's email
    const email = user.email;
    if (!email) {
      throw new Error('User email not found');
    }
    
    // Verify current password by attempting to sign in
    try {
      await signInWithEmailAndPassword(auth, email, currentPassword);
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        throw new Error('Current password is incorrect');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('User not found');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email');
      } else {
        throw new Error('Failed to verify current password');
      }
    }
    
    // Update password
    await updatePassword(user, newPassword);
    
    // Log the password change to backend for audit purposes
    const token = await user.getIdToken();
    const response = await fetch('http://localhost:5000/api/users/log-password-change', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn('Failed to log password change to backend:', response.statusText);
    }
    
    return { message: 'Password changed successfully' };
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};