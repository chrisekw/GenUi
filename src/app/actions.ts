
'use server';

import { generateUiComponent, GenerateUiComponentInput } from '@/ai/flows/generate-ui-component';
import { optimizeComponentLayout } from '@/ai/flows/optimize-component-layout';
import { cloneUrl, CloneUrlInput } from '@/ai/flows/clone-url-flow';
import { enhancePrompt } from '@/ai/flows/enhance-prompt-flow';
import { db } from '@/lib/firebase';
import type { GalleryItem, GalleryItemCreate } from '@/lib/gallery-items';
import { revalidatePath } from 'next/cache';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, DocumentData } from 'firebase/firestore';
import createDOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';


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

const getIframeSrcDoc = (code: string, framework: 'html' | 'tailwindcss') => {
    const baseStyles = `
      :root {
        --background: 0 0% 100%;
        --foreground: 240 10% 3.9%;
        --card: 0 0% 100%;
        --card-foreground: 240 10% 3.9%;
        --popover: 0 0% 100%;
        --popover-foreground: 240 10% 3.9%;
        --primary: 240 5.9% 10%;
        --primary-foreground: 0 0% 98%;
        --secondary: 240 4.8% 95.9%;
        --secondary-foreground: 240 5.9% 10%;
        --muted: 240 4.8% 95.9%;
        --muted-foreground: 240 3.8% 46.1%;
        --accent: 240 4.8% 95.9%;
        --accent-foreground: 240 5.9% 10%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 0 0% 98%;
        --border: 240 5.9% 90%;
        --input: 240 5.9% 90%;
        --ring: 240 5.9% 10%;
        --radius: 0.5rem;
      }
      .dark {
        --background: 240 6% 10%;
        --foreground: 0 0% 98%;
        --card: 240 6% 10%;
        --card-foreground: 0 0% 98%;
        --popover: 240 6% 10%;
        --popover-foreground: 0 0% 98%;
        --primary: 0 0% 98%;
        --primary-foreground: 240 5.9% 10%;
        --secondary: 240 3.7% 15.9%;
        --secondary-foreground: 0 0% 98%;
        --muted: 240 3.7% 15.9%;
        --muted-foreground: 240 5% 64.9%;
        --accent: 240 3.7% 15.9%;
        --accent-foreground: 0 0% 98%;
        --destructive: 0 62.8% 30.6%;
        --destructive-foreground: 0 0% 98%;
        --border: 240 3.7% 15.9%;
        --input: 240 3.7% 15.9%;
        --ring: 240 4.9% 83.9%;
      }
      body {
        background-color: hsl(var(--background));
        color: hsl(var(--foreground));
        font-family: Inter, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        min-height: 100vh;
        padding: 1rem;
        box-sizing: border-box;
      }
    `;
    const bodyClass = ''; // This is server-side, cannot access document.body

    // HTML or Tailwind CSS
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>${baseStyles}</style>
        </head>
        <body class="${bodyClass}">
          ${code}
        </body>
      </html>
    `;
  };

// This server action is now responsible for generating the sanitized HTML preview,
// which is a server-side task, but the actual DB write is done on the client.
export async function createAndSanitizePreview(code: string, framework: 'html' | 'tailwindcss') {
    if (!code || !framework) {
        throw new Error("Invalid component data for preview generation");
    }
    // Sanitize preview HTML
    let previewHtml = getIframeSrcDoc(code, framework);
    const window = new JSDOM('').window;
    const DOMPurify = createDOMPurify(window as any);
    previewHtml = DOMPurify.sanitize(previewHtml);

    return { previewHtml };
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
