import { describe, it, expect } from "vitest";
import {
  evaluateRelationProperties,
  computeWarshall,
  computeHasseDiagram,
  analyzeFunction,
  RELATION_PRESETS,
} from "../relations";

describe("Relations Algorithm Engine", () => {
  it("identifies Divisibility D12 as a partial order (poset)", () => {
    const preset = RELATION_PRESETS[0];
    const props = evaluateRelationProperties(preset.elements, preset.pairs);

    expect(props.isReflexive).toBe(true);
    expect(props.isAntiSymmetric).toBe(true);
    expect(props.isTransitive).toBe(true);
    expect(props.isPartialOrder).toBe(true);
    expect(props.isEquivalence).toBe(false);
  });

  it("identifies Modulo 3 as an equivalence relation with 3 classes", () => {
    const preset = RELATION_PRESETS[1];
    const props = evaluateRelationProperties(preset.elements, preset.pairs);

    expect(props.isReflexive).toBe(true);
    expect(props.isSymmetric).toBe(true);
    expect(props.isTransitive).toBe(true);
    expect(props.isEquivalence).toBe(true);
    expect(props.isPartialOrder).toBe(false);

    expect(props.equivalenceClasses.length).toBe(3);
  });

  it("computes Warshall transitive closure step-by-step", () => {
    // Chain: (1,2), (2,3) -> transitive closure should discover (1,3)
    const elements = ["1", "2", "3"];
    const pairs: [string, string][] = [["1", "2"], ["2", "3"]];

    const steps = computeWarshall(elements, pairs);
    expect(steps.length).toBe(4); // W0, W1, W2, W3

    const finalMatrix = steps[3].matrix;
    // (1,3) is index 0 -> index 2
    expect(finalMatrix[0][2]).toBe(true);
  });

  it("generates Hasse diagram with proper reduction and extremal elements for D12", () => {
    const preset = RELATION_PRESETS[0];
    const hasse = computeHasseDiagram(preset.elements, preset.pairs);

    expect(hasse.isPoset).toBe(true);
    expect(hasse.nodes.length).toBe(6);

    // In D12, 1 is least, 12 is greatest
    expect(hasse.leastElement).toBe("1");
    expect(hasse.greatestElement).toBe("12");

    // Minimal is [1], Maximal is [12]
    expect(hasse.minimalElements).toEqual(["1"]);
    expect(hasse.maximalElements).toEqual(["12"]);

    // Direct covers: (1,2), (1,3), (2,4), (2,6), (3,6), (4,12), (6,12)
    // Transitive edges like (1, 4) or (1, 12) must be eliminated!
    const coverPairs = hasse.covers.map(([a, b]) => `${a}->${b}`);
    expect(coverPairs).toContain("1->2");
    expect(coverPairs).toContain("1->3");
    expect(coverPairs).toContain("2->4");
    expect(coverPairs).toContain("6->12");

    // Redundant edges must be removed by Hasse reduction
    expect(coverPairs).not.toContain("1->4");
    expect(coverPairs).not.toContain("1->12");
  });

  it("analyzes functions for injectivity, surjectivity, and bijectivity", () => {
    const domain = ["a", "b", "c"];
    const codomain = ["1", "2", "3"];

    // Bijection
    const f1 = analyzeFunction(domain, codomain, { a: "1", b: "2", c: "3" });
    expect(f1.isInjective).toBe(true);
    expect(f1.isSurjective).toBe(true);
    expect(f1.isBijective).toBe(true);
    expect(f1.inverseMapping).toEqual({ "1": "a", "2": "b", "3": "c" });

    // Not Injective (collision on 1)
    const f2 = analyzeFunction(domain, codomain, { a: "1", b: "1", c: "2" });
    expect(f2.isInjective).toBe(false);
    expect(f2.isSurjective).toBe(false);
    expect(f2.isBijective).toBe(false);
  });
});
