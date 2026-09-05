// Automata Theory Engine for LogicVerse
// Handles DFA, NFA, ε-NFA step-by-step simulation, NFA->DFA Subset Construction,
// DFA Minimization (Partition Refinement), and Moore/Mealy machine transduction.

import type { Node, Edge } from "@xyflow/react";

export interface AutomatonState {
  id: string;
  label: string;
  isStart: boolean;
  isAccept: boolean;
  mooreOutput?: string;
  x?: number;
  y?: number;
}

export interface AutomatonTransition {
  id: string;
  source: string;
  target: string;
  symbol: string; // e.g. "0", "1", "ε", "0, 1"
  mealyOutput?: string;
}

export interface AutomatonDefinition {
  type: "DFA" | "NFA" | "E-NFA" | "Moore" | "Mealy";
  alphabet: string[];
  states: AutomatonState[];
  transitions: AutomatonTransition[];
}

export interface SimulationStep {
  stepIndex: number;
  charConsumed: string | null;
  activeStateIds: string[];
  activeEdgeIds: string[];
  remainingString: string;
  consumedPrefix: string;
  description: string;
  transitionRule: string;
  isAccepted?: boolean;
}

export interface AutomatonSimulation {
  inputString: string;
  isAccepted: boolean;
  finalStateIds: string[];
  steps: SimulationStep[];
  explanation: string;
  error?: string;
}

export interface SubsetConstructionRow {
  dfaStateId: string;
  dfaStateLabel: string;
  nfaStateIds: string[];
  epsilonClosure: string[];
  transitions: Record<string, string>; // symbol -> target DFA state label
  isAccept: boolean;
  isStart: boolean;
}

export interface SubsetConstructionResult {
  steps: SubsetConstructionRow[];
  convertedDfaNodes: Node[];
  convertedDfaEdges: Edge[];
  explanation: string;
}

export interface MinimizationPartitionStep {
  stepNumber: number;
  partitions: string[][]; // array of state label groups
  description: string;
}

export interface MinimizationResult {
  originalStateCount: number;
  minimizedStateCount: number;
  distinguishabilityMatrix: Record<string, Record<string, boolean>>; // stateLabelA -> stateLabelB -> distinguishable
  partitionSteps: MinimizationPartitionStep[];
  minimizedNodes: Node[];
  minimizedEdges: Edge[];
  explanation: string;
}

export interface MooreMealyStep {
  stepIndex: number;
  charConsumed: string | null;
  activeStateId: string;
  outputGenerated: string;
  cumulativeOutput: string;
  remainingString: string;
  description: string;
}

export interface MooreMealyResult {
  type: "Moore" | "Mealy";
  inputString: string;
  outputString: string;
  steps: MooreMealyStep[];
}

// Convert React Flow Canvas Nodes & Edges to AutomatonDefinition
export function parseCanvasToAutomaton(nodes: Node[], edges: Edge[]): AutomatonDefinition {
  const states: AutomatonState[] = nodes
    .filter((n) => n.type === "automata-state" || n.data?.kind === "state")
    .map((n) => ({
      id: n.id,
      label: (n.data?.label as string) || n.id,
      isStart: Boolean(n.data?.isStart),
      isAccept: Boolean(n.data?.isAccept),
      mooreOutput: (n.data?.mooreOutput as string) || "0",
      x: n.position.x,
      y: n.position.y,
    }));

  const transitions: AutomatonTransition[] = edges.map((e) => {
    const symbolRaw = (e.label as string) || (e.data?.symbol as string) || "ε";
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      symbol: symbolRaw.trim(),
      mealyOutput: (e.data?.mealyOutput as string) || "0",
    };
  });

  // Collect alphabet symbols (excluding ε/eps)
  const alphabetSet = new Set<string>();
  transitions.forEach((t) => {
    const syms = t.symbol.split(",").map((s) => s.trim());
    syms.forEach((s) => {
      if (s && s !== "ε" && s !== "eps" && s !== "lambda" && s !== "λ") {
        alphabetSet.add(s);
      }
    });
  });

  // Determine type
  let isNFA = false;
  let hasEpsilon = false;

  const transitionMap = new Map<string, Set<string>>();
  transitions.forEach((t) => {
    const syms = t.symbol.split(",").map((s) => s.trim());
    syms.forEach((s) => {
      if (s === "ε" || s === "eps" || s === "lambda" || s === "λ") {
        hasEpsilon = true;
        isNFA = true;
      } else {
        const key = `${t.source}:${s}`;
        if (!transitionMap.has(key)) {
          transitionMap.set(key, new Set());
        }
        const set = transitionMap.get(key)!;
        set.add(t.target);
        if (set.size > 1) {
          isNFA = true;
        }
      }
    });
  });

  const type = hasEpsilon ? "E-NFA" : isNFA ? "NFA" : "DFA";

  return {
    type,
    alphabet: Array.from(alphabetSet).sort(),
    states,
    transitions,
  };
}

