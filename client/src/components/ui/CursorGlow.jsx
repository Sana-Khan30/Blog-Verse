import { useEffect, useRef, useState } from 'react';

/**
 * CursorGlow
 * ─────────────────────────────────────────
 * TWO-LAYER cursor system (like Linear / Vercel):
 *   1. Small sharp dot  — snaps to mouse instantly (no lag)
 *   2. Large soft glow  — follows with eased lag (ambient light)
 *
 * States:
 *   • default   — dot + ambient glow
 *   • hovering  — dot expands, glow brightens (on links/buttons)
 *   • clicking  — dot shrinks (tactile press feel)
 *   • text      — dot becomes I-beam width
 *
 * Fixes from audit:
 *   • Brand violet/cyan instead of blue
 *   • cursor:none is already in global CSS for lg+ — this renders the replacement
 *   • Hides itself below 1024px (pointer events / media query safe)
 *   • RAF-based loop instead of event-driven style mutations (smoother)
 */
const CursorGlow = () => {
  const dotRef  = useRef(null);
  const glowRef = useRef(null);

  const mouse   = useRef({ x: -200, y: -200 });
  const current = useRef({ x: -200, y: -200 });
  const rafId   = useRef(null);

  const [visible,  setVisible]  = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [isText,   setIsText]   = useState(false);

  useEffect(() => {
    // Only activate on pointer-precise devices (desktop)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    // ── Mouse tracking ──────────────────────────────
    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (!visible) setVisible(true);
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    // ── Hover detection ─────────────────────────────
    const onMouseOver = (e) => {
      const el = e.target;
      const isInteractive = el.closest('a, button, [role="button"], input, textarea, select, label');
      const isTextField   = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.closest('[contenteditable]');
      setHovering(!!isInteractive && !isTextField);
      setIsText(!!isTextField);
    };

    // ── Click states ────────────────────────────────
    const onDown = () => setClicking(true);
    const onUp   = () => setClicking(false);

    // ── Animation loop ──────────────────────────────
    const animate = () => {
      const ease = 0.12;
      current.current.x += (mouse.current.x - current.current.x) * ease;
      current.current.y += (mouse.current.y - current.current.y) * ease;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px) translate(-50%, -50%)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${current.current.x}px, ${current.current.y}px) translate(-50%, -50%)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove',  onMove,      { passive: true });
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseover',  onMouseOver);
    window.addEventListener('mousedown',  onDown);
    window.addEventListener('mouseup',    onUp);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseover',  onMouseOver);
      window.removeEventListener('mousedown',  onDown);
      window.removeEventListener('mouseup',    onUp);
      cancelAnimationFrame(rafId.current);
    };
  }, [visible]);

  // Derive visual states
  const dotSize  = clicking ? 6 : hovering ? 18 : isText ? 2 : 8;
  const dotBg    = hovering
    ? 'transparent'
    : 'linear-gradient(135deg, var(--violet), var(--cyan))';
  const dotBorder = hovering
    ? '2px solid rgba(124,58,237,0.7)'
    : isText
      ? '1.5px solid var(--violet)'
      : 'none';
  const dotH      = isText ? 20 : dotSize;
  const dotRadius  = isText ? 1 : 999;
  const glowOpacity = visible ? (hovering ? 0.22 : 0.13) : 0;
  const glowSize    = hovering ? 380 : 280;

  return (
    <>
      {/* ── Layer 1: Sharp dot (no lag) ── */}
      <div
        ref={dotRef}
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         dotSize,
          height:        dotH,
          borderRadius:  dotRadius,
          background:    dotBg,
          border:        dotBorder,
          pointerEvents: 'none',
          zIndex:        99999,
          opacity:       visible ? 1 : 0,
          transition:    'width 0.2s ease, height 0.2s ease, border-radius 0.2s ease, opacity 0.3s ease, background 0.2s ease, border 0.2s ease',
          willChange:    'transform',
          mixBlendMode:  hovering ? 'normal' : 'normal',
        }}
      />

      {/* ── Layer 2: Ambient glow (eased lag) ── */}
      <div
        ref={glowRef}
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         glowSize,
          height:        glowSize,
          borderRadius:  '50%',
          background:    'radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex:        99990,
          opacity:       glowOpacity,
          transition:    'opacity 0.4s ease, width 0.4s ease, height 0.4s ease',
          willChange:    'transform',
        }}
      />
    </>
  );
};

export default CursorGlow;