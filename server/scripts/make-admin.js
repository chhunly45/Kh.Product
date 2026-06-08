require('dotenv').config();
const connectDatabase = require('../config/database');
const { User } = require('../models');

const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
};

const printUsage = () => {
  console.log('Usage: npm run make:admin -- user@example.com');
};

const run = async () => {
  const emailArg = process.argv[2];
  const email = normalizeEmail(emailArg);

  if (!email) {
    printUsage();
    process.exit(1);
  }

  await connectDatabase();

  const user = await User.findOne({ email }).select('email role');
  if (!user) {
    console.error(`No user found for email: ${email}`);
    process.exit(1);
  }

  if (user.role === 'admin') {
    console.log(`User ${user.email} is already an admin.`);
    process.exit(0);
  }

  user.role = 'admin';
  await user.save();

  console.log(`Success: promoted ${user.email} to admin.`);
  process.exit(0);
};

run().catch((error) => {
  console.error('Failed to promote user to admin:', error.message);
  process.exit(1);
});
