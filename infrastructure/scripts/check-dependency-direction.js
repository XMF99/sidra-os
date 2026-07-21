const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../');
let errors = [];

function checkCargoToml(filePath, forbiddenPrefixes) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const prefix of forbiddenPrefixes) {
    if (content.includes(`path = "${prefix}`) || content.includes(`path = '${prefix}`)) {
      errors.push(`Forbidden dependency path "${prefix}" found in ${path.relative(root, filePath)}`);
    }
  }
}

// 1. packages/domain must not depend on any service or app
checkCargoToml(path.join(root, 'packages/domain/Cargo.toml'), ['../../services', '../../apps', '../']);

// 2. services/* must not depend on apps/*
const servicesDir = path.join(root, 'services');
if (fs.existsSync(servicesDir)) {
  fs.readdirSync(servicesDir).forEach(service => {
    const cargoPath = path.join(servicesDir, service, 'Cargo.toml');
    checkCargoToml(cargoPath, ['../../apps', '../apps']);
  });
}

if (errors.length > 0) {
  console.error('Dependency direction violations found:');
  errors.forEach(err => console.error('  - ' + err));
  process.exit(1);
} else {
  console.log('Dependency direction check passed: packages/domain <- services/* <- apps/*');
}
