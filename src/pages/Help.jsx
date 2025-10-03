import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createPageUrl } from "@/utils";
import { 
  BookOpen, 
  Calendar, 
  Users, 
  FileText, 
  DollarSign, 
  Settings, 
  Building2, 
  Tag, 
  MessageSquare, 
  Shield,
  Receipt,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function Help() {
  const { isHallOwner } = useAuth();

  // Non hall-owner view
  if (!isHallOwner()) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
        <p className="text-gray-600 mb-6">Access documentation, how-to guides, and support information.</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Contact Your Hall Owner</h3>
              <p className="text-blue-800 text-sm">
                For detailed documentation and support, please contact your hall owner or administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hall owner documentation
  return (
    <div className="max-w-6xl">
      {/* Hero */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-blue-50 via-green-50 to-amber-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-6 h-6 text-blue-700" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">BMS-Pro Admin Panel Documentation</h1>
              </div>
              <p className="text-gray-700">Complete guide to managing your venue with BMS-Pro</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs px-2 py-1 rounded-full bg-white/70 border border-white/60 text-gray-900">Quick Start</span>
                <span className="text-xs px-2 py-1 rounded-full bg-white/70 border border-white/60 text-gray-900">Videos</span>
                <span className="text-xs px-2 py-1 rounded-full bg-white/70 border border-white/60 text-gray-900">FAQs</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 min-w-[220px]">
              <a href={createPageUrl('Dashboard')} className="rounded-lg border border-gray-200 bg-white p-3 text-sm hover:shadow-sm">Dashboard →</a>
              <a href={createPageUrl('Calendar')} className="rounded-lg border border-gray-200 bg-white p-3 text-sm hover:shadow-sm">Calendar →</a>
              <a href={createPageUrl('BookingsAll')} className="rounded-lg border border-gray-200 bg-white p-3 text-sm hover:shadow-sm">Bookings →</a>
              <a href={createPageUrl('Invoices')} className="rounded-lg border border-gray-200 bg-white p-3 text-sm hover:shadow-sm">Invoices →</a>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Introduction Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Getting Started</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Welcome to BMS-Pro, your comprehensive booking management system. This admin panel allows you to manage 
            all aspects of your venue operations including bookings, customers, invoicing, and more.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> Use the sidebar navigation to access different sections. Most features include 
              advanced filtering and search capabilities to help you find information quickly.
            </p>
          </div>
        </section>

        {/* Dashboard Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Your central hub for monitoring venue performance and key metrics.
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Quick Stats:</strong> View total bookings, revenue, pending requests, and upcoming events at a glance</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Revenue Charts:</strong> Visualize your income trends and performance over time</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Recent Activity:</strong> Monitor latest bookings and important updates</span>
            </li>
          </ul>
        </section>

        {/* Calendar Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Calendar</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Visual overview of all your bookings and availability.
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>View Modes:</strong> Switch between month, week, and day views</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Color Coding:</strong> Bookings are color-coded by status (pending, confirmed, completed, cancelled)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Quick Actions:</strong> Click on any booking to view details or click empty slots to create new bookings</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Blockouts:</strong> View and manage blocked dates and maintenance periods</span>
            </li>
          </ul>
        </section>

        {/* Bookings Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Bookings Management</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Comprehensive booking management with multiple views and powerful filtering.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Booking Views:</h3>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>All Bookings:</strong> Complete list of all bookings regardless of status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Booking Requests:</strong> New booking requests that need your review and approval</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Confirmed:</strong> Approved bookings that are scheduled</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Completed:</strong> Past bookings that have been fulfilled</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Cancelled:</strong> Cancelled bookings for record keeping</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Key Features:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Smart Filters:</strong> Filter by date range, status, hall, customer, and more</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Quick Search:</strong> Search bookings by customer name, booking ID, or event type</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Bulk Actions:</strong> Update multiple bookings at once</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Export:</strong> Export booking data to CSV for reporting and analysis</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Invoices & Payments Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Invoices & Payments</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Manage all financial transactions and invoice generation.
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Auto-Generation:</strong> Invoices are automatically created from confirmed bookings</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Payment Tracking:</strong> Record and track all payments (deposits, full payments, refunds)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Email Invoices:</strong> Send professional invoices directly to customers via email</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Payment Status:</strong> Track outstanding, partial, and fully paid invoices</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>GST/Tax:</strong> Automatic tax calculation based on your settings</span>
            </li>
          </ul>
        </section>

        {/* Quotations Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Receipt className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Quotations</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Create and send price quotes to potential customers.
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Quick Quotes:</strong> Generate professional quotations with pricing details</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Convert to Booking:</strong> Easily convert accepted quotes into confirmed bookings</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Status Tracking:</strong> Monitor which quotes are pending, accepted, or declined</span>
            </li>
          </ul>
        </section>

        {/* Resources Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Resources Management</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Manage your venues, add-ons, and availability settings.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Resources:</h3>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Configure your halls/venues with capacity, facilities, and descriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Set up operational hours and default availability</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Manage blockout dates for maintenance or holidays</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Add-ons:</h3>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Create additional services (catering, AV equipment, decorations, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Set pricing and availability for each add-on</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Tag className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Pricing & Rate Cards</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Configure flexible pricing structures for different scenarios.
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Rate Cards:</strong> Create different pricing tiers (standard, peak, off-peak, weekend, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Time-based Pricing:</strong> Set different rates for hourly, half-day, or full-day bookings</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Seasonal Pricing:</strong> Adjust pricing based on seasons or special periods</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Automatic Calculation:</strong> System automatically calculates total cost based on selected rate card</span>
            </li>
          </ul>
        </section>

        {/* Customers Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Customers</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Manage your customer database and booking history.
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Customer Profiles:</strong> Store contact information, preferences, and notes</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Booking History:</strong> View all past and upcoming bookings for each customer</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Quick Booking:</strong> Create new bookings directly from customer profiles</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Communication:</strong> Send emails and messages directly from customer profiles</span>
            </li>
          </ul>
        </section>

        {/* Reports Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Generate comprehensive reports for business insights.
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Revenue Reports:</strong> Track income by date range, hall, or event type</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Booking Statistics:</strong> Analyze booking trends and patterns</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Customer Analytics:</strong> Identify repeat customers and booking frequency</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Export Options:</strong> Download reports in various formats (PDF, Excel, CSV)</span>
            </li>
          </ul>
        </section>

        {/* Communications Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Communications</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Manage all customer communications and email templates.
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Email Templates:</strong> Create reusable templates for common communications</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Automated Emails:</strong> Set up automatic confirmation, reminder, and follow-up emails</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Message History:</strong> View all sent communications and customer responses</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Bulk Messaging:</strong> Send announcements to multiple customers at once</span>
            </li>
          </ul>
        </section>

        {/* Settings Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Configure system-wide settings and preferences.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Available Settings:</h3>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>General:</strong> Business information, timezone, date/time formats, currency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Payments:</strong> Payment methods, deposit requirements, refund policies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Taxes (GST):</strong> Tax rates and GST configuration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Availability & Buffers:</strong> Setup times, buffer periods between bookings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Policies:</strong> Cancellation policies, terms and conditions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Roles & Permissions:</strong> Manage sub-users and their access levels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Integrations:</strong> Connect with third-party services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span><strong>Data & Privacy:</strong> Data backup and privacy settings</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sub-Users Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Sub-Users & Permissions</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Create team accounts with customized access levels.
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Add Team Members:</strong> Create accounts for staff members</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Granular Permissions:</strong> Control access to specific features (dashboard, bookings, invoices, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Activity Tracking:</strong> Monitor what actions sub-users perform via the Audit Log</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Role Templates:</strong> Create custom role templates for different job functions</span>
            </li>
          </ul>
        </section>

        {/* Audit Log Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Audit Log</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Track all system activities and changes for security and compliance.
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Activity Tracking:</strong> View all user actions including logins, bookings, updates, and deletions</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Filter by User:</strong> See what specific users or sub-users have done</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Filter by Action:</strong> Find specific types of activities (create, update, delete, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Date Range:</strong> Review activities within specific time periods</span>
            </li>
          </ul>
        </section>

        {/* Tips & Best Practices */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tips & Best Practices</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <p><strong>Regularly Review Booking Requests:</strong> Check the "Booking Requests" section daily to respond promptly to new inquiries.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <p><strong>Keep Resources Updated:</strong> Ensure your hall information, availability, and pricing are always current.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <p><strong>Use Email Templates:</strong> Save time by creating templates for common communications.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
              <p><strong>Monitor Reports:</strong> Review your revenue and booking reports monthly to identify trends and opportunities.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
              <p><strong>Set Up Automated Emails:</strong> Configure automatic confirmation and reminder emails to reduce manual work.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">6</div>
              <p><strong>Use Sub-Users Wisely:</strong> Grant appropriate permissions to team members based on their roles.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">7</div>
              <p><strong>Regular Backups:</strong> Ensure your data is backed up regularly via the Data & Privacy settings.</p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">FAQs</h2>
          <details className="border rounded-lg p-4 mb-3">
            <summary className="font-medium cursor-pointer">How do I invite a sub-user?</summary>
            <p className="mt-2 text-gray-700">Go to Settings → Roles & Permissions → Add team member and assign a role.</p>
          </details>
          <details className="border rounded-lg p-4 mb-3">
            <summary className="font-medium cursor-pointer">Where do I change pricing?</summary>
            <p className="mt-2 text-gray-700">Navigate to Pricing → Rate Cards. Update or create a new rate card.</p>
          </details>
          <details className="border rounded-lg p-4">
            <summary className="font-medium cursor-pointer">Why are my audit logs empty?</summary>
            <p className="mt-2 text-gray-700">Ensure the backend is running, you are logged in, and some actions have been performed to generate logs.</p>
          </details>
        </section>

        {/* Support Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need More Help?</h2>
          <p className="text-gray-700 mb-4">
            If you need additional assistance or have questions not covered in this documentation:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-1">Technical Support</h3>
              <p className="text-sm text-gray-700">Contact your system administrator or support team.</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-1">Training</h3>
              <p className="text-sm text-gray-700">Request training sessions for you and your team.</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-1">Feedback</h3>
              <p className="text-sm text-gray-700">We welcome your suggestions to improve BMS‑Pro.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}