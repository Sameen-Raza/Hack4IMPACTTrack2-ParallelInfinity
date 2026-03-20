'use client';

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
  { name: 'Phishing URL',   href: '/phishing-checker' },
  { name: 'Email Analyzer', href: '/phishing-analyzer' },
  { name: 'Compare',        href: '/compare' },
  { name: 'Dashboard',      href: '/dashboard' },
  { name: 'SMB',            href: '/smb-assessment' },
  { name: 'About',          href: '/about' },
];

function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <style>{`
        @keyframes fadeDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .nav-link{transition:all 0.15s}.nav-link:hover{color:#07d2f8!important;background:rgba(7,210,248,0.06)!important}
        .mobile-link:hover{background:rgba(7,210,248,0.08)!important}
        @media(max-width:900px){.desktop-nav{display:none!important}.hamburger{display:flex!important}}
        @media(min-width:901px){.hamburger{display:none!important}.mobile-menu{display:none!important}}
      `}</style>
      <nav style={{backgroundColor:'rgba(6,6,8,0.95)',borderBottom:'1px solid rgba(137,148,169,0.2)',backdropFilter:'blur(16px)',padding:'0 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',position:'relative',zIndex:100,flexShrink:0,height:'56px'}}>
        <Link href="/" style={{display:'flex',alignItems:'center',gap:'0.5rem',textDecoration:'none',flexShrink:0}}>
          <Image src="/logo.png" alt="CyberShield" width={32} height={32} priority style={{borderRadius:'8px'}} />
          <span style={{fontSize:'1.1rem',fontWeight:700,color:'#07d2f8'}}>CyberShield</span>
        </Link>
        <div className="desktop-nav" style={{display:'flex',alignItems:'center',gap:'0.1rem',overflowX:'auto'}}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="nav-link" style={{color:active?'#07d2f8':'#8994a9',textDecoration:'none',fontWeight:active?600:400,fontSize:'0.78rem',padding:'0.35rem 0.6rem',borderRadius:'6px',background:active?'rgba(7,210,248,0.08)':'transparent',border:active?'1px solid rgba(7,210,248,0.2)':'1px solid transparent',whiteSpace:'nowrap',position:'relative'}}>
                {item.name}
                {active&&<span style={{position:'absolute',bottom:'-1px',left:'50%',transform:'translateX(-50%)',width:'14px',height:'2px',background:'#07d2f8',borderRadius:'1px'}}/>}
              </Link>
            );
          })}
        </div>
        <button className="hamburger" onClick={()=>setMenuOpen(!menuOpen)} style={{display:'none',flexDirection:'column',gap:'5px',background:'none',border:'none',cursor:'pointer',padding:'4px'}}>
          {[0,1,2].map((i)=>(
            <span key={i} style={{display:'block',width:'22px',height:'2px',background:'#07d2f8',borderRadius:'1px',transform:menuOpen?i===0?'rotate(45deg) translate(5px,5px)':i===1?'scaleX(0)':'rotate(-45deg) translate(5px,-5px)':'none',transition:'transform 0.2s'}}/>
          ))}
        </button>
      </nav>
      {menuOpen&&(
        <div className="mobile-menu" style={{position:'fixed',top:'56px',left:0,right:0,background:'rgba(6,6,8,0.98)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(7,210,248,0.2)',zIndex:99,padding:'0.8rem',animation:'fadeDown 0.2s ease',maxHeight:'80vh',overflowY:'auto'}}>
          {navItems.map((item)=>{
            const active=pathname===item.href;
            return(
              <Link key={item.name} href={item.href} className="mobile-link" onClick={()=>setMenuOpen(false)} style={{display:'block',padding:'0.65rem 1rem',color:active?'#07d2f8':'#fff',textDecoration:'none',fontWeight:active?600:400,fontSize:'0.9rem',borderRadius:'8px',marginBottom:'0.2rem',background:active?'rgba(7,210,248,0.08)':'transparent',borderLeft:active?'3px solid #07d2f8':'3px solid transparent',transition:'all 0.15s'}}>
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
    <footer style={{borderTop:'1px solid rgba(137,148,169,0.1)',background:'rgba(6,6,8,0.9)',backdropFilter:'blur(12px)',padding:'1.5rem 2rem',position:'relative',zIndex:10,flexShrink:0}}>
      <div style={{maxWidth:'1100px',margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1.5rem',marginBottom:'1.2rem'}}>
          <div>
            <div style={{color:'#07d2f8',fontWeight:700,marginBottom:'0.5rem'}}>🛡️ CyberShield</div>
            <p style={{color:'#8994a9',fontSize:'0.78rem',lineHeight:1.6,margin:0}}>AI-powered cybersecurity platform. Free, fast, private.</p>
            <p style={{color:'#4caf50',fontSize:'0.72rem',margin:'0.5rem 0 0',fontWeight:'600'}}>🤖 Powered by Amazon Nova</p>
          </div>
          <div>
            <h4 style={{color:'#07d2f8',fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'0.7rem'}}>Tools</h4>
            {[['Security Score','/'],['Password Checker','/password-checker'],['Phishing URL','/phishing-checker'],['Email Analyzer','/phishing-analyzer'],['Compare','/compare'],['Dashboard','/dashboard'],['SMB Assessment','/smb-assessment']].map(([n,h])=>(
              <Link key={n} href={h} style={{display:'block',color:'#8994a9',fontSize:'0.78rem',textDecoration:'none',marginBottom:'0.3rem'}}
                onMouseEnter={e=>(e.currentTarget.style.color='#07d2f8')}
                onMouseLeave={e=>(e.currentTarget.style.color='#8994a9')}>{n}</Link>
            ))}
          </div>
          <div>
            <h4 style={{color:'#07d2f8',fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'0.7rem'}}>Learn</h4>
            {[['How It Works','/how-it-works'],['Features','/features'],['About Us','/about']].map(([n,h])=>(
              <Link key={n} href={h} style={{display:'block',color:'#8994a9',fontSize:'0.78rem',textDecoration:'none',marginBottom:'0.3rem'}}
                onMouseEnter={e=>(e.currentTarget.style.color='#07d2f8')}
                onMouseLeave={e=>(e.currentTarget.style.color='#8994a9')}>{n}</Link>
            ))}
          </div>
          <div>
            <h4 style={{color:'#07d2f8',fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'0.7rem'}}>Contact</h4>
            <p style={{color:'#8994a9',fontSize:'0.78rem',margin:'0 0 0.3rem'}}>📧 contact@cybershield.io</p>
            <p style={{color:'#8994a9',fontSize:'0.78rem',margin:'0 0 0.3rem'}}>🕐 Mon–Fri, 9AM–6PM IST</p>
          </div>
        </div>
        <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.5rem'}}>
          <p style={{color:'#8994a9',fontSize:'0.72rem',margin:0}}>© {new Date().getFullYear()} CyberShield. All rights reserved.</p>
          <p style={{color:'#8994a9',fontSize:'0.72rem',margin:0}}>🔒 No data stored · No tracking · AWS Powered</p>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="en" style={{height:'100%',margin:0,padding:0}}>
      <body style={{minHeight:'100vh',color:'#fff',margin:0,padding:0,fontFamily:'system-ui,-apple-system,sans-serif',display:'flex',flexDirection:'column'}}>
        <Navbar/>
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:-1,overflow:'hidden'}}>
          <DigitalRain/>
        </div>
        <div style={{position:'relative',zIndex:5,flex:1}}>
          {children}
        </div>
        <Footer/>
      </body>
    </html>
  );
}