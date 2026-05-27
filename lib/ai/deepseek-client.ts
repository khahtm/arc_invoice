export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekOptions {
  temperature?: number;
  max_tokens?: number;
}

export interface DeepSeekResponse {
  content: string;
  usage: { prompt_tokens: number; completion_tokens: number };
}

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const MODEL = 'deepseek-chat';

function getApiKey(): string {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('DEEPSEEK_API_KEY environment variable is not set');
  return key;
}

export async function callDeepSeek(
  messages: DeepSeekMessage[],
  options: DeepSeekOptions = {}
): Promise<DeepSeekResponse> {
  const { temperature = 0.7, max_tokens = 2000 } = options;

  const res = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
      max_tokens,
      stream: false,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`DeepSeek API error (${res.status}):`, error);
    throw new Error('AI service temporarily unavailable');
  }

  const data = await res.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
  };
}

export async function streamDeepSeek(
  messages: DeepSeekMessage[],
  options: DeepSeekOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const { temperature = 0.7, max_tokens = 2000 } = options;

  const res = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
      max_tokens,
      stream: true,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`DeepSeek API error (${res.status}):`, error);
    throw new Error('AI service temporarily unavailable');
  }

  if (!res.body) throw new Error('No response body from DeepSeek');
  return res.body;
}
