
'use server';

import { generateUiComponent, GenerateUiComponentInput } from '@/ai/flows/generate-ui-component';
import { optimizeComponentLayout } from '@/ai/flows/optimize-component-layout';
import { cloneUrl, CloneUrlInput } from '@/ai/flows/clone-url-flow';
import { enhancePrompt } from '@/ai/flows/enhance-prompt-flow';
import { replaceImagePlaceholders } from '@/ai/flows/replace-image-placeholders-flow';
import { db } from '@/lib/firebase';
import type { GalleryItem } from '@/lib/gallery-items';
import type { PlanId, UserProfile } from '@/lib/user-profile';
import { revalidatePath } from 'next/cache';
import { collection, query, orderBy, limit, getDocs, DocumentData, doc, getDoc, writeBatch, where, runTransaction, updateDoc } from 'firebase/firestore';


export async function handleGenerateComponent(
  input: GenerateUiComponentInput,
  userId: string
) {
  if (!userId) {
    throw new Error("You must be logged in to generate components.");
  }
  try {
    const componentResult = await generateUiComponent(input);
    let layoutSuggestions = "Could not generate suggestions.";

    try {
        const layoutResult = await optimizeComponentLayout({ componentPrompt: input.prompt, framework: input.framework as 'html' });
        layoutSuggestions = layoutResult.layoutSuggestions;
    } catch (layoutError) {
        console.error('Error in layout optimization flow:', layoutError);
        // Don't rethrow, just use the default suggestions
    }

    // New step: replace placeholder images
    const imageResult = await replaceImagePlaceholders({ html: componentResult.code });

    return {
      code: imageResult.html,
      suggestions: layoutSuggestions,
    };
  } catch (error: any)
{
    console.error('Error in component generation flow:', error);
    if (error.message.includes('quota')) {
        throw new Error(error.message);
    }
    if (error.message && (error.message.includes('503') || /service unavailable/i.test(error.message))) {
        throw new Error('The AI model is currently overloaded. Please try again in a few moments.');
    }
    if (error.message && /rate limit/i.test(error.message)) {
        throw new Error('You have exceeded your request limit. Please try again later.');
    }
    throw new Error(error.message || 'Failed to generate component.');
  }
}

export async function handleEnhancePrompt(prompt: string) {
    try {
        const result = await enhancePrompt({ prompt });
        return result;
    } catch (error: any) {
        console.error('Error in enhance prompt flow:', error);
        throw new Error('Failed to enhance prompt.');
    }
}

export async function handleCloneUrl(
    input: CloneUrlInput,
    userId: string
) {
    if (!userId) {
        throw new Error("You must be logged in to clone components.");
    }
    try {
        const result = await cloneUrl(input);
        return result;
    } catch (error: any) {
        console.error('Error in clone URL flow:', error);
         if (error.message.includes('quota')) {
            throw new Error(error.message);
        }
        throw new Error('Failed to clone URL.');
    }
}

export async function getCommunityComponents(limit_?: number): Promise<GalleryItem[]> {
    try {
        const componentsCollection = collection(db, 'community_components');
        let q = query(componentsCollection, orderBy('createdAt', 'desc'));

        if (limit_) {
            q = query(q, limit(limit_));
        }

        const componentsSnapshot = await getDocs(q);

        if (componentsSnapshot.empty) {
            return [];
        }

        const items = componentsSnapshot.docs.map(doc => {
            const data = doc.data() as DocumentData;
            // Ensure Firestore Timestamps are converted to JS Dates
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
            return {
                id: doc.id,
                ...data,
                createdAt
            } as GalleryItem;
        });

        revalidatePath('/community');
        revalidatePath('/');
        return items;

    } catch (error) {
        console.error('Error fetching gallery items:', error);
        // Returning an empty array is better than throwing an error for display components
        return [];
    }
}

