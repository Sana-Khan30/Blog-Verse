import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * LenisProvider
 * ─────────────────────────────────────────
 * Fixes Lenis ↔ GSAP ScrollTrigger conflict by syncing ScrollTrigger
 * updates to Lenis' RAF loop (single scroll position source).
 */
export const LenisProvider = ({ children }) => {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.8,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Tick ScrollTrigger on every Lenis frame
    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    // RAF loop — single requestAnimationFrame drives both
    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off('scroll', onScroll);
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return <>{children}</>;
};

export default LenisProvider;

