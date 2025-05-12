// src/ai/flows/detect-render-errors.ts
'use server';

/**
 * @fileOverview Detects potential rendering errors in uploaded files.
 *
 * - detectRenderErrors - A function that detects potential rendering errors.
 * - DetectRenderErrorsInput - The input type for the detectRenderErrors function.
 * - DetectRenderErrorsOutput - The return type for the detectRenderErrors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectRenderErrorsInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The uploaded file's data URI (e.g., a .blend file), that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileName: z.string().describe('The name of the uploaded file.'),
  fileType: z.string().describe('The type of the uploaded file (e.g., ".blend").'),
});

export type DetectRenderErrorsInput = z.infer<typeof DetectRenderErrorsInputSchema>;

const DetectRenderErrorsOutputSchema = z.object({
  errors: z.array(
    z.string().describe('A list of potential rendering errors detected in the file.')
  ).describe('A list of rendering errors.'),
});

export type DetectRenderErrorsOutput = z.infer<typeof DetectRenderErrorsOutputSchema>;

export async function detectRenderErrors(input: DetectRenderErrorsInput): Promise<DetectRenderErrorsOutput> {
  return detectRenderErrorsFlow(input);
}

const detectRenderErrorsPrompt = ai.definePrompt({
  name: 'detectRenderErrorsPrompt',
  input: {schema: DetectRenderErrorsInputSchema},
  output: {schema: DetectRenderErrorsOutputSchema},
  prompt: `You are an expert in 3D rendering and can identify potential errors in 3D model files before rendering.

  Analyze the following file and identify any potential rendering errors, such as missing textures, broken links, or other issues that could cause problems during rendering.

  File Name: {{{fileName}}}
  File Type: {{{fileType}}}
  File Data: {{media url=fileDataUri}}

  Provide a list of potential errors. If there are no potential errors, return an empty array.
  `,
});

const detectRenderErrorsFlow = ai.defineFlow(
  {
    name: 'detectRenderErrorsFlow',
    inputSchema: DetectRenderErrorsInputSchema,
    outputSchema: DetectRenderErrorsOutputSchema,
  },
  async input => {
    const {output} = await detectRenderErrorsPrompt(input);
    return output!;
  }
);

