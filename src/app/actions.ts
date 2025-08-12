
'use server';

import { generateUiComponent, GenerateUiComponentInput } from '@/ai/flows/generate-ui-component';
import { optimizeComponentLayout } from '@/ai/flows/optimize-component-layout';
import { cloneUrl, CloneUrlInput } from '@/ai/flows/clone-url-flow';
import { enhancePrompt } from '@/ai/flows/enhance-prompt-flow';
import { replaceImagePlaceholders } from '@/ai/flows/replace-image-placeholders-flow';
import { db } from '@/lib/firebase';
import type { GalleryItem } from '@/lib/gallery-items';
import { revalidatePath } from 'next/cache';
import { collection, query, orderBy, limit, getDocs, DocumentData, doc, getDoc, increment, writeBatch, where } from 'firebase/firestore';


export async function handleGenerateComponent(
  input: GenerateUiComponentInput
) {
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
    input: CloneUrlInput
) {
    try {
        const result = await cloneUrl(input);
        return result;
    } catch (error: any) {
        console.error('Error in clone URL flow:', error);
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
        const batch = writeBatch(db);
        const likeDoc = await getDoc(likeRef);

        if (likeDoc.exists()) {
            // User has already liked, so we unlike
            batch.update(componentRef, { likes: increment(-1) });
            batch.delete(likeRef);
        } else {
            // User has not liked, so we like
            batch.update(componentRef, { likes: increment(1) });
            batch.set(likeRef, { createdAt: new Date() });
        }

        await batch.commit();
        
        // Fetch the updated document to return the new like count
        const updatedDoc = await getDoc(componentRef);
        const newLikes = updatedDoc.data()?.likes || 0;

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
        await writeBatch(db).update(componentRef, { copies: increment(1) }).commit();
        revalidatePath('/community');
        revalidatePath('/my-components');
        revalidatePath(`/component/${componentId}`);
     } catch(e) {
        console.error("Error tracking copy:", e);
     }
}
