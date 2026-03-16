'use client';

export default function About() {
  const stats = [
    { value: '10K+', label: 'Scans Performed' },
    { value: '98%',  label: 'Threat Detection Rate' },
    { value: '500+', label: 'SMBs Protected' },
    { value: '<1s',  label: 'Average Scan Time' },
  ];

  const team = [
    { name: 'Aryan Mehta',   role: 'Founder & Security Lead',  avatar: '👨‍💻' },
    { name: 'Priya Sharma',  role: 'Backend Engineer',          avatar: '👩‍💻' },
    { name: 'Rohan Verma',   role: 'UI/UX Designer',            avatar: '🎨' },
    { name: 'Sneha Patel',   role: 'Cybersecurity Analyst',     avatar: '🔍' },
  ];

  const values = [
    { icon: '🔐', title: 'Security First',    desc: 'Every feature is built with security as the foundation, not an afterthought.' },
    { icon: '🌍', title: 'Accessible',        desc: 'We make enterprise-grade security tools available to businesses of every size.' },
    { icon: '⚡', title: 'Fast & Actionable', desc: 'Get results in seconds with clear, actionable steps — no jargon.' },
    { icon: '🤝', title: 'Trustworthy',       desc: 'We never store, sell, or share your data. Your privacy is non-negotiable.' },
  ];

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '72px', height: '72px', borderRadius: '18px',
          background: 'rgba(7,210,248,0.1)', border: '1px solid rgba(7,210,248,0.3)',
          fontSize: '2.2rem', marginBottom: '1.2rem',
          boxShadow: '0 0 32px rgba(7,210,248,0.2)',
        }}>🛡️</div>

        <h1 style={{ color: '#fff', fontSize: '2.8rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.2 }}>
          About{' '}
          <span style={{ color: '#07d2f8' }}>CyberShield</span>
        </h1>

        <p style={{ color: '#8994a9', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
          An easy-to-use cybersecurity platform built for small and medium businesses —
          delivering enterprise-grade protection without the enterprise price tag.
        </p>

        {/* Decorative divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <div style={{ flex: 1, maxWidth: '120px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(7,210,248,0.4))' }} />
          <div style={{ color: '#07d2f8', fontSize: '1.2rem' }}>◆</div>
          <div style={{ flex: 1, maxWidth: '120px', height: '1px', background: 'linear-gradient(90deg, rgba(7,210,248,0.4), transparent)' }} />
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))',
        gap: '1rem', marginBottom: '4rem',
      }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(7,210,248,0.04)',
            border: '1px solid rgba(7,210,248,0.2)',
            borderRadius: '14px', padding: '1.5rem',
            textAlign: 'center', backdropFilter: 'blur(10px)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
              background: 'linear-gradient(90deg, transparent, #07d2f8, transparent)',
            }} />
            <div style={{ color: '#07d2f8', fontSize: '2rem', fontWeight: '800', lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ color: '#8994a9', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Mission + Why grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '4rem' }}>

        {/* Mission */}
        <div style={{
          background: 'rgba(7,210,248,0.03)',
          border: '1px solid rgba(7,210,248,0.2)',
          borderRadius: '16px', padding: '2rem',
          backdropFilter: 'blur(12px)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #07d2f8, transparent)',
          }} />
          <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>🎯</div>
          <h2 style={{ color: '#07d2f8', fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>
            Our Mission
          </h2>
          <p style={{ color: '#8994a9', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
            CyberShield is built to make security <span style={{ color: '#cbd5e1' }}>accessible, understandable,
            and actionable</span> for everyone — without the need for expensive consultants
            or in-house security teams.
          </p>
          <p style={{ color: '#8994a9', fontSize: '0.88rem', lineHeight: 1.7, marginTop: '0.8rem', marginBottom: 0 }}>
            We provide quick security health checks, risk assessments, and step-by-step
            fixes using an automated, non-technical approach.
          </p>
        </div>

        {/* Why */}
        <div style={{
          background: 'rgba(244,67,54,0.03)',
          border: '1px solid rgba(244,67,54,0.2)',
          borderRadius: '16px', padding: '2rem',
          backdropFilter: 'blur(12px)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #f44336, transparent)',
          }} />
          <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>⚠️</div>
          <h2 style={{ color: '#f44336', fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>
            Why This Tool Exists
          </h2>
          <p style={{ color: '#8994a9', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
            Cyberattacks on SMBs are <span style={{ color: '#cbd5e1' }}>increasing rapidly</span>. Many
            lack the budget and expertise to implement strong measures, making them prime targets
            for ransomware, phishing, and data breaches.
          </p>
          <p style={{ color: '#8994a9', fontSize: '0.88rem', lineHeight: 1.7, marginTop: '0.8rem', marginBottom: 0 }}>
            While large enterprises invest heavily in security, SMBs struggle with expensive,
            complex, and ineffective solutions. <span style={{ color: '#cbd5e1' }}>CyberShield changes that.</span>
          </p>
        </div>
      </div>

      {/* ── Values ── */}
      <div style={{ marginBottom: '4rem' }}>
        <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.5rem', textAlign: 'center' }}>
          Our <span style={{ color: '#07d2f8' }}>Values</span>
        </h2>
        <p style={{ color: '#8994a9', textAlign: 'center', fontSize: '0.88rem', marginBottom: '2rem' }}>
          The principles that guide everything we build.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1rem' }}>
          {values.map((v, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(7,210,248,0.03)',
                border: '1px solid rgba(7,210,248,0.15)',
                borderRadius: '14px', padding: '1.4rem',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = 'translateY(-4px)';
                el.style.borderColor = 'rgba(7,210,248,0.5)';
                el.style.boxShadow = '0 8px 24px rgba(7,210,248,0.12)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = 'translateY(0)';
                el.style.borderColor = 'rgba(7,210,248,0.15)';
                el.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: '0.7rem' }}>{v.icon}</div>
              <h3 style={{ color: '#07d2f8', fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {v.title}
              </h3>
              <p style={{ color: '#8994a9', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>


      {/* ── Contact ── */}
      <div style={{
        background: 'rgba(7,210,248,0.04)',
        border: '1px solid rgba(7,210,248,0.2)',
        borderRadius: '16px', padding: '2.5rem',
        backdropFilter: 'blur(12px)',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 0 40px rgba(7,210,248,0.06)',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #07d2f8, transparent)',
        }} />

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Get in <span style={{ color: '#07d2f8' }}>Touch</span>
          </h2>
          <p style={{ color: '#8994a9', fontSize: '0.88rem' }}>
            Have questions about CyberShield or need support? We're here to help.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1rem' }}>
          {[
            { icon: '📧', label: 'Email Us',       value: 'contact@cybershield.io',         sub: 'Priority support for security inquiries' },
            { icon: '🕐', label: 'Business Hours', value: 'Mon–Fri, 9 AM – 6 PM IST',       sub: 'We respond within 24 hours' },
            { icon: '🌐', label: 'Website',         value: 'www.cybershield.io',              sub: 'Documentation & resources' },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(7,210,248,0.1)',
              borderRadius: '12px', padding: '1.2rem',
              display: 'flex', alignItems: 'flex-start', gap: '0.9rem',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(7,210,248,0.1)', border: '1px solid rgba(7,210,248,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem',
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ color: '#8994a9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.25rem' }}>
                  {item.label}
                </div>
                <div style={{ color: '#07d2f8', fontSize: '0.88rem', fontWeight: '600' }}>
                  {item.value}
                </div>
                <div style={{ color: '#8994a9', fontSize: '0.75rem', marginTop: '2px' }}>
                  {item.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}