// Compute Epsilon-Closure of a set of state IDs
export function computeEpsilonClosure(
  stateIds: string[],
  transitions: AutomatonTransition[]
): string[] {
  const closure = new Set<string>(stateIds);
  const queue = [...stateIds];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const epsTransitions = transitions.filter((t) => {
      if (t.source !== current) return false;
      const syms = t.symbol.split(",").map((s) => s.trim());
      return syms.some((s) => s === "ε" || s === "eps" || s === "lambda" || s === "λ");
    });

    epsTransitions.forEach((t) => {
      if (!closure.has(t.target)) {
        closure.add(t.target);
        queue.push(t.target);
      }
    });
  }

  return Array.from(closure);
}

// Simulate DFA or NFA on an input string
export function simulateAutomaton(
  automaton: AutomatonDefinition,
  inputString: string
): AutomatonSimulation {
  const { states, transitions } = automaton;

  if (states.length === 0) {
    return {
      inputString,
      isAccepted: false,
      finalStateIds: [],
      steps: [],
      explanation: "No states defined in the automaton.",
      error: "Automaton is empty.",
    };
  }

  // Find start state (default to first state if none explicitly set)
  let startState = states.find((s) => s.isStart);
  if (!startState) {
    startState = states[0];
  }

  // Initial state set with ε-closure
  const initialClosure = computeEpsilonClosure([startState.id], transitions);

  const stateMap = new Map(states.map((s) => [s.id, s]));
  const getLabels = (ids: string[]) =>
    ids.map((id) => stateMap.get(id)?.label || id).join(", ");

  const steps: SimulationStep[] = [];

  // Step 0: Start Configuration
  steps.push({
    stepIndex: 0,
    charConsumed: null,
    activeStateIds: initialClosure,
    activeEdgeIds: [],
    remainingString: inputString,
    consumedPrefix: "",
    description: `Start machine in initial state ${getLabels(initialClosure)}${
      initialClosure.length > 1 ? ` (including ε-closure)` : ""
    }.`,
    transitionRule: `Initial State q₀ = { ${getLabels(initialClosure)} }`,
  });

  let currentActiveStateIds = initialClosure;

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];
    const consumedPrefix = inputString.slice(0, i + 1);
    const remainingString = inputString.slice(i + 1);

    const nextStateIdsSet = new Set<string>();
    const activeEdgeIdsSet = new Set<string>();

    // For each currently active state, find transitions matching `char`
    currentActiveStateIds.forEach((stateId) => {
      const outgoing = transitions.filter((t) => {
        if (t.source !== stateId) return false;
        const syms = t.symbol.split(",").map((s) => s.trim());
        return syms.includes(char);
      });

      outgoing.forEach((t) => {
        activeEdgeIdsSet.add(t.id);
        nextStateIdsSet.add(t.target);
      });
    });

    // Compute ε-closure of target states
    const directTargets = Array.from(nextStateIdsSet);
    const closureTargets = computeEpsilonClosure(directTargets, transitions);

    const fromLabels = getLabels(currentActiveStateIds);
    const toLabels = closureTargets.length > 0 ? getLabels(closureTargets) : "∅ (Dead State)";

    steps.push({
      stepIndex: i + 1,
      charConsumed: char,
      activeStateIds: closureTargets,
      activeEdgeIds: Array.from(activeEdgeIdsSet),
      remainingString,
      consumedPrefix,
      description:
        closureTargets.length > 0
          ? `Read symbol '${char}': transitioned from { ${fromLabels} } to { ${toLabels} }.`
          : `Read symbol '${char}': no valid transition from { ${fromLabels} } (reached dead state).`,
      transitionRule: `δ({ ${fromLabels} }, '${char}') → { ${toLabels} }`,
    });

    currentActiveStateIds = closureTargets;

    if (currentActiveStateIds.length === 0) {
      break;
    }
  }

  // Check acceptance: at least one active state is an accept state
  const acceptStateIds = states.filter((s) => s.isAccept).map((s) => s.id);
  const isAccepted = currentActiveStateIds.some((id) => acceptStateIds.includes(id));

  // Update final step acceptance flag
  if (steps.length > 0) {
    steps[steps.length - 1].isAccepted = isAccepted;
  }

  const finalLabels = getLabels(currentActiveStateIds);
  const acceptLabels = getLabels(acceptStateIds);

  const explanation = isAccepted
    ? `✅ String "${inputString}" is **ACCEPTED**! The computation ended in state(s) { ${finalLabels} }, which intersects accepting states F = { ${acceptLabels} }.`
    : `❌ String "${inputString}" is **REJECTED**. The computation ended in state(s) { ${
        finalLabels || "∅"
      } }, which contains no accepting states (F = { ${acceptLabels || "none"} }).`;

  return {
    inputString,
    isAccepted,
    finalStateIds: currentActiveStateIds,
    steps,
    explanation,
  };
}

