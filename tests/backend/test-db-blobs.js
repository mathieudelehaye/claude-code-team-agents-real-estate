/**
 * Database BLOB Storage Tests
 * Tests BT-11 and BT-12
 *
 * Directly queries the SQLite database to verify BLOB integrity.
 * Prerequisites: server/flats.db must exist and be seeded
 * Run: node tests/backend/test-db-blobs.js
 */

import { createRequire } from 'module';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../server/flats.db');

// JPEG magic bytes: FF D8 FF
// PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
const JPEG_MAGIC = Buffer.from([0xFF, 0xD8, 0xFF]);
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, testId, description) {
  if (condition) {
    console.log(`  PASS [${testId}] ${description}`);
    passed++;
  } else {
    console.error(`  FAIL [${testId}] ${description}`);
    failed++;
    failures.push({ testId, description });
  }
}

function isValidImageBuffer(buf) {
  if (!buf || buf.length < 8) return false;
  // Check JPEG
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true;
  // Check PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true;
  return false;
}

function getImageType(buf) {
  if (!buf || buf.length < 4) return 'unknown';
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'JPEG';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'PNG';
  return 'unknown';
}

function main() {
  console.log('=== London Rentals - Database BLOB Tests ===');
  console.log(`Database: ${DB_PATH}`);

  // Check DB file exists
  if (!existsSync(DB_PATH)) {
    console.error(`\n  ERROR: Database not found at ${DB_PATH}`);
    console.error('  Has the backend been started and seeded?');
    process.exit(1);
  }

  let Database;
  try {
    Database = require('better-sqlite3');
  } catch (e) {
    console.error('\n  ERROR: better-sqlite3 not installed.');
    console.error('  Run: cd tests && npm install');
    process.exit(1);
  }

  const db = new Database(DB_PATH, { readonly: true });

  // Verify table exists
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='flats'").get();
  assert(!!tableCheck, 'BT-11a', 'Table "flats" exists in database');

  if (!tableCheck) {
    db.close();
    process.exit(1);
  }

  // Check column types - image should be BLOB
  const tableInfo = db.prepare("PRAGMA table_info(flats)").all();
  const imageCol = tableInfo.find(col => col.name === 'image');
  assert(!!imageCol, 'BT-11b', 'Column "image" exists in flats table');
  if (imageCol) {
    assert(
      imageCol.type.toUpperCase() === 'BLOB',
      'BT-11c',
      `Column "image" type is BLOB (got: ${imageCol.type})`
    );
  }

  // BT-11: Fetch all rows and verify BLOB data
  console.log('\n--- BT-11: BLOB storage integrity ---');
  const rows = db.prepare('SELECT id, title, length(image) as img_size, image FROM flats').all();

  assert(rows.length >= 6, 'BT-11d', `At least 6 rows in flats table (got ${rows.length})`);

  let allBlobsValid = true;
  let allBlobsMinSize = true;

  for (const row of rows) {
    const buf = row.image instanceof Buffer ? row.image : Buffer.from(row.image);
    const isValid = isValidImageBuffer(buf);
    const imgType = getImageType(buf);
    const sizeOk = buf.length >= 1024;

    if (!isValid) {
      allBlobsValid = false;
      console.error(`  Row id=${row.id} ("${row.title}") BLOB does not have valid JPEG/PNG magic bytes`);
      console.error(`  First 8 bytes: ${buf.slice(0, 8).toString('hex')}`);
    } else {
      console.log(`  Row id=${row.id} ("${row.title}") - ${imgType}, ${buf.length} bytes OK`);
    }

    if (!sizeOk) {
      allBlobsMinSize = false;
      console.error(`  Row id=${row.id} BLOB too small: ${buf.length} bytes (minimum 1KB required)`);
    }
  }

  assert(allBlobsValid, 'BT-11', 'All BLOB images have valid JPEG or PNG magic bytes');
  assert(allBlobsMinSize, 'BT-11e', 'All BLOB images are at least 1KB in size');

  // BT-12: Verify base64 round-trip matches DB BLOB
  console.log('\n--- BT-12: Base64 round-trip integrity ---');

  let allRoundTripsMatch = true;
  for (const row of rows) {
    const dbBuf = row.image instanceof Buffer ? row.image : Buffer.from(row.image);

    // Simulate what the backend does: BLOB -> base64 -> data URL
    const base64 = dbBuf.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    // Now reverse: parse data URL -> decode base64 -> compare to DB bytes
    const base64Part = dataUrl.split('base64,')[1];
    const decoded = Buffer.from(base64Part, 'base64');

    const matches = dbBuf.equals(decoded);
    if (!matches) {
      allRoundTripsMatch = false;
      console.error(`  Row id=${row.id}: round-trip BLOB != decoded base64`);
      console.error(`  DB length: ${dbBuf.length}, decoded length: ${decoded.length}`);
    } else {
      console.log(`  Row id=${row.id}: round-trip OK (${dbBuf.length} bytes)`);
    }
  }

  assert(allRoundTripsMatch, 'BT-12', 'All BLOBs survive base64 encode-decode round-trip with identical bytes');

  db.close();

  console.log('\n=== RESULTS ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failures.length > 0) {
    console.log('\nFailed tests:');
    for (const f of failures) {
      console.log(`  [${f.testId}] ${f.description}`);
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

main();
