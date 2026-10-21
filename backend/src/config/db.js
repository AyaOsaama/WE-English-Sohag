const mongoose = require('mongoose');

async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);

  console.log('MongoDB connected');

  return mongoose.connection;
}

module.exports = { connectDB };