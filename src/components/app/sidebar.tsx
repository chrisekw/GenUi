
'use client';

import Link from 'next/link';
import { Home, Users, Settings, LogOut, VenetianMask, User, Heart, DollarSign } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '../icons/logo';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/community', icon: Users, label: 'Community' },
    { href: '/pricing', icon: DollarSign, label: 'Pricing' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="hidden border-r bg-background md:flex md:flex-col fixed top-0 left-0 h-full w-[220px] lg:w-[280px] z-30">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <Logo />
                <span className="">GenoUI</span>
            </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href;
                    return (
                    <Link
                        key={label}
                        href={href}
                        className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                        isActive && 'bg-muted text-primary'
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </Link>
                    );
                })}
                 {user && (
                    <Link
                        href="/my-components"
                        className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                        pathname === '/my-components' && 'bg-muted text-primary'
                        )}
                    >
                        <Heart className="h-4 w-4" />
                        My Components
                    </Link>
                 )}
            </nav>
        </div>
        <div className="mt-auto p-4 border-t">
            <div className="grid gap-4 pt-4">
                <Link
                    href="/settings"
                    className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary', pathname.startsWith('/settings') && 'bg-muted text-primary')}
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </Link>
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="justify-start gap-3 px-3 w-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.photoURL ?? ''} />
                                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start overflow-hidden">
                                    <span className="text-sm font-medium truncate">{user.displayName || user.email}</span>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                               <Link href="/settings/profile">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button asChild>
                        <Link href="/login">
                            <VenetianMask className="mr-2 h-4 w-4" />
                            Sign In
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    </aside>
  );
}
