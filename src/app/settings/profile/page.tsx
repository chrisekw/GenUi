
'use client';
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import React from 'react';

export default function ProfilePage() {
    const { user, userProfile, refreshUserProfile } = useAuth();
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshUserProfile();
        setIsRefreshing(false);
    }

    if (!user) {
        return (
            <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                <Sidebar />
                <div className="flex flex-col">
                    <Header />
                    <main className="flex flex-1 items-center justify-center animate-fade-in">
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
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-fade-in">
            <div className="grid w-full max-w-6xl gap-2">
                <h1 className="text-3xl font-semibold">Profile</h1>
            </div>
            <div className="grid w-full max-w-6xl items-start gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>Your Profile</CardTitle>
                            <CardDescription>Update your personal information and profile picture.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh Profile
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={userProfile?.photoURL ?? user.photoURL ?? ''} />
                                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <Button variant="outline" disabled>Change Photo (Coming Soon)</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" defaultValue={userProfile?.displayName ?? user.displayName ?? ''} placeholder="Your Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" defaultValue={user.email ?? ''} readOnly />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="plan">Current Plan</Label>
                                    <Input id="plan" defaultValue={userProfile?.planId ?? 'Free'} readOnly />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button disabled>Save (Coming Soon)</Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
      </div>
    </div>
  );
}
