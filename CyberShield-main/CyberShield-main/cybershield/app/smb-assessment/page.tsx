'use client';

import { useState } from 'react';
import { askNova } from '../lib/nova';

// ── Shared styles (defined OUTSIDE component) ──────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.8rem 1rem',
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid rgba(7,210,248,0.25)',
  borderRadius: '8px', color: '#fff',
  fontSize: '0.9rem', outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#8994a9',
  fontSize: '0.75rem', letterSpacing: '0.8px',
  textTransform: 'uppercase', marginBottom: '0.45rem',
};

// ── Sub-components defined OUTSIDE to prevent focus loss ──────────────────
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '1.4rem' }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const RadioGroup = ({
  field, options, value, onChange,
}: {
  field: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (field: string, val: string) => void;
}) => (
  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
    {options.map((o) => {
      const active = value === o.value;
      return (
        <button key={o.value} type="button" onClick={() => onChange(field, o.value)}
          style={{
            padding: '0.5rem 1.1rem', borderRadius: '999px',
            border: `1px solid ${active ? '#07d2f8' : 'rgba(7,210,248,0.2)'}`,
            background: active ? 'rgba(7,210,248,0.12)' : 'transparent',
            color: active ? '#07d2f8' : '#8994a9',
            fontSize: '0.82rem', fontWeight: active ? '600' : '400',
            cursor: 'pointer', transition: 'all 0.15s ease',
          }}>
          {o.label}
        </button>
      );
    })}
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────
export default function SMBAssessment() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    companyName: '', companyUrl: '', industry: '', employees: '',
    hasFirewall: '', hasMFA: '', lastAudit: '', encryptData: '',
    incidentPlan: '', backupFreq: '', remoteWork: '', securityTraining: '',
  });

  // ── Nova AI summary state ────────────────────────────────────────────
  const [aiSummary, setAiSummary]   = useState('');
  const [aiLoading, setAiLoading]   = useState(false);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const calcScore = () => {
    let s = 60;
    if (form.hasFirewall === 'yes')        s += 8;
    if (form.hasMFA === 'yes')             s += 10;
    if (form.encryptData === 'yes')        s += 8;
    if (form.incidentPlan === 'yes')       s += 7;
    if (form.backupFreq === 'daily')       s += 5;
    else if (form.backupFreq === 'weekly') s += 3;
    if (form.securityTraining === 'yes')   s += 7;
    if (form.lastAudit === 'recent')       s += 5;
    return Math.min(s, 100);
  };

  const score = step === 3 ? calcScore() : 0;
  const verdict =
    score >= 85 ? { label: 'Excellent',  color: '#4caf50', icon: '🛡️' } :
    score >= 70 ? { label: 'Good',        color: '#2196f3', icon: '✅' } :
    score >= 50 ? { label: 'Needs Work',  color: '#ff9800', icon: '⚠️' } :
                  { label: 'At Risk',     color: '#f44336', icon: '🚨' };

  const recommendations = [
    { cond: form.hasFirewall !== 'yes',      text: 'Deploy and configure a business-grade firewall.' },
    { cond: form.hasMFA !== 'yes',           text: 'Enable Multi-Factor Authentication across all accounts.' },
    { cond: form.encryptData !== 'yes',      text: 'Encrypt sensitive data at rest and in transit.' },
    { cond: form.incidentPlan !== 'yes',     text: 'Create a formal incident response plan.' },
    { cond: form.backupFreq !== 'daily',     text: 'Implement daily automated backups.' },
    { cond: form.securityTraining !== 'yes', text: 'Run regular employee security awareness training.' },
    { cond: form.lastAudit !== 'recent',     text: 'Schedule a professional security audit.' },
  ].filter((r) => r.cond).map((r) => r.text);

  const step1Valid = form.companyName && form.companyUrl && form.industry && form.employees;
  const step2Valid = form.hasFirewall && form.hasMFA && form.lastAudit &&
                     form.encryptData && form.incidentPlan && form.backupFreq &&
                     form.remoteWork && form.securityTraining;

  // ── Nova AI summary generator (proper async function) ────────────────
  const generateAISummary = async (currentScore: number, currentRecs: string[]) => {
    setAiLoading(true);
    setAiSummary('');
    const prompt = `
Company: ${form.companyName} (${form.industry}, ${form.employees} employees)
Security Score: ${currentScore}/100
Verdict: ${currentScore >= 85 ? 'Excellent' : currentScore >= 70 ? 'Good' : currentScore >= 50 ? 'Needs Work' : 'At Risk'}
Issues found: ${currentRecs.length > 0 ? currentRecs.join(', ') : 'None'}
Firewall: ${form.hasFirewall}, MFA: ${form.hasMFA}, Encryption: ${form.encryptData}, Backups: ${form.backupFreq}
Write a 3-sentence executive security summary for this SMB. Be specific and actionable.`;
    try {
      const summary = await askNova(prompt, 'smb_report');
      setAiSummary(summary);
    } catch {
      setAiSummary('AI summary temporarily unavailable.');
    }
    setAiLoading(false);
  };

  // ── Go to step 3 and trigger AI ──────────────────────────────────────
  const handleGenerateReport = () => {
    if (!step2Valid) return;
    setStep(3);
    const currentScore = calcScore();
    const currentRecs = [
      form.hasFirewall !== 'yes'      && 'Deploy and configure a business-grade firewall.',
      form.hasMFA !== 'yes'           && 'Enable Multi-Factor Authentication across all accounts.',
      form.encryptData !== 'yes'      && 'Encrypt sensitive data at rest and in transit.',
      form.incidentPlan !== 'yes'     && 'Create a formal incident response plan.',
      form.backupFreq !== 'daily'     && 'Implement daily automated backups.',
      form.securityTraining !== 'yes' && 'Run regular employee security awareness training.',
      form.lastAudit !== 'recent'     && 'Schedule a professional security audit.',
    ].filter(Boolean) as string[];
    generateAISummary(currentScore, currentRecs);
  };

  const handleReset = () => {
    setStep(1);
    setAiSummary('');
    setAiLoading(false);
    setForm({
      companyName: '', companyUrl: '', industry: '', employees: '',
      hasFirewall: '', hasMFA: '', lastAudit: '', encryptData: '',
      incidentPlan: '', backupFreq: '', remoteWork: '', securityTraining: '',
    });
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* ── Title ── */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'rgba(7,210,248,0.1)', border: '1px solid rgba(7,210,248,0.3)',
            fontSize: '2rem', marginBottom: '1rem',
            boxShadow: '0 0 24px rgba(7,210,248,0.15)',
          }}>🏢</div>
          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            SMB Security Assessment
          </h1>
          <p style={{ color: '#8994a9', fontSize: '0.9rem' }}>
            Get a comprehensive AI-powered security analysis in 3 steps.
          </p>
        </div>

        {/* ── Stepper ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
          {[
            { n: 1, label: 'Company Info' },
            { n: 2, label: 'Security Posture' },
            { n: 3, label: 'Results' },
          ].map((s, i) => {
            const done   = step > s.n;
            const active = step === s.n;
            const color  = done || active ? '#07d2f8' : 'rgba(7,210,248,0.25)';
            return (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    border: `2px solid ${color}`,
                    background: active ? '#07d2f8' : done ? 'rgba(7,210,248,0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: active ? '#000' : color,
                    fontWeight: '700', fontSize: '0.85rem',
                    boxShadow: active ? '0 0 16px rgba(7,210,248,0.4)' : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {done ? '✓' : s.n}
                  </div>
                  <div style={{ color: active ? '#07d2f8' : '#8994a9', fontSize: '0.7rem', marginTop: '4px', whiteSpace: 'nowrap' }}>
                    {s.label}
                  </div>
                </div>
                {i < 2 && (
                  <div style={{
                    width: '80px', height: '1px', margin: '0 6px 20px',
                    background: step > s.n ? '#07d2f8' : 'rgba(7,210,248,0.15)',
                    transition: 'background 0.3s',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Card ── */}
        <div style={{
          background: 'rgba(7,210,248,0.03)',
          border: '1px solid rgba(7,210,248,0.2)',
          borderRadius: '16px', padding: '2rem',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg,transparent,#07d2f8,transparent)',
          }} />

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              <h2 style={{ color: '#07d2f8', fontSize: '1.1rem', marginBottom: '1.6rem', fontWeight: '600' }}>
                🏢 Company Information
              </h2>

              <Field label="Company Name *">
                <input style={inputStyle} placeholder="Acme Corp"
                  value={form.companyName} onChange={(e) => update('companyName', e.target.value)} />
              </Field>

              <Field label="Company Website *">
                <input style={inputStyle} placeholder="https://www.yourcompany.com"
                  value={form.companyUrl} onChange={(e) => update('companyUrl', e.target.value)} />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Industry *">
                  <select style={{ ...inputStyle, appearance: 'none' }}
                    value={form.industry} onChange={(e) => update('industry', e.target.value)}>
                    <option value="">Select...</option>
                    {['Finance','Healthcare','Retail','Technology','Education',
                      'Manufacturing','Legal','Other'].map((v) => (
                      <option key={v} value={v.toLowerCase()}>{v}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Number of Employees *">
                  <select style={{ ...inputStyle, appearance: 'none' }}
                    value={form.employees} onChange={(e) => update('employees', e.target.value)}>
                    <option value="">Select...</option>
                    {['1–10','11–50','51–200','201–500','500+'].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <button onClick={() => step1Valid && setStep(2)} style={{
                width: '100%', padding: '0.9rem',
                backgroundColor: step1Valid ? '#07d2f8' : '#333',
                color: step1Valid ? '#000' : '#666',
                border: 'none', borderRadius: '10px',
                fontWeight: '700', fontSize: '0.95rem',
                cursor: step1Valid ? 'pointer' : 'not-allowed',
                marginTop: '0.5rem', transition: 'all 0.2s',
              }}>
                Next → Security Posture
              </button>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <>
              <h2 style={{ color: '#07d2f8', fontSize: '1.1rem', marginBottom: '1.6rem', fontWeight: '600' }}>
                🔒 Security Posture
              </h2>

              {[
                { field: 'hasFirewall',      label: 'Do you have a firewall?',                    opts: [{ value:'yes', label:'Yes' },{ value:'no', label:'No' },{ value:'unsure', label:'Not sure' }] },
                { field: 'hasMFA',           label: 'Multi-Factor Authentication (MFA) enabled?', opts: [{ value:'yes', label:'Yes' },{ value:'partial', label:'Partially' },{ value:'no', label:'No' }] },
                { field: 'encryptData',      label: 'Is sensitive data encrypted?',               opts: [{ value:'yes', label:'Yes' },{ value:'no', label:'No' },{ value:'unsure', label:'Not sure' }] },
                { field: 'backupFreq',       label: 'How often are backups performed?',           opts: [{ value:'daily', label:'Daily' },{ value:'weekly', label:'Weekly' },{ value:'monthly', label:'Monthly' },{ value:'never', label:'Never' }] },
                { field: 'incidentPlan',     label: 'Do you have an incident response plan?',     opts: [{ value:'yes', label:'Yes' },{ value:'no', label:'No' }] },
                { field: 'securityTraining', label: 'Regular employee security training?',        opts: [{ value:'yes', label:'Yes' },{ value:'no', label:'No' }] },
                { field: 'remoteWork',       label: 'Do employees work remotely?',                opts: [{ value:'yes', label:'Yes' },{ value:'hybrid', label:'Hybrid' },{ value:'no', label:'No' }] },
                { field: 'lastAudit',        label: 'Last professional security audit?',          opts: [{ value:'recent', label:'< 1 year' },{ value:'old', label:'1–3 years' },{ value:'never', label:'Never' }] },
              ].map(({ field, label, opts }) => (
                <Field key={field} label={label}>
                  <RadioGroup field={field} options={opts} value={(form as any)[field]} onChange={update} />
                </Field>
              ))}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button onClick={() => setStep(1)} style={{
                  flex: 1, padding: '0.9rem', background: 'transparent',
                  border: '1px solid rgba(7,210,248,0.3)', borderRadius: '10px',
                  color: '#07d2f8', fontWeight: '600', cursor: 'pointer',
                }}>← Back</button>
                {/* ✅ Uses handleGenerateReport which triggers Nova */}
                <button onClick={handleGenerateReport} style={{
                  flex: 2, padding: '0.9rem',
                  backgroundColor: step2Valid ? '#07d2f8' : '#333',
                  color: step2Valid ? '#000' : '#666',
                  border: 'none', borderRadius: '10px',
                  fontWeight: '700', cursor: step2Valid ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}>Generate Report →</button>
              </div>
            </>
          )}

          {/* ── STEP 3 RESULTS ── */}
          {step === 3 && (
            <>
              {/* Verdict banner */}
              <div style={{
                background: `rgba(${verdict.color === '#4caf50' ? '76,175,80' : verdict.color === '#2196f3' ? '33,150,243' : verdict.color === '#ff9800' ? '255,152,0' : '244,67,54'},0.08)`,
                border: `1px solid ${verdict.color}44`,
                borderRadius: '12px', padding: '1.4rem',
                display: 'flex', alignItems: 'center', gap: '1.2rem',
                marginBottom: '1.5rem',
              }}>
                <span style={{ fontSize: '2.5rem' }}>{verdict.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: verdict.color, fontWeight: '700', fontSize: '1.1rem' }}>
                    {verdict.label} — {form.companyName}
                  </div>
                  <div style={{ color: '#8994a9', fontSize: '0.8rem', marginTop: '2px' }}>
                    {form.industry} · {form.employees} employees
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: verdict.color, fontSize: '2.2rem', fontWeight: '700', lineHeight: 1 }}>{score}</div>
                  <div style={{ color: '#8994a9', fontSize: '0.7rem' }}>/ 100</div>
                </div>
              </div>

              {/* Score bar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${score}%`,
                    background: `linear-gradient(90deg, ${verdict.color}88, ${verdict.color})`,
                    borderRadius: '4px', transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>

              {/* 🤖 AI Executive Summary — properly rendered */}
              <div style={{
                background: 'rgba(7,210,248,0.04)', border: '1px solid rgba(7,210,248,0.2)',
                borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,#07d2f8,transparent)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem' }}>
                  <span>🤖</span>
                  <p style={{ color: '#8994a9', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                    AI Executive Summary · Powered by Amazon Nova
                  </p>
                </div>
                {aiLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <style>{`@keyframes blink{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#07d2f8', animation: `blink 1.2s ${i * 0.2}s infinite` }} />
                    ))}
                    <span style={{ color: '#8994a9', fontSize: '0.82rem' }}>Nova is generating your executive summary...</span>
                  </div>
                ) : aiSummary ? (
                  <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{aiSummary}</p>
                ) : (
                  <p style={{ color: '#8994a9', fontSize: '0.82rem', margin: 0 }}>AI summary unavailable.</p>
                )}
              </div>

              {/* Quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginBottom: '1.8rem' }}>
                {[
                  { icon: '🔥', label: 'Firewall', val: form.hasFirewall === 'yes' ? 'Active' : 'Missing' },
                  { icon: '🔑', label: 'MFA',      val: form.hasMFA === 'yes' ? 'Enabled' : form.hasMFA === 'partial' ? 'Partial' : 'Disabled' },
                  { icon: '💾', label: 'Backups',  val: form.backupFreq === 'daily' ? 'Daily' : form.backupFreq === 'weekly' ? 'Weekly' : 'Infrequent' },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(7,210,248,0.12)',
                    borderRadius: '10px', padding: '0.9rem', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{stat.icon}</div>
                    <div style={{ color: '#8994a9', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                    <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: '600', marginTop: '2px' }}>{stat.val}</div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              {recommendations.length > 0 ? (
                <>
                  <p style={{ color: '#8994a9', fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                    Recommendations ({recommendations.length})
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.5rem' }}>
                    {recommendations.map((r, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.7rem',
                        padding: '0.7rem 0.9rem',
                        background: 'rgba(255,152,0,0.05)', border: '1px solid rgba(255,152,0,0.15)',
                        borderRadius: '8px',
                      }}>
                        <span style={{ color: '#ff9800', fontSize: '0.8rem', marginTop: '1px', flexShrink: 0 }}>⚠️</span>
                        <span style={{ color: '#cbd5e1', fontSize: '0.83rem', lineHeight: '1.5' }}>{r}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ padding: '1rem', borderRadius: '8px', textAlign: 'center', background: 'rgba(76,175,80,0.07)', border: '1px solid rgba(76,175,80,0.2)', color: '#4caf50', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                  🎉 Excellent security posture — no major gaps detected!
                </div>
              )}

              <button onClick={handleReset} style={{
                width: '100%', padding: '0.85rem', background: 'transparent',
                border: '1px solid rgba(7,210,248,0.3)', borderRadius: '10px',
                color: '#07d2f8', fontWeight: '600', cursor: 'pointer', fontSize: '0.88rem',
                transition: 'background 0.2s',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(7,210,248,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                🔄 Start New Assessment
              </button>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(137,148,169,0.4)', fontSize: '0.73rem', marginTop: '1.2rem' }}>
          🔒 Your data is never stored or shared with third parties.
        </p>
      </div>
    </div>
  );
}