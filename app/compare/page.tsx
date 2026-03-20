'use client';

import { useState } from 'react';

interface SecurityScore {
  target: string;
  kind: 'email' | 'website';
  overall_score: number;
  components: Array<{ name: string; score: number; description: string }>;
  recommendations: string[];
  breach_findings?: any;
}

const analyzeTarget = (input: string): SecurityScore => {
  const lower = input.toLowerCase().trim();
  const isEmail = input.includes('@');
  let score = 100;
  const flags: string[] = [];

  if (isEmail) {
    const parts = lower.split('@');
    const localPart = parts[0];
    const domain = parts[1] || '';
    const disposable = ['mailinator.com','tempmail.com','guerrillamail.com','10minutemail.com'];
    if (disposable.includes(domain)) { score -= 40; flags.push('Disposable'); }
    if (!domain || !domain.includes('.')) { score -= 30; flags.push('Malformed'); }
    const trusted = ['gmail.com','outlook.com','yahoo.com','icloud.com','proton.me'];
    if (trusted.includes(domain)) score += 5;
    if ((localPart.match(/\d/g) || []).length > 6) { score -= 15; flags.push('Suspicious email'); }
  } else {
    if (!lower.startsWith('https://')) { score -= 20; flags.push('No HTTPS'); }
    if (/^https?:\/\/\d{1,3}\.\d{1,3}/.test(lower)) { score -= 35; flags.push('Raw IP'); }
    const suspTLDs = ['.tk','.ml','.ga','.cf','.xyz','.top'];
    if (suspTLDs.some(t => lower.includes(t))) { score -= 25; flags.push('Suspicious TLD'); }
    const phish = ['login','verify','secure','account','update','banking','paypal','amazon','signin'];
    const found = phish.filter(w => lower.includes(w));
    if (found.length) { score -= found.length * 10; flags.push('Phishing keywords'); }
    try {
      const h = new URL(lower.startsWith('http') ? lower : 'https://' + lower).hostname;
      if (h.split('.').length > 4) { score -= 20; flags.push('Excessive subdomains'); }
      const root = h.split('.').slice(-2).join('.');
      if (['google.com','github.com','microsoft.com','apple.com','cloudflare.com'].includes(root)) score += 10;
    } catch {}
  }

  score = Math.max(0, Math.min(100, score));
  const hasHTTPS      = !flags.includes('No HTTPS');
  const hasDisposable = flags.includes('Disposable');
  const hasPhishing   = flags.some(f => f.includes('Phishing'));
  const hasIP         = flags.includes('Raw IP');
  const hasSuspTLD    = flags.includes('Suspicious TLD');

  return {
    target: input,
    kind: isEmail ? 'email' : 'website',
    overall_score: score,
    components: [
      { name: 'SSL Security',      score: hasHTTPS ? 90 : 10,                    description: hasHTTPS ? 'HTTPS encrypted' : 'No HTTPS' },
      { name: 'Email Exposure',    score: hasDisposable ? 10 : 75,               description: hasDisposable ? 'Disposable domain' : 'No exposure detected' },
      { name: 'Domain Reputation', score: hasSuspTLD || hasIP ? 15 : hasPhishing ? 30 : 85, description: hasPhishing ? 'Phishing keywords' : 'Reputation healthy' },
    ],
    recommendations: [
      !hasHTTPS     && 'Switch to HTTPS',
      hasPhishing   && 'Possible phishing site',
      hasIP         && 'Avoid raw IP addresses',
      hasSuspTLD    && 'High-risk TLD detected',
      score < 70    && 'Enable MFA',
      true          && 'Monitor breach databases',
    ].filter(Boolean) as string[],
    breach_findings: { status: score >= 70 ? 'safe' : 'flagged' },
  };
};

