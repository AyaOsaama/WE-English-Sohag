const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Brute-force protection on credential endpoints (disabled under test).
const limiter = process.env.NODE_ENV === 'test'
  ? (_req, _res, next) => next()
  : rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many attempts, try again later' } });

router.post('/register', limiter, c.register);
router.post('/login', limiter, c.login);
router.post('/logout', protect, c.logout);
router.get('/me', protect, c.me);

module.exports = router;
