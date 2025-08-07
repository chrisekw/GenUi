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
  prompt: `You are an expert in web development and UI component creation. Your task is to analyze the content of the provided URL and generate a UI component based on its structure and styling.

You will be given a URL. You need to fetch the content of this URL, understand its DOM structure and CSS, and then generate a single component that replicates its appearance. The generated code should use Tailwind CSS for styling.

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
    // In a real-world scenario, you might have a service here to fetch and parse the URL content.
    // For this example, we are relying on the model's ability to potentially access the URL or reason based on it.
    // A more robust implementation would involve a tool that fetches the webpage content.
    const {output} = await prompt(input);
    return output!;
  }
);
