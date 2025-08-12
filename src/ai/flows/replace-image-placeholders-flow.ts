
'use server';

/**
 * @fileOverview An AI flow to replace placeholder images in HTML with generated images.
 *
 * - replaceImagePlaceholders - A function that finds images with `data-ai-hint` and replaces their `src` with a generated image.
 * - ReplaceImagePlaceholdersInput - The input type for the function.
 * - ReplaceImagePlaceholdersOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {JSDOM} from 'jsdom';

const ReplaceImagePlaceholdersInputSchema = z.object({
  html: z.string().describe('The HTML content to process.'),
});
export type ReplaceImagePlaceholdersInput = z.infer<
  typeof ReplaceImagePlaceholdersInputSchema
>;

const ReplaceImagePlaceholdersOutputSchema = z.object({
  html: z.string().describe('The updated HTML with generated images.'),
});
export type ReplaceImagePlaceholdersOutput = z.infer<
  typeof ReplaceImagePlaceholdersOutputSchema
>;

export async function replaceImagePlaceholders(
  input: ReplaceImagePlaceholdersInput
): Promise<ReplaceImagePlaceholdersOutput> {
  return replaceImagePlaceholdersFlow(input);
}

const replaceImagePlaceholdersFlow = ai.defineFlow(
  {
    name: 'replaceImagePlaceholdersFlow',
    inputSchema: ReplaceImagePlaceholdersInputSchema,
    outputSchema: ReplaceImagePlaceholdersOutputSchema,
  },
  async ({html}) => {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const images = Array.from(document.querySelectorAll('img[data-ai-hint]'));

    if (images.length === 0) {
      return {html};
    }

    const imagePromises = images.map(async img => {
      const hint = img.getAttribute('data-ai-hint');
      if (!hint) return;

      try {
        const {media} = await ai.generate({
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: `Generate a photorealistic image of: ${hint}. Ensure the image is modern, professional, and fits a high-end web design aesthetic.`,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });
        if (media.url) {
          img.setAttribute('src', media.url);
        }
      } catch (e) {
        console.error(`Failed to generate image for hint: "${hint}"`, e);
      }
    });

    await Promise.all(imagePromises);

    return {html: dom.serialize()};
  }
);
