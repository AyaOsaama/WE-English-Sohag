const router = require('express').Router();
const c = require('../controllers/announcementController');
const { protect } = require('../middleware/authMiddleware');
const { staff } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/', c.list);
router.post('/', staff, c.create);
router.put('/:id', staff, c.update);
router.delete('/:id', staff, c.remove);

module.exports = router;
