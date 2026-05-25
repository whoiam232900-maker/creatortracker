'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // 1.4s to 1.8s total sequence
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1400);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2100);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      id="splash-screen"
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.055), transparent 42%)'
      }}
    >
      <div className="flex flex-col items-center justify-center animate-splash-reveal">
        {/* Premium Masked Logo Frame */}
        <div className="relative mb-8 flex items-center justify-center">
          <div 
            className="pointer-events-none absolute h-24 w-24 rounded-full blur-2xl" 
            style={{ backgroundColor: 'var(--accent-glow-strong, rgba(59, 130, 246, 0.1))' }}
          />

          <div className="relative h-[78px] w-[78px] overflow-hidden rounded-2xl border border-white/20 bg-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_40px_rgba(0,0,0,0.32)]">
            <Image
              src="/assets/creatortracker-logo.png"
              alt="CreatorTracker"
              fill
              priority
              className="object-cover opacity-95"
            />
          </div>
        </div>

        {/* Premium Branded Title */}
        <h1 
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '38px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'rgba(255,255,255,0.88)',
            lineHeight: 1,
            margin: 0
          }}
        >
          CreatorTracker
        </h1>
        
        {/* Refined Subtitle */}
        <p 
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            letterSpacing: '0.2em',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.34)',
            marginTop: '8px',
            marginRight: '-0.2em', // Optical alignment for tracking
            textTransform: 'uppercase'
          }}
        >
          PRECISION OPERATIONAL SOFTWARE
        </p>
      </div>
      
      <style jsx global>{`
        @keyframes splash-reveal {
          0% {
            opacity: 0;
            transform: scale(0.985);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-splash-reveal {
          animation: splash-reveal 850ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
}
