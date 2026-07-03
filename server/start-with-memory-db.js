const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('./config');
const app = require('./app');
const { User } = require('./models');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log('[memory-server] starting in-memory MongoDB');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log('[memory-server] uri=', uri);
    process.env.MONGODB_URI = uri;
    process.env.NODE_ENV = 'development';

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('[memory-server] connected to in-memory MongoDB');

    const existing = await User.findOne({ email: 'test@example.com' });
    if (existing) {
      await User.deleteOne({ _id: existing._id });
    }

    const passwordHash = await bcrypt.hash('Password123!', 12);
    const user = await User.create({
      email: 'test@example.com',
      passwordHash,
      displayName: 'Test User',
      role: 'user',
      emailVerified: true,
      isActive: true
    });

    const token = jwt.sign({ userId: user._id.toString() }, config.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: '1h'
    });

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[memory-server] backend running on http://localhost:${PORT}`);
      console.log(`[memory-server] test auth token: ${token}`);
      console.log('[memory-server] user id:', user._id.toString());
    });

    // Prevent the process from exiting
    process.on('SIGINT', async () => {
      await mongoose.disconnect();
      await mongod.stop();
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error('[memory-server] failed to start', error);
    process.exit(1);
  }
})();
