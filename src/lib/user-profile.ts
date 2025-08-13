

export type PlanId = 'Free' | 'Pro' | 'Studio' | 'Enterprise';

export interface UserProfile {
    uid: string;
    email: string;
    planId: PlanId;
    displayName?: string | null;
    photoURL?: string | null;
}
