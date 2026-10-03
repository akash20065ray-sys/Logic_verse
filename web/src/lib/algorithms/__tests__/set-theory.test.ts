import { describe, it, expect } from "vitest";
import {
  union,
  intersection,
  difference,
  symmetricDifference,
  cartesianProduct,
  cardinality,
  powerSet,
  complement,
  inclusionExclusion,
  applyOperation,
} from "../set-theory";

describe("set theory algorithm engine", () => {
  const A = [2, 4, 6, 8];
  const B = [4, 8, 12];

  it("union combines without duplicates", () => {
    expect(union(A, B).sort()).toEqual([2, 4, 6, 8, 12].sort());
  });

  it("intersection keeps only shared elements", () => {
    expect(intersection(A, B).sort()).toEqual([4, 8]);
  });

  it("difference removes B's elements from A", () => {
    expect(difference(A, B).sort()).toEqual([2, 6]);
  });

  it("symmetric difference excludes shared elements", () => {
    expect(symmetricDifference(A, B).sort()).toEqual([2, 6, 12].sort());
  });

  it("cartesian product has |A| * |B| pairs", () => {
    expect(cartesianProduct(A, B)).toHaveLength(A.length * B.length);
  });

  it("cardinality counts unique elements", () => {
    expect(cardinality([1, 1, 2, 3])).toBe(3);
  });

  it("power set has 2^n subsets", () => {
    expect(powerSet([1, 2, 3])).toHaveLength(8);
  });

  it("power set of empty set is [[]]", () => {
    expect(powerSet([])).toEqual([[]]);
  });

  it("complement removes A's elements from universe", () => {
    expect(complement([1, 2], [1, 2, 3, 4])).toEqual([3, 4]);
  });

  it("inclusion-exclusion matches |A ∪ B|", () => {
    expect(inclusionExclusion(A, B)).toBe(union(A, B).length);
  });

  it("applyOperation binary returns steps, properties, and LaTeX", () => {
    const result = applyOperation("∪", A, B);
    expect(result.notation).toBe("A ∪ B");
    expect(result.elements.sort()).toEqual(union(A, B).sort());
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.properties.length).toBeGreaterThan(0);
    expect(result.latex).toContain("\\cup");
  });

  it("applyOperation unary power set works correctly", () => {
    const result = applyOperation("𝒫", [1, 2]);
    expect(result.notation).toBe("𝒫(A)");
    expect(result.elements).toHaveLength(4);
    expect(result.steps.length).toBeGreaterThan(0);
  });

  it("applyOperation unary cardinality works correctly", () => {
    const result = applyOperation("|·|", [1, 2, 3, 4]);
    expect(result.elements).toEqual([4]);
    expect(result.cardinality).toBe(4);
  });
});
