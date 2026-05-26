import { motion } from 'framer-motion';

/**
 * PageTransition
 * ─────────────────────────────────────────
 * Fixes from audit:
 *   • Old: exit y:-20 fought the navbar scroll direction
 *   • New: blur-fade — no directional conflict, feels premium (like iOS)
 *   • Comments in English
 *   • Works perfectly with AnimatePresence mode="wait" in App.jsx
 *
 * Usage — wrap each page's root element:
 *   const Home = () => (
 *     <PageTransition>
 *       ...page content...
 *     </PageTransition>
 *   );
 */
const variants = {
  initial: {
    opacity:   0,
    filter:    'blur(6px)',
    scale:     0.995,
  },
  animate: {
    opacity:   1,
    filter:    'blur(0px)',
    scale:     1,
    transition: {
      duration: 0.45,
      ease:     [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity:   0,
    filter:    'blur(3px)',
    scale:     1.005,
    transition: {
      duration: 0.25,
      ease:     [0.4, 0, 1, 1],
    },
  },
};

const PageTransition = ({ children, className = '', style = {} }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    className={className}
    style={{ minHeight: '100vh', ...style }}
  >
    {children}
  </motion.div>
);

export default PageTransition;