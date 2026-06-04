const mongoose = require('mongoose');
const config = require('../config');
const { Product } = require('../models');

const repairProductTextIndex = async () => {
  const collection = Product.collection;
  const indexes = await collection.indexes();

  const invalidIndex = indexes.find((idx) => {
    const key = idx.key || {};
    return key.title === 'text' && key.description === 'text' && key.tags === 1;
  });

  if (invalidIndex) {
    await collection.dropIndex(invalidIndex.name);
    console.log(`Dropped invalid Product text index: ${invalidIndex.name}`);
  }

  const validIndex = indexes.find((idx) => {
    const key = idx.key || {};
    return key.title === 'text' && key.description === 'text' && !('tags' in key);
  });

  if (!validIndex) {
    await collection.createIndex(
      { title: 'text', description: 'text' },
      { name: 'ProductTextIndex', background: true }
    );
    console.log('Created valid Product text index on title and description.');
  }

  console.log('Product text index repaired');
};

const run = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }

  await repairProductTextIndex();

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  run().catch((error) => {
    console.error('Failed to repair product text index:', error);
    process.exit(1);
  });
}

module.exports = { repairProductTextIndex };
