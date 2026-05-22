// Yeh middleware verifyToken KE BAAD lagta hai
// Pehle token verify hoga, phir role check hoga
const isAdmin = (req, res, next) => {
  // req.user verifyToken ne attach kiya tha
  if (req.user && req.user.role === 'admin') {
    next(); // Admin hai, aage jao
  } else {
    res.status(403).json({
      success: false,
      // 403 = Forbidden (identity pata hai, permission nahi)
      // 401 = Unauthorized (identity pata nahi)
      message: 'Access denied. Admin only.',
    });
  }
};

export default isAdmin;