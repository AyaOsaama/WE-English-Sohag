const router = require('express').Router();
const c = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { staff, adminOnly } = require('../middleware/roleMiddleware');

router.use(protect);
router.patch('/me', c.updateMe);
router.get('/', staff, c.list);
router.get('/:id/progress', staff, c.studentProgress);
router.post('/', adminOnly, c.create);
router.patch('/:id', adminOnly, c.update);
router.delete('/:id', adminOnly, c.deactivate);

module.exports = router;
