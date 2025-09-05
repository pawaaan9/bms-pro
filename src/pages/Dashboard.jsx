import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Calendar,
  Filter,
  Users,
  Clock,
  DollarSign,
  FileWarning,
  BarChart2,
  List,
} from 'lucide-react';
import KpiCard from '../components/dashboard/KpiCard';
import TodaySchedule from '../components/dashboard/TodaySchedule';
import PaymentsDue from '../components/dashboard/PaymentsDue';
import HoldsExpiring from '../components/dashboard/HoldsExpiring';
import AlertsTasks from '../components/dashboard/AlertsTasks';
import RecentActivity from '../components/dashboard/RecentActivity';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

const sampleData = {
  kpis: {
    occupancyToday: {
      value: '78%',
      delta: '+6% WoW',
      note: '% of bookable hours filled',
      sparkline: [50, 60, 55, 70, 72, 78],
    },
    bookingsThisWeek: {
      value: '24',
      delta: '-3 WoW',
      note: 'Confirmed in current week',
      sparkline: [30, 28, 25, 27, 24],
    },
    holdsExpiring: {
      value: '5',
      delta: '+2 DoD',
      note: 'Tentative holds <48h left',
      sparkline: [2, 3, 4, 3, 5],
    },
    paymentsDue: {
      value: '$1,420 AUD',
      delta: '+$220 DoD',
      note: 'Due today + overdue',
      sparkline: [800, 1000, 1200, 1420],
    },
    cancellations30d: {
      value: '2',
      delta: '0 MoM',
      note: 'Count',
      sparkline: [3, 2, 2, 2],
    },
    revenueMtd: {
      value: '$12,640 AUD',
      delta: '+$1,040 WTD',
      note: 'Incl. GST line item',
      sparkline: [9000, 10500, 11600, 12640],
    },
  },
  scheduleToday: [
    { time: '08:00–09:00', resource: 'Hall A', title: 'Setup', status: 'Block-out' },
    { time: '09:00–12:00', resource: 'Hall A', title: 'Smith — Community Yoga', status: 'Confirmed', bookingId: 'BKG-310' },
    { time: '13:00–16:00', resource: 'Hall B', title: 'Nguyen — Rehearsal', status: 'Tentative', bookingId: 'BKG-311' },
    { time: '18:00–22:00', resource: 'Hall A', title: 'Pereira — Birthday', status: 'Confirmed', bookingId: 'BKG-312' },
  ],
  paymentsDue: [
    { invoice: 'INV-2051', customer: 'Smith', type: 'DEPOSIT', amountAud: 420, due: '2025-08-26', status: 'Due Today' },
    { invoice: 'INV-2052', customer: 'Pereira', type: 'FINAL', amountAud: 1000, due: '2025-08-26', status: 'Due Today' },
    { invoice: 'INV-2048', customer: 'Jones', type: 'BOND', amountAud: 500, due: '2025-08-24', status: 'Overdue' },
  ],
  holds: [
    { booking: 'BKG-311', resource: 'Hall B', start: '2025-08-27 13:00', expiresIn: '5h 40m', customer: 'Nguyen' },
    { booking: 'BKG-319', resource: 'Hall A', start: '2025-08-28 19:00', expiresIn: '1h 10m', customer: 'Rai' },
    { booking: 'BKG-320', resource: 'Main Hall', start: '2025-08-27 10:00', expiresIn: '14h 2m', customer: 'Chen' },
  ],
  alerts: [
    { type: 'conflict', text: 'Buffer overlap on Hall A at 6:00 PM' },
    { type: 'doc', text: 'Insurance document missing for Pereira (BKG-312)' },
    { type: 'webhook', text: 'Stripe webhook delivery failed. Retry scheduled.' },
  ],
  activity: [
    { at: '10:02', actor: 'Admin', text: 'Updated policy: Cancellation Window.' },
    { at: '09:25', actor: 'Stripe', text: 'Payment succeeded for INV-2050 ($780.00 AUD).' },
    { at: '09:12', actor: 'Admin', text: 'Accepted booking BKG-311 (Nguyen — Rehearsal).' },
  ],
};

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Today's status across bookings, availability, and payments.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/calendar')}>
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
        </div>
      </header>

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-3 shadow-sm">
        <Filter className="h-5 w-5 text-gray-500" />
        <div className="flex-grow sm:flex-grow-0">
          <DatePicker />
        </div>
        <div className="flex-grow sm:flex-grow-0">
          <Select>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Resources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="hall_a">Hall A</SelectItem>
              <SelectItem value="hall_b">Hall B</SelectItem>
              <SelectItem value="main_hall">Main Hall</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700">Confirmed</Button>
            <Button variant="outline" size="sm">Tentative</Button>
            <Button variant="outline" size="sm">Block-out</Button>
        </div>
        <Button variant="link" size="sm" className="text-gray-600">
          Reset filters
        </Button>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Row A: KPI Cards */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard title="Occupancy Today" value={sampleData.kpis.occupancyToday.value} delta={sampleData.kpis.occupancyToday.delta} sparklineData={sampleData.kpis.occupancyToday.sparkline} note={sampleData.kpis.occupancyToday.note} />
          <KpiCard title="Bookings (This Week)" value={sampleData.kpis.bookingsThisWeek.value} delta={sampleData.kpis.bookingsThisWeek.delta} deltaType="decrease" sparklineData={sampleData.kpis.bookingsThisWeek.sparkline} note={sampleData.kpis.bookingsThisWeek.note} />
          <KpiCard title="Holds Expiring" value={sampleData.kpis.holdsExpiring.value} delta={sampleData.kpis.holdsExpiring.delta} sparklineData={sampleData.kpis.holdsExpiring.sparkline} note={sampleData.kpis.holdsExpiring.note} />
          <KpiCard title="Payments Due" value={sampleData.kpis.paymentsDue.value} delta={sampleData.kpis.paymentsDue.delta} sparklineData={sampleData.kpis.paymentsDue.sparkline} note={sampleData.kpis.paymentsDue.note} />
          <KpiCard title="Cancellations (30d)" value={sampleData.kpis.cancellations30d.value} delta={sampleData.kpis.cancellations30d.delta} deltaType="neutral" sparklineData={sampleData.kpis.cancellations30d.sparkline} note={sampleData.kpis.cancellations30d.note} />
          <KpiCard title="Revenue (MTD)" value={sampleData.kpis.revenueMtd.value} delta={sampleData.kpis.revenueMtd.delta} sparklineData={sampleData.kpis.revenueMtd.sparkline} note={sampleData.kpis.revenueMtd.note} />
        </section>

        {/* Row B: Schedule & Payments */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TodaySchedule schedule={sampleData.scheduleToday} />
          </div>
          <div>
            <PaymentsDue payments={sampleData.paymentsDue} />
          </div>
        </section>

        {/* Row C: Holds & Alerts */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <HoldsExpiring holds={sampleData.holds} />
          <AlertsTasks alerts={sampleData.alerts} />
        </section>
        
        {/* Row D: Recent Activity */}
        <RecentActivity activities={sampleData.activity} />
      </div>
    </main>
  );
}