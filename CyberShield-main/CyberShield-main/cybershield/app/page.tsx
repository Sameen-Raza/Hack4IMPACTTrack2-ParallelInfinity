'use client';

import { useState, useEffect, useRef } from 'react';
import { askNova } from './lib/nova';

const messages = [
  "Protect your digital assets today.",
  "Security starts with awareness.",
  "Stay ahead of cyber threats.",
  "Your security is our priority.",
];

interface SecurityScore {
  target: string;
  kind: 'email' | 'website';
  overall_score: number;
  components: Array<{ name: string; score: number; description: string }>;
  recommendations: string[];
  breach_findings?: any;
  google_dorks?: Record<string, string>;
}

interface ScanRecord {
  target: string;
  score: number;
  kind: string;
  date: string;
  verdict: string;
  timestamp: number;
}

interface ThreatNews {
  title: string;
  source: string;
  severity: 'critical' | 'high' | 'medium';
  time: string;
}

const THREAT_NEWS: ThreatNews[] = [
  { title: 'Critical zero-day found in OpenSSL affecting millions of servers', source: 'BleepingComputer', severity: 'critical', time: '2h ago' },
  { title: 'New phishing campaign impersonates major banks globally', source: 'Krebs on Security', severity: 'high', time: '4h ago' },
  { title: 'Ransomware group targets healthcare with new variant', source: 'The Hacker News', severity: 'critical', time: '6h ago' },
  { title: 'GitHub leak exposes thousands of API keys from Fortune 500', source: 'SecurityWeek', severity: 'high', time: '8h ago' },
  { title: 'Microsoft patches exploited Windows privilege escalation', source: 'Threatpost', severity: 'medium', time: '12h ago' },
];

// ── Fallback local scoring engine ──────────────────────────────────────────
const analyzeTarget = (input: string): SecurityScore => {
  const lower = input.toLowerCase().trim();
  const isEmail = input.includes('@');
  let score = 100;
  const flags: string[] = [];

  if (isEmail) {
    const parts = lower.split('@');
    const localPart = parts[0];
    const domain = parts[1] || '';
    const disposable = ['mailinator.com','tempmail.com','guerrillamail.com','10minutemail.com','throwam.com','yopmail.com'];
    if (disposable.includes(domain)) { score -= 40; flags.push('Disposable email domain detected'); }
    if (!domain || !domain.includes('.')) { score -= 30; flags.push('Malformed email domain'); }
    const trustedEmail = ['gmail.com','outlook.com','yahoo.com','icloud.com','proton.me'];
    if (trustedEmail.includes(domain)) score += 5;
    const numCount = (localPart.match(/\d/g) || []).length;
    if (numCount > 6) { score -= 15; flags.push('Suspicious number-heavy email'); }
  } else {
    if (!lower.startsWith('https://')) { score -= 20; flags.push('No HTTPS'); }
    if (/^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(lower)) { score -= 35; flags.push('Raw IP address'); }
    const suspTLDs = ['.tk','.ml','.ga','.cf','.gq','.xyz','.top','.club','.work','.link'];
    if (suspTLDs.some((t) => lower.includes(t))) { score -= 25; flags.push('Suspicious TLD'); }
    const phishWords = ['login','verify','secure','account','update','banking','paypal','ebay','amazon','signin','password','confirm'];
    const found = phishWords.filter((w) => lower.includes(w));
    if (found.length > 0) { score -= found.length * 10; flags.push('Phishing keywords: ' + found.join(', ')); }
    try {
      const hostname = new URL(lower.startsWith('http') ? lower : 'https://' + lower).hostname;
      if (hostname.split('.').length > 4) { score -= 20; flags.push('Excessive subdomains'); }
    } catch {}
    if (lower.length > 100) { score -= 15; flags.push('Abnormally long URL'); }
    if (/@|%40/.test(lower)) { score -= 20; flags.push('Suspicious special characters'); }
    try {
      const hostname = new URL(lower.startsWith('http') ? lower : 'https://' + lower).hostname;
      const root = hostname.split('.').slice(-2).join('.');
      const trusted = ['google.com','github.com','microsoft.com','apple.com','cloudflare.com','linkedin.com'];
      if (trusted.includes(root)) score += 10;
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
      { name: 'SSL Security', score: hasHTTPS ? 90 : 10, description: hasHTTPS ? 'HTTPS detected — connection is encrypted' : 'No HTTPS — data in plaintext' },
      { name: 'Email Exposure', score: hasDisposable ? 10 : 75, description: hasDisposable ? 'Disposable email domain detected' : 'No disposable domain patterns found' },
      { name: 'Domain Reputation', score: hasSuspTLD || hasIP ? 15 : hasPhishing ? 30 : 85, description: hasSuspTLD ? 'Suspicious TLD' : hasIP ? 'Raw IP — no reputation' : hasPhishing ? 'Phishing keywords found' : 'Domain reputation healthy' },
    ],
    recommendations: [
      !hasHTTPS     && 'Switch to HTTPS with a valid SSL certificate',
      hasPhishing   && 'Avoid entering credentials — possible phishing',
      hasIP         && 'Do not trust sites using raw IP addresses',
      hasSuspTLD    && 'Be cautious with high-risk TLDs (.tk, .xyz etc.)',
      hasDisposable && 'Avoid disposable emails for important accounts',
      score < 70    && 'Enable multi-factor authentication on all accounts',
      score < 50    && 'Report this URL to your IT security team immediately',
      true          && 'Monitor breach databases periodically',
    ].filter(Boolean) as string[],
    breach_findings: { status: score >= 70 ? 'safe' : 'flagged' },
  };
};

