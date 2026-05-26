/**
 * ═══════════════════════════════════════════════════════════════
 *  PREMIUM HERO UPGRADE — BlogVerse
 *  Drop-in replacement for the Hero section in Home.jsx
 *
 *  INSTRUCTIONS:
 *  1. Replace the ShaderCanvas component with the new one below.
 *  2. Replace the CustomCursor component with the refined one below.
 *  3. Replace the Hero <section> block (everything between
 *     "HERO" and "STATS" comments) with the new HeroSection below.
 *  4. Add the HERO_STYLES string into the existing <style> tag
 *     in your Home component (or add a new <style> tag).
 *  5. All other code (fetchBlogs, stats, grid, CTA) stays IDENTICAL.
 *
 *  NOTHING ELSE CHANGES. Zero API/logic/routing modifications.
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import { FiZap, FiArrowDown } from 'react-icons/fi';

/* ─────────────────────────────────────────────────────────────
   STEP 1 — ADD THESE STYLES to your existing <style> tag
   inside the Home component (merge with existing styles)
───────────────────────────────────────────────────────────── */
export const HERO_STYLES = `
  /* ── Editorial badge ── */
  .hero-rule {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent);
  }
  .dark-hero .hero-rule {
    background: linear-gradient(90deg, transparent, rgba(167,139,250,0.35), transparent);
  }

  /* ── Headline gradient ── */
  .hero-gradient-word {
    background: linear-gradient(110deg, #a78bfa 0%, #7c3aed 30%, #38bdf8 65%, #06b6d4 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    display: block;
  }

  /* ── Magnetic button glow pulse ── */
  @keyframes cta-glow {
    0%, 100% { box-shadow: 0 8px 32px rgba(124,58,237,0.45), 0 0 0 0 rgba(124,58,237,0); }
    50%       { box-shadow: 0 12px 48px rgba(124,58,237,0.7), 0 0 0 8px rgba(124,58,237,0.08); }
  }
  .hero-cta-primary {
    animation: cta-glow 3s ease-in-out infinite;
  }
  .hero-cta-primary:hover {
    animation: none;
    box-shadow: 0 16px 56px rgba(124,58,237,0.75), 0 0 0 4px rgba(124,58,237,0.15) !important;
  }

  /* ── Ambient particle orbs ── */
  @keyframes orb-float-1 {
    0%, 100% { transform: translate(0px, 0px) scale(1); }
    33%       { transform: translate(18px, -22px) scale(1.04); }
    66%       { transform: translate(-12px, 14px) scale(0.97); }
  }
  @keyframes orb-float-2 {
    0%, 100% { transform: translate(0px, 0px) scale(1); }
    40%       { transform: translate(-20px, 16px) scale(1.06); }
    75%       { transform: translate(14px, -10px) scale(0.95); }
  }
  @keyframes orb-float-3 {
    0%, 100% { transform: translate(0px, 0px); }
    50%       { transform: translate(10px, -18px); }
  }
  .orb-1 { animation: orb-float-1 14s ease-in-out infinite; }
  .orb-2 { animation: orb-float-2 18s ease-in-out infinite; }
  .orb-3 { animation: orb-float-3 11s ease-in-out infinite; }

  /* ── Grid overlay ── */
  .hero-grid {
    background-image:
      linear-gradient(rgba(124,58,237,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,58,237,0.07) 1px, transparent 1px);
    background-size: 80px 80px;
    mask-image: radial-gradient(ellipse 70% 50% at 50% 40%, black 20%, transparent 80%);
    -webkit-mask-image: radial-gradient(ellipse 70% 50% at 50% 40%, black 20%, transparent 80%);
  }

  /* ── Scroll ring ── */
  @keyframes ring-pulse {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(1.9); opacity: 0; }
  }
  .scroll-ring-pulse {
    animation: ring-pulse 2.2s ease-out infinite;
  }

  /* ── Word reveal clip ── */
  .word-wrap { overflow: hidden; display: inline-block; }

  /* ── Light-mode hero softens the shader ── */
  .light-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
      rgba(250,250,249,0.88) 0%,
      rgba(245,243,255,0.72) 40%,
      rgba(235,248,255,0.65) 100%
    );
    pointer-events: none;
    z-index: 1;
  }

  /* ── Floating data badge ── */
  .hero-data-badge {
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
  }

  /* ── Noise micro-texture on CTA primary ── */
  .hero-cta-primary::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='80' height='80' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
    pointer-events: none;
    opacity: 0.18;
  }

  /* Social proof avatars */
  .avatar-stack .av { margin-left: -8px; }
  .avatar-stack .av:first-child { margin-left: 0; }
`;

