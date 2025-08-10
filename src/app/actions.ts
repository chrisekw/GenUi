
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

async function publishComponentToDb(item: Omit<GalleryItem, 'id'> & { authorId: string }) {
    if (!db) {
        console.error('Firestore is not initialized.');
        throw new Error('Database not available.');
    }
    const { code, ...remainingItem } = item;
    const componentsCollection = db.collection('components');
    
    // Create the main component document without the code
    const newComponentRef = await componentsCollection.add({
      ...remainingItem,
      likes: 0,
      copies: 0,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Store the code in a subcollection
    await newComponentRef.collection('source').doc('code').set({
        value: code,
    });
    
    return { success: true, id: newComponentRef.id };
}


export async function handlePublishComponent(item: Omit<GalleryItem, 'id'> & { authorId: string }) {
    const result = await publishComponentToDb(item);
    revalidatePath('/community');
    revalidatePath('/');
    return result;
}

async function getComponentCode(componentId: string): Promise<string> {
    if (!db) {
        console.error('Firestore is not initialized.');
        return '';
    }
    try {
        const codeDoc = await db.collection('components').doc(componentId).collection('source').doc('code').get();
        if (codeDoc.exists) {
            return codeDoc.data()?.value || '';
        }
        return '';
    } catch (error) {
        console.error(`Error fetching code for component ${componentId}:`, error);
        return '';
    }
}

export async function getGalleryItems() {
    if (!db) {
        console.error('Firestore is not initialized, returning empty gallery.');
        return [];
    }
    const snapshot = await db.collection('components').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    const items: GalleryItem[] = await Promise.all(snapshot.docs.map(async (doc) => {
        const code = await getComponentCode(doc.id);
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            description: data.description,
            prompt: data.prompt,
            code: code,
            category: data.category,
            authorId: data.authorId,
            likes: data.likes || 0,
            copies: data.copies || 0,
        };
    }));
    return items;
}

export async function handleLikeComponent(componentId: string) {
    if (!db) {
        console.error('Firestore is not initialized.');
        throw new Error('Database not available.');
    }
    const componentRef = db.collection('components').doc(componentId);
    await componentRef.update({
        likes: FieldValue.increment(1)
    });
    revalidatePath('/community');
}

export async function handleCopyComponent(componentId: string) {
    if (!db) {
        console.error('Firestore is not initialized.');
        throw new Error('Database not available.');
    }
    const componentRef = db.collection('components').doc(componentId);
    await componentRef.update({
        copies: FieldValue.increment(1)
    });
    revalidatePath('/community');
}
