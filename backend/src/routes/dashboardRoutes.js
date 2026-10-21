const router = require('express').Router();
const c = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { studentOnly } = require('../middleware/roleMiddleware');

router.get('/', protect, studentOnly, c.get);

module.exports = router;
