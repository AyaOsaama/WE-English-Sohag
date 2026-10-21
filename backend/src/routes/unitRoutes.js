const router = require('express').Router();
const c = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { staff } = require('../middleware/roleMiddleware');

router.use(protect, staff);
router.post('/', c.createUnit);
router.put('/:id', c.updateUnit);
router.delete('/:id', c.removeUnit);

module.exports = router;
