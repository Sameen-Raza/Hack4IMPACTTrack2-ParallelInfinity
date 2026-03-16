"use client";

import { useState } from "react";

export default function PhishingChecker() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");

  const analyzeURL = () => {
    let riskScore = 0;

    if (!url.startsWith("https")) riskScore++;

    if (url.length > 30) riskScore++;

    const suspiciousWords = ["login", "secure", "verify", "account", "bank"];

    suspiciousWords.forEach((word) => {
      if (url.toLowerCase().includes(word)) {
        riskScore++;
      }
    });

    if (riskScore >= 3) {
      setResult("⚠️ High Risk: Possible phishing website");
    } else if (riskScore === 2) {
      setResult("⚠️ Medium Risk: Suspicious URL");
    } else {
      setResult("✅ Low Risk: URL looks safe");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px", color: "white" }}>
      <h1>Phishing URL Detector</h1>

      <input
        type="text"
        placeholder="Enter website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          marginTop: "20px",
          background: "#1a1a1a",
          border: "1px solid #07d2f8",
          color: "white",
        }}
      />

      <br />

      <button
        onClick={analyzeURL}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#07d2f8",
          border: "none",
          cursor: "pointer",
        }}
      >
        Analyze URL
      </button>

      {result && (
        <p style={{ marginTop: "20px", fontSize: "18px" }}>
          {result}
        </p>
      )}
    </div>
  );
}