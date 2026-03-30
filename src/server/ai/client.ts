/**
 * OpenRouter AI client
 *
 * Routes requests through OpenRouter API (OpenAI-compatible format).
 * Supports any model available on OpenRouter, including Anthropic Claude.
 *
 * @see https://openrouter.ai/docs/quickstart
 */

/** Default model for all AI tasks */
const DEFAULT_MODEL = 'anthropic/claude-sonnet-4';

interface LLMRequestOptions {
  model?: string;
  system: string;
  userMessage: string;
  maxTokens: number;
  temperature?: number;
}

interface LLMResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Call LLM via OpenRouter API
 *
 * Uses OpenAI-compatible chat completions format.
 * System prompt is sent as a system message.
 */
export async function callLLM(options: LLMRequestOptions): Promise<LLMResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not set. Get your key at https://openrouter.ai/keys'
    );
  }

  const model = options.model ?? DEFAULT_MODEL;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXTAUTH_URL ?? 'https://complyance.app',
      'X-OpenRouter-Title': 'Complyance',
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens,
      temperature: options.temperature ?? 0,
      messages: [
        { role: 'system', content: options.system },
        { role: 'user', content: options.userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'unknown error');
    throw new Error(
      `OpenRouter API error ${response.status}: ${errorBody}`
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: { content?: string };
    }>;
    model?: string;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
    error?: { message?: string; code?: number };
  };

  if (data.error) {
    throw new Error(
      `OpenRouter error: ${data.error.message ?? JSON.stringify(data.error)}`
    );
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('No text content in OpenRouter response');
  }

  return {
    text,
    model: data.model ?? model,
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens ?? 0,
          completionTokens: data.usage.completion_tokens ?? 0,
          totalTokens: data.usage.total_tokens ?? 0,
        }
      : undefined,
  };
}
