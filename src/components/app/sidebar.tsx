
'use client';

import Link from 'next/link';
import { Home, Users, Settings, PanelLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '../icons/logo';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import * as React from 'react';

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/community', icon: Users, label: 'Community' },
    { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
        {/* Desktop Sidebar */}
        <aside className={cn("hidden md:flex md:flex-col border-r bg-background transition-all", isCollapsed ? "w-16" : "w-[280px]")}>
            <div className="flex h-14 items-center border-b p-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Logo />
                    {!isCollapsed && <span className="">GenUI</span>}
                </Link>
            </div>
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    <TooltipProvider>
                    {navItems.map(({ href, icon: Icon, label }) => {
                        const isActive = pathname === href;
                        return (
                        <Tooltip key={label}>
                            <TooltipTrigger asChild>
                            <Link
                                href={href}
                                className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                isActive && 'bg-muted text-primary'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {!isCollapsed && label}
                            </Link>
                            </TooltipTrigger>
                            {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
                        </Tooltip>
                        );
                    })}
                    </TooltipProvider>
                </nav>
            </div>
            <div className="mt-auto p-4">
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                    <PanelLeft className="h-5 w-5" />
                </Button>
            </div>
        </aside>

        {/* Mobile Sidebar */}
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden fixed bottom-4 right-4 z-50">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
            <nav className="grid gap-2 text-lg font-medium">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                    <Logo />
                    <span>GenUI</span>
                </Link>
                 {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={label}
                            href={href}
                            className={cn(
                            'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                            isActive && 'bg-muted text-foreground'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {label}
                        </Link>
                    );
                })}
            </nav>
            </SheetContent>
        </Sheet>
    </>
  );
}