/* ─────────────────────────────────────────────────────────────
   STEP 2 — REPLACE ShaderCanvas with this version
   (Adds darkMode prop so it adapts colors for light/dark theme)
───────────────────────────────────────────────────────────── */
export const ShaderCanvas = ({ heroRef, darkMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    let animId;
    let mouse  = { x: 0.5, y: 0.5 };
    let target = { x: 0.5, y: 0.5 };
    let prev   = { x: 0.5, y: 0.5 };
    let vel    = { x: 0,   y: 0 };
    let time   = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const hero = heroRef?.current;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1.0 - (e.clientY - r.top) / r.height;
    };
    hero?.addEventListener('mousemove', onMove);

    const vert = `attribute vec2 p; void main(){gl_Position=vec4(p,0,1);}`;

    const frag = `
      precision highp float;
      uniform vec2  u_res;
      uniform vec2  u_mouse;
      uniform vec2  u_vel;
      uniform float u_time;
      uniform float u_dark;

      vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
      vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
      vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
      float snoise(vec2 v){
        const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
        vec2 i=floor(v+dot(v,C.yy));
        vec2 x0=v-i+dot(i,C.xx);
        vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
        vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;
        i=mod289(i);
        vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
        vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
        m=m*m;m=m*m;
        vec3 x2=2.*fract(p*C.www)-1.;
        vec3 h=abs(x2)-.5;
        vec3 ox=floor(x2+.5);
        vec3 a0=x2-ox;
        m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
        vec3 g;
        g.x=a0.x*x0.x+h.x*x0.y;
        g.yz=a0.yz*x12.xz+h.yz*x12.yw;
        return 130.*dot(m,g);
      }

      void main(){
        vec2 uv=gl_FragCoord.xy/u_res;
        float t=u_time;
        float dark=u_dark;

        /* DARK mode: cinematic deep navy-violet */
        vec3 darkCol = vec3(.028,.024,.060);
        float n = snoise(uv*1.8+vec2(t*.02,t*.015))*.5+.5;
        /* aurora bloom — top-center */
        vec2 bloomPos = vec2(.50, .85);
        float bloomDist = distance(uv, bloomPos);
        float bloom = exp(-bloomDist*2.8)*0.15;
        darkCol += vec3(.22,.06,.48)*bloom;
        /* secondary bloom — bottom-right */
        vec2 bloom2 = vec2(.82,.15);
        float b2 = exp(-distance(uv,bloom2)*3.5)*0.07;
        darkCol += vec3(.04,.18,.38)*b2;
        /* corner darkness */
        float corner=(1.-uv.x)*(1.-uv.y);
        darkCol -= vec3(.015,.012,.025)*corner*1.2;
        /* mouse ripple */
        float dist=distance(uv,u_mouse);
        float speed=length(u_vel);
        float ripple=sin(dist*38.-t*3.)*exp(-dist*7.)*speed*0.09;
        darkCol += vec3(.28,.10,.58)*ripple;
        /* drift */
        float drift=snoise(uv*2.+vec2(t*.01,t*.008))*.005;
        darkCol += vec3(.10,.05,.22)*drift;
        /* vignette */
        float vig=1.-smoothstep(.45,1.25,distance(uv,vec2(.5,.5))*1.2);
        darkCol*=vig;
        /* grain */
        float grain=(fract(sin(dot(uv+t*.0005,vec2(127.1,311.7)))*43758.5)-.5)*.011;
        darkCol+=grain;

        /* LIGHT mode: editorial cream with violet blush */
        vec3 lightCol = vec3(.980,.978,.972); /* warm cream base */
        /* subtle violet aurora — top-left */
        vec2 lb1 = vec2(.20, .80);
        float ld1 = distance(uv, lb1);
        float lBloom = exp(-ld1*2.2)*0.08;
        lightCol -= vec3(.0,.0,.02)*lBloom;
        lightCol += vec3(.03,.01,.12)*lBloom;
        /* cyan hint — right */
        vec2 lb2 = vec2(.85, .65);
        float ld2 = distance(uv, lb2);
        lightCol += vec3(.0,.03,.05)*exp(-ld2*3.0)*0.05;
        /* mouse ripple — very gentle */
        float lRipple=sin(dist*30.-t*2.5)*exp(-dist*8.)*speed*0.025;
        lightCol -= vec3(.01,.01,.03)*lRipple;
        /* subtle grain */
        float lGrain=(fract(sin(dot(uv+t*.0003,vec2(92.3,289.4)))*38421.3)-.5)*.006;
        lightCol+=lGrain;
        /* gentle vignette */
        float lVig=1.-smoothstep(.55,1.3,distance(uv,vec2(.5,.5))*0.9)*0.18;
        lightCol*=lVig;

        vec3 col = mix(lightCol, darkCol, dark);
        gl_FragColor=vec4(clamp(col,0.,1.),1.);
      }
    `;

    const mkShader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const aP = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(aP);
    gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);

    const uRes   = gl.getUniformLocation(prog, 'u_res');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uVel   = gl.getUniformLocation(prog, 'u_vel');
    const uTime  = gl.getUniformLocation(prog, 'u_time');
    const uDark  = gl.getUniformLocation(prog, 'u_dark');

    const lerp = (a, b, f) => a + (b - a) * f;

    const draw = () => {
      time += 0.007;
      mouse.x = lerp(mouse.x, target.x, 0.06);
      mouse.y = lerp(mouse.y, target.y, 0.06);
      vel.x = mouse.x - prev.x;
      vel.y = mouse.y - prev.y;
      prev.x = mouse.x;
      prev.y = mouse.y;

      gl.uniform2f(uRes,   canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform2f(uVel,   vel.x, vel.y);
      gl.uniform1f(uTime,  time);
      gl.uniform1f(uDark,  darkMode ? 1.0 : 0.0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      hero?.removeEventListener('mousemove', onMove);
    };
  }, [darkMode]); /* Re-run when theme switches */

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0, display: 'block' }}
    />
  );
};

