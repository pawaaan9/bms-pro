
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
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
  X } from
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
  { title: "Pending Review", url: createPageUrl("BookingsPending") },
  { title: "Holds (Tentative)", url: createPageUrl("BookingsHolds") },
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
  title: "Resources",
  icon: Building2,
  children: [
  { title: "Halls/Rooms", url: createPageUrl("ResourcesHalls") },
  { title: "Public Holidays", url: createPageUrl("ResourcesHolidays") },
  { title: "Block-outs", url: createPageUrl("ResourcesBlockouts") }]

},
{
  title: "Pricing",
  icon: Tag,
  children: [
  { title: "Rate Cards", url: createPageUrl("PricingRatecards") },
  { title: "Add-ons", url: createPageUrl("PricingAddons") }]

},
{
  title: "Customers",
  url: createPageUrl("Customers"),
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
  { title: "Messages", url: createPageUrl("CommsMessages") },
  { title: "Templates", url: createPageUrl("CommsTemplates") }]

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

  const isActiveRoute = (url) => location.pathname === url;
  const hasActiveChild = (item) => item.children?.some((child) => isActiveRoute(child.url));

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
                  {/* <p className="text-sm text-gray-500 mt-1">Hall name here</p> */}
                </div>
                <button
                  className="md:hidden p-2 rounded-md hover:bg-gray-100"
                  onClick={closeMobileMenu}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <nav className="p-4">
              <ul className="space-y-1">
                {navigationItems.map((item) =>
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
                          {item.children.map((child) =>
                            <li key={child.title}>
                              <Link
                                to={child.url}
                                className={`nav-child-link ${isActiveRoute(child.url) ? 'active' : ''}`}
                                onClick={closeMobileMenu}>
                                {child.title}
                              </Link>
                            </li>
                          )}
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
                )}
              </ul>
            </nav>
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
    </div>
  );

}
