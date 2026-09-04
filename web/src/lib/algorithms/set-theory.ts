// Deterministic Set Theory algorithm engine.
// PROJECT SPEC rule: "Do not hardcode algorithm results where an actual
// algorithm should be used" and "Separate UI from mathematical logic."
// This module has zero React/UI imports and is independently unit-testable.

export type SetElement = string | number;

export type BinaryOperationSymbol = "∪" | "∩" | "−" | "⊕" | "×";
export type UnaryOperationSymbol = "𝒫" | "|·|" | "∁";
export type SetOperationSymbol = BinaryOperationSymbol | UnaryOperationSymbol;

export interface AlgorithmStep {
  stepNumber: number;
  title: string;
  description: string;
  highlightedElements?: SetElement[];
  formalRule?: string;
  intermediateResult?: SetElement[];
}

export interface OperationResult {
  elements: SetElement[];
  notation: string;
  formalDefinition: string;
  latex: string;
  steps: AlgorithmStep[];
  cardinality: number;
  properties: string[];
}

export function deduplicate(elements: SetElement[]): SetElement[] {
  return Array.from(new Set(elements));
}

export function union(a: SetElement[], b: SetElement[]): SetElement[] {
  const result = new Set<SetElement>(a);
  for (const el of b) result.add(el);
  return Array.from(result);
}

export function intersection(a: SetElement[], b: SetElement[]): SetElement[] {
  const setB = new Set(b);
  return deduplicate(a).filter((el) => setB.has(el));
}

export function difference(a: SetElement[], b: SetElement[]): SetElement[] {
  const setB = new Set(b);
  return deduplicate(a).filter((el) => !setB.has(el));
}

export function symmetricDifference(a: SetElement[], b: SetElement[]): SetElement[] {
  const setA = new Set(a);
  const setB = new Set(b);
  const result: SetElement[] = [];
  for (const el of deduplicate(a)) if (!setB.has(el)) result.push(el);
  for (const el of deduplicate(b)) if (!setA.has(el)) result.push(el);
  return deduplicate(result);
}

export function cartesianProduct(a: SetElement[], b: SetElement[]): [SetElement, SetElement][] {
  const uniqA = deduplicate(a);
  const uniqB = deduplicate(b);
  const result: [SetElement, SetElement][] = [];
  for (const x of uniqA) for (const y of uniqB) result.push([x, y]);
  return result;
}

export function cardinality(a: SetElement[]): number {
  return new Set(a).size;
}

export function powerSet(a: SetElement[]): SetElement[][] {
  const unique = deduplicate(a);
  const n = unique.length;
  // Limit to reasonable size to prevent memory explosion if user inputs a large set
  const maxN = Math.min(n, 10);
  const cappedUnique = unique.slice(0, maxN);
  const result: SetElement[][] = [];
  for (let mask = 0; mask < 1 << maxN; mask++) {
    const subset: SetElement[] = [];
    for (let i = 0; i < maxN; i++) {
      if (mask & (1 << i)) subset.push(cappedUnique[i]);
    }
    result.push(subset);
  }
  return result;
}

