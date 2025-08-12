
export type PlanId = 'free' | 'pro' | 'studio' | 'enterprise';

export interface UserUsage {
    generationsUsed: number;
    generationsLimit: number;
    lastReset: Date;
}

export interface UserProfile {
    uid: string;
    email: string;
    planId: PlanId;
    quota: UserUsage;
    displayName?: string;
    photoURL?: string;
}
