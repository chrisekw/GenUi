
import { Header } from '@/components/app/header';
import { Sidebar } from '@/components/app/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, User, Palette, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-fade-in">
          <div className="grid w-full max-w-6xl gap-2">
            <h1 className="text-3xl font-semibold">Settings</h1>
            <p className="text-muted-foreground">Manage your account and app settings.</p>
          </div>
          <div className="grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
            <nav className="grid gap-4 text-sm text-muted-foreground">
              <Link href="/settings/profile" className="font-semibold text-primary flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link href="#" className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Account
              </Link>
              <Link href="#" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </Link>
              <Link href="#" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </Link>
            </nav>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Update your personal information here.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Enter your full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter your email" readOnly defaultValue="user@example.com" />
                    </div>
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and feel of the app.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select>
                        <SelectTrigger id="theme">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </form>
                </CardContent>
              </Card>
              <Button>Save Changes</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
