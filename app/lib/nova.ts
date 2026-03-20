export const askNova = async (
  prompt: string,
  type: 'security_report' | 'phishing' | 'chatbot' | 'smb_report'
): Promise<string> => {
  try {
    const res = await fetch('/api/nova', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, type }),
    });
    const data = await res.json();
    return data.result || 'Analysis unavailable.';
  } catch {
    return 'AI analysis temporarily unavailable.';
  }
};