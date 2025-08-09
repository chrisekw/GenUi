
'use client';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
    const { user } = useAuth();
    if (!user) {
        return (
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                <Sidebar />
                <div className="flex flex-col">
                    <Header />
                    <main className="flex flex-1 items-center justify-center">
                        <p>Please log in to view your profile.</p>
                    </main>
                </div>
            </div>
        )
    }
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">Profile</h1>
          </div>
          <Card>
            <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user.photoURL ?? ''} />
                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1.5">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={user.displayName ?? ''} />
                    </div>
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email ?? ''} readOnly />
                </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
