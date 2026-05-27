import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { streamDeepSeek } from '@/lib/ai/deepseek-client';

const SYSTEM_PROMPT = `You are a freelance project planning assistant. Given a project description (and optionally project type, budget, and timeline), break it into clear milestones with realistic USDC pricing.

Rules:
- Return valid JSON only: { "milestones": [...], "totalAmount": N, "summary": "..." }
- Each milestone: { "description": string, "amount": number, "rationale": string }
- Amounts in USD (maps to USDC 1:1)
- 2-6 milestones for most projects
- First milestone should be smallest (design/setup), last should include final delivery
- Be specific in descriptions — vague milestones cause disputes
- If a budget is provided, fit milestones within that budget while being realistic about scope
- If a timeline is provided, align milestone complexity to the available time
- If a project type is provided, use domain-specific milestone patterns (e.g. smart contracts need audit phase, mobile apps need app store submission)
- Total should reflect market rates for the described work

Example:
User: "Build a landing page with animations, contact form, and CMS integration
Project type: Landing Page
Budget range: ~$1000 USDC
Timeline: 1-2 weeks"
Response: {
  "milestones": [
    { "description": "Design mockup and component architecture", "amount": 200, "rationale": "Initial design phase, ~4h work" },
    { "description": "Implement responsive layout with hero section", "amount": 300, "rationale": "Core structure, responsive grid, hero content" },
    { "description": "CMS integration and content management setup", "amount": 250, "rationale": "Headless CMS connection, content models, admin flow" },
    { "description": "Animations, contact form, and final polish", "amount": 250, "rationale": "Framer Motion animations, form validation, cross-browser QA" }
  ],
  "totalAmount": 1000,
  "summary": "4-milestone landing page with CMS, fits $1k budget in 1-2 weeks"
}`;

function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, '').slice(0, 2000);
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const wallet = cookieStore.get('wallet-address')?.value;
    if (!wallet) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const description = typeof body.description === 'string' ? sanitize(body.description) : '';

    if (description.length < 10) {
      return NextResponse.json({ error: 'Description must be at least 10 characters' }, { status: 400 });
    }

    const stream = await streamDeepSeek(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: description },
      ],
      { temperature: 0.7, max_tokens: 1500 }
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