// Subset Construction: Convert NFA / ε-NFA to DFA
export function convertNfaToDfa(automaton: AutomatonDefinition): SubsetConstructionResult {
  const { states, transitions, alphabet } = automaton;

  if (states.length === 0) {
    return {
      steps: [],
      convertedDfaNodes: [],
      convertedDfaEdges: [],
      explanation: "Canvas has no states to convert.",
    };
  }

  const startState = states.find((s) => s.isStart) || states[0];
  const initialClosure = computeEpsilonClosure([startState.id], transitions).sort();

  const stateMap = new Map(states.map((s) => [s.id, s]));
  const getSubsetLabel = (ids: string[]) => {
    if (ids.length === 0) return "∅";
    return "{" + ids.map((id) => stateMap.get(id)?.label || id).sort().join(",") + "}";
  };

  const dfaStatesMap = new Map<string, string[]>(); // key: subsetKey, value: nfaIds
  const subsetKey = (ids: string[]) => [...ids].sort().join(",");

  const queue: string[][] = [initialClosure];
  dfaStatesMap.set(subsetKey(initialClosure), initialClosure);

  const rows: SubsetConstructionRow[] = [];
  const dfaTransitionsList: { fromKey: string; symbol: string; toKey: string }[] = [];

  let dfaCounter = 0;
  const stateIdToDfaName = new Map<string, string>();
  stateIdToDfaName.set(subsetKey(initialClosure), `Q${dfaCounter++}`);

  while (queue.length > 0) {
    const currentSubset = queue.shift()!;
    const curKey = subsetKey(currentSubset);
    const curDfaName = stateIdToDfaName.get(curKey) || `Q${dfaCounter++}`;

    const transitionsRow: Record<string, string> = {};
    const isAccept = currentSubset.some((id) => stateMap.get(id)?.isAccept);
    const isStart = curKey === subsetKey(initialClosure);

    alphabet.forEach((char) => {
      const nextNfaIdsSet = new Set<string>();
      currentSubset.forEach((nfaId) => {
        const outgoing = transitions.filter((t) => {
          if (t.source !== nfaId) return false;
          const syms = t.symbol.split(",").map((s) => s.trim());
          return syms.includes(char);
        });
        outgoing.forEach((t) => nextNfaIdsSet.add(t.target));
      });

      const nextClosure = computeEpsilonClosure(Array.from(nextNfaIdsSet), transitions).sort();
      const nextKey = subsetKey(nextClosure);

      if (!stateIdToDfaName.has(nextKey)) {
        stateIdToDfaName.set(nextKey, `Q${dfaCounter++}`);
        dfaStatesMap.set(nextKey, nextClosure);
        queue.push(nextClosure);
      }

      const targetDfaName = stateIdToDfaName.get(nextKey)!;
      const targetSubLabel = getSubsetLabel(nextClosure);
      transitionsRow[char] = `${targetDfaName} (${targetSubLabel})`;

      dfaTransitionsList.push({
        fromKey: curKey,
        symbol: char,
        toKey: nextKey,
      });
    });

    rows.push({
      dfaStateId: curDfaName,
      dfaStateLabel: `${curDfaName} = ${getSubsetLabel(currentSubset)}`,
      nfaStateIds: currentSubset,
      epsilonClosure: currentSubset,
      transitions: transitionsRow,
      isAccept,
      isStart,
    });
  }

  // Build React Flow Nodes & Edges for converted DFA
  const convertedDfaNodes: Node[] = Array.from(dfaStatesMap.entries()).map(([key, ids], index) => {
    const dfaName = stateIdToDfaName.get(key)!;
    const isAccept = ids.some((id) => stateMap.get(id)?.isAccept);
    const isStart = key === subsetKey(initialClosure);
    const subLabel = getSubsetLabel(ids);

    const angle = (index / dfaStatesMap.size) * 2 * Math.PI;
    const radius = 180;
    const x = Math.cos(angle) * radius + 250;
    const y = Math.sin(angle) * radius + 200;

    return {
      id: dfaName,
      type: "automata-state",
      position: { x, y },
      data: {
        label: `${dfaName}\n${subLabel}`,
        isStart,
        isAccept,
        kind: "state",
      },
    };
  });

  const convertedDfaEdges: Edge[] = [];
  const edgeGroupMap = new Map<string, string[]>();

  dfaTransitionsList.forEach(({ fromKey, symbol, toKey }) => {
    const source = stateIdToDfaName.get(fromKey)!;
    const target = stateIdToDfaName.get(toKey)!;
    const edgeKey = `${source}->${target}`;

    if (!edgeGroupMap.has(edgeKey)) {
      edgeGroupMap.set(edgeKey, []);
    }
    edgeGroupMap.get(edgeKey)!.push(symbol);
  });

  let edgeIdx = 0;
  edgeGroupMap.forEach((symbols, edgeKey) => {
    const [source, target] = edgeKey.split("->");
    convertedDfaEdges.push({
      id: `dfa-edge-${edgeIdx++}`,
      source,
      target,
      label: symbols.join(", "),
      style: { stroke: "#38BDF8", strokeWidth: 2 },
      animated: true,
    });
  });

  const explanation = `Converted NFA (${states.length} states) to deterministic DFA (${rows.length} states) using Subset Construction power-set algorithm over alphabet Σ = { ${alphabet.join(", ")} }.`;

  return {
    steps: rows,
    convertedDfaNodes,
    convertedDfaEdges,
    explanation,
  };
}

