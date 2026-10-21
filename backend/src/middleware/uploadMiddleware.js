const multer = require('multer');
const { ApiError } = require('../utils/ApiError');

const ALLOWED = ['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/x-m4a'];
const maxBytes = () => (Number(process.env.MAX_AUDIO_MB) || 10) * 1024 * 1024;

// Memory storage: the file is handed to storageService, which decides where it really lives.
const audioUpload = (req, res, next) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes(), files: 1 },
    fileFilter: (_req, file, cb) => {
      const type = (file.mimetype || '').split(';')[0].toLowerCase();
      if (!ALLOWED.includes(type)) return cb(new ApiError(400, 'Unsupported audio type'));
      cb(null, true);
    },
  }).single('audio')(req, res, next);

module.exports = { audioUpload, ALLOWED };
