'use server';

import { generateUiComponent, GenerateUiComponentInput } from '@/ai/flows/generate-ui-component';
import { optimizeComponentLayout } from '@/ai/flows/optimize-component-layout';
import { galleryItems, type GalleryItem } from '@/lib/gallery-items';

export async function handleGenerateComponent(
  input: GenerateUiComponentInput
) {
  try {
    const [componentResult, layoutResult] = await Promise.all([
      generateUiComponent(input),
      optimizeComponentLayout({ componentPrompt: input.prompt, framework: input.framework }),
    ]);

    return {
      code: componentResult.code,
      suggestions: layoutResult.layoutSuggestions,
    };
  } catch (error) {
    console.error('Error in AI generation flows:', error);
    throw new Error('Failed to generate component and suggestions.');
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
