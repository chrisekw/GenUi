'use server';

/**
 * @fileOverview This file defines a Genkit flow for optimizing UI component layouts based on natural language prompts.
 *
 * The flow analyzes the prompt and suggests potential layout considerations or improvements.
 *
 * @exports `optimizeComponentLayout` - The main function to call for layout optimization.
 * @exports `OptimizeComponentLayoutInput` - The input type for the `optimizeComponentLayout` function.
 * @exports `OptimizeComponentLayoutOutput` - The output type for the `optimizeComponentLayout` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeComponentLayoutInputSchema = z.object({
  componentPrompt: z
    .string()
    .describe(
      'A natural language prompt describing the UI component to be generated.'
    ),
  framework: z
    .enum(['html', 'tailwindcss'])
    .default('html')
    .describe('The target framework for the UI component.'),
});
export type OptimizeComponentLayoutInput = z.infer<
  typeof OptimizeComponentLayoutInputSchema
>;

const OptimizeComponentLayoutOutputSchema = z.object({
  layoutSuggestions: z
    .string()
    .describe(
      'Suggestions for optimizing the layout of the UI component, considering responsiveness and integration.'
    ),
});
export type OptimizeComponentLayoutOutput = z.infer<
  typeof OptimizeComponentLayoutOutputSchema
>;

export async function optimizeComponentLayout(
  input: OptimizeComponentLayoutInput
): Promise<OptimizeComponentLayoutOutput> {
  return optimizeComponentLayoutFlow(input);
}

const optimizeComponentLayoutPrompt = ai.definePrompt({
  name: 'optimizeComponentLayoutPrompt',
  input: {schema: OptimizeComponentLayoutInputSchema},
  output: {schema: OptimizeComponentLayoutOutputSchema},
  prompt: `You are an AI expert in UI component design and layout optimization.

  Based on the user's prompt describing a UI component and the target framework, analyze the prompt and suggest potential layout considerations or improvements for the component's structure.

  Consider responsiveness across different screen sizes and ease of integration into various application layouts.

  Component Prompt: {{{componentPrompt}}}
  Target Framework: {{{framework}}}

  Layout Suggestions:`,
});

const optimizeComponentLayoutFlow = ai.defineFlow(
  {
    name: 'optimizeComponentLayoutFlow',
    inputSchema: OptimizeComponentLayoutInputSchema,
    outputSchema: OptimizeComponentLayoutOutputSchema,
  },
  async input => {
    const {output} = await optimizeComponentLayoutPrompt(input);
    return output!;
  }
);
