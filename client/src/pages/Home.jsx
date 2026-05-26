import {
  useState, useEffect, useRef, useCallback
} from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getAllBlogs } from '../api/blogApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import BlogCard from '../components/blog/BlogCard.jsx';
import {
  FiSearch, FiArrowRight,
  FiX, FiStar, FiEdit3, FiTrendingUp, FiBookOpen,
  FiPenTool, FiChevronDown
} from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = [
  'All','Technology','Programming','Design',
  'Business','Lifestyle','Health','Travel','Food','Other'
];



/* ─────────────────────────────────────────────────────────
   BLOG SKELETON
───────────────────────────────────────────────────────── */
const BlogSkeleton = ({ darkMode }) => (
  <div style={{
    borderRadius: 20, overflow: 'hidden',
    background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)',
    border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
  }}>
    <div style={{ height: 220, background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(90deg, transparent 0%, ${darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)'} 50%, transparent 100%)`,
        animation: 'skeletonShimmer 1.6s ease-in-out infinite',
      }}/>
    </div>
    <div style={{ padding: '20px 20px 24px' }}>
      {[['60%','12px'],['85%','16px'],['45%','11px']].map(([w,h],i) => (
        <div key={i} style={{
          width: w, height: h, borderRadius: 8,
          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          marginBottom: i < 2 ? 12 : 0,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(90deg, transparent 0%, ${darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)'} 50%, transparent 100%)`,
            animation: `skeletonShimmer 1.6s ease-in-out ${i * 0.2}s infinite`,
          }}/>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────
   COUNTER
───────────────────────────────────────────────────────── */
const Counter = ({ target, label, suffix = '+', icon: Icon }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el, { innerText: 0 }, {
      innerText: target, duration: 2.2, ease: 'power3.out',
      snap: { innerText: 1 },
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  }, [target]);
  return (
    <div style={{ textAlign: 'center' }}>
      {Icon && <Icon size={20} style={{ margin: '0 auto 10px', opacity: 0.5, color: 'var(--violet)' }}/>}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2 }}>
        <span ref={ref} style={{
          fontSize: 'clamp(2rem,4vw,3rem)',
          fontWeight: 900,
          fontFamily: "'Syne','Space Grotesk',sans-serif",
          color: 'var(--text)', lineHeight: 1,
        }}>0</span>
        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--violet)', lineHeight: 1 }}>{suffix}</span>
      </div>
      <p style={{ fontSize: 12, marginTop: 6, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-3)', fontWeight: 600 }}>{label}</p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   MAGNETIC BUTTON HOOK
───────────────────────────────────────────────────────── */
const useMagnetic = (strength = 0.3) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove  = (e) => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2)  * strength;
      const dy = (e.clientY - r.top  - r.height / 2) * strength;
      el.style.transform = `translate(${dx}px,${dy}px)`;
    };
    const onLeave = () => {
      el.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
      el.style.transform  = '';
    };
    const onEnter = () => { el.style.transition = 'transform 0.12s ease'; };
    el.addEventListener('mousemove',  onMove);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mouseenter', onEnter);
    return () => {
      el.removeEventListener('mousemove',  onMove);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mouseenter', onEnter);
    };
  }, [strength]);
  return ref;
};

/* ─────────────────────────────────────────────────────────
   TYPEWRITER HOOK
───────────────────────────────────────────────────────── */
const useTypewriter = (words, typingSpeed = 90, deletingSpeed = 55, pauseMs = 2200) => {
  const [display, setDisplay] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex];
    let timeout;
    if (!deleting) {
      if (charIndex < word.length) {
        timeout = setTimeout(() => setCharIndex(c => c + 1), typingSpeed);
      } else {
        timeout = setTimeout(() => setDeleting(true), pauseMs);
      }
    } else {
      if (charIndex > 0) {
        timeout = setTimeout(() => setCharIndex(c => c - 1), deletingSpeed);
      } else {
        setDeleting(false);
        setWordIndex(i => (i + 1) % words.length);
      }
    }
    setDisplay(word.slice(0, charIndex));
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex, words, typingSpeed, deletingSpeed, pauseMs]);

  return display;
};

