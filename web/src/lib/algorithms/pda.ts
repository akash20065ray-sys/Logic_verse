/**
 * Pushdown Automata (PDA) & Stack Memory Execution Engine
 * for LogicVerse Automata Theory Engine.
 */
import type { Node, Edge } from "@xyflow/react";

export interface PdaTransition {
  id: string;
  fromState: string;
  toState: string;
  inputSymbol: string; // 'a', 'b', or 'ε'
  popSymbol: string; // 'Z0', 'A', 'B', or 'ε'
  pushSymbols: string[]; // e.g. ['A', 'Z0'] or ['ε'] or ['A', 'A']
  rawLabel: string; // e.g. "a, Z₀ / A Z₀"
}

export interface PdaDefinition {
  states: string[];
  inputAlphabet: string[];
  stackAlphabet: string[];
  startState: string;
  initialStackSymbol: string;
  acceptStates: string[];
  transitions: PdaTransition[];
}

export interface PdaStep {
  stepNumber: number;
  currentState: string;
  consumedInput: string;
  remainingInput: string;
  currentSymbol: string;
  stack: string[]; // Top of stack is first element stack[0]
  actionTaken: string;
  isAcceptingState: boolean;
  isEmptyStack: boolean;
}

export interface PdaSimulationTrace {
  inputString: string;
  isAcceptedFinalState: boolean;
  isAcceptedEmptyStack: boolean;
  steps: PdaStep[];
}

/**
 * Simulates PDA execution on an input string.
 */
export function simulatePda(
  pda: PdaDefinition,
  inputStr: string
): PdaSimulationTrace {
  const steps: PdaStep[] = [];
  let currentState = pda.startState;
  let remaining = inputStr;
  let consumed = "";
  let stack = [pda.initialStackSymbol || "Z₀"];

  let stepNumber = 0;
  let isAcceptedFinal = false;
  let isAcceptedEmpty = false;

  steps.push({
    stepNumber: 0,
    currentState,
    consumedInput: "",
    remainingInput: remaining,
    currentSymbol: "ε",
    stack: [...stack],
    actionTaken: `Initial configuration: Start at ${currentState} with stack [ ${stack.join(", ")} ]`,
    isAcceptingState: pda.acceptStates.includes(currentState),
    isEmptyStack: stack.length === 0,
  });

  const maxSteps = 100; // Safeguard against infinite loops

  while (stepNumber < maxSteps) {
    stepNumber++;

    // Check if configuration is already accepted
    const isFinal = pda.acceptStates.includes(currentState);
    const isEmpty = stack.length === 0;

    if (remaining.length === 0 && (isFinal || isEmpty)) {
      isAcceptedFinal = isFinal;
      isAcceptedEmpty = isEmpty;
      break;
    }

    const currentInput = remaining.length > 0 ? remaining[0] : "ε";
    const topStack = stack.length > 0 ? stack[0] : "ε";

    // Find matching transition (prefer exact input symbol match over ε-transitions)
    let transition = pda.transitions.find(
      (t) =>
        t.fromState === currentState &&
        t.inputSymbol === currentInput &&
        (t.popSymbol === topStack || t.popSymbol === "ε")
    );

    if (!transition) {
      transition = pda.transitions.find(
        (t) =>
          t.fromState === currentState &&
          t.inputSymbol === "ε" &&
          (t.popSymbol === topStack || t.popSymbol === "ε")
      );
    }

    if (!transition) {
      // No valid transition found for current configuration
      break;
    }

    // Execute transition:
    // 1. Consume input if not ε
    if (transition.inputSymbol !== "ε" && remaining.length > 0) {
      consumed += remaining[0];
      remaining = remaining.slice(1);
    }

    // 2. Pop stack symbol if not ε
    if (transition.popSymbol !== "ε" && stack.length > 0) {
      stack.shift();
    }

    // 3. Push new symbols onto stack top (in reverse so pushSymbols[0] becomes new top)
    if (transition.pushSymbols.length > 0 && transition.pushSymbols[0] !== "ε") {
      stack = [...transition.pushSymbols, ...stack];
    }

    currentState = transition.toState;

    steps.push({
      stepNumber,
      currentState,
      consumedInput: consumed,
      remainingInput: remaining,
      currentSymbol: currentInput,
      stack: [...stack],
      actionTaken: `Transition ${transition.fromState} ➔ ${transition.toState} (${transition.rawLabel})`,
      isAcceptingState: pda.acceptStates.includes(currentState),
      isEmptyStack: stack.length === 0,
    });
  }

  isAcceptedFinal = remaining.length === 0 && pda.acceptStates.includes(currentState);
  isAcceptedEmpty = remaining.length === 0 && stack.length === 0;

  return {
    inputString: inputStr,
    isAcceptedFinalState: isAcceptedFinal,
    isAcceptedEmptyStack: isAcceptedEmpty,
    steps,
  };
}

