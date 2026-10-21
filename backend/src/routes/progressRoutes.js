const router = require('express').Router();
const c = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');
const { studentOnly } = require('../middleware/roleMiddleware');

router.use(protect, studentOnly);
router.get('/', c.overview);
router.get('/skills', c.skills);
router.get('/courses', c.courses);
router.get('/activity', c.activity);

module.exports = router;
