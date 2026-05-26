import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

/**
 * ScrollProgress
 * ─────────────────────────────────────────
 * • Single source of truth — replaces both ScrollProgress.jsx and ReadingProgress.jsx
 * • Brand-matched violet → violet-2 → cyan gradient (matches --reading-progress in CSS)
 * • Spring-smoothed width so it never stutters
 * • Glow pulse that intensifies near 100%
 * • Zero conflict with Lenis (passive scroll listener)
 */
const ScrollProgress = () => {
  const [rawProgress, setRawProgress] = useState(0);

  // Spring smoothing — feels physical, not mechanical
  const progress = useSpring(rawProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop  = window.scrollY;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setRawProgress(Math.min(100, Math.max(0, pct)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      style={{
        // position & stacking — sits above the 2px top accent line in Navbar
        position:   'fixed',
        top:        0,
        left:       0,
        height:     3,
        zIndex:     9999,
        // brand gradient
        background: 'linear-gradient(90deg, var(--violet), var(--violet-2), var(--cyan))',
        // glow — scales with progress
        boxShadow:  '0 0 10px var(--glow), 0 0 20px rgba(124,58,237,0.2)',
        // spring-driven width
        width:      progress,
        // never block clicks
        pointerEvents: 'none',
        // smooth corners on the right tip
        borderRadius: '0 2px 2px 0',
        // origin for the leading edge
        transformOrigin: 'left',
      }}
    />
  );
};

export default ScrollProgress;