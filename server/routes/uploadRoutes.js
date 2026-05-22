import express from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed!'), false);
    }
  },
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'mern-blog' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary stream error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image provided',
      });
    }

    console.log('File received:', req.file.originalname);
    const result = await uploadToCloudinary(req.file.buffer);
    console.log('✅ Upload success:', result.secure_url);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });

  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
});

export default router;