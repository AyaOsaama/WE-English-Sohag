const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Storage abstraction. Speaking logic only calls save/read/remove, so swapping local disk for S3,
// GCS, etc. means adding another provider here and setting STORAGE_PROVIDER.
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

const EXT = { 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/m4a': 'm4a', 'audio/x-m4a': 'm4a' };

const localProvider = {
  name: 'local',
  async save(buffer, { ownerId, mimetype }) {
    const type = (mimetype || '').split(';')[0].toLowerCase();
    const key = `${ownerId}/${crypto.randomUUID()}.${EXT[type] || 'bin'}`;
    const full = path.join(UPLOAD_DIR, key);
    await fs.promises.mkdir(path.dirname(full), { recursive: true });
    await fs.promises.writeFile(full, buffer);
    return { key };
  },
  async read(key) {
    const full = path.join(UPLOAD_DIR, key);
    if (!full.startsWith(UPLOAD_DIR)) throw new Error('Invalid storage key'); // path traversal guard
    return fs.promises.readFile(full);
  },
  async remove(key) {
    await fs.promises.rm(path.join(UPLOAD_DIR, key), { force: true });
  },
};

const providers = { local: localProvider };
const active = () => providers[process.env.STORAGE_PROVIDER || 'local'] || localProvider;

module.exports = {
  save: (...a) => active().save(...a),
  read: (...a) => active().read(...a),
  remove: (...a) => active().remove(...a),
  contentTypeFor: (key) => ({ webm: 'audio/webm', ogg: 'audio/ogg', mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav' }[path.extname(key).slice(1)] || 'application/octet-stream'),
};
