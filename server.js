import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes    from './routes/authRoutes.js';
import blogRoutes    from './routes/blogRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import userRoutes    from './routes/userRoutes.js';
import uploadRoutes  from './routes/uploadRoutes.js';

connectDB();
const app = express();

// ── CORS ─────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://blog-verse-xslt.vercel.app',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/blogs',    blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/upload',   uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🚀 MERN Blog API is running!', status: 'OK' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export default app;
