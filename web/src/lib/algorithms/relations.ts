/**
 * Relations and Functions Algorithm Engine
 *
 * Implements:
 * 1. Binary Relations on finite sets: Matrix representation & property evaluation
 *    (Reflexive, Symmetric, Anti-Symmetric, Transitive, Equivalence, Partial Order/Poset).
 * 2. Equivalence Classes & Partition computation.
 * 3. Warshall's Algorithm for Transitive Closure step-by-step.
 * 4. Automated Hasse Diagram generation (Transitive & Reflexive Reduction, Topological Levels).
 * 5. Function Bijectivity Analyzer (Injective, Surjective, Bijective, Inverse).
 */

export interface RelationProperties {
  isReflexive: boolean;
  reflexiveMissing: string[]; // elements missing (a, a)
  isIrreflexive: boolean;
  isSymmetric: boolean;
  symmetricMissing: [string, string][]; // (b, a) missing for (a, b)
  isAntiSymmetric: boolean;
  antiSymmetricViolations: [string, string][]; // (a, b) and (b, a) where a != b
  isAsymmetric: boolean;
  isTransitive: boolean;
  transitiveViolations: { a: string; b: string; c: string }[];
  isEquivalence: boolean;
  isPartialOrder: boolean;
  isStrictPartialOrder: boolean;
  isTotalOrder: boolean;
  equivalenceClasses: { rep: string; members: string[] }[];
}

export interface WarshallStep {
  step: number; // 0 to N
  pivotElement?: string;
  matrix: boolean[][];
  newPairs: [string, string][];
  explanation: string;
}

export interface HasseNode {
  id: string;
  label: string;
  level: number; // 0 = minimal level
  x: number;
  y: number;
}

export interface HasseDiagramData {
  nodes: HasseNode[];
  covers: [string, string][]; // [from, to] where from < to (upward edge)
  maximalElements: string[];
  minimalElements: string[];
  greatestElement?: string; // unique maximum comparable to all
  leastElement?: string; // unique minimum comparable to all
  isPoset: boolean;
  error?: string;
}

export interface FunctionAnalysis {
  isWellDefined: boolean;
  isInjective: boolean;
  isSurjective: boolean;
  isBijective: boolean;
  domain: string[];
  codomain: string[];
  mapping: Record<string, string>;
  inverseMapping?: Record<string, string>;
  unmappedDomain: string[];
  uncoveredCodomain: string[];
  collisions: { target: string; sources: string[] }[];
  pigeonholeApplies: boolean;
  minMaxCollisions: number;
}

// ---------------------------------------------------------------------------
// 1. Matrix & Properties
// ---------------------------------------------------------------------------

export function buildRelationMatrix(elements: string[], pairs: [string, string][]): boolean[][] {
  const n = elements.length;
  const indexMap = new Map(elements.map((e, i) => [e, i]));
  const matrix: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));

  for (const [a, b] of pairs) {
    const i = indexMap.get(a);
    const j = indexMap.get(b);
    if (i !== undefined && j !== undefined) {
      matrix[i][j] = true;
    }
  }

  return matrix;
}

