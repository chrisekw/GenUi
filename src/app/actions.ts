
'use server';

import { generateUiComponent, GenerateUiComponentInput } from '@/ai/flows/generate-ui-component';
import { optimizeComponentLayout } from '@/ai/flows/optimize-component-layout';
import { cloneUrl, CloneUrlInput } from '@/ai/flows/clone-url-flow';
import { getDb } from '@/lib/firebase-admin';
import type { GalleryItem } from '@/lib/gallery-items';
import { auth } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import admin from 'firebase-admin';
import createDOMPurify from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';

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
  } catch (error: any) {
    console.error('Error in component generation flow:', error);
    throw new Error(error.message || 'Failed to generate component.');
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

const getIframeSrcDoc = (code: string, framework: 'react' | 'html') => {
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
        background-color: transparent;
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

    if (framework === 'react') {
        const cleanedCode = code
            .replace(/^import\\s.*?;/gm, '')
            .replace(/export\\s+default\\s+\\w+;?/m, '')
            .replace(/export\\s+(const|function)\\s+(\\w+)/, 'const $2 = ');
        const componentNameMatch = code.match(/export\\s+(?:default\\s+)?(?:function|const)\\s+([A-Z]\\w*)/);
        const componentName = componentNameMatch ? componentNameMatch[1] : 'Component';

      return `
        <!DOCTYPE html>
        <html>
          <head>
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <style>
            ${baseStyles}
            </style>
          </head>
          <body class="dark">
            <div id="root"></div>
            <script type="text/babel">
              ${cleanedCode}
              const ComponentToRender = ${componentName};
              ReactDOM.render(<ComponentToRender />, document.getElementById('root'));
            </script>
          </body>
        </html>
      `;
    }

    // HTML
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>${baseStyles}</style>
        </head>
        <body class="dark">
          ${code}
        </body>
      </html>
    `;
  };

export async function publishComponent(item: Omit<GalleryItem, 'id' | 'previewHtml'> & { framework: 'react' | 'html' }) {
    const db = await getDb();
    if (!auth.currentUser) {
        throw new Error("Authentication is required to publish a component.");
    }
     if (!item || !item.name || !item.code) {
      throw new Error("Invalid component data");
    }

    const { code, framework, ...itemData } = item;

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
            authorId: auth.currentUser.uid,
            authorName: auth.currentUser.displayName,
            authorImage: auth.currentUser.photoURL,
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
