
'use client';
import * as React from 'react';
import { MainLayout } from '@/components/app/main-layout';

export default function Home() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <MainLayout />
    </React.Suspense>
  );
}
