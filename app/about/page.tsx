'use client';
export default function About() {
  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', padding: '3rem 2rem', color: '#fff' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Title */}
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#07d2f8', marginBottom: '3rem' }}>
          About CyberShield
        </h1>

        {/* Mission */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#07d2f8', marginBottom: '1rem' }}>Our Mission</h2>
          <p style={{ color: '#ffffffff', lineHeight: '1.8', fontSize: '1rem', marginBottom: '1rem' }}>
            CyberShield is an easy-to-use cybersecurity assessment and protection tool tailored for small and medium businesses (SMBs). We provide a quick security health check, risk assessment, and step-by-step security fixes using an automated, non-technical approach.
          </p>
          <p style={{ color: '#ffffffff', lineHeight: '1.8', fontSize: '1rem' }}>
            Our mission is to make security accessible, understandable, and actionable for everyone-without the need for expensive consultants or in-house security teams.
          </p>
        </section>

        {/* Market Overview */}
        <section style={{ marginBottom: '3rem', backgroundColor: 'rgba(7, 210, 248, 0.05)', padding: '2rem', borderRadius: '8px', borderLeft: '4px solid #07d2f8' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#07d2f8', marginBottom: '1rem', marginTop: 0 }}>Why this tool exists</h2>
          <p style={{ color: '#ffffffff', lineHeight: '1.8', fontSize: '1rem', margin: 0 }}>
            Cyberattacks on small and medium businesses (SMBs) are increasing rapidly. Many SMBs lack the budget and expertise to implement strong cybersecurity measures, making them prime targets for ransomware, phishing, and data breaches. While large enterprises invest heavily in security, SMBs struggle with expensive, complex, and ineffective solutions.
          </p>
        </section>

        {/* Contact Section */}
        <section style={{ backgroundColor: '#1a1a1a', padding: '2.5rem', borderRadius: '8px', borderTop: '3px solid #07d2f8' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#07d2f8', marginTop: 0, marginBottom: '1.5rem' }}>Get in Touch</h2>
          <p style={{ color: '#ffffffff', fontSize: '1rem', marginBottom: '1.5rem' }}>
            Have questions about CyberShield or need support? We're here to help.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>Email</h3>
              <a href="mailto:contact@cybershield.io" style={{ color: '#07d2f8', textDecoration: 'none', fontSize: '1rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00b8d4'} onMouseLeave={(e) => e.currentTarget.style.color = '#07d2f8'}>
                contact@cybershield.io
              </a>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>Business Hours</h3>
              <p style={{ color: '#8994a9', fontSize: '1rem', margin: 0 }}>Monday - Friday, 9 AM - 6 PM IST</p>
            </div>
          </div>
          <p style={{ color: '#8994a9', fontSize: '0.9rem', marginTop: '1.5rem', marginBottom: 0 }}>
            For security-related inquiries, please email us directly for priority support.
          </p>
        </section>
      </div>
    </div>
  );
}
