const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { studentOnly } = require('../middleware/roleMiddleware');

const limiter = process.env.NODE_ENV === 'test'
  ? (_req, _res, next) => next()
  : rateLimit({ windowMs: 60 * 1000, max: 20, message: { success: false, message: 'Slow down - too many AI requests' } });

router.use(protect, studentOnly);
router.post('/chat', limiter, c.chat);
router.get('/conversations', c.listConversations);
router.get('/conversations/:id', c.getConversation);
router.delete('/conversations/:id', c.removeConversation);

module.exports = router;
