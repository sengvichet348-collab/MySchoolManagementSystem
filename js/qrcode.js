/**
 * Lightweight Standalone Pure-JavaScript QR Code Generator
 * Generates crisp SVG / Data-URI QR codes completely offline with zero dependencies.
 * Spec: QR Code Model 2 (ISO/IEC 18004)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.QRCode = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // Reed-Solomon Galois Field GF(256) & Polynomial tables
  const GF256_EXP = new Uint8Array(512);
  const GF256_LOG = new Uint8Array(256);
  (function initGF() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      GF256_EXP[i] = x;
      GF256_EXP[i + 255] = x;
      GF256_LOG[x] = i;
      x <<= 1;
      if (x & 256) x ^= 0x11d; // polynomial x^8 + x^4 + x^3 + x^2 + 1
    }
    GF256_LOG[0] = 0;
  })();

  function gfMul(x, y) {
    if (x === 0 || y === 0) return 0;
    return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
  }

  function rsGeneratorPoly(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
      const next = [1];
      const factor = GF256_EXP[i];
      for (let j = 0; j < poly.length; j++) {
        next.push(0);
      }
      for (let j = 0; j < poly.length; j++) {
        next[j + 1] ^= gfMul(poly[j], factor);
      }
      poly = next;
    }
    return poly;
  }

  function rsCalculateECC(data, eccLength) {
    const gen = rsGeneratorPoly(eccLength);
    const res = new Uint8Array(eccLength);
    for (let i = 0; i < data.length; i++) {
      const feedback = data[i] ^ res[0];
      for (let j = 0; j < eccLength - 1; j++) {
        res[j] = res[j + 1] ^ gfMul(feedback, gen[j + 1]);
      }
      res[eccLength - 1] = gfMul(feedback, gen[eccLength]);
    }
    return res;
  }

  // Version specs: [dataBytes, eccBytes] for Error Correction Level M
  // Supports up to Version 6 (which is plenty for kindergarten student card data ~150 chars)
  const VERSION_CAPACITY_M = [
    null,
    { totalBytes: 26, dataBytes: 16, eccBytes: 10, size: 21 },  // V1
    { totalBytes: 44, dataBytes: 28, eccBytes: 16, size: 25 },  // V2
    { totalBytes: 70, dataBytes: 44, eccBytes: 26, size: 29 },  // V3
    { totalBytes: 100, dataBytes: 64, eccBytes: 36, size: 33 }, // V4
    { totalBytes: 134, dataBytes: 86, eccBytes: 48, size: 37 }, // V5
    { totalBytes: 172, dataBytes: 108, eccBytes: 64, size: 41 } // V6
  ];

  // Helper: UTF-8 to byte array
  function toUTF8Bytes(str) {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      let code = str.charCodeAt(i);
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      } else if (code < 0xd800 || code >= 0xe000) {
        bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      } else {
        i++;
        code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      }
    }
    return bytes;
  }

  class BitBuffer {
    constructor() {
      this.buffer = [];
      this.length = 0;
    }
    put(num, length) {
      for (let i = 0; i < length; i++) {
        this.putBit(((num >>> (length - i - 1)) & 1) === 1);
      }
    }
    putBit(bit) {
      const byteIndex = Math.floor(this.length / 8);
      if (this.buffer.length <= byteIndex) {
        this.buffer.push(0);
      }
      if (bit) {
        this.buffer[byteIndex] |= (0x80 >>> (this.length % 8));
      }
      this.length++;
    }
  }

  function pickVersion(dataByteLength) {
    for (let v = 1; v < VERSION_CAPACITY_M.length; v++) {
      // 4 bits mode (8-bit byte = 0100) + 8 bits count
      const capacityBits = VERSION_CAPACITY_M[v].dataBytes * 8;
      const neededBits = 4 + 8 + (dataByteLength * 8);
      if (neededBits <= capacityBits) {
        return v;
      }
    }
    return 6; // fallback max
  }

  function createQRCodeMatrix(text) {
    const rawBytes = toUTF8Bytes(text);
    const version = pickVersion(rawBytes.length);
    const spec = VERSION_CAPACITY_M[version];
    const size = spec.size;

    // Build data bit stream
    const bb = new BitBuffer();
    // 8-bit byte mode: 0100
    bb.put(4, 4);
    bb.put(rawBytes.length, 8);
    for (let i = 0; i < rawBytes.length; i++) {
      bb.put(rawBytes[i], 8);
    }

    // Add terminator (up to 4 zeroes)
    const maxBits = spec.dataBytes * 8;
    for (let i = 0; i < 4 && bb.length < maxBits; i++) {
      bb.putBit(false);
    }
    // Pad to byte boundary
    while (bb.length % 8 !== 0 && bb.length < maxBits) {
      bb.putBit(false);
    }
    // Pad bytes 0xEC, 0x11
    const padBytes = [0xEC, 0x11];
    let padIndex = 0;
    while (bb.length < maxBits) {
      bb.put(padBytes[padIndex % 2], 8);
      padIndex++;
    }

    const dataCodewords = new Uint8Array(spec.dataBytes);
    for (let i = 0; i < spec.dataBytes; i++) {
      dataCodewords[i] = bb.buffer[i] || 0;
    }

    // Error correction codewords
    const eccCodewords = rsCalculateECC(dataCodewords, spec.eccBytes);
    const allCodewords = new Uint8Array(spec.totalBytes);
    allCodewords.set(dataCodewords, 0);
    allCodewords.set(eccCodewords, spec.dataBytes);

    // Matrix setup
    const matrix = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
    const reserved = Array.from({ length: size }, () => new Uint8Array(size).fill(0));

    function setModule(r, c, val) {
      matrix[r][c] = val ? 1 : 0;
      reserved[r][c] = 1;
    }

    // 1. Finder patterns (7x7) at top-left, top-right, bottom-left
    function placeFinder(row, col) {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const nr = row + r;
          const nc = col + c;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isBorder = (r === 0 || r === 6 || c === 0 || c === 6);
            const isCenter = (r >= 2 && r <= 4 && c >= 2 && c <= 4);
            setModule(nr, nc, isBorder || isCenter);
          } else {
            setModule(nr, nc, false); // separator
          }
        }
      }
    }
    placeFinder(0, 0);
    placeFinder(0, size - 7);
    placeFinder(size - 7, 0);

    // 2. Alignment pattern (if version >= 2)
    if (version >= 2) {
      const alignCenter = size - 7;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const nr = alignCenter + r;
          const nc = alignCenter + c;
          if (!reserved[nr][nc]) {
            const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
            const isCenter = r === 0 && c === 0;
            setModule(nr, nc, isBorder || isCenter);
          }
        }
      }
    }

    // 3. Timing patterns (horizontal & vertical)
    for (let i = 8; i < size - 8; i++) {
      if (!reserved[6][i]) setModule(6, i, i % 2 === 0);
      if (!reserved[i][6]) setModule(i, 6, i % 2 === 0);
    }

    // 4. Dark module
    setModule(4 * version + 9, 8, true);

    // 5. Reserve format info areas
    for (let i = 0; i < 9; i++) {
      if (!reserved[8][i]) reserved[8][i] = 1;
      if (!reserved[i][8]) reserved[i][8] = 1;
    }
    for (let i = 0; i < 8; i++) {
      if (!reserved[8][size - 1 - i]) reserved[8][size - 1 - i] = 1;
      if (!reserved[size - 1 - i][8]) reserved[size - 1 - i] = 1;
    }

    // 6. Data placing with Mask 0 ((row + col) % 2 === 0)
    let bitIndex = 0;
    let upward = true;
    for (let right = size - 1; right > 0; right -= 2) {
      if (right === 6) right--; // skip vertical timing line
      const cols = [right, right - 1];
      const rows = upward
        ? Array.from({ length: size }, (_, i) => size - 1 - i)
        : Array.from({ length: size }, (_, i) => i);

      for (const r of rows) {
        for (const c of cols) {
          if (!reserved[r][c]) {
            let bit = false;
            if (bitIndex < allCodewords.length * 8) {
              const byteVal = allCodewords[Math.floor(bitIndex / 8)];
              bit = ((byteVal >>> (7 - (bitIndex % 8))) & 1) === 1;
              bitIndex++;
            }
            // Apply mask 0: flip if (r + c) % 2 === 0
            if ((r + c) % 2 === 0) {
              bit = !bit;
            }
            matrix[r][c] = bit ? 1 : 0;
          }
        }
      }
      upward = !upward;
    }

    // 7. Format Information (Error Correction Level M + Mask 0 = bits 0b10000 -> encoded format 0b100000011001110)
    // Pre-calculated Format bits for EC=M, Mask=0 (XOR with 0x5412) -> 0x4B3A
    const formatBits = 0x4B3A;
    for (let i = 0; i < 15; i++) {
      const bit = ((formatBits >>> i) & 1) === 1;
      // Along top-left
      if (i < 6) matrix[i][8] = bit ? 1 : 0;
      else if (i < 8) matrix[i + 1][8] = bit ? 1 : 0;
      else matrix[8][15 - i] = bit ? 1 : 0;

      // Along split edges
      if (i < 8) matrix[8][size - 1 - i] = bit ? 1 : 0;
      else matrix[size - 15 + i][8] = bit ? 1 : 0;
    }

    return { matrix, size };
  }

  // Public QRCode API
  return {
    generateSVG(text, options = {}) {
      const size = options.size || 160;
      const margin = options.margin !== undefined ? options.margin : 2;
      const darkColor = options.darkColor || '#0F172A';
      const lightColor = options.lightColor || '#FFFFFF';

      const { matrix, size: modCount } = createQRCodeMatrix(String(text || ''));
      const totalCount = modCount + (margin * 2);
      const cellSize = size / totalCount;

      let rects = '';
      for (let r = 0; r < modCount; r++) {
        for (let c = 0; c < modCount; c++) {
          if (matrix[r][c] === 1) {
            const x = ((c + margin) * cellSize).toFixed(2);
            const y = ((r + margin) * cellSize).toFixed(2);
            const w = cellSize.toFixed(2);
            const h = cellSize.toFixed(2);
            rects += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${darkColor}"/>`;
          }
        }
      }

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${lightColor}"/>${rects}</svg>`;
    },

    generateDataURL(text, options = {}) {
      const svg = this.generateSVG(text, options);
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }
  };
}));
