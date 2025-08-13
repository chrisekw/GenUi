
'use client';

import Link from 'next/link';
import { Home, Users, Settings, LogOut, VenetianMask, User, Heart, DollarSign, Briefcase, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '../icons/logo';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/community', icon: Users, label: 'Community' },
    { href: '/pricing', icon: DollarSign, label: 'Pricing' },
];

const secondaryNavItems = [
    { href: '/settings', icon: Settings, label: 'General' },
    { href: '/my-components', icon: Heart, label: 'My Components' },
    { href: '#', icon: Briefcase, label: 'Billing' },
    { href: '#', icon: FileText, label: 'Invoices' },
];


export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-full z-30">
      {/* Thin Icon-only Sidebar */}
      <div className="flex h-full w-16 flex-col justify-between border-e bg-background">
        <div>
          <div className="inline-flex size-16 items-center justify-center">
            <Link href="/" className="grid size-10 place-content-center rounded-lg bg-muted text-xs text-muted-foreground">
              <Logo className="h-6 w-6"/>
            </Link>
          </div>

          <div className="border-t">
            <div className="px-2">
              <ul className="space-y-1 pt-4">
                 <TooltipProvider>
                  {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href;
                    return (
                       <Tooltip key={label}>
                        <TooltipTrigger asChild>
                           <li>
                            <Link
                              href={href}
                              className={cn(
                                'group relative flex justify-center rounded-sm px-2 py-1.5',
                                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              )}
                            >
                              <Icon className="size-5 opacity-75" />
                              <span
                                className="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded-sm bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible"
                              >
                                {label}
                              </span>
                            </Link>
                          </li>
                        </TooltipTrigger>
                         <TooltipContent side="right">
                          <p>{label}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                 </TooltipProvider>
              </ul>
            </div>
          </div>
        </div>

        <div className="sticky inset-x-0 bottom-0 border-t p-2">
            {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="group relative flex w-full justify-center rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL ?? ''} />
                            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" side="right" forceMount>
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
                         <DropdownMenuItem asChild>
                            <Link href="/my-components">
                                <Heart className="mr-2 h-4 w-4" />
                                <span>My Components</span>
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
                <Link href="/login" className="group relative flex w-full justify-center rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                    <LogOut className="size-5 opacity-75" />
                </Link>
            )}
        </div>
      </div>

      {/* Expanded Sidebar */}
      <div className="flex h-screen w-56 flex-col justify-between border-e bg-background">
        <div className="px-4 py-6">
           <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                <Logo />
                <span className="">GenoUI</span>
            </Link>

          <ul className="mt-6 space-y-1">
             {navItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href;
                return (
                  <li key={label}>
                    <Link
                      href={href}
                      className={cn(
                        'block rounded-lg px-4 py-2 text-sm font-medium',
                        isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                     {label}
                    </Link>
                  </li>
                );
              })}

            <li>
              <details className="group [&_summary::-webkit-details-marker]:hidden">
                <summary
                  className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <span className="text-sm font-medium"> Account </span>

                  <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </summary>

                <ul className="mt-2 space-y-1 px-4">
                  <li>
                    <Link
                      href="/settings/profile"
                      className="block rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      Profile
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/settings"
                      className="block rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      Settings
                    </Link>
                  </li>

                  <li>
                    <button
                      onClick={signOut}
                      className="w-full rounded-lg px-4 py-2 [text-align:_inherit] text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </div>

         {user && (
            <div className="sticky inset-x-0 bottom-0 border-t p-4">
                <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL ?? ''} />
                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            </div>
         )}
      </div>
    </aside>
  );
}
