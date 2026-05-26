import { useEffect, RefObject } from 'react';

export function useSmoothScroll(ref: RefObject<HTMLElement | null>, enabled: boolean = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || typeof window === 'undefined') return;

    // Only for desktop wheel, not mobile/trackpad ideally
    // prefers-reduced-motion check
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!isDesktop || prefersReducedMotion) return;

    let targetScrollY = el.scrollTop;
    let currentScrollY = el.scrollTop;
    let isScrolling = false;
    let rafId: number | null = null;

    const smoothScroll = () => {
      const diff = targetScrollY - currentScrollY;
      
      // Stop if very close
      if (Math.abs(diff) < 0.2) {
        currentScrollY = targetScrollY;
        el.scrollTop = currentScrollY;
        isScrolling = false;
        return;
      }

      // Premium easing factor (lower = smoother/longer duration)
      currentScrollY += diff * 0.095;
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
