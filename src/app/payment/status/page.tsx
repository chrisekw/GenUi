
'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPayment } from '@/app/actions';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import type { PlanId } from '@/lib/user-profile';

export default function PaymentStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refreshUserProfile } = useAuth();

  const [status, setStatus] = React.useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = React.useState('Verifying your payment, please wait...');

  React.useEffect(() => {
    const transactionId = searchParams.get('transaction_id');
    const txRef = searchParams.get('tx_ref'); // tx_ref should contain userId and planId
    
    if (authLoading) {
      return; // Wait for user auth state to be determined
    }

    if (!transactionId || !txRef) {
      setMessage('Invalid payment details in URL. Please contact support.');
      setStatus('failed');
      return;
    }

    // The user must be logged in to verify a payment
    if (!user) {
        setMessage('You must be logged in to verify a payment. Redirecting to login...');
        setStatus('failed');
        setTimeout(() => router.push('/login'), 3000);
        return;
    }
    
    // Extract userId and planId from tx_ref
    const [userId, planId] = txRef.split('_');

    if (user.uid !== userId) {
        setMessage('Payment details do not match the logged-in user. Please contact support.');
        setStatus('failed');
        return;
    }

    async function handleVerification() {
      try {
        const result = await verifyPayment({
          transactionId,
          userId: userId as string,
          planId: planId as PlanId,
        });

        if (result.success) {
          setMessage(result.message);
          setStatus('success');
          // Refresh user profile to get the new plan details
          await refreshUserProfile();
        } else {
          setMessage(result.message);
          setStatus('failed');
        }
      } catch (error: any) {
        setMessage(error.message || 'An unexpected error occurred.');
        setStatus('failed');
      }
    }

    handleVerification();
  }, [searchParams, user, authLoading, router, refreshUserProfile]);

  const renderStatus = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <Loader className="h-16 w-16 animate-spin text-primary" />
            <h1 className="text-2xl font-semibold mt-4">Verifying Payment</h1>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h1 className="text-2xl font-semibold mt-4">Payment Successful!</h1>
          </>
        );
      case 'failed':
        return (
          <>
            <XCircle className="h-16 w-16 text-destructive" />
            <h1 className="text-2xl font-semibold mt-4">Payment Failed</h1>
          </>
        );
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center text-center gap-4 p-4 md:gap-8 md:p-8">
          {renderStatus()}
          <p className="text-muted-foreground">{message}</p>
          {status !== 'verifying' && (
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          )}
        </main>
      </div>
    </div>
  );
}
