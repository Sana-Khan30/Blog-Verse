import { useState, useEffect, useRef } from 'react';

const ReadingProgress = ({ targetRef }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!targetRef?.current) return;

      const element = targetRef.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how much of the article has been scrolled past
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // Progress calculation:
      // 0% when element top reaches viewport bottom
      // 100% when element bottom reaches viewport top
      const scrollTop = window.scrollY;
      const startPoint = scrollTop + windowHeight;
      const endPoint = scrollTop + elementTop;
      const totalDistance = elementHeight + windowHeight;

      // Calculate percentage
      const scrolled = startPoint - endPoint;
      const percentage = Math.max(0, Math.min(100, (scrolled / totalDistance) * 100));

      setProgress(percentage);

      // Show/hide based on whether we're in the article zone
      const inArticleZone = rect.top < windowHeight && rect.bottom > 0;
      setIsVisible(inArticleZone);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [targetRef]);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none transition-all duration-100 ease-out"
      style={{
        width: `${progress}%`,
        opacity: isVisible ? 1 : 0,
        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
        boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
      }}
    />
  );
};

// Hook for getting reading time
export const useReadingTime = (content) => {
  const [readingTime, setReadingTime] = useState(1);

  useEffect(() => {
    if (!content) return;

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(wordCount / 200);
    setReadingTime(minutes || 1);
  }, [content]);

  return readingTime;
};

export default ReadingProgress;