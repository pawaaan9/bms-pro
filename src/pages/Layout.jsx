
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  DollarSign,
  Settings,
  HelpCircle,
  Shield,
  MessageSquare,
  Building2,
  Tag,
  Menu,
  X,
  LogOut,
  Receipt } from
"lucide-react";

const navigationItems = [
{
  title: "Dashboard",
  url: createPageUrl("Dashboard"),
  icon: LayoutDashboard
},
{
  title: "Calendar",
  url: createPageUrl("Calendar"),
  icon: Calendar
},
{
  title: "Bookings",
  icon: FileText,
  children: [
  { title: "All", url: createPageUrl("BookingsAll") },
  { title: "Booking Requests", url: createPageUrl("BookingsHolds") },
  { title: "Confirmed", url: createPageUrl("BookingsConfirmed") },
  { title: "Completed", url: createPageUrl("BookingsCompleted") },
  { title: "Cancelled", url: createPageUrl("BookingsCancelled") }]

},
{
  title: "Invoices & Payments",
  url: createPageUrl("Invoices"),
  icon: DollarSign
},
{
  title: "Quotations",
  url: createPageUrl("Quotations"),
  icon: Receipt
},
{
  title: "Resources",
  icon: Building2,
  children: [
  { title: "Resources", url: createPageUrl("Resources") },
  { title: "Add-ons", url: createPageUrl("PricingAddons") }]

},
{
  title: "Pricing",
  icon: Tag,
  children: [
  { title: "Rate Cards", url: createPageUrl("PricingRatecards") }]

},
{
  title: "Customers",
  url: createPageUrl("Customers"),
  icon: Users
},
{
  title: "Users",
  url: createPageUrl("Users"),
  icon: Users
},
{
  title: "Reports",
  url: createPageUrl("Reports"),
  icon: FileText
},
{
  title: "Comms",
  icon: MessageSquare,
  children: [
  { title: "Send Email", url: createPageUrl("CommsSendEmail") },
  { title: "Templates", url: createPageUrl("CommsTemplates") },
  { title: "Messages", url: createPageUrl("CommsMessages") }]

},
{
  title: "Settings",
  icon: Settings,
  children: [
  { title: "General", url: createPageUrl("SettingsGeneral") },
  { title: "Payments", url: createPageUrl("SettingsPayments") },
  { title: "Taxes (GST)", url: createPageUrl("SettingsTaxes") },
  { title: "Availability & Buffers", url: createPageUrl("SettingsAvailability") },
  { title: "Policies", url: createPageUrl("SettingsPolicies") },
  { title: "Roles & Permissions", url: createPageUrl("SettingsRoles") },
  { title: "Integrations", url: createPageUrl("SettingsIntegrations") },
  { title: "Data & Privacy", url: createPageUrl("SettingsPrivacy") }]

},
{
  title: "Audit Log",
  url: createPageUrl("Audit"),
  icon: Shield
},
{
  title: "Help",
  url: createPageUrl("Help"),
  icon: HelpCircle
}];