/* ─────────────────────────────────────────────────────────────
   STEP 3 — REPLACE CustomCursor with this refined version
───────────────────────────────────────────────────────────── */
export const CustomCursor = ({ darkMode }) => {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const pos     = useRef({ x: -200, y: -200 });
  const lag     = useRef({ x: -200, y: -200 });
  const hover   = useRef(false);
  const clicking = useRef(false);

  useEffect(() => {
    document.body.style.cursor = 'none';

    const onMove = (e) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const onOver = (e) => { if (e.target.closest('a,button,[role=button]')) hover.current = true; };
    const onOut  = (e) => { if (e.target.closest('a,button,[role=button]')) hover.current = false; };
    const onDown = () => { clicking.current = true; };
    const onUp   = () => { clicking.current = false; };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);

    let raf;
    const tick = () => {
      lag.current.x += (pos.current.x - lag.current.x) * 0.09;
      lag.current.y += (pos.current.y - lag.current.y) * 0.09;

      if (dotRef.current) {
        const s = clicking.current ? 0.5 : hover.current ? 1.6 : 1;
        dotRef.current.style.transform =
          `translate(${pos.current.x - 4}px,${pos.current.y - 4}px) scale(${s})`;
      }
      if (ringRef.current) {
        const s = clicking.current ? 0.7 : hover.current ? 2.2 : 1;
        ringRef.current.style.transform =
          `translate(${lag.current.x - 20}px,${lag.current.y - 20}px) scale(${s})`;
        ringRef.current.style.borderColor = hover.current
          ? 'rgba(124,58,237,0.8)'
          : darkMode
            ? 'rgba(124,58,237,0.4)'
            : 'rgba(124,58,237,0.55)';
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      document.body.style.cursor = '';
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
    };
  }, [darkMode]);

  return (
    <>
      {/* Dot */}
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 99999,
        width: 8, height: 8, borderRadius: '50%',
        background: '#7c3aed',
        pointerEvents: 'none',
        boxShadow: '0 0 8px rgba(124,58,237,0.9)',
        transition: 'transform 0.12s cubic-bezier(0.16,1,0.3,1), opacity 0.2s',
        mixBlendMode: darkMode ? 'screen' : 'multiply',
      }} />
      {/* Ring */}
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 99998,
        width: 40, height: 40, borderRadius: '50%',
        border: '1.5px solid rgba(124,58,237,0.4)',
        pointerEvents: 'none',
        transition: 'transform 0.55s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease',
      }} />
    </>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAGNETIC BUTTON HOOK
   Attach to any button for subtle magnetic pull effect
