
'use server';

/**
 * @fileOverview This file defines a Genkit flow for enhancing UI component prompts.
 *
 * The flow takes a user's basic prompt and rewrites it to be more descriptive,
 * focusing on modern, professional, and futuristic design aesthetics.
 *
 * @exports `enhancePrompt` - The main function to call for prompt enhancement.
 * @exports `EnhancePromptInput` - The input type for the `enhancePrompt` function.
 * @exports `EnhancePromptOutput` - The output type for the `enhancePrompt` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhancePromptInputSchema = z.object({
  prompt: z.string().describe('The user-provided prompt for a UI component.'),
});
export type EnhancePromptInput = z.infer<typeof EnhancePromptInputSchema>;

const EnhancePromptOutputSchema = z.object({
  enhancedPrompt: z
    .string()
    .describe('The AI-enhanced prompt with detailed design specifications.'),
});
export type EnhancePromptOutput = z.infer<typeof EnhancePromptOutputSchema>;

export async function enhancePrompt(
  input: EnhancePromptInput
): Promise<EnhancePromptOutput> {
  return enhancePromptFlow(input);
}

const enhancePromptTemplate = ai.definePrompt({
  name: 'enhancePromptTemplate',
  input: {schema: EnhancePromptInputSchema},
  output: {schema: EnhancePromptOutputSchema},
  prompt: `You are a world-class UI/UX design assistant. Your task is to take a user's basic component idea and transform it into a detailed, professional prompt that will guide an AI component generator to produce stunning, industry-standard results.

Rewrite the following prompt to be more descriptive, specific, and inspiring. Infuse it with modern design principles, sleek and futuristic aesthetics, and a focus on excellent user experience.

- **Elaborate on the Concept**: Expand on the user's idea. What is the component's purpose? Who is the target audience?
- **Define the Aesthetics**: Specify color palettes (e.g., dark theme, vibrant accents), typography (e.g., clean sans-serif, elegant serif), spacing (e.g., ample negative space), and overall mood (e.g., luxurious, playful, corporate).
- **Detail the Interactions**: Describe hover states, animations, micro-interactions, and transitions that would enhance the user experience.
- **Ensure Responsiveness**: Mention how the component should adapt to different screen sizes.
- **Use Professional Language**: Employ industry-standard terminology.

Original Prompt:
"{{{prompt}}}"

Rewrite the prompt to be a single, cohesive paragraph. Do not use lists or bullet points. Your response should only be the enhanced prompt itself.
`,
});

const enhancePromptFlow = ai.defineFlow(
  {
    name: 'enhancePromptFlow',
    inputSchema: EnhancePromptInputSchema,
    outputSchema: EnhancePromptOutputSchema,
  },
  async input => {
    const {output} = await enhancePromptTemplate(input);
    return output!;
  }
);
