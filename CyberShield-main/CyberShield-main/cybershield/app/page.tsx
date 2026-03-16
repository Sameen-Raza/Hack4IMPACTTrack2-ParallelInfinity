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

      // simulate backend analysis
      setTimeout(() => {
        const mockResult: SecurityScore = {
          target: input,
          kind: isEmail ? 'email' : 'website',
          overall_score: Math.floor(Math.random() * 40) + 60,

          components: [
            {
              name: "SSL Security",
              score: 90,
              description: "SSL certificate detected and properly configured"
            },
            {
              name: "Email Exposure",
              score: 40,
              description: "Email may appear in previous breach datasets"
            },
            {
              name: "Domain Reputation",
              score: 85,
              description: "Domain reputation is healthy"
            }
          ],

          recommendations: [
            "Enable multi-factor authentication",
            "Update passwords regularly",
            "Monitor breach databases periodically",
            "Use strong password policies"
          ],

          breach_findings: {
            status: "safe"
          }
        };

        setResult(mockResult);
        setLoading(false);
      }, 1500);

      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      setInput('');

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
            textAlign: 'center'
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
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#07d2f8' }}>Overall Security Score</h3>

            <div style={{
              height: '12px',
              backgroundColor: '#0a0a0a',
              borderRadius: '6px',
              overflow: 'hidden',
              marginTop: '1rem'
            }}>
              <div style={{
                height: '100%',
                width: `${result.overall_score}%`,
                backgroundColor: '#07d2f8'
              }} />
            </div>

            <h1 style={{
              fontSize: '3rem',
              color: '#fff',
              marginTop: '1rem'
            }}>
              {result.overall_score}
            </h1>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#07d2f8' }}>Security Components</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {result.components.map((comp, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#1a1a1a',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ color: '#07d2f8' }}>{comp.name}</h4>
                  <p style={{ color: '#8994a9' }}>{comp.description}</p>
                  <strong style={{ color: '#fff' }}>Score: {comp.score}</strong>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#07d2f8' }}>Recommendations</h3>

            <ul style={{ color: '#8994a9' }}>
              {result.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
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
                fontWeight: 'bold'
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

        <h1 style={{ fontSize: '3rem', color: '#fff' }}>
          Check Your Security Score
        </h1>

        <p style={{ color: '#8994a9', marginBottom: '2rem' }}>
          Instantly analyze your website or email for security vulnerabilities.
        </p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(244,67,54,0.1)',
            border: '1px solid #f44336',
            padding: '1rem',
            marginBottom: '1rem'
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
              border: '1px solid #8994a9'
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '1rem',
              width: '100%',
              backgroundColor: '#07d2f8',
              border: 'none',
              fontWeight: 'bold'
            }}
          >
            {loading ? "Analyzing..." : "Get Security Score"}
          </button>

        </form>

      </div>
    </div>
  );
}