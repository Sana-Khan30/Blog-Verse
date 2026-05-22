import jwt from 'jsonwebtoken';

// Yeh function user ki ID lekar signed JWT token return karta hai
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },           // Payload — token ke andar kya store karein
    process.env.JWT_SECRET,   // Secret key — tamper proof signature banata hai
    { expiresIn: process.env.JWT_EXPIRES_IN } // Token kab expire ho
  );
};

export default generateToken;