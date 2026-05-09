'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export default function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const variants = {
    rect: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded-md h-3 w-3/4'
  };

  return (
    <div 
      className={`
        bg-white/[0.03] animate-pulse 
        ${variants[variant]} 
        ${className}
      `}
      style={{
        backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent)',
        backgroundSize: '200% 100%',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, shimmer 2s infinite'
      }}
    />
  );
}
