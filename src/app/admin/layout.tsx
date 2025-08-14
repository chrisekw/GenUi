
'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Loader, Home, LineChart, Users, CreditCard, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/app/header';
import { Logo } from '@/components/icons/logo';

const adminNavItems = [
    { href: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/admin/analytics', icon: LineChart, label: 'Analytics' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
];

function AdminSidebar() {
    const pathname = usePathname();
    return (
        <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Logo />
                        <span className="">GenoUI</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        <div className="px-3 py-2">
                             <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                                Admin
                            </h2>
                            <div className="space-y-1">
                                {adminNavItems.map(({ href, icon: Icon, label }) => {
                                    const isActive = pathname === href;
                                    return (
                                        <Link key={label} href={href}>
                                            <div
                                                className={cn(
                                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                                    isActive && 'bg-muted text-primary'
                                                )}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {label}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && (!user || !userProfile?.isAdmin)) {
      router.push('/');
    }
  }, [user, userProfile, loading, router]);

  if (loading || !user || !userProfile?.isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex-1 bg-muted/40 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
