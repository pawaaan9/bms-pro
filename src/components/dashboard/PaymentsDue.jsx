import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, Send, Banknote, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '../../utils/dateTimeUtils';

const PaymentsDue = ({ payments, userSettings }) => {
  const sortedPayments = [...payments].sort((a, b) => {
    if (a.status === 'Overdue' && b.status !== 'Overdue') return -1;
    if (a.status !== 'Overdue' && b.status === 'Overdue') return 1;
    return new Date(a.due) - new Date(b.due);
  });

  return (
    <Card className="h-full rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          Payments Due
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedPayments.length > 0 ? (
          <ul className="space-y-4">
            {sortedPayments.map((payment) => (
              <li key={payment.invoice} className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{payment.customer}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{payment.invoice}</span>
                    <span className="font-medium text-gray-700">{payment.type}</span>
                  </div>
                  <div className="mt-1">
                    <Badge variant={payment.status === 'Overdue' ? 'destructive' : 'outline'}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">
                    {formatCurrency(payment.amountAud, userSettings?.currency || 'AUD')}
                  </p>
                  <div className="flex gap-1 mt-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Send Payment Link">
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Record Bank Transfer">
                      <Banknote className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No payments due.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentsDue;