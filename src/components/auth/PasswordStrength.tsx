'use client';
import React from 'react';

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements = [
    { label: '8+ characters', regex: /.{8,}/ },
    { label: 'Uppercase letter', regex: /[A-Z]/ },
    { label: 'Lowercase letter', regex: /[a-z]/ },
    { label: 'Number', regex: /[0-9]/ },
    { label: 'Special character', regex: /[^A-Za-z0-9]/ },
  ];

  const metCount = requirements.filter(req => req.regex.test(password)).length;
  const strength = (metCount / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-muted-foreground/20';
    if (strength <= 20) return 'bg-red-500';
    if (strength <= 40) return 'bg-orange-500';
    if (strength <= 60) return 'bg-yellow-500';
    if (strength <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex flex-col gap-3 w-full animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Password Strength</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{Math.round(strength)}%</span>
        </div>
        <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden border border-border/10">
          <div 
            className={`h-full transition-all duration-500 ease-out ${getStrengthColor()}`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-1">
        {requirements.map((req, i) => {
          const isMet = req.regex.test(password);
          return (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${isMet ? 'bg-green-500/10 text-green-500' : 'bg-muted/10 text-muted-foreground/30'}`}>
                {isMet ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${isMet ? 'text-foreground/70' : 'text-muted-foreground/40'}`}>
                {req.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
