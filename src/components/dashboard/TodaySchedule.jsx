import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const getStatusColor = (status) => {
  switch (status) {
    case 'Confirmed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Tentative':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Block-out':
      return 'bg-gray-200 text-gray-700 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const TodaySchedule = ({ schedule }) => {
  return (
    <Card variant="transparent" className="h-full rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Today’s Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {schedule.length > 0 ? (
          <div className="relative space-y-6 pl-6">
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gray-200" aria-hidden="true"></div>
            {schedule.map((item, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-[37px] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-4 border-white"></div>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-500">{item.time}</p>
                  <Link 
                    to={item.bookingId ? createPageUrl(`bookings/${item.bookingId}`) : '#'} 
                    className={`block font-bold text-gray-800 ${item.bookingId ? 'hover:text-blue-600' : 'cursor-default'}`}
                  >
                    {item.title}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{item.resource}</span>
                    <Badge variant="outline" className={getStatusColor(item.status)}>{item.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No activity scheduled today.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaySchedule;