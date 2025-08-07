'use server';

import { generateUiComponent, GenerateUiComponentInput } from '@/ai/flows/generate-ui-component';
import { optimizeComponentLayout } from '@/ai/flows/optimize-component-layout';
import { cloneUrl, CloneUrlInput } from '@/ai/flows/clone-url-flow';
import { galleryItems, type GalleryItem } from '@/lib/gallery-items';

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

export async function handlePublishComponent(item: Omit<GalleryItem, 'image' | 'data-ai-hint'>) {
    const newItem: GalleryItem = {
      ...item,
      image: `https://placehold.co/600x400.png`,
      'data-ai-hint': 'abstract component'
    };
    galleryItems.unshift(newItem);
    return { success: true };
}

export async function getGalleryItems() {
    return galleryItems;
}
