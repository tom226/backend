function authenticateAdmin(req, res, next) {
  const token = req.headers['admin-token'] || req.headers['x-admin-token'];
  const adminToken = process.env.ADMIN_TOKEN || 'nurserygreen-admin-secret';
  if (!token || token !== adminToken) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { authenticateAdmin };
