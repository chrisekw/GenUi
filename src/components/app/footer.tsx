
'use client';

import Link from 'next/link';
import { Logo } from '../icons/logo';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/50 bg-muted/40">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
                <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
                    <Logo />
                    <span className="">GenoUI</span>
                </Link>
                <span className="hidden sm:inline-block">© {new Date().getFullYear()} All rights reserved.</span>
            </div>

            <div className="flex items-center gap-4">
                <a href="https://findly.tools/genoui?utm_source=genoui" target="_blank">
                    <img 
                        src="https://findly.tools/badges/findly-tools-badge-light.svg" 
                        alt="Featured on findly.tools" 
                        width="150" 
                    />
                </a>
                 <a target="_blank" rel="noopener noreferrer" href="https://saaswheel.com"><img style={{height: '54px'}} height="54" src="https://saaswheel.com/assets/images/badge.png" alt="SaaS Wheel" /></a>
            </div>
            <span className="sm:hidden text-sm text-muted-foreground">© {new Date().getFullYear()} All rights reserved.</span>
        </div>
    </footer>
  );
}
