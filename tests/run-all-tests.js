/**
 * Test Runner - runs all test suites in sequence
 * Run: node tests/run-all-tests.js
 *
 * Prerequisites:
 *   - Backend running at http://localhost:3000
 *   - server/flats.db seeded
 *   - npm install done in tests/ directory
 */

import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const suites = [
  { name: 'DB BLOB Tests (BT-11, BT-12)', file: 'backend/test-db-blobs.js' },
  { name: 'API Integration Tests (BT-01 to BT-10)', file: 'backend/test-api.js' },
  { name: 'Frontend Rendering Tests (FT-01 to FT-04)', file: 'frontend/test-image-rendering.js' },
  { name: 'E2E BLOB Flow (E2E-01)', file: 'e2e/test-blob-flow.js' },
];

let totalPassed = 0;
let totalFailed = 0;
const results = [];

for (const suite of suites) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${suite.name}`);
  console.log('='.repeat(60));

  const result = spawnSync('node', [join(__dirname, suite.file)], {
    stdio: 'inherit',
    cwd: __dirname,
  });

  const exitCode = result.status ?? 1;
  const status = exitCode === 0 ? 'PASSED' : 'FAILED';
  results.push({ name: suite.name, status, exitCode });

  if (exitCode === 0) {
    totalPassed++;
  } else {
    totalFailed++;
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log('OVERALL TEST RESULTS');
console.log('='.repeat(60));

for (const r of results) {
  const marker = r.status === 'PASSED' ? 'PASS' : 'FAIL';
  console.log(`  [${marker}] ${r.name}`);
}

console.log(`\nSuites passed: ${totalPassed}/${suites.length}`);
console.log(`Suites failed: ${totalFailed}/${suites.length}`);

if (totalFailed === 0) {
  console.log('\nAll test suites PASSED. Project meets quality criteria.');
} else {
  console.log(`\n${totalFailed} suite(s) FAILED. See output above for details.`);
}

process.exit(totalFailed > 0 ? 1 : 0);
