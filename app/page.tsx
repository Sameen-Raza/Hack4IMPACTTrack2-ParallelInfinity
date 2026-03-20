'use client';

import { useState } from 'react';
import { messages } from './stores/message';

interface SecurityScore {
  target: string;
  kind: 'email' | 'website';
  overall_score: number;
  components: Array<{
    name: string;
    score: number;
    description: string;
  }>;
  recommendations: string[];
  breach_findings?: any;
  google_dorks?: Record<string, string>;
}

export default function Home() {
  const [input, setInput] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SecurityScore | null>(null);
  const [error, setError] = useState('');

  const handleGetScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      // Determine if input is email or website
      const isEmail = input.includes('@');
      const endpoint = isEmail ? '/security_score/email' : '/security_score/website';
      
      const payload = isEmail 
        ? { email: input.trim() }
        : { url: input.trim().startsWith('http') ? input.trim() : `https://${input.trim()}` };

      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data: SecurityScore = await response.json();
      setResult(data);
      
      // Rotate to next message
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      setInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security score');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div style={{ minHeight: 'calc(100vh - 70px)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Result Header */}
          <div style={{
            backgroundColor: 'rgba(7, 210, 248, 0.1)',
            border: '2px solid #07d2f8',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#07d2f8', marginTop: 0, marginBottom: '1rem' }}>
              Security Assessment Complete
            </h2>
            <p style={{ color: '#8994a9', margin: 0 }}>
              Target: <span style={{ color: '#fff', fontWeight: 'bold' }}>{result.target}</span>
            </p>
          </div>

          {/* Overall Score */}
          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #07d2f8',
            borderRadius: '12px',
            padding: '2.5rem',
            marginBottom: '2rem',
            boxShadow: '0 0 20px rgba(7, 210, 248, 0.1)'
          }}>
            <p style={{ color: '#8994a9', fontSize: '0.9rem', margin: '0 0 1.5rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Overall Security Score
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  height: '12px',
                  backgroundColor: '#0a0a0a',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  marginBottom: '1rem',
                  border: '1px solid #2a2a2a'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${result.overall_score}%`,
                    backgroundColor: result.overall_score >= 70 ? '#4caf50' : result.overall_score >= 40 ? '#ff9800' : '#f44336',
                    transition: 'width 0.6s ease-out',
                    boxShadow: `0 0 10px ${result.overall_score >= 70 ? '#4caf50' : result.overall_score >= 40 ? '#ff9800' : '#f44336'}80`
                  }} />
                </div>
                <div style={{ color: '#8994a9', fontSize: '0.85rem' }}>
                  <span style={{ color: '#07d2f8' }}>0</span> — <span style={{ color: '#07d2f8' }}>100</span>
                </div>
              </div>
              <div style={{ textAlign: 'center', minWidth: '140px' }}>
                <div style={{
                  fontSize: '4rem',
                  fontWeight: '700',
                  color: result.overall_score >= 70 ? '#4caf50' : result.overall_score >= 40 ? '#ff9800' : '#f44336',
                  lineHeight: '1',
                  marginBottom: '0.5rem'
                }}>
                  {Math.round(result.overall_score)}
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: result.overall_score >= 70 ? '#4caf50' : result.overall_score >= 40 ? '#ff9800' : '#f44336',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {result.overall_score >= 70 ? 'Strong' : result.overall_score >= 40 ? 'Fair' : 'Weak'}
                </div>
              </div>
            </div>
          </div>

          {/* Components */}
          {result.components && result.components.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#07d2f8', marginBottom: '1rem' }}>Security Components</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {result.components.map((comp, idx) => (
                  <div key={idx} style={{
                    backgroundColor: '#1a1a1a',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${comp.score >= 70 ? '#4caf50' : comp.score >= 40 ? '#ff9800' : '#f44336'}`
                  }}>
                    <h4 style={{ color: '#07d2f8', marginTop: 0, marginBottom: '0.5rem' }}>
                      {comp.name}
                    </h4>
                    <div style={{
                      backgroundColor: '#060608',
                      borderRadius: '4px',
                      height: '8px',
                      marginBottom: '0.75rem',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${comp.score}%`,
                        backgroundColor: comp.score >= 70 ? '#4caf50' : comp.score >= 40 ? '#ff9800' : '#f44336',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                    <p style={{ color: '#8994a9', fontSize: '0.9rem', margin: 0 }}>
                      Score: <strong style={{ color: '#fff' }}>{Math.round(comp.score)}</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#07d2f8', marginBottom: '1rem' }}>Recommendations</h3>
              <div style={{
                backgroundColor: '#1a1a1a',
                padding: '1.5rem',
                borderRadius: '8px',
                borderLeft: '4px solid #ff9800'
              }}>
                <ul style={{ color: '#8994a9', margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: '#fff' }}>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Breach Findings */}
          {result.breach_findings && result.breach_findings.status !== 'not_configured' && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#07d2f8', marginBottom: '1rem' }}>Breach Information</h3>
              <div style={{
                backgroundColor: result.breach_findings.status === 'breached' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                padding: '1.5rem',
                borderRadius: '8px',
                borderLeft: `4px solid ${result.breach_findings.status === 'breached' ? '#f44336' : '#4caf50'}`
              }}>
                <p style={{ color: '#8994a9', margin: 0, marginBottom: '0.5rem' }}>
                  Status: <span style={{
                    color: result.breach_findings.status === 'breached' ? '#f44336' : '#4caf50',
                    fontWeight: 'bold'
                  }}>
                    {result.breach_findings.status === 'breached' ? '⚠️ Found in Breaches' : '✓ Not in Known Breaches'}
                  </span>
                </p>
                {result.breach_findings.status === 'breached' && result.breach_findings.breaches && (
                  <p style={{ color: '#8994a9', margin: 0 }}>
                    Breaches: <span style={{ color: '#f44336' }}>
                      {result.breach_findings.breaches.join(', ')}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setResult(null);
                setInput('');
                setError('');
              }}
              style={{
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                backgroundColor: '#07d2f8',
                color: '#060608',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00b8d4'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#07d2f8'}
            >
              New Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', padding: '3rem 2rem' }}>
      {/* Dynamic Message Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{
          color: '#07d2f8',
          fontSize: '1.1rem',
          fontWeight: '500',
          margin: 0,
          transition: 'opacity 0.3s'
        }}>
          {messages[currentMessageIndex]}
        </p>
      </div>

      {/* Hero Section */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: '1rem',
          lineHeight: '1.2'
        }}>
          Check Your Security Score
        </h1>
        <p style={{
          color: '#8994a9',
          fontSize: '1.1rem',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Instantly analyze your website or email for security vulnerabilities and get actionable insights.
        </p>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid #f44336',
            borderRadius: '6px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#f44336',
            fontSize: '0.95rem'
          }}>
            {error}
          </div>
        )}

        {/* Input Section */}
        <form onSubmit={handleGetScore} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <input
            type="text"
            placeholder="Enter your email or website URL"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{
              padding: '1rem',
              fontSize: '1rem',
              border: '1px solid #8994a9',
              borderRadius: '6px',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxSizing: 'border-box',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'text'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#07d2f8';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(7, 210, 248, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#8994a9';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              backgroundColor: loading || !input.trim() ? '#666' : '#07d2f8',
              color: '#060608',
              border: 'none',
              borderRadius: '6px',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              opacity: loading ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading && input.trim()) {
                e.currentTarget.style.backgroundColor = '#00b8d4';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = loading || !input.trim() ? '#666' : '#07d2f8';
            }}
          >
            {loading ? 'Analyzing...' : 'Get Security Score'}
          </button>
        </form>

        {/* Info Text */}
        <p style={{
          color: '#8994a9',
          fontSize: '0.9rem',
          marginTop: '1.5rem',
          margin: '1.5rem 0 0 0'
        }}>
          💡 Enter an email address (e.g., user@example.com) or website URL (e.g., example.com)
        </p>
      </div>
    </div>
  );
}
