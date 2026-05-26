import { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiFeather, FiCompass, FiArrowRight } from 'react-icons/fi';

/* ─────────────────────────────────────────────────────────────
   MAGNETIC BUTTON — premium hover physics
───────────────────────────────────────────────────────────── */
const MagneticButton = ({ children, className = '', style = {}, strength = 0.35, onClick }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 200, damping: 20, mass: 0.5 });

  const handleMouseMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  }, [x, y, strength]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY, display: 'inline-block', ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────
   ANIMATED WORD — cinematic per-letter reveal
───────────────────────────────────────────────────────────── */
const AnimatedWord = ({ word, delay = 0, className = '', style = {} }) => {
  const letters = word.split('');
  return (
    <span className={className} style={{ display: 'inline-block', ...style }}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ y: '110%', opacity: 0, rotateX: -40 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{
            delay: delay + i * 0.03,
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ display: 'inline-block', transformOrigin: 'bottom center' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   FLOATING ORB — ambient depth element
───────────────────────────────────────────────────────────── */
const FloatingOrb = ({ size, top, left, right, bottom, color, delay, duration, blur }) => (
  <motion.div
    animate={{ y: [0, -20, 0], opacity: [0.4, 0.85, 0.4] }}
    transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    style={{
      position: 'absolute',
      width: size, height: size,
      top, left, right, bottom,
      borderRadius: '50%',
      background: color,
      filter: `blur(${blur ?? 1}px)`,
      pointerEvents: 'none',
    }}
  />
);

/* ─────────────────────────────────────────────────────────────
   LIGHT BEAM — diagonal atmospheric accent
───────────────────────────────────────────────────────────── */
const LightBeam = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: '-30%' }}
    animate={{ opacity: [0, 0.06, 0], x: ['−30%', '130%', '130%'] }}
    transition={{ duration: 3.5, delay, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
    style={{
      position: 'absolute',
      top: '-20%',
      left: 0,
      width: '35%',
      height: '140%',
      background: 'linear-gradient(105deg, transparent 0%, rgba(124,58,237,0.15) 45%, rgba(6,182,212,0.08) 55%, transparent 100%)',
      transform: 'skewX(-20deg)',
      pointerEvents: 'none',
    }}
  />
);

/* ─────────────────────────────────────────────────────────────
   STAT PILL — social proof item
───────────────────────────────────────────────────────────── */
const StatPill = ({ value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <span style={{
      fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
      fontWeight: 700,
      color: 'var(--text)',
      letterSpacing: '-0.01em',
    }}>
      {value}
    </span>
    <span style={{
      fontSize: 'clamp(0.65rem, 1.1vw, 0.72rem)',
      color: 'var(--text-3)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  </motion.div>
);

/* ═════════════════════════════════════════════════════════════
   HERO — MAIN EXPORT
═════════════════════════════════════════════════════════════ */
const Hero = () => {
  const sectionRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [mounted, setMounted] = useState(false);

  /* Track cursor for interactive radial glow */
  useEffect(() => {
    setMounted(true);
    const onMove = (e) => {
      const { innerWidth: w, innerHeight: h } = window;
      setMousePos({ x: e.clientX / w, y: e.clientY / h });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* Dynamic glow position (cursor-following) */
  const glowX = `${mousePos.x * 100}%`;
  const glowY = `${mousePos.y * 100}%`;

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >

      {/* ── LAYER 1: Base gradient field ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>

        {/* Violet aurora — top left */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.55, 0.9, 0.55] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '-25%', left: '-15%',
            width: '70vw', height: '70vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 65%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Cyan aurora — bottom right */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{
            position: 'absolute',
            bottom: '-20%', right: '-10%',
            width: '60vw', height: '60vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 65%)',
            filter: 'blur(100px)',
          }}
        />

        {/* Gold accent — mid right */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          style={{
            position: 'absolute',
            top: '35%', right: '15%',
            width: '35vw', height: '35vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 65%)',
            filter: 'blur(70px)',
          }}
        />

        {/* Cursor-reactive radial glow */}
        {mounted && (
          <div
            style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(600px circle at ${glowX} ${glowY}, rgba(124,58,237,0.07) 0%, transparent 60%)`,
              transition: 'background 0.12s ease',
            }}
          />
        )}

        {/* Mesh grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: '68px 68px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, black 20%, transparent 100%)',
          opacity: 0.7,
        }} />

        {/* Light beam sweeps */}
        <LightBeam delay={2} />
        <LightBeam delay={9} />

        {/* Floating micro-orbs */}
        <FloatingOrb size={7} top="16%"  left="10%"  color="rgba(124,58,237,0.7)" delay={0}   duration={4}   blur={1} />
        <FloatingOrb size={5} top="68%"  left="7%"   color="rgba(6,182,212,0.7)"  delay={1.5} duration={5.5} blur={1} />
        <FloatingOrb size={9} top="22%"  right="9%"  color="rgba(124,58,237,0.6)" delay={0.8} duration={6}   blur={1.5} />
        <FloatingOrb size={6} top="72%"  right="13%" color="rgba(6,182,212,0.65)" delay={2.2} duration={4.5} blur={1} />
        <FloatingOrb size={4} top="48%"  left="22%"  color="rgba(212,168,83,0.8)" delay={1.2} duration={3.5} blur={0.5} />
        <FloatingOrb size={11} bottom="8%" left="48%" color="rgba(124,58,237,0.3)" delay={3}   duration={8}   blur={3} />

        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.08) 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── LAYER 2: Hero Content ── */}
      <div
        className="relative flex flex-col items-center justify-center text-center w-full px-4 sm:px-8"
        style={{ zIndex: 10, paddingTop: '7rem', paddingBottom: '5rem' }}
      >

        {/* — BADGE — */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 18px',
            borderRadius: 100,
            marginBottom: '3rem',
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-2)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 4px 24px rgba(124,58,237,0.10)',
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: '#10b981',
              flexShrink: 0,
              boxShadow: '0 0 8px rgba(16,185,129,0.7)',
            }}
          />
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-2)',
          }}>
            The Creative Oasis
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.05em',
            padding: '3px 8px',
            borderRadius: 100,
            background: 'rgba(124,58,237,0.15)',
            color: 'var(--violet)',
            border: '1px solid rgba(124,58,237,0.25)',
          }}>
            2026
          </span>
        </motion.div>

        {/* — HEADLINE — cinematic per-letter reveal */}
        <div
          style={{
            marginBottom: '2.25rem',
            perspective: '1000px',
            maxWidth: '100%',
          }}
        >
          {/* Line 1 */}
          <div style={{ overflow: 'hidden', lineHeight: 1.05, marginBottom: '0.1em' }}>
            <AnimatedWord
              word="Where"
              delay={0.35}
              style={{
                fontSize: 'clamp(3.2rem, 10vw, 8.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: 'var(--text)',
                fontFamily: "'Inter', sans-serif",
              }}
            />
            {' '}
            <AnimatedWord
              word="Ideas"
              delay={0.55}
              style={{
                fontSize: 'clamp(3.2rem, 10vw, 8.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, var(--violet-2) 0%, var(--cyan) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            />
          </div>

          {/* Line 2 */}
          <div style={{ overflow: 'hidden', lineHeight: 1.05 }}>
            <AnimatedWord
              word="Breathe."
              delay={0.75}
              style={{
                fontSize: 'clamp(3.2rem, 10vw, 8.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: 'var(--text)',
                opacity: 0.88,
              }}
            />
          </div>

          {/* Line 3 — sub-headline size */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              marginTop: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
            }}
          >
            <div style={{ height: 1, width: 48, background: 'linear-gradient(90deg, transparent, var(--border-2))' }} />
            <span style={{
              fontSize: 'clamp(0.85rem, 2vw, 1.05rem)',
              fontWeight: 500,
              color: 'var(--text-2)',
              letterSpacing: '0.01em',
              lineHeight: 1.6,
              maxWidth: 460,
            }}>
              A premium space for thought leaders, writers &amp; builders to share ideas that matter.
            </span>
            <div style={{ height: 1, width: 48, background: 'linear-gradient(90deg, var(--border-2), transparent)' }} />
          </motion.div>
        </div>

        {/* — CTA BUTTONS — */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '3.5rem',
          }}
        >
          {/* Primary — Start Writing */}
          <MagneticButton>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px 30px',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, var(--violet) 0%, #5b21b6 100%)',
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                  boxShadow: '0 8px 32px rgba(124,58,237,0.38), 0 2px 8px rgba(124,58,237,0.2)',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 12px 44px rgba(124,58,237,0.55), 0 2px 12px rgba(124,58,237,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.38), 0 2px 8px rgba(124,58,237,0.2)';
                }}
              >
                {/* Shimmer sweep */}
                <motion.div
                  animate={{ x: ['-120%', '220%'] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
                    transform: 'skewX(-20deg)',
                    pointerEvents: 'none',
                  }}
                />
                <FiFeather size={16} />
                Start Writing Free
              </motion.button>
            </Link>
          </MagneticButton>

          {/* Secondary — Explore */}
          <MagneticButton>
            <Link to="/#explore" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px 28px',
                  borderRadius: 16,
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-2)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  color: 'var(--text)',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.45)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.10)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <FiCompass size={16} style={{ color: 'var(--violet)' }} />
                Explore Articles
                <FiArrowRight size={14} style={{ color: 'var(--text-3)', marginLeft: -2 }} />
              </motion.button>
            </Link>
          </MagneticButton>
        </motion.div>

        {/* — SOCIAL PROOF STRIP — */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          {/* Avatar stack + writer count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {['#7c3aed', '#06b6d4', '#d4a853', '#6d28d9'].map((color, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 1.65 + i * 0.07, duration: 0.4 }}
                  style={{
                    width: 30, height: 30,
                    borderRadius: '50%',
                    background: color,
                    border: '2.5px solid var(--bg)',
                    marginLeft: i === 0 ? 0 : -8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff',
                    fontSize: 11, fontWeight: 700,
                    zIndex: 4 - i,
                    position: 'relative',
                  }}
                >
                  {['A', 'B', 'C', 'D'][i]}
                </motion.div>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', margin: 0 }}>500+ Writers</p>
              <div style={{ display: 'flex', gap: 1, marginTop: 1 }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: '#d4a853', fontSize: 9 }}>★</span>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 32, background: 'var(--border-2)' }} />

          <StatPill value="1,000+" label="Stories" delay={1.75} />

          {/* Divider */}
          <div style={{ width: 1, height: 32, background: 'var(--border-2)' }} />

          <StatPill value="Zero" label="Paywalls" delay={1.85} />
        </motion.div>

      </div>

      {/* ── LAYER 3: Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.1, duration: 0.7 }}
        style={{
          position: 'absolute',
          bottom: 36, left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <motion.p
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 2.8, repeat: Infinity }}
          style={{
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-3)',
            fontWeight: 500,
          }}
        >
          scroll
        </motion.p>
        <div
          style={{
            width: 20, height: 32,
            borderRadius: 100,
            border: '1.5px solid var(--border-2)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '5px 0',
          }}
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 2, height: 7,
              borderRadius: 100,
              background: 'linear-gradient(to bottom, var(--violet), transparent)',
            }}
          />
        </div>
      </motion.div>

      {/* ── Bottom page fade ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 120,
          background: 'linear-gradient(to top, var(--bg), transparent)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
    </section>
  );
};

export default Hero;