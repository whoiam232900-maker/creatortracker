'use client';
import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export default function AuthButton({ children, loading, variant = 'primary', className = '', ...props }: AuthButtonProps) {
  const baseStyles = "relative flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-[13px] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none overflow-hidden group tracking-[0.05em]";
  
  const variants = {
    primary: "text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)] border border-white/[0.08] hover:-translate-y-[1px] hover:brightness-110",
    secondary: "bg-[#1a1f35]/80 text-white/90 border border-white/[0.06] hover:bg-[#232946] backdrop-blur-md hover:-translate-y-[1px]",
    outline: "bg-white/[0.02] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.05] hover:-translate-y-[1px]",
    ghost: "bg-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.03]",
  };

  const primaryGradient = {
    background: 'linear-gradient(180deg, rgba(38, 48, 72, 0.95) 0%, rgba(22, 28, 42, 0.98) 100%)'
  };

  return (
    <button 
      {...props} 
      disabled={loading || props.disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={variant === 'primary' ? primaryGradient : {}}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin opacity-60" />
          <span className="opacity-80">Processing</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
