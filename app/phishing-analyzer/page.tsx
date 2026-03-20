'use client';

import { useState } from 'react';
import { askNova } from '../lib/nova';

interface AnalysisResult {
  verdict: 'safe' | 'suspicious' | 'phishing';
  confidence: number;
  reasons: string[];
  redFlags: string[];
  aiExplanation: string;
  urgencyScore: number;
  spoofingDetected: boolean;
  recommendations: string[];
}

const analyzeEmailLocally = (text: string): Omit<AnalysisResult, 'aiExplanation'> => {
  const lower = text.toLowerCase();
  const redFlags: string[] = [];
  const reasons: string[] = [];
  let score = 0;

  // Urgency keywords
  const urgencyWords = ['urgent', 'immediately', 'expires', 'act now', 'limited time', 'within 24 hours', 'account suspended', 'verify now', 'confirm immediately'];
  const foundUrgency = urgencyWords.filter(w => lower.includes(w));
  if (foundUrgency.length > 0) { score += foundUrgency.length * 15; redFlags.push(`Urgency language: "${foundUrgency[0]}"`); }

  // Phishing keywords
  const phishWords = ['click here', 'login', 'password', 'bank account', 'credit card', 'ssn', 'social security', 'verify your account', 'update your information', 'suspended', 'unusual activity'];
  const foundPhish = phishWords.filter(w => lower.includes(w));
  if (foundPhish.length > 0) { score += foundPhish.length * 12; redFlags.push(`Phishing keywords detected: ${foundPhish.slice(0, 3).join(', ')}`); }

  // Suspicious links
  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlPattern) || [];
  const suspUrls = urls.filter(u => /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(u) || u.includes('bit.ly') || u.includes('tinyurl') || u.includes('goo.gl'));
  if (suspUrls.length > 0) { score += 25; redFlags.push('Suspicious shortened/IP-based URLs detected'); }

  // Spoofing indicators
  const spoofWords = ['paypal', 'amazon', 'microsoft', 'google', 'apple', 'netflix', 'bank of america', 'chase', 'wells fargo'];
  const foundSpoof = spoofWords.filter(w => lower.includes(w));
  const spoofingDetected = foundSpoof.length > 0 && score > 20;
  if (spoofingDetected) { score += 20; redFlags.push(`Brand impersonation: ${foundSpoof[0]}`); }

  // Grammar issues (simple check)
  const grammarIssues = ['dear customer', 'dear user', 'dear account holder', 'kindly do the needful', 'revert back'];
  const foundGrammar = grammarIssues.filter(w => lower.includes(w));
  if (foundGrammar.length > 0) { score += 10; redFlags.push('Generic/suspicious greeting or phrasing'); }

  // Personal info requests
  if (lower.includes('enter your') || lower.includes('provide your') || lower.includes('confirm your')) {
    score += 15; redFlags.push('Requests personal information');
  }

  // Threats
  if (lower.includes('account will be closed') || lower.includes('legal action') || lower.includes('suspended') || lower.includes('terminated')) {
    score += 20; redFlags.push('Threatening language about account closure');
  }

  score = Math.min(100, score);
  const urgencyScore = Math.min(100, foundUrgency.length * 25);

  let verdict: 'safe' | 'suspicious' | 'phishing';
  if (score >= 60) { verdict = 'phishing'; reasons.push('Multiple phishing indicators detected'); }
  else if (score >= 30) { verdict = 'suspicious'; reasons.push('Some suspicious patterns found'); }
  else { verdict = 'safe'; reasons.push('No major phishing indicators detected'); }

  const recommendations = [
    verdict !== 'safe' && 'Do not click any links in this email',
    verdict === 'phishing' && 'Report this email as phishing to your email provider',
    spoofingDetected && 'Contact the company directly through their official website',
    verdict !== 'safe' && 'Do not provide any personal information',
    true && 'When in doubt, verify the sender through official channels',
  ].filter(Boolean) as string[];

  return { verdict, confidence: score, reasons, redFlags, urgencyScore, spoofingDetected, recommendations };
};

