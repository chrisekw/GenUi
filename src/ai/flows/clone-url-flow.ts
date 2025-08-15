
'use server';

/**
 * @fileOverview An AI agent to clone UI components from a URL.
 *
 * - cloneUrl - A function that clones a UI component from a given URL.
 * - CloneUrlInput - The input type for the cloneUrl function.
 * - CloneUrlOutput - The return type for the cloneUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CloneUrlInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to clone a component from.'),
  framework: z.enum(['html', 'tailwindcss']).describe('The target framework for the generated code.'),
});
export type CloneUrlInput = z.infer<typeof CloneUrlInputSchema>;

const CloneUrlOutputSchema = z.object({
  code: z.string().describe('The generated code for the cloned UI component.'),
});
export type CloneUrlOutput = z.infer<typeof CloneUrlOutputSchema>;

export async function cloneUrl(input: CloneUrlInput): Promise<CloneUrlOutput> {
  return cloneUrlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cloneUrlPrompt',
  input: {schema: CloneUrlInputSchema},
  output: {schema: CloneUrlOutputSchema},
  prompt: `You are an expert UI/UX designer and frontend developer. Your task is to analyze the design of the provided URL and create a new, improved, and production-ready component that is inspired by it.

You are not just replicating the code. You are re-building the component from scratch using modern best practices, beautiful aesthetics, and clean, maintainable code.

1.  **Analyze**: Understand the DOM structure, layout, typography, and color scheme of the target URL.
2.  **Redesign & Replicate**: Replicate the core design and layout of the component from the URL. Then, improve upon it with a focus on modern design principles. Enhance the visual hierarchy, spacing, and overall aesthetic. The result should be more beautiful and professional than the original, but clearly recognizable.
3.  **Implement**: Generate a single, production-grade component using Tailwind CSS for styling. The code must be clean, responsive, and accessible (including ARIA roles).

The target framework is: {{{framework}}}
URL to clone and improve: {{{url}}}

Respond with the code for the new, improved component, and nothing else. Do not include any comments or explanations.
`,
});

const cloneUrlFlow = ai.defineFlow(
  {
    name: 'cloneUrlFlow',
    inputSchema: CloneUrlInputSchema,
    outputSchema: CloneUrlOutputSchema,
  },
  async input => {
    if (!process.env.BROWSERLESS_API_KEY) {
        return { code: 'Error: This feature is coming soon! The server is not yet configured with the required API keys.' };
    }
    // This flow is currently disabled from the frontend, but we will call the prompt anyway
    // if it's ever triggered, to avoid unhandled code paths.
    // A full implementation would use a tool like browserless.io to fetch the content.
    const {output} = await prompt(input);
    return output!;
  }
);
