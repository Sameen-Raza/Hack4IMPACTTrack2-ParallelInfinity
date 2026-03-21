'use client';

export default function HowItWorks() {
  const features = [
    {
      icon: '🔐',
      title: 'SSL Security',
      description: 'Checks if the website uses a valid SSL certificate and secure HTTPS configuration.',
      stat: '99.9%', statLabel: 'Detection Rate',
    },
    {
      icon: '📧',
      title: 'Email Exposure',
      description: 'Detects whether an email address may appear in breach datasets or public leaks.',
      stat: '10B+', statLabel: 'Records Checked',
    },
    {
      icon: '🌐',
      title: 'Domain Reputation',
      description: 'Analyzes domain reputation signals to identify potentially suspicious domains.',
      stat: '50M+', statLabel: 'Domains Analyzed',
    },
    {
      icon: '⚠️',
      title: 'Phishing Detection',
      description: 'Detects suspicious phishing patterns in URLs that could indicate malicious intent.',
      stat: '<1s', statLabel: 'Scan Time',
    },
  ];

  const steps = [
    { number: '01', title: 'Enter Target', desc: 'Input any website URL or email address.' },
    { number: '02', title: 'Deep Scan', desc: 'Our engine runs multi-layer security checks.' },
    { number: '03', title: 'Score & Report', desc: 'Get a full breakdown with your security score.' },
    { number: '04', title: 'Take Action', desc: 'Follow recommendations to patch vulnerabilities.' },
  ];

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{
          display: 'inline-block',
          padding: '0.3rem 1rem',
          border: '1px solid rgba(7,210,248,0.4)',
          borderRadius: '999px',
          color: '#07d2f8',
          fontSize: '0.75rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '1rem',
          background: 'rgba(7,210,248,0.06)',
        }}>
          How It Works
        </div>

        <h1 style={{
          color: '#fff',
          fontSize: '2.8rem',
          fontWeight: '700',
          marginBottom: '1rem',
          lineHeight: '1.2',
        }}>
          Security Analysis{' '}
          <span style={{ color: '#07d2f8' }}>Powered by Intelligence</span>
        </h1>

        <p style={{
          color: '#8994a9',
          fontSize: '1rem',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.7',
        }}>
          CyberShield evaluates multiple security signals in real time and generates
          a comprehensive score with actionable recommendations.
        </p>
      </div>

      {/* Steps Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0',
        marginBottom: '4rem',
        position: 'relative',
      }}>
        {/* Connector line */}
        <div style={{
          position: 'absolute',
          top: '28px',
          left: '12%',
          right: '12%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(7,210,248,0.4), transparent)',
          zIndex: 0,
        }} />

        {steps.map((step, i) => (
          <div key={i} style={{
            textAlign: 'center',
            padding: '0 1rem',
            position: 'relative',
            zIndex: 1,
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(7,210,248,0.1)',
              border: '2px solid #07d2f8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#07d2f8',
              fontWeight: '700',
              fontSize: '0.85rem',
              boxShadow: '0 0 16px rgba(7,210,248,0.25)',
            }}>
              {step.number}
            </div>
            <h4 style={{ color: '#fff', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
              {step.title}
            </h4>
            <p style={{ color: '#8994a9', fontSize: '0.8rem', lineHeight: '1.5' }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '4rem',
      }}>
        {features.map((feature, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(7,210,248,0.03)',
              border: '1px solid rgba(7,210,248,0.2)',
              borderRadius: '16px',
              padding: '1.8rem',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
              cursor: 'default',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = 'translateY(-6px)';
              el.style.boxShadow = '0 8px 40px rgba(7,210,248,0.2)';
              el.style.borderColor = 'rgba(7,210,248,0.6)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = 'translateY(0)';
              el.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
              el.style.borderColor = 'rgba(7,210,248,0.2)';
            }}
          >
            {/* Top glow line */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #07d2f8, transparent)',
            }} />

            {/* Corner number */}
            <div style={{
              position: 'absolute',
              top: '1rem', right: '1rem',
              color: 'rgba(7,210,248,0.25)',
              fontSize: '0.7rem',
              fontWeight: '700',
              letterSpacing: '1px',
            }}>
              0{i + 1}
            </div>

            {/* Icon */}
            <div style={{
              width: '50px', height: '50px',
              borderRadius: '12px',
              background: 'rgba(7,210,248,0.08)',
              border: '1px solid rgba(7,210,248,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginBottom: '1.2rem',
            }}>
              {feature.icon}
            </div>

            <h3 style={{
              color: '#07d2f8',
              fontSize: '1.05rem',
              fontWeight: '600',
              marginBottom: '0.6rem',
            }}>
              {feature.title}
            </h3>

            <p style={{
              color: '#8994a9',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              marginBottom: '1.4rem',
            }}>
              {feature.description}
            </p>

            {/* Stat */}
            <div style={{
              borderTop: '1px solid rgba(7,210,248,0.1)',
              paddingTop: '1rem',
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.5rem',
            }}>
              <span style={{ color: '#07d2f8', fontWeight: '700', fontSize: '1.2rem' }}>
                {feature.stat}
              </span>
              <span style={{ color: '#8994a9', fontSize: '0.75rem' }}>
                {feature.statLabel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA Banner */}
      <div style={{
        background: 'rgba(7,210,248,0.06)',
        border: '1px solid rgba(7,210,248,0.25)',
        borderRadius: '16px',
        padding: '2.5rem',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 0 40px rgba(7,210,248,0.08)',
      }}>
        <h2 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '0.75rem' }}>
          Ready to check your security?
        </h2>
        <p style={{ color: '#8994a9', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Get your comprehensive security score within seconds.
        </p>
        <a href="/" style={{
          display: 'inline-block',
          padding: '0.85rem 2.5rem',
          backgroundColor: '#07d2f8',
          color: '#000',
          fontWeight: '700',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '0.95rem',
          transition: 'opacity 0.2s',
        }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Run Free Scan →
        </a>
      </div>

    </div>
  );
}