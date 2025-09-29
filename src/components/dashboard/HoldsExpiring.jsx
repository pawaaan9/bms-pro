import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock3, Send, Trash2, Check } from 'lucide-react';

const getExpiryBadgeVariant = (expiresIn) => {
  const hours = parseInt(expiresIn.split('h')[0], 10);
  if (hours < 2) return 'destructive';
  if (hours < 12) return 'warning';
  return 'secondary';
};

const HoldsExpiring = ({ holds }) => {
  return (
    <Card variant="transparent" className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-blue-600" />
          Holds Expiring Soon
        </CardTitle>
      </CardHeader>
      <CardContent>
        {holds.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Expires In</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holds.map((hold) => (
                <TableRow key={hold.booking}>
                  <TableCell>
                    <div className="font-bold">{hold.customer}</div>
                    <div className="text-sm text-gray-500">{hold.resource}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getExpiryBadgeVariant(hold.expiresIn)}>{hold.expiresIn}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Confirm Booking">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Send Payment Link">
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" aria-label="Release Hold">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No holds are expiring soon.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HoldsExpiring;