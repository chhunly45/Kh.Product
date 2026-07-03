const fs = require('fs');
const path = require('path');

const requiredDocs = [
  'README.md',
  'CHANGELOG.md',
  'docs/RELEASE_NOTES.md',
  'docs/RELEASE_NOTES_v1.0.0-production.md',
  'docs/PROJECT_BIBLE.md',
  'docs/DESIGN_BIBLE.md',
  'docs/AI_ENGINEERING_BIBLE.md',
  'docs/DEPLOYMENT_GUIDE.md',
  'docs/ENVIRONMENT_GUIDE.md',
  'docs/ARCHITECTURE_OVERVIEW.md',
  'docs/REPOSITORY_STRUCTURE.md',
  'docs/API_OVERVIEW.md',
  'docs/DATABASE_OVERVIEW.md',
  'docs/DEVELOPER_SETUP_GUIDE.md',
  'docs/TROUBLESHOOTING_GUIDE.md',
  'docs/PRODUCTION_RELEASE_CHECKLIST.md'
];

const root = process.cwd();
const missing = requiredDocs.filter((doc) => !fs.existsSync(path.join(root, doc)));

if (missing.length > 0) {
  console.error('Missing required documentation files:');
  missing.forEach((doc) => console.error(`- ${doc}`));
  process.exit(1);
}

console.log('Documentation verification passed.');
