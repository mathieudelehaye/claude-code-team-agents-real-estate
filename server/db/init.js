const Database = require('better-sqlite3');
const path = require('path');
const zlib = require('zlib');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'flats.db');

/**
 * Generate a valid PNG image with a solid color fill.
 * Produces a real PNG that any decoder can render.
 */
function generatePngImage(r, g, b, width, height) {
  width = width || 64;
  height = height || 64;

  function crc32(buf) {
    let crc = 0xFFFFFFFF;
    const table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[n] = c;
    }
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function makeChunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const crcInput = Buffer.concat([typeBytes, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(crcInput), 0);
    return Buffer.concat([len, typeBytes, data, crcBuf]);
  }

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 2;   // color type: RGB
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  // Raw image data: each row has a filter byte (0) + RGB pixels
  // Add gradient and noise so image compresses to > 1KB
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);
  // Simple seeded PRNG for deterministic noise
  let seed = r * 1000 + g * 100 + b;
  function nextRand() {
    seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
    return (seed >> 16) & 0xFF;
  }
  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    rawData[offset] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 3;
      // Gradient + noise to prevent excessive compression
      const gradX = Math.floor((x / width) * 60);
      const gradY = Math.floor((y / height) * 60);
      const noise = (nextRand() % 30) - 15;
      rawData[px]     = Math.max(0, Math.min(255, r - gradX + noise));
      rawData[px + 1] = Math.max(0, Math.min(255, g + gradY + noise));
      rawData[px + 2] = Math.max(0, Math.min(255, b - gradY + noise));
    }
  }

  // Use low compression to ensure > 1KB output
  const compressed = zlib.deflateSync(rawData, { level: 1 });

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    idatChunk,
    iendChunk
  ]);
}

function initDatabase() {
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  const db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE flats (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      title    TEXT    NOT NULL,
      price    INTEGER NOT NULL,
      location TEXT    NOT NULL,
      image    BLOB    NOT NULL
    );
  `);

  const flats = [
    { title: 'Bright Studio in Shoreditch',         price: 1800, location: 'Shoreditch, London',   image: 'flat01.png' },
    { title: 'Modern 1-Bed in Canary Wharf',        price: 2200, location: 'Canary Wharf, London',   image: 'flat02.png' },
    { title: 'Charming Flat in Notting Hill',        price: 2800, location: 'Notting Hill, London',   image: 'flat03.png' },
    { title: 'Spacious 2-Bed in Brixton',           price: 1500, location: 'Brixton, London',   image: 'flat04.png' },
    { title: 'Cosy Room in Camden',                  price: 1200, location: 'Camden, London',   image: 'flat05.png'  },
    { title: 'Riverside Apartment in Greenwich',     price: 2000, location: 'Greenwich, London',   image: 'flat06.png'  },
    { title: 'Victorian Conversion in Islington',    price: 2500, location: 'Islington, London',   image: 'flat07.png' },
    { title: 'Stylish Loft in Hackney',              price: 1900, location: 'Hackney, London',   image: 'flat08.png'  },
  ];

  const IMAGES_DIR = path.join(__dirname, '..', 'images');
  const insert = db.prepare('INSERT INTO flats (title, price, location, image) VALUES (?, ?, ?, ?)');

  for (const flat of flats) {
    const imageData = fs.readFileSync(path.join(IMAGES_DIR, flat.image));
    insert.run(flat.title, flat.price, flat.location, imageData);
  }

  console.log(`Database initialized at ${DB_PATH}`);
  console.log(`Inserted ${flats.length} flats with PNG BLOB images`);

  // Verify
  const rows = db.prepare('SELECT id, title, length(image) as img_size FROM flats').all();
  for (const row of rows) {
    console.log(`  #${row.id}: ${row.title} (image: ${row.img_size} bytes)`);
  }

  db.close();
}

initDatabase();
