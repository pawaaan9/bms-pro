import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle, FileWarning, Webhook, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getAlertIcon = (type) => {
  switch (type) {
    case 'conflict':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'doc':
      return <FileWarning className="h-5 w-5 text-yellow-500" />;
    case 'webhook':
      return <Webhook className="h-5 w-5 text-gray-500" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
  }
};

const AlertsTasks = ({ alerts }) => {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
          Alerts & Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <ul className="space-y-3">
            {alerts.map((alert, index) => (
              <li key={index} className="flex items-start gap-3 rounded-lg border bg-gray-50 p-3">
                <div className="flex-shrink-0">{getAlertIcon(alert.type)}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{alert.text}</p>
                  <Button variant="link" className="h-auto p-0 text-sm text-blue-600">Resolve</Button>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:bg-gray-200">
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No active alerts.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsTasks;