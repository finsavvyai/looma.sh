const fs = require('fs');
const path = require('path');

// Generate version info
const packageJson = require('../package.json');
const { execSync } = require('child_process');

function getVersionInfo() {
  try {
    // Get git commit hash
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();

    // Get current timestamp
    const buildDate = new Date().toISOString();

    // Extract version from package.json or increment based on commit
    const version = packageJson.version || '1.0.0';

    // Generate a build number based on date and short commit
    const shortCommit = commitHash.substring(0, 8);
    const buildNumber = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${shortCommit}`;

    return {
      version,
      buildNumber,
      commitHash,
      buildDate,
      environment: process.env.NODE_ENV || 'development'
    };
  } catch (error) {
    console.error('Error generating version info:', error);
    return {
      version: '1.0.0',
      buildNumber: 'dev',
      commitHash: 'unknown',
      buildDate: new Date().toISOString(),
      environment: 'development'
    };
  }
}

// Create .env.local with version info
function createVersionEnv() {
  const versionInfo = getVersionInfo();

  const envContent = `# Auto-generated version info
NEXT_PUBLIC_APP_VERSION=${versionInfo.version}
NEXT_PUBLIC_BUILD_NUMBER=${versionInfo.buildNumber}
NEXT_PUBLIC_COMMIT_HASH=${versionInfo.commitHash}
NEXT_PUBLIC_BUILD_DATE=${versionInfo.buildDate}
NEXT_PUBLIC_BUILD_ENVIRONMENT=${versionInfo.environment}
`;

  const envPath = path.join(__dirname, '../.env.local');
  fs.writeFileSync(envPath, envContent);

  console.log('✅ Version info generated:', {
    version: versionInfo.version,
    build: versionInfo.buildNumber,
    commit: versionInfo.commitHash.substring(0, 8),
    date: new Date(versionInfo.buildDate).toLocaleString()
  });

  return versionInfo;
}

// Export for use in build scripts
module.exports = { getVersionInfo, createVersionEnv };

// Run if called directly
if (require.main === module) {
  createVersionEnv();
}