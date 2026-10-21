const router = require('express').Router();
const c = require('../controllers/xpController');
const { protect } = require('../middleware/authMiddleware');
const { studentOnly } = require('../middleware/roleMiddleware');

router.get('/', protect, studentOnly, c.mine);

module.exports = router;
