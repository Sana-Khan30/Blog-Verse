import { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth < 1024) return;

    let raf;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;

    const onMove = (e) => { mx = e.clientX; my = e.clientY; };

    const loop = () => {
      // Dot follows cursor instantly
      if (dotRef.current) {
        dotRef.current.style.left = mx + 'px';
        dotRef.current.style.top  = my + 'px';
      }
      // Ring lags behind — cinematic feel
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      if (ringRef.current) {
        ringRef.current.style.left = rx + 'px';
        ringRef.current.style.top  = ry + 'px';
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    // Hover expand
    const grow = () => {
      if (ringRef.current) {
        ringRef.current.style.width  = '52px';
        ringRef.current.style.height = '52px';
        ringRef.current.style.borderColor = 'rgba(167,139,250,0.8)';
        ringRef.current.style.mixBlendMode = 'normal';
      }
    };
    const shrink = () => {
      if (ringRef.current) {
        ringRef.current.style.width  = '36px';
        ringRef.current.style.height = '36px';
        ringRef.current.style.borderColor = 'rgba(124,58,237,0.6)';
      }
    };

    const clickables = document.querySelectorAll('a, button, [role="button"]');
    clickables.forEach(el => {
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (typeof window !== 'undefined' && window.innerWidth < 1024) return null;

  return (
    <>
      {/* Dot */}
      <div ref={dotRef} className="cursor-dot"
        style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'white',
          transform: 'translate(-50%,-50%)',
          mixBlendMode: 'difference',
        }}
      />
      {/* Ring */}
      <div ref={ringRef} className="cursor-ring"
        style={{
          width: 36, height: 36,
          transform: 'translate(-50%,-50%)',
        }}
      />
    </>
  );
};

export default CustomCursor;