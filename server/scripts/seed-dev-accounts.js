const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const config = require('../config');
const { User } = require('../models');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const allowedDatabaseNames = ['konpuk_dev', 'konpuk_local'];
const productionIndicators = ['prod', 'production', 'live', 'stage', 'staging'];

const parseDatabaseName = (uri) => {
  try {
    const parsed = new URL(uri);
    const name = parsed.pathname || '';
    return name.startsWith('/') ? name.slice(1) : name;
  } catch (err) {
    const match = uri.match(/\/([a-zA-Z0-9_-]+)(?:\?|$)/);
    return match ? match[1] : '';
  }
};

const hasProductionIndicator = (value) => {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return productionIndicators.some((indicator) => normalized.includes(indicator));
};

const requireDevelopmentEnvironment = () => {
  const nodeEnv = (process.env.NODE_ENV || '').trim().toLowerCase();
  const devSeedEnabled = process.env.DEV_SEED === 'true';
  const ciDetected = ['1', 'true', 'yes'].includes((process.env.CI || '').trim().toLowerCase());
  const mongoUri = process.env.MONGODB_URI || config.mongoUri;
  const dbName = parseDatabaseName(mongoUri);

  if (ciDetected) {
    console.error('Seed aborted: CI environment detected. Seed commands are disabled in CI/CD.');
    process.exit(1);
  }

  if (hasProductionIndicator(process.env.NODE_ENV) || hasProductionIndicator(mongoUri)) {
    console.error('Seed aborted: production indicator detected. Refusing to run on production-like environments.');
    process.exit(1);
  }

  if (nodeEnv !== 'development') {
    console.error(`Seed aborted: NODE_ENV=${process.env.NODE_ENV || '<unset>'}. Seed commands require NODE_ENV=development.`);
    process.exit(1);
  }

  if (!devSeedEnabled) {
    console.error('Seed aborted: DEV_SEED is not enabled. Set DEV_SEED=true in your environment to run this script.');
    process.exit(1);
  }

  if (!allowedDatabaseNames.includes(dbName)) {
    console.error(`Seed aborted: database name '${dbName || '<unknown>'}' is not allowed.`);
    console.error(`Allowed database names: ${allowedDatabaseNames.join(', ')}`);
    process.exit(1);
  }
};

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || config.mongoUri;
  if (!mongoUri) {
    console.error('MONGODB_URI is required to run the dev seed script.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const createOrUpdateUser = async ({ email, password, role, displayName, extra = {} }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.findOne({ email: normalizedEmail });

  const baseData = {
    email: normalizedEmail,
    passwordHash,
    displayName,
    role,
    emailVerified: true,
    isActive: true,
    phoneVerified: true,
    verified: true,
    ...extra
  };

  if (user) {
    Object.assign(user, baseData);
    await user.save();
    return { existing: true, email: normalizedEmail };
  }

  await User.create(baseData);
  return { existing: false, email: normalizedEmail };
};

const askForConfirmation = async ({ dbName, seedCount, nodeEnv, devSeed }) => {
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('Development seed confirmation:');
  console.log(`  Database Name: ${dbName}`);
  console.log(`  Seed Count: ${seedCount}`);
  console.log(`  Environment: NODE_ENV=${nodeEnv}, DEV_SEED=${devSeed}`);
  console.log('');

  const answer = await new Promise((resolve) => {
    rl.question('Type YES to confirm seeding this database: ', resolve);
  });

  rl.close();
  return answer.trim() === 'YES';
};

const run = async () => {
  requireDevelopmentEnvironment();
  await connectDatabase();

  const mongoUri = process.env.MONGODB_URI || config.mongoUri;
  const dbName = parseDatabaseName(mongoUri);
  const accounts = [
    {
      email: 'dev-admin@example.com',
      password: 'AdminPass123!',
      role: 'admin',
      displayName: 'Dev Admin'
    },
    {
      email: 'dev-seller@example.com',
      password: 'SellerPass123!',
      role: 'seller',
      displayName: 'Dev Seller',
      extra: {
        sellerVerificationStatus: 'verified'
      }
    },
    {
      email: 'dev-buyer@example.com',
      password: 'BuyerPass123!',
      role: 'user',
      displayName: 'Dev Buyer'
    }
  ];

  const confirmed = await askForConfirmation({
    dbName,
    seedCount: accounts.length,
    nodeEnv: process.env.NODE_ENV || '<unset>',
    devSeed: process.env.DEV_SEED || '<unset>'
  });

  if (!confirmed) {
    console.error('Seed aborted: confirmation not received.');
    process.exit(1);
  }

  console.log('Seeding development accounts...');

  for (const account of accounts) {
    const result = await createOrUpdateUser(account);
    console.log(`${result.existing ? 'Updated' : 'Created'} ${account.role} account: ${result.email}`);
  }

  console.log('\nDevelopment seed completed. Credentials:');
  console.log('  Admin:  dev-admin@example.com / AdminPass123!');
  console.log('  Seller: dev-seller@example.com / SellerPass123!');
  console.log('  Buyer:  dev-buyer@example.com / BuyerPass123!');
  console.log('\nAll accounts are active and emailVerified=true.');
  console.log('Run this command only in development with NODE_ENV=development and DEV_SEED=true.');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error('Dev seed failed:', error.message || error);
  process.exit(1);
});
