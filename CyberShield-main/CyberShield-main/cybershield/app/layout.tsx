'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import DigitalRain from './components/DigitalRain';
import './globals.css';

const navItems = [
  { name: 'Home',           href: '/' },
  { name: 'How It Works',   href: '/how-it-works' },
  { name: 'Features',       href: '/features' },
  { name: 'Password',       href: '/password-checker' },
  { name: 'Phishing',       href: '/phishing-checker' },
  { name: 'SMB Assessment', href: '/smb-assessment' },
  { name: 'About Us',       href: '/about' },
];

function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-link:hover { color: #07d2f8 !important; }
        .mobile-link:hover { background: rgba(7,210,248,0.08) !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger   { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hamburger    { display: none !important; }
          .mobile-menu  { display: none !important; }
        }
      `}</style>

      <nav style={{
        backgroundColor: 'rgba(6,6,8,0.92)',
        borderBottom: '1px solid rgba(137,148,169,0.3)',
        backdropFilter: 'blur(12px)',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 100, flexShrink: 0,
        height: '60px',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <Image src="/logo.png" alt="CyberShield" width={36} height={36} priority style={{ borderRadius: '8px' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#07d2f8', letterSpacing: '0.3px' }}>
            CyberShield
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="nav-link" style={{
                color: active ? '#07d2f8' : '#8994a9',
                textDecoration: 'none', fontWeight: active ? 600 : 400,
                fontSize: '0.88rem', padding: '0.4rem 0.75rem', borderRadius: '6px',
                background: active ? 'rgba(7,210,248,0.08)' : 'transparent',
                border: active ? '1px solid rgba(7,210,248,0.2)' : '1px solid transparent',
                transition: 'all 0.15s',
                position: 'relative',
              }}>
                {item.name}
                {active && (
                  <span style={{
                    position: 'absolute', bottom: '-1px', left: '50%',
                    transform: 'translateX(-50%)', width: '16px', height: '2px',
                    background: '#07d2f8', borderRadius: '1px',
                  }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{
          display: 'none', flexDirection: 'column', gap: '5px',
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
        }}>
          {[0,1,2].map((i) => (
            <span key={i} style={{
              display: 'block', width: '22px', height: '2px',
              background: '#07d2f8', borderRadius: '1px',
              transform: menuOpen
                ? i === 0 ? 'rotate(45deg) translate(5px,5px)'
                : i === 1 ? 'scaleX(0)'
                : 'rotate(-45deg) translate(5px,-5px)'
                : 'none',
              transition: 'transform 0.2s',
            }} />
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu" style={{
          position: 'fixed', top: '60px', left: 0, right: 0,
          background: 'rgba(6,6,8,0.97)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(7,210,248,0.2)',
          zIndex: 99, padding: '1rem',
          animation: 'fadeDown 0.2s ease',
        }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="mobile-link"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block', padding: '0.75rem 1rem',
                  color: active ? '#07d2f8' : '#fff',
                  textDecoration: 'none', fontWeight: active ? 600 : 400,
                  fontSize: '0.95rem', borderRadius: '8px', marginBottom: '0.25rem',
                  background: active ? 'rgba(7,210,248,0.08)' : 'transparent',
                  borderLeft: active ? '3px solid #07d2f8' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}>
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(137,148,169,0.15)',
      background: 'rgba(6,6,8,0.85)',
      backdropFilter: 'blur(12px)',
      padding: '2rem',
      position: 'relative', zIndex: 10, flexShrink: 0,
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '2rem', marginBottom: '1.5rem' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#07d2f8' }}>🛡️ CyberShield</span>
            </div>
            <p style={{ color: '#8994a9', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
              Enterprise-grade security tools for everyone. Free, fast, and private.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 style={{ color: '#07d2f8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>Tools</h4>
            {[
              { name: 'Security Score', href: '/' },
              { name: 'Password Checker', href: '/password-checker' },
              { name: 'Phishing Detector', href: '/phishing-checker' },
              { name: 'SMB Assessment', href: '/smb-assessment' },
            ].map((l) => (
              <Link key={l.name} href={l.href} style={{ display: 'block', color: '#8994a9', fontSize: '0.82rem', textDecoration: 'none', marginBottom: '0.35rem', transition: 'color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#07d2f8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#8994a9')}
              >{l.name}</Link>
            ))}
          </div>

          {/* Learn */}
          <div>
            <h4 style={{ color: '#07d2f8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>Learn</h4>
            {[
              { name: 'How It Works', href: '/how-it-works' },
              { name: 'Features', href: '/features' },
              { name: 'About Us', href: '/about' },
            ].map((l) => (
              <Link key={l.name} href={l.href} style={{ display: 'block', color: '#8994a9', fontSize: '0.82rem', textDecoration: 'none', marginBottom: '0.35rem', transition: 'color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#07d2f8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#8994a9')}
              >{l.name}</Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#07d2f8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>Contact</h4>
            <p style={{ color: '#8994a9', fontSize: '0.82rem', margin: '0 0 0.35rem' }}>📧 contact@cybershield.io</p>
            <p style={{ color: '#8994a9', fontSize: '0.82rem', margin: '0 0 0.35rem' }}>🕐 Mon–Fri, 9AM–6PM IST</p>
            <p style={{ color: '#8994a9', fontSize: '0.82rem', margin: 0 }}>🌐 cybershield.io</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ color: '#8994a9', fontSize: '0.75rem', margin: 0 }}>
            © {new Date().getFullYear()} CyberShield. All rights reserved.
          </p>
          <p style={{ color: '#8994a9', fontSize: '0.75rem', margin: 0 }}>
            🔒 No data stored · No tracking · No ads
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: '100%', margin: 0, padding: 0 }}>
      <body style={{ minHeight: '100vh', color: '#fff', margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, overflow: 'hidden' }}>
          <DigitalRain />
        </div>
        <div style={{ position: 'relative', zIndex: 5, flex: 1 }}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}