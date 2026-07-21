/**
 * Sidra OS SPDX SBOM Generator (Milestone 9)
 * Generates an SPDX 2.2 JSON Software Bill of Materials for release artifact supply chain verification.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const releaseDir = path.join(rootDir, 'infrastructure/release');

if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

console.log('📦 Generating SPDX 2.2 Software Bill of Materials (SBOM)...');

const sbom = {
  SPDXID: 'SPDXRef-DOCUMENT',
  spdxVersion: 'SPDX-2.2',
  creationInfo: {
    created: new Date().toISOString(),
    creators: ['Tool: Sidra-OS-SBOM-Generator-v1.0'],
  },
  name: 'Sidra-OS-Release-SBOM',
  dataLicense: 'CC0-1.0',
  documentNamespace: 'https://sidra.os/spdx/sbom-v1.0',
  packages: [
    {
      SPDXID: 'SPDXRef-Package-Sidra-OS-Domain',
      name: '@sidra/domain',
      versionInfo: '0.1.0',
      downloadLocation: 'NOASSERTION',
      licenseConcluded: 'Apache-2.0',
    },
    {
      SPDXID: 'SPDXRef-Package-Sidra-OS-Store',
      name: 'sidra-store',
      versionInfo: '0.1.0',
      downloadLocation: 'NOASSERTION',
      licenseConcluded: 'Apache-2.0',
    },
    {
      SPDXID: 'SPDXRef-Package-Sidra-OS-Security',
      name: 'sidra-security',
      versionInfo: '0.1.0',
      downloadLocation: 'NOASSERTION',
      licenseConcluded: 'Apache-2.0',
    },
    {
      SPDXID: 'SPDXRef-Package-Sidra-OS-Memory',
      name: 'sidra-memory',
      versionInfo: '0.1.0',
      downloadLocation: 'NOASSERTION',
      licenseConcluded: 'Apache-2.0',
    },
    {
      SPDXID: 'SPDXRef-Package-Sidra-OS-Models',
      name: 'sidra-models',
      versionInfo: '0.1.0',
      downloadLocation: 'NOASSERTION',
      licenseConcluded: 'Apache-2.0',
    },
    {
      SPDXID: 'SPDXRef-Package-Sidra-OS-Tools',
      name: 'sidra-tools',
      versionInfo: '0.1.0',
      downloadLocation: 'NOASSERTION',
      licenseConcluded: 'Apache-2.0',
    },
    {
      SPDXID: 'SPDXRef-Package-Sidra-OS-Agents',
      name: 'sidra-agents',
      versionInfo: '0.1.0',
      downloadLocation: 'NOASSERTION',
      licenseConcluded: 'Apache-2.0',
    },
    {
      SPDXID: 'SPDXRef-Package-Sidra-OS-Orchestrator',
      name: 'sidra-orchestrator',
      versionInfo: '0.1.0',
      downloadLocation: 'NOASSERTION',
      licenseConcluded: 'Apache-2.0',
    },
    {
      SPDXID: 'SPDXRef-Package-Sidra-OS-Plugins',
      name: 'sidra-plugins',
      versionInfo: '0.1.0',
      downloadLocation: 'NOASSERTION',
      licenseConcluded: 'Apache-2.0',
    },
    {
      SPDXID: 'SPDXRef-Package-Sidra-OS-Desktop',
      name: '@sidra/desktop',
      versionInfo: '0.1.0',
      downloadLocation: 'NOASSERTION',
      licenseConcluded: 'Apache-2.0',
    },
  ],
};

const sbomPath = path.join(releaseDir, 'sbom.spdx.json');
fs.writeFileSync(sbomPath, JSON.stringify(sbom, null, 2), 'utf-8');
console.log(`✓ SPDX SBOM successfully written to: ${sbomPath}\n`);
