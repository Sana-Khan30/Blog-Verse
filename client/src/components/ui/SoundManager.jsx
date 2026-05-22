import { useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const useLenis = () => {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    // Add smooth scroll class to html
    document.documentElement.classList.add('lenis', 'lenis-smooth');
    document.documentElement.style.scrollBehavior = 'auto';

    return () => {
      lenis.destroy();
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, []);

  return lenisRef;
};

// Standalone component wrapper
export const LenisProvider = ({ children }) => {
  useLenis();
  return <>{children}</>;
};

export default useLenis;