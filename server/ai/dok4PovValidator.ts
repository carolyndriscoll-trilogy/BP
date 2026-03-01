/**
 * DOK4 POV Validation Classifier
 *
 * Lightweight gate that determines whether a submitted text qualifies
 * as a Spiky Point of View before entering the full grading pipeline.
 * Uses mid-tier model with temperature 0.0 for deterministic classification.
 */

import { z } from 'zod';
import { DOK4_MODELS } from '@shared/schema';
import { callOpenRouterModel, extractJSON } from './llm-utils';
import {
  DOK4_POV_VALIDATION_SYSTEM_PROMPT,
  buildDOK4POVValidationUserPrompt,
} from '../prompts/dok4-pov-validation';

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const povValidationSchema = z.object({
  accept: z.boolean(),
  rejection_reason: z.string().nullable(),
  rejection_category: z.enum([
    'tautology',
    'definition',
    'unfalsifiable',
    'opinion_without_evidence',
    'dok3_misclassification',
    'not_a_claim',
  ]).nullable(),
  confidence: z.enum(['high', 'medium', 'low']),
});

export type POVValidationResult = z.infer<typeof povValidationSchema>;

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Validate whether a DOK4 submission qualifies as a Spiky Point of View.
 *
 * Short-circuits for degenerate input (< 10 chars).
 * Uses Gemini Flash primary, Sonnet fallback.
 * Low-confidence results default to accept (per spec).
 */
export async function validateDOK4POV(
  dok4Text: string,
  dok3PrimaryText: string,
  dok3FrameworkName: string | null,
  brainliftPurpose: string
): Promise<POVValidationResult> {
  // Short-circuit: reject degenerate input
  if (!dok4Text || dok4Text.trim().length < 10) {
    return {
      accept: false,
      rejection_reason: 'Submission is too short to be a valid point of view.',
      rejection_category: 'not_a_claim',
      confidence: 'high',
    };
  }

  const userPrompt = buildDOK4POVValidationUserPrompt(
    dok4Text,
    dok3PrimaryText,
    dok3FrameworkName,
    brainliftPurpose
  );

  let raw: string;

  try {
    raw = await callOpenRouterModel(
      DOK4_MODELS.GEMINI_FLASH,
      DOK4_POV_VALIDATION_SYSTEM_PROMPT,
      userPrompt,
      500,
      0.0
    );
  } catch (primaryErr: any) {
    console.log(`[DOK4-Validate] Gemini Flash failed: ${primaryErr.message}, trying Sonnet fallback`);
    raw = await callOpenRouterModel(
      DOK4_MODELS.SONNET_MID,
      DOK4_POV_VALIDATION_SYSTEM_PROMPT,
      userPrompt,
      500,
      0.0
    );
  }

  const parsed = povValidationSchema.parse(extractJSON(raw));

  // Confidence gate: low confidence → accept (per spec)
  if (parsed.confidence === 'low' && !parsed.accept) {
    console.log(`[DOK4-Validate] Low confidence rejection overridden to accept`);
    return {
      accept: true,
      rejection_reason: null,
      rejection_category: null,
      confidence: 'low',
    };
  }

  console.log(`[DOK4-Validate] Result: accept=${parsed.accept}, category=${parsed.rejection_category}, confidence=${parsed.confidence}`);
  return parsed;
}
