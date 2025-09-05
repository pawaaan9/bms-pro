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

import ResourcesHalls from "./ResourcesHalls";

import ResourcesHolidays from "./ResourcesHolidays";

import ResourcesBlockouts from "./ResourcesBlockouts";

import PricingRatecards from "./PricingRatecards";

import PricingAddons from "./PricingAddons";

import Customers from "./Customers";

import Reports from "./Reports";

import CommsMessages from "./CommsMessages";

import CommsTemplates from "./CommsTemplates";

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
    
    ResourcesHalls: ResourcesHalls,
    
    ResourcesHolidays: ResourcesHolidays,
    
    ResourcesBlockouts: ResourcesBlockouts,
    
    PricingRatecards: PricingRatecards,
    
    PricingAddons: PricingAddons,
    
    Customers: Customers,
    
    Reports: Reports,
    
    CommsMessages: CommsMessages,
    
    CommsTemplates: CommsTemplates,
    
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
        <Layout currentPageName={currentPage}>
            <Routes>
                {/* Redirect root to /login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/BookingsAll" element={<BookingsAll />} />
                
                <Route path="/BookingsPending" element={<BookingsPending />} />
                
                <Route path="/BookingsHolds" element={<BookingsHolds />} />
                
                <Route path="/BookingsConfirmed" element={<BookingsConfirmed />} />
                
                <Route path="/BookingsCompleted" element={<BookingsCompleted />} />
                
                <Route path="/BookingsCancelled" element={<BookingsCancelled />} />
                
                <Route path="/Invoices" element={<Invoices />} />
                
                <Route path="/ResourcesHalls" element={<ResourcesHalls />} />
                
                <Route path="/ResourcesHolidays" element={<ResourcesHolidays />} />
                
                <Route path="/ResourcesBlockouts" element={<ResourcesBlockouts />} />
                
                <Route path="/PricingRatecards" element={<PricingRatecards />} />
                
                <Route path="/PricingAddons" element={<PricingAddons />} />
                
                <Route path="/Customers" element={<Customers />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/CommsMessages" element={<CommsMessages />} />
                
                <Route path="/CommsTemplates" element={<CommsTemplates />} />
                
                <Route path="/SettingsGeneral" element={<SettingsGeneral />} />
                
                <Route path="/SettingsPayments" element={<SettingsPayments />} />
                
                <Route path="/SettingsTaxes" element={<SettingsTaxes />} />
                
                <Route path="/SettingsAvailability" element={<SettingsAvailability />} />
                
                <Route path="/SettingsPolicies" element={<SettingsPolicies />} />
                
                <Route path="/SettingsRoles" element={<SettingsRoles />} />
                
                <Route path="/SettingsIntegrations" element={<SettingsIntegrations />} />
                
                <Route path="/SettingsPrivacy" element={<SettingsPrivacy />} />
                
                <Route path="/Audit" element={<Audit />} />
                
                <Route path="/Help" element={<Help />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}