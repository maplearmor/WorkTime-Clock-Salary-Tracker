import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, drawFn) {
  const bytesPerPixel = 4;
  const scanlineLength = width * bytesPerPixel + 1; // +1 for filter byte
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);

    return Buffer.concat([len, typeAndData, crc]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // Color type 6: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function iconDrawer(isMaskable = false) {
  return (x, y, w, h) => {
    // Normal coordinate -1 to 1
    const nx = (x / w) * 2 - 1;
    const ny = (y / h) * 2 - 1;
    const r = Math.sqrt(nx * nx + ny * ny);

    // Rounded rectangle background
    const scale = isMaskable ? 0.75 : 0.88;
    const rx = Math.abs(nx) / scale;
    const ry = Math.abs(ny) / scale;
    const cornerR = 0.28;
    
    // Check if inside rounded box
    let inBox = false;
    if (isMaskable) {
      inBox = true; // Full bleed
    } else {
      const dx = Math.max(0, rx - (1 - cornerR));
      const dy = Math.max(0, ry - (1 - cornerR));
      inBox = (dx * dx + dy * dy) <= (cornerR * cornerR);
    }

    if (!inBox) {
      return [0, 0, 0, 0];
    }

    // Background color: slate-900 / dark corporate gradient
    let bgR = 15, bgG = 23, bgB = 42;
    // Add subtle gradient
    const grad = (ny + 1) * 0.5;
    bgR = Math.round(15 + grad * 12);
    bgG = Math.round(23 + grad * 16);
    bgB = Math.round(42 + grad * 20);

    // Inner icon graphics: Dial ring + Clock hands + Work badge
    const ringRadius = scale * 0.65;
    const ringThick = scale * 0.09;
    const distToRing = Math.abs(r - ringRadius);

    // Clock ring: Emerald / Cyan
    if (distToRing < ringThick) {
      const angle = Math.atan2(ny, nx); // -PI to PI
      if (!(angle > 1.2 && angle < 2.2)) { // Dashed gap
        return [0, 108, 74, 255]; // #006c4a Emerald
      }
    }

    // Clock Hands (Center at 0,0)
    // Vertical minute hand (0,0) to (0, -0.45)
    if (Math.abs(nx) < 0.045 * scale && ny <= 0.03 && ny >= -scale * 0.45) {
      return [255, 255, 255, 255];
    }
    // Hour hand at 45 deg (0,0) to (0.3, 0.3)
    const handX = nx * 0.707 + ny * 0.707;
    const handY = -nx * 0.707 + ny * 0.707;
    if (Math.abs(handY) < 0.045 * scale && handX >= 0 && handX <= scale * 0.35) {
      return [255, 255, 255, 255];
    }

    // Small active shift badge top-right: center at (scale * 0.48, -scale * 0.48)
    const badgeCx = scale * 0.48;
    const badgeCy = -scale * 0.48;
    const distBadge = Math.sqrt((nx - badgeCx) * (nx - badgeCx) + (ny - badgeCy) * (ny - badgeCy));
    if (distBadge <= scale * 0.18) {
      // White border
      if (distBadge >= scale * 0.15) {
        return [130, 245, 193, 255]; // #82f5c1
      }
      // Inner plus sign
      const bx = Math.abs(nx - badgeCx);
      const by = Math.abs(ny - badgeCy);
      if ((bx < scale * 0.03 && by < scale * 0.11) || (by < scale * 0.03 && bx < scale * 0.11)) {
        return [255, 255, 255, 255];
      }
      return [0, 108, 74, 255];
    }

    // Return background
    return [bgR, bgG, bgB, 255];
  };
}

// Generate files
const pwa192 = createPng(192, 192, iconDrawer(false));
fs.writeFileSync('public/pwa-192x192.png', pwa192);

const pwa512 = createPng(512, 512, iconDrawer(false));
fs.writeFileSync('public/pwa-512x512.png', pwa512);

const appleTouch = createPng(180, 180, iconDrawer(false));
fs.writeFileSync('public/apple-touch-icon.png', appleTouch);

const maskable512 = createPng(512, 512, iconDrawer(true));
fs.writeFileSync('public/pwa-maskable-512x512.png', maskable512);

console.log('Successfully generated all PWA icons: apple-touch-icon.png, pwa-192x192.png, pwa-512x512.png, pwa-maskable-512x512.png');
