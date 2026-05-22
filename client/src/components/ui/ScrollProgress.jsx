import { useEffect, useState } from 'react';

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 h-[3px] z-[9999] transition-all duration-100 ease-out"
      style={{
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
      }}
    />
  );
};

export default ScrollProgress;