// DFA Minimization Algorithm (Hopcroft / Partition Refinement)
export function minimizeDFA(automaton: AutomatonDefinition): MinimizationResult {
  const { states, transitions, alphabet } = automaton;

  if (states.length === 0) {
    return {
      originalStateCount: 0,
      minimizedStateCount: 0,
      distinguishabilityMatrix: {},
      partitionSteps: [],
      minimizedNodes: [],
      minimizedEdges: [],
      explanation: "Canvas has no states to minimize.",
    };
  }

  const stateMap = new Map(states.map((s) => [s.id, s]));

  const acceptGroup = states.filter((s) => s.isAccept).map((s) => s.id);
  const nonAcceptGroup = states.filter((s) => !s.isAccept).map((s) => s.id);

  let partitions: string[][] = [];
  if (acceptGroup.length > 0) partitions.push(acceptGroup);
  if (nonAcceptGroup.length > 0) partitions.push(nonAcceptGroup);

  const partitionSteps: MinimizationPartitionStep[] = [
    {
      stepNumber: 0,
      partitions: partitions.map((p) => p.map((id) => stateMap.get(id)?.label || id)),
      description: "Initial 0-equivalence partition: separate accepting states F from non-accepting states (Q \\ F).",
    },
  ];

  const delta = (stateId: string, char: string): string | null => {
    const match = transitions.find((t) => {
      if (t.source !== stateId) return false;
      const syms = t.symbol.split(",").map((s) => s.trim());
      return syms.includes(char);
    });
    return match ? match.target : null;
  };

  const getPartitionIndex = (stateId: string, parts: string[][]): number => {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].includes(stateId)) return i;
    }
    return -1;
  };

  let changed = true;
  let stepNum = 1;

  while (changed) {
    changed = false;
    const newPartitions: string[][] = [];

    for (const group of partitions) {
      if (group.length <= 1) {
        newPartitions.push(group);
        continue;
      }

      const subGroups = new Map<string, string[]>();

      for (const stateId of group) {
        const signature = alphabet
          .map((char) => {
            const targetId = delta(stateId, char);
            return targetId ? String(getPartitionIndex(targetId, partitions)) : "dead";
          })
          .join("|");

        if (!subGroups.has(signature)) {
          subGroups.set(signature, []);
        }
        subGroups.get(signature)!.push(stateId);
      }

      const splitList = Array.from(subGroups.values());
      if (splitList.length > 1) {
        changed = true;
      }
      newPartitions.push(...splitList);
    }

    partitions = newPartitions;
    partitionSteps.push({
      stepNumber: stepNum++,
      partitions: partitions.map((p) => p.map((id) => stateMap.get(id)?.label || id)),
      description: changed
        ? `Step ${stepNum - 1}: Refined equivalence partitions by checking transition targets.`
        : `Step ${stepNum - 1}: Partitioning converged! No further state splits possible.`,
    });
  }

  const distinguishabilityMatrix: Record<string, Record<string, boolean>> = {};
  states.forEach((s1) => {
    distinguishabilityMatrix[s1.label] = {};
    states.forEach((s2) => {
      const p1 = getPartitionIndex(s1.id, partitions);
      const p2 = getPartitionIndex(s2.id, partitions);
      distinguishabilityMatrix[s1.label][s2.label] = p1 !== p2;
    });
  });

  const minimizedNodes: Node[] = partitions.map((group, index) => {
    const labelGroup = group.map((id) => stateMap.get(id)?.label || id).join(",");
    const isStart = group.some((id) => stateMap.get(id)?.isStart);
    const isAccept = group.some((id) => stateMap.get(id)?.isAccept);

    const angle = (index / partitions.length) * 2 * Math.PI;
    const radius = 160;

    return {
      id: `min-${index}`,
      type: "automata-state",
      position: {
        x: Math.cos(angle) * radius + 250,
        y: Math.sin(angle) * radius + 200,
      },
      data: {
        label: `{${labelGroup}}`,
        isStart,
        isAccept,
        kind: "state",
      },
    };
  });

  const minimizedEdges: Edge[] = [];
  const edgeMap = new Map<string, string[]>();

  partitions.forEach((group, fromIndex) => {
    const repStateId = group[0];
    alphabet.forEach((char) => {
      const targetId = delta(repStateId, char);
      if (targetId) {
        const toIndex = getPartitionIndex(targetId, partitions);
        if (toIndex !== -1) {
          const key = `min-${fromIndex}->min-${toIndex}`;
          if (!edgeMap.has(key)) edgeMap.set(key, []);
          edgeMap.get(key)!.push(char);
        }
      }
    });
  });

  let edgeCounter = 0;
  edgeMap.forEach((syms, key) => {
    const [source, target] = key.split("->");
    minimizedEdges.push({
      id: `min-edge-${edgeCounter++}`,
      source,
      target,
      label: Array.from(new Set(syms)).join(", "),
      style: { stroke: "#A855F7", strokeWidth: 2 },
      animated: true,
    });
  });

  const explanation = `DFA minimized from ${states.length} states down to ${partitions.length} minimal equivalent states using Hopcroft's partition refinement algorithm.`;

  return {
    originalStateCount: states.length,
    minimizedStateCount: partitions.length,
    distinguishabilityMatrix,
    partitionSteps,
    minimizedNodes,
    minimizedEdges,
    explanation,
  };
}

