'use server';

/**
 * @fileOverview An AI agent to generate UI components from natural language prompts.
 *
 * - generateUiComponent - A function that generates UI components based on a prompt.
 * - GenerateUiComponentInput - The input type for the generateUiComponent function.
 * - GenerateUiComponentOutput - The return type for the generateUiComponent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateUiComponentInputSchema = z.object({
  prompt: z.string().describe('A natural language description of the UI component to generate.'),
  framework: z.enum(['react', 'vue', 'html']).describe('The target framework for the generated code.'),
  imageUrl: z.string().optional().describe("An optional image of a component to replicate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateUiComponentInput = z.infer<typeof GenerateUiComponentInputSchema>;

const GenerateUiComponentOutputSchema = z.object({
  code: z.string().describe('The generated code for the UI component.'),
});
export type GenerateUiComponentOutput = z.infer<typeof GenerateUiComponentOutputSchema>;

export async function generateUiComponent(input: GenerateUiComponentInput): Promise<GenerateUiComponentOutput> {
  return generateUiComponentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUiComponentPrompt',
  input: {schema: GenerateUiComponentInputSchema},
  output: {schema: GenerateUiComponentOutputSchema},
  prompt: `You are a UI component code generation expert.

You will generate code for a UI component based on the user's prompt. The generated code should use Tailwind CSS for styling.
{{#if imageUrl}}
You will also be provided an image of a UI component. Your task is to replicate the component in the image.
Image: {{media url=imageUrl}}
{{/if}}
The target framework is: {{{framework}}}

Prompt: {{{prompt}}}

Respond with the code, and nothing else. Do not include any comments or explanations.
`,
});

const generateUiComponentFlow = ai.defineFlow(
  {
    name: 'generateUiComponentFlow',
    inputSchema: GenerateUiComponentInputSchema,
    outputSchema: GenerateUiComponentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
