
'use server';

import { generateUiComponent, GenerateUiComponentInput } from '@/ai/flows/generate-ui-component';
import { optimizeComponentLayout } from '@/ai/flows/optimize-component-layout';
import { cloneUrl, CloneUrlInput } from '@/ai/flows/clone-url-flow';
import { enhancePrompt } from '@/ai/flows/enhance-prompt-flow';
import { db } from '@/lib/firebase';
import type { GalleryItem } from '@/lib/gallery-items';
import { revalidatePath } from 'next/cache';
import { collection, query, orderBy, limit, getDocs, DocumentData } from 'firebase/firestore';


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

    return {
      code: componentResult.code,
      suggestions: layoutSuggestions,
    };
  } catch (error: any)
{
    console.error('Error in component generation flow:', error);
    if (error.message && (error.message.includes('503') || /service unavailable/i.test(error.message))) {
        throw new Error('The AI model is currently overloaded. Please try again in a few moments.');
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