// Moore & Mealy Transducer Simulator
export function simulateMooreMealy(
  automaton: AutomatonDefinition,
  inputString: string
): MooreMealyResult {
  const { states, transitions } = automaton;

  if (states.length === 0) {
    return {
      type: automaton.type === "Mealy" ? "Mealy" : "Moore",
      inputString,
      outputString: "",
      steps: [],
    };
  }

  const isMealy = automaton.type === "Mealy";
  const startState = states.find((s) => s.isStart) || states[0];
  const stateMap = new Map(states.map((s) => [s.id, s]));

  let currentState = startState;
  const steps: MooreMealyStep[] = [];
  let cumulativeOutput = "";

  if (!isMealy) {
    const initialOut = currentState.mooreOutput || "0";
    cumulativeOutput += initialOut;
    steps.push({
      stepIndex: 0,
      charConsumed: null,
      activeStateId: currentState.id,
      outputGenerated: initialOut,
      cumulativeOutput,
      remainingString: inputString,
      description: `Start in state ${currentState.label}. Moore state output = '${initialOut}'.`,
    });
  }

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];
    const remainingString = inputString.slice(i + 1);

    const outgoing = transitions.find((t) => {
      if (t.source !== currentState.id) return false;
      const syms = t.symbol.split(",").map((s) => s.trim());
      return syms.includes(char);
    });

    if (!outgoing) {
      steps.push({
        stepIndex: steps.length,
        charConsumed: char,
        activeStateId: currentState.id,
        outputGenerated: "∅",
        cumulativeOutput,
        remainingString,
        description: `Read '${char}': No transition rule from ${currentState.label}. Halting transducer.`,
      });
      break;
    }

    const nextState = stateMap.get(outgoing.target) || currentState;
    const outputGen = isMealy ? outgoing.mealyOutput || "0" : nextState.mooreOutput || "0";
    cumulativeOutput += outputGen;

    steps.push({
      stepIndex: steps.length,
      charConsumed: char,
      activeStateId: nextState.id,
      outputGenerated: outputGen,
      cumulativeOutput,
      remainingString,
      description: isMealy
        ? `Read '${char}': Transition ${currentState.label} → ${nextState.label} produces Mealy edge output '${outputGen}'.`
        : `Read '${char}': Transition ${currentState.label} → ${nextState.label}. Moore state output = '${outputGen}'.`,
    });

    currentState = nextState;
  }

  return {
    type: isMealy ? "Mealy" : "Moore",
    inputString,
    outputString: cumulativeOutput,
    steps,
  };
}
