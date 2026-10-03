/**
 * Turing Machine (TM) & Infinite 2-Way Tape Memory Execution Engine
 * for LogicVerse Automata & Computability Engine.
 */
import type { Node, Edge } from "@xyflow/react";

export interface TmTransition {
  id: string;
  fromState: string;
  toState: string;
  readSymbol: string; // e.g. '0', '1', 'B', 'X', 'Y'
  writeSymbol: string; // e.g. '0', '1', 'B', 'X', 'Y'
  moveDirection: "L" | "R" | "S"; // Left, Right, Stationary
  rawLabel: string; // e.g. "0 / 1, R"
}

export interface TmDefinition {
  states: string[];
  inputAlphabet: string[];
  tapeAlphabet: string[];
  startState: string;
  blankSymbol: string;
  acceptStates: string[];
  rejectStates: string[];
  transitions: TmTransition[];
}

export interface TmStep {
  stepNumber: number;
  currentState: string;
  tape: string[]; // Current tape contents array
  headPosition: number; // 0-indexed position of tape head
  readSymbol: string;
  actionTaken: string;
  isAcceptState: boolean;
  isRejectState: boolean;
  isHalted: boolean;
}

export interface TmSimulationTrace {
  inputString: string;
  isAccepted: boolean;
  isHalted: boolean;
  finalState: string;
  finalTapeString: string;
  steps: TmStep[];
}

/**
 * Simulates a Turing Machine on an input string with dynamic 2-way infinite tape memory expansion.
 */
export function simulateTuringMachine(
  tm: TmDefinition,
  inputStr: string,
  maxSteps = 200
): TmSimulationTrace {
  const steps: TmStep[] = [];
  const blank = tm.blankSymbol || "B";

  // Initial tape: [B, char0, char1, ..., B]
  let tape: string[] = inputStr.length > 0 ? inputStr.split("") : [blank];
  let headPos = 0;
  let currentState = tm.startState || "q0";

  let stepNumber = 0;
  let isAccepted = false;
  let isHalted = false;

  steps.push({
    stepNumber: 0,
    currentState,
    tape: [...tape],
    headPosition: headPos,
    readSymbol: tape[headPos] || blank,
    actionTaken: `Initial configuration: Start at ${currentState} with tape [${tape.join(", ")}]`,
    isAcceptState: tm.acceptStates.includes(currentState),
    isRejectState: tm.rejectStates.includes(currentState),
    isHalted: false,
  });

  while (stepNumber < maxSteps) {
    // Check if in halting/accept state
    const isAccept = tm.acceptStates.includes(currentState);
    const isReject = tm.rejectStates.includes(currentState);

    if (isAccept || isReject) {
      isAccepted = isAccept;
      isHalted = true;
      break;
    }

    // Dynamic tape expansion if head is at left boundary < 0 or right boundary >= tape.length
    if (headPos < 0) {
      tape.unshift(blank);
      headPos = 0;
    }
    if (headPos >= tape.length) {
      tape.push(blank);
    }

    const scannedSymbol = tape[headPos] || blank;

    // Find matching transition δ(currentState, scannedSymbol)
    const transition = tm.transitions.find(
      (t) =>
        t.fromState === currentState &&
        (t.readSymbol === scannedSymbol || (t.readSymbol === "B" && scannedSymbol === "B"))
    );

    if (!transition) {
      // No transition defined for (currentState, scannedSymbol) -> TM halts (rejects if not accept)
      isHalted = true;
      isAccepted = tm.acceptStates.includes(currentState);
      break;
    }

    stepNumber++;

    // Write symbol to tape cell
    tape[headPos] = transition.writeSymbol;

    // Move tape head
    if (transition.moveDirection === "L") {
      headPos--;
    } else if (transition.moveDirection === "R") {
      headPos++;
    }

    currentState = transition.toState;

    steps.push({
      stepNumber,
      currentState,
      tape: [...tape],
      headPosition: Math.max(0, headPos),
      readSymbol: scannedSymbol,
      actionTaken: `Transition δ(${transition.fromState}, '${scannedSymbol}') ➔ (${transition.toState}, '${transition.writeSymbol}', ${transition.moveDirection})`,
      isAcceptState: tm.acceptStates.includes(currentState),
      isRejectState: tm.rejectStates.includes(currentState),
      isHalted: tm.acceptStates.includes(currentState) || tm.rejectStates.includes(currentState),
    });
  }

  isAccepted = tm.acceptStates.includes(currentState);

  return {
    inputString: inputStr,
    isAccepted,
    isHalted: true,
    finalState: currentState,
    finalTapeString: tape.join("").replace(new RegExp(`^${blank}+|${blank}+$`, "g"), ""),
    steps,
  };
}

