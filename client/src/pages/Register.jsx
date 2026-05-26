import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { registerUser } from '../api/authApi.js';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiZap } from 'react-icons/fi';

const Register = () => {
  const [form,     setForm]     = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      login(data.user, data.token);
      toast.success(data.message || 'Welcome aboard!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  /* shared input style */
  const inputStyle = {
    width: '100%',
    paddingLeft: 42,
    paddingRight: 16,
    paddingTop: 13,
    paddingBottom: 13,
    borderRadius: 12,
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-2)',
    marginBottom: 6,
  };

  const iconStyle = {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-3)',
    pointerEvents: 'none',
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        background: 'var(--bg)',
      }}
    >
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
        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--violet), #6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px var(--glow)',
          }}>
            <span style={{ color: '#fff', fontSize: 24 }}>✦</span>
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 900,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            marginBottom: 6,
          }}>
            Create Account
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
            Join our blogging community
          </p>
        </div>

        {/* Divider */}
        <div style={{
          height: 1, background: 'var(--border)',
          marginBottom: 28,
        }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Username */}
          <div>
            <label style={labelStyle}>Username</label>
            <div style={{ position: 'relative' }}>
              <FiUser size={15} style={iconStyle} />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="johndoe"
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={15} style={iconStyle} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={15} style={iconStyle} />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Min 6 characters"
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={focusIn}
                onBlur={focusOut}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
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
            {/* Password strength hint */}
            {form.password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ marginTop: 6 }}
              >
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 99,
                      background: form.password.length >= i * 3
                        ? i === 1 ? '#ef4444'
                          : i === 2 ? '#f59e0b'
                          : '#22c55e'
                        : 'var(--border)',
                      transition: 'background 0.3s ease',
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {form.password.length < 3 ? 'Too short'
                    : form.password.length < 6 ? 'Almost there'
                    : 'Good password ✓'}
                </p>
              </motion.div>
            )}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, var(--violet), #6d28d9)',
              color: '#ffffff',
              fontSize: 15,
              fontWeight: 700,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.65 : 1,
              boxShadow: loading ? 'none' : '0 8px 24px var(--glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'opacity 0.2s ease, box-shadow 0.2s ease',
              marginTop: 4,
              fontFamily: 'inherit',
            }}
          >
            {loading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'inline-block', fontSize: 16 }}
                >
                  ⟳
                </motion.span>
                Creating account…
              </>
            ) : (
              <>
                <FiZap size={16} />
                Create Account
              </>
            )}
          </motion.button>
        </form>

        {/* Footer link */}
        <p style={{
          textAlign: 'center',
          marginTop: 24,
          fontSize: 13,
          color: 'var(--text-3)',
        }}>
          Already have an account?{' '}
          <Link to="/login"
            style={{
              color: 'var(--violet)',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--violet-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--violet)'; }}
          >
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;