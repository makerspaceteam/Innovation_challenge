// Must run after `authenticate` — relies on req.user.role from the JWT payload.
const requireLecturer = (req, res, next) => {
  if (req.user?.role !== 'lecturer') {
    return res.status(403).json({ success: false, message: 'Lecturer access required' });
  }
  next();
};

module.exports = requireLecturer;
