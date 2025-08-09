
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-2xl font-bold tracking-tight">
                Manage your account settings
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                You can manage your profile and other settings here.
              </p>
              <Link href="/settings/profile" className="text-sm text-primary hover:underline">
                Go to Profile
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
