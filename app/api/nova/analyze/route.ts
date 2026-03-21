// app/api/analyze/route.ts
// This route handles { target, kind } analyze calls from page.tsx
// It proxies to the Nova route which does the actual Bedrock invocation

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { NextRequest, NextResponse } from 'next/server';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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

export async function POST(req: NextRequest) {
  try {
    const { target, kind } = await req.json();

    if (!target) {
      return NextResponse.json({ success: false, error: 'Missing target' }, { status: 400 });
    }

    const systemText = `You are CyberShield's AI security engine.
You analyze URLs and email addresses for security risks.
Always respond with valid JSON only — no markdown, no backticks, no explanation outside the JSON object.
Be accurate, professional, and specific in your analysis.`;

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

    const text = await invokeNova(systemText, analyzePrompt, 800);
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({ success: true, data: parsed });

  } catch (error) {
    console.error('Analyze route error:', error);
    return NextResponse.json(
      { success: false, error: 'Analysis failed' },
      { status: 500 }
    );
  }
}