require('dotenv').config();
const { connectDB } = require('./src/config/db');
const { createApp } = require('./src/app');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  createApp().listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
})().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
