'use client';
import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

export default function AuthInput({ label, icon: Icon, error, type, ...props }: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center px-0.5">
        <label className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">
          {label}
        </label>
        {error && <span className="text-[10px] font-bold text-red-500/80 uppercase tracking-wider animate-in fade-in slide-in-from-right-1">{error}</span>}
      </div>
      
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors duration-300">
            <Icon size={18} />
          </div>
        )}
        
        <input
          {...props}
          type={inputType}
          className={`w-full bg-[#0d1226]/50 border ${error ? 'border-red-500/30' : 'border-white/[0.04]'} text-foreground text-sm font-medium rounded-2xl ${Icon ? 'pl-12' : 'px-5'} pr-12 py-3.5 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/[0.04] transition-all duration-300 hover:bg-[#0d1226]/80 placeholder:text-muted-foreground/20 shadow-inner`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-foreground/60 transition-colors p-1"
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