/**
 * Generates preset Binary Number Incrementer TM (w + 1).
 */
export function generateBinaryIncrementerTmGraph(): {
  nodes: Node[];
  edges: Edge[];
  tm: TmDefinition;
} {
  const nodes: Node[] = [
    {
      id: "q0",
      type: "automata-state",
      position: { x: 100, y: 150 },
      data: { label: "q₀ (Right Scan)", isStart: true, isAccept: false },
    },
    {
      id: "q1",
      type: "automata-state",
      position: { x: 340, y: 150 },
      data: { label: "q₁ (Add & Carry)", isStart: false, isAccept: false },
    },
    {
      id: "qf",
      type: "automata-state",
      position: { x: 580, y: 150 },
      data: { label: "q𝐹 (Halt)", isStart: false, isAccept: true },
    },
  ];

  const tmTransitions: TmTransition[] = [
    {
      id: "t1",
      fromState: "q0",
      toState: "q0",
      readSymbol: "0",
      writeSymbol: "0",
      moveDirection: "R",
      rawLabel: "0 / 0, R",
    },
    {
      id: "t2",
      fromState: "q0",
      toState: "q0",
      readSymbol: "1",
      writeSymbol: "1",
      moveDirection: "R",
      rawLabel: "1 / 1, R",
    },
    {
      id: "t3",
      fromState: "q0",
      toState: "q1",
      readSymbol: "B",
      writeSymbol: "B",
      moveDirection: "L",
      rawLabel: "B / B, L",
    },
    {
      id: "t4",
      fromState: "q1",
      toState: "q1",
      readSymbol: "1",
      writeSymbol: "0",
      moveDirection: "L",
      rawLabel: "1 / 0, L",
    },
    {
      id: "t5",
      fromState: "q1",
      toState: "qf",
      readSymbol: "0",
      writeSymbol: "1",
      moveDirection: "S",
      rawLabel: "0 / 1, S",
    },
    {
      id: "t6",
      fromState: "q1",
      toState: "qf",
      readSymbol: "B",
      writeSymbol: "1",
      moveDirection: "S",
      rawLabel: "B / 1, S",
    },
  ];

  const edges: Edge[] = [
    {
      id: "e-q0-q0",
      source: "q0",
      target: "q0",
      label: "0/0,R | 1/1,R",
      animated: true,
      style: { stroke: "#38BDF8", strokeWidth: 2 },
    },
    {
      id: "e-q0-q1",
      source: "q0",
      target: "q1",
      label: "B / B, L",
      animated: true,
      style: { stroke: "#38BDF8", strokeWidth: 2 },
    },
    {
      id: "e-q1-q1",
      source: "q1",
      target: "q1",
      label: "1 / 0, L",
      animated: true,
      style: { stroke: "#38BDF8", strokeWidth: 2 },
    },
    {
      id: "e-q1-qf",
      source: "q1",
      target: "qf",
      label: "0/1,S | B/1,S",
      animated: true,
      style: { stroke: "#38BDF8", strokeWidth: 2 },
    },
  ];

  const tm: TmDefinition = {
    states: ["q0", "q1", "qf"],
    inputAlphabet: ["0", "1"],
    tapeAlphabet: ["0", "1", "B"],
    startState: "q0",
    blankSymbol: "B",
    acceptStates: ["qf"],
    rejectStates: [],
    transitions: tmTransitions,
  };

  return { nodes, edges, tm };
}
