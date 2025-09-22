import Layout from "./Layout.jsx";

import Welcome from "./Welcome";

import Dashboard from "./Dashboard";

import Calendar from "./Calendar";

import BookingsAll from "./BookingsAll";

import BookingsPending from "./BookingsPending";

import BookingsHolds from "./BookingsHolds";

import BookingsConfirmed from "./BookingsConfirmed";

import BookingsCompleted from "./BookingsCompleted";

import BookingsCancelled from "./BookingsCancelled";

import Invoices from "./Invoices";
import Login from "./Login";

import Resources from "./Resources";

import ResourcesHalls from "./ResourcesHalls";

import ResourcesHolidays from "./ResourcesHolidays";

import ResourcesBlockouts from "./ResourcesBlockouts";

import PricingRatecards from "./PricingRatecards";

import PricingAddons from "./PricingAddons";


import Users from "./Users";
import Customers from "./Customers";

import Reports from "./Reports";

import CommsMessages from "./CommsMessages";

import CommsTemplates from "./CommsTemplates";

import CommsSendEmail from "./CommsSendEmail";

import SettingsGeneral from "./SettingsGeneral";

import SettingsPayments from "./SettingsPayments";

import SettingsTaxes from "./SettingsTaxes";

import SettingsAvailability from "./SettingsAvailability";

import SettingsPolicies from "./SettingsPolicies";

import SettingsRoles from "./SettingsRoles";

import SettingsIntegrations from "./SettingsIntegrations";

import SettingsPrivacy from "./SettingsPrivacy";

import Audit from "./Audit";

import Help from "./Help";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

const PAGES = {
    
    Welcome: Welcome,
    
    Dashboard: Dashboard,
    
    Calendar: Calendar,
    
    BookingsAll: BookingsAll,
    
    BookingsPending: BookingsPending,
    
    BookingsHolds: BookingsHolds,
    
    BookingsConfirmed: BookingsConfirmed,
    
    BookingsCompleted: BookingsCompleted,
    
    BookingsCancelled: BookingsCancelled,
    
    Invoices: Invoices,
    
    Resources: Resources,
    
    ResourcesHalls: ResourcesHalls,
    
    ResourcesHolidays: ResourcesHolidays,
    
    ResourcesBlockouts: ResourcesBlockouts,
    
    PricingRatecards: PricingRatecards,
    
    PricingAddons: PricingAddons,
    
    Customers: Customers,
    Users: Users,
    
    Reports: Reports,
    
    CommsMessages: CommsMessages,
    
    CommsTemplates: CommsTemplates,
    
    CommsSendEmail: CommsSendEmail,
    
    SettingsGeneral: SettingsGeneral,
    
    SettingsPayments: SettingsPayments,
    
    SettingsTaxes: SettingsTaxes,
    
    SettingsAvailability: SettingsAvailability,
    
    SettingsPolicies: SettingsPolicies,
    
    SettingsRoles: SettingsRoles,
    
    SettingsIntegrations: SettingsIntegrations,
    
    SettingsPrivacy: SettingsPrivacy,
    
    Audit: Audit,
    
    Help: Help,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Routes>
            {/* Redirect root to /login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* All other routes are protected */}
            <Route path="/Welcome" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Welcome />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Dashboard" element={
                <ProtectedRoute requiredPermission={true}>
                    <Layout currentPageName={currentPage}>
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Calendar" element={
                <ProtectedRoute requiredPermission={true}>
                    <Layout currentPageName={currentPage}>
                        <Calendar />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/BookingsAll" element={
                <ProtectedRoute requiredPermission={true}>
                    <Layout currentPageName={currentPage}>
                        <BookingsAll />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/BookingsPending" element={
                <ProtectedRoute requiredPermission={true}>
                    <Layout currentPageName={currentPage}>
                        <BookingsPending />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/BookingsHolds" element={
                <ProtectedRoute requiredPermission={true}>
                    <Layout currentPageName={currentPage}>
                        <BookingsHolds />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/BookingsConfirmed" element={
                <ProtectedRoute requiredPermission={true}>
                    <Layout currentPageName={currentPage}>
                        <BookingsConfirmed />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/BookingsCompleted" element={
                <ProtectedRoute requiredPermission={true}>
                    <Layout currentPageName={currentPage}>
                        <BookingsCompleted />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/BookingsCancelled" element={
                <ProtectedRoute requiredPermission={true}>
                    <Layout currentPageName={currentPage}>
                        <BookingsCancelled />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Invoices" element={
                <ProtectedRoute requiredPermission={true}>
                    <Layout currentPageName={currentPage}>
                        <Invoices />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Resources" element={
                <ProtectedRoute requiredPermission={true}>
                    <Layout currentPageName={currentPage}>
                        <Resources />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/ResourcesHalls" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <ResourcesHalls />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/ResourcesHolidays" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <ResourcesHolidays />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/ResourcesBlockouts" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <ResourcesBlockouts />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/PricingRatecards" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <PricingRatecards />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/PricingAddons" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <PricingAddons />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Customers" element={
                <ProtectedRoute requiredPermission={true}>
                    <Layout currentPageName={currentPage}>
                        <Customers />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Users" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Users />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Reports" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Reports />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/CommsSendEmail" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <CommsSendEmail />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/CommsTemplates" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <CommsTemplates />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/CommsMessages" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <CommsMessages />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/SettingsGeneral" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <SettingsGeneral />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/SettingsPayments" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <SettingsPayments />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/SettingsTaxes" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <SettingsTaxes />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/SettingsAvailability" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <SettingsAvailability />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/SettingsPolicies" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <SettingsPolicies />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/SettingsRoles" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <SettingsRoles />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/SettingsIntegrations" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <SettingsIntegrations />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/SettingsPrivacy" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <SettingsPrivacy />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Audit" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Audit />
                    </Layout>
                </ProtectedRoute>
            } />
            
            <Route path="/Help" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Help />
                    </Layout>
                </ProtectedRoute>
            } />
            
        </Routes>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}