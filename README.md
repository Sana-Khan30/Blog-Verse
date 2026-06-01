# ✍️ Blog-Verse

> A modern, full-stack blogging platform built with the MERN stack — where every voice becomes a story.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-blog--verse--xslt.vercel.app-7c3aed?style=for-the-badge&logo=vercel)](https://blog-verse-xslt.vercel.app)
[![Backend](https://img.shields.io/badge/API-blog--verse--theta.vercel.app-06b6d4?style=for-the-badge&logo=vercel)](https://blog-verse-theta.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-a78bfa?style=for-the-badge)](LICENSE)

---

## 📸 Preview

![Blog-Verse Hero](https://blog-verse-xslt.vercel.app/og-preview.png)

---

## ✨ Features

### 🖊️ Writing & Content
- Rich text editor for creating and editing blogs
- Cover image upload via **Cloudinary**
- Category & tag system (Technology, Design, Lifestyle, and more)
- Slug-based URLs for SEO-friendly blog links
- Reading time estimation

### 🎨 UI & Experience
- Cinematic editorial design with **Playfair Display** typography
- Animated hero section with typewriter effect
- Smooth scroll via **Lenis**
- Page transitions with **Framer Motion**
- GSAP scroll-triggered animations & counter stats
- Custom cursor with magnetic buttons
- Dark / Light mode toggle
- Marquee ticker strip
- Floating particle effects
- Reading progress bar on blog pages
- Text highlight tooltip (copy quote / tweet)
- Skeleton loading states

### 👤 Auth & User
- JWT-based authentication
- Register / Login / Logout
- Protected routes
- User profile & avatar
- Dashboard for managing your blogs

### 💬 Social & Engagement
- Like / Unlike blogs
- Bookmark / Save blogs
- Comment system
- View counter
- Share blog link
- Tweet selected quote

### 🔐 Admin
- Admin panel for managing all content
- Delete any blog or comment

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| Framer Motion | Page & element animations |
| GSAP + ScrollTrigger | Scroll animations |
| Lenis | Smooth scrolling |
| Axios | HTTP client |
| React Hot Toast | Notifications |
| React Icons | Icon library |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | Server & REST API |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Cloudinary | Image storage |
| Multer | File uploads |
| CORS | Cross-origin handling |

### Deployment
| Service | Usage |
|---------|-------|
| Vercel | Frontend & Backend hosting |
| MongoDB Atlas | Cloud database |
| Cloudinary | Image CDN |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+`
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the repo

```bash
git clone https://github.com/Sana-Khan30/Blog-Verse.git
cd Blog-Verse
```

### 2. Setup Backend

```bash
# Install server dependencies
npm install

# Create .env file in root
cp .env.example .env
```

Fill in your `.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

```bash
# Start backend
npm run dev
```

### 3. Setup Frontend

```bash
cd client

# Install dependencies
npm install

# Create .env file
touch .env
```

Fill in `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start frontend
npm run dev
```

App will be running at `http://localhost:5173` 🎉

---

## 📁 Project Structure

```
Blog-Verse/
├── server/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── blogController.js
│   │   ├── commentController.js
│   │   ├── userController.js
│   │   └── uploadController.js
│   ├── middleware/
│   │   └── verifyToken.js     # JWT auth middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Blog.js
│   │   └── Comment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── blogRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── userRoutes.js
│   │   └── uploadRoutes.js
│   └── server.js              # Express entry point
│
├── client/
│   ├── src/
│   │   ├── api/               # Axios API calls
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Auth & Theme context
│   │   ├── pages/             # Route pages
│   │   ├── routes/            # Protected route wrapper
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
├── vercel.json                # Vercel deployment config
└── package.json
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Blogs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blogs` | Get all blogs (with filters) |
| GET | `/api/blogs/:slug` | Get single blog |
| POST | `/api/blogs` | Create blog (protected) |
| PUT | `/api/blogs/:id` | Update blog (protected) |
| DELETE | `/api/blogs/:id` | Delete blog (protected) |
| PUT | `/api/blogs/:id/like` | Toggle like (protected) |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments/:blogId` | Get comments |
| POST | `/api/comments/:blogId` | Add comment (protected) |
| DELETE | `/api/comments/:id` | Delete comment (protected) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/bookmarks` | Get bookmarks (protected) |
| PUT | `/api/users/bookmark/:id` | Toggle bookmark (protected) |
| PUT | `/api/users/profile` | Update profile (protected) |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload image to Cloudinary |

---

## 🔧 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLIENT_URL=
```

### Frontend `client/.env`
```env
VITE_API_URL=
```

---

## 📦 Deployment on Vercel

### Backend
1. Import repo to Vercel
2. Set **Root Directory** to `/` 
3. Set **Build Command** to `npm install`
4. Set **Output Directory** to empty
5. Add all environment variables
6. Deploy

### Frontend
1. Import same repo (or separate)
2. Set **Root Directory** to `client`
3. Set `VITE_API_URL` environment variable
4. Deploy

---

## 🎯 Roadmap

- [ ] Email verification
- [ ] Follow / Unfollow authors
- [ ] Newsletter subscription
- [ ] Blog series / collections
- [ ] AI-powered writing suggestions
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/amazing-feature

# Commit changes
git commit -m "Add amazing feature"

# Push to branch
git push origin feature/amazing-feature

# Open a Pull Request
```

---

## 👩‍💻 Author

**Sana Khan**

[![GitHub](https://img.shields.io/badge/GitHub-Sana--Khan30-181717?style=flat&logo=github)](https://github.com/Sana-Khan30)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ and lots of ☕</p>
  <p>
    <a href="https://blog-verse-xslt.vercel.app">🌐 Live Demo</a> •
    <a href="https://github.com/Sana-Khan30/Blog-Verse/issues">🐛 Report Bug</a> •
    <a href="https://github.com/Sana-Khan30/Blog-Verse/issues">✨ Request Feature</a>
  </p>
</div>
