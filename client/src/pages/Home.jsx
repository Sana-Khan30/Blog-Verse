import {
  useState, useEffect, useRef, useCallback, lazy, Suspense
} from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getAllBlogs } from '../api/blogApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import BlogCard from '../components/blog/BlogCard.jsx';
import {
  FiSearch, FiArrowDown, FiArrowRight,
  FiHeart, FiEye, FiZap, FiX
} from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = [
  'All','Technology','Programming','Design',
  'Business','Lifestyle','Health','Travel','Food','Other'
];

/* ── Skeleton ── */
const BlogSkeleton = () => (
  <div className="glass-card overflow-hidden">
    <div className="h-52 shimmer rounded-t-2xl" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-1/3 shimmer rounded-full" />
      <div className="h-5 w-full shimmer rounded-full" />
      <div className="h-3 w-2/3 shimmer rounded-full" />
    </div>
  </div>
);

/* ── Scene Background ── */
const SceneBg = ({ src, children, overlay = 'from-black/70 via-black/30 to-transparent' }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
      style={{
        backgroundImage: `url(${src})`,
        filter: 'brightness(0.55) saturate(1.2)',
        willChange: 'transform',
      }}
    />
    <div className={`absolute inset-0 bg-gradient-to-b ${overlay}`} />
    {children}
  </div>
);

/* ── Animated Word ── */
const SplitText = ({ text, className, delay = 0, stagger = 0.04 }) => {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: delay + i * stagger,
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
};

