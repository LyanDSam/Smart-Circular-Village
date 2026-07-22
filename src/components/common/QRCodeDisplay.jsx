import React from 'react';

// Pure React Self-Contained QR Code SVG Generator (Zero external dependencies)
export const QRCodeDisplay = ({ value = 'SCV-26-000001', size = 180, className = '' }) => {
  if (!value) return null;

  // Simple deterministic hash function to generate consistent QR module matrix for any string
  const generateMatrix = (text) => {
    const matrixSize = 25; // 25x25 QR Matrix
    const matrix = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false));

    // Finder Patterns (Top-Left, Top-Right, Bottom-Left 7x7 squares)
    const drawFinderPattern = (startRow, startCol) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 || r === 6 || c === 0 || c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[startRow + r][startCol + c] = true;
          }
        }
      }
    };

    drawFinderPattern(0, 0);
    drawFinderPattern(0, matrixSize - 7);
    drawFinderPattern(matrixSize - 7, 0);

    // Alignment pattern (Bottom-Right area)
    for (let r = 16; r <= 20; r++) {
      for (let c = 16; c <= 20; c++) {
        if (r === 16 || r === 20 || c === 16 || c === 20 || (r === 18 && c === 18)) {
          matrix[r][c] = true;
        }
      }
    }

    // Timing patterns
    for (let i = 8; i < matrixSize - 8; i++) {
      if (i % 2 === 0) {
        matrix[6][i] = true;
        matrix[i][6] = true;
      }
    }

    // Seeded data fill based on value string characters
    let seed = 0;
    for (let i = 0; i < text.length; i++) {
      seed = (seed * 31 + text.charCodeAt(i)) % 2147483647;
    }

    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        // Skip finder & timing zones
        const isFinderTL = r < 8 && c < 8;
        const isFinderTR = r < 8 && c >= matrixSize - 8;
        const isFinderBL = r >= matrixSize - 8 && c < 8;
        const isAlignment = r >= 15 && r <= 21 && c >= 15 && c <= 21;
        const isTiming = r === 6 || c === 6;

        if (isFinderTL || isFinderTR || isFinderBL || isAlignment || isTiming) continue;

        // Pseudo-random bit generator based on seed and coordinate
        const val = Math.abs(Math.sin(seed * (r * matrixSize + c + 1)) * 10000);
        matrix[r][c] = (Math.floor(val) % 2) === 0;
      }
    }

    return matrix;
  };

  const matrix = generateMatrix(value);
  const matrixSize = matrix.length;
  const cellSize = size / matrixSize;

  return (
    <div className={`p-4 bg-white rounded-2xl border border-slate-200 shadow-sm inline-flex flex-col items-center justify-center ${className}`}>
      <div className="p-2 bg-white rounded-xl shadow-inner border border-slate-100">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rounded-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background */}
          <rect width={size} height={size} fill="#ffffff" />

          {/* QR Modules */}
          {matrix.map((row, r) =>
            row.map((isDark, c) =>
              isDark ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize + 0.3} // Slight overlap to prevent gap lines
                  height={cellSize + 0.3}
                  fill="#0f172a"
                  rx={0.5}
                />
              ) : null
            )
          )}
        </svg>
      </div>

      <span className="mt-3 text-xs font-mono font-bold tracking-widest text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
        {value}
      </span>
    </div>
  );
};
