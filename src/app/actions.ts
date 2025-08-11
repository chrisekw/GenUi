
'use server';

import { generateUiComponent, GenerateUiComponentInput } from '@/ai/flows/generate-ui-component';
import { optimizeComponentLayout } from '@/ai/flows/optimize-component-layout';
import { cloneUrl, CloneUrlInput } from '@/ai/flows/clone-url-flow';
import { enhancePrompt } from '@/ai/flows/enhance-prompt-flow';
import { getDb } from '@/lib/firebase-admin';
import type { GalleryItem } from '@/lib/gallery-items';
import { revalidatePath } from 'next/cache';
import admin from 'firebase-admin';
import createDOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';
import { auth } from 'genkit';

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
    const bodyClass = document.body.classList.contains('dark') ? 'dark' : '';

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

export async function publishComponent(item: Omit<GalleryItem, 'id' | 'previewHtml'> & { framework: 'html' | 'tailwindcss' }) {
    const db = await getDb();
    
    const currentUser = auth();

    if (!currentUser) {
        throw new Error("Authentication is required to publish a component.");
    }
     if (!item || !item.name || !item.code) {
      throw new Error("Invalid component data");
    }

    const { code, framework, ...itemData } = item;
    const bodyClass = ''; // Simplified for server-side generation

    // Sanitize preview HTML
    let previewHtml = getIframeSrcDoc(code, framework);
    const window = new JSDOM('').window;
    const DOMPurify = createDOMPurify(window as any);
    previewHtml = DOMPurify.sanitize(previewHtml);

    try {
        const docRef = await db.collection('community_components').add({
            ...itemData,
            code, // Save original code
            previewHtml, // Save sanitized preview
            authorId: currentUser.uid,
            authorName: currentUser.name,
            authorImage: currentUser.picture,
            likes: 0,
            copies: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        revalidatePath('/community');
        revalidatePath('/');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("🔥 Database publish error details:", error);
        throw new Error("Failed to publish component.");
    }
}

export async function getCommunityComponents(limit_?: number): Promise<GalleryItem[]> {
    try {
        const db = await getDb();
        let query = db.collection('community_components').orderBy('createdAt', 'desc');
        
        if (limit_) {
            query = query.limit(limit_);
        }

        const componentsSnapshot = await query.get();

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
