'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [count, setCount] = useState(10);

  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) { clearInterval(t); window.location.href = '/'; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center',
    }}>
      <style>{`
        @keyframes glitch {
          0%,100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-1px, 1px); }
          80% { transform: translate(1px, -1px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      {/* Glitch 404 */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%', border: '2px solid rgba(7,210,248,0.3)',
          animation: 'pulse-ring 2s ease-out infinite',
        }} />
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'rgba(7,210,248,0.06)', border: '2px solid rgba(7,210,248,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem',
          animation: 'glitch 3s ease-in-out infinite',
        }}>
          🔍
        </div>
      </div>

      <h1 style={{
        fontSize: 'clamp(4rem, 12vw, 8rem)', fontWeight: '900',
        color: '#07d2f8', lineHeight: 1, marginBottom: '0.5rem',
        textShadow: '0 0 40px rgba(7,210,248,0.4)',
        letterSpacing: '-2px',
      }}>
        404
      </h1>

      <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.8rem' }}>
        Target Not Found
      </h2>

      <p style={{ color: '#8994a9', fontSize: '0.92rem', maxWidth: '380px', lineHeight: 1.6, marginBottom: '2rem' }}>
        The page you're looking for doesn't exist or has been moved. Our security scan came up empty.
      </p>

      {/* Redirect countdown */}
      <div style={{
        background: 'rgba(7,210,248,0.05)', border: '1px solid rgba(7,210,248,0.2)',
        borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          height: '2px', background: '#07d2f8',
          width: `${(count / 10) * 100}%`,
          transition: 'width 1s linear',
        }} />
        <p style={{ color: '#8994a9', fontSize: '0.82rem', margin: 0 }}>
          Redirecting to home in{' '}
          <span style={{ color: '#07d2f8', fontWeight: '700' }}>{count}s</span>
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" style={{
          padding: '0.8rem 1.8rem', background: '#07d2f8',
          border: 'none', borderRadius: '10px', color: '#000',
          fontWeight: '700', textDecoration: 'none', fontSize: '0.9rem',
        }}>
          🏠 Go Home
        </Link>
        <Link href="/how-it-works" style={{
          padding: '0.8rem 1.8rem', background: 'transparent',
          border: '1px solid rgba(7,210,248,0.35)', borderRadius: '10px',
          color: '#07d2f8', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem',
        }}>
          How It Works
        </Link>
      </div>
    </div>
  );
}