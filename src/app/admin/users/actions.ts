
'use server';

import { db } from '@/lib/firebase';
import type { UserProfile, PlanId } from '@/lib/user-profile';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// This is a simplified admin action file. In a real app, you'd have robust permission checks.
// For example, you would verify that the caller is an admin before performing any action.

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);

    if (usersSnapshot.empty) {
      return [];
    }

    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        ...data,
      } as UserProfile;
    });

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users.');
  }
}

interface UpdateUserPlanInput {
    uid: string;
    planId: PlanId;
}

export async function updateUserPlan({ uid, planId }: UpdateUserPlanInput): Promise<{ success: boolean }> {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { planId });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error updating user plan:', error);
        return { success: false };
    }
}


export async function deleteUser(uid: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Note: This only deletes the Firestore user document.
    // To fully delete a user, you must also delete them from Firebase Authentication.
    // This requires the Firebase Admin SDK and should be handled in a secure backend environment (e.g., a Cloud Function).
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
    
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Failed to delete user document.' };
  }
}
