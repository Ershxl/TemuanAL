const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'simatap-umm-super-secret-key-2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token tidak valid atau kadaluarsa.' });
    }
    req.user = user;
    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    // Allow Asesor if Verifikator is allowed and vice versa
    const userRole = req.user.role;
    const allowed = roles.some(role => {
      if (role === 'Verifikator' && (userRole === 'Verifikator' || userRole === 'Asesor')) return true;
      if (role === 'Asesor' && (userRole === 'Verifikator' || userRole === 'Asesor')) return true;
      return role === userRole;
    });

    if (!allowed && userRole !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki hak akses untuk tindakan ini.' });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  JWT_SECRET
};
