import { describe, it, expect } from "vitest";
import {
  evaluateDiagonalization,
  flipDigit,
  DEFAULT_DECIMAL_ROWS,
  DEFAULT_BINARY_ROWS,
  generateCantorSnake,
} from "../diagonalization";

describe("Cantor Diagonalization Algorithm", () => {
  it("flips digits correctly in binary and decimal modes", () => {
    expect(flipDigit(0, "binary")).toBe(1);
    expect(flipDigit(1, "binary")).toBe(0);

    expect(flipDigit(4, "decimal")).toBe(5);
    expect(flipDigit(7, "decimal")).toBe(4);
    expect(flipDigit(4, "decimal")).not.toBe(4);
  });

  it("extracts diagonal and constructs anti-diagonal proving uncountability", () => {
    const result = evaluateDiagonalization(DEFAULT_DECIMAL_ROWS, "decimal");

    expect(result.rows.length).toBe(6);
    expect(result.diagonal).toEqual([1, 7, 2, 2, 3, 0]);

    // Check anti-diagonal differs from diagonal at every single position
    result.antiDiagonal.forEach((antiDigit, idx) => {
      expect(antiDigit).not.toBe(result.diagonal[idx]);
    });

    // Check proof steps
    expect(result.proofSteps.length).toBe(6);
    expect(result.isContradictionProven).toBe(true);
  });

  it("works for binary sequences", () => {
    const result = evaluateDiagonalization(DEFAULT_BINARY_ROWS, "binary");
    expect(result.diagonal).toEqual([0, 1, 1, 0, 1, 1]);
    expect(result.antiDiagonal).toEqual([1, 0, 0, 1, 0, 0]);
  });

  it("generates Cantor snake rational enumeration correctly", () => {
    const { grid, sequence } = generateCantorSnake(4);
    expect(grid.length).toBe(4);
    expect(grid[0].length).toBe(4);

    // 1/1 should be order 1
    expect(sequence[0]).toEqual({ p: 1, q: 1, order: 1 });
    expect(sequence.length).toBeGreaterThan(5);
  });
});
