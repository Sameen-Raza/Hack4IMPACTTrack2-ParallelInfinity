'use client';

import { useState, useEffect } from 'react';

interface ScanRecord {
  target: string;
  score: number;
  kind: string;
  date: string;
  verdict: string;
  timestamp: number;
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, backgroundColor: color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
    </div>
  );
}

function DonutChart({ safe, medium, risky }: { safe: number; medium: number; risky: number }) {
  const total = safe + medium + risky;
  if (total === 0) return null;
  const r = 60, cx = 70, cy = 70;
  const circumference = 2 * Math.PI * r;
  const safeP   = (safe   / total) * circumference;
  const medP    = (medium / total) * circumference;
  const riskyP  = (risky  / total) * circumference;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="16" />
        {risky > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f44336" strokeWidth="16"
          strokeDasharray={`${riskyP} ${circumference - riskyP}`}
          strokeDashoffset={0} />}
        {medium > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ff9800" strokeWidth="16"
          strokeDasharray={`${medP} ${circumference - medP}`}
          strokeDashoffset={-riskyP} />}
        {safe > 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4caf50" strokeWidth="16"
          strokeDasharray={`${safeP} ${circumference - safeP}`}
          strokeDashoffset={-(riskyP + medP)} />}
        <text x={cx} y={cy + 5} textAnchor="middle" fill="#fff" fontSize="18" fontWeight="800" style={{ transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px` }}>{total}</text>
        <text x={cx} y={cy + 20} textAnchor="middle" fill="#8994a9" fontSize="9" style={{ transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px` }}>SCANS</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {[{ label: 'Safe', count: safe, color: '#4caf50' }, { label: 'Medium Risk', count: medium, color: '#ff9800' }, { label: 'High Risk', count: risky, color: '#f44336' }].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
            <span style={{ color: '#8994a9', fontSize: '0.78rem' }}>{item.label}</span>
            <span style={{ color: item.color, fontWeight: '700', fontSize: '0.82rem', marginLeft: 'auto' }}>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [history, setHistory] = useState<ScanRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cyberShieldHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const safe   = history.filter(s => s.score >= 70).length;
  const medium = history.filter(s => s.score >= 40 && s.score < 70).length;
  const risky  = history.filter(s => s.score < 40).length;
  const avg    = history.length ? Math.round(history.reduce((a, s) => a + s.score, 0) / history.length) : 0;
  const emails   = history.filter(s => s.kind === 'email').length;
  const websites = history.filter(s => s.kind === 'website').length;

  // Top domains
  const domainCount: Record<string, { count: number; avgScore: number; scores: number[] }> = {};
  history.forEach(s => {
    const key = s.target.replace(/^https?:\/\//, '').split('/')[0].split('@').pop() || s.target;
    if (!domainCount[key]) domainCount[key] = { count: 0, avgScore: 0, scores: [] };
    domainCount[key].count++;
    domainCount[key].scores.push(s.score);
  });
  Object.keys(domainCount).forEach(k => {
    const d = domainCount[k];
    d.avgScore = Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length);
  });
  const topDomains = Object.entries(domainCount).sort((a, b) => b[1].count - a[1].count).slice(0, 5);

  // Score distribution
  const distribution = [
    { range: '90-100', count: history.filter(s => s.score >= 90).length, color: '#4caf50' },
    { range: '70-89',  count: history.filter(s => s.score >= 70 && s.score < 90).length, color: '#8bc34a' },
    { range: '40-69',  count: history.filter(s => s.score >= 40 && s.score < 70).length, color: '#ff9800' },
    { range: '0-39',   count: history.filter(s => s.score < 40).length, color: '#f44336' },
  ];
  const maxDist = Math.max(...distribution.map(d => d.count), 1);

  // Recent activity (last 7 days by day)
  const now = Date.now();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 86400000);
    const label = d.toLocaleDateString('en', { weekday: 'short' });
    const count = history.filter(s => {
      const sd = new Date(s.timestamp || 0);
      return sd.toDateString() === d.toDateString();
    }).length;
    return { label, count };
  });
  const maxDay = Math.max(...days.map(d => d.count), 1);

  // Export CSV
  const exportCSV = () => {
    const header = 'Target,Score,Kind,Verdict,Date\n';
    const rows = history.map(s => `"${s.target}",${s.score},${s.kind},${s.verdict},"${s.date}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'cybershield-history.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (history.length === 0) {
    return (
      <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
        <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>No Data Yet</h2>
        <p style={{ color: '#8994a9', marginBottom: '1.5rem' }}>Run some security scans on the home page to see your analytics here.</p>
        <a href="/" style={{ padding: '0.8rem 2rem', background: '#07d2f8', borderRadius: '10px', color: '#000', fontWeight: '700', textDecoration: 'none' }}>Start Scanning</a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>📊 Security Dashboard</h1>
            <p style={{ color: '#8994a9', fontSize: '0.82rem', marginTop: '0.3rem' }}>Analytics from your {history.length} security scans</p>
          </div>
          <button onClick={exportCSV} style={{ padding: '0.6rem 1.2rem', background: 'rgba(7,210,248,0.1)', border: '1px solid rgba(7,210,248,0.3)', borderRadius: '8px', color: '#07d2f8', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}>
            📥 Export CSV
          </button>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Scans',  value: history.length, color: '#07d2f8', icon: '🔍' },
            { label: 'Avg Score',    value: avg,            color: avg >= 70 ? '#4caf50' : avg >= 40 ? '#ff9800' : '#f44336', icon: '📈' },
            { label: 'Safe Targets', value: safe,           color: '#4caf50', icon: '✅' },
            { label: 'At Risk',      value: risky,          color: '#f44336', icon: '🚨' },
            { label: 'Emails',       value: emails,         color: '#9c27b0', icon: '📧' },
            { label: 'Websites',     value: websites,       color: '#2196f3', icon: '🌐' },
          ].map((kpi, i) => (
            <div key={i} style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.15)', borderRadius: '14px', padding: '1.2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${kpi.color},transparent)` }} />
              <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>{kpi.icon}</div>
              <div style={{ color: kpi.color, fontSize: '1.8rem', fontWeight: '800', lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ color: '#8994a9', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '0.3rem' }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>

          {/* Donut chart */}
          <div style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.15)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#07d2f8,transparent)' }} />
            <p style={{ color: '#8994a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.2rem' }}>Risk Distribution</p>
            <DonutChart safe={safe} medium={medium} risky={risky} />
          </div>

          {/* Score distribution bar chart */}
          <div style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.15)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#07d2f8,transparent)' }} />
            <p style={{ color: '#8994a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.2rem' }}>Score Distribution</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {distribution.map((d) => (
                <div key={d.range}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ color: d.color, fontSize: '0.78rem', fontWeight: '600' }}>{d.range}</span>
                    <span style={{ color: '#8994a9', fontSize: '0.75rem' }}>{d.count} scans</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(d.count / maxDist) * 100}%`, backgroundColor: d.color, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity + Top Targets */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>

          {/* Weekly activity */}
          <div style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.15)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#07d2f8,transparent)' }} />
            <p style={{ color: '#8994a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.2rem' }}>7-Day Activity</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '80px' }}>
              {days.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '100%', background: d.count > 0 ? '#07d2f8' : 'rgba(7,210,248,0.1)', borderRadius: '3px 3px 0 0', height: `${Math.max((d.count / maxDay) * 60, d.count > 0 ? 8 : 4)}px`, transition: 'height 0.6s ease' }} />
                  <span style={{ color: '#8994a9', fontSize: '0.6rem' }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top scanned targets */}
          <div style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.15)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#07d2f8,transparent)' }} />
            <p style={{ color: '#8994a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Most Scanned</p>
            {topDomains.length === 0 ? (
              <p style={{ color: '#8994a9', fontSize: '0.82rem' }}>No data yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {topDomains.map(([domain, data], i) => {
                  const sc = data.avgScore >= 70 ? '#4caf50' : data.avgScore >= 40 ? '#ff9800' : '#f44336';
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#cbd5e1', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{domain}</span>
                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                          <span style={{ color: '#8994a9', fontSize: '0.72rem' }}>{data.count}x</span>
                          <span style={{ color: sc, fontSize: '0.72rem', fontWeight: '600' }}>{data.avgScore}</span>
                        </div>
                      </div>
                      <MiniBar value={data.avgScore} color={sc} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent scans table */}
        <div style={{ background: 'rgba(7,210,248,0.03)', border: '1px solid rgba(7,210,248,0.15)', borderRadius: '16px', padding: '1.5rem' }}>
          <p style={{ color: '#8994a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Recent Scans</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {history.slice(0, 8).map((scan, i) => {
              const sc = scan.score >= 70 ? '#4caf50' : scan.score >= 40 ? '#ff9800' : '#f44336';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 0', borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sc, flexShrink: 0 }} />
                  <span style={{ color: '#cbd5e1', fontSize: '0.82rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scan.target}</span>
                  <span style={{ color: '#8994a9', fontSize: '0.72rem', flexShrink: 0 }}>{scan.kind}</span>
                  <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}>
                    <div style={{ height: '100%', width: scan.score + '%', backgroundColor: sc }} />
                  </div>
                  <span style={{ color: sc, fontWeight: '700', fontSize: '0.82rem', minWidth: '28px', textAlign: 'right', flexShrink: 0 }}>{scan.score}</span>
                  <span style={{ padding: '2px 7px', borderRadius: '999px', fontSize: '0.65rem', fontWeight: '600', background: sc + '18', border: '1px solid ' + sc + '44', color: sc, flexShrink: 0 }}>{scan.verdict}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}