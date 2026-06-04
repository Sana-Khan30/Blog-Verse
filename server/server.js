import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import connectDB from './config/db.js';
import authRoutes    from './routes/authRoutes.js';
import blogRoutes    from './routes/blogRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import userRoutes    from './routes/userRoutes.js';
import uploadRoutes  from './routes/uploadRoutes.js';

connectDB();

const app = express();

// ── CORS — SABSE PEHLE, HAR CHEEZ SE PEHLE ──────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  // OPTIONS preflight — immediately respond karo
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',     authRoutes);
app.use('/api/blogs',    blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/upload',   uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🚀 Blog-Verse API is running!', status: 'OK' });
});

// 404 — CORS headers zaroor
app.use((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler — CORS headers zaroor
app.use((err, req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export default app;
