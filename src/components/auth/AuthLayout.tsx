'use client';
import React, { useEffect, useState } from 'react';
import AppLogo from '../ui/AppLogo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background Gradient Tracking */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-1000 opacity-40"
        style={{
          background: `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.08), transparent 60%)`
        }}
      />
      
      {/* Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/[0.04] rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-sky-500/[0.04] rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }} />

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-1000 ease-out">
        <div className="flex flex-col items-center mb-8">
          <div className="p-2.5 rounded-xl bg-card border border-white/5 shadow-xl mb-4 transition-transform duration-500">
            <AppLogo size={36} className="drop-shadow-[0_0_10px_rgba(56,189,248,0.2)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">CreatorTracker</h1>
        </div>
        
        <div className="bg-card/40 backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-8 md:p-10 shadow-modal relative overflow-hidden">
          {/* Subtle top light effect */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
          
          {children}
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <p className="text-[11px] text-muted-foreground/40 font-medium tracking-wide hover:text-muted-foreground/60 cursor-pointer transition-colors">
            Privacy Policy
          </p>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
          <p className="text-[11px] text-muted-foreground/40 font-medium tracking-wide hover:text-muted-foreground/60 cursor-pointer transition-colors">
            Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