export function evaluateRelationProperties(
  elements: string[],
  pairs: [string, string][]
): RelationProperties {
  const n = elements.length;
  const indexMap = new Map(elements.map((e, i) => [e, i]));
  const matrix = buildRelationMatrix(elements, pairs);

  // 1. Reflexivity
  const reflexiveMissing: string[] = [];
  let isReflexive = true;
  let isIrreflexive = true;

  for (let i = 0; i < n; i++) {
    if (matrix[i][i]) {
      isIrreflexive = false;
    } else {
      isReflexive = false;
      reflexiveMissing.push(elements[i]);
    }
  }

  // 2. Symmetry, Anti-symmetry, Asymmetry
  let isSymmetric = true;
  let isAntiSymmetric = true;
  const symmetricMissing: [string, string][] = [];
  const antiSymmetricViolations: [string, string][] = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j]) {
        if (!matrix[j][i]) {
          isSymmetric = false;
          symmetricMissing.push([elements[j], elements[i]]);
        }
        if (i !== j && matrix[j][i]) {
          isAntiSymmetric = false;
          if (i < j) {
            antiSymmetricViolations.push([elements[i], elements[j]]);
          }
        }
      }
    }
  }

  const isAsymmetric = isIrreflexive && isAntiSymmetric;

  // 3. Transitivity
  let isTransitive = true;
  const transitiveViolations: { a: string; b: string; c: string }[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j]) {
        for (let k = 0; k < n; k++) {
          if (matrix[j][k] && !matrix[i][k]) {
            isTransitive = false;
            if (transitiveViolations.length < 10) {
              transitiveViolations.push({
                a: elements[i],
                b: elements[j],
                c: elements[k],
              });
            }
          }
        }
      }
    }
  }

  // 4. Classifications
  const isEquivalence = isReflexive && isSymmetric && isTransitive;
  const isPartialOrder = isReflexive && isAntiSymmetric && isTransitive;
  const isStrictPartialOrder = isIrreflexive && isTransitive;

  // Total order: every distinct pair (a, b) has either (a, b) or (b, a)
  let isTotalOrder = isPartialOrder;
  if (isPartialOrder) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (!matrix[i][j] && !matrix[j][i]) {
          isTotalOrder = false;
          break;
        }
      }
      if (!isTotalOrder) break;
    }
  }

  // 5. Equivalence Classes & Partitions (if Equivalence)
  const equivalenceClasses: { rep: string; members: string[] }[] = [];
  if (isEquivalence) {
    const visited = new Set<number>();
    for (let i = 0; i < n; i++) {
      if (visited.has(i)) continue;
      const members: string[] = [];
      for (let j = 0; j < n; j++) {
        if (matrix[i][j]) {
          visited.add(j);
          members.push(elements[j]);
        }
      }
      equivalenceClasses.push({ rep: elements[i], members });
    }
  }

  return {
    isReflexive,
    reflexiveMissing,
    isIrreflexive,
    isSymmetric,
    symmetricMissing,
    isAntiSymmetric,
    antiSymmetricViolations,
    isAsymmetric,
    isTransitive,
    transitiveViolations,
    isEquivalence,
    isPartialOrder,
    isStrictPartialOrder,
    isTotalOrder,
    equivalenceClasses,
  };
}

// ---------------------------------------------------------------------------
// 2. Warshall's Algorithm for Transitive Closure
// ---------------------------------------------------------------------------

export function computeWarshall(elements: string[], pairs: [string, string][]): WarshallStep[] {
  const n = elements.length;
  const steps: WarshallStep[] = [];

  let currentMatrix = buildRelationMatrix(elements, pairs);
  steps.push({
    step: 0,
    matrix: currentMatrix.map((r) => [...r]),
    newPairs: [],
    explanation: "Initial adjacency matrix W₀ directly from given relation pairs.",
  });

  for (let k = 0; k < n; k++) {
    const nextMatrix = currentMatrix.map((r) => [...r]);
    const newPairs: [string, string][] = [];

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (!currentMatrix[i][j] && currentMatrix[i][k] && currentMatrix[k][j]) {
          nextMatrix[i][j] = true;
          newPairs.push([elements[i], elements[j]]);
        }
      }
    }

    const pivot = elements[k];
    const explanation =
      newPairs.length > 0
        ? `Step ${k + 1} (Pivot: ${pivot}): Discovered ${newPairs.length} new transitive path(s) using ${pivot} as intermediary: ${newPairs
            .map(([a, b]) => `(${a}, ${b})`)
            .join(", ")}.`
        : `Step ${k + 1} (Pivot: ${pivot}): No new paths discovered through pivot ${pivot}.`;

    steps.push({
      step: k + 1,
      pivotElement: pivot,
      matrix: nextMatrix,
      newPairs,
      explanation,
    });

    currentMatrix = nextMatrix;
  }

  return steps;
}

// ---------------------------------------------------------------------------
// 3. Automated Hasse Diagram (Poset Transitive & Reflexive Reduction)
// ---------------------------------------------------------------------------

