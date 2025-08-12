'use client';

import * as React from 'react';
import { AuthProvider } from '@/hooks/use-auth';
import { SplashScreen } from '@/components/app/splash-screen';

export function Providers({ children }: { children: React.ReactNode }) {
    const [showSplash, setShowSplash] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2000); // Show splash for 2 seconds

        return () => clearTimeout(timer);
    }, []);

    return (
        <AuthProvider>
            {showSplash ? <SplashScreen /> : children}
        </AuthProvider>
    );
}