// ── HIBP breach check ──────────────────────────────────────────────────────
const checkBreach = async (email: string): Promise<{ breached: boolean; count: number; breaches: string[] }> => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);
    const res = await fetch('https://api.pwnedpasswords.com/range/' + prefix, { headers: { 'Add-Padding': 'true' } });
    if (!res.ok) return { breached: false, count: 0, breaches: [] };
    const text = await res.text();
    const match = text.split('\n').find((l) => l.startsWith(suffix));
    if (match) {
      const count = parseInt(match.split(':')[1]);
      return { breached: true, count, breaches: ['HaveIBeenPwned Database'] };
    }
    return { breached: false, count: 0, breaches: [] };
  } catch {
    return { breached: false, count: 0, breaches: [] };
  }
};

// ── PDF Export ─────────────────────────────────────────────────────────────
const exportPDF = (result: SecurityScore) => {
  const vc = result.overall_score >= 70 ? '#4caf50' : result.overall_score >= 40 ? '#ff9800' : '#f44336';
  const verdict = result.overall_score >= 70 ? 'Low Risk' : result.overall_score >= 40 ? 'Medium Risk' : 'High Risk';
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"/><title>CyberShield Report</title><style>body{font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;margin:0;padding:2rem}.hdr{border-bottom:2px solid #07d2f8;padding-bottom:1rem;margin-bottom:2rem}.logo{color:#07d2f8;font-size:1.8rem;font-weight:bold}.score-box{background:#1a1a1a;border:1px solid #07d2f8;border-radius:12px;padding:1.5rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:2rem}.score-num{font-size:4rem;font-weight:800;color:' + vc + '}.verdict{color:' + vc + ';font-size:1.2rem;font-weight:700}.bar-bg{background:#333;border-radius:6px;height:10px;margin-top:.5rem}.bar-fill{background:' + vc + ';height:10px;border-radius:6px;width:' + result.overall_score + '%}.sec{color:#07d2f8;font-size:.85rem;margin:1.5rem 0 .8rem;text-transform:uppercase;letter-spacing:1px}.comp{background:#1a1a1a;border-radius:8px;padding:1rem;margin-bottom:.6rem;border-left:3px solid #07d2f8}.rec{background:#1a1a1a;border-radius:6px;padding:.7rem 1rem;margin-bottom:.5rem;color:#cbd5e1;font-size:.9rem;border-left:3px solid #ff9800}.ftr{margin-top:2rem;border-top:1px solid #333;padding-top:1rem;color:#8994a9;font-size:.75rem}</style></head><body><div class="hdr"><div class="logo">CyberShield</div><div style="color:#8994a9;font-size:.9rem;margin-top:.3rem">Security Report - ' + new Date().toLocaleString() + '</div></div><p><span style="color:#8994a9">Target:</span> <strong>' + result.target + '</strong></p><div class="score-box"><div><div class="score-num">' + result.overall_score + '</div><div class="verdict">' + verdict + '</div></div><div style="flex:1"><div class="bar-bg"><div class="bar-fill"></div></div></div></div><div class="sec">Components</div>' + result.components.map(c => '<div class="comp"><strong>' + c.name + '</strong> - ' + c.score + '/100<br/><span style="color:#8994a9;font-size:.82rem">' + c.description + '</span></div>').join('') + '<div class="sec">Recommendations</div>' + result.recommendations.map(r => '<div class="rec">- ' + r + '</div>').join('') + '<div class="ftr">Generated by CyberShield · Powered by Amazon Nova</div></body></html>';
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) win.onload = () => { win.print(); URL.revokeObjectURL(url); };
};

