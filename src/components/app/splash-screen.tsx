
'use client';

import { Logo } from '@/components/icons/logo';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background animate-fade-out" style={{ animationFillMode: 'forwards', animationDelay: '1.5s' }}>
      <div className="flex items-center gap-4 animate-pulse">
        <Logo className="h-12 w-12 text-primary" />
        <span className="text-4xl font-semibold tracking-tighter text-primary">GenoUI</span>
      </div>
    </div>
  );
}
