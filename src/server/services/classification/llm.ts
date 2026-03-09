import { anthropic } from '@/server/ai/client';
import {
  CLASSIFICATION_SYSTEM_PROMPT,
  buildClassificationPrompt,
} from '@/server/ai/prompts/classification';
import {
  classificationResultSchema,
  type ClassificationInput,
  type ClassificationResult,
} from '@/server/ai/schemas/classification-result';

/**
 * Custom error for classification failures
 */
export class ClassificationError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ClassificationError';
  }
}

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Sleep helper for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number): number {
  const delay =
    RETRY_CONFIG.initialDelayMs *
    Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelayMs);
}

/**
 * Classify AI system using Claude LLM
 * Includes retry logic with exponential backoff
 */
export async function classifyWithLLM(
  input: ClassificationInput
): Promise<ClassificationResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      // If this is a retry, wait with exponential backoff
      if (attempt > 0) {
        const delay = getRetryDelay(attempt - 1);
        console.log(
          `[Classification] Retry attempt ${attempt}/${RETRY_CONFIG.maxRetries} after ${delay}ms delay`
        );
        await sleep(delay);
      }

      console.log(`[Classification] Calling Claude API for: ${input.name}`);

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0, // CRITICAL: deterministic output
        system: CLASSIFICATION_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: buildClassificationPrompt(input),
          },
        ],
      });

      // Extract text from response
      const textContent = response.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new ClassificationError(
          'No text content in Claude response',
          'NO_TEXT_CONTENT',
          true
        );
      }

      const rawText = textContent.text;
      console.log('[Classification] Raw LLM response:', rawText);

      // Parse JSON from response
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch (jsonError) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = rawText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          // Try to find any JSON object in the text
          const objectMatch = rawText.match(/\{[\s\S]*\}/);
          if (objectMatch) {
            parsed = JSON.parse(objectMatch[0]);
          } else {
            throw new ClassificationError(
              'Failed to parse JSON from LLM response',
              'INVALID_JSON',
              true
            );
          }
        }
      }

      // Validate against schema
      const result = classificationResultSchema.parse(parsed);

      console.log(
        `[Classification] Successfully classified as ${result.riskLevel} (confidence: ${result.confidenceScore})`
      );

      return result;
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (error instanceof ClassificationError && !error.retryable) {
        throw error;
      }

      // Check for rate limit errors
      if (
        error instanceof Error &&
        (error.message.includes('rate_limit') ||
          error.message.includes('429') ||
          error.message.includes('overloaded'))
      ) {
        console.warn(
          `[Classification] Rate limit error on attempt ${attempt + 1}`
        );
        // Continue to retry
        continue;
      }

      // Check for server errors (5xx)
      if (
        error instanceof Error &&
        (error.message.includes('500') ||
          error.message.includes('503') ||
          error.message.includes('504'))
      ) {
        console.warn(
          `[Classification] Server error on attempt ${attempt + 1}`
        );
        // Continue to retry
        continue;
      }

      // If this was the last attempt, throw
      if (attempt >= RETRY_CONFIG.maxRetries) {
        break;
      }

      console.warn(
        `[Classification] Error on attempt ${attempt + 1}, will retry:`,
        error
      );
    }
  }

  // All retries failed
  console.error('[Classification] All retry attempts failed:', lastError);
  throw new ClassificationError(
    `Classification failed after ${RETRY_CONFIG.maxRetries + 1} attempts: ${lastError?.message}`,
    'MAX_RETRIES_EXCEEDED',
    false
  );
}

/**
 * Validate LLM response structure (pre-schema validation)
 * Returns helpful error messages for common issues
 */
function validateLLMResponse(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) {
    return 'Response is not an object';
  }

  const obj = data as Record<string, unknown>;

  if (!obj.riskLevel) {
    return 'Missing required field: riskLevel';
  }

  if (!obj.reasoning || typeof obj.reasoning !== 'string') {
    return 'Missing or invalid reasoning field';
  }

  if (typeof obj.confidenceScore !== 'number') {
    return 'Missing or invalid confidenceScore';
  }

  if (obj.confidenceScore < 0 || obj.confidenceScore > 1) {
    return 'confidenceScore must be between 0 and 1';
  }

  return null;
}
