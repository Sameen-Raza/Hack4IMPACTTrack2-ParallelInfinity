import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import DigitalRain from "./components/DigitalRain";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberShield - Security Score Checker",
  description: "Check your website security score instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: '100%', margin: 0, padding: 0 }}>
      <body style={{ height: '100vh', color: "#fff", margin: 0, padding: 0, fontFamily: "system-ui, -apple-system, sans-serif", overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <nav
          style={{
            backgroundColor: "rgba(6, 6, 8, 0.8)",
            borderBottom: "1px solid #8994a9",
            padding: "0.75rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: 'relative',
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          {/* Left section: Logo + Brand */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              textDecoration: "none",
            }}
          >
            <Image
              src="/logo.png"
              alt="CyberShield Logo"
              width={100}
              height={100}
              priority
            />
            <span
              style={{
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "#07d2f8",
                lineHeight: 1,
              }}
            >
              CyberShield
            </span>
          </Link>

          {/* Right section: Navigation links */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.75rem",
              fontSize: "0.95rem",
            }}
          >
            {[
              
               { name: "Home", href: "/" },
               { name: "How it Works", href: "/how-it-works" },
               { name: "Features", href: "/features" },
               { name: "Password Checker", href: "/password-checker" },
               { name: "SMB Assessment", href: "/smb-assessment" },
               { name: "About Us", href: "/about" },

            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, overflow: 'hidden' }}>
          <DigitalRain />
        </div>
        <div style={{ position: 'relative', zIndex: 5, flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
