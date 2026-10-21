const router = require('express').Router();
const c = require('../controllers/lessonController');
const { protect } = require('../middleware/authMiddleware');
const { staff, studentOnly } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/:id', c.get);
router.post('/:id/complete', studentOnly, c.complete);
router.post('/', staff, c.create);
router.put('/:id', staff, c.update);
router.delete('/:id', staff, c.remove);

module.exports = router;
