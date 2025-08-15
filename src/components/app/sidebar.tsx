
'use client';

import Link from 'next/link';
import { Home, Users, Settings, LogOut, VenetianMask, User, Heart, DollarSign, Shield } from 'lucide-react';
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
    { href: '/my-components', icon: Heart, label: 'My Components' },
    { href: '/pricing', icon: DollarSign, label: 'Pricing' },
    { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, userProfile } = useAuth();

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Logo />
            <span className="">GenoUI</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
             {navItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href || (href.startsWith('/settings') && pathname.startsWith('/settings'));
                if (label === 'My Components' && !user) return null;
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
              {userProfile?.isAdmin && (
                 <Link
                    href="/admin/dashboard"
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                      pathname.startsWith('/admin') && 'bg-muted text-primary'
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
              )}
          </nav>
        </div>
        <div className="mt-auto p-4">
            <div className="pb-4 space-y-4">
              <a target="_blank" rel="noopener noreferrer" href="https://saaswheel.com"><img style={{height: '54px'}} height="54" src="https://saaswheel.com/assets/images/badge.png" alt="SaaS Wheel" /></a>
              <a href="https://findly.tools/genoui?utm_source=genoui" target="_blank">
                <img 
                  src="https://findly.tools/badges/findly-tools-badge-light.svg" 
                  alt="Featured on findly.tools" 
                  width="150" 
                />
              </a>
            </div>
           {user ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-2">
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
                            <p className="text-xs leading-none text-muted-foreground truncate">
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
                    <DropdownMenuItem onClick={() => useAuth().signOut()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
           ) : (
                <Button asChild>
                    <Link href="/login">
                        <VenetianMask className="mr-2 h-4 w-4"/>
                        Sign In
                    </Link>
                </Button>
           )}
        </div>
      </div>
    </div>
  );
}
