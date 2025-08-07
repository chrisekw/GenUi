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
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
      } catch (e: any) {
        // Throw an error to be caught by the flow's error handler
        throw new Error(`Failed to fetch content from ${url}: ${e.message}`);
      }
    }
);


const CloneUrlInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to clone a component from.'),
  framework: z.enum(['react', 'vue', 'html']).describe('The target framework for the generated code.'),
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
  prompt: `You are an expert in web development and UI component creation. Your task is to analyze the content of the provided URL and generate a UI component based on its structure and styling.

You will be given a URL. You need to fetch the content of this URL using the getUrlContent tool, understand its DOM structure and CSS, and then generate a single component that replicates its appearance. The generated code should use Tailwind CSS for styling.

The target framework is: {{{framework}}}
URL to clone: {{{url}}}

Respond with the code, and nothing else. Do not include any comments or explanations.
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
