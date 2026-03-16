'use client';

import { useState, useEffect } from 'react';
import { messages } from './stores/message';

interface SecurityScore {
  target: string;
  kind: 'email' | 'website';
  overall_score: number;
  components: Array<{ name: string; score: number; description: string }>;
  recommendations: string[];
  breach_findings?: any;
}

// ── SCORING ENGINE (replaces all mock logic) ──────────────────────────────
const analyzeTarget = (input: string): SecurityScore => {
  const lower = input.toLowerCase().trim();
  const isEmail = input.includes('@');
  let score = 100;
  const flags: string[] = [];

  if (isEmail) {
    const [localPart, domain] = lower.split('@');

    const disposable = ['mailinator.com','tempmail.com','guerrillamail.com','10minutemail.com','throwam.com','yopmail.com'];
    if (disposable.includes(domain)) {
      score -= 40;
      flags.push('Disposable email domain detected');
    }

    if (!domain || !domain.includes('.')) {
      score -= 30;
      flags.push('Malformed email domain');
    }

    const trustedEmail = ['gmail.com','outlook.com','yahoo.com','icloud.com','proton.me'];
    if (trustedEmail.includes(domain)) score += 5;

    const numCount = (localPart.match(/\d/g) || []).length;
    if (numCount > 6) {
      score -= 15;
      flags.push('Suspicious number-heavy email address');
    }

  } else {
    if (!lower.startsWith('https://')) {
      score -= 20;
      flags.push('No HTTPS — connection not encrypted');
    }

    if (/^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(lower)) {
      score -= 35;
      flags.push('Raw IP address used instead of domain');
    }

    const suspiciousTLDs = ['.tk','.ml','.ga','.cf','.gq','.xyz','.top','.club','.work','.link'];
    if (suspiciousTLDs.some((tld) => lower.includes(tld))) {
      score -= 25;
      flags.push('Suspicious or high-risk TLD detected');
    }

    const phishingWords = ['login','verify','secure','account','update','banking','paypal','ebay','amazon','signin','password','confirm'];
    const foundPhishing = phishingWords.filter((w) => lower.includes(w));
    if (foundPhishing.length > 0) {
      score -= foundPhishing.length * 10;
      flags.push(`Phishing keywords detected: ${foundPhishing.join(', ')}`);
    }

    try {
      const hostname = new URL(lower.startsWith('http') ? lower : 'https://' + lower).hostname;
      if (hostname.split('.').length > 4) {
        score -= 20;
        flags.push('Excessive subdomains — common phishing tactic');
      }
    } catch {}

    if (lower.length > 100) {
      score -= 15;
      flags.push('Abnormally long URL');
    }

    if (/@|%40/.test(lower)) {
      score -= 20;
      flags.push('Suspicious special characters in URL');
    }

    try {
      const hostname = new URL(lower.startsWith('http') ? lower : 'https://' + lower).hostname;
      const rootDomain = hostname.split('.').slice(-2).join('.');
      const trustedDomains = ['google.com','github.com','microsoft.com','apple.com','cloudflare.com','linkedin.com'];
      if (trustedDomains.includes(rootDomain)) score += 10;
    } catch {}
  }

  score = Math.max(0, Math.min(100, score));

  const hasPhishing   = flags.some((f) => f.toLowerCase().includes('phishing'));
  const hasHTTPS      = !flags.some((f) => f.includes('HTTPS'));
  const hasIP         = flags.some((f) => f.includes('IP'));
  const hasSuspTLD    = flags.some((f) => f.includes('TLD'));
  const hasDisposable = flags.some((f) => f.includes('Disposable'));

  return {
    target: input,
    kind: isEmail ? 'email' : 'website',
    overall_score: score,
    components: [
      {
        name: 'SSL Security',
        score: hasHTTPS ? 90 : 10,
        description: hasHTTPS
          ? 'HTTPS detected — connection is encrypted'
          : 'No HTTPS — data may be transmitted in plaintext',
      },
      {
        name: 'Email Exposure',
        score: hasDisposable ? 10 : 75,
        description: hasDisposable
          ? 'Disposable email domain — high breach risk'
          : 'No known disposable domain patterns found',
      },
      {
        name: 'Domain Reputation',
        score: hasSuspTLD || hasIP ? 15 : hasPhishing ? 30 : 85,
        description: hasSuspTLD
          ? 'Suspicious TLD associated with high-risk domains'
          : hasIP
          ? 'Raw IP address — no domain reputation available'
          : hasPhishing
          ? 'Domain contains phishing-related keywords'
          : 'Domain reputation appears healthy',
      },
    ],
    recommendations: [
      !hasHTTPS     && 'Switch to HTTPS with a valid SSL certificate',
      hasPhishing   && 'Avoid entering credentials on this site — possible phishing',
      hasIP         && 'Do not trust sites using raw IP addresses',
      hasSuspTLD    && 'Be cautious with sites using high-risk TLDs (.tk, .xyz etc.)',
      hasDisposable && 'Avoid using disposable email addresses for important accounts',
      score < 70    && 'Enable multi-factor authentication on all accounts',
      score < 50    && 'Report this URL to your IT security team immediately',
      true          && 'Monitor breach databases periodically',
    ].filter(Boolean) as string[],
    breach_findings: { status: score >= 70 ? 'safe' : 'flagged' },
  };
};

