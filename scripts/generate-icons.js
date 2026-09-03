// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const zlib = require('zlib');

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcPayload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, drawFn) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines
  const rowStride = width * 4;
  const rawData = Buffer.alloc((1 + rowStride) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + rowStride);
    rawData[rowOffset] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw brand icon: rich crimson-to-gold gradient with rounded corners and centered heart/ring emblem
function brandIconDraw(x, y, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const rCorner = width * 0.22;
  
  // Rounded rect check
  const dx = Math.max(Math.abs(x - cx) - (cx - rCorner), 0);
  const dy = Math.max(Math.abs(y - cy) - (cy - rCorner), 0);
  const distFromCorner = Math.sqrt(dx * dx + dy * dy);
  if (distFromCorner > rCorner) {
    return [0, 0, 0, 0]; // Transparent outside rounded rect
  }

  // Gradient: #e53238 (crimson red) to #991b1b (deep maroon)
  const gradT = (x + y) / (width + height);
  let red = Math.round(229 * (1 - gradT * 0.4));
  let green = Math.round(50 * (1 - gradT * 0.5));
  let blue = Math.round(56 * (1 - gradT * 0.5));

  // Golden heart shape in center
  // Normalized coords -1 to 1
  const nx = (x - cx) / (width * 0.35);
  const ny = (cy - y) / (height * 0.35) + 0.15; // flip y so top is positive

  // Heart formula: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
  const hVal = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * Math.pow(ny, 3);
  if (hVal <= 0.05) {
    // Gold color with subtle shading
    return [254, 240, 138, 255]; // Soft gold
  }

  // Inner subtle heart contour
  if (hVal <= 0.25) {
    return [245, 158, 11, 230]; // Amber gold border
  }

  return [red, green, blue, 255];
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
for (const s of sizes) {
  const buf = createPng(s, s, brandIconDraw);
  const outPath = path.join(outDir, `icon-${s}x${s}.png`);
  fs.writeFileSync(outPath, buf);
  console.log(`Generated ${outPath} (${s}x${s})`);
}

// Additional shortcut icons
for (const name of ['search-icon.png', 'matches-icon.png', 'chat-icon.png']) {
  const buf = createPng(192, 192, brandIconDraw);
  const outPath = path.join(outDir, name);
  fs.writeFileSync(outPath, buf);
  console.log(`Generated ${outPath}`);
}
console.log('All icons generated successfully!');
