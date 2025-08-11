
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

const getUrlContentTool = ai.defineTool(
    {
      name: 'getUrlContent',
      description: 'Retrieves the HTML content of a given URL.',
      inputSchema: z.object({ url: z.string().url() }),
      outputSchema: z.string(),
    },
    async ({ url }) => {
      try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (!response.ok) {
          return `Error fetching URL: Received status code ${response.status}. Please check if the URL is correct and accessible.`;
        }
        return await response.text();
      } catch (e: any) {
        return `Error fetching URL: ${e.message}. Please ensure the URL is valid and the server has CORS enabled if running in a browser environment.`;
      }
    }
);


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
  tools: [getUrlContentTool],
  prompt: `You are an expert UI/UX designer and frontend developer. Your task is to analyze the design of the provided URL and create a new, improved, and production-ready component that is inspired by it.

You are not just replicating the code. You are re-building the component from scratch using modern best practices, beautiful aesthetics, and clean, maintainable code.

1.  **Analyze**: Use the \`getUrlContent\` tool to fetch the HTML and understand the DOM structure, layout, typography, and color scheme of the target URL. If the tool returns an error, report it back to the user instead of generating code.
2.  **Redesign**: Re-imagine the component with a focus on modern design principles. Improve the visual hierarchy, spacing, and overall aesthetic. The result should be more beautiful and professional than the original.
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
    const {output} = await prompt(input);
    return output!;
  }
);
