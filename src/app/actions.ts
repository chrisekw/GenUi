
'use server';

import { generateUiComponent, GenerateUiComponentInput } from '@/ai/flows/generate-ui-component';
import { optimizeComponentLayout } from '@/ai/flows/optimize-component-layout';
import { cloneUrl, CloneUrlInput } from '@/ai/flows/clone-url-flow';
import { getDb } from '@/lib/firebase-admin';
import type { GalleryItem } from '@/lib/gallery-items';
import { auth } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

export async function handleGenerateComponent(
  input: GenerateUiComponentInput
) {
  try {
    const componentResult = await generateUiComponent(input);
    let layoutSuggestions = "Could not generate suggestions.";

    try {
        const layoutResult = await optimizeComponentLayout({ componentPrompt: input.prompt, framework: input.framework as 'react' | 'html' });
        layoutSuggestions = layoutResult.layoutSuggestions;
    } catch (layoutError) {
        console.error('Error in layout optimization flow:', layoutError);
        // Don't rethrow, just use the default suggestions
    }

    return {
      code: componentResult.code,
      suggestions: layoutSuggestions,
    };
  } catch (error) {
    console.error('Error in component generation flow:', error);
    throw new Error('Failed to generate component.');
  }
}

export async function handleCloneUrl(
    input: CloneUrlInput
) {
    try {
        const result = await cloneUrl(input);
        return result;
    } catch (error) {
        console.error('Error in clone URL flow:', error);
        throw new Error('Failed to clone URL.');
    }
}

export async function publishComponent(item: Omit<GalleryItem, 'id'>) {
    const db = getDb();
    if (!auth.currentUser) {
        throw new Error("Authentication is required to publish a component.");
    }

    const { code, ...itemData } = item;

    try {
        const docRef = await db.collection('community_components').add({
            ...itemData,
            authorId: auth.currentUser.uid,
            authorName: auth.currentUser.displayName,
            authorImage: auth.currentUser.photoURL,
            likes: 0,
            copies: 0,
            createdAt: new Date(),
        });
        
        // Add code to a subcollection
        await docRef.collection('source').doc('code').set({ code });

        revalidatePath('/community');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error publishing component to Firestore: ", error);
        throw new Error("Failed to publish component.");
    }
}

export async function getCommunityComponents(): Promise<GalleryItem[]> {
    try {
        const db = getDb();
        const componentsSnapshot = await db.collection('community_components').orderBy('createdAt', 'desc').limit(20).get();
        
        if (componentsSnapshot.empty) {
            return [];
        }

        const items = componentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as GalleryItem));

        return items;

    } catch (error) {
        console.error('Error fetching gallery items:', error);
        return [];
    }
}
