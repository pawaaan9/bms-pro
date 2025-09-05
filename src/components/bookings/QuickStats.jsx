import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className="shadow-sm border-0 transform hover:-translate-y-1 transition-transform duration-200">
    <CardContent className="pt-6 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </CardContent>
  </Card>
);

export default function QuickStats({ stats }) {
  const statItems = [
    { title: "Today's Bookings", value: stats.todayCount, icon: Clock, color: 'bg-blue-500' },
    { title: 'Pending Review', value: stats.pendingCount, icon: AlertTriangle, color: 'bg-orange-500' },
    { title: 'Total Revenue (Completed)', value: `$${stats.totalRevenue.toLocaleString('en-AU')}`, icon: DollarSign, color: 'bg-green-500' },
    { title: 'High Risk Alerts', value: stats.highRiskCount, icon: Users, color: 'bg-red-500' },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map(item => (
        <StatCard key={item.title} {...item} />
      ))}
    </section>
  );
}