/**
 * Generates preset PDA definitions and React Flow canvas nodes/edges for L = { aⁿ bⁿ | n ≥ 1 }.
 */
export function generateAnBnPdaGraph(): {
  nodes: Node[];
  edges: Edge[];
  pda: PdaDefinition;
} {
  const nodes: Node[] = [
    {
      id: "q0",
      type: "automata-state",
      position: { x: 100, y: 150 },
      data: { label: "q₀", isStart: true, isAccept: false },
    },
    {
      id: "q1",
      type: "automata-state",
      position: { x: 300, y: 150 },
      data: { label: "q₁", isStart: false, isAccept: false },
    },
    {
      id: "qf",
      type: "automata-state",
      position: { x: 500, y: 150 },
      data: { label: "q𝐹", isStart: false, isAccept: true },
    },
  ];

  const pdaTransitions: PdaTransition[] = [
    {
      id: "t0f",
      fromState: "q0",
      toState: "qf",
      inputSymbol: "ε",
      popSymbol: "Z0",
      pushSymbols: ["Z0"],
      rawLabel: "ε, Z₀ / Z₀",
    },
    {
      id: "t1",
      fromState: "q0",
      toState: "q0",
      inputSymbol: "a",
      popSymbol: "Z0",
      pushSymbols: ["A", "Z0"],
      rawLabel: "a, Z₀ / A Z₀",
    },
    {
      id: "t2",
      fromState: "q0",
      toState: "q0",
      inputSymbol: "a",
      popSymbol: "A",
      pushSymbols: ["A", "A"],
      rawLabel: "a, A / A A",
    },
    {
      id: "t3",
      fromState: "q0",
      toState: "q1",
      inputSymbol: "b",
      popSymbol: "A",
      pushSymbols: [],
      rawLabel: "b, A / ε",
    },
    {
      id: "t4",
      fromState: "q1",
      toState: "q1",
      inputSymbol: "b",
      popSymbol: "A",
      pushSymbols: [],
      rawLabel: "b, A / ε",
    },
    {
      id: "t5",
      fromState: "q1",
      toState: "qf",
      inputSymbol: "ε",
      popSymbol: "Z0",
      pushSymbols: ["Z0"],
      rawLabel: "ε, Z₀ / Z₀",
    },
  ];

  const edges: Edge[] = [
    {
      id: "e-q0-q0",
      source: "q0",
      target: "q0",
      label: "a, Z₀/AZ₀ | a, A/AA",
      animated: true,
      style: { stroke: "#38BDF8", strokeWidth: 2 },
    },
    {
      id: "e-q0-q1",
      source: "q0",
      target: "q1",
      label: "b, A / ε",
      animated: true,
      style: { stroke: "#38BDF8", strokeWidth: 2 },
    },
    {
      id: "e-q1-q1",
      source: "q1",
      target: "q1",
      label: "b, A / ε",
      animated: true,
      style: { stroke: "#38BDF8", strokeWidth: 2 },
    },
    {
      id: "e-q1-qf",
      source: "q1",
      target: "qf",
      label: "ε, Z₀ / Z₀",
      animated: true,
      style: { stroke: "#38BDF8", strokeWidth: 2 },
    },
  ];

  const pda: PdaDefinition = {
    states: ["q0", "q1", "qf"],
    inputAlphabet: ["a", "b"],
    stackAlphabet: ["Z0", "A"],
    startState: "q0",
    initialStackSymbol: "Z0",
    acceptStates: ["qf"],
    transitions: pdaTransitions,
  };

  return { nodes, edges, pda };
}