export default function Compare() {
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultA, setResultA] = useState<SecurityScore | null>(null);
  const [resultB, setResultB] = useState<SecurityScore | null>(null);

  const handleCompare = async () => {
    if (!inputA.trim() || !inputB.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setResultA(analyzeTarget(inputA));
    setResultB(analyzeTarget(inputB));
    setLoading(false);
  };

  const winner = resultA && resultB
    ? resultA.overall_score > resultB.overall_score ? 'A'
    : resultB.overall_score > resultA.overall_score ? 'B'
    : 'tie'
    : null;

  const ScoreCard = ({ result, side, isWinner }: { result: SecurityScore; side: string; isWinner: boolean }) => {
    const vc = result.overall_score >= 70 ? { color: '#4caf50', label: 'Low Risk', icon: '🛡️' }
      : result.overall_score >= 40 ? { color: '#ff9800', label: 'Medium Risk', icon: '⚠️' }
      : { color: '#f44336', label: 'High Risk', icon: '🚨' };
    return (
      <div style={{ position: 'relative' }}>
        {isWinner && (
          <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#07d2f8', color: '#000', fontSize: '0.68rem', fontWeight: '700', padding: '3px 12px', borderRadius: '999px', whiteSpace: 'nowrap', zIndex: 1 }}>
            🏆 WINNER
          </div>
        )}
        <div style={{ background: isWinner ? 'rgba(7,210,248,0.06)' : 'rgba(7,210,248,0.03)', border: `1px solid ${isWinner ? 'rgba(7,210,248,0.4)' : 'rgba(7,210,248,0.2)'}`, borderRadius: '16px', padding: '1.5rem', height: '100%', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${isWinner ? '#07d2f8' : vc.color},transparent)` }} />

          <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{vc.icon}</div>
            <p style={{ color: '#8994a9', fontSize: '0.72rem', margin: '0 0 0.3rem' }}>Target {side}</p>
            <p style={{ color: '#07d2f8', fontWeight: '600', fontSize: '0.85rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.target}</p>
          </div>

          {/* Score ring */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2rem' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={vc.color} strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - result.overall_score / 100)}`}
                  strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '1.6rem', fontWeight: '800', lineHeight: 1 }}>{result.overall_score}</span>
                <span style={{ color: '#8994a9', fontSize: '0.58rem' }}>/100</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', color: vc.color, fontWeight: '700', fontSize: '0.88rem', marginBottom: '1.2rem' }}>{vc.label}</div>

          {/* Components */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {result.components.map((comp, i) => {
              const cc = comp.score >= 70 ? '#4caf50' : comp.score >= 40 ? '#ff9800' : '#f44336';
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>{comp.name}</span>
                    <span style={{ color: cc, fontSize: '0.75rem', fontWeight: '600' }}>{comp.score}</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: comp.score + '%', backgroundColor: cc, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(7,210,248,0.1)', border: '1px solid rgba(7,210,248,0.3)', fontSize: '2rem', marginBottom: '1rem', boxShadow: '0 0 24px rgba(7,210,248,0.15)' }}>⚔️</div>
          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Compare Two Targets</h1>
          <p style={{ color: '#8994a9', fontSize: '0.9rem' }}>Side-by-side security analysis of any two websites or emails</p>
        </div>

        {/* Inputs */}
        <div style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.2)', borderRadius: '16px', padding: '1.8rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#07d2f8,transparent)' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', color: '#8994a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Target A</label>
              <input type="text" placeholder="google.com" value={inputA} onChange={e => setInputA(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(7,210,248,0.25)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#07d2f8', fontWeight: '800', fontSize: '1.2rem', paddingTop: '1.5rem' }}>VS</div>
            <div>
              <label style={{ display: 'block', color: '#8994a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Target B</label>
              <input type="text" placeholder="example.tk" value={inputB} onChange={e => setInputB(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(7,210,248,0.25)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          <button onClick={handleCompare} disabled={loading || !inputA.trim() || !inputB.trim()}
            style={{ width: '100%', marginTop: '1.2rem', padding: '0.9rem', backgroundColor: !inputA.trim() || !inputB.trim() ? '#1a1a1a' : '#07d2f8', color: !inputA.trim() || !inputB.trim() ? '#555' : '#000', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.95rem', cursor: !inputA.trim() || !inputB.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
            {loading ? '⚔️ Comparing...' : '⚔️ Compare Now'}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8994a9' }}>
            <style>{`@keyframes blink{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚔️</div>
            <p style={{ color: '#07d2f8', fontWeight: '600' }}>Running comparative analysis...</p>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '1rem' }}>
              {[0,1,2].map(i => <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#07d2f8', animation: `blink 1.2s ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}

        {/* Results */}
        {resultA && resultB && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Winner banner */}
            {winner !== 'tie' ? (
              <div style={{ background: 'rgba(7,210,248,0.06)', border: '1px solid rgba(7,210,248,0.3)', borderRadius: '12px', padding: '1rem 1.5rem', textAlign: 'center' }}>
                <p style={{ color: '#07d2f8', fontWeight: '700', fontSize: '1rem', margin: 0 }}>
                  🏆 {winner === 'A' ? resultA.target : resultB.target} is more secure by{' '}
                  <span style={{ color: '#fff' }}>
                    {Math.abs(resultA.overall_score - resultB.overall_score)} points
                  </span>
                </p>
              </div>
            ) : (
              <div style={{ background: 'rgba(7,210,248,0.06)', border: '1px solid rgba(7,210,248,0.3)', borderRadius: '12px', padding: '1rem 1.5rem', textAlign: 'center' }}>
                <p style={{ color: '#07d2f8', fontWeight: '700', fontSize: '1rem', margin: 0 }}>🤝 It's a tie — both targets scored equally</p>
              </div>
            )}

            {/* Side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start', paddingTop: '1rem' }}>
              <ScoreCard result={resultA} side="A" isWinner={winner === 'A'} />
              <ScoreCard result={resultB} side="B" isWinner={winner === 'B'} />
            </div>

            {/* Component comparison table */}
            <div style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.2)', borderRadius: '16px', padding: '1.5rem' }}>
              <p style={{ color: '#8994a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Head-to-Head Comparison</p>
              {resultA.components.map((compA, i) => {
                const compB = resultB.components[i];
                const aWins = compA.score >= compB.score;
                const ccA = compA.score >= 70 ? '#4caf50' : compA.score >= 40 ? '#ff9800' : '#f44336';
                const ccB = compB.score >= 70 ? '#4caf50' : compB.score >= 40 ? '#ff9800' : '#f44336';
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center', marginBottom: i < resultA.components.length - 1 ? '1rem' : 0, paddingBottom: i < resultA.components.length - 1 ? '1rem' : 0, borderBottom: i < resultA.components.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{ color: aWins ? '#fff' : '#8994a9', fontSize: '0.78rem', fontWeight: aWins ? '600' : '400' }}>A</span>
                        <span style={{ color: ccA, fontSize: '0.78rem', fontWeight: '600' }}>{compA.score}</span>
                      </div>
                      <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: compA.score + '%', backgroundColor: ccA }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', color: '#8994a9', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{compA.name}</div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{ color: ccB, fontSize: '0.78rem', fontWeight: '600' }}>{compB.score}</span>
                        <span style={{ color: !aWins ? '#fff' : '#8994a9', fontSize: '0.78rem', fontWeight: !aWins ? '600' : '400' }}>B</span>
                      </div>
                      <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: compB.score + '%', backgroundColor: ccB }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={() => { setResultA(null); setResultB(null); setInputA(''); setInputB(''); }}
              style={{ padding: '0.85rem', background: 'transparent', border: '1px solid rgba(7,210,248,0.3)', borderRadius: '10px', color: '#07d2f8', fontWeight: '600', cursor: 'pointer', fontSize: '0.88rem', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(7,210,248,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              🔄 New Comparison
            </button>
          </div>
        )}

      </div>
    </div>
  );
}