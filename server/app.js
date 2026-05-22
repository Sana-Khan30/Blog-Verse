// server/app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Routers
// import authRoutes from './routes/authRoutes.js';
// import blogRoutes from './routes/blogRoutes.js';
// import commentRoutes from './routes/commentRoutes.js';
// import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'mern-blog-server' });
});

// TODO: mount routes
// app.use('/api/auth', authRoutes);
// app.use('/api/blogs', blogRoutes);
// app.use('/api/comments', commentRoutes);
// app.use('/api/users', userRoutes);

export default app;

