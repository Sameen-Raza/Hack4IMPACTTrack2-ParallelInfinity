'use client';

import { useState } from 'react';

export default function PasswordChecker() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passedCount = Object.values(checks).filter(Boolean).length;

  const strength =
    passedCount === 0 ? null :
    passedCount <= 2 ? 'Weak' :
    passedCount <= 3 ? 'Fair' :
    passedCount === 4 ? 'Good' : 'Strong';

  const strengthColor =
    strength === 'Weak' ? '#f44336' :
    strength === 'Fair' ? '#ff9800' :
    strength === 'Good' ? '#2196f3' :
    strength === 'Strong' ? '#4caf50' : 'transparent';

  const tips = [
    { key: 'length',    label: 'At least 8 characters',         passed: checks.length },
    { key: 'uppercase', label: 'Contains uppercase letter (A-Z)', passed: checks.uppercase },
    { key: 'lowercase', label: 'Contains lowercase letter (a-z)', passed: checks.lowercase },
    { key: 'number',    label: 'Contains a number (0-9)',         passed: checks.number },
    { key: 'special',   label: 'Contains special character (!@#)', passed: checks.special },
  ];

  const getTimeToCrack = () => {
    if (!password) return null;
    if (passedCount <= 1) return '< 1 second';
    if (passedCount === 2) return 'A few minutes';
    if (passedCount === 3) return 'A few hours';
    if (passedCount === 4) return 'Several months';
    return 'Centuries';
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>

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
            🔐
          </div>
          <h1 style={{
            color: '#fff',
            fontSize: '1.8rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
          }}>
            Password Strength Checker
          </h1>
          <p style={{ color: '#8994a9', fontSize: '0.9rem' }}>
            Test how secure your password is — instantly.
          </p>
        </div>

        {/* Main Card */}
        <div style={{
          background: 'rgba(7,210,248,0.03)',
          border: '1px solid rgba(7,210,248,0.2)',
          borderRadius: '16px',
          padding: '2rem',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Top glow line */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #07d2f8, transparent)',
          }} />

          {/* Input */}
          <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
            <input
              type={show ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.9rem 3rem 0.9rem 1rem',
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${password ? strengthColor : 'rgba(7,210,248,0.3)'}`,
                borderRadius: '10px',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease',
                letterSpacing: show ? 'normal' : '0.15em',
              }}
            />
            {/* Show/hide toggle */}
            <button
              onClick={() => setShow(!show)}
              style={{
                position: 'absolute',
                right: '0.8rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8994a9',
                fontSize: '1.1rem',
                padding: 0,
              }}
            >
              {show ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Strength bar segments */}
          {password && (
            <>
              <div style={{
                display: 'flex',
                gap: '6px',
                marginBottom: '0.5rem',
              }}>
                {[1, 2, 3, 4, 5].map((seg) => (
                  <div key={seg} style={{
                    flex: 1,
                    height: '5px',
                    borderRadius: '3px',
                    backgroundColor: passedCount >= seg ? strengthColor : 'rgba(255,255,255,0.08)',
                    transition: 'background-color 0.3s ease',
                  }} />
                ))}
              </div>

              {/* Strength label + crack time */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}>
                <span style={{
                  color: strengthColor,
                  fontWeight: '700',
                  fontSize: '0.9rem',
                }}>
                  {strength}
                </span>
                <span style={{ color: '#8994a9', fontSize: '0.78rem' }}>
                  Est. crack time:{' '}
                  <span style={{ color: strengthColor, fontWeight: '600' }}>
                    {getTimeToCrack()}
                  </span>
                </span>
              </div>

              {/* Checklist */}
              <div style={{
                background: 'rgba(0,0,0,0.25)',
                borderRadius: '10px',
                padding: '1rem',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <p style={{
                  color: '#8994a9',
                  fontSize: '0.75rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '0.8rem',
                }}>
                  Requirements
                </p>
                {tips.map((tip) => (
                  <div key={tip.key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    marginBottom: '0.5rem',
                  }}>
                    <div style={{
                      width: '18px', height: '18px',
                      borderRadius: '50%',
                      border: `1.5px solid ${tip.passed ? '#4caf50' : 'rgba(255,255,255,0.15)'}`,
                      background: tip.passed ? 'rgba(76,175,80,0.15)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}>
                      {tip.passed ? '✓' : ''}
                    </div>
                    <span style={{
                      color: tip.passed ? '#cbd5e1' : '#8994a9',
                      fontSize: '0.85rem',
                      transition: 'color 0.2s ease',
                    }}>
                      {tip.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Score summary */}
              <div style={{
                marginTop: '1.2rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem',
                borderRadius: '8px',
                background: `rgba(${
                  strength === 'Strong' ? '76,175,80' :
                  strength === 'Good'   ? '33,150,243' :
                  strength === 'Fair'   ? '255,152,0' : '244,67,54'
                }, 0.08)`,
                border: `1px solid ${strengthColor}33`,
              }}>
                <span style={{ fontSize: '1.1rem' }}>
                  {strength === 'Strong' ? '🛡️' :
                   strength === 'Good'   ? '✅' :
                   strength === 'Fair'   ? '⚠️' : '❌'}
                </span>
                <span style={{ color: strengthColor, fontSize: '0.85rem', fontWeight: '600' }}>
                  {strength === 'Strong' ? 'Excellent! Your password is very strong.' :
                   strength === 'Good'   ? 'Good password — consider adding a special character.' :
                   strength === 'Fair'   ? 'Fair — add more variety to strengthen it.' :
                   'Weak — this password can be cracked easily.'}
                </span>
              </div>
            </>
          )}

          {/* Empty state hint */}
          {!password && (
            <p style={{
              textAlign: 'center',
              color: 'rgba(137,148,169,0.5)',
              fontSize: '0.85rem',
              marginTop: '0.5rem',
            }}>
              Start typing to analyze your password
            </p>
          )}
        </div>

        {/* Disclaimer */}
        <p style={{
          textAlign: 'center',
          color: 'rgba(137,148,169,0.4)',
          fontSize: '0.75rem',
          marginTop: '1.2rem',
        }}>
          🔒 Your password is never stored or transmitted.
        </p>

      </div>
    </div>
  );
}