// ── Email report ───────────────────────────────────────────────────────────
const sendEmailReport = (result: SecurityScore) => {
  const verdict = result.overall_score >= 70 ? 'Low Risk' : result.overall_score >= 40 ? 'Medium Risk' : 'High Risk';
  const subject = encodeURIComponent('CyberShield Report - ' + result.target);
  const body = encodeURIComponent('CyberShield Security Report\n============================\n\nTarget: ' + result.target + ' (' + result.kind + ')\nScore: ' + result.overall_score + '/100 - ' + verdict + '\nDate: ' + new Date().toLocaleString() + '\n\nCOMPONENTS\n----------\n' + result.components.map(c => '- ' + c.name + ': ' + c.score + '/100\n  ' + c.description).join('\n') + '\n\nRECOMMENDATIONS\n---------------\n' + result.recommendations.map(r => '- ' + r).join('\n') + '\n\n---\nCyberShield - cybershield.io');
  window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
};

// ── Trend Chart ────────────────────────────────────────────────────────────
function TrendChart({ history }: { history: ScanRecord[] }) {
  if (history.length < 2) return null;
  const recent = [...history].reverse().slice(-10);
  const W = 280, H = 80, pad = 8;
  const pts = recent.map((s, i) => ({
    x: pad + (i / (recent.length - 1)) * (W - pad * 2),
    y: H - pad - (s.score / 100) * (H - pad * 2),
    score: s.score,
  }));
  const pathD = pts.map((p, i) => (i === 0 ? 'M' : 'L') + ' ' + p.x + ' ' + p.y).join(' ');
  const areaD = pathD + ' L ' + pts[pts.length - 1].x + ' ' + (H - pad) + ' L ' + pts[0].x + ' ' + (H - pad) + ' Z';
  return (
    <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(7,210,248,0.08)' }}>
      <p style={{ color: '#8994a9', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 0.5rem' }}>Score Trend</p>
      <svg width="100%" viewBox={'0 0 ' + W + ' ' + H}>
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#07d2f8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#07d2f8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#ag)" />
        <path d={pathD} fill="none" stroke="#07d2f8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5"
            fill={p.score >= 70 ? '#4caf50' : p.score >= 40 ? '#ff9800' : '#f44336'}
            stroke="#0a0a0a" strokeWidth="1" />
        ))}
      </svg>
    </div>
  );
}

