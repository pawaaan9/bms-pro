import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, loading, canAccessPage } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check permission if required
  if (requiredPermission) {
    // Map URL path to the correct page name that matches the permission system
    const getPageNameFromPath = (pathname) => {
      const path = pathname.split('/').pop();
      // Handle special cases and ensure proper capitalization
      const pageNameMap = {
        'bookingsall': 'BookingsAll',
        'bookingspending': 'BookingsPending', 
        'bookingsholds': 'BookingsHolds',
        'bookingsconfirmed': 'BookingsConfirmed',
        'bookingscompleted': 'BookingsCompleted',
        'bookingscancelled': 'BookingsCancelled',
        'resourceshalls': 'ResourcesHalls',
        'resourcesholidays': 'ResourcesHolidays',
        'resourcesblockouts': 'ResourcesBlockouts',
        'pricingratecards': 'PricingRatecards',
        'pricingaddons': 'PricingAddons',
        'commsmessages': 'CommsMessages',
        'commstemplates': 'CommsTemplates',
        'settingsgeneral': 'SettingsGeneral',
        'settingspayments': 'SettingsPayments',
        'settingstaxes': 'SettingsTaxes',
        'settingsavailability': 'SettingsAvailability',
        'settingspolicies': 'SettingsPolicies',
        'settingsroles': 'SettingsRoles',
        'settingsintegrations': 'SettingsIntegrations',
        'settingsprivacy': 'SettingsPrivacy'
      };
      
      return pageNameMap[path.toLowerCase()] || path.charAt(0).toUpperCase() + path.slice(1);
    };
    
    const pageName = getPageNameFromPath(location.pathname);
    
    if (!canAccessPage(pageName)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500 mt-2">Contact your administrator for access.</p>
          </div>
        </div>
      );
    }
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;
