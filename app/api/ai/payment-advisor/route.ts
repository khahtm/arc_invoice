import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { callDeepSeek } from '@/lib/ai/deepseek-client';

const SYSTEM_PROMPT = `You are a crypto payment routing advisor for USDC payments.

Given a payment amount and the user's current chain, recommend the best chain to pay from.

Chain characteristics:
- Arc (chainId 5042002): Direct payment, no bridge needed. Instant. Lowest gas (~$0.01).
- Base (8453): L2, fast bridge via CCTP ~5 min. Low gas (~$0.05).
- Arbitrum (42161): L2, CCTP bridge ~5 min. Low gas (~$0.05).
- Optimism (10): L2, CCTP bridge ~5 min. Low gas (~$0.05).
- Polygon (137): L2, CCTP bridge ~10 min. Low gas (~$0.03).
- Ethereum (1): L1, CCTP bridge ~15 min. High gas (~$2-5).

Rules:
- Return valid JSON only: { "recommendedChainId", "chainName", "reason", "estimatedTime" }
- Prefer Arc (direct, instant) > L2s (cheap+fast) > Ethereum (expensive)
- estimatedTime: "instant" for Arc, "~5 min" for L2s, "~15 min" for Ethereum
- reason: one sentence, conversational tone
- If already on the optimal chain, confirm it`;

function parseAiJson<T>(content: string): T {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in AI response');
  return JSON.parse(jsonMatch[0]);
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const wallet = cookieStore.get('wallet-address')?.value;
    if (!wallet) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, currentChainId } = body;

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const context = [
      `Payment amount: $${amount} USDC`,
      `Current chain: ${typeof currentChainId === 'number' ? currentChainId : 'unknown'}`,
    ].join('\n');

    const response = await callDeepSeek(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: context },
      ],
      { temperature: 0.3, max_tokens: 300 }
    );

    try {
      const advice = parseAiJson(response.content);
      return NextResponse.json({ advice });
    } catch {
      return NextResponse.json({ error: 'AI response could not be parsed' }, { status: 502 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI service unavailable';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
