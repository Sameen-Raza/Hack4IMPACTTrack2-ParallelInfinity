'use client';

export default function Features() {
  const features = [
    {
      icon: '🔍',
      title: 'Real-time Scanning',
      description: 'Instantly scan websites and email addresses for security threats.',
    },
    {
      icon: '🛡️',
      title: 'Security Score',
      description: 'Get a clear, numerical security score with detailed breakdown.',
    },
    {
      icon: '💡',
      title: 'Recommendations',
      description: 'Receive actionable insights to improve your security.',
    },
    {
      icon: '📝',
      title: 'Tracking',
      description: 'Monitor your security score over time and track improvements.',
    },
  ];

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{
          color: '#07d2f8',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '0.75rem',
          letterSpacing: '1px',
        }}>
          Features
        </h1>
        <p style={{ color: '#8994a9', fontSize: '1rem', maxWidth: '500px' }}>
          Everything you need to stay protected online — in one place.
        </p>
        {/* Decorative underline */}
        <div style={{
          marginTop: '0.75rem',
          width: '60px',
          height: '3px',
          backgroundColor: '#07d2f8',
          borderRadius: '2px',
        }} />
      </div>

      {/* Feature Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
      }}>
        {features.map((feature, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(7, 210, 248, 0.04)',
              border: '1px solid rgba(7, 210, 248, 0.25)',
              borderRadius: '14px',
              padding: '1.8rem',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 20px rgba(7,210,248,0.06)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 30px rgba(7,210,248,0.18)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(7,210,248,0.6)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 20px rgba(7,210,248,0.06)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(7,210,248,0.25)';
            }}
          >
            {/* Top accent line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #07d2f8, transparent)',
              opacity: 0.6,
            }} />

            {/* Icon badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'rgba(7,210,248,0.1)',
              border: '1px solid rgba(7,210,248,0.2)',
              fontSize: '1.6rem',
              marginBottom: '1.2rem',
            }}>
              {feature.icon}
            </div>

            {/* Number badge */}
            <div style={{
              position: 'absolute',
              top: '1.2rem',
              right: '1.2rem',
              fontSize: '0.7rem',
              color: 'rgba(7,210,248,0.4)',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}>
              0{i + 1}
            </div>

            <h3 style={{
              color: '#07d2f8',
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '0.6rem',
              letterSpacing: '0.3px',
            }}>
              {feature.title}
            </h3>

            <p style={{
              color: '#8994a9',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              margin: 0,
            }}>
              {feature.description}
            </p>

          </div>
        ))}
      </div>

    </div>
  );
}