/* ── Horizontal Scroll Section ── */
const HorizontalScroll = ({ blogs }) => {
  const trackRef  = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!trackRef.current || !sectionRef.current || blogs.length === 0) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const totalWidth = track.scrollWidth - track.offsetWidth;

      gsap.to(track, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          end: () => `+=${totalWidth}`,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [blogs]);

  if (blogs.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[var(--ink)]">
      {/* Label */}
      <div className="absolute top-12 left-8 z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-px bg-[var(--violet-2)]" />
          <span className="font-serif text-xs tracking-[0.3em] text-[var(--violet-2)] uppercase">
            Latest Stories
          </span>
        </motion.div>
      </div>

      {/* Scrolling track */}
      <div ref={trackRef} className="flex items-center gap-6 px-16 py-24 h-[85vh] w-max">
        {blogs.map((blog, i) => (
          <div key={blog._id}
            className="w-[380px] flex-shrink-0 h-[480px] overflow-hidden rounded-2xl"
          >
            <BlogCard blog={blog} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
};

/* ── Scene Divider ── */
const SceneDivider = () => (
  <div className="relative h-px my-0 overflow-visible flex items-center justify-center">
    <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-[var(--border-2)] to-transparent" />
    <div className="relative w-2 h-2 rounded-full bg-[var(--violet)] ring-4 ring-[var(--violet)]/20" />
  </div>
);

/* ══════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════ */
const Home = () => {
  const { user } = useAuth();
  const [blogs, setBlogs]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [pagination, setPagination] = useState({ totalPages: 1, totalBlogs: 0 });
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput]   = useState('');

  // Refs for GSAP
  const heroRef     = useRef(null);
  const manifestoRef = useRef(null);
  const gridRef     = useRef(null);
  const statsRef    = useRef(null);
  const ctaRef      = useRef(null);

  const { scrollY } = useScroll();
  const heroY    = useTransform(scrollY, [0, 600], [0, 180]);
  const heroOpa  = useTransform(scrollY, [0, 500], [1, 0]);

  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch   = searchParams.get('search')   || '';
  const currentPage     = parseInt(searchParams.get('page')) || 1;
  const currentSort     = searchParams.get('sortBy')   || 'latest';

  /* ── Fetch ── */
  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAllBlogs({
        page: currentPage, limit: 9,
        ...(currentCategory !== 'All' && { category: currentCategory }),
        ...(currentSearch && { search: currentSearch }),
        sortBy: currentSort,
      });
      setBlogs(data.blogs || []);
      setPagination(data.pagination || { totalPages: 1, totalBlogs: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, currentSearch, currentPage, currentSort]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  /* ── GSAP Scene Animations ── */
  useEffect(() => {
    const ctx = gsap.context(() => {

      // Manifesto section — word by word
      if (manifestoRef.current) {
        gsap.fromTo('.manifesto-word',
          { y: 80, opacity: 0 },
          {
            y: 0, opacity: 1,
            stagger: 0.06,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: manifestoRef.current,
              start: 'top 80%',
            }
          }
        );
      }

      // Stats counter
      if (statsRef.current) {
        gsap.fromTo('.stat-bar',
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.5,
            stagger: 0.2,
            ease: 'power3.out',
            transformOrigin: 'left center',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
            }
          }
        );
        gsap.fromTo('.stat-number',
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
            }
          }
        );
      }

      // Grid cards
      if (gridRef.current) {
        gsap.fromTo('.grid-card',
          { y: 80, opacity: 0 },
          {
            y: 0, opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
            }
          }
        );
      }

      // CTA
      if (ctaRef.current) {
        gsap.fromTo('.cta-text',
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 80%',
            }
          }
        );
      }

    });

    return () => ctx.revert();
  }, [blogs]);

  /* ── Filter helpers ── */
  const updateFilter = (key, value) => {
    const p = Object.fromEntries(searchParams);
    if (value && value !== 'All') p[key] = value;
    else delete p[key];
    if (key !== 'page') p.page = '1';
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    updateFilter('search', searchInput);
  };

  /* ── Featured blog ── */
  const featured = blogs[0];
  const rest     = blogs.slice(1);

  return (
    <div className="bg-[var(--ink)] min-h-screen grain vignette">

      {/* ╔══════════════════════════════════════╗
          ║  SCENE 1 — CINEMATIC HERO            ║
          ╚══════════════════════════════════════╝ */}
      <section ref={heroRef} className="relative h-screen overflow-hidden scene">

        {/* Layered atmospheric background */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 scale-110"
        >
          {/* Deep space gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#050510] via-[#0a0520] to-[#030310]" />

          {/* Aurora blobs */}
          <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 60%)',
              filter: 'blur(80px)',
              animation: 'float1 20s ease-in-out infinite',
            }}
          />
          <div className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 60%)',
              filter: 'blur(100px)',
              animation: 'float2 25s ease-in-out infinite',
            }}
          />
          <div className="absolute top-[30%] right-[20%] w-[40vw] h-[40vw] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 60%)',
              filter: 'blur(60px)',
              animation: 'float3 18s ease-in-out infinite',
            }}
          />

          {/* Grid mesh */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent)',
            }}
          />
        </motion.div>

        {/* Gradient curtain bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[var(--ink)] to-transparent z-10" />

        {/* Hero content */}
        <motion.div
          style={{ opacity: heroOpa }}
          className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[var(--violet-2)]" />
            <span className="font-serif text-xs tracking-[0.4em] text-[var(--violet-2)] uppercase">
              The Art of Storytelling
            </span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-[var(--violet-2)]" />
          </motion.div>

          {/* Main Title — dramatic split */}
          <div className="mb-4 overflow-hidden">
            <motion.h1
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1, ease: [0.16,1,0.3,1] }}
              className="font-display text-[14vw] md:text-[11vw] lg:text-[9vw] leading-none text-white tracking-wider"
            >
              DISCOVER
            </motion.h1>
          </div>
          <div className="mb-4 overflow-hidden">
            <motion.h1
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.65, duration: 1, ease: [0.16,1,0.3,1] }}
              className="font-display text-[14vw] md:text-[11vw] lg:text-[9vw] leading-none tracking-wider gradient-text"
            >
              EXTRAORDINARY
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-10">
            <motion.h1
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 1, ease: [0.16,1,0.3,1] }}
              className="font-display text-[14vw] md:text-[11vw] lg:text-[9vw] leading-none text-white/60 tracking-wider"
            >
              STORIES
            </motion.h1>
          </div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-[var(--text-2)] text-base md:text-lg max-w-lg mb-10 leading-relaxed"
          >
            A cinematic universe where ideas come alive.
            Read, write, and connect with visionary minds.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.8 }}
            className="flex gap-4 flex-wrap justify-center"
          >
            <Link to={user ? '/create-blog' : '/register'}>
              <button className="btn-cinema btn-shine px-8 py-4 bg-[var(--violet)] hover:bg-[#6d28d9] text-white font-semibold rounded-2xl flex items-center gap-2 transition-colors duration-300">
                <FiZap size={16} />
                <span className="font-display tracking-wider text-base">
                  {user ? 'WRITE STORY' : 'BEGIN JOURNEY'}
                </span>
              </button>
            </Link>
            <button
              onClick={() => {
                document.getElementById('stories-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-cinema px-8 py-4 glass border border-[var(--border-2)] text-white font-semibold rounded-2xl flex items-center gap-2 hover:border-[var(--violet)]/40 transition-colors duration-300"
            >
              <span className="font-display tracking-wider text-base">EXPLORE</span>
              <FiArrowDown size={16} />
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
        >
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-0.5 h-2 rounded-full bg-gradient-to-b from-[var(--violet-2)] to-transparent"
            />
          </div>
          <span className="font-serif text-[10px] tracking-[0.4em] text-white/20 uppercase">
            Scroll
          </span>
        </motion.div>
      </section>

      {/* ╔══════════════════════════════════════╗
          ║  SCENE 2 — MANIFESTO                 ║
          ╚══════════════════════════════════════╝ */}
      <section ref={manifestoRef} className="relative py-32 px-6 overflow-hidden scene">

        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--ink)] via-[var(--ink-2)] to-[var(--ink)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 60%)',
              filter: 'blur(60px)',
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">

          {/* Section label */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-8 h-px bg-[var(--violet-2)]" />
            <span className="font-serif text-xs tracking-[0.3em] text-[var(--violet-2)] uppercase">
              Our Vision
            </span>
          </div>

          {/* Big manifesto text */}
          <p className="font-display text-[6vw] md:text-[4.5vw] leading-tight text-white/80 mb-16">
            {[
              'Words', 'have', 'the', 'power', 'to',
              'change', 'the', 'world.', 'Share', 'yours.'
            ].map((word, i) => (
              <span key={i} className="manifesto-word inline-block mr-[0.3em] opacity-0"
                style={{ willChange: 'transform, opacity' }}
              >
                {word}
              </span>
            ))}
          </p>

          {/* Feature pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '✍️', label: 'Write', desc: 'Craft your story' },
              { icon: '❤️', label: 'Like',  desc: 'Show appreciation' },
              { icon: '💬', label: 'Discuss', desc: 'Exchange ideas' },
              { icon: '🌍', label: 'Reach',  desc: 'Global audience' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16,1,0.3,1] }}
                className="glass-card p-6 text-center cursor-default"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <p className="text-white font-semibold mb-1">{f.label}</p>
                <p className="text-[var(--text-3)] text-xs">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SceneDivider />

      {/* ╔══════════════════════════════════════╗
          ║  SCENE 3 — STATS                     ║
          ╚══════════════════════════════════════╝ */}
      <section ref={statsRef} className="relative py-24 px-6 bg-[var(--ink-2)] scene">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: pagination.totalBlogs || blogs.length, label: 'Stories Published', suffix: '+' },
              { value: 500,  label: 'Active Writers', suffix: '+' },
              { value: 2400, label: 'Total Likes',    suffix: '+' },
              { value: 890,  label: 'Comments',       suffix: '+' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="stat-number opacity-0 font-display text-5xl text-white mb-2">
                  {s.value}{s.suffix}
                </div>
                <div className="text-[var(--text-3)] text-sm font-serif tracking-wider uppercase text-xs">
                  {s.label}
                </div>
                <div className="mt-3 h-px bg-[var(--border)] relative overflow-hidden rounded-full">
                  <div
                    className="stat-bar absolute inset-0 bg-gradient-to-r from-[var(--violet)] to-[var(--cyan)]"
                    style={{ transformOrigin: 'left' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SceneDivider />

      {/* ╔══════════════════════════════════════╗
          ║  SCENE 4 — FEATURED STORY            ║
          ╚══════════════════════════════════════╝ */}
      {!loading && featured && (
        <section className="relative py-24 px-6 scene">
          <div className="max-w-6xl mx-auto">

            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-px bg-[var(--gold)]" />
              <span className="font-serif text-xs tracking-[0.3em] text-[var(--gold)] uppercase">
                Featured Story
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
            >
              <Link to={`/blog/${featured.slug}`}>
                <div className="group relative overflow-hidden rounded-3xl border border-[var(--border)] hover:border-[var(--violet)]/40 transition-all duration-500">

                  {/* Background image */}
                  <div className="relative h-[500px] md:h-[600px] overflow-hidden">
                    {featured.coverImage ? (
                      <motion.img
                        src={featured.coverImage}
                        alt={featured.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.04 }}
                        transition={{ duration: 0.8 }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--ink-3)] to-[var(--ink-2)]" />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-[var(--ink)]/50 to-transparent" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-10 md:p-14">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="px-3 py-1 bg-[var(--violet)]/80 backdrop-blur text-white text-xs font-serif tracking-widest rounded-full uppercase">
                          {featured.category}
                        </span>
                        <span className="text-[var(--text-3)] text-sm font-serif">
                          {new Date(featured.createdAt).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      </div>

                      <h2 className="font-display text-4xl md:text-6xl text-white mb-5 leading-tight max-w-3xl group-hover:gradient-text transition-all duration-500">
                        {featured.title}
                      </h2>

                      <p className="text-[var(--text-2)] max-w-2xl mb-8 line-clamp-2 text-base md:text-lg">
                        {featured.excerpt}
                      </p>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[var(--violet)] flex items-center justify-center text-white text-sm font-bold">
                            {featured.author?.username?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-white/70 text-sm">{featured.author?.username}</span>
                        </div>

                        <motion.div
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-2 text-[var(--violet-2)] font-serif text-sm tracking-wider uppercase"
                        >
                          Read Story <FiArrowRight size={14} />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ╔══════════════════════════════════════╗
          ║  SCENE 5 — HORIZONTAL SCROLL         ║
          ╚══════════════════════════════════════╝ */}
      {!loading && currentPage === 1 && rest.length >= 3 && (
        <HorizontalScroll blogs={rest.slice(0, 6)} />
      )}

      {/* ╔══════════════════════════════════════╗
          ║  SCENE 6 — GRID + FILTERS            ║
          ╚══════════════════════════════════════╝ */}
      <section id="stories-section" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-px bg-[var(--violet-2)]" />
                <span className="font-serif text-xs tracking-[0.3em] text-[var(--violet-2)] uppercase">
                  All Stories
                </span>
              </div>
              <h2 className="font-display text-5xl text-white tracking-wider">
                EXPLORE THE{' '}
                <span className="gradient-text">ARCHIVE</span>
              </h2>
            </div>

            <select
              value={currentSort}
              onChange={e => updateFilter('sortBy', e.target.value)}
              className="px-4 py-3 glass border border-[var(--border)] rounded-xl text-[var(--text-2)] text-sm focus:outline-none focus:border-[var(--violet)]/50 bg-transparent"
            >
              <option value="latest"  className="bg-[var(--ink)]">Latest</option>
              <option value="popular" className="bg-[var(--ink)]">Most Viewed</option>
              <option value="liked"   className="bg-[var(--ink)]">Most Liked</option>
            </select>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative max-w-2xl">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-3)]" size={18} />
              <input
                type="text" value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search stories, topics, authors..."
                className="w-full pl-14 pr-14 py-4 glass border border-[var(--border)] rounded-2xl text-white placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--violet)]/40 transition text-sm"
              />
              {searchInput && (
                <button type="button"
                  onClick={() => { setSearchInput(''); updateFilter('search', ''); }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-white transition"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          </form>

          {/* Categories */}
          <div className="flex gap-2 flex-wrap mb-10">
            {CATEGORIES.map(cat => (
              <motion.button
                key={cat}
                onClick={() => updateFilter('category', cat)}
                whileHover={{ scale: 1.05 }}
                                className={`px-4 py-2 rounded-xl text-xs font-serif tracking-widest uppercase transition-all duration-200 ${
                  currentCategory === cat
                    ? 'bg-[var(--violet)] text-white shadow-lg shadow-[var(--violet)]/30'
                    : 'glass border border-[var(--border)] text-[var(--text-3)] hover:border-[var(--violet)]/30 hover:text-white'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          {/* Active search indicator */}
          <AnimatePresence>
            {currentSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex items-center gap-3"
              >
                <span className="text-[var(--text-3)] text-sm font-serif">
                  Searching:
                </span>
                <span className="px-3 py-1.5 glass border border-[var(--border)] text-white text-sm font-serif rounded-xl">
                  "{currentSearch}"
                </span>
                <button
                  onClick={() => { setSearchInput(''); updateFilter('search', ''); }}
                  className="text-[var(--text-3)] hover:text-red-400 transition text-xs uppercase tracking-wider font-serif"
                >
                  Clear
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Blog Grid */}
          <div ref={gridRef}>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <BlogSkeleton key={i} />)}
              </div>
            ) : blogs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <p className="text-7xl mb-6">🔍</p>
                <h3 className="font-display text-3xl text-white mb-3 tracking-wider">
                  NO STORIES FOUND
                </h3>
                <p className="text-[var(--text-3)] font-serif">
                  {currentSearch ? 'Try different keywords' : 'Be the first to write!'}
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(currentPage === 1 ? rest : blogs).map((blog, i) => (
                  <div key={blog._id} className="grid-card opacity-0">
                    <BlogCard blog={blog} index={i} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination — FIXED */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-16">

              {/* PREV BUTTON FIX */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                                onClick={() => {
                  if (currentPage > 1) {
                    updateFilter('page', String(currentPage - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={currentPage <= 1}
                className="px-5 py-2.5 glass border border-[var(--border)] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--violet)]/30 rounded-xl text-sm font-serif tracking-wider transition-all"
              >
                ← Prev
              </motion.button>

              {/* Page numbers */}
              {[...Array(pagination.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.1 }}
                                        onClick={() => {
                      updateFilter('page', String(pageNum));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-10 h-10 rounded-xl text-sm font-serif font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-[var(--violet)] text-white shadow-lg shadow-[var(--violet)]/30'
                        : 'glass border border-[var(--border)] text-[var(--text-3)] hover:border-[var(--violet)]/30 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}

              {/* NEXT BUTTON FIX */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                                onClick={() => {
                  if (currentPage < pagination.totalPages) {
                    updateFilter('page', String(currentPage + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={currentPage >= pagination.totalPages}
                className="px-5 py-2.5 glass border border-[var(--border)] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--violet)]/30 rounded-xl text-sm font-serif tracking-wider transition-all"
              >
                Next →
              </motion.button>
            </div>
          )}

          {!loading && blogs.length > 0 && (
            <p className="text-center text-[var(--text-3)] text-xs font-serif tracking-widest uppercase mt-6">
              {blogs.length} of {pagination.totalBlogs} Stories
            </p>
          )}
        </div>
      </section>

      {/* ╔══════════════════════════════════════╗
          ║  SCENE 7 — CINEMATIC CTA             ║
          ╚══════════════════════════════════════╝ */}
      <section ref={ctaRef} className="relative py-40 px-6 overflow-hidden scene">

        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--ink)] via-[#0a0520] to-[var(--ink)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 60%)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">

          <div className="cta-text opacity-0 overflow-hidden mb-2">
            <h2 className="font-display text-[10vw] md:text-[7vw] leading-none text-white tracking-wider">
              YOUR STORY
            </h2>
          </div>
          <div className="cta-text opacity-0 overflow-hidden mb-12">
            <h2 className="font-display text-[10vw] md:text-[7vw] leading-none tracking-wider gradient-text">
              BEGINS NOW
            </h2>
          </div>

          <motion.p
            className="cta-text opacity-0 text-[var(--text-2)] text-base md:text-lg mb-12 max-w-xl mx-auto font-serif"
          >
            Join a universe of thinkers, creators, and visionaries.
            Your words deserve an audience.
          </motion.p>

          <motion.div
            className="cta-text opacity-0 flex gap-4 justify-center flex-wrap"
          >
            <Link to={user ? '/create-blog' : '/register'}>
              <button className="btn-cinema btn-shine px-10 py-5 bg-[var(--violet)] text-white font-display text-xl tracking-wider rounded-2xl hover:bg-[#6d28d9] transition-colors">
                {user ? 'WRITE NOW' : 'JOIN FREE'}
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Float animations */}
      <style>{`
        @keyframes float1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(30px,-40px) scale(1.05); }
          66%      { transform: translate(-20px,20px) scale(0.97); }
        }
        @keyframes float2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-30px,-20px) scale(1.08); }
        }
        @keyframes float3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(20px,30px) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default Home;