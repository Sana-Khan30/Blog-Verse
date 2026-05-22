// server/middleware/upload.js
import multer from 'multer';

// Placeholder multer storage; later you can switch to memoryStorage + Cloudinary.
const storage = multer.memoryStorage();

export const upload = multer({ storage });

