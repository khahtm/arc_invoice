import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { streamDeepSeek } from '@/lib/ai/deepseek-client';

const SYSTEM_PROMPT = `You are a freelance proposal writing assistant. Given a job posting or project description from a client, generate a professional proposal that the freelancer can send.

Return valid JSON only:
{
  "proposal": "2-3 paragraph professional proposal text, first person, confident but not arrogant",
  "dealDescription": "1-2 sentence project scope summary for the deal/contract",
  "milestones": [
    { "description": "specific deliverable", "amount": number, "rationale": "why this price" }
  ],
  "totalAmount": number,
  "timeline": "estimated timeline like '2-3 weeks'",
  "keyPoints": ["3-5 bullet points of your approach/value props"]
}

Rules:
- Write the proposal as if the freelancer is pitching TO the client
- Milestones should be 2-6, specific and measurable
- Pricing should be realistic market rates in USD (maps to USDC)
- First milestone should be smallest (discovery/setup)
- Last milestone should include final delivery + handoff
- keyPoints: highlight what makes this proposal stand out
- dealDescription: concise scope for the escrow contract
- Identify the core requirements from the job posting and address them directly
- If the posting mentions budget, respect it; otherwise estimate fair market rate`;

function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, '').slice(0, 5000);
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const wallet = cookieStore.get('wallet-address')?.value;
    if (!wallet) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const jobDescription = typeof body.jobDescription === 'string' ? sanitize(body.jobDescription) : '';

    if (jobDescription.length < 20) {
      return NextResponse.json({ error: 'Job description must be at least 20 characters' }, { status: 400 });
    }

    const stream = await streamDeepSeek(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `<job_posting>\n${jobDescription}\n</job_posting>` },
      ],
      { temperature: 0.7, max_tokens: 2000 }
    );

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI service unavailable';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
