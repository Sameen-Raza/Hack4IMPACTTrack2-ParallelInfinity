export default function Features() {
  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', padding: '3rem 2rem', color: '#fff' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#07d2f8', marginBottom: '2rem' }}>
          Features
        </h1>
        <div style={{ color: '#8994a9', lineHeight: '1.8', fontSize: '1.1rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#07d2f8', fontSize: '1.3rem', marginBottom: '0.5rem' }}>🔍 Real-time Scanning</h2>
            <p>Instantly scan websites and email addresses for security threats.</p>
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#07d2f8', fontSize: '1.3rem', marginBottom: '0.5rem' }}>📊 Security Score</h2>
            <p>Get a clear, numerical security score with detailed breakdown.</p>
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#07d2f8', fontSize: '1.3rem', marginBottom: '0.5rem' }}>💡 Recommendations</h2>
            <p>Receive actionable insights to improve your security.</p>
          </div>
          <div>
            <h2 style={{ color: '#07d2f8', fontSize: '1.3rem', marginBottom: '0.5rem' }}>📈 Tracking</h2>
            <p>Monitor your security score over time and track improvements.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
