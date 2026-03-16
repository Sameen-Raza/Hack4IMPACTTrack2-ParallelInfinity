'use client';

import { useEffect, useRef } from 'react';

interface DigitalRainProps {
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  speed?: number; // Lower is faster (interval in ms)
  outerVignette?: boolean;
}

const DigitalRain = ({
  color = '#008ba3ff', // Primary accent (Cyber Blue)
  backgroundColor = '#060608', // Primary background (Dark Base)
  fontSize = 16,
  speed = 50,
  outerVignette = true,
}: DigitalRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // State for the drops (Y positions)
  const dropsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (!container || !canvas) return;
      
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Set actual size in memory (scaled to account for extra pixel density)
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Make it look the same size on screen
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Normalize coordinate system to use css pixels.
      ctx.scale(dpr, dpr);

      // Reset drops when resized
      const columns = Math.floor(rect.width / fontSize);
      dropsRef.current = new Array(columns).fill(1).map(() => Math.random() * -100); // Start at random negative heights
    };

    // Initial resize
    resizeCanvas();

    const draw = () => {
      // 1. Fade out the previous frame slightly to create the trail effect
      //    We use the background color but with very low opacity
      //    Note: We manually append '10' for hex opacity (~6%) to the background color
      //    If the background color provided is not 6 hex digits, this might need adjustment,
      //    but for the default #060608 it works perfectly.
      ctx.fillStyle = backgroundColor + '10'; 
      
      // Note: We use rect.width/height derived from canvas to ensure we cover everything
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      
      ctx.fillRect(0, 0, width, height);

      // 2. Set font settings
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      // 3. Loop through drops and draw characters
      for (let i = 0; i < dropsRef.current.length; i++) {
        // Pick a 0 or 1
        const text = Math.random() > 0.5 ? '1' : '0';
        
        const x = i * fontSize;
        const y = dropsRef.current[i] * fontSize;

        // Draw the character
        ctx.fillText(text, x, y);

        // 4. Reset drop to top randomly after it has crossed the screen
        //    Math.random() > 0.975 adds randomness so they don't all look like a solid wall
        if (y > height && Math.random() > 0.975) {
          dropsRef.current[i] = 0;
        }

        // 5. Move drop down
        dropsRef.current[i]++;
      }
    };

    // Animation Loop
    let lastTime = 0;
    const animate = (timeStamp: number) => {
      if (timeStamp - lastTime > speed) {
        draw();
        lastTime = timeStamp;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Handle Window Resize
    const handleResize = () => {
        resizeCanvas();
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [color, backgroundColor, fontSize, speed]);

  const outerVignetteStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    // Updated gradient to match the new background color for seamless blending
    background: `radial-gradient(circle, rgba(6,6,8,0) 60%, ${backgroundColor} 100%)`,
    zIndex: 1,
  };

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: backgroundColor,
        overflow: 'hidden',
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ display: 'block', filter: 'blur(1.5px)' }}
      />
      {outerVignette && <div style={outerVignetteStyle} />}
    </div>
  );
};

export default DigitalRain;
