
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, Home, Users, Settings } from 'lucide-react';
import { Logo } from '../icons/logo';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
    const { user } = useAuth();
    return (
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
             {/* Mobile Header */}
            <div className="flex w-full items-center justify-between lg:hidden">
                 <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Logo />
                    <span className="">GenoUI</span>
                </Link>
                <div className="flex items-center gap-2">
                    { !user && (
                        <Button asChild size="sm">
                            <Link href="/login">Sign In</Link>
                        </Button>
                    )}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                             <SheetHeader>
                                <SheetTitle className="sr-only">Menu</SheetTitle>
                                <SheetDescription className="sr-only">Main navigation menu for the application.</SheetDescription>
                            </SheetHeader>
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link
                                    href="/"
                                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                                >
                                    <Logo />
                                    <span>GenoUI</span>
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
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            
            {/* Desktop Header */}
            <div className="hidden w-full items-center justify-end lg:flex">
                { !user && (
                    <Button asChild>
                        <Link href="/login">Sign In</Link>
                    </Button>
                )}
            </div>
        </header>
    );
}