───────────────────────────────────────────────────────────── */
const useMagnetic = (strength = 0.35) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    const onLeave = () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1)';
    };
    const onEnter = () => {
      el.style.transition = 'transform 0.2s ease';
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mouseenter', onEnter);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mouseenter', onEnter);
    };
  }, [strength]);

  return ref;
};

/* ─────────────────────────────────────────────────────────────
   AMBIENT PARTICLE SYSTEM — lightweight CSS-driven
───────────────────────────────────────────────────────────── */
const AmbientParticles = ({ darkMode }) => {
  const particles = [
    { size: 3, top: '18%', left: '12%', delay: 0,    dur: 14, cls: 'orb-1', opacity: darkMode ? 0.55 : 0.25 },
    { size: 2, top: '72%', left: '8%',  delay: 2.5,  dur: 18, cls: 'orb-2', opacity: darkMode ? 0.45 : 0.20 },
    { size: 4, top: '28%', left: '88%', delay: 1.2,  dur: 12, cls: 'orb-1', opacity: darkMode ? 0.50 : 0.22 },
    { size: 2, top: '60%', left: '82%', delay: 3.8,  dur: 16, cls: 'orb-3', opacity: darkMode ? 0.40 : 0.18 },
    { size: 3, top: '45%', left: '5%',  delay: 6,    dur: 20, cls: 'orb-2', opacity: darkMode ? 0.35 : 0.15 },
    { size: 2, top: '15%', left: '52%', delay: 4.5,  dur: 13, cls: 'orb-3', opacity: darkMode ? 0.50 : 0.20 },
    { size: 5, top: '80%', left: '55%', delay: 1.8,  dur: 22, cls: 'orb-1', opacity: darkMode ? 0.30 : 0.12 },
    { size: 2, top: '35%', left: '70%', delay: 7,    dur: 15, cls: 'orb-2', opacity: darkMode ? 0.45 : 0.18 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
      {particles.map((p, i) => (
        <div
          key={i}
          className={p.cls}
          style={{
            position: 'absolute',
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: i % 2 === 0
              ? `rgba(124,58,237,${p.opacity})`
              : `rgba(6,182,212,${p.opacity})`,
            boxShadow: darkMode
              ? `0 0 ${p.size * 4}px rgba(124,58,237,${p.opacity * 0.8})`
              : `0 0 ${p.size * 3}px rgba(124,58,237,${p.opacity * 0.5})`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   STEP 4 — REPLACE the entire Hero <section> with this
   (paste between your "HERO" and "STATS" comments)
───────────────────────────────────────────────────────────── */
export const HeroSection = ({ heroRef, scrollY, darkMode, user, pagination }) => {
  /* Scroll parallax — same values as original */
  const heroOpa = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY   = useTransform(scrollY, [0, 500], [0, 60]);

  /* Smooth springs for parallax layers */
  const layer1Y = useTransform(scrollY, [0, 600], [0, -40]);
  const layer2Y = useTransform(scrollY, [0, 600], [0, -80]);

  /* Magnetic button refs */
  const primaryMag   = useMagnetic(0.28);
  const secondaryMag = useMagnetic(0.22);

  /* Staggered headline word reveals */
  const wordVariants = {
    hidden: { y: '110%', opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.5 + i * 0.13,
        duration: 1.0,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  /* Container fade */
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  /* Badge + subtitle reveals */
  const fadeUp = (delay) => ({
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1, y: 0,
      transition: { delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  });

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden"
      style={{ height: '100dvh', minHeight: 640 }}
    >
      {/* ── WebGL Shader Background (theme-aware) ── */}
      <ShaderCanvas heroRef={heroRef} darkMode={darkMode} />

      {/* ── Grid overlay ── */}
      <div className="hero-grid absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />

      {/* ── Ambient orb blobs (CSS-animated) ── */}
      <motion.div style={{ y: layer1Y }} className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        {/* Large aurora blobs */}
        <div className="orb-1" style={{
          position: 'absolute',
          top: '15%', right: '-5%',
          width: 420, height: 420,
          borderRadius: '50%',
          background: darkMode
            ? 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />
        <div className="orb-2" style={{
          position: 'absolute',
          bottom: '20%', left: '-8%',
          width: 360, height: 360,
          borderRadius: '50%',
          background: darkMode
            ? 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }} />
      </motion.div>

      {/* ── Fine ambient particles ── */}
      <AmbientParticles darkMode={darkMode} />

      {/* ── Bottom fade to page bg ── */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: 220,
          background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)',
          zIndex: 4,
        }}
      />

      {/* ══════════════════════════════════════
          HERO CONTENT — Editorial left-anchored
          on large screens, centered on mobile
      ══════════════════════════════════════ */}
      <motion.div
        style={{ opacity: heroOpa, y: heroY, zIndex: 10 }}
        className="absolute inset-0 flex flex-col justify-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{
          opacity: heroOpa,
          y: heroY,
          zIndex: 10,
          paddingTop: 72, /* navbar clearance */
          paddingLeft: 'clamp(24px, 7vw, 96px)',
          paddingRight: 'clamp(24px, 7vw, 96px)',
        }}
      >
        {/* ── BADGE — editorial eyebrow ── */}
        <motion.div
          variants={fadeUp(0.3)}
          className="flex items-center gap-3 mb-7"
          style={{ maxWidth: 320 }}
        >
          <span className="hero-rule" />
          <span style={{
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: '0.28em',
            color: darkMode ? 'rgba(167,139,250,0.65)' : 'rgba(124,58,237,0.65)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            The Art of Storytelling
          </span>
          <span className="hero-rule" />
        </motion.div>

        {/* ── HEADLINE STACK — responsive, proportional ── */}
        <motion.div style={{ y: layer2Y, marginBottom: 28 }}>

          {/* DISCOVER */}
          <div className="word-wrap">
            <motion.div
              custom={0}
              variants={wordVariants}
            >
              <span
                className="font-display block"
                style={{
                  fontSize: 'clamp(3.2rem, 8.5vw, 7.8rem)',
                  fontWeight: 900,
                  letterSpacing: '0.01em',
                  lineHeight: 0.95,
                  color: darkMode ? '#ffffff' : '#0c0c0e',
                  userSelect: 'none',
                }}
              >
                DISCOVER
              </span>
            </motion.div>
          </div>

          {/* EXTRAORDINARY — gradient */}
          <div className="word-wrap">
            <motion.div custom={1} variants={wordVariants}>
              <span
                className="hero-gradient-word font-display"
                style={{
                  fontSize: 'clamp(2.1rem, 6.0vw, 5.6rem)',
                  fontWeight: 900,
                  letterSpacing: '0.01em',
                  lineHeight: 1.05,
                  userSelect: 'none',
                }}
              >
                EXTRAORDINARY
              </span>
            </motion.div>
          </div>

          {/* STORIES — muted */}
          <div className="word-wrap">
            <motion.div custom={2} variants={wordVariants}>
              <span
                className="font-display block"
                style={{
                  fontSize: 'clamp(2.8rem, 7.8vw, 7.2rem)',
                  fontWeight: 900,
                  letterSpacing: '0.01em',
                  lineHeight: 0.95,
                  color: darkMode ? 'rgba(255,255,255,0.22)' : 'rgba(12,12,14,0.18)',
                  userSelect: 'none',
                }}
              >
                STORIES
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* ── SUBTITLE ── */}
        <motion.p
          variants={fadeUp(1.05)}
          style={{
            fontSize: 'clamp(13px, 1.4vw, 16px)',
            color: darkMode ? 'rgba(255,255,255,0.50)' : 'rgba(12,12,14,0.52)',
            maxWidth: 400,
            lineHeight: 1.8,
            marginBottom: 36,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          A cinematic universe where ideas come alive. Read, write,
          and connect with visionary minds across the globe.
        </motion.p>

        {/* ── CTA BUTTONS — magnetic ── */}
        <motion.div
          variants={fadeUp(1.18)}
          className="flex gap-3 flex-wrap mb-12"
          style={{ alignItems: 'center' }}
        >
          {/* Primary CTA — magnetic */}
          <div ref={primaryMag} style={{ display: 'inline-flex' }}>
            <Link to={user ? '/create-blog' : '/register'} style={{ textDecoration: 'none' }}>
              <button
                className="hero-cta-primary"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 28px',
                  borderRadius: 14,
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {/* Shimmer sweep */}
                <motion.div
                  animate={{ x: ['-120%', '240%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
                  style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
                    transform: 'skewX(-18deg)',
                  }}
                />
                <FiZap size={14} />
                {user ? 'Write a Story' : 'Get Started — Free'}
              </button>
            </Link>
          </div>

          {/* Secondary CTA — magnetic */}
          <div ref={secondaryMag} style={{ display: 'inline-flex' }}>
            <button
              onClick={() =>
                document.getElementById('stories-section')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 26px',
                borderRadius: 14,
                fontSize: 13.5,
                fontWeight: 600,
                background: darkMode
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(12,12,14,0.04)',
                border: darkMode
                  ? '1px solid rgba(255,255,255,0.13)'
                  : '1px solid rgba(12,12,14,0.13)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: darkMode ? 'rgba(255,255,255,0.72)' : 'rgba(12,12,14,0.70)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'border-color 0.25s ease, color 0.25s ease, background 0.25s ease',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.45)';
                e.currentTarget.style.color = darkMode ? 'rgba(255,255,255,0.9)' : 'rgba(12,12,14,0.9)';
                e.currentTarget.style.background = darkMode
                  ? 'rgba(124,58,237,0.08)'
                  : 'rgba(124,58,237,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = darkMode
                  ? 'rgba(255,255,255,0.13)'
                  : 'rgba(12,12,14,0.13)';
                e.currentTarget.style.color = darkMode
                  ? 'rgba(255,255,255,0.72)'
                  : 'rgba(12,12,14,0.70)';
                e.currentTarget.style.background = darkMode
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(12,12,14,0.04)';
              }}
            >
              Explore
              <FiArrowDown size={14} />
            </button>
          </div>
        </motion.div>

        {/* ── SOCIAL PROOF — compact data badges ── */}
        <motion.div
          variants={fadeUp(1.35)}
          className="flex items-center flex-wrap gap-2"
        >
          {/* Writers badge */}
          <div
            className="hero-data-badge flex items-center gap-2.5"
            style={{
              padding: '8px 14px',
              borderRadius: 12,
              background: darkMode
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.75)',
              border: darkMode
                ? '1px solid rgba(255,255,255,0.09)'
                : '1px solid rgba(0,0,0,0.07)',
            }}
          >
            {/* Avatar stack */}
            <div className="avatar-stack flex">
              {['#7c3aed', '#06b6d4', '#d4a853', '#6d28d9'].map((c, i) => (
                <div
                  key={i}
                  className="av w-6 h-6 rounded-full border-2 flex items-center justify-center text-white font-bold"
                  style={{
                    background: c,
                    borderColor: darkMode ? 'rgba(8,8,16,0.8)' : 'rgba(255,255,255,0.9)',
                    fontSize: 9,
                    flexShrink: 0,
                  }}
                >
                  {['A', 'B', 'C', 'D'][i]}
                </div>
              ))}
            </div>
            <div>
              <p style={{
                fontSize: 12, fontWeight: 700, lineHeight: 1.2,
                color: darkMode ? 'rgba(255,255,255,0.85)' : 'rgba(12,12,14,0.85)',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>500+ Writers</p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: '#d4a853', fontSize: 8 }}>★</span>
                ))}
              </div>
            </div>
          </div>

          {/* Separator */}
          <div style={{
            width: 1, height: 28,
            background: darkMode ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)',
          }} />

          {/* Stories badge */}
          <div
            className="hero-data-badge"
            style={{
              padding: '8px 14px',
              borderRadius: 12,
              background: darkMode
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.75)',
              border: darkMode
                ? '1px solid rgba(255,255,255,0.09)'
                : '1px solid rgba(0,0,0,0.07)',
            }}
          >
            <p style={{
              fontSize: 12, fontWeight: 700, lineHeight: 1.2,
              color: darkMode ? 'rgba(255,255,255,0.85)' : 'rgba(12,12,14,0.85)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              {pagination?.totalBlogs || '1,000'}+ Stories
            </p>
            <p style={{
              fontSize: 10.5,
              color: darkMode ? 'rgba(255,255,255,0.35)' : 'rgba(12,12,14,0.40)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>Published this month</p>
          </div>

          {/* Separator */}
          <div style={{
            width: 1, height: 28,
            background: darkMode ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)',
          }} />

          {/* Free badge */}
          <div
            className="hero-data-badge"
            style={{
              padding: '8px 14px',
              borderRadius: 12,
              background: darkMode
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.75)',
              border: darkMode
                ? '1px solid rgba(255,255,255,0.09)'
                : '1px solid rgba(0,0,0,0.07)',
            }}
          >
            <p style={{
              fontSize: 12, fontWeight: 700, lineHeight: 1.2,
              color: darkMode ? 'rgba(255,255,255,0.85)' : 'rgba(12,12,14,0.85)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>Zero paywalls</p>
            <p style={{
              fontSize: 10.5,
              color: darkMode ? 'rgba(255,255,255,0.35)' : 'rgba(12,12,14,0.40)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>Always free to read</p>
          </div>
        </motion.div>
      </motion.div>

      {/* ── SCROLL INDICATOR — refined ring version ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ zIndex: 20 }}
      >
        <motion.p
          animate={{ opacity: [0.2, 0.55, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            fontSize: 8, letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: darkMode ? 'rgba(255,255,255,0.28)' : 'rgba(12,12,14,0.30)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          scroll
        </motion.p>
        {/* Ring with pulse */}
        <div style={{ position: 'relative', width: 22, height: 22 }}>
          <div
            className="scroll-ring-pulse"
            style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              border: '1px solid rgba(124,58,237,0.4)',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '1px solid rgba(124,58,237,0.25)',
          }} />
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: 4, left: '50%',
              width: 2, height: 5,
              marginLeft: -1,
              borderRadius: 2,
              background: 'linear-gradient(to bottom, #a78bfa, transparent)',
            }}
          />
        </div>
      </motion.div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────
   HOW TO WIRE THIS INTO HOME.jsx
   (Only the Hero section changes — all other sections identical)

   In your Home component:

   1. Remove the old ShaderCanvas, CustomCursor definitions from Home.jsx
   2. Import from this file:
      import {
        HeroSection, ShaderCanvas, CustomCursor, HERO_STYLES
      } from './HeroUpgrade';

   3. Replace the old <style> tag content with:
      <style>{`
        ${HERO_STYLES}
        .hero-badge-line { flex:1; height:1px; background:rgba(255,255,255,0.18); }
      `}</style>

   4. Replace the old Hero <section> block with:
      <HeroSection
        heroRef={heroRef}
        scrollY={scrollY}
        darkMode={darkMode}
        user={user}
        pagination={pagination}
      />

   5. Keep EVERYTHING else (stats, featured, grid, CTA) byte-for-byte.

   6. Remove the old custom cursor JSX from the render and replace with:
      <CustomCursor darkMode={darkMode} />
───────────────────────────────────────────────────────────── */