const mongoose = require('mongoose');
const config = require('../config');

const connectDatabase = async (options = {}) => {
  const { exitOnError = true } = options;

  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB connected');
      return mongoose.connection;
    }

    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    if (exitOnError) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDatabase;
