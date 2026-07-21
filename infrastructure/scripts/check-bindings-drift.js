const { execSync } = require('child_process');

try {
  const status = execSync('git status --porcelain packages/bindings', { encoding: 'utf8' });
  if (status.trim().length > 0) {
    console.error('Error: packages/bindings has uncommitted or modified files!');
    console.error(status);
    console.error('packages/bindings is generated from Rust types via ts-rs. Manual edits are forbidden.');
    process.exit(1);
  }
  console.log('Bindings drift check passed: packages/bindings is clean.');
} catch (err) {
  console.error('Failed to run git status check for bindings drift:', err.message);
  process.exit(1);
}
