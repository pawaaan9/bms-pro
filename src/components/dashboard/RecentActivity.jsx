import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const RecentActivity = ({ activities }) => {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-600" />
          Recent Activity
        </CardTitle>
        <Link to={createPageUrl('Audit')}>
          <Button variant="link">View Audit Log</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {activities.map((activity, index) => (
            <li key={index} className="flex items-center gap-4 border-b pb-2 last:border-b-0">
              <span className="text-sm font-medium text-gray-500">{activity.at}</span>
              <span className="text-sm font-semibold text-gray-700 w-16">{activity.actor}</span>
              <p className="text-sm text-gray-600">{activity.text}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;