
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, Home, Users, Settings, LogOut, VenetianMask, User } from 'lucide-react';
import { Logo } from '../icons/logo';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/community', icon: Users, label: 'Community' },
];

export function Header() {
    const { user, signOut } = useAuth();
    const pathname = usePathname();

    const mobileNavContent = (
        <div className="flex flex-col h-full">
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
                </nav>
            </div>
            <div className="mt-auto p-4 border-t">
                <div className="grid gap-4">
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
                                <Button variant="ghost" className="justify-start gap-3 px-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.photoURL ?? ''} />
                                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start">
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
        </div>
    );

    return (
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 bg-background/95 backdrop-blur z-20 md:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold md:hidden">
                <Logo />
                <span className="sr-only">GenoUI</span>
            </Link>
            
            <div className="w-full flex-1">
                {/* Can add search or other header elements here */}
            </div>
            
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0">
                        <SheetHeader className="sr-only">
                        <SheetTitle>Navigation Menu</SheetTitle>
                    </SheetHeader>
                    {mobileNavContent}
                </SheetContent>
            </Sheet>

        </header>
    );
}
