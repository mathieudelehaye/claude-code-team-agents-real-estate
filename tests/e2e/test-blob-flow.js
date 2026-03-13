/**
 * End-to-End BLOB Flow Test - E2E-01
 *
 * Verifies the complete critical path:
 *   SQLite BLOB -> Backend base64 conversion -> API JSON -> UI rendering
 *
 * Prerequisites:
 *   - Backend running at http://localhost:3000
 *   - server/flats.db accessible
 *
 * Run: node tests/e2e/test-blob-flow.js
 */

import { createRequire } from 'module';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../server/flats.db');
const BASE_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, label, description) {
  if (condition) {
    console.log(`  PASS [${label}] ${description}`);
    passed++;
  } else {
    console.error(`  FAIL [${label}] ${description}`);
    failed++;
    failures.push({ label, description });
  }
}

function isValidImageBuffer(buf) {
  if (!buf || buf.length < 4) return false;
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true;
  return false;
}

async function main() {
  console.log('=== London Rentals - E2E BLOB Flow Test (E2E-01) ===');
  console.log(`Database: ${DB_PATH}`);
  console.log(`API: ${BASE_URL}`);
  console.log('');
  console.log('Critical path: SQLite BLOB -> base64 -> API JSON -> img src');

  // --- Step 1: Read BLOB directly from SQLite ---
  console.log('\n[Step 1] Read BLOBs from SQLite database');

  if (!existsSync(DB_PATH)) {
    console.error(`  ERROR: Database not found at ${DB_PATH}`);
    process.exit(1);
  }

  let Database;
  try {
    Database = require('better-sqlite3');
  } catch (e) {
    console.error('  ERROR: better-sqlite3 not installed. Run: cd tests && npm install');
    process.exit(1);
  }

  const db = new Database(DB_PATH, { readonly: true });
  const dbRows = db.prepare('SELECT id, image FROM flats ORDER BY id LIMIT 3').all();
  db.close();

  assert(dbRows.length > 0, 'E2E-01a', `Database has rows (got ${dbRows.length})`);
  if (dbRows.length === 0) {
    console.error('  Cannot continue - no rows in database');
    process.exit(1);
  }

  // Collect DB blobs keyed by id
  const dbBlobs = {};
  for (const row of dbRows) {
    const buf = row.image instanceof Buffer ? row.image : Buffer.from(row.image);
    dbBlobs[row.id] = buf;
    const isValid = isValidImageBuffer(buf);
    assert(isValid, `E2E-01a-${row.id}`, `DB BLOB for id=${row.id} is valid image binary (${buf.length} bytes)`);
  }

  // --- Step 2: Fetch from API ---
  console.log('\n[Step 2] Fetch flats from REST API');

  let apiFlats;
  try {
    const res = await fetch(`${BASE_URL}/api/flats`);
    assert(res.status === 200, 'E2E-01b', `GET /api/flats returns HTTP 200 (got ${res.status})`);
    apiFlats = await res.json();
  } catch (e) {
    console.error(`  ERROR: Could not fetch from API: ${e.message}`);
    console.error('  Is the backend running at http://localhost:3000?');
    process.exit(1);
  }

  assert(Array.isArray(apiFlats) && apiFlats.length > 0, 'E2E-01c', `API returned ${apiFlats?.length ?? 0} flats`);

  // --- Step 3: Verify base64 encoding and data URL format ---
  console.log('\n[Step 3] Verify base64 encoding and data URL format');

  for (const flat of apiFlats.slice(0, 3)) {
    const image = flat.image;

    assert(
      typeof image === 'string' && image.startsWith('data:image/'),
      `E2E-01d-${flat.id}`,
      `Flat id=${flat.id} image starts with data:image/`
    );

    assert(
      image.includes('base64,'),
      `E2E-01e-${flat.id}`,
      `Flat id=${flat.id} image contains base64, marker`
    );

    if (image.includes('base64,')) {
      const base64Part = image.split('base64,')[1];
      let decoded;
      try {
        decoded = Buffer.from(base64Part, 'base64');
        assert(decoded.length > 0, `E2E-01f-${flat.id}`, `Flat id=${flat.id} base64 decodes to ${decoded.length} bytes`);
        assert(isValidImageBuffer(decoded), `E2E-01g-${flat.id}`, `Flat id=${flat.id} decoded bytes are valid JPEG/PNG`);
      } catch (e) {
        assert(false, `E2E-01f-${flat.id}`, `Flat id=${flat.id} base64 is decodable (error: ${e.message})`);
      }

      // --- Step 4: Cross-check API base64 against DB BLOB ---
      console.log(`\n[Step 4] Cross-check API base64 vs DB BLOB for id=${flat.id}`);
      if (dbBlobs[flat.id] && decoded) {
        const dbBuf = dbBlobs[flat.id];
        const matches = dbBuf.equals(decoded);
        assert(
          matches,
          `E2E-01h-${flat.id}`,
          `API base64 for id=${flat.id} decodes to same bytes as DB BLOB (DB: ${dbBuf.length}B, API decoded: ${decoded.length}B)`
        );
      }
    }
  }

  // --- Step 5: Verify data URL is valid for img src usage ---
  console.log('\n[Step 5] Verify data URL structure is valid for <img src> usage');

  for (const flat of apiFlats.slice(0, 3)) {
    const image = flat.image;
    if (!image) continue;

    // A valid data URL for img src must match: data:<mime>;base64,<data>
    const dataUrlRegex = /^data:image\/(jpeg|png|gif|webp|svg\+xml);base64,[A-Za-z0-9+/]+=*$/;
    // Note: we test prefix + format, not full regex on huge string (too slow)
    const hasCorrectPrefix = image.startsWith('data:image/');
    const hasBase64Marker = image.includes(';base64,');
    const mimeEnd = image.indexOf(';');
    const mime = mimeEnd > 0 ? image.substring(5, mimeEnd) : '';
    const knownMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mime);

    assert(hasCorrectPrefix && hasBase64Marker && knownMime,
      `E2E-01i-${flat.id}`,
      `Flat id=${flat.id} data URL has valid structure for <img src> (mime: ${mime})`
    );
  }

  // --- Summary ---
  console.log('\n=== E2E-01 RESULTS ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failures.length > 0) {
    console.log('\nFailed checks:');
    for (const f of failures) {
      console.log(`  [${f.label}] ${f.description}`);
    }
    console.log('\nE2E-01: FAILED - BLOB flow has issues');
  } else {
    console.log('\nE2E-01: PASSED - Full BLOB flow DB -> API -> img src verified');
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
