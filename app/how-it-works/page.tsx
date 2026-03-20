export default function HowItWorks() {
  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', padding: '3rem 2rem', color: '#fff' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#07d2f8', marginBottom: '2rem' }}>
          How It Works
        </h1>
        <div style={{ color: '#8994a9', lineHeight: '1.8', fontSize: '1.1rem' }}>
          <p>CyberShield analyzes your website or email for security vulnerabilities using advanced scanning techniques.</p>
          <p>Our system checks for:</p>
          <ul style={{ marginLeft: '2rem' }}>
            <li>SSL certificate validity</li>
            <li>Known vulnerabilities in dependencies</li>
            <li>Security headers configuration</li>
            <li>Phishing and malware indicators</li>
          </ul>
          <p>Receive a comprehensive security score within seconds and get actionable recommendations to improve your security posture.</p>
        </div>
      </div>
    </div>
  );
}