export default function PhishingAnalyzer() {
  const [emailText, setEmailText] = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<AnalysisResult | null>(null);

  const analyze = async () => {
    if (!emailText.trim() || loading) return;
    setLoading(true);
    setResult(null);

    const localResult = analyzeEmailLocally(emailText);

    const prompt = `Analyze this email for phishing indicators and provide a 3-4 sentence expert assessment:

EMAIL CONTENT:
${emailText.slice(0, 1000)}

Local analysis found:
- Verdict: ${localResult.verdict}
- Red flags: ${localResult.redFlags.join(', ') || 'none'}
- Urgency score: ${localResult.urgencyScore}/100
- Spoofing detected: ${localResult.spoofingDetected}

Write a clear, non-technical explanation of whether this email is dangerous and what the recipient should do.`;

    let aiExplanation = 'AI analysis unavailable.';
    try {
      aiExplanation = await askNova(prompt, 'phishing');
    } catch {}

    setResult({ ...localResult, aiExplanation });
    setLoading(false);
  };

  const verdictConfig = {
    safe:       { color: '#4caf50', bg: 'rgba(76,175,80,0.08)',   border: 'rgba(76,175,80,0.3)',   icon: '✅', label: 'SAFE' },
    suspicious: { color: '#ff9800', bg: 'rgba(255,152,0,0.08)',   border: 'rgba(255,152,0,0.3)',   icon: '⚠️', label: 'SUSPICIOUS' },
    phishing:   { color: '#f44336', bg: 'rgba(244,67,54,0.08)',   border: 'rgba(244,67,54,0.3)',   icon: '🚨', label: 'PHISHING' },
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', padding: '2rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', fontSize: '2rem', marginBottom: '1rem', boxShadow: '0 0 24px rgba(244,67,54,0.15)' }}>🎣</div>
          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>AI Phishing Email Analyzer</h1>
          <p style={{ color: '#8994a9', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
            Paste any suspicious email and our AI will analyze it for phishing patterns, brand impersonation, and social engineering tactics.
          </p>
        </div>

        {/* Input */}
        <div style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.2)', borderRadius: '16px', padding: '1.8rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#07d2f8,transparent)' }} />
          <label style={{ display: 'block', color: '#8994a9', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.7rem' }}>
            Paste Email Content
          </label>
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Paste the full email here — subject, body, links, everything..."
            rows={10}
            style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(7,210,248,0.2)', borderRadius: '10px', color: '#fff', fontSize: '0.88rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'monospace', lineHeight: 1.6 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <span style={{ color: '#8994a9', fontSize: '0.72rem' }}>{emailText.length} characters</span>
            <div style={{ display: 'flex', gap: '0.7rem' }}>
              <button onClick={() => setEmailText('')} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid rgba(7,210,248,0.25)', borderRadius: '8px', color: '#8994a9', cursor: 'pointer', fontSize: '0.82rem' }}>Clear</button>
              <button onClick={analyze} disabled={loading || !emailText.trim()} style={{ padding: '0.6rem 1.5rem', background: !emailText.trim() ? '#333' : '#f44336', border: 'none', borderRadius: '8px', color: !emailText.trim() ? '#666' : '#fff', cursor: !emailText.trim() ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.88rem', transition: 'all 0.2s' }}>
                {loading ? '🔍 Analyzing...' : '🎣 Analyze Email'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ background: 'rgba(244,67,54,0.04)', border: '1px solid rgba(244,67,54,0.2)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
            <style>{`@keyframes blink{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
            <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>🔍</div>
            <p style={{ color: '#f44336', fontWeight: '600', marginBottom: '0.4rem' }}>Scanning for threats...</p>
            <p style={{ color: '#8994a9', fontSize: '0.82rem', marginBottom: '1rem' }}>Running pattern analysis + Nova AI evaluation</p>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              {[0,1,2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f44336', animation: `blink 1.2s ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (() => {
          const vc = verdictConfig[result.verdict];
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

              {/* Verdict banner */}
              <div style={{ background: vc.bg, border: `1px solid ${vc.border}`, borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${vc.color},transparent)` }} />
                <span style={{ fontSize: '2.5rem' }}>{vc.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: vc.color, fontWeight: '800', fontSize: '1.3rem', letterSpacing: '1px' }}>{vc.label}</div>
                  <div style={{ color: '#8994a9', fontSize: '0.82rem', marginTop: '2px' }}>{result.reasons[0]}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: vc.color, fontSize: '2rem', fontWeight: '800', lineHeight: 1 }}>{result.confidence}</div>
                  <div style={{ color: '#8994a9', fontSize: '0.7rem' }}>Threat Score</div>
                </div>
              </div>

              {/* Metrics row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'Threat Score', value: result.confidence + '%', color: result.confidence >= 60 ? '#f44336' : result.confidence >= 30 ? '#ff9800' : '#4caf50' },
                  { label: 'Urgency Level', value: result.urgencyScore + '%', color: result.urgencyScore >= 50 ? '#f44336' : '#ff9800' },
                  { label: 'Spoofing', value: result.spoofingDetected ? 'Detected' : 'None', color: result.spoofingDetected ? '#f44336' : '#4caf50' },
                ].map((m, i) => (
                  <div key={i} style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.15)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                    <div style={{ color: m.color, fontSize: '1.4rem', fontWeight: '800' }}>{m.value}</div>
                    <div style={{ color: '#8994a9', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px' }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* AI Explanation */}
              <div style={{ background: 'rgba(7,210,248,0.04)', border: '1px solid rgba(7,210,248,0.2)', borderRadius: '16px', padding: '1.4rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#07d2f8,transparent)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                  <span>🤖</span>
                  <p style={{ color: '#8994a9', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>AI Analysis · Amazon Nova</p>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{result.aiExplanation}</p>
              </div>

              {/* Red Flags */}
              {result.redFlags.length > 0 && (
                <div style={{ background: 'rgba(244,67,54,0.03)', border: '1px solid rgba(244,67,54,0.2)', borderRadius: '16px', padding: '1.4rem' }}>
                  <p style={{ color: '#f44336', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>🚩 Red Flags Detected ({result.redFlags.length})</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {result.redFlags.map((flag, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.8rem', background: 'rgba(244,67,54,0.06)', borderRadius: '8px', border: '1px solid rgba(244,67,54,0.15)' }}>
                        <span style={{ color: '#f44336', fontSize: '0.8rem' }}>⚠</span>
                        <span style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.2)', borderRadius: '16px', padding: '1.4rem' }}>
                <p style={{ color: '#8994a9', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>What To Do</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {result.recommendations.map((rec, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.6rem 0.8rem', background: 'rgba(255,152,0,0.05)', borderRadius: '8px', border: '1px solid rgba(255,152,0,0.15)' }}>
                      <span style={{ color: '#ff9800', fontSize: '0.8rem' }}>→</span>
                      <span style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => { setResult(null); setEmailText(''); }} style={{ padding: '0.85rem', background: 'transparent', border: '1px solid rgba(7,210,248,0.3)', borderRadius: '10px', color: '#07d2f8', fontWeight: '600', cursor: 'pointer', fontSize: '0.88rem', transition: 'background 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(7,210,248,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                🔄 Analyze Another Email
              </button>
            </div>
          );
        })()}

        {/* Sample emails for demo */}
        {!result && !loading && (
          <div style={{ background: 'rgba(7,210,248,0.02)', border: '1px solid rgba(7,210,248,0.1)', borderRadius: '12px', padding: '1.2rem' }}>
            <p style={{ color: '#8994a9', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>Try a sample</p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {[
                { label: '🎣 Phishing Sample', text: 'URGENT: Your PayPal account has been suspended! Click here immediately to verify your account within 24 hours or your account will be permanently closed. Login now: http://192.168.1.1/paypal-verify Enter your credit card and social security number to confirm your identity.' },
                { label: '✅ Legit Sample', text: 'Hi there, Just wanted to follow up on our meeting from last week. Please let me know if you have any questions about the project proposal. Looking forward to hearing from you. Best regards, John' },
              ].map((s, i) => (
                <button key={i} onClick={() => setEmailText(s.text)} style={{ padding: '0.5rem 1rem', background: 'rgba(7,210,248,0.06)', border: '1px solid rgba(7,210,248,0.2)', borderRadius: '8px', color: '#07d2f8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}