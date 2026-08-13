export type NimMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type NimChatOptions = {
  messages: NimMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
};

export type NimChatResponse = {
  content: string;
  usage?: { promptTokens: number; completionTokens: number };
};

const globalForNim = global as unknown as {
  baseUrl: string | undefined;
  apiKey: string | undefined;
  model: string | undefined;
};

export const nimBaseUrl =
  globalForNim.baseUrl ?? (process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1');
export const nimApiKey = globalForNim.apiKey ?? process.env.NVIDIA_API_KEY;
export const nimModel = globalForNim.model ?? process.env.NVIDIA_MODEL;

export const hasNim =
  typeof nimBaseUrl !== 'undefined' &&
  typeof nimApiKey !== 'undefined' &&
  !!nimBaseUrl &&
  !!nimApiKey;

export async function nimChat(options: NimChatOptions): Promise<NimChatResponse> {
  if (!hasNim) {
    throw new Error('[NIM] NVIDIA_API_KEY is not configured.');
  }

  const response = await fetch(`${nimBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${nimApiKey}`,
    },
    body: JSON.stringify({
      model: options.model ?? nimModel,
      messages: options.messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    }),
    signal: options.signal,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`[NIM] Request failed with status ${response.status}: ${detail}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content ?? '',
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
        }
      : undefined,
  };
}
