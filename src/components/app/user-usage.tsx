
'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import Link from 'next/link';

export function UserUsage() {
    const { userProfile } = useAuth();

    if (!userProfile) {
        return null;
    }

    const { quota } = userProfile;
    const percentage = quota.generationsLimit > 0 ? (quota.generationsUsed / quota.generationsLimit) * 100 : 0;

    return (
        <div className="px-2 py-4 border-t border-border/50">
            <div className="flex justify-between items-center mb-2">
                 <p className="text-xs font-medium text-muted-foreground">Generations</p>
                 <p className="text-xs font-semibold">{quota.generationsUsed} / {quota.generationsLimit}</p>
            </div>
            <Progress value={percentage} className="h-2" />
            {percentage >= 100 && (
                <Button asChild size="sm" className="w-full mt-4">
                    <Link href="/pricing">Upgrade Plan</Link>
                </Button>
            )}
        </div>
    )
}
