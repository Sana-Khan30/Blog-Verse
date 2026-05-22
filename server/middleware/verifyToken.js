import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const verifyToken = async (req, res, next) => {
  try {
    // 1. Header se token lo
    // Format: "Authorization: Bearer eyJhbGc..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // 2. "Bearer " hata ke sirf token lo
    const token = authHeader.split(' ')[1];

    // 3. Token verify karo secret key se
    // Agar token expire ya tampered hai toh error throw hoga
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Database se fresh user lo
    // select('+password') — password field normally hidden hota hai
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token invalid.',
      });
    }

    // 5. User ko request object pe attach karo
    // Ab kisi bhi controller mein req.user available hoga
    req.user = user;
    next(); // Agle middleware ya controller pe jao

  } catch (error) {
    // JWT specific errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error in auth middleware.',
    });
  }
};

export default verifyToken;