'use server';

import { generateUiComponent } from '@/ai/flows/generate-ui-component';
import { optimizeComponentLayout } from '@/ai/flows/optimize-component-layout';

export async function handleGenerateComponent(
  prompt: string,
  framework: 'react' | 'vue' | 'html'
) {
  try {
    const [componentResult, layoutResult] = await Promise.all([
      generateUiComponent({ prompt, framework }),
      optimizeComponentLayout({ componentPrompt: prompt, framework }),
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
