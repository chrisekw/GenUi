
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
import { Menu } from 'lucide-react';
import { Logo } from '../icons/logo';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function Header() {
    const [isSidebarOpen, setSidebarOpen] = React.useState(false);
    const isMobile = useIsMobile();

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
                            {/* Add mobile navigation items here */}
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
                <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
