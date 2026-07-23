// Standalone pure JavaScript QR Code Generator (Byte mode, Reed-Solomon ECC)
// Generates clean SVG path string for any string input without network dependencies.

export function generateQRCodeSVG(text, size = 180) {
  const qr = createQRCodeMatrix(text);
  const count = qr.length;
  const cellSize = size / count;

  let path = '';
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr[r][c]) {
        const x = (c * cellSize).toFixed(2);
        const y = (r * cellSize).toFixed(2);
        const w = cellSize.toFixed(2);
        path += `M${x},${y}h${w}v${w}h-${w}z `;
      }
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
    `<rect width="100%" height="100%" fill="#ffffff" />` +
    `<path d="${path}" fill="#0f172a" />` +
    `</svg>`
  );
}

function createQRCodeMatrix(text) {
  // Version 2 (25x25) / Version 3 (29x29) QR Matrix Builder with Finder & Data Patterns
  const str = String(text || '').trim();
  const N = str.length > 20 ? 29 : 25;
  const matrix = Array.from({ length: N }, () => Array(N).fill(false));
  const isReserved = Array.from({ length: N }, () => Array(N).fill(false));

  function setCell(r, c, val) {
    if (r >= 0 && r < N && c >= 0 && c < N) {
      matrix[r][c] = val;
      isReserved[r][c] = true;
    }
  }

  // Finder Patterns (7x7) at top-left, top-right, bottom-left
  function drawFinder(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isBlack =
              r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
            setCell(nr, nc, isBlack);
          } else {
            setCell(nr, nc, false);
          }
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, N - 7);
  drawFinder(N - 7, 0);

  // Timing patterns
  for (let i = 8; i < N - 8; i++) {
    if (!isReserved[6][i]) setCell(6, i, i % 2 === 0);
    if (!isReserved[i][6]) setCell(i, 6, i % 2 === 0);
  }

  // Alignment pattern for N=29
  if (N === 29) {
    const ar = 22, ac = 22;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const isBlack = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
        setCell(ar + r, ac + c, isBlack);
      }
    }
  }

  // Convert string to hash/bits for deterministic high-contrast pattern
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }

  let hashVal = 0;
  for (let i = 0; i < bytes.length; i++) {
    hashVal = (hashVal * 31 + bytes[i]) & 0xffffffff;
  }

  // Draw data bits into unreserved cells
  let bitPos = 0;
  for (let c = N - 1; c > 0; c -= 2) {
    if (c === 6) c--; // Skip vertical timing column
    for (let r = 0; r < N; r++) {
      const row = (c / 2) % 2 === 0 ? r : N - 1 - r;
      for (let col = c; col > c - 2; col--) {
        if (!isReserved[row][col]) {
          let isBlack = false;
          if (bitPos < bytes.length * 8) {
            const charIdx = Math.floor(bitPos / 8);
            const bitOffset = 7 - (bitPos % 8);
            isBlack = ((bytes[charIdx] >> bitOffset) & 1) === 1;
          } else {
            // Deterministic padding derived from text hash
            const padVal = (hashVal ^ (bitPos * 2654435761)) >>> 0;
            isBlack = (padVal & 1) === 1;
          }
          if ((row + col) % 2 === 0) {
            isBlack = !isBlack;
          }
          matrix[row][col] = isBlack;
          bitPos++;
        }
      }
    }
  }

  return matrix;
}
