

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, LogOut, Home, Users, Settings } from 'lucide-react';
import { Logo } from '../icons/logo';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export function Header() {
    const isMobile = useIsMobile();
    const { user, signOut } = useAuth();

    const renderUserMenu = () => {
        if (!user) {
            return (
                <Button asChild>
                    <Link href="/login">Sign In</Link>
                </Button>
            );
        }
        return (
            <div className="flex items-center gap-4">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        )
    };

    if (!isMobile) {
        return (
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                <div className="w-full flex-1">
                    {/* Optional: Add a search bar or other header content here */}
                </div>
                {renderUserMenu()}
            </header>
        );
    }
    
    return (
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <Logo />
                <span className="">GenUI</span>
            </Link>
            
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                    <nav className="grid gap-2 text-lg font-medium">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-lg font-semibold"
                        >
                            <Logo />
                            <span className="sr-only">GenUI</span>
                        </Link>
                        <Link
                            href="/"
                            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                        >
                            <Home className="h-5 w-5" />
                            Home
                        </Link>
                        <Link
                            href="/community"
                            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                        >
                            <Users className="h-5 w-5" />
                            Community
                        </Link>
                        <Link
                            href="/settings"
                            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                        >
                            <Settings className="h-5 w-5" />
                            Settings
                        </Link>
                    </nav>
                    <div className="mt-auto">
                       {renderUserMenu()}
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}
