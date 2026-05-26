/**
 * MagneticButton.jsx
 * Reusable magnetic button — wraps any children.
 * On desktop, content is pulled toward cursor on hover.
 * Usage: <MagneticButton strength={0.4}><button>...</button></MagneticButton>
 */
import { useRef, useCallback } from 'react';

const MagneticButton = ({ children, strength = 0.35, className = '', style = {} }) => {
  const wrapRef   = useRef(null);
  const innerRef  = useRef(null);

  const onMouseMove = useCallback((e) => {
    if (window.innerWidth < 1024) return;
    const el   = wrapRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;

    const rect    = el.getBoundingClientRect();
    const centerX = rect.left + rect.width  / 2;
    const centerY = rect.top  + rect.height / 2;
    const dx      = (e.clientX - centerX) * strength;
    const dy      = (e.clientY - centerY) * strength;

    inner.style.transform = `translate(${dx}px, ${dy}px)`;
    inner.style.transition = 'transform 0.15s ease';
  }, [strength]);

  const onMouseLeave = useCallback(() => {
    const inner = innerRef.current;
    if (!inner) return;
    inner.style.transform  = 'translate(0, 0)';
    inner.style.transition = 'transform 0.45s cubic-bezier(0.16,1,0.3,1)';
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`magnetic-btn ${className}`}
      style={{ display: 'inline-flex', ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div ref={innerRef} style={{ display: 'inline-flex' }}>
        {children}
      </div>
    </div>
  );
};

export default MagneticButton;