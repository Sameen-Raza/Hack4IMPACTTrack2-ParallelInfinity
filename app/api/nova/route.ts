// app/api/nova/route.ts
// Handles BOTH:
//   1. askNova() calls  → { prompt, type }
//   2. /api/analyze     → { target, kind }  (kept for backward compat)

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { NextRequest, NextResponse } from 'next/server';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const SYSTEM_PROMPTS: Record<string, string> = {
  security_report: `You are CyberShield's AI security engine.
You analyze security scan results and provide clear, concise summaries for non-technical business owners.
Be professional, accurate, and actionable. Plain text only — no markdown, no bullet points.`,

  phishing: `You are a cybersecurity expert specializing in phishing detection.
Analyze URLs and emails for phishing indicators. Be direct and specific.
Plain text only — no markdown.`,

  chatbot: `You are CyberShield's helpful security assistant.
Provide brief, practical cybersecurity advice. Be concise and clear.
Plain text only — no markdown, no bullet points.`,

  smb_report: `You are a cybersecurity consultant for small and medium businesses.
Provide practical, jargon-free security assessments and recommendations.
Plain text only — no markdown.`,
};

// ── Shared Nova invocation helper ──────────────────────────────────────────
async function invokeNova(systemText: string, userText: string, maxTokens = 800): Promise<string> {
  const command = new InvokeModelCommand({
    modelId: 'amazon.nova-micro-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      messages: [{ role: 'user', content: [{ text: userText }] }],
      system: [{ text: systemText }],
      inferenceConfig: {
        maxTokens,
        temperature: 0.3,
        topP: 0.9,
      },
    }),
  });

  const response = await client.send(command);
  const body = JSON.parse(new TextDecoder().decode(response.body));
  return body.output?.message?.content?.[0]?.text || '';
}

// ── Route handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // ── Case 1: askNova() general prompt calls → { prompt, type } ──────────
    if (payload.prompt) {
      const { prompt, type } = payload;
      const systemPrompt = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.chatbot;

      const text = await invokeNova(systemPrompt, prompt, 512);
      const result = text.trim() || 'Analysis unavailable.';

      return NextResponse.json({ result });
    }

    // ── Case 2: /api/analyze style calls → { target, kind } ────────────────
    if (payload.target) {
      const { target, kind } = payload;

      const analyzePrompt =
        kind === 'email'
          ? `You are a cybersecurity expert. Analyze this email address for security risks: "${target}"

Evaluate:
1. Is the domain reputable or disposable?
2. Are there signs of suspicious patterns?
3. What is the breach risk level?
4. Overall security assessment

Respond ONLY with valid JSON in this exact format, no markdown, no explanation outside JSON:
{
  "overall_score": <number 0-100>,
  "risk_level": "<Low Risk|Medium Risk|High Risk>",
  "summary": "<2-3 sentence plain English summary>",
  "components": [
    {"name": "Email Domain Reputation", "score": <0-100>, "description": "<explanation>"},
    {"name": "Breach Risk", "score": <0-100>, "description": "<explanation>"},
    {"name": "Email Pattern Safety", "score": <0-100>, "description": "<explanation>"},
    {"name": "Domain Age & Trust", "score": <0-100>, "description": "<explanation>"}
  ],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"],
  "threat_indicators": ["<indicator1>", "<indicator2>"],
  "safe_indicators": ["<safe1>", "<safe2>"]
}`
          : `You are a cybersecurity expert. Analyze this URL/domain for security risks: "${target}"

Evaluate:
1. Is HTTPS properly configured?
2. Domain reputation and trustworthiness
3. Phishing or malware indicators
4. SSL and certificate validity signals
5. Overall security assessment

Respond ONLY with valid JSON in this exact format, no markdown, no explanation outside JSON:
{
  "overall_score": <number 0-100>,
  "risk_level": "<Low Risk|Medium Risk|High Risk>",
  "summary": "<2-3 sentence plain English summary>",
  "components": [
    {"name": "SSL Security", "score": <0-100>, "description": "<explanation>"},
    {"name": "Domain Reputation", "score": <0-100>, "description": "<explanation>"},
    {"name": "Phishing Risk", "score": <0-100>, "description": "<explanation>"},
    {"name": "Malware Indicators", "score": <0-100>, "description": "<explanation>"}
  ],
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"],
  "threat_indicators": ["<indicator1>", "<indicator2>"],
  "safe_indicators": ["<safe1>", "<safe2>"]
}`;

      const systemText = `You are CyberShield's AI security engine.
You analyze URLs and email addresses for security risks.
Always respond with valid JSON only — no markdown, no backticks, no explanation outside the JSON object.
Be accurate, professional, and specific in your analysis.`;

      const text = await invokeNova(systemText, analyzePrompt, 800);
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return NextResponse.json({ success: true, data: parsed });
    }

    // ── Neither payload shape matched ───────────────────────────────────────
    return NextResponse.json(
      { result: 'Invalid request payload.', success: false },
      { status: 400 }
    );

  } catch (error) {
    console.error('Nova route error:', error);
    return NextResponse.json(
      {
        result: 'AI analysis temporarily unavailable.',
        success: false,
        error: 'Analysis failed',
      },
      { status: 500 }
    );
  }
}