import { useEffect, useRef, useState } from 'react';

const CursorGlow = () => {
  const glowRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let isMouseOnPage = false;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseOnPage = true;
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      isMouseOnPage = false;
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      isMouseOnPage = true;
      setIsVisible(true);
    };

    // Smooth animation loop
    const animate = () => {
      // Ease factor - lower = smoother/slower
      const ease = 0.15;

      currentX += (mouseX - currentX) * ease;
      currentY += (mouseY - currentY) * ease;

      glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;

      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Start animation loop
    let animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className={`cursor-glow pointer-events-none fixed top-0 left-0 w-[500px] h-[500px] rounded-full opacity-0 transition-opacity duration-300 z-[9999]
        bg-[radial-gradient(circle,#3b82f6_0%,transparent_70%)] dark:bg-[radial-gradient(circle,#3b82f6_0%,transparent_70%)]`}
      style={{ opacity: isVisible ? 0.15 : 0 }}
    />
  );
};

export default CursorGlow;