import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiFeather, FiCompass } from 'react-icons/fi';

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen pt-24 pb-12 flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      
      {/* Immersive background graphics replicating the reference image gradient blend */}
      <div className="absolute inset-0 -z-10 bg-slate-50 dark:bg-[#09090e] transition-colors duration-500">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[120px] dark:bg-violet-500/5" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] dark:bg-cyan-500/5" />
      </div>

      {/* Main Glassmorphic Wrapper matching Reference Layout perfectly */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl rounded-[2.5rem] overflow-hidden aspect-[16/10] md:aspect-[16/9.5] flex flex-col justify-between p-6 sm:p-12 lg:p-16 border shadow-2xl transition-all duration-500 group"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          backdropFilter: 'blur(1px)',
        }}
      >
        {/* Immersive Premium Background Image Layer (Deep cinematic storytelling style) */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-[2.5rem]">
          <img 
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" 
            alt="Cinematic Background" 
            className="w-full h-full object-cover object-center transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out brightness-[0.85] dark:brightness-[0.45] saturate-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/40 dark:from-[#09090e]/90 dark:via-transparent dark:to-black/30" />
        </div>

        {/* 1. Top Mini Pill Navigation Badge */}
        <div className="w-full flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-white/[0.06] backdrop-blur-md border border-white/10 shadow-inner"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium tracking-wider text-white/90 uppercase">The Creative Oasis</span>
          </motion.div>
        </div>

        {/* 2. Core Storytelling Typography Grid */}
        <div className="w-full max-w-3xl mx-auto text-center my-auto space-y-4 sm:space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]"
          >
            Where ideas breathe.<br />
            <span className="bg-gradient-to-r from-violet-200 via-white to-cyan-100 bg-clip-text text-transparent opacity-95">
              Stories come alive.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-sm sm:text-base md:text-lg text-white/70 max-w-xl mx-auto font-normal leading-relaxed tracking-wide"
          >
            Step into a premium space for thought leaders, writers, and builders. Share your insights seamlessly and shape your digital universe.
          </motion.p>
        </div>

        {/* 3. High-End Call To Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="w-full flex flex-col sm:flex-row items-center justify-center gap-3.5"
        >
          <Link 
            to="/dashboard" 
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-slate-950 text-xs font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <FiFeather size={14} className="text-violet-600" />
            Start Writing Free
          </Link>

          <Link 
            to="/#explore" 
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 dark:bg-white/[0.07] backdrop-blur-md border border-white/10 text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-white/20 transition-all duration-300"
          >
            <FiCompass size={14} className="opacity-80" />
            Explore Articles
            <FiArrowRight size={13} className="opacity-60 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default Hero;