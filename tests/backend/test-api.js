/**
 * Backend API Integration Tests
 * Tests BT-01 through BT-10
 *
 * Prerequisites: backend running at http://localhost:3000
 * Run: node tests/backend/test-api.js
 */

const BASE_URL = 'http://localhost:3000';

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

function assertEq(actual, expected, testId, description) {
  const ok = actual === expected;
  if (!ok) {
    console.error(`  FAIL [${testId}] ${description} (expected: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)})`);
    failed++;
    failures.push({ testId, description, actual, expected });
  } else {
    console.log(`  PASS [${testId}] ${description}`);
    passed++;
  }
}

async function testGetFlats() {
  console.log('\n--- GET /api/flats ---');
  let res;
  try {
    res = await fetch(`${BASE_URL}/api/flats`);
  } catch (e) {
    console.error(`  ERROR: Could not connect to ${BASE_URL}. Is the backend running?`);
    console.error(`  ${e.message}`);
    process.exit(1);
  }

  // BT-01
  assertEq(res.status, 200, 'BT-01', 'GET /api/flats returns HTTP 200');

  // Content-Type
  const contentType = res.headers.get('content-type') || '';
  assert(contentType.includes('application/json'), 'BT-01b', 'Content-Type is application/json');

  // BT-09 (CORS) - check on /api/flats
  const cors = res.headers.get('access-control-allow-origin');
  assertEq(cors, '*', 'BT-09', 'CORS header Access-Control-Allow-Origin: * present on /api/flats');

  const body = await res.json();

  // BT-02
  assert(Array.isArray(body), 'BT-02', 'GET /api/flats returns JSON array');

  if (!Array.isArray(body)) {
    console.error('  Cannot continue array tests - response is not an array');
    return;
  }

  // BT-03
  assert(body.length >= 6, 'BT-03', `Array has at least 6 items (got ${body.length})`);

  // BT-04 and BT-05 - check every flat
  let allFieldsPresent = true;
  let allImagesValid = true;
  let allPricesValid = true;

  for (const flat of body) {
    const hasId = Number.isInteger(flat.id);
    const hasTitle = typeof flat.title === 'string' && flat.title.length > 0;
    const hasPrice = Number.isInteger(flat.price) && flat.price > 0;
    const hasLocation = typeof flat.location === 'string' && flat.location.length > 0;
    const hasImage = typeof flat.image === 'string' && flat.image.length > 0;

    if (!hasId || !hasTitle || !hasPrice || !hasLocation || !hasImage) {
      allFieldsPresent = false;
      console.error(`  Flat id=${flat.id} missing or invalid fields: id=${hasId} title=${hasTitle} price=${hasPrice} location=${hasLocation} image=${hasImage}`);
    }

    if (!flat.image || !flat.image.startsWith('data:image/')) {
      allImagesValid = false;
      console.error(`  Flat id=${flat.id} image does not start with data:image/ (value: ${String(flat.image).substring(0, 50)})`);
    }

    if (!Number.isInteger(flat.price) || flat.price <= 0) {
      allPricesValid = false;
    }
  }

  assert(allFieldsPresent, 'BT-04', 'Every flat has all required fields (id, title, price, location, image)');
  assert(allImagesValid, 'BT-05', 'Every flat image starts with data:image/ (valid base64 data URL prefix)');
  assert(allPricesValid, 'BT-04b', 'Every flat price is a positive integer');

  // Spot-check base64 decodability on first flat
  if (body.length > 0 && body[0].image && body[0].image.includes('base64,')) {
    const base64Part = body[0].image.split('base64,')[1];
    try {
      const decoded = Buffer.from(base64Part, 'base64');
      assert(decoded.length > 0, 'BT-05b', `First flat base64 decodes to ${decoded.length} bytes (non-empty)`);
      assert(decoded.length >= 1024, 'BT-05c', `First flat decoded image >= 1KB (got ${decoded.length} bytes)`);
    } catch (e) {
      assert(false, 'BT-05b', `First flat base64 is decodable (error: ${e.message})`);
    }
  }
}

async function testGetFlatById() {
  console.log('\n--- GET /api/flats/:id ---');

  // BT-06
  let res;
  try {
    res = await fetch(`${BASE_URL}/api/flats/1`);
  } catch (e) {
    assert(false, 'BT-06', `GET /api/flats/1 reachable (error: ${e.message})`);
    return;
  }

  assertEq(res.status, 200, 'BT-06', 'GET /api/flats/1 returns HTTP 200');

  const cors = res.headers.get('access-control-allow-origin');
  assertEq(cors, '*', 'BT-09b', 'CORS header present on /api/flats/1');

  const flat = await res.json();
  assert(flat && !Array.isArray(flat) && typeof flat === 'object', 'BT-06b', 'GET /api/flats/1 returns single object (not array)');
  assert(flat.id === 1, 'BT-06c', 'Returned flat has id=1');
  assert(typeof flat.image === 'string' && flat.image.startsWith('data:image/'), 'BT-06d', 'Single flat image is valid data URL');

  // BT-07 and BT-08
  let res404;
  try {
    res404 = await fetch(`${BASE_URL}/api/flats/99999`);
  } catch (e) {
    assert(false, 'BT-07', `GET /api/flats/99999 reachable (error: ${e.message})`);
    return;
  }

  assertEq(res404.status, 404, 'BT-07', 'GET /api/flats/99999 returns HTTP 404');

  const body404 = await res404.json();
  assertEq(body404.error, 'Flat not found', 'BT-08', '404 body is {"error": "Flat not found"}');
}

async function testHealth() {
  console.log('\n--- GET /health ---');

  let res;
  try {
    res = await fetch(`${BASE_URL}/health`);
  } catch (e) {
    assert(false, 'BT-10', `GET /health reachable (error: ${e.message})`);
    return;
  }

  assertEq(res.status, 200, 'BT-10', 'GET /health returns HTTP 200');

  const body = await res.json();
  assertEq(body.status, 'ok', 'BT-10b', 'GET /health returns {"status": "ok"}');
}

async function testCorsOptions() {
  console.log('\n--- OPTIONS preflight ---');

  let res;
  try {
    res = await fetch(`${BASE_URL}/api/flats`, { method: 'OPTIONS' });
  } catch (e) {
    console.log(`  SKIP OPTIONS test (error: ${e.message})`);
    return;
  }

  assert(res.status === 200 || res.status === 204, 'BT-09c', `OPTIONS /api/flats returns 200 or 204 (got ${res.status})`);
}

async function main() {
  console.log('=== London Rentals - Backend API Tests ===');
  console.log(`Target: ${BASE_URL}`);

  await testGetFlats();
  await testGetFlatById();
  await testHealth();
  await testCorsOptions();

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

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