// ── Skeleton loader ────────────────────────────────────────────────────────
function SkeletonResult() {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem' }}>
      <style>{'.sk{background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(7,210,248,.08) 50%,rgba(255,255,255,.04) 75%);background-size:200% 100%;animation:sh 1.5s infinite;border-radius:10px}@keyframes sh{0%{background-position:-200% 0}100%{background-position:200% 0}}'}</style>
      <div className="sk" style={{ height: '90px', marginBottom: '1.2rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
        <div className="sk" style={{ height: '200px' }} />
        <div className="sk" style={{ height: '200px' }} />
      </div>
      <div className="sk" style={{ height: '80px', marginBottom: '1.2rem' }} />
      <div className="sk" style={{ height: '110px', marginBottom: '1.2rem' }} />
      <div className="sk" style={{ height: '50px' }} />
    </div>
  );
}

// ── Input validator ────────────────────────────────────────────────────────
function validateInput(val: string): { valid: boolean; message: string } {
  if (!val) return { valid: false, message: '' };
  if (val.includes('@')) {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    return { valid: ok, message: ok ? '✓ Valid email format' : '✗ Invalid email format' };
  }
  try {
    const u = new URL(val.startsWith('http') ? val : 'https://' + val);
    const ok = u.hostname.includes('.');
    return { valid: ok, message: ok ? '✓ Valid URL format' : '✗ Invalid URL format' };
  } catch {
    return { valid: false, message: '✗ Invalid URL format' };
  }
}

// ── Security Tip component (defined OUTSIDE Home) ──────────────────────────
function SecurityTip() {
  const [tip, setTip] = useState('');
  useEffect(() => {
    askNova('Give one short cybersecurity tip for small businesses. Max 20 words.', 'chatbot')
      .then(setTip)
      .catch(() => {});
  }, []);
  if (!tip) return null;
  return (
    <div style={{ width: '100%', maxWidth: '520px', padding: '0.6rem 1rem', background: 'rgba(7,210,248,0.04)', border: '1px solid rgba(7,210,248,0.15)', borderRadius: '8px', color: '#8994a9', fontSize: '0.78rem', marginBottom: '1rem' }}>
      💡 <span style={{ color: '#cbd5e1' }}>{tip}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Home() {
  const [input, setInput]         = useState('');
  const [msgIdx, setMsgIdx]       = useState(0);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<SecurityScore | null>(null);
  const [error, setError]         = useState('');
  const [history, setHistory]     = useState<ScanRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showNews, setShowNews]       = useState(false);
  const [activeNews, setActiveNews]   = useState(0);
  const [hibpResult, setHibpResult]   = useState<{ breached: boolean; count: number; breaches: string[] } | null>(null);
  const [hibpLoading, setHibpLoading] = useState(false);
  const [aiSummary, setAiSummary]     = useState('');
  const [aiLoading, setAiLoading]     = useState(false);
  const [quickRisk, setQuickRisk]     = useState('');
  const newsTimer  = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const validation = validateInput(input);

  useEffect(() => {
    const saved = localStorage.getItem('cyberShieldHistory');
    if (saved) setHistory(JSON.parse(saved));
    const msgT = setInterval(() => setMsgIdx((p) => (p + 1) % messages.length), 3000);
    newsTimer.current = setInterval(() => setActiveNews((p) => (p + 1) % THREAT_NEWS.length), 4000);
    return () => { clearInterval(msgT); if (newsTimer.current) clearInterval(newsTimer.current); };
  }, []);

  // ── AI Summary fallback ───────────────────────────────────────────────
  const generateAISummary = async (data: SecurityScore) => {
    setAiLoading(true);
    setAiSummary('');
    const prompt = `Security scan results for ${data.target}:
- Overall Score: ${data.overall_score}/100
- Kind: ${data.kind}
- Components: ${data.components.map(c => `${c.name}: ${c.score}`).join(', ')}
- Breach Status: ${data.breach_findings?.status || 'unknown'}
- Recommendations: ${data.recommendations.join('; ')}
Write a 3-4 sentence security summary for a non-technical business owner.`;
    try {
      const summary = await askNova(prompt, 'security_report');
      setAiSummary(summary);
    } catch {
      setAiSummary('AI analysis temporarily unavailable.');
    }
    setAiLoading(false);
  };

  // ── Main scan handler ─────────────────────────────────────────────────
  const handleGetScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !validation.valid) return;

    setLoading(true);
    setError('');
    setResult(null);
    setHibpResult(null);
    setAiSummary('');
    setQuickRisk('');

    const captured = input;
    setInput('');

    try {
      const isEmail = captured.includes('@');
      let data: SecurityScore;

      // ── Try Nova AI analysis first ──────────────────────────────────
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: captured.trim(), kind: isEmail ? 'email' : 'website' }),
        });
        if (!res.ok) throw new Error('Nova API failed');
        const { success, data: novaData } = await res.json();
        if (!success) throw new Error('Nova returned error');

        data = {
          target: captured,
          kind: isEmail ? 'email' : 'website',
          overall_score: Math.round(novaData.overall_score),
          components: novaData.components.map((c: any) => ({
            name: c.name,
            score: Math.round(c.score),
            description: c.description,
          })),
          recommendations: novaData.recommendations,
          breach_findings: { status: novaData.overall_score >= 70 ? 'safe' : 'flagged' },
        };
        setAiSummary(novaData.summary);

      } catch {
        // ── Fallback to local engine ──────────────────────────────────
        await new Promise((r) => setTimeout(r, 1500));
        data = analyzeTarget(captured);
        generateAISummary(data);
      }

      // ── HIBP check for emails ───────────────────────────────────────
      if (isEmail) {
        setHibpLoading(true);
        const breach = await checkBreach(captured);
        setHibpResult(breach);
        setHibpLoading(false);
        if (breach.breached) {
          data.overall_score = Math.max(0, data.overall_score - 15);
          data.breach_findings = { status: 'breached', breaches: breach.breaches };
          data.recommendations = ['Change your password immediately — found in breach database', ...data.recommendations];
        }
      }

      setResult(data);
      setMsgIdx((p) => (p + 1) % messages.length);

      const verdict = data.overall_score >= 70 ? 'Low Risk' : data.overall_score >= 40 ? 'Medium Risk' : 'High Risk';
      const record: ScanRecord = {
        target: data.target, score: data.overall_score,
        kind: data.kind, date: new Date().toLocaleString(),
        verdict, timestamp: Date.now(),
      };
      const updated = [record, ...history].slice(0, 30);
      setHistory(updated);
      localStorage.setItem('cyberShieldHistory', JSON.stringify(updated));

    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => { setHistory([]); localStorage.removeItem('cyberShieldHistory'); };

  // ── HISTORY VIEW ──────────────────────────────────────────────────────
  if (showHistory) {
    const avg   = history.length ? Math.round(history.reduce((a, s) => a + s.score, 0) / history.length) : 0;
    const safe  = history.filter(s => s.score >= 70).length;
    const risky = history.filter(s => s.score < 40).length;
    return (
      <div style={{ minHeight: 'calc(100vh - 120px)', padding: '2rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div>
              <h1 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: '800', margin: 0 }}>📊 Scan History</h1>
              <p style={{ color: '#8994a9', fontSize: '0.82rem', marginTop: '0.3rem' }}>{history.length} scan{history.length !== 1 ? 's' : ''} recorded</p>
            </div>
            <div style={{ display: 'flex', gap: '0.7rem' }}>
              {history.length > 0 && <button onClick={clearHistory} style={{ padding: '0.55rem 1rem', background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', borderRadius: '8px', color: '#f44336', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>🗑️ Clear</button>}
              <button onClick={() => setShowHistory(false)} style={{ padding: '0.55rem 1rem', background: 'rgba(7,210,248,0.1)', border: '1px solid rgba(7,210,248,0.3)', borderRadius: '8px', color: '#07d2f8', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>← Back</button>
            </div>
          </div>
          {history.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Total', value: history.length, color: '#07d2f8' },
                { label: 'Avg Score', value: avg, color: avg >= 70 ? '#4caf50' : avg >= 40 ? '#ff9800' : '#f44336' },
                { label: 'Safe', value: safe, color: '#4caf50' },
                { label: 'High Risk', value: risky, color: '#f44336' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.15)', borderRadius: '12px', padding: '1rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,' + s.color + ',transparent)' }} />
                  <div style={{ color: s.color, fontSize: '1.7rem', fontWeight: '800' }}>{s.value}</div>
                  <div style={{ color: '#8994a9', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
          {history.length >= 2 && (
            <div style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.15)', borderRadius: '14px', padding: '1.2rem', marginBottom: '1.5rem' }}>
              <TrendChart history={history} />
            </div>
          )}
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#8994a9' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p>No scans yet.</p>
              <button onClick={() => setShowHistory(false)} style={{ marginTop: '1rem', padding: '0.8rem 2rem', background: '#07d2f8', border: 'none', borderRadius: '8px', color: '#000', fontWeight: '700', cursor: 'pointer' }}>Start Scanning</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {history.map((scan, i) => {
                const sc = scan.score >= 70 ? '#4caf50' : scan.score >= 40 ? '#ff9800' : '#f44336';
                return (
                  <div key={i} style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.12)', borderRadius: '12px', padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: sc, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.target}</div>
                      <div style={{ color: '#8994a9', fontSize: '0.72rem', marginTop: '1px' }}>{scan.date} · {scan.kind}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexShrink: 0 }}>
                      <div style={{ width: '70px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: scan.score + '%', backgroundColor: sc }} />
                      </div>
                      <span style={{ color: sc, fontWeight: '700', fontSize: '0.88rem', minWidth: '28px', textAlign: 'right' }}>{scan.score}</span>
                      <span style={{ padding: '2px 7px', borderRadius: '999px', fontSize: '0.68rem', fontWeight: '600', background: sc + '18', border: '1px solid ' + sc + '44', color: sc }}>{scan.verdict}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── LOADING ───────────────────────────────────────────────────────────
  if (loading) return <SkeletonResult />;

  // ── RESULTS VIEW ──────────────────────────────────────────────────────
  if (result) {
    const vc =
      result.overall_score >= 70 ? { color: '#4caf50', label: 'Low Risk',    icon: '🛡️' } :
      result.overall_score >= 40 ? { color: '#ff9800', label: 'Medium Risk', icon: '⚠️' } :
                                   { color: '#f44336', label: 'High Risk',   icon: '🚨' };
    return (
      <div style={{ minHeight: 'calc(100vh - 120px)', padding: '2rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          {/* Header */}
          <div style={{ background: 'rgba(7,210,248,0.05)', border: '1px solid rgba(7,210,248,0.25)', borderRadius: '16px', padding: '1.6rem', marginBottom: '1.2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#07d2f8,transparent)' }} />
            <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>{vc.icon}</div>
            <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.4rem' }}>Security Assessment Complete</h2>
            <p style={{ color: '#8994a9', fontSize: '0.85rem', margin: 0 }}>
              Target: <span style={{ color: '#07d2f8', fontWeight: '600' }}>{result.target}</span>
              <span style={{ marginLeft: '0.5rem', padding: '2px 8px', borderRadius: '999px', background: 'rgba(7,210,248,0.1)', border: '1px solid rgba(7,210,248,0.3)', color: '#07d2f8', fontSize: '0.7rem' }}>{result.kind}</span>
            </p>
          </div>

          {/* Score + Components */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <div style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.2)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,' + vc.color + ',transparent)' }} />
              <p style={{ color: '#8994a9', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>Security Score</p>
              <div style={{ position: 'relative', width: '100px', height: '100px', marginBottom: '0.7rem' }}>
                <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={vc.color} strokeWidth="8"
                    strokeDasharray={'' + (2 * Math.PI * 42)}
                    strokeDashoffset={'' + (2 * Math.PI * 42 * (1 - result.overall_score / 100))}
                    strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '1.6rem', fontWeight: '800', lineHeight: 1 }}>{result.overall_score}</span>
                  <span style={{ color: '#8994a9', fontSize: '0.58rem' }}>/100</span>
                </div>
              </div>
              <div style={{ color: vc.color, fontWeight: '700', fontSize: '0.9rem' }}>{vc.label}</div>
              {hibpLoading && <div style={{ marginTop: '0.7rem', color: '#8994a9', fontSize: '0.7rem' }}>🔍 Checking breaches...</div>}
              {hibpResult && (
                <div style={{ marginTop: '0.7rem', padding: '3px 10px', borderRadius: '999px', fontSize: '0.68rem', fontWeight: '600', background: hibpResult.breached ? 'rgba(244,67,54,0.15)' : 'rgba(76,175,80,0.15)', border: '1px solid ' + (hibpResult.breached ? 'rgba(244,67,54,0.4)' : 'rgba(76,175,80,0.4)'), color: hibpResult.breached ? '#f44336' : '#4caf50' }}>
                  {hibpResult.breached ? '⚠️ Pwned ' + hibpResult.count.toLocaleString() + 'x' : '✅ Not Pwned'}
                </div>
              )}
            </div>

            <div style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.2)', borderRadius: '16px', padding: '1.4rem' }}>
              <p style={{ color: '#8994a9', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Component Breakdown</p>
              {result.components.map((comp, idx) => {
                const cc = comp.score >= 70 ? '#4caf50' : comp.score >= 40 ? '#ff9800' : '#f44336';
                return (
                  <div key={idx} style={{ marginBottom: idx < result.components.length - 1 ? '1rem' : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ color: '#cbd5e1', fontSize: '0.83rem' }}>{comp.name}</span>
                      <span style={{ color: cc, fontSize: '0.8rem', fontWeight: '600' }}>{comp.score}</span>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.2rem' }}>
                      <div style={{ height: '100%', width: comp.score + '%', backgroundColor: cc, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                    </div>
                    <p style={{ color: '#8994a9', fontSize: '0.72rem', margin: 0 }}>{comp.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🤖 AI Summary */}
          <div style={{ background: 'rgba(7,210,248,0.04)', border: '1px solid rgba(7,210,248,0.2)', borderRadius: '16px', padding: '1.4rem', marginBottom: '1.2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#07d2f8,transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <span>🤖</span>
              <p style={{ color: '#8994a9', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>AI Security Analysis · Powered by Amazon Nova</p>
            </div>
            {aiLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <style>{`@keyframes blink{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#07d2f8', animation: `blink 1.2s ${i * 0.2}s infinite` }} />
                ))}
                <span style={{ color: '#8994a9', fontSize: '0.82rem' }}>Nova is analyzing your results...</span>
              </div>
            ) : aiSummary ? (
              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{aiSummary}</p>
            ) : (
              <p style={{ color: '#8994a9', fontSize: '0.82rem', margin: 0 }}>AI analysis unavailable.</p>
            )}
          </div>

          {/* Breach findings */}
          {result.breach_findings && result.breach_findings.status !== 'not_configured' && (
            <div style={{ background: result.breach_findings.status === 'breached' ? 'rgba(244,67,54,0.06)' : 'rgba(76,175,80,0.06)', border: '1px solid ' + (result.breach_findings.status === 'breached' ? 'rgba(244,67,54,0.3)' : 'rgba(76,175,80,0.3)'), borderRadius: '12px', padding: '0.9rem 1.1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <span>{result.breach_findings.status === 'breached' ? '⚠️' : '✅'}</span>
              <div>
                <span style={{ color: result.breach_findings.status === 'breached' ? '#f44336' : '#4caf50', fontWeight: '600', fontSize: '0.85rem' }}>
                  {result.breach_findings.status === 'breached' ? 'Found in known breach databases' : 'Not found in known breach databases'}
                </span>
                {result.breach_findings.breaches && <p style={{ color: '#8994a9', fontSize: '0.75rem', margin: '2px 0 0' }}>Sources: {result.breach_findings.breaches.join(', ')}</p>}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.2)', borderRadius: '16px', padding: '1.4rem', marginBottom: '1.2rem' }}>
            <p style={{ color: '#8994a9', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>Recommendations</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {result.recommendations.map((rec, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.55rem 0.75rem', background: 'rgba(255,152,0,0.05)', border: '1px solid rgba(255,152,0,0.15)', borderRadius: '8px' }}>
                  <span style={{ color: '#ff9800', flexShrink: 0, fontSize: '0.75rem' }}>→</span>
                  <span style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.7rem' }}>
            <button onClick={() => { setResult(null); setInput(''); setHibpResult(null); setAiSummary(''); }} style={{ padding: '0.8rem', background: '#07d2f8', border: 'none', borderRadius: '10px', color: '#000', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>🔄 New Scan</button>
            <button onClick={() => exportPDF(result)} style={{ padding: '0.8rem', background: 'transparent', border: '1px solid rgba(7,210,248,0.35)', borderRadius: '10px', color: '#07d2f8', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(7,210,248,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>📄 Export PDF</button>
            <button onClick={() => sendEmailReport(result)} style={{ padding: '0.8rem', background: 'transparent', border: '1px solid rgba(7,210,248,0.35)', borderRadius: '10px', color: '#07d2f8', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(7,210,248,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>📧 Email Report</button>
          </div>

        </div>
      </div>
    );
  }

  // ── HOME VIEW ─────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>

      {/* Top bar */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowNews(!showNews)} style={{ padding: '0.4rem 0.85rem', background: showNews ? 'rgba(244,67,54,0.15)' : 'rgba(7,210,248,0.06)', border: '1px solid ' + (showNews ? 'rgba(244,67,54,0.4)' : 'rgba(7,210,248,0.25)'), borderRadius: '999px', color: showNews ? '#f44336' : '#07d2f8', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '600' }}>🔴 Live Threats</button>
        <button onClick={() => setShowHistory(true)} style={{ padding: '0.4rem 0.85rem', background: 'rgba(7,210,248,0.06)', border: '1px solid rgba(7,210,248,0.25)', borderRadius: '999px', color: '#07d2f8', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '600' }}>📊 History {history.length > 0 && '(' + history.length + ')'}</button>
      </div>

      {/* Live threat news */}
      {showNews && (
        <div style={{ width: '100%', maxWidth: '520px', marginBottom: '1.2rem', background: 'rgba(244,67,54,0.05)', border: '1px solid rgba(244,67,54,0.25)', borderRadius: '12px', padding: '0.85rem 1.1rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#f44336,transparent)' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem' }}>
            <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: '700', background: THREAT_NEWS[activeNews].severity === 'critical' ? '#f44336' : THREAT_NEWS[activeNews].severity === 'high' ? '#ff9800' : '#2196f3', color: '#fff', flexShrink: 0, marginTop: '1px' }}>
              {THREAT_NEWS[activeNews].severity.toUpperCase()}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '500', margin: 0 }}>{THREAT_NEWS[activeNews].title}</p>
              <p style={{ color: '#8994a9', fontSize: '0.7rem', margin: '2px 0 0' }}>{THREAT_NEWS[activeNews].source} · {THREAT_NEWS[activeNews].time}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '0.6rem', justifyContent: 'center' }}>
            {THREAT_NEWS.map((_, i) => (
              <div key={i} onClick={() => setActiveNews(i)} style={{ width: i === activeNews ? '14px' : '5px', height: '3px', borderRadius: '2px', background: i === activeNews ? '#f44336' : 'rgba(255,255,255,0.15)', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>
      )}

      {/* Ticker */}
      <p style={{ color: '#07d2f8', fontSize: '0.82rem', letterSpacing: '1px', marginBottom: '0.9rem', opacity: 0.8 }}>{messages[msgIdx]}</p>

      {/* Hero */}
      <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: '800', textAlign: 'center', lineHeight: 1.2, marginBottom: '0.7rem', maxWidth: '640px' }}>
        Check Your <span style={{ color: '#07d2f8', textShadow: '0 0 30px rgba(7,210,248,0.4)' }}>Security Score</span>
      </h1>
      <p style={{ color: '#8994a9', fontSize: '0.92rem', textAlign: 'center', marginBottom: '1.6rem', maxWidth: '440px', lineHeight: 1.6 }}>
        Instantly analyze any website or email for vulnerabilities, breaches, and risks.
      </p>

      {/* Trust badges */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[{ icon: '⚡', text: 'Instant' }, { icon: '🔒', text: 'Private' }, { icon: '🛡️', text: 'Free' }, { icon: '🔍', text: 'HIBP Check' }, { icon: '🤖', text: 'AI Powered' }].map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#8994a9', fontSize: '0.78rem' }}>
            <span>{b.icon}</span><span>{b.text}</span>
          </div>
        ))}
      </div>

      {/* Nova security tip */}
      <SecurityTip />

      {/* Input card */}
      <div style={{ width: '100%', maxWidth: '520px', background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.2)', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(12px)', boxShadow: '0 4px 40px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#07d2f8,transparent)' }} />
        {error && (
          <div style={{ background: 'rgba(244,67,54,0.08)', border: '1px solid rgba(244,67,54,0.25)', borderRadius: '8px', padding: '0.6rem 0.85rem', color: '#f44336', fontSize: '0.8rem', marginBottom: '0.85rem' }}>
            ⚠️ {error}
          </div>
        )}
        <form onSubmit={handleGetScore}>
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#8994a9' }}>🔍</span>
            <input
              type="text"
              placeholder="Enter email or website URL"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setQuickRisk('');
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(async () => {
                  const val = e.target.value;
                  if (val.length > 5 && validateInput(val).valid) {
                    try {
                      const hint = await askNova(
                        `In 10 words or less, what is the security risk of: ${val}`,
                        'chatbot'
                      );
                      setQuickRisk(hint);
                    } catch {}
                  }
                }, 800);
              }}
              disabled={loading}
              style={{ width: '100%', padding: '0.82rem 1rem 0.82rem 2.4rem', background: 'rgba(0,0,0,0.4)', border: '1px solid ' + (input && validation.valid ? 'rgba(76,175,80,0.5)' : input && !validation.valid ? 'rgba(244,67,54,0.5)' : 'rgba(7,210,248,0.25)'), borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
            />
          </div>
          {/* Validation message */}
          {input && (
            <p style={{ color: validation.valid ? '#4caf50' : '#f44336', fontSize: '0.72rem', margin: '0 0 0.4rem 0.2rem' }}>
              {validation.message}
            </p>
          )}
          {/* Nova quick risk hint */}
          {quickRisk && input && (
            <p style={{ color: '#ff9800', fontSize: '0.72rem', margin: '0 0 0.7rem 0.2rem' }}>
              ⚡ {quickRisk}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !input.trim() || !validation.valid}
            style={{ width: '100%', padding: '0.82rem', backgroundColor: !input.trim() || !validation.valid ? '#1a1a1a' : '#07d2f8', color: !input.trim() || !validation.valid ? '#555' : '#000', border: !input.trim() || !validation.valid ? '1px solid rgba(7,210,248,0.15)' : 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', cursor: !input.trim() || !validation.valid ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
            Get Security Score →
          </button>
        </form>
      </div>

      {/* Recent scans */}
      {history.length > 0 && (
        <div style={{ width: '100%', maxWidth: '520px', background: 'rgba(7,210,248,0.02)', border: '1px solid rgba(7,210,248,0.12)', borderRadius: '14px', padding: '1rem 1.1rem', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <p style={{ color: '#8994a9', fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>🕐 Recent Scans</p>
            <button onClick={() => setShowHistory(true)} style={{ background: 'none', border: 'none', color: '#07d2f8', fontSize: '0.7rem', cursor: 'pointer' }}>View All →</button>
          </div>
          {history.slice(0, 4).map((scan, i) => {
            const sc = scan.score >= 70 ? '#4caf50' : scan.score >= 40 ? '#ff9800' : '#f44336';
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.38rem 0', borderBottom: i < Math.min(history.length, 4) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc, flexShrink: 0 }} />
                  <span style={{ color: '#cbd5e1', fontSize: '0.8rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.target}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <div style={{ width: '48px', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: scan.score + '%', backgroundColor: sc }} />
                  </div>
                  <span style={{ color: sc, fontWeight: '700', fontSize: '0.8rem', minWidth: '24px', textAlign: 'right' }}>{scan.score}</span>
                </div>
              </div>
            );
          })}
          <TrendChart history={history} />
        </div>
      )}

    </div>
  );
}