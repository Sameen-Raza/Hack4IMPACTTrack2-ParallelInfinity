'use client';

import { useState } from 'react';

interface AnalysisResult {
  url: string;
  verdict: 'safe' | 'suspicious' | 'dangerous';
  score: number;
  flags: { label: string; detected: boolean; detail: string }[];
}

export default function PhishingChecker() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const analyzeUrl = (input: string): AnalysisResult => {
    const lower = input.toLowerCase();

    const flags = [
      {
        label: 'HTTPS Protocol',
        detected: !lower.startsWith('https://'),
        detail: lower.startsWith('https://')
          ? 'Secure HTTPS protocol detected'
          : 'No HTTPS — connection is not encrypted',
      },
      {
        label: 'Suspicious Keywords',
        detected: /login|verify|account|secure|update|banking|paypal|ebay|amazon/.test(lower),
        detail: /login|verify|account|secure|update|banking|paypal|ebay|amazon/.test(lower)
          ? 'URL contains phishing-related keywords'
          : 'No suspicious keywords found',
      },
      {
        label: 'IP Address in URL',
        detected: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(lower),
        detail: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(lower)
          ? 'Raw IP address detected — highly suspicious'
          : 'No raw IP address found',
      },
      {
        label: 'Excessive Subdomains',
        detected: (lower.match(/\./g) || []).length > 3,
        detail: (lower.match(/\./g) || []).length > 3
          ? 'Too many subdomains — common phishing tactic'
          : 'Normal subdomain structure',
      },
      {
        label: 'URL Length',
        detected: input.length > 75,
        detail: input.length > 75
          ? `URL is ${input.length} chars — abnormally long`
          : `URL length (${input.length} chars) is normal`,
      },
      {
        label: 'Special Characters',
        detected: /@|%40|\/\/.*\/\//.test(lower),
        detail: /@|%40|\/\/.*\/\//.test(lower)
          ? 'Suspicious special characters detected'
          : 'No suspicious special characters',
      },
    ];

    const flaggedCount = flags.filter((f) => f.detected).length;
    const score = Math.max(0, 100 - flaggedCount * 18);
    const verdict: AnalysisResult['verdict'] =
      score >= 70 ? 'safe' : score >= 40 ? 'suspicious' : 'dangerous';

    return { url: input, verdict, score, flags };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError('');
    setResult(null);

    if (!url.includes('.')) {
      setError('Please enter a valid URL (e.g. https://example.com)');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setResult(analyzeUrl(url));
      setLoading(false);
    }, 1800);
  };

  const verdictConfig = {
    safe:       { color: '#4caf50', bg: 'rgba(76,175,80,0.08)',   border: 'rgba(76,175,80,0.3)',   icon: '✅', label: 'Safe'       },
    suspicious: { color: '#ff9800', bg: 'rgba(255,152,0,0.08)',   border: 'rgba(255,152,0,0.3)',   icon: '⚠️', label: 'Suspicious' },
    dangerous:  { color: '#f44336', bg: 'rgba(244,67,54,0.08)',   border: 'rgba(244,67,54,0.3)',   icon: '🚨', label: 'Dangerous'  },
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '3rem 2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '580px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px', height: '64px',
            borderRadius: '16px',
            background: 'rgba(7,210,248,0.1)',
            border: '1px solid rgba(7,210,248,0.3)',
            fontSize: '2rem',
            marginBottom: '1rem',
            boxShadow: '0 0 24px rgba(7,210,248,0.15)',
          }}>
            🎣
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.9rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Phishing URL Detector
          </h1>
          <p style={{ color: '#8994a9', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Paste any URL to instantly detect phishing patterns,<br />
            suspicious structures, and security red flags.
          </p>
        </div>

        {/* Input Card */}
        <div style={{
          background: 'rgba(7,210,248,0.03)',
          border: '1px solid rgba(7,210,248,0.2)',
          borderRadius: '16px',
          padding: '1.8rem',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #07d2f8, transparent)',
          }} />

          <form onSubmit={handleSubmit}>
            <label style={{
              display: 'block',
              color: '#8994a9',
              fontSize: '0.75rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '0.6rem',
            }}>
              Website URL
            </label>

            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <span style={{
                position: 'absolute',
                left: '0.9rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8994a9',
                fontSize: '1rem',
              }}>
                🔗
              </span>
              <input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); setResult(null); }}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem 0.9rem 2.5rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(7,210,248,0.3)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            {error && (
              <div style={{
                color: '#f44336',
                fontSize: '0.82rem',
                marginBottom: '0.8rem',
                padding: '0.5rem 0.8rem',
                background: 'rgba(244,67,54,0.08)',
                borderRadius: '6px',
                border: '1px solid rgba(244,67,54,0.2)',
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !url.trim()}
              style={{
                width: '100%',
                padding: '0.9rem',
                backgroundColor: loading || !url.trim() ? '#333' : '#07d2f8',
                color: loading || !url.trim() ? '#666' : '#000',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: loading || !url.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                letterSpacing: '0.5px',
              }}
            >
              {loading ? '🔍 Scanning...' : '🔍 Analyze URL'}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            background: 'rgba(7,210,248,0.03)',
            border: '1px solid rgba(7,210,248,0.15)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>⚙️</div>
            <p style={{ color: '#07d2f8', fontWeight: '600', marginBottom: '0.4rem' }}>
              Scanning URL...
            </p>
            <p style={{ color: '#8994a9', fontSize: '0.82rem' }}>
              Checking for phishing patterns, suspicious keywords, and structural anomalies
            </p>
            <div style={{
              display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '1.2rem',
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: '8px', height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#07d2f8',
                  opacity: 0.4,
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
            <style>{`@keyframes pulse { 0%,100%{opacity:0.2} 50%{opacity:1} }`}</style>
          </div>
        )}

        {/* Result */}
        {result && !loading && (() => {
          const vc = verdictConfig[result.verdict];
          return (
            <div style={{
              background: 'rgba(7,210,248,0.03)',
              border: '1px solid rgba(7,210,248,0.2)',
              borderRadius: '16px',
              padding: '1.8rem',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${vc.color}, transparent)`,
              }} />

              {/* Verdict banner */}
              <div style={{
                background: vc.bg,
                border: `1px solid ${vc.border}`,
                borderRadius: '12px',
                padding: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}>
                <span style={{ fontSize: '2rem' }}>{vc.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: vc.color, fontWeight: '700', fontSize: '1.1rem' }}>
                    {vc.label}
                  </div>
                  <div style={{ color: '#8994a9', fontSize: '0.8rem', marginTop: '2px' }}>
                    {result.url.length > 50 ? result.url.slice(0, 50) + '...' : result.url}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: vc.color, fontSize: '1.8rem', fontWeight: '700', lineHeight: 1 }}>
                    {result.score}
                  </div>
                  <div style={{ color: '#8994a9', fontSize: '0.7rem' }}>Safety Score</div>
                </div>
              </div>

              {/* Score bar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  height: '6px',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${result.score}%`,
                    backgroundColor: vc.color,
                    borderRadius: '3px',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>

              {/* Flag checklist */}
              <p style={{
                color: '#8994a9',
                fontSize: '0.72rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '0.8rem',
              }}>
                Analysis Details
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {result.flags.map((flag, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.7rem',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '8px',
                    background: flag.detected
                      ? 'rgba(244,67,54,0.06)'
                      : 'rgba(76,175,80,0.06)',
                    border: `1px solid ${flag.detected
                      ? 'rgba(244,67,54,0.15)'
                      : 'rgba(76,175,80,0.15)'}`,
                  }}>
                    <span style={{ fontSize: '0.85rem', marginTop: '1px' }}>
                      {flag.detected ? '🔴' : '🟢'}
                    </span>
                    <div>
                      <div style={{
                        color: flag.detected ? '#f44336' : '#4caf50',
                        fontSize: '0.82rem',
                        fontWeight: '600',
                        marginBottom: '2px',
                      }}>
                        {flag.label}
                      </div>
                      <div style={{ color: '#8994a9', fontSize: '0.78rem' }}>
                        {flag.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scan another */}
              <button
                onClick={() => { setResult(null); setUrl(''); }}
                style={{
                  width: '100%',
                  marginTop: '1.5rem',
                  padding: '0.8rem',
                  background: 'transparent',
                  border: '1px solid rgba(7,210,248,0.3)',
                  borderRadius: '10px',
                  color: '#07d2f8',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(7,210,248,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                🔄 Scan Another URL
              </button>
            </div>
          );
        })()}

        {/* Disclaimer */}
        <p style={{
          textAlign: 'center',
          color: 'rgba(137,148,169,0.4)',
          fontSize: '0.73rem',
          marginTop: '1.2rem',
        }}>
          🔒 URLs are analyzed locally. Nothing is stored or transmitted.
        </p>

      </div>
    </div>
  );
}