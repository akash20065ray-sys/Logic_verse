/**
 * Cantor's Diagonalization Argument & Countability Engine
 *
 * Implements:
 * 1. Cantor's Diagonalization proof showing that the interval (0, 1) / infinite binary strings
 *    are UNCOUNTABLE.
 * 2. Cantor's Snake Zig-Zag path showing that positive rationals Q+ are COUNTABLE.
 */

export interface DiagonalRow {
  index: number;
  label: string; // e.g. "s₁"
  digits: number[]; // e.g. [3, 1, 4, 1, 5, 9]
}

export interface DiagonalProofStep {
  row: number; // 0-indexed
  label: string; // e.g. "s₁"
  col: number; // index of diagonal
  rowDigit: number;
  antiDigit: number;
  explanation: string;
}

export interface DiagonalState {
  mode: "decimal" | "binary";
  rows: DiagonalRow[];
  diagonal: number[];
  antiDiagonal: number[];
  proofSteps: DiagonalProofStep[];
  isContradictionProven: boolean;
}

// Default presets
export const DEFAULT_DECIMAL_ROWS: number[][] = [
  [1, 4, 1, 5, 9, 2],
  [2, 7, 1, 8, 2, 8],
  [5, 8, 2, 0, 9, 7],
  [8, 1, 8, 2, 8, 4],
  [3, 3, 3, 3, 3, 3],
  [9, 0, 9, 0, 9, 0],
];

export const DEFAULT_BINARY_ROWS: number[][] = [
  [0, 1, 0, 1, 1, 0],
  [1, 1, 0, 0, 1, 1],
  [0, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0],
  [0, 1, 1, 0, 1, 0],
  [1, 1, 1, 0, 0, 1],
];

/**
 * Constructs the anti-diagonal digit:
 * In binary: 0 -> 1, 1 -> 0
 * In decimal: avoids 0 and 9 to eliminate 0.999... ambiguities. (e.g. if digit is 4 -> 5, else 4).
 */
export function flipDigit(digit: number, mode: "decimal" | "binary"): number {
  if (mode === "binary") {
    return digit === 1 ? 0 : 1;
  }
  // Decimal rule: if digit === 4 return 5, else return 4.
  // Guaranteed: new digit is never equal to original digit, and neither 0 nor 9.
  return digit === 4 ? 5 : 4;
}

export function evaluateDiagonalization(
  rawRows: number[][],
  mode: "decimal" | "binary" = "decimal"
): DiagonalState {
  const size = Math.min(rawRows.length, rawRows[0]?.length ?? 0);
  const rows: DiagonalRow[] = rawRows.slice(0, size).map((digits, idx) => ({
    index: idx + 1,
    label: `s${subscript(idx + 1)}`,
    digits: digits.slice(0, size),
  }));

  const diagonal: number[] = [];
  const antiDiagonal: number[] = [];
  const proofSteps: DiagonalProofStep[] = [];

  for (let i = 0; i < size; i++) {
    const orig = rows[i].digits[i];
    const flipped = flipDigit(orig, mode);
    diagonal.push(orig);
    antiDiagonal.push(flipped);

    proofSteps.push({
      row: i,
      label: rows[i].label,
      col: i,
      rowDigit: orig,
      antiDigit: flipped,
      explanation: `At position ${i + 1}, anti-diagonal has ${flipped} while ${rows[i].label} has ${orig}. Thus D ≠ ${rows[i].label}.`,
    });
  }

  return {
    mode,
    rows,
    diagonal,
    antiDiagonal,
    proofSteps,
    isContradictionProven: proofSteps.length > 0,
  };
}

function subscript(n: number): string {
  const map: Record<string, string> = {
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "₈",
    "9": "₉",
  };
  return String(n)
    .split("")
    .map((c) => map[c] || c)
    .join("");
}

// ---------------------------------------------------------------------------
// Cantor's Rational Snake Path (Countability of Q+)
// ---------------------------------------------------------------------------

export interface RationalEntry {
  p: number;
  q: number;
  index?: number; // 1-indexed order in bijection
  isReduced: boolean;
}

export function generateCantorSnake(maxN: number = 5): {
  grid: RationalEntry[][];
  sequence: { p: number; q: number; order: number }[];
} {
  const grid: RationalEntry[][] = [];
  for (let p = 1; p <= maxN; p++) {
    const row: RationalEntry[] = [];
    for (let q = 1; q <= maxN; q++) {
      row.push({
        p,
        q,
        isReduced: gcd(p, q) === 1,
      });
    }
    grid.push(row);
  }

  // Generate diagonal serpentine sequence
  const sequence: { p: number; q: number; order: number }[] = [];
  let order = 1;

  // Sum s = p + q ranges from 2 to 2 * maxN
  for (let s = 2; s <= maxN * 2; s++) {
    const isEven = s % 2 === 0;
    if (isEven) {
      for (let p = s - 1; p >= 1; p--) {
        const q = s - p;
        if (p <= maxN && q <= maxN) {
          if (gcd(p, q) === 1) {
            sequence.push({ p, q, order });
            grid[p - 1][q - 1].index = order;
            order++;
          }
        }
      }
    } else {
      for (let p = 1; p <= s - 1; p++) {
        const q = s - p;
        if (p <= maxN && q <= maxN) {
          if (gcd(p, q) === 1) {
            sequence.push({ p, q, order });
            grid[p - 1][q - 1].index = order;
            order++;
          }
        }
      }
    }
  }

  return { grid, sequence };
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}
