import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { SoundManager } from '../ui/SoundFX.jsx';
import CursorGlow from '../ui/CursorGlow.jsx';
import ScrollProgress from '../ui/ScrollProgress.jsx';
import PageTransition from '../ui/PageTransition.jsx';
import useLenis from '../ui/SoundManager.jsx';

const Layout = ({ children }) => {
  // Initialize Lenis smooth scroll
  useLenis();

  useEffect(() => {
    // Smooth scroll behavior
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (target) {
        e.preventDefault();
        const id = target.getAttribute('href').slice(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <SoundManager>
      <div className="min-h-screen text-white relative overflow-x-hidden noise-overlay">
        {/* Background Gradient Layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Top gradient */}
          <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-primary-900/10 via-transparent to-transparent" />
          {/* Side gradients */}
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary-500/5 rounded-full blur-[128px]" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-accent-purple/5 rounded-full blur-[128px]" />
        </div>

        {/* Noise texture overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-[9998]">
          <svg className="w-full h-full">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>

        {/* Cursor Glow */}
        <CursorGlow />

        {/* Scroll Progress */}
        <ScrollProgress />

        {/* Navbar */}
        <Navbar />

        {/* Main Content with Page Transition */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 pt-20"
        >
          <PageTransition>
            {children}
          </PageTransition>
        </motion.main>

        {/* Footer */}
        <Footer />

        {/* Bottom Gradient */}
        <div className="fixed bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t from-dark-900 via-dark-900/80 to-transparent pointer-events-none" />
      </div>
    </SoundManager>
  );
};

export default Layout;