/* ─────────────────────────────────────────────────────────
   MARQUEE TICKER
───────────────────────────────────────────────────────── */
const MarqueeTicker = ({ darkMode }) => {
  const words = ['Technology','Design','Programming','Business','Lifestyle','Health','Travel','Food','Culture','Science','Art','Philosophy'];
  const doubled = [...words, ...words];
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', padding: '10px 0',
      borderTop: darkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.06)',
      borderBottom: darkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', gap: 0, animation: 'marqueeScroll 28s linear infinite', whiteSpace: 'nowrap', willChange: 'transform' }}>
        {doubled.map((w, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 16,
            padding: '5px 24px',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: darkMode ? 'rgba(167,139,250,0.30)' : 'rgba(109,40,217,0.36)',
            fontFamily: "'SF Mono','Fira Code',monospace",
          }}>
            {w}
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: darkMode ? 'rgba(139,92,246,0.30)' : 'rgba(109,40,217,0.28)', display: 'inline-block' }}/>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   FLOATING PARTICLES
───────────────────────────────────────────────────────── */
const Particles = ({ darkMode }) => {
  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${8 + Math.random() * 58}%`,
      size: 2 + Math.random() * 3,
      duration: `${5 + Math.random() * 6}s`,
      delay: `${Math.random() * 5}s`,
      color: ['rgba(124,58,237,0.55)', 'rgba(6,182,212,0.45)', 'rgba(236,72,153,0.40)', 'rgba(139,92,246,0.50)'][Math.floor(Math.random() * 4)],
    }))
  ).current;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4, overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          bottom: `${Math.random() * 20}%`,
          left: p.left,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: p.color,
          animation: `particleFloat ${p.duration} ease-in-out ${p.delay} infinite`,
        }}/>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   TRENDING STORY CARD (right panel)
───────────────────────────────────────────────────────── */
const TrendingCard = ({ story, darkMode, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ x: -3, transition: { duration: 0.2 } }}
    style={{
      background: darkMode ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.88)',
      border: darkMode ? '0.5px solid rgba(255,255,255,0.07)' : '0.5px solid rgba(0,0,0,0.07)',
      borderRadius: 12,
      padding: '13px 15px',
      cursor: 'pointer',
      backdropFilter: 'blur(12px)',
    }}
  >
    <div style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
      color: '#7c3aed', marginBottom: 6,
      fontFamily: "'SF Mono','Fira Code',monospace",
    }}>{story.category}</div>
    <div style={{
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 12.5, fontWeight: 700, lineHeight: 1.38,
      color: darkMode ? 'rgba(237,233,254,0.92)' : 'rgba(9,9,11,0.90)',
      marginBottom: 9,
    }}>{story.title}</div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 10, color: darkMode ? 'rgba(237,233,254,0.38)' : 'rgba(9,9,11,0.38)' }}>
        by {story.author}
      </span>
      <span style={{
        fontSize: 9, fontWeight: 700, color: '#7c3aed',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        fontFamily: "'SF Mono',monospace",
      }}>Read →</span>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────
   HERO SECTION — New literary editorial design
───────────────────────────────────────────────────────── */
const HeroSection = ({ darkMode, user, pagination, primaryMag, secondaryMag }) => {
  const typewriterWords = [
    'worth reading',
    'worth sharing',
    'that moves you',
    'worth remembering',
    'that stays with you',
  ];
  const typedText = useTypewriter(typewriterWords);

  const trendingStories = [
    { category: 'Technology', title: 'The quiet revolution in how we think about AI', author: 'Sarah Chen' },
    { category: 'Design', title: 'Why less is still the hardest thing to design', author: 'Marco Valli' },
    { category: 'Lifestyle', title: 'Six months of writing every single morning', author: 'Aisha Kone' },
    { category: 'Culture', title: 'What Urdu poetry teaches us about longing', author: 'Zara Ahmed' },
  ];

  const { scrollY } = useScroll();
  const heroOpa = useTransform(scrollY, [0, 450], [1, 0]);
  const heroY   = useTransform(scrollY, [0, 450], [0, 50]);

  const fadeUp = (delay = 0) => ({
    hidden:  { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { delay, duration: 0.85, ease: [0.16, 1, 0.3, 1] } },
  });

  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
    }}>

      {/* ── Background ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: darkMode
          ? 'linear-gradient(160deg,#08070f 0%,#0d0b1e 50%,#06060f 100%)'
          : 'linear-gradient(160deg,#fdfcff 0%,#f7f3ff 50%,#f0f4ff 100%)',
      }}/>

      {/* Notebook page lines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: `repeating-linear-gradient(
          to bottom,
          transparent 0px, transparent 47px,
          ${darkMode ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.04)'} 47px,
          ${darkMode ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.04)'} 48px
        )`,
      }}/>

      {/* Left red margin line */}
      <div style={{
        position: 'absolute', left: 'clamp(44px,5vw,72px)', top: 0, bottom: 0,
        width: 1,
        background: darkMode ? 'rgba(239,68,68,0.12)' : 'rgba(220,38,38,0.18)',
        pointerEvents: 'none', zIndex: 2,
      }}/>

      {/* Ink blobs */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-5%', zIndex: 3,
        width: 520, height: 420, borderRadius: '50%',
        background: darkMode
          ? 'radial-gradient(ellipse,rgba(109,40,217,0.13) 0%,transparent 68%)'
          : 'radial-gradient(ellipse,rgba(167,139,250,0.15) 0%,transparent 68%)',
        filter: 'blur(70px)', pointerEvents: 'none',
        animation: 'inkBlobIn 2.5s ease 0.2s both',
      }}/>
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%', zIndex: 3,
        width: 380, height: 320, borderRadius: '50%',
        background: darkMode
          ? 'radial-gradient(ellipse,rgba(6,182,212,0.06) 0%,transparent 68%)'
          : 'radial-gradient(ellipse,rgba(6,182,212,0.07) 0%,transparent 68%)',
        filter: 'blur(55px)', pointerEvents: 'none',
        animation: 'inkBlobIn 2.5s ease 0.5s both',
      }}/>

      {/* Particles */}
      <Particles darkMode={darkMode}/>

      {/* Bottom blend */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 180,
        background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)',
        zIndex: 8, pointerEvents: 'none',
      }}/>

      {/* ── Main layout ── */}
      <motion.div
        initial="hidden"
        animate="visible"
        style={{
          position: 'relative', zIndex: 10,
          flex: 1, display: 'flex', alignItems: 'center',
          paddingTop: 'clamp(80px,11vh,130px)',
          paddingBottom: 'clamp(60px,8vh,110px)',
          paddingLeft: 'clamp(44px,5vw,72px)',
          paddingRight: 'clamp(22px,4vw,56px)',
          opacity: heroOpa,
          y: heroY,
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center',
          width: '100%', maxWidth: 1360, margin: '0 auto',
          gap: 'clamp(32px,4vw,72px)',
        }}>

          {/* ══ TEXT COLUMN ══ */}
          <div className="hero-text-col" style={{ flex: '1 1 auto', maxWidth: 600 }}>

            {/* Issue badge */}
            <motion.div variants={fadeUp(0.2)} style={{ marginBottom: 28 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 6,
                background: darkMode ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.07)',
                border: darkMode ? '0.5px solid rgba(167,139,250,0.22)' : '0.5px solid rgba(124,58,237,0.20)',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#7c3aed', display: 'inline-block',
                  animation: 'breathePulse 2.4s ease-in-out infinite',
                }}/>
                <span style={{
                  fontFamily: "'SF Mono','Fira Code',monospace",
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: darkMode ? 'rgba(196,181,253,0.65)' : 'rgba(109,40,217,0.65)',
                }}>Now publishing · Issue 26</span>
              </div>
            </motion.div>

            {/* Headline */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ overflow: 'hidden' }}>
                <motion.span
                  variants={fadeUp(0.38)}
                  style={{
                    display: 'block',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(2.6rem,5.2vw,4.6rem)',
                    fontWeight: 900, lineHeight: 1.07,
                    color: darkMode ? 'rgba(237,233,254,0.96)' : 'rgba(9,9,11,0.94)',
                    letterSpacing: '-0.01em',
                  }}
                >Where every voice</motion.span>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <motion.span
                  variants={fadeUp(0.52)}
                  style={{
                    display: 'block',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(2.6rem,5.2vw,4.6rem)',
                    fontWeight: 900, lineHeight: 1.07,
                    color: darkMode ? 'rgba(237,233,254,0.96)' : 'rgba(9,9,11,0.94)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  becomes a{' '}
                  <em style={{
                    fontStyle: 'italic',
                    background: 'linear-gradient(120deg,#c4b5fd 0%,#7c3aed 55%,#38bdf8 100%)',
                    WebkitBackgroundClip: 'text', backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>story</em>
                </motion.span>
              </div>

              {/* Typewriter line */}
              <motion.div variants={fadeUp(0.68)} style={{
                display: 'flex', alignItems: 'center',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(1.8rem,3.5vw,3.1rem)',
                fontWeight: 700, fontStyle: 'italic',
                color: '#7c3aed',
                lineHeight: 1.12, minHeight: '1.2em',
                marginTop: 4,
              }}>
                <span>{typedText}</span>
                <span style={{
                  display: 'inline-block', width: 3, height: '0.82em',
                  background: '#7c3aed', marginLeft: 3,
                  verticalAlign: '-0.05em', borderRadius: 1,
                  animation: 'blinkCursor 1.1s step-end infinite',
                }}/>
              </motion.div>
            </div>

            {/* Tagline */}
            <motion.p variants={fadeUp(0.84)} style={{
              fontSize: 'clamp(13.5px,1vw,15.5px)',
              color: darkMode ? 'rgba(237,233,254,0.44)' : 'rgba(9,9,11,0.46)',
              lineHeight: 1.82, maxWidth: 420,
              marginBottom: 32, letterSpacing: '0.003em',
            }}>
              A literary space for writers who believe words matter.
              Explore ideas across technology, culture, design, and the human experience.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp(1.0)}
              className="cta-row"
              style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}
            >
              <div ref={primaryMag} style={{ display: 'inline-flex' }}>
                <Link
                  to={user ? '/create-blog' : '/register'}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '13px 26px', borderRadius: 8,
                    background: '#7c3aed', color: '#fff',
                    fontFamily: "'Syne','Space Grotesk',sans-serif",
                    fontSize: 13.5, fontWeight: 800,
                    letterSpacing: '0.01em', textDecoration: 'none',
                    border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 22px rgba(124,58,237,0.38), inset 0 1px 0 rgba(255,255,255,0.12)',
                    transition: 'all 0.22s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#6d28d9';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.52), inset 0 1px 0 rgba(255,255,255,0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#7c3aed';
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '0 4px 22px rgba(124,58,237,0.38), inset 0 1px 0 rgba(255,255,255,0.12)';
                  }}
                >
                  <FiPenTool size={14}/>
                  {user ? 'Write a Story' : 'Start Writing — Free'}
                </Link>
              </div>

              <div ref={secondaryMag} style={{ display: 'inline-flex' }}>
                <button
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 22px', borderRadius: 8,
                    background: 'transparent',
                    border: darkMode ? '0.5px solid rgba(255,255,255,0.12)' : '0.5px solid rgba(9,9,11,0.14)',
                    color: darkMode ? 'rgba(237,233,254,0.60)' : 'rgba(9,9,11,0.56)',
                    fontFamily: "'Syne','Space Grotesk',sans-serif",
                    fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', backdropFilter: 'blur(16px)',
                    transition: 'all 0.22s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(124,58,237,0.38)';
                    e.currentTarget.style.color = darkMode ? 'rgba(237,233,254,0.90)' : '#7c3aed';
                    e.currentTarget.style.background = darkMode ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.05)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(9,9,11,0.14)';
                    e.currentTarget.style.color = darkMode ? 'rgba(237,233,254,0.60)' : 'rgba(9,9,11,0.56)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = '';
                  }}
                  onClick={() => document.getElementById('stories-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Browse Stories <FiChevronDown size={13}/>
                </button>
              </div>
            </motion.div>

            {/* Social proof strip */}
            <motion.div variants={fadeUp(1.16)} style={{
              display: 'flex', alignItems: 'center',
              gap: 0, flexWrap: 'wrap',
              paddingTop: 20,
              borderTop: darkMode ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(9,9,11,0.08)',
            }}>
              {[
                { num: `${pagination.totalBlogs || '1,000'}+`, label: 'Stories' },
                { num: '500+', label: 'Writers' },
                { num: '10', label: 'Categories' },
                { num: 'Free', label: 'Always' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  {i > 0 && <div style={{ width: 0.5, height: 28, background: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(9,9,11,0.08)', margin: '0 20px' }}/>}
                  <div>
                    <div style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: 'clamp(1.1rem,2vw,1.55rem)',
                      fontWeight: 700, lineHeight: 1,
                      color: darkMode ? 'rgba(237,233,254,0.92)' : 'rgba(9,9,11,0.90)',
                    }}>{s.num}</div>
                    <div style={{
                      fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                      color: darkMode ? 'rgba(237,233,254,0.32)' : 'rgba(9,9,11,0.38)',
                      fontWeight: 600, marginTop: 3,
                      fontFamily: "'SF Mono',monospace",
                    }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ══ RIGHT PANEL — Trending Stories ══ */}
          <motion.div
            className="hero-panel-col"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{
              flex: '0 0 auto',
              width: 'clamp(220px,28vw,280px)',
              display: 'flex', flexDirection: 'column', gap: 10,
              paddingLeft: 'clamp(20px,2vw,32px)',
              borderLeft: darkMode ? '0.5px solid rgba(255,255,255,0.07)' : '0.5px solid rgba(9,9,11,0.09)',
            }}
          >
            <div style={{
              fontFamily: "'SF Mono','Fira Code',monospace",
              fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: darkMode ? 'rgba(237,233,254,0.28)' : 'rgba(9,9,11,0.32)',
              paddingBottom: 10,
              borderBottom: darkMode ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(9,9,11,0.07)',
              marginBottom: 2,
            }}>Trending now</div>

            {trendingStories.map((story, i) => (
              <TrendingCard key={i} story={story} darkMode={darkMode} delay={0.9 + i * 0.12}/>
            ))}

            {/* Pen decoration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.0, duration: 0.8 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginTop: 6, paddingTop: 12,
                borderTop: darkMode ? '0.5px solid rgba(255,255,255,0.05)' : '0.5px solid rgba(9,9,11,0.06)',
              }}
            >
              <div style={{ width: 20, height: 0.5, background: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(9,9,11,0.15)' }}/>
              <span style={{
                fontFamily: "'SF Mono',monospace",
                fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: darkMode ? 'rgba(237,233,254,0.24)' : 'rgba(9,9,11,0.28)',
              }}>Est. 2026</span>
            </motion.div>
          </motion.div>

        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6, duration: 0.8 }}
        style={{
          position: 'absolute', bottom: 28, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          zIndex: 20,
        }}
      >
        <motion.span
          animate={{ opacity: [0.12, 0.40, 0.12] }}
          transition={{ duration: 3.6, repeat: Infinity }}
          style={{
            fontFamily: "'SF Mono',monospace", fontSize: 7,
            letterSpacing: '0.30em', textTransform: 'uppercase',
            color: darkMode ? 'rgba(237,233,254,0.22)' : 'rgba(9,9,11,0.28)',
          }}
        >scroll</motion.span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 20, height: 28, borderRadius: 12,
            border: darkMode ? '1px solid rgba(237,233,254,0.16)' : '1px solid rgba(9,9,11,0.18)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: 5,
          }}
        >
          <div style={{
            width: 2, height: 6, borderRadius: 2,
            background: darkMode ? 'rgba(167,139,250,0.55)' : 'rgba(124,58,237,0.55)',
          }}/>
        </motion.div>
      </motion.div>

    </section>
  );
};

/* ─────────────────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────────────────── */
const Home = () => {
  const { user }     = useAuth();
  const { darkMode } = useTheme();

  const [blogs, setBlogs]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [pagination, setPagination]     = useState({ totalPages: 1, totalBlogs: 0, hasMore: false });
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput]   = useState('');

  const statsRef    = useRef(null);
  const featuredRef = useRef(null);
  const gridRef     = useRef(null);
  const ctaRef      = useRef(null);

  const primaryMag   = useMagnetic(0.20);
  const secondaryMag = useMagnetic(0.15);

  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch   = searchParams.get('search')   || '';
  const currentPage     = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const currentSort     = searchParams.get('sortBy')   || 'latest';

  useEffect(() => { setSearchInput(currentSearch); }, [currentSearch]);

  const updateFilter = useCallback((key, value) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (value !== undefined && value !== null && value !== '' && value !== 'All')
        p.set(key, String(value));
      else p.delete(key);
      if (key !== 'page') p.delete('page');
      return p;
    });
    if (key === 'page') {
      setTimeout(() => {
        document.getElementById('stories-section')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [setSearchParams]);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 9, sortBy: currentSort };
      if (currentCategory !== 'All') params.category = currentCategory;
      if (currentSearch) params.search = currentSearch;
      const { data } = await getAllBlogs(params);
      setBlogs(data.blogs || []);
      setPagination({
        totalPages: data.pagination?.totalPages || 1,
        totalBlogs: data.pagination?.totalBlogs || 0,
        hasMore:    data.pagination?.hasMore    || false,
      });
    } catch(e) { console.error(e); setBlogs([]); }
    finally { setLoading(false); }
  }, [currentCategory, currentSearch, currentPage, currentSort]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      if (statsRef.current)
        gsap.fromTo('.stat-item',
          { opacity: 0, y: 32, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, stagger: .10, duration: .8, ease: 'power3.out',
            scrollTrigger: { trigger: statsRef.current, start: 'top 88%' } });
      if (featuredRef.current)
        gsap.fromTo(featuredRef.current,
          { opacity: 0, y: 48 },
          { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out',
            scrollTrigger: { trigger: featuredRef.current, start: 'top 88%' } });
      if (gridRef.current)
        gsap.fromTo('.blog-card-item',
          { opacity: 0, y: 28, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, stagger: .065, duration: .55, ease: 'power3.out', delay: .05 });
      if (ctaRef.current)
        gsap.fromTo('.cta-item',
          { opacity: 0, y: 36 },
          { opacity: 1, y: 0, stagger: .14, duration: .9, ease: 'power3.out',
            scrollTrigger: { trigger: ctaRef.current, start: 'top 82%' } });
    });
    return () => ctx.revert();
  }, [loading, blogs]);

  const handleSearch = (e) => { e?.preventDefault(); updateFilter('search', searchInput); };
  const featured = blogs[0];

  const textPrimary = darkMode ? '#ede9fe' : '#09090b';
  const glassBg     = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.78)';
  const glassBdr    = darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)';

  return (
    <>


      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Syne:wght@400;500;600;700;800;900&display=swap');

        @keyframes skeletonShimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes breathePulse {
          0%,100%{ opacity:0.55; transform:scale(1); }
          50%    { opacity:1.00; transform:scale(1.3); }
        }
        @keyframes blinkCursor {
          0%,100%{ opacity:1; }
          50%    { opacity:0; }
        }
        @keyframes particleFloat {
          0%   { opacity:0; transform:translateY(0) scale(0); }
          8%   { opacity:0.7; transform:scale(1); }
          90%  { opacity:0.35; }
          100% { opacity:0; transform:translateY(-340px) scale(1.2); }
        }
        @keyframes inkBlobIn {
          0%   { opacity:0; transform:scale(0.7); }
          60%  { opacity:1; }
          100% { opacity:1; transform:scale(1); }
        }
        @keyframes gradientDrift {
          0%,100%{ background-position:0% 50%; }
          50%    { background-position:100% 50%; }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .font-syne { font-family: 'Syne', sans-serif; }
        .font-playfair { font-family: 'Playfair Display', Georgia, serif; }

        .text-gradient-hero {
          background: linear-gradient(118deg, #c4b5fd 0%, #a78bfa 28%, #7c3aed 55%, #38bdf8 80%, #22d3ee 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientDrift 5s ease-in-out infinite;
        }

        .eyebrow {
          font-family: 'SF Mono','Fira Code',monospace;
          font-size: clamp(8px, 0.62vw, 10px);
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
        }

        .btn-hero-primary {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; gap: 9px;
          padding: 14px 30px; border-radius: 8px;
          font-family: 'Syne', sans-serif;
          font-size: 13.5px; font-weight: 800; color: #fff; letter-spacing: 0.01em;
          background: #7c3aed;
          border: none; cursor: pointer; white-space: nowrap;
          box-shadow: 0 4px 22px rgba(124,58,237,0.40), inset 0 1px 0 rgba(255,255,255,0.12);
          transition: all 0.22s ease;
          text-decoration: none;
        }
        .btn-hero-primary:hover {
          background: #6d28d9;
          box-shadow: 0 8px 36px rgba(109,40,217,0.55), inset 0 1px 0 rgba(255,255,255,0.15);
          transform: translateY(-2px);
        }
        .btn-hero-primary:active { transform: translateY(0); }

        .cat-chip {
          padding: 7px 14px; border-radius: 10px;
          font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; border: none;
          font-family: 'Syne', sans-serif;
          transition: all 0.20s cubic-bezier(0.16,1,0.3,1);
        }
        .cat-chip:hover { transform: translateY(-1px); }

        .featured-card:hover .featured-img { transform: scale(1.04); }
        .featured-img { transition: transform 0.8s cubic-bezier(0.16,1,0.3,1) !important; }

        .pg-btn {
          display: inline-flex; align-items: center; justify-content: center;
          border: none; cursor: pointer;
          font-family: 'Syne', sans-serif; font-weight: 700;
          transition: all 0.2s ease;
          border-radius: 12px;
        }
        .pg-btn:hover { transform: translateY(-1px); }
        .pg-btn:disabled { opacity: 0.28; cursor: not-allowed; transform: none; }

        @media (max-width: 860px) {
          .hero-panel-col { display: none !important; }
          .hero-text-col { max-width: 100% !important; }
        }
        @media (max-width: 500px) {
          .cta-row { flex-direction: column !important; align-items: stretch !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

        {/* ═══════════════════════════════════════════════════════
            HERO SECTION — New literary editorial design
        ═══════════════════════════════════════════════════════ */}
        <HeroSection
          darkMode={darkMode}
          user={user}
          pagination={pagination}
          primaryMag={primaryMag}
          secondaryMag={secondaryMag}
        />

        {/* ═══════════════════════════════════════════════════════
            MARQUEE TICKER
        ═══════════════════════════════════════════════════════ */}
        <MarqueeTicker darkMode={darkMode}/>

        {/* ═══════════════════════════════════════════════════════
            STATS SECTION
        ═══════════════════════════════════════════════════════ */}
        <section
          ref={statsRef}
          style={{
            padding: 'clamp(48px,7vw,88px) clamp(20px,6vw,80px)',
            background: darkMode ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)',
            borderBottom: darkMode ? '1px solid rgba(255,255,255,0.045)' : '1px solid rgba(0,0,0,0.055)',
          }}
        >
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 'clamp(24px,4vw,48px)' }}>
              {[
                { target: pagination.totalBlogs || blogs.length || 10, label: 'Stories Published', suffix: '+', icon: FiBookOpen },
                { target: 500,  label: 'Active Writers',  suffix: '+', icon: FiEdit3 },
                { target: 2400, label: 'Total Likes',     suffix: '+', icon: FiStar },
                { target: 890,  label: 'Comments',        suffix: '+', icon: FiTrendingUp },
              ].map((s, i) => (
                <div key={i} className="stat-item" style={{ opacity: 0 }}>
                  <div
                    style={{
                      padding: '28px 20px',
                      background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.80)',
                      border: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 20,
                      backdropFilter: 'blur(24px)',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = darkMode
                        ? '0 12px 40px rgba(0,0,0,0.28)' : '0 12px 40px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <Counter {...s}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FEATURED STORY
        ═══════════════════════════════════════════════════════ */}
        {!loading && featured && (
          <section style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,6vw,80px)' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                <div style={{ width: 32, height: 1.5, background: 'var(--violet)', borderRadius: 2 }}/>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiStar size={12} style={{ color: 'var(--violet)' }}/>
                  <span className="eyebrow" style={{ color: 'var(--violet-2)' }}>Featured Story</span>
                </div>
              </div>

              <div ref={featuredRef} style={{ opacity: 0 }}>
                <Link to={`/blog/${featured.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <motion.div
                    className="featured-card"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: 'relative', overflow: 'hidden', borderRadius: 28,
                      border: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                      boxShadow: darkMode
                        ? '0 2px 60px rgba(0,0,0,0.38)'
                        : '0 2px 40px rgba(0,0,0,0.07)',
                    }}
                  >
                    <div style={{ position: 'relative', height: 'clamp(340px,52vh,560px)', overflow: 'hidden' }}>
                      {featured.coverImage
                        ? <img src={featured.coverImage} alt={featured.title}
                            className="featured-img"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        : <div style={{
                            width: '100%', height: '100%',
                            background: darkMode
                              ? 'linear-gradient(135deg,#1a1040,#0a0818)'
                              : 'linear-gradient(135deg,#ede9fe,#dbeafe)',
                          }}/>
                      }
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.28) 55%, transparent 100%)',
                      }}/>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(28px,4vw,56px)' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '5px 14px', borderRadius: 100,
                          fontSize: 10, fontWeight: 800, color: '#fff',
                          letterSpacing: '0.10em', textTransform: 'uppercase',
                          fontFamily: "'Syne',sans-serif",
                          background: 'rgba(124,58,237,0.75)',
                          backdropFilter: 'blur(12px)',
                          marginBottom: 14,
                          border: '1px solid rgba(255,255,255,0.10)',
                        }}>{featured.category}</span>

                        <h2 style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: 'clamp(1.6rem,3.5vw,3.2rem)',
                          fontWeight: 900, color: '#fff',
                          lineHeight: 1.10, letterSpacing: '-0.01em',
                          marginBottom: 14, maxWidth: 700,
                        }}>{featured.title}</h2>

                        <p style={{
                          color: 'rgba(255,255,255,0.62)',
                          fontSize: 'clamp(13px,1vw,15px)',
                          lineHeight: 1.72, maxWidth: 520,
                          marginBottom: 22,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>{featured.excerpt}</p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'var(--violet)',
                              fontWeight: 800, color: '#fff', fontSize: 13,
                              overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)',
                              flexShrink: 0,
                            }}>
                              {featured.author?.avatar
                                ? <img src={featured.author.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                                : featured.author?.username?.[0]?.toUpperCase()
                              }
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 500 }}>
                              {featured.author?.username}
                            </span>
                          </div>

                          <motion.span
                            whileHover={{ x: 4 }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              fontSize: 13, fontWeight: 700, color: 'var(--violet-2)',
                              fontFamily: "'Syne',sans-serif",
                            }}
                          >
                            Read Story <FiArrowRight size={14}/>
                          </motion.span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            STORIES GRID
        ═══════════════════════════════════════════════════════ */}
        <section id="stories-section" style={{ padding: 'clamp(40px,6vw,80px) clamp(20px,6vw,80px)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 1.5, background: 'var(--violet)', borderRadius: 2 }}/>
                  <span className="eyebrow" style={{ color: 'var(--violet-2)' }}>All Stories</span>
                </div>
                <h2 className="font-syne" style={{
                  fontSize: 'clamp(2rem,3.5vw,3.2rem)',
                  fontWeight: 900, letterSpacing: '-0.015em',
                  color: 'var(--text)', lineHeight: 1.05,
                }}>
                  EXPLORE THE{' '}
                  <span className="text-gradient-hero">ARCHIVE</span>
                </h2>
              </div>

              <select
                value={currentSort}
                onChange={e => updateFilter('sortBy', e.target.value)}
                style={{
                  padding: '10px 16px', borderRadius: 12, fontSize: 13,
                  fontFamily: "'Syne',sans-serif", fontWeight: 600,
                  background: 'var(--bg-2)', border: '1px solid var(--border)',
                  color: 'var(--text)', outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="latest">🕐 Latest</option>
                <option value="popular">🔥 Most Viewed</option>
                <option value="liked">❤️ Most Liked</option>
              </select>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
              <div style={{ position: 'relative', maxWidth: 520 }}>
                <FiSearch style={{
                  position: 'absolute', left: 16, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-3)',
                  pointerEvents: 'none',
                }} size={17}/>
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search stories..."
                  style={{
                    width: '100%', paddingLeft: 48, paddingRight: 48,
                    paddingTop: 14, paddingBottom: 14,
                    borderRadius: 16, fontSize: 13.5,
                    fontFamily: "'Syne',sans-serif",
                    background: 'var(--bg-2)', border: '1.5px solid var(--border)',
                    color: 'var(--text)', outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--violet)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.10)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => { setSearchInput(''); updateFilter('search', ''); }}
                    style={{
                      position: 'absolute', right: 14, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-3)', display: 'flex', padding: 4,
                    }}
                  ><FiX size={16}/></button>
                )}
              </div>
            </form>

            {/* Categories */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 36 }}>
              {CATEGORIES.map(cat => (
                <motion.button
                  key={cat}
                  className="cat-chip"
                  onClick={() => updateFilter('category', cat)}
                  whileTap={{ scale: 0.94 }}
                  style={currentCategory === cat ? {
                    background: 'var(--violet)',
                    color: '#fff',
                    boxShadow: '0 4px 18px rgba(124,58,237,0.38)',
                    border: '1.5px solid transparent',
                  } : {
                    background: 'var(--bg-2)',
                    color: 'var(--text-2)',
                    border: '1.5px solid var(--border)',
                  }}
                >{cat}</motion.button>
              ))}
            </div>

            {/* Search result label */}
            <AnimatePresence>
              {currentSearch && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Results for:</span>
                  <span style={{
                    padding: '4px 12px', borderRadius: 10, fontSize: 13,
                    fontWeight: 600, fontFamily: "'Syne',sans-serif",
                    background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text)',
                  }}>"{currentSearch}"</span>
                  <button
                    onClick={() => { setSearchInput(''); updateFilter('search', ''); }}
                    style={{
                      fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase',
                      color: 'var(--text-3)', background: 'none', border: 'none',
                      cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontWeight: 700,
                      opacity: 0.7,
                    }}
                  >✕ Clear</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid */}
            <div ref={gridRef}>
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 22 }}>
                  {[...Array(6)].map((_, i) => <BlogSkeleton key={i} darkMode={darkMode}/>)}
                </div>
              ) : blogs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', paddingTop: 100, paddingBottom: 100 }}
                >
                  <p style={{ fontSize: 56, marginBottom: 20 }}>🔍</p>
                  <h3 className="font-syne" style={{ fontSize: 26, fontWeight: 900, marginBottom: 8, color: 'var(--text)' }}>
                    No stories found
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
                    {currentSearch ? 'Try different keywords' : 'Be the first to write!'}
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentCategory}-${currentPage}-${currentSort}`}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.32 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 22 }}
                  >
                    {blogs.map((blog, i) => (
                      <div key={blog._id} className="blog-card-item" style={{ opacity: 0 }}>
                        <BlogCard blog={blog} index={i}/>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 56, flexWrap: 'wrap' }}
              >
                <button
                  className="pg-btn"
                  onClick={() => { if (currentPage > 1) updateFilter('page', currentPage - 1); }}
                  disabled={currentPage <= 1}
                  style={{
                    padding: '9px 20px', fontSize: 13,
                    background: 'var(--bg-2)', border: '1.5px solid var(--border)',
                    color: 'var(--text)',
                  }}
                >← Prev</button>

                {(() => {
                  const pages = []; const total = pagination.totalPages;
                  for (let i = 1; i <= total; i++) {
                    if (i === 1 || i === total || (i >= currentPage - 1 && i <= currentPage + 1))
                      pages.push(i);
                    else if (pages[pages.length - 1] !== '...')
                      pages.push('...');
                  }
                  return pages.map((p, i) => p === '...'
                    ? <span key={`d-${i}`} style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--text-3)' }}>…</span>
                    : <button key={p} className="pg-btn"
                        onClick={() => updateFilter('page', p)}
                        style={{
                          width: 38, height: 38, fontSize: 13,
                          ...(currentPage === p
                            ? { background: 'var(--violet)', color: '#fff', border: '1.5px solid transparent', boxShadow: '0 4px 18px rgba(124,58,237,0.42)' }
                            : { background: 'var(--bg-2)', border: '1.5px solid var(--border)', color: 'var(--text-2)' }),
                        }}
                      >{p}</button>
                  );
                })()}

                <button
                  className="pg-btn"
                  onClick={() => { if (currentPage < pagination.totalPages) updateFilter('page', currentPage + 1); }}
                  disabled={currentPage >= pagination.totalPages}
                  style={{
                    padding: '9px 20px', fontSize: 13,
                    background: 'var(--bg-2)', border: '1.5px solid var(--border)',
                    color: 'var(--text)',
                  }}
                >Next →</button>
              </motion.div>
            )}

            {!loading && blogs.length > 0 && (
              <p style={{
                textAlign: 'center', fontSize: 10, marginTop: 18,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--text-3)', fontFamily: "'SF Mono',monospace",
              }}>
                Showing {blogs.length} of {pagination.totalBlogs} stories
              </p>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            CTA SECTION
        ═══════════════════════════════════════════════════════ */}
        <section ref={ctaRef} style={{
          position: 'relative',
          padding: 'clamp(80px,12vw,160px) clamp(20px,6vw,80px)',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)',
            filter: 'blur(80px)', pointerEvents: 'none',
          }}/>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 500, height: 500, borderRadius: '50%',
            border: darkMode ? '1px solid rgba(139,92,246,0.08)' : '1px solid rgba(109,40,217,0.07)',
            pointerEvents: 'none',
            animation: 'rotateSlow 40s linear infinite',
          }}/>

          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div style={{ overflow: 'hidden', marginBottom: 2 }}>
              <h2 className="cta-item font-playfair" style={{
                opacity: 0, color: 'var(--text)', display: 'inline-block',
                fontSize: 'clamp(2.8rem,5vw,5.5rem)',
                fontWeight: 900, lineHeight: 1.07, letterSpacing: '-0.01em',
              }}>
                Your story
              </h2>
            </div>
            <div style={{ overflow: 'hidden', marginBottom: 36 }}>
              <h2 className="cta-item font-playfair" style={{
                opacity: 0, display: 'inline-block',
                fontSize: 'clamp(2.8rem,5vw,5.5rem)',
                fontWeight: 900, fontStyle: 'italic', lineHeight: 1.07, letterSpacing: '-0.01em',
                background: 'linear-gradient(120deg,#c4b5fd 0%,#7c3aed 55%,#38bdf8 100%)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                begins now
              </h2>
            </div>

            <p className="cta-item" style={{
              opacity: 0, fontSize: 'clamp(14px,1.1vw,16px)',
              lineHeight: 1.80, marginBottom: 40,
              color: 'var(--text-2)', maxWidth: 440, margin: '0 auto 40px',
            }}>
              Join thousands of writers sharing their ideas with the world.
            </p>

            <Link to={user ? '/create-blog' : '/register'} style={{ textDecoration: 'none', display: 'inline-block' }}>
              <motion.button
                className="cta-item btn-hero-primary"
                style={{
                  opacity: 0,
                  padding: '16px 42px', fontSize: 15, borderRadius: 10,
                  boxShadow: '0 6px 32px rgba(109,40,217,0.42)',
                }}
                whileHover={{ scale: 1.04, boxShadow: '0 12px 48px rgba(109,40,217,0.56)' }}
                whileTap={{ scale: 0.96 }}
              >
                <FiPenTool size={16}/>
                {user ? 'Write Now' : 'Join Free'}
              </motion.button>
            </Link>
          </div>
        </section>

      </div>
    </>
  );
};

export default Home;