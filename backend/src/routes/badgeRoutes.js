const router = require('express').Router();
const c = require('../controllers/badgeController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/', c.list);
router.get('/mine', c.mine);
router.post('/', adminOnly, c.create);
router.put('/:id', adminOnly, c.update);
router.delete('/:id', adminOnly, c.remove);

module.exports = router;
