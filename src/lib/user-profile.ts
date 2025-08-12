
export type PlanId = 'free' | 'pro' | 'studio' | 'enterprise';

export interface UserProfile {
    uid: string;
    email: string;
    planId: PlanId;
    displayName?: string;
    photoURL?: string;
}
