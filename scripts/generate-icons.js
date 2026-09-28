#!/usr/bin/env node

/**
 * Generate placeholder PWA icons
 * Creates 192x192 and 512x512 PNG files with Pride branding
 */

const fs = require('fs');
const path = require('path');

// Create a minimal PNG using raw pixel data
// This creates a simple solid color PNG as a placeholder
function createSolidColorPNG(width, height, r, g, b) {
  // PNG header
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk (image header)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(2, 9); // color type (RGB)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  // Calculate CRC for IHDR
  const crc32 = (buf) => {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crc ^ buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  };

  const ihdrChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 13]), // length
    Buffer.from('IHDR'),
    ihdr,
    Buffer.alloc(4)
  ]);
  const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdr]));
  ihdrChunk.writeUInt32BE(ihdrCrc, 17);

  // IDAT chunk (image data) - just a simple colored rectangle with zlib compression
  const zlib = require('zlib');
  const pixelData = Buffer.alloc(height * (1 + width * 3));
  let pos = 0;

  for (let y = 0; y < height; y++) {
    pixelData[pos++] = 0; // filter type
    for (let x = 0; x < width; x++) {
      pixelData[pos++] = r;
      pixelData[pos++] = g;
      pixelData[pos++] = b;
    }
  }

  const compressedData = zlib.deflateSync(pixelData);
  const idatChunk = Buffer.concat([
    Buffer.alloc(4),
    Buffer.from('IDAT'),
    compressedData,
    Buffer.alloc(4)
  ]);
  idatChunk.writeUInt32BE(compressedData.length, 0);
  const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), compressedData]));
  idatChunk.writeUInt32BE(idatCrc, 4 + 4 + compressedData.length);

  // IEND chunk
  const iendChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 0]),
    Buffer.from('IEND'),
    Buffer.from([0xae, 0x42, 0x60, 0x82])
  ]);

  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

// Pride indigo color: #4F46E5 (79, 70, 229)
const indigoR = 0x4F;
const indigoG = 0x46;
const indigoB = 0xE5;

const outputDir = path.join(__dirname, '../frontend/public/icons');

// Create icons
const icons = [
  { width: 192, height: 192, name: 'icon-192x192.png' },
  { width: 512, height: 512, name: 'icon-512x512.png' }
];

icons.forEach(({ width, height, name }) => {
  const png = createSolidColorPNG(width, height, indigoR, indigoG, indigoB);
  fs.writeFileSync(path.join(outputDir, name), png);
  console.log(`Created ${name} (${width}x${height})`);
});

// Create placeholder screenshots (1x1 transparent PNG for now)
const transparentPNG = Buffer.from([
  137, 80, 78, 71, 13, 10, 26, 10,
  0, 0, 0, 13, 73, 72, 68, 82,
  0, 0, 0, 1, 0, 0, 0, 1,
  8, 6, 0, 0, 0, 31, 21, 196, 137,
  0, 0, 0, 10, 73, 68, 65, 84,
  8, 29, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 30, 215, 184, 181,
  0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
]);

fs.writeFileSync(path.join(outputDir, 'screenshot-mobile.png'), transparentPNG);
fs.writeFileSync(path.join(outputDir, 'screenshot-desktop.png'), transparentPNG);
console.log('Created screenshot placeholders');

console.log('All icons generated successfully!');