export function computeHasseDiagram(elements: string[], pairs: [string, string][]): HasseDiagramData {
  const n = elements.length;
  const props = evaluateRelationProperties(elements, pairs);

  if (!props.isPartialOrder) {
    return {
      nodes: [],
      covers: [],
      maximalElements: [],
      minimalElements: [],
      isPoset: false,
      error: !props.isReflexive
        ? "Not a Poset: Relation is not reflexive (missing identity loops)."
        : !props.isAntiSymmetric
        ? "Not a Poset: Relation is not anti-symmetric (contains mutual cycles)."
        : "Not a Poset: Relation is not transitive.",
    };
  }

  const indexMap = new Map(elements.map((e, i) => [e, i]));
  const matrix = buildRelationMatrix(elements, pairs);

  // Compute Cover Relation (Hasse Edges):
  // a < c is a cover iff a != c, a <= c, and there is no b != a, c such that a <= b <= c.
  const covers: [string, string][] = [];
  const inDegrees = new Map<number, number>();
  const outDegrees = new Map<number, number>();

  for (let i = 0; i < n; i++) {
    inDegrees.set(i, 0);
    outDegrees.set(i, 0);
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j || !matrix[i][j]) continue;

      let isCover = true;
      for (let k = 0; k < n; k++) {
        if (k !== i && k !== j && matrix[i][k] && matrix[k][j]) {
          isCover = false;
          break;
        }
      }

      if (isCover) {
        covers.push([elements[i], elements[j]]);
        outDegrees.set(i, (outDegrees.get(i) || 0) + 1);
        inDegrees.set(j, (inDegrees.get(j) || 0) + 1);
      }
    }
  }

  // Topological Level Assignment:
  // Height = Longest path from any minimal element.
  const levels = new Array(n).fill(0);

  // Repeat relaxation for longest path in DAG
  for (let pass = 0; pass < n; pass++) {
    for (const [from, to] of covers) {
      const u = indexMap.get(from)!;
      const v = indexMap.get(to)!;
      if (levels[v] < levels[u] + 1) {
        levels[v] = levels[u] + 1;
      }
    }
  }

  const maxLevel = Math.max(0, ...levels);

  // Group nodes by level to assign planar X/Y coordinates
  const levelGroups = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const lvl = levels[i];
    const list = levelGroups.get(lvl) || [];
    list.push(i);
    levelGroups.set(lvl, list);
  }

  const nodes: HasseNode[] = [];
  const totalHeight = 240;
  const totalWidth = 360;

  for (let i = 0; i < n; i++) {
    const lvl = levels[i];
    const group = levelGroups.get(lvl) || [i];
    const posInGroup = group.indexOf(i);
    const countInGroup = group.length;

    // Distribute horizontally
    const spacingX = totalWidth / (countInGroup + 1);
    const x = Math.round(spacingX * (posInGroup + 1));

    // Distribute vertically (level 0 at bottom, maxLevel at top)
    const spacingY = maxLevel > 0 ? (totalHeight - 60) / maxLevel : 0;
    const y = Math.round(totalHeight - 30 - lvl * spacingY);

    nodes.push({
      id: elements[i],
      label: elements[i],
      level: lvl,
      x,
      y,
    });
  }

  // Extremal Elements:
  // Minimal: In-degree 0 in the strict cover relation
  const minimalElements = elements.filter((_, i) => inDegrees.get(i) === 0);
  // Maximal: Out-degree 0 in the strict cover relation
  const maximalElements = elements.filter((_, i) => outDegrees.get(i) === 0);

  // Least element: unique minimal element that relates to ALL other elements
  let leastElement: string | undefined;
  if (minimalElements.length === 1) {
    const candidateIdx = indexMap.get(minimalElements[0])!;
    const relatesToAll = elements.every((_, j) => matrix[candidateIdx][j]);
    if (relatesToAll) leastElement = minimalElements[0];
  }

  // Greatest element: unique maximal element that ALL other elements relate to
  let greatestElement: string | undefined;
  if (maximalElements.length === 1) {
    const candidateIdx = indexMap.get(maximalElements[0])!;
    const allRelateTo = elements.every((_, j) => matrix[j][candidateIdx]);
    if (allRelateTo) greatestElement = maximalElements[0];
  }

  return {
    nodes,
    covers,
    maximalElements,
    minimalElements,
    greatestElement,
    leastElement,
    isPoset: true,
  };
}