export function complement(a: SetElement[], universe?: SetElement[]): SetElement[] {
  const u = universe && universe.length > 0 ? universe : union(a, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const setA = new Set(a);
  return deduplicate(u).filter((el) => !setA.has(el));
}

export function inclusionExclusion(a: SetElement[], b: SetElement[]): number {
  return cardinality(a) + cardinality(b) - cardinality(intersection(a, b));
}

export function formatSetNotation(name: string, elements: SetElement[]): string {
  const formattedElements = elements.map((e) => (typeof e === "string" && e.includes(",") ? e : String(e))).join(", ");
  return `${name} = {${formattedElements}}`;
}

export function generateSteps(
  symbol: SetOperationSymbol,
  labelA: string,
  elementsA: SetElement[],
  labelB?: string,
  elementsB?: SetElement[]
): AlgorithmStep[] {
  const a = deduplicate(elementsA);
  const b = elementsB ? deduplicate(elementsB) : [];
  const nameA = labelA || "A";
  const nameB = labelB || "B";

  switch (symbol) {
    case "∪": {
      const inter = intersection(a, b);
      const onlyA = difference(a, b);
      const onlyB = difference(b, a);
      const total = union(a, b);
      return [
        {
          stepNumber: 1,
          title: "Identify Input Sets",
          description: `${nameA} = {${a.join(", ")}} (|${nameA}| = ${a.length}) and ${nameB} = {${b.join(", ")}} (|${nameB}| = ${b.length}).`,
          formalRule: `${nameA} ∪ ${nameB} = { x | x ∈ ${nameA} ∨ x ∈ ${nameB} }`,
        },
        {
          stepNumber: 2,
          title: "Find Shared Elements",
          description:
            inter.length > 0
              ? `Shared elements (intersection): {${inter.join(", ")}}. These appear in both sets and will only be included once.`
              : `The sets are disjoint (${nameA} ∩ ${nameB} = ∅). No elements are shared.`,
          highlightedElements: inter,
          intermediateResult: inter,
        },
        {
          stepNumber: 3,
          title: "Collect Elements from Both Sets",
          description: `Add distinct elements: exclusive to ${nameA}: {${onlyA.join(", ")}}, exclusive to ${nameB}: {${onlyB.join(", ")}}, and shared: {${inter.join(", ")}}.`,
          highlightedElements: total,
          intermediateResult: total,
        },
        {
          stepNumber: 4,
          title: "Verify by Principle of Inclusion-Exclusion",
          description: `|${nameA} ∪ ${nameB}| = |${nameA}| + |${nameB}| − |${nameA} ∩ ${nameB}| = ${a.length} + ${b.length} − ${inter.length} = ${total.length}.`,
          formalRule: `|${nameA} ∪ ${nameB}| = ${total.length}`,
          intermediateResult: total,
        },
      ];
    }
    case "∩": {
      const inter = intersection(a, b);
      return [
        {
          stepNumber: 1,
          title: "Inspect Input Sets",
          description: `${nameA} = {${a.join(", ")}} and ${nameB} = {${b.join(", ")}}.`,
          formalRule: `${nameA} ∩ ${nameB} = { x | x ∈ ${nameA} ∧ x ∈ ${nameB} }`,
        },
        {
          stepNumber: 2,
          title: "Test Each Element for Membership in Both Sets",
          description: a
            .map((x) =>
              b.includes(x)
                ? `Element '${x}' ∈ ${nameA} and '${x}' ∈ ${nameB} → KEEP`
                : `Element '${x}' ∈ ${nameA} but '${x}' ∉ ${nameB} → EXCLUDE`
            )
            .join("; "),
          highlightedElements: inter,
        },
        {
          stepNumber: 3,
          title: "Construct Intersection Set",
          description:
            inter.length > 0
              ? `Intersection contains ${inter.length} common element(s): {${inter.join(", ")}}.`
              : `No common elements found. The intersection is the empty set ∅.`,
          highlightedElements: inter,
          intermediateResult: inter,
        },
      ];
    }
    case "−": {
      const diff = difference(a, b);
      const removed = intersection(a, b);
      return [
        {
          stepNumber: 1,
          title: "Define Relative Complement (Difference)",
          description: `Subtract all elements of ${nameB} from ${nameA}. Order matters: ${nameA} − ${nameB} ≠ ${nameB} − ${nameA} in general.`,
          formalRule: `${nameA} − ${nameB} = { x | x ∈ ${nameA} ∧ x ∉ ${nameB} }`,
        },
        {
          stepNumber: 2,
          title: "Identify Elements of A also present in B",
          description:
            removed.length > 0
              ? `Elements {${removed.join(", ")}} exist in ${nameB} and must be discarded from ${nameA}.`
              : `None of ${nameA}'s elements exist in ${nameB}. No elements are removed.`,
          highlightedElements: removed,
        },
        {
          stepNumber: 3,
          title: "Final Difference Set",
          description: `Remaining elements in ${nameA}: {${diff.join(", ")}} (Cardinality = ${diff.length}).`,
          highlightedElements: diff,
          intermediateResult: diff,
        },
      ];
    }
    case "⊕": {
      const symDiff = symmetricDifference(a, b);
      const inter = intersection(a, b);
      return [
        {
          stepNumber: 1,
          title: "Define Symmetric Difference (XOR)",
          description: `Elements that belong to either ${nameA} or ${nameB}, but NOT to both. Equivalent to (${nameA} ∪ ${nameB}) − (${nameA} ∩ ${nameB}).`,
          formalRule: `${nameA} ⊕ ${nameB} = (${nameA} − ${nameB}) ∪ (${nameB} − ${nameA})`,
        },
        {
          stepNumber: 2,
          title: "Filter Out Shared Elements",
          description: `Exclude intersection: {${inter.join(", ")}}.`,
          highlightedElements: inter,
        },
        {
          stepNumber: 3,
          title: "Combine Exclusive Elements",
          description: `Result contains elements unique to ${nameA} or unique to ${nameB}: {${symDiff.join(", ")}}.`,
          highlightedElements: symDiff,
          intermediateResult: symDiff,
        },
      ];
    }
    case "×": {
      const pairs = cartesianProduct(a, b);
      const formatted = pairs.map(([x, y]) => `(${x},${y})`);
      return [
        {
          stepNumber: 1,
          title: "Define Cartesian Product",
          description: `Form all ordered pairs (x, y) where x ∈ ${nameA} and y ∈ ${nameB}. Total expected pairs = |${nameA}| × |${nameB}| = ${a.length} × ${b.length} = ${pairs.length}.`,
          formalRule: `${nameA} × ${nameB} = { (x, y) | x ∈ ${nameA} ∧ y ∈ ${nameB} }`,
        },
        {
          stepNumber: 2,
          title: "Generate Ordered Pairs",
          description: `Pairs generated: ${formatted.slice(0, 10).join(", ")}${formatted.length > 10 ? "..." : ""}.`,
          intermediateResult: formatted,
        },
      ];
    }
    case "𝒫": {
      const pset = powerSet(a);
      const formatted = pset.map((sub) => `{${sub.join(",")}}`);
      return [
        {
          stepNumber: 1,
          title: "Define Power Set",
          description: `The set of all subsets of ${nameA}, including the empty set ∅ and ${nameA} itself.`,
          formalRule: `|𝒫(${nameA})| = 2^|${nameA}| = 2^${a.length} = ${1 << Math.min(a.length, 10)}.`,
        },
        {
          stepNumber: 2,
          title: "Enumerate Subsets by Cardinality",
          description: `Subsets: ${formatted.slice(0, 8).join(", ")}${formatted.length > 8 ? ` ... (${formatted.length} total)` : ""}.`,
          intermediateResult: formatted,
        },
      ];
    }
    case "|·|": {
      const card = a.length;
      return [
        {
          stepNumber: 1,
          title: "Count Distinct Elements",
          description: `Set ${nameA} has ${card} distinct element(s). Duplicates are not counted in standard set theory.`,
          formalRule: `|${nameA}| = ${card}`,
          intermediateResult: [card],
        },
      ];
    }
    case "∁": {
      const comp = complement(a);
      return [
        {
          stepNumber: 1,
          title: "Define Set Complement",
          description: `Elements of the universal set 𝒰 that do NOT belong to ${nameA}.`,
          formalRule: `${nameA}ᶜ = { x ∈ 𝒰 | x ∉ ${nameA} }`,
          intermediateResult: comp,
        },
      ];
    }
  }
}

export function applyOperation(
  symbol: SetOperationSymbol,
  a: SetElement[],
  b?: SetElement[],
  labelA: string = "A",
  labelB: string = "B"
): OperationResult {
  const cleanA = deduplicate(a);
  const cleanB = b ? deduplicate(b) : [];

  switch (symbol) {
    case "∪": {
      const result = union(cleanA, cleanB);
      return {
        elements: result,
        notation: `${labelA} ∪ ${labelB}`,
        formalDefinition: `{ x | x ∈ ${labelA} ∨ x ∈ ${labelB} }`,
        latex: `${labelA} \\cup ${labelB} = \\{${result.join(", ")}\\}`,
        steps: generateSteps("∪", labelA, cleanA, labelB, cleanB),
        cardinality: result.length,
        properties: [
          "Commutative: A ∪ B = B ∪ A",
          "Associative: (A ∪ B) ∪ C = A ∪ (B ∪ C)",
          "Idempotent: A ∪ A = A",
          "Identity: A ∪ ∅ = A",
        ],
      };
    }
    case "∩": {
      const result = intersection(cleanA, cleanB);
      return {
        elements: result,
        notation: `${labelA} ∩ ${labelB}`,
        formalDefinition: `{ x | x ∈ ${labelA} ∧ x ∈ ${labelB} }`,
        latex: `${labelA} \\cap ${labelB} = \\{${result.join(", ")}\\}`,
        steps: generateSteps("∩", labelA, cleanA, labelB, cleanB),
        cardinality: result.length,
        properties: [
          "Commutative: A ∩ B = B ∩ A",
          "Associative: (A ∩ B) ∩ C = A ∩ (B ∩ C)",
          "Idempotent: A ∩ A = A",
          "Domination: A ∩ ∅ = ∅",
        ],
      };
    }
    case "−": {
      const result = difference(cleanA, cleanB);
      return {
        elements: result,
        notation: `${labelA} − ${labelB}`,
        formalDefinition: `{ x | x ∈ ${labelA} ∧ x ∉ ${labelB} }`,
        latex: `${labelA} \\setminus ${labelB} = \\{${result.join(", ")}\\}`,
        steps: generateSteps("−", labelA, cleanA, labelB, cleanB),
        cardinality: result.length,
        properties: [
          "Non-commutative: A − B ≠ B − A in general",
          "A − ∅ = A",
          "A − A = ∅",
          "A − B = A ∩ Bᶜ",
        ],
      };
    }
    case "⊕": {
      const result = symmetricDifference(cleanA, cleanB);
      return {
        elements: result,
        notation: `${labelA} ⊕ ${labelB}`,
        formalDefinition: `( ${labelA} − ${labelB} ) ∪ ( ${labelB} − ${labelA} )`,
        latex: `${labelA} \\Delta ${labelB} = \\{${result.join(", ")}\\}`,
        steps: generateSteps("⊕", labelA, cleanA, labelB, cleanB),
        cardinality: result.length,
        properties: [
          "Commutative: A ⊕ B = B ⊕ A",
          "Associative: (A ⊕ B) ⊕ C = A ⊕ (B ⊕ C)",
          "Self-inverse: A ⊕ A = ∅",
          "Identity: A ⊕ ∅ = A",
        ],
      };
    }
    case "×": {
      const pairs = cartesianProduct(cleanA, cleanB);
      const elements = pairs.map(([x, y]) => `(${x},${y})`);
      return {
        elements,
        notation: `${labelA} × ${labelB}`,
        formalDefinition: `{ (x, y) | x ∈ ${labelA} ∧ y ∈ ${labelB} }`,
        latex: `${labelA} \\times ${labelB} = \\{${elements.slice(0, 10).join(", ")}${elements.length > 10 ? ", \\dots" : ""}\\}`,
        steps: generateSteps("×", labelA, cleanA, labelB, cleanB),
        cardinality: elements.length,
        properties: [
          "Non-commutative: A × B ≠ B × A in general",
          "|A × B| = |A| · |B|",
          "Distributive over union: A × (B ∪ C) = (A × B) ∪ (A × C)",
        ],
      };
    }
    case "𝒫": {
      const pset = powerSet(cleanA);
      const elements = pset.map((sub) => (sub.length === 0 ? "∅" : `{${sub.join(",")}}`));
      return {
        elements,
        notation: `𝒫(${labelA})`,
        formalDefinition: `{ S | S ⊆ ${labelA} }`,
        latex: `\\mathcal{P}(${labelA}) = \\{${elements.slice(0, 8).join(", ")}${elements.length > 8 ? ", \\dots" : ""}\\}`,
        steps: generateSteps("𝒫", labelA, cleanA),
        cardinality: elements.length,
        properties: [
          `|𝒫(A)| = 2^|A| = 2^${cleanA.length} = ${elements.length}`,
          "∅ ∈ 𝒫(A)",
          "A ∈ 𝒫(A)",
        ],
      };
    }
    case "|·|": {
      const count = cleanA.length;
      return {
        elements: [count],
        notation: `|${labelA}|`,
        formalDefinition: `The number of unique elements in ${labelA}`,
        latex: `|${labelA}| = ${count}`,
        steps: generateSteps("|·|", labelA, cleanA),
        cardinality: count,
        properties: ["|A| ≥ 0", "|∅| = 0", "Finite set cardinality"],
      };
    }
    case "∁": {
      const comp = complement(cleanA);
      return {
        elements: comp,
        notation: `${labelA}ᶜ`,
        formalDefinition: `{ x ∈ 𝒰 | x ∉ ${labelA} }`,
        latex: `${labelA}^c = \\{${comp.join(", ")}\\}`,
        steps: generateSteps("∁", labelA, cleanA),
        cardinality: comp.length,
        properties: [
          "(Aᶜ)ᶜ = A (Double complement)",
          "A ∪ Aᶜ = 𝒰",
          "A ∩ Aᶜ = ∅",
        ],
      };
    }
  }
}
