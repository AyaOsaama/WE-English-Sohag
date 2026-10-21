const router = require('express').Router();
const c = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');
const { staff, studentOnly } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/today', studentOnly, c.today);
router.post('/:id/start', studentOnly, c.start);
router.get('/', staff, c.listAll);
router.post('/', staff, c.create);
router.put('/:id', staff, c.update);
router.delete('/:id', staff, c.remove);

module.exports = router;
