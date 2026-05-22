import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-white dark:bg-[#03030a] border-t border-slate-200 dark:border-white/5 mt-20 transition-colors duration-300">
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

        {/* Brand */}
        <div className="md:col-span-2">
          <div className="mb-4">
            <span className="font-black text-2xl bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
              Blog
            </span>
            <span className="font-black text-2xl text-slate-800 dark:text-white/90">
              Verse
            </span>
          </div>
          <p className="text-slate-500 dark:text-white/40 text-sm leading-relaxed max-w-xs">
            A cinematic universe for modern storytellers.
            Share ideas that move the world.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-white/30 mb-4">
            Navigate
          </h4>
          <ul className="space-y-3">
            {[
              { to: '/',         label: 'Home'     },
              { to: '/login',    label: 'Login'    },
              { to: '/register', label: 'Register' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to}
                  className="text-slate-500 dark:text-white/40 hover:text-violet-600 dark:hover:text-violet-400 text-sm transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-white/30 mb-4">
            Categories
          </h4>
          <ul className="space-y-3">
            {['Technology', 'Programming', 'Design', 'Business'].map(c => (
              <li key={c}>
                <Link to={`/?category=${c}`}
                  className="text-slate-500 dark:text-white/40 hover:text-violet-600 dark:hover:text-violet-400 text-sm transition-colors">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-100 dark:border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-400 dark:text-white/25 text-xs tracking-wider uppercase">
          © {new Date().getFullYear()} BlogVerse. All Rights Reserved.
        </p>
        <p className="text-slate-300 dark:text-white/15 text-xs tracking-wider uppercase">
          Built with ❤️ using MERN Stack
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;