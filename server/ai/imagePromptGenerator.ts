/**
 * Image Prompt Generator
 *
 * Uses Claude to generate a visual concept for a brainlift cover image.
 * Claude's job: Generate ONLY the visual concept phrase (the [X] part).
 */

import type { ImageGenerationContext } from '../storage/brainlifts';
import { callOpenRouterModel } from './llm-utils';

const CLAUDE_PROMPT = `You are a visual concept designer. Given a brainlift's learning context,
generate a single symbolic object or scene that represents its core theme.

Rules:
- Output ONLY the visual concept phrase (nothing else)
- Example outputs: "a lighthouse beam splitting into prismatic colors", "an open book with gears emerging from its pages"
- Must be a concrete, drawable object - not abstract concepts
- Should evoke the Victorian engraving aesthetic
- Keep it simple - one focal subject
- No text, no people's faces, no logos

Brainlift Context:
- Title: {title}
- Purpose: {purpose}
- Key themes: {themes}

Visual concept:`;

/**
 * Generate a visual concept for a brainlift cover image using Claude.
 *
 * @param context - Brainlift context from storage.getImageGenerationContext()
 * @param verbose - Log full prompts and responses
 * @returns A concise visual concept string (e.g., "an hourglass filled with flowing data streams")
 */
export async function generateImagePrompt(
  context: ImageGenerationContext,
  verbose = false
): Promise<string> {
  const prompt = CLAUDE_PROMPT
    .replace('{title}', context.title)
    .replace('{purpose}', context.purpose)
    .replace('{themes}', context.topFactSummaries.join('; '));

  if (verbose) {
    console.log('\n' + '='.repeat(80));
    console.log('CLAUDE PROMPT');
    console.log('='.repeat(80));
    console.log(prompt);
    console.log('='.repeat(80) + '\n');
  }

  const visualConcept = await callOpenRouterModel(
    'anthropic/claude-sonnet-4',
    null,
    prompt,
    100,
    0.7
  );

  if (verbose) {
    console.log('='.repeat(80));
    console.log('CLAUDE RESPONSE');
    console.log('='.repeat(80));
    console.log(visualConcept);
    console.log('='.repeat(80) + '\n');
  }

  return visualConcept.trim();
}