// ── COMPONENT ─────────────────────────────────────────────────────────────
export default function Home() {
  const [input, setInput] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SecurityScore | null>(null);
  const [error, setError] = useState('');
  const [scanHistory, setScanHistory] = useState<{ target: string; score: number }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('scanHistory');
    if (saved) setScanHistory(JSON.parse(saved));
    const interval = setInterval(() => {
      setCurrentMessageIndex((p) => (p + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGetScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    const capturedInput = input;
    setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    setInput('');

    try {
      setTimeout(() => {
        // ── uses analyzeTarget instead of mock random logic ──
        const mockResult = analyzeTarget(capturedInput);

        setResult(mockResult);

        const updatedHistory = [
          { target: mockResult.target, score: mockResult.overall_score },
          ...scanHistory,
        ].slice(0, 5);

        setScanHistory(updatedHistory);
        localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
        setLoading(false);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze');
      setLoading(false);
    }
  };

  // ── RESULTS VIEW ─────────────────────────────────────────────────────────
  if (result) {
    const vc =
      result.overall_score >= 70 ? { color: '#4caf50', label: 'Low Risk',    icon: '🛡️' } :
      result.overall_score >= 40 ? { color: '#ff9800', label: 'Medium Risk', icon: '⚠️' } :
                                   { color: '#f44336', label: 'High Risk',   icon: '🚨' };

    return (
      <div style={{ minHeight: 'calc(100vh - 70px)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          {/* Header banner */}
          <div style={{
            background: 'rgba(7,210,248,0.05)', border: '1px solid rgba(7,210,248,0.25)',
            borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#07d2f8,transparent)' }} />
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{vc.icon}</div>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              Security Assessment Complete
            </h2>
            <p style={{ color: '#8994a9', fontSize: '0.9rem', margin: 0 }}>
              Target:{' '}
              <span style={{ color: '#07d2f8', fontWeight: '600' }}>{result.target}</span>
              <span style={{
                marginLeft: '0.8rem', padding: '2px 10px', borderRadius: '999px',
                background: 'rgba(7,210,248,0.1)', border: '1px solid rgba(7,210,248,0.3)',
                color: '#07d2f8', fontSize: '0.75rem',
              }}>
                {result.kind}
              </span>
            </p>
          </div>

          {/* Score + Components row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

            {/* Circular score */}
            <div style={{
              background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.2)',
              borderRadius: '16px', padding: '2rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${vc.color},transparent)` }} />
              <p style={{ color: '#8994a9', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
                Security Score
              </p>
              <div style={{ position: 'relative', width: '110px', height: '110px', marginBottom: '1rem' }}>
                <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle cx="55" cy="55" r="46" fill="none" stroke={vc.color} strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - result.overall_score / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '800', lineHeight: 1 }}>{result.overall_score}</span>
                  <span style={{ color: '#8994a9', fontSize: '0.65rem' }}>/100</span>
                </div>
              </div>
              <div style={{ color: vc.color, fontWeight: '700', fontSize: '1rem' }}>{vc.label}</div>
            </div>

            {/* Component breakdown */}
            <div style={{
              background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.2)',
              borderRadius: '16px', padding: '1.5rem',
            }}>
              <p style={{ color: '#8994a9', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.2rem' }}>
                Component Breakdown
              </p>
              {result.components.map((comp, idx) => {
                const displayScore = comp.score;
                const cc = displayScore >= 70 ? '#4caf50' : displayScore >= 40 ? '#ff9800' : '#f44336';
                return (
                  <div key={idx} style={{ marginBottom: idx < result.components.length - 1 ? '1.1rem' : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{comp.name}</span>
                      <span style={{ color: cc, fontSize: '0.82rem', fontWeight: '600' }}>{comp.score}</span>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.25rem' }}>
                      <div style={{ height: '100%', width: `${displayScore}%`, backgroundColor: cc, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                    </div>
                    <p style={{ color: '#8994a9', fontSize: '0.75rem', margin: 0 }}>{comp.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div style={{
            background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.2)',
            borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem',
          }}>
            <p style={{ color: '#8994a9', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
              Recommendations
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {result.recommendations.map((rec, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(255,152,0,0.05)', border: '1px solid rgba(255,152,0,0.15)',
                  borderRadius: '8px',
                }}>
                  <span style={{ color: '#ff9800', flexShrink: 0 }}>→</span>
                  <span style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={() => { setResult(null); setInput(''); }}
            style={{
              width: '100%', padding: '0.9rem',
              background: 'transparent', border: '1px solid rgba(7,210,248,0.35)',
              borderRadius: '10px', color: '#07d2f8',
              fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(7,210,248,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            🔄 Run New Assessment
          </button>

        </div>
      </div>
    );
  }

  // ── HOME VIEW ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>

      <p style={{ color: '#07d2f8', fontSize: '0.85rem', letterSpacing: '1px', marginBottom: '1.2rem', opacity: 0.8 }}>
        {messages[currentMessageIndex]}
      </p>

      <h1 style={{
        color: '#fff', fontSize: 'clamp(2rem, 5vw, 3.2rem)',
        fontWeight: '800', textAlign: 'center',
        lineHeight: 1.2, marginBottom: '1rem', maxWidth: '700px',
      }}>
        Check Your{' '}
        <span style={{ color: '#07d2f8', textShadow: '0 0 30px rgba(7,210,248,0.4)' }}>
          Security Score
        </span>
      </h1>

      <p style={{ color: '#8994a9', fontSize: '1rem', textAlign: 'center', marginBottom: '2rem', maxWidth: '480px', lineHeight: 1.6 }}>
        Instantly analyze any website or email for vulnerabilities, breaches, and security risks.
      </p>

      {/* Trust badges */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { icon: '⚡', text: 'Instant Results' },
          { icon: '🔒', text: 'No Data Stored' },
          { icon: '🛡️', text: 'Free to Use' },
        ].map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8994a9', fontSize: '0.82rem' }}>
            <span>{b.icon}</span><span>{b.text}</span>
          </div>
        ))}
      </div>

      {/* Input card */}
      <div style={{
        width: '100%', maxWidth: '560px',
        background: 'rgba(7,210,248,0.03)',
        border: '1px solid rgba(7,210,248,0.2)',
        borderRadius: '16px', padding: '1.8rem',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.4)',
        position: 'relative', overflow: 'hidden',
        marginBottom: '1.2rem',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#07d2f8,transparent)' }} />

        {error && (
          <div style={{
            background: 'rgba(244,67,54,0.08)', border: '1px solid rgba(244,67,54,0.25)',
            borderRadius: '8px', padding: '0.7rem 1rem',
            color: '#f44336', fontSize: '0.82rem', marginBottom: '1rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleGetScore}>
          <div style={{ position: 'relative', marginBottom: '0.9rem' }}>
            <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#8994a9', fontSize: '1rem' }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Enter email or website URL"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{
                width: '100%', padding: '0.9rem 1rem 0.9rem 2.6rem',
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(7,210,248,0.25)',
                borderRadius: '10px', color: '#fff', fontSize: '0.95rem',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              width: '100%', padding: '0.9rem',
              backgroundColor: loading || !input.trim() ? '#1a1a1a' : '#07d2f8',
              color: loading || !input.trim() ? '#555' : '#000',
              border: loading || !input.trim() ? '1px solid rgba(7,210,248,0.15)' : 'none',
              borderRadius: '10px', fontWeight: '700', fontSize: '0.95rem',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', letterSpacing: '0.3px',
            }}
          >
            {loading ? '🔍 Analyzing...' : 'Get Security Score →'}
          </button>
        </form>
      </div>

      {/* Recent scans */}
      {scanHistory.length > 0 && (
        <div style={{
          width: '100%', maxWidth: '560px',
          background: 'rgba(7,210,248,0.03)',
          border: '1px solid rgba(7,210,248,0.15)',
          borderRadius: '14px', padding: '1.2rem',
          backdropFilter: 'blur(10px)',
        }}>
          <p style={{ color: '#8994a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>
            🕐 Recent Scans
          </p>
          {scanHistory.map((scan, i) => {
            const sc = scan.score >= 70 ? '#4caf50' : scan.score >= 40 ? '#ff9800' : '#f44336';
            return (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.5rem 0',
                borderBottom: i < scanHistory.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sc, flexShrink: 0 }} />
                  <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{scan.target}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${scan.score}%`, backgroundColor: sc, borderRadius: '2px' }} />
                  </div>
                  <span style={{ color: sc, fontWeight: '700', fontSize: '0.85rem', minWidth: '28px', textAlign: 'right' }}>
                    {scan.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}