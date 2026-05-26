import { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const dotRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth < 1024) return;
    const dot = dotRef.current;
    if (!dot) return;

    const onMouseMove = (e) => {
      dot.style.left = `${e.clientX}px`;
      dot.style.top  = `${e.clientY}px`;
    };
    const onEnter = () => dot.classList.add('hovering');
    const onLeave = () => dot.classList.remove('hovering');
    const onDown  = () => dot.classList.add('clicking');
    const onUp    = () => dot.classList.remove('clicking');

    const attachListeners = () => {
      document
        .querySelectorAll('a, button, [role="button"], input, select, textarea, label')
        .forEach(el => {
          el.addEventListener('mouseenter', onEnter);
          el.addEventListener('mouseleave', onLeave);
        });
    };
    attachListeners();

    const observer = new MutationObserver(attachListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup',   onUp);

    return () => {
      observer.disconnect();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup',   onUp);
    };
  }, []);

  if (typeof window !== 'undefined' && window.innerWidth < 1024) return null;

  return (
    <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
  );
};

export default CustomCursor;