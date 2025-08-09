'use server';

import { generateUiComponent, GenerateUiComponentInput } from '@/ai/flows/generate-ui-component';
import { optimizeComponentLayout } from '@/ai/flows/optimize-component-layout';
import { cloneUrl, CloneUrlInput } from '@/ai/flows/clone-url-flow';
import { type GalleryItem } from '@/lib/gallery-items';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export async function handleGenerateComponent(
  input: GenerateUiComponentInput
) {
  try {
    const componentResult = await generateUiComponent(input);
    let layoutSuggestions = "Could not generate suggestions.";

    try {
        const layoutResult = await optimizeComponentLayout({ componentPrompt: input.prompt, framework: input.framework });
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

export async function handlePublishComponent(item: Omit<GalleryItem, 'image' | 'data-ai-hint' | 'id'> & { authorId: string }) {
    const newComponent = {
      ...item,
      likes: 0,
      copies: 0,
      createdAt: FieldValue.serverTimestamp(),
    };
    await db.collection('components').add(newComponent);
    revalidatePath('/community');
    revalidatePath('/');
    return { success: true };
}

export async function getGalleryItems() {
    const snapshot = await db.collection('components').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    const items: GalleryItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as GalleryItem));
    return items;
}

export async function handleLikeComponent(componentId: string) {
    const componentRef = db.collection('components').doc(componentId);
    await componentRef.update({
        likes: FieldValue.increment(1)
    });
    revalidatePath('/community');
}

export async function handleCopyComponent(componentId: string) {
    const componentRef = db.collection('components').doc(componentId);
    await componentRef.update({
        copies: FieldValue.increment(1)
    });
    revalidatePath('/community');
}
