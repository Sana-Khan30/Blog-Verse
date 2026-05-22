import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// ─── REGISTER ─────────────────────────────────────
// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validation — sab fields hain?
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email and password',
      });
    }

    // 2. Email aur username already exist karta hai?
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? 'Email already registered'
            : 'Username already taken',
      });
    }

    // 3. User banao — password model ke pre-hook mein automatically hash hoga
    const user = await User.create({ username, email, password });

    // 4. Token generate karo
    const token = generateToken(user._id);

    // 5. Response bhejo — password exclude karo
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// ─── LOGIN ─────────────────────────────────────────
// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // 2. User dhundo — password bhi include karo (normally hidden hota hai)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        // Vague message — security ke liye exact info mat do
        message: 'Invalid email or password',
      });
    }

    // 3. Password compare karo — model ka method use karo
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 4. Token generate karo
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.username}!`,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// ─── GET CURRENT USER ──────────────────────────────
// GET /api/auth/me  (Protected)
export const getMe = async (req, res) => {
  try {
    // req.user verifyToken middleware ne attach kiya
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};