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
      const isEmail = input.includes('@');

      // Move input capture BEFORE the timeout clears it
      const capturedInput = input;

      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      setInput('');

      setTimeout(() => {
        const mockResult: SecurityScore = {
          target: capturedInput,  // use captured value
          kind: isEmail ? 'email' : 'website',
          overall_score: Math.floor(Math.random() * 40) + 60,
          components: [
            {
              name: 'SSL Security',
              score: 90,
              description: 'SSL certificate detected and properly configured',
            },
            {
              name: 'Email Exposure',
              score: 40,
              description: 'Email may appear in previous breach datasets',
            },
            {
              name: 'Domain Reputation',
              score: 85,
              description: 'Domain reputation is healthy',
            },
          ],
          recommendations: [
            'Enable multi-factor authentication',
            'Update passwords regularly',
            'Monitor breach databases periodically',
            'Use strong password policies',
          ],
          breach_findings: {
            status: 'safe',
          },
        };

        setResult(mockResult);
        setLoading(false);
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze');
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div style={{ minHeight: 'calc(100vh - 70px)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <div style={{
            backgroundColor: 'rgba(7,210,248,0.1)',
            border: '2px solid #07d2f8',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center',
          }}>
            <h2 style={{ color: '#07d2f8', marginBottom: '1rem' }}>
              Security Assessment Complete
            </h2>
            <p style={{ color: '#8994a9' }}>
              Target: <span style={{ color: '#fff', fontWeight: 'bold' }}>{result.target}</span>
            </p>
          </div>

          <div style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #07d2f8',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
          }}>
            <h3 style={{ color: '#07d2f8' }}>Overall Security Score</h3>

            <div style={{
              height: '12px',
              backgroundColor: '#0a0a0a',
              borderRadius: '6px',
              overflow: 'hidden',
              marginTop: '1rem',
            }}>
              <div style={{
                height: '100%',
                width: `${result.overall_score}%`,
                backgroundColor: result.overall_score >= 70 ? '#4caf50' : result.overall_score >= 40 ? '#ff9800' : '#f44336',
                transition: 'width 0.5s ease',  // smooth bar animation
              }} />
            </div>

            <h1 style={{ fontSize: '3rem', color: '#fff', marginTop: '1rem' }}>
              {result.overall_score}
            </h1>

            <div style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginTop: '6px',
              color: result.overall_score >= 70 ? '#4caf50' : result.overall_score >= 40 ? '#ff9800' : '#f44336',
            }}>
              {result.overall_score >= 70 ? 'Low Risk' : result.overall_score >= 40 ? 'Medium Risk' : 'High Risk'}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#07d2f8' }}>Security Components</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {result.components.map((comp, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#1a1a1a',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #2a2a2a',  // subtle border added
                }}>
                  <h4 style={{ color: '#07d2f8', marginBottom: '0.5rem' }}>{comp.name}</h4>
                  <p style={{ color: '#8994a9', marginBottom: '0.5rem' }}>{comp.description}</p>

                  {/* Score bar per component */}
                  <div style={{
                    height: '6px',
                    backgroundColor: '#0a0a0a',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '0.4rem',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${comp.score}%`,
                      backgroundColor: comp.score >= 70 ? '#4caf50' : comp.score >= 40 ? '#ff9800' : '#f44336',
                    }} />
                  </div>

                  <strong style={{ color: '#fff' }}>Score: {comp.score}</strong>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#07d2f8' }}>Recommendations</h3>
            <ul style={{ color: '#8994a9', paddingLeft: '1.5rem' }}>
              {result.recommendations.map((rec, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>{rec}</li>
              ))}
            </ul>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => {
                setResult(null);
                setInput('');
              }}
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#07d2f8',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#000',  // ensure text is visible
              }}
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

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p style={{ color: '#07d2f8', fontSize: '1.1rem' }}>
          {messages[currentMessageIndex]}
        </p>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', color: '#fff' }}>Check Your Security Score</h1>
        <p style={{ color: '#8994a9', marginBottom: '2rem' }}>
          Instantly analyze your website or email for security vulnerabilities.
        </p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(244,67,54,0.1)',
            border: '1px solid #f44336',
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '6px',  // missing in original
            color: '#f44336',     // make error text visible
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleGetScore}>
          <input
            type="text"
            placeholder="Enter email or website"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{
              padding: '1rem',
              width: '100%',
              marginBottom: '1rem',
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #8994a9',
              borderRadius: '6px',  // missing in original
              boxSizing: 'border-box',  // prevents overflow
              outline: 'none',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '1rem',
              width: '100%',
              backgroundColor: loading ? '#555' : '#07d2f8',  // visual feedback when disabled
              border: 'none',
              fontWeight: 'bold',
              borderRadius: '6px',  // missing in original
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#000',        // ensure text is visible
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? 'Analyzing...' : 'Get Security Score'}
          </button>
        </form>
      </div>
    </div>
  );
}