export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isSuperAdmin, isHallOwner, isSubUser, canAccessPage, logout, user, parentUserData } = useAuth();

  // Auto-expand parent menu if child route is active
  useEffect(() => {
    const newExpandedItems = new Set(expandedItems);

    navigationItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => location.pathname === child.url);
        if (hasActiveChild) {
          newExpandedItems.add(item.title);
        }
      }
    });

    setExpandedItems(newExpandedItems);
  }, [location.pathname]);

  const toggleExpanded = (itemTitle) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(itemTitle)) {
      newExpandedItems.delete(itemTitle);
    } else {
      newExpandedItems.add(itemTitle);
    }
    setExpandedItems(newExpandedItems);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
  };

  const isActiveRoute = (url) => location.pathname === url;
  const hasActiveChild = (item) => item.children?.some((child) => isActiveRoute(child.url));

  // Helper function to check if user can access a navigation item
  const canAccessNavItem = (item) => {
    // Super admin only pages
    const superAdminOnlyPages = ['Users'];
    
    // If this is a super admin only page, only super admins can access it
    if (superAdminOnlyPages.includes(item.title)) {
      return isSuperAdmin();
    }
    
    // Audit Log is accessible by super admins and hall owners
    if (item.title === 'Audit Log') {
      return isSuperAdmin() || isHallOwner() || (isSubUser() && canAccessPage('Audit'));
    }
    
    // Super admins and hall owners have full access to other pages
    if (isSuperAdmin() || isHallOwner()) {
      return true;
    }
    
    // Sub-users need specific permissions
    if (isSubUser()) {
      // For parent items with children, check if user can access any child
      if (item.children && item.children.length > 0) {
        const canAccess = item.children.some(child => canAccessChildNavItem(child));
        console.log(`Navigation access for ${item.title}:`, {
          hasChildren: true,
          canAccess,
          children: item.children.map(child => ({ title: child.title, canAccess: canAccessChildNavItem(child) }))
        });
        return canAccess;
      }
      // For single pages, check if user has permission for this page
      const canAccess = canAccessPage(item.title);
      console.log(`Navigation access for ${item.title}:`, {
        hasChildren: false,
        canAccess
      });
      return canAccess;
    }
    
    return false;
  };

  // Helper function to check if user can access a child navigation item
  const canAccessChildNavItem = (child) => {
    // Super admin only pages
    const superAdminOnlyPages = ['Users'];
    
    // If this is a super admin only page, only super admins can access it
    if (superAdminOnlyPages.includes(child.title)) {
      return isSuperAdmin();
    }
    
    // Audit Log is accessible by super admins and hall owners
    if (child.title === 'Audit Log') {
      return isSuperAdmin() || isHallOwner() || (isSubUser() && canAccessPage('Audit'));
    }
    
    // Super admins and hall owners have full access to other pages
    if (isSuperAdmin() || isHallOwner()) {
      return true;
    }
    
    // Sub-users need specific permissions
    if (isSubUser()) {
      // Map child titles to their corresponding page names for permission checking
      const childToPageMap = {
        'All': 'BookingsAll',
        'Booking Requests': 'BookingsHolds',
        'Confirmed': 'BookingsConfirmed',
        'Completed': 'BookingsCompleted',
        'Cancelled': 'BookingsCancelled',
        'Resources': 'Resources',
        'Add-ons': 'PricingAddons',
        'Rate Cards': 'PricingRatecards',
        'Send Email': 'CommsSendEmail',
        'Templates': 'CommsTemplates',
        'Messages': 'CommsMessages',
        'General': 'SettingsGeneral',
        'Payments': 'SettingsPayments',
        'Taxes (GST)': 'SettingsTaxes',
        'Availability & Buffers': 'SettingsAvailability',
        'Policies': 'SettingsPolicies',
        'Roles & Permissions': 'SettingsRoles',
        'Integrations': 'SettingsIntegrations',
        'Data & Privacy': 'SettingsPrivacy'
      };
      
      const pageName = childToPageMap[child.title] || child.title;
      return canAccessPage(pageName);
    }
    
    return false;
  };

  const isLoginPage = location.pathname === '/login';
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Global Styles */}
      <style jsx global>{`
        :root {
          --bg: #f8fafc;
          --panel: #ffffff;
          --text: #0f172a;
          --muted: #64748b;
          --border: #e2e8f0;
          --primary: #2563eb;
          --success: #10b981;
          --warning: #f59e0b;
          --danger: #ef4444;
        }

        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          background: var(--bg);
          color: var(--text);
        }

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 40;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .sidebar-overlay.open {
          opacity: 1;
        }

        .sidebar {
          width: 260px;
          background: var(--panel);
          border-right: 1px solid var(--border);
          overflow-y: auto;
          flex-shrink: 0;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 50;
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: var(--text);
          border-radius: 0.5rem;
          margin: 0.125rem 0;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .nav-link:hover {
          background: #f1f5f9;
          color: var(--primary);
        }

        .nav-link.active {
          background: #dbeafe;
          color: var(--primary);
          font-weight: 600;
        }

        .nav-summary {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          cursor: pointer;
          border-radius: 0.5rem;
          margin: 0.125rem 0;
          transition: all 0.2s ease;
          font-weight: 500;
          color: var(--text);
          list-style: none;
        }

        .nav-summary:hover {
          background: #f1f5f9;
          color: var(--primary);
        }

        .nav-summary.active {
          background: #dbeafe;
          color: var(--primary);
          font-weight: 600;
        }

        .nav-summary::marker,
        .nav-summary::-webkit-details-marker {
          display: none;
        }

        .nav-summary::after {
          content: '▸';
          margin-left: auto;
          transition: transform 0.2s ease;
        }

        .nav-summary.expanded::after {
          transform: rotate(90deg);
        }

        .nav-children {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0 0 0;
        }

        .nav-child-link {
          display: block;
          padding: 0.5rem 1rem 0.5rem 2.5rem;
          text-decoration: none;
          color: var(--muted);
          border-radius: 0.375rem;
          margin: 0.125rem 0;
          transition: all 0.2s ease;
        }

        .nav-child-link:hover {
          background: #f8fafc;
          color: var(--text);
        }

        .nav-child-link.active {
          background: #dbeafe;
          color: var(--primary);
          font-weight: 600;
        }

        .main-content {
          flex: 1;
          padding: 2.5rem;
          overflow-y: auto;
          background: var(--bg);
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 1.5rem;
          }
        }

        .main-content h1 {
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
          font-weight: 700;
          color: var(--text);
        }

        .main-content p {
          margin: 0 0 2rem 0;
          line-height: 1.6;
          color: var(--muted);
        }

        /* Data Tables */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          background: var(--panel);
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .data-table th,
        .data-table td {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border);
          text-align: left;
        }

        .data-table thead th {
          background: #f8fafc;
          font-weight: 600;
          color: var(--text);
        }

        .data-table tbody tr:nth-child(even) {
          background: #fafbfc;
        }

        .data-table tbody tr:hover {
          background: #f1f5f9;
        }
      `}</style>

      {/* Hide sidebar and header on login page */}
      {!isLoginPage && (
        <>
          {/* Mobile Overlay */}
          {isMobileMenuOpen &&
            <div
              className={`sidebar-overlay ${isMobileMenuOpen ? 'open' : ''} md:hidden`}
              onClick={closeMobileMenu} />
          }
          {/* Sidebar */}
          <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-blue-600 text-xl font-bold">BMSPRO</h2>
                  {user?.role === 'hall_owner' && user?.hallName && (
                    <p className="text-sm text-gray-500 mt-1">{user.hallName}</p>
                  )}
                  {user?.role === 'sub_user' && parentUserData?.hallName && (
                    <p className="text-sm text-gray-500 mt-1">{parentUserData.hallName}</p>
                  )}
                </div>
                <button
                  className="md:hidden p-2 rounded-md hover:bg-gray-100"
                  onClick={closeMobileMenu}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <nav className="p-4 flex-1">
              <ul className="space-y-1">
                {navigationItems.map((item) => {
                  // Check if user can access this navigation item
                  if (!canAccessNavItem(item)) {
                    return null;
                  }
                  
                  return (
                    <li key={item.title}>
                      {item.children ?
                        <details open={expandedItems.has(item.title)}>
                          <summary
                            className={`nav-summary ${hasActiveChild(item) ? 'active' : ''} ${expandedItems.has(item.title) ? 'expanded' : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleExpanded(item.title);
                            }}>
                            <item.icon className="w-5 h-5" />
                            <span>{item.title}</span>
                          </summary>
                          <ul className="nav-children">
                            {item.children.map((child) => {
                              // Check if user can access this child navigation item
                              if (!canAccessChildNavItem(child)) {
                                return null;
                              }
                              
                              return (
                                <li key={child.title}>
                                  <Link
                                    to={child.url}
                                    className={`nav-child-link ${isActiveRoute(child.url) ? 'active' : ''}`}
                                    onClick={closeMobileMenu}>
                                    {child.title}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </details> :
                        <Link
                          to={item.url}
                          className={`nav-link ${isActiveRoute(item.url) ? 'active' : ''}`}
                          onClick={closeMobileMenu}>
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      }
                    </li>
                  );
                })}
              </ul>
            </nav>
            
            {/* User Info and Logout Section */}
            {user && (
              <div className="border-t border-gray-200 p-4 mt-auto">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.role === 'super_admin' ? 'Super Admin' : 
                         user.role === 'hall_owner' ? 'Hall Owner' : 
                         user.role === 'sub_user' ? (user.name || 'Sub-User') : 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.role === 'sub_user' ? 'Sub-User' : 'Logged in'}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </aside>
        </>
      )}
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        {!isLoginPage && (
          <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">BMSPRO</h1>
          </header>
        )}
        {/* Content Area */}
        <div className="main-content">
          {children}
        </div>
      </main>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Logout</h3>
                <p className="text-sm text-gray-500">Are you sure you want to logout?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