// ---------------------------------------------------------------------------
// 4. Function Bijectivity Analyzer
// ---------------------------------------------------------------------------

export function analyzeFunction(
  domain: string[],
  codomain: string[],
  mapping: Record<string, string>
): FunctionAnalysis {
  const unmappedDomain = domain.filter((d) => mapping[d] === undefined);
  const isWellDefined = unmappedDomain.length === 0;

  // Injective check: no two domain elements map to same codomain target
  const targetSources = new Map<string, string[]>();
  for (const d of domain) {
    const target = mapping[d];
    if (target !== undefined) {
      const list = targetSources.get(target) || [];
      list.push(d);
      targetSources.set(target, list);
    }
  }

  const collisions: { target: string; sources: string[] }[] = [];
  let isInjective = isWellDefined;

  for (const [target, sources] of targetSources.entries()) {
    if (sources.length > 1) {
      isInjective = false;
      collisions.push({ target, sources });
    }
  }

  // Surjective check: every codomain element has at least one source
  const uncoveredCodomain = codomain.filter((c) => !targetSources.has(c));
  const isSurjective = isWellDefined && uncoveredCodomain.length === 0;

  // Bijective check
  const isBijective = isInjective && isSurjective;

  // Inverse mapping
  let inverseMapping: Record<string, string> | undefined;
  if (isBijective) {
    inverseMapping = {};
    for (const d of domain) {
      inverseMapping[mapping[d]] = d;
    }
  }

  // Pigeonhole Principle
  const pigeonholeApplies = domain.length > codomain.length && codomain.length > 0;
  const minMaxCollisions = pigeonholeApplies ? Math.ceil(domain.length / codomain.length) : 1;

  return {
    isWellDefined,
    isInjective,
    isSurjective,
    isBijective,
    domain,
    codomain,
    mapping,
    inverseMapping,
    unmappedDomain,
    uncoveredCodomain,
    collisions,
    pigeonholeApplies,
    minMaxCollisions,
  };
}

// ---------------------------------------------------------------------------
// Presets for Demonstrations & Lab Practicals
// ---------------------------------------------------------------------------

export interface RelationPreset {
  name: string;
  description: string;
  elements: string[];
  pairs: [string, string][];
}

export const RELATION_PRESETS: RelationPreset[] = [
  {
    name: "Divisibility Poset D₁₂ ({1, 2, 3, 4, 6, 12})",
    description: "Partial order where a relates to b iff a divides b. Forms classic Hasse diamond lattice.",
    elements: ["1", "2", "3", "4", "6", "12"],
    pairs: [
      ["1", "1"], ["1", "2"], ["1", "3"], ["1", "4"], ["1", "6"], ["1", "12"],
      ["2", "2"], ["2", "4"], ["2", "6"], ["2", "12"],
      ["3", "3"], ["3", "6"], ["3", "12"],
      ["4", "4"], ["4", "12"],
      ["6", "6"], ["6", "12"],
      ["12", "12"],
    ],
  },
  {
    name: "Equivalence Modulo 3 on {0, 1, 2, 3, 4, 5}",
    description: "Equivalence relation where a ≡ b (mod 3). Generates 3 partition classes: [0], [1], [2].",
    elements: ["0", "1", "2", "3", "4", "5"],
    pairs: [
      ["0", "0"], ["0", "3"], ["3", "0"], ["3", "3"],
      ["1", "1"], ["1", "4"], ["4", "1"], ["4", "4"],
      ["2", "2"], ["2", "5"], ["5", "2"], ["5", "5"],
    ],
  },
  {
    name: "Strict Total Order < on {1, 2, 3, 4}",
    description: "Strict order (irreflexive & transitive): (1,2), (1,3), (1,4), (2,3), (2,4), (3,4).",
    elements: ["1", "2", "3", "4"],
    pairs: [
      ["1", "2"], ["1", "3"], ["1", "4"],
      ["2", "3"], ["2", "4"],
      ["3", "4"],
    ],
  },
];