export async function getUserComponents(userId: string): Promise<GalleryItem[]> {
    if (!userId) return [];

    try {
        const componentsCollection = collection(db, 'community_components');
        const q = query(
            componentsCollection, 
            where('authorId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const componentsSnapshot = await getDocs(q);

        if (componentsSnapshot.empty) {
            return [];
        }
        
        const items = componentsSnapshot.docs.map(doc => {
            const data = doc.data() as DocumentData;
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
            return {
                id: doc.id,
                ...data,
                createdAt
            } as GalleryItem;
        });

        revalidatePath('/my-components');
        return items;

    } catch (error) {
        console.error(`Error fetching components for user ${userId}:`, error);
        return [];
    }
}

export async function getComponentById(id: string): Promise<GalleryItem | null> {
    try {
        const docRef = doc(db, 'community_components', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();

        return {
            id: docSnap.id,
            ...data,
            createdAt,
        } as GalleryItem;

    } catch(e) {
        console.error("Error fetching component", e);
        return null;
    }
}

export async function handleLikeComponent(componentId: string, userId: string): Promise<{ success: boolean, likes?: number }> {
    if (!userId) {
        return { success: false };
    }
    
    const componentRef = doc(db, 'community_components', componentId);
    const likeRef = doc(db, `users/${userId}/likes`, componentId);

    try {
        const newLikes = await runTransaction(db, async (transaction) => {
            const likeDoc = await transaction.get(likeRef);
            const componentDoc = await transaction.get(componentRef);

            if (!componentDoc.exists()) {
                throw "Component does not exist.";
            }

            const currentLikes = componentDoc.data().likes || 0;
            let newLikesCount;

            if (likeDoc.exists()) {
                // User has already liked, so we unlike
                transaction.delete(likeRef);
                newLikesCount = Math.max(0, currentLikes - 1);
            } else {
                // User has not liked, so we like
                transaction.set(likeRef, { createdAt: new Date() });
                newLikesCount = currentLikes + 1;
            }
            
            transaction.update(componentRef, { likes: newLikesCount });
            return newLikesCount;
        });
        
        revalidatePath('/community');
        revalidatePath('/my-components');
        revalidatePath(`/component/${componentId}`);
        return { success: true, likes: newLikes };

    } catch(e) {
        console.error("Error liking component:", e);
        return { success: false };
    }
}


export async function handleCopyComponent(componentId: string) {
     const componentRef = doc(db, 'community_components', componentId);
     try {
        await runTransaction(db, async (transaction) => {
            const componentDoc = await transaction.get(componentRef);
            if (!componentDoc.exists()) {
                throw "Component does not exist.";
            }
            const newCopies = (componentDoc.data().copies || 0) + 1;
            transaction.update(componentRef, { copies: newCopies });
        });
        revalidatePath('/community');
        revalidatePath('/my-components');
        revalidatePath(`/component/${componentId}`);
     } catch(e) {
        console.error("Error tracking copy:", e);
     }
}

interface VerifyPaymentInput {
    transactionId: string;
    userId: string;
    planId: PlanId;
}

export async function verifyPayment(input: VerifyPaymentInput): Promise<{ success: boolean; message: string }> {
    const { transactionId, userId, planId } = input;

    if (!userId || !planId || !transactionId) {
        return { success: false, message: 'Missing required payment information.' };
    }
    
    // IMPORTANT: Replace with your Flutterwave Secret Key from your environment variables
    const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
    
    if (!FLUTTERWAVE_SECRET_KEY) {
        console.error("Flutterwave secret key is not set.");
        return { success: false, message: 'Server configuration error.' };
    }

    try {
        // This is the server-to-server call to Flutterwave to verify the transaction
        const verificationUrl = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`;
        const response = await fetch(verificationUrl, {
            headers: {
                Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Flutterwave API returned status ${response.status}`);
        }

        const result = await response.json();
        
        // Check if the payment was successful and other details match
        if (result.status === 'success' && result.data?.status === 'successful') {
            // Payment is verified, now update the user's account in Firestore
            const userRef = doc(db, 'users', userId);
            
            await updateDoc(userRef, {
                planId: planId,
            });

            revalidatePath('/settings/profile'); // Revalidate user-specific pages
            return { success: true, message: 'Your plan has been successfully upgraded!' };
        } else {
            return { success: false, message: 'Payment verification failed. Please contact support.' };
        }

    } catch(e: any) {
        console.error("Payment verification failed:", e);
        return { success: false, message: `An error occurred during verification: ${e.message}` };
    }
}
