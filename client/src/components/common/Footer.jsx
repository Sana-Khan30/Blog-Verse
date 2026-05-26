import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGithub, FiTwitter, FiMail, FiArrowUpRight, FiZap } from 'react-icons/fi';

const NAV_LINKS = [
  { to: '/',         label: 'Home'          },
  { to: '/?sortBy=popular', label: 'Trending'  },
  { to: '/login',    label: 'Login'         },
  { to: '/register', label: 'Register'      },
];

const CAT_LINKS = [
  'Technology', 'Programming', 'Design', 'Business', 'Lifestyle',
];

const SOCIAL = [
  { icon: FiGithub,  href: 'https://github.com', label: 'GitHub'  },
  { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: FiMail,    href: 'mailto:hello@blogverse.com', label: 'Email' },
];

/* Stagger config */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const Footer = () => (
  <footer
    style={{
      position:   'relative',
      background: 'var(--bg-2)',
      borderTop:  '1px solid var(--border)',
      color:      'var(--text)',
      overflow:   'hidden',
    }}
  >
    {/* Ambient glow — top center */}
    <div style={{
      position:      'absolute',
      top:           '-40%',
      left:          '50%',
      transform:     'translateX(-50%)',
      width:         600,
      height:        300,
      borderRadius:  '50%',
      background:    'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 65%)',
      filter:        'blur(40px)',
      pointerEvents: 'none',
    }} />

    <div style={{ maxWidth: 1152, margin: '0 auto', padding: '72px 24px 0' }}>

      {/* ── Top row: Brand + CTA ── */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        style={{
          display:        'flex',
          flexWrap:       'wrap',
          justifyContent: 'space-between',
          alignItems:     'flex-start',
          gap:            40,
          marginBottom:   56,
        }}
      >
        {/* Brand block */}
        <motion.div variants={item} style={{ maxWidth: 340 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              style={{
                width:          42,
                height:         42,
                borderRadius:   13,
                background:     'linear-gradient(135deg, var(--violet), var(--cyan))',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                boxShadow:      '0 8px 24px var(--glow)',
                flexShrink:     0,
              }}
            >
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>✦</span>
            </motion.div>
            <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>
              <span style={{
                backgroundImage: 'linear-gradient(135deg, var(--violet-2), var(--cyan))',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Blog</span>
              <span style={{ color: 'var(--text)' }}>Verse</span>
            </span>
          </div>

          <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-3)', marginBottom: 24 }}>
            A cinematic universe for modern storytellers. Share ideas that move the world.
            Free forever.
          </p>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.92 }}
                style={{
                  width:          38,
                  height:         38,
                  borderRadius:   11,
                  background:     'var(--bg-3)',
                  border:         '1px solid var(--border)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  color:          'var(--text-3)',
                  textDecoration: 'none',
                  transition:     'border-color 0.2s ease, color 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
                  e.currentTarget.style.color = 'var(--violet)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-3)';
                }}
              >
                <Icon size={16} />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Links columns */}
        <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>

          {/* Navigate */}
          <motion.div variants={item}>
            <h4 style={{
              fontSize:      11,
              fontWeight:    700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color:         'var(--text-3)',
              marginBottom:  20,
            }}>
              Navigate
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {NAV_LINKS.map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    style={{
                      fontSize:       13,
                      fontWeight:     500,
                      color:          'var(--text-2)',
                      textDecoration: 'none',
                      display:        'flex',
                      alignItems:     'center',
                      gap:            4,
                      transition:     'color 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--violet)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div variants={item}>
            <h4 style={{
              fontSize:      11,
              fontWeight:    700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color:         'var(--text-3)',
              marginBottom:  20,
            }}>
              Categories
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CAT_LINKS.map(cat => (
                <li key={cat}>
                  <Link
                    to={`/?category=${cat}`}
                    style={{
                      fontSize:       13,
                      fontWeight:     500,
                      color:          'var(--text-2)',
                      textDecoration: 'none',
                      transition:     'color 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--violet)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; }}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Newsletter / CTA block */}
        <motion.div variants={item} style={{ minWidth: 260, maxWidth: 300 }}>
          <h4 style={{
            fontSize:      11,
            fontWeight:    700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color:         'var(--text-3)',
            marginBottom:  16,
          }}>
            Start Writing
          </h4>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 20 }}>
            Share your story with thousands of readers. No paywalls. No limits.
          </p>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(124,58,237,0.45)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            8,
                padding:        '11px 22px',
                borderRadius:   14,
                background:     'linear-gradient(135deg, var(--violet), #6d28d9)',
                color:          '#fff',
                fontSize:       14,
                fontWeight:     700,
                boxShadow:      '0 6px 24px var(--glow)',
                cursor:         'pointer',
                position:       'relative',
                overflow:       'hidden',
              }}
            >
              {/* shimmer sweep */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                style={{
                  position:   'absolute',
                  inset:      0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)',
                  transform:  'skewX(-20deg)',
                  pointerEvents: 'none',
                }}
              />
              <FiZap size={15} />
              Join Free
              <FiArrowUpRight size={14} />
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'var(--border)', marginBottom: 28 }} />

      {/* ── Bottom bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{
          display:        'flex',
          flexWrap:       'wrap',
          alignItems:     'center',
          justifyContent: 'space-between',
          gap:            12,
          paddingBottom:  32,
        }}
      >
        <p style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.04em' }}>
          © {new Date().getFullYear()} BlogVerse — All rights reserved.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Built with</span>
          <span style={{ fontSize: 14 }}>❤️</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>using MERN Stack</span>
        </div>

        {/* Back to top */}
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            6,
            padding:        '7px 14px',
            borderRadius:   10,
            background:     'var(--bg-3)',
            border:         '1px solid var(--border)',
            color:          'var(--text-3)',
            fontSize:       12,
            fontWeight:     600,
            cursor:         'pointer',
            transition:     'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)';
            e.currentTarget.style.color = 'var(--violet)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-3)';
          }}
        >
          ↑ Back to top
        </motion.button>
      </motion.div>
    </div>
  </footer>
);

export default Footer;