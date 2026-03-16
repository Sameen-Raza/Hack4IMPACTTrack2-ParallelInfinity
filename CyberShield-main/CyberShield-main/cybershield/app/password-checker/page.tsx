"use client";

import { useState } from "react";

export default function PasswordChecker() {
  const [password, setPassword] = useState("");

  const getStrength = (password: string) => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { text: "Weak", color: "red" };
  if (score === 3 || score === 4) return { text: "Medium", color: "orange" };
  return { text: "Strong", color: "green" };
};

  const strength = getStrength(password);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      color: "white"
    }}>
      <h1>Password Strength Checker</h1>

      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          padding: "10px",
          marginTop: "20px",
          width: "250px",
          borderRadius: "5px",
          border: "1px solid #07d2f8",
          background: "#1a1a1a",
          color: "white"
        }}
      />

      {password && (
        <p style={{ marginTop: "15px", color: strength.color }}>
          Strength: {strength.text}
        </p>
      )}
    </div>
  );
}