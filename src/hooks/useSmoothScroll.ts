import { useEffect, RefObject } from 'react';

export function useSmoothScroll(ref: RefObject<HTMLElement | null>, enabled: boolean = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || typeof window === 'undefined') return;

    // Precise device detection: 
    // (hover: hover) and (pointer: fine) targets mouse/wheel users specifically.
    // Touchpads and touch screens should use their native high-quality inertia.
    const isMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!isMouse || prefersReducedMotion) return;

    let targetScrollY = el.scrollTop;
    let currentScrollY = el.scrollTop;
    let isScrolling = false;
    let rafId: number | null = null;

    const smoothScroll = () => {
      const diff = targetScrollY - currentScrollY;
      
      // Stop if very close to prevent micro-jank
      if (Math.abs(diff) < 0.1) {
        currentScrollY = targetScrollY;
        el.scrollTop = currentScrollY;
        isScrolling = false;
        return;
      }

      // Premium easing factor (lower = smoother/longer duration)
      // Refined to 0.085 for a more unhurried, luxury feel
      currentScrollY += diff * 0.085;
      el.scrollTop = currentScrollY;
      rafId = requestAnimationFrame(smoothScroll);
    };

    const handleWheel = (e: WheelEvent) => {
      // Ignore horizontal scrolling
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

      // Ignore if over interactive elements that need their own scroll
      const target = e.target as HTMLElement;
      if (
        target.closest('textarea') ||
        target.closest('input') ||
        target.closest('[contenteditable="true"]') ||
        // If the target is a nested scroll area, don't hijack
        (target.closest('.scrollbar-thin') && target.closest('.scrollbar-thin') !== el)
      ) {
        return;
      }

      e.preventDefault();

      // Slightly reduce scroll amount by exactly 1% for a "controlled" feel
      targetScrollY += e.deltaY * 0.99;
      
      // Clamp to bounds
      targetScrollY = Math.max(0, Math.min(targetScrollY, el.scrollHeight - el.clientHeight));

      if (!isScrolling) {
        isScrolling = true;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(smoothScroll);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [ref, enabled]);
}
