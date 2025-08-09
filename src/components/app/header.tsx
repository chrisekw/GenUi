
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTrigger,
    SheetTitle
} from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';
import { Logo } from '../icons/logo';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

export function Header() {
    const [isSidebarOpen, setSidebarOpen] = React.useState(false);
    const isMobile = useIsMobile();
    const { user, signOut } = useAuth();

    const renderAuthArea = () => {
        if (user) {
            return (
                <div className="flex items-center gap-4">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Button variant="ghost" size="icon" onClick={signOut}>
                        <LogOut />
                    </Button>
                </div>
            )
        }
        return (
             <Button asChild>
                <Link href="/login">Sign In</Link>
            </Button>
        )
    }

    if (isMobile) {
        return (
            <header className="flex h-16 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <Logo />
                    <h1 className="text-xl font-semibold">GenUi</h1>
                </div>

                <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full max-w-xs">
                        <SheetHeader>
                            <SheetTitle>
                                <div className="flex items-center gap-2 py-4">
                                    <Logo />
                                    <span className="text-xl font-semibold">GenUI</span>
                                </div>
                            </SheetTitle>
                        </SheetHeader>
                        <nav className="flex flex-col gap-2">
                           {renderAuthArea()}
                        </nav>
                    </SheetContent>
                </Sheet>
            </header>
        );
    }

    return (
        <header className="flex h-16 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <Logo />
                <h1 className="text-xl font-semibold">GenUi</h1>
            </div>

            <div className="flex items-center gap-4">
                {renderAuthArea()}
            </div>
        </header>
    );
}
