
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data for payments
const payments = [
  {
    id: 'pay_1',
    user: { name: 'Liam Johnson', email: 'liam@example.com', avatar: '' },
    plan: 'Pro',
    amount: '$10.00',
    status: 'Paid',
    date: '2023-08-15',
  },
  {
    id: 'pay_2',
    user: { name: 'Olivia Smith', email: 'olivia@example.com', avatar: '' },
    plan: 'Studio',
    amount: '$35.00',
    status: 'Paid',
    date: '2023-08-14',
  },
    {
    id: 'pay_3',
    user: { name: 'Noah Williams', email: 'noah@example.com', avatar: '' },
    plan: 'Enterprise',
    amount: '$155.00',
    status: 'Paid',
    date: '2023-08-14',
  },
    {
    id: 'pay_4',
    user: { name: 'Emma Brown', email: 'emma@example.com', avatar: '' },
    plan: 'Pro',
    amount: '$10.00',
    status: 'Pending',
    date: '2023-08-13',
  },
    {
    id: 'pay_5',
    user: { name: 'Ava Jones', email: 'ava@example.com', avatar: '' },
    plan: 'Studio',
    amount: '$35.00',
    status: 'Failed',
    date: '2023-08-12',
  },
];

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  Paid: 'default',
  Pending: 'secondary',
  Failed: 'destructive',
};

export default function AdminPaymentsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <CardDescription>A list of recent payments from your users.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
               <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={payment.user.avatar} />
                        <AvatarFallback>{payment.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{payment.user.name}</p>
                        <p className="text-sm text-muted-foreground">{payment.user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{payment.plan}</TableCell>
                <TableCell>{payment.amount}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[payment.status] || 'secondary'}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
