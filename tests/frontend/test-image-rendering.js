/**
 * Frontend Image Rendering Tests - FT-01 through FT-04
 *
 * These are Node.js tests that verify:
 * - base64 data URLs are structurally valid for <img src> usage
 * - FlatCard data structure is correct
 * - The API provides data compatible with frontend rendering
 *
 * Note: Full browser rendering tests require a browser automation tool.
 * These tests focus on data-layer correctness and structural validity.
 *
 * Prerequisites: Backend running at http://localhost:3000
 * Run: node tests/frontend/test-image-rendering.js
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

async function testImageDataUrlValidity() {
  console.log('\n--- FT-01: Base64 data URL validity for <img src> ---');

  let flats;
  try {
    const res = await fetch(`${BASE_URL}/api/flats`);
    flats = await res.json();
  } catch (e) {
    console.error(`  ERROR: Cannot connect to API: ${e.message}`);
    process.exit(1);
  }

  let allValid = true;
  for (const flat of flats) {
    const src = flat.image;

    // A browser accepts data URLs in the form: data:<type>;base64,<data>
    const isDataUrl = typeof src === 'string' && src.startsWith('data:') && src.includes(';base64,');
    const isImageType = src && src.startsWith('data:image/');
    const base64Part = src && src.includes('base64,') ? src.split('base64,')[1] : null;
    // base64 chars only (ignoring whitespace): A-Z a-z 0-9 + / =
    const validBase64Chars = base64Part ? /^[A-Za-z0-9+/=]+$/.test(base64Part.substring(0, 100)) : false;

    if (!isDataUrl || !isImageType || !validBase64Chars) {
      allValid = false;
      console.error(`  Flat id=${flat.id}: data URL not valid for img src`);
      console.error(`  Value prefix: ${String(src).substring(0, 60)}`);
    }
  }
  assert(allValid, 'FT-01', 'All flat images are valid base64 data URLs accepted by <img src>');
}

async function testBrokenImageFallback() {
  console.log('\n--- FT-02: Broken image fallback behaviour ---');
  // This test verifies the frontend is expected to handle broken images.
  // We simulate a broken image by checking that the API never returns null/empty image fields.
  // If the API always returns valid images, the fallback state is only for network errors.

  let flats;
  try {
    const res = await fetch(`${BASE_URL}/api/flats`);
    flats = await res.json();
  } catch (e) {
    assert(false, 'FT-02', `API reachable for fallback test (error: ${e.message})`);
    return;
  }

  let noNullImages = true;
  for (const flat of flats) {
    if (!flat.image || flat.image === '') {
      noNullImages = false;
      console.error(`  Flat id=${flat.id} has null/empty image - frontend onError would trigger`);
    }
  }
  assert(noNullImages, 'FT-02', 'No flats have null/empty image field (onError fallback not needed for valid data)');
}

async function testFlatCardDataStructure() {
  console.log('\n--- FT-03: FlatCard data structure (all display fields present) ---');

  let flats;
  try {
    const res = await fetch(`${BASE_URL}/api/flats`);
    flats = await res.json();
  } catch (e) {
    assert(false, 'FT-03', `API reachable (error: ${e.message})`);
    return;
  }

  let allValid = true;
  for (const flat of flats) {
    // FlatCard displays: image, title, price (GBP format), location
    const hasTitle = typeof flat.title === 'string' && flat.title.length > 0;
    const hasPrice = Number.isInteger(flat.price) && flat.price >= 1200 && flat.price <= 4500;
    const hasLocation = typeof flat.location === 'string' && flat.location.includes('London');
    const hasImage = typeof flat.image === 'string' && flat.image.startsWith('data:image/');

    if (!hasTitle || !hasPrice || !hasLocation || !hasImage) {
      allValid = false;
      console.error(`  Flat id=${flat.id} FlatCard fields: title=${hasTitle} price=${hasPrice} location=${hasLocation} image=${hasImage}`);
    } else {
      // Verify price can be formatted as £{price}/month
      const formatted = `£${flat.price.toLocaleString('en-GB')}/month`;
      console.log(`  Flat id=${flat.id}: "${flat.title}" | ${formatted} | ${flat.location}`);
    }
  }
  assert(allValid, 'FT-03', 'All flats have complete data required for FlatCard rendering');

  // Verify prices are in spec range
  const outOfRange = flats.filter(f => f.price < 1200 || f.price > 4500);
  assert(outOfRange.length === 0, 'FT-03b', `All prices in valid London range £1200-£4500 (${outOfRange.length} out of range)`);

  // Verify locations include London
  const badLocations = flats.filter(f => !f.location.includes('London'));
  assert(badLocations.length === 0, 'FT-03c', `All locations include "London" (${badLocations.length} do not)`);
}

async function testFlatGalleryCount() {
  console.log('\n--- FT-04: FlatGallery minimum count ---');

  let flats;
  try {
    const res = await fetch(`${BASE_URL}/api/flats`);
    flats = await res.json();
  } catch (e) {
    assert(false, 'FT-04', `API reachable (error: ${e.message})`);
    return;
  }

  assert(
    Array.isArray(flats) && flats.length >= 6,
    'FT-04',
    `FlatGallery will render at least 6 FlatCard elements (API provides ${flats?.length ?? 0} flats)`
  );
}

async function main() {
  console.log('=== London Rentals - Frontend Image Rendering Tests ===');
  console.log(`API: ${BASE_URL}`);
  console.log('Note: These tests verify data-layer correctness for frontend rendering.');

  await testImageDataUrlValidity();
  await testBrokenImageFallback();
  await testFlatCardDataStructure();
  await testFlatGalleryCount();

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
