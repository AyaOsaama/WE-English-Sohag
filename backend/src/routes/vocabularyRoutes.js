const router = require('express').Router();
const c = require('../controllers/vocabularyController');
const { protect } = require('../middleware/authMiddleware');
const { staff, studentOnly } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/', c.list);
router.get('/queue', studentOnly, c.queue);
router.get('/summary', studentOnly, c.summary);
router.get('/:id', c.get);
router.post('/:id/answer', studentOnly, c.answer);
router.post('/', staff, c.create);
router.put('/:id', staff, c.update);
router.delete('/:id', staff, c.remove);

module.exports = router;
