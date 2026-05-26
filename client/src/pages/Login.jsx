import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { loginUser } from '../api/authApi.js';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const Login = () => {
  const [form,     setForm]     = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data.user, data.token);
      toast.success(data.message || 'Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    paddingLeft: 42, paddingRight: 16,
    paddingTop: 13,  paddingBottom: 13,
    borderRadius: 12,
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const focusIn  = (e) => {
    e.target.style.borderColor = 'var(--violet)';
    e.target.style.boxShadow   = '0 0 0 4px rgba(124,58,237,0.1)';
  };
  const focusOut = (e) => {
    e.target.style.borderColor = 'var(--border)';
    e.target.style.boxShadow   = 'none';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px 16px',
      background: 'var(--bg)',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.08), transparent)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: 440,
          background: 'var(--surface)',
          border: '1px solid var(--border-2)',
          borderRadius: 24,
          padding: '40px 36px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.1)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--violet), #6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px var(--glow)',
          }}>
            <span style={{ color: '#fff', fontSize: 24 }}>✦</span>
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 900,
            color: 'var(--text)',
            letterSpacing: '-0.02em', marginBottom: 6,
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
            Login to your account
          </p>
        </div>

        <div style={{ height: 1, background: 'var(--border)', marginBottom: 28 }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <FiMail size={15} style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-3)', pointerEvents: 'none',
              }} />
              <input
                type="email" name="email"
                value={form.email} onChange={handleChange}
                required placeholder="you@example.com"
                style={inputStyle}
                onFocus={focusIn} onBlur={focusOut}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <FiLock size={15} style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-3)', pointerEvents: 'none',
              }} />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password} onChange={handleChange}
                required placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={focusIn} onBlur={focusOut}
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: 'var(--text-3)', cursor: 'pointer',
                  padding: 0, display: 'flex',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; }}
              >
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%',
              padding: '14px 24px', borderRadius: 14,
              background: 'linear-gradient(135deg, var(--violet), #6d28d9)',
              color: '#ffffff',
              fontSize: 15, fontWeight: 700,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.65 : 1,
              boxShadow: loading ? 'none' : '0 8px 24px var(--glow)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
              marginTop: 4, fontFamily: 'inherit',
              transition: 'opacity 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            {loading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-block', fontSize: 16 }}
                >⟳</motion.span>
                Logging in…
              </>
            ) : (
              <> Login <FiArrowRight size={16} /> </>
            )}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-3)' }}>
          Don't have an account?{' '}
          <Link to="/register"
            style={{ color: 'var(--violet)', fontWeight: 700, textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--violet-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--violet)'; }}
          >
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;