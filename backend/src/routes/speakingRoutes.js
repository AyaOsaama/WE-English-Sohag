const router = require('express').Router();
const c = require('../controllers/speakingController');
const { protect } = require('../middleware/authMiddleware');
const { staff, studentOnly } = require('../middleware/roleMiddleware');
const { audioUpload } = require('../middleware/uploadMiddleware');

router.use(protect);
router.get('/challenges', c.listChallenges);
router.post('/challenges', staff, c.createChallenge);
router.put('/challenges/:id', staff, c.updateChallenge);
router.delete('/challenges/:id', staff, c.removeChallenge);

router.post('/submissions', studentOnly, audioUpload, c.submit);
router.get('/submissions', c.listSubmissions);
router.get('/submissions/:id/audio', c.audio);

module.exports = router;
