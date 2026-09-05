import { describe, it, expect } from "vitest";
import {
  simulateAutomaton,
  computeEpsilonClosure,
  convertNfaToDfa,
  minimizeDFA,
  simulateMooreMealy,
  type AutomatonDefinition,
} from "../automata";

describe("Automata Engine Tests", () => {
  // DFA accepting strings ending in "01"
  // q0 --0--> q1, q0 --1--> q0
  // q1 --0--> q1, q1 --1--> q2 (accept)
  // q2 --0--> q1, q2 --1--> q0
  const dfaEnding01: AutomatonDefinition = {
    type: "DFA",
    alphabet: ["0", "1"],
    states: [
      { id: "q0", label: "q0", isStart: true, isAccept: false },
      { id: "q1", label: "q1", isStart: false, isAccept: false },
      { id: "q2", label: "q2", isStart: false, isAccept: true },
    ],
    transitions: [
      { id: "t1", source: "q0", target: "q1", symbol: "0" },
      { id: "t2", source: "q0", target: "q0", symbol: "1" },
      { id: "t3", source: "q1", target: "q1", symbol: "0" },
      { id: "t4", source: "q1", target: "q2", symbol: "1" },
      { id: "t5", source: "q2", target: "q1", symbol: "0" },
      { id: "t6", source: "q2", target: "q0", symbol: "1" },
    ],
  };

  it("should accept valid string '101' in DFA ending in 01", () => {
    const sim = simulateAutomaton(dfaEnding01, "101");
    expect(sim.isAccepted).toBe(true);
    expect(sim.steps.length).toBe(4); // step 0 (start), step 1 ('1'), step 2 ('0'), step 3 ('1')
    expect(sim.finalStateIds).toContain("q2");
  });

  it("should reject invalid string '1010' in DFA ending in 01", () => {
    const sim = simulateAutomaton(dfaEnding01, "1010");
    expect(sim.isAccepted).toBe(false);
    expect(sim.finalStateIds).toContain("q1");
  });

  it("should calculate epsilon closures correctly", () => {
    const epsTransitions = [
      { id: "e1", source: "q0", target: "q1", symbol: "ε" },
      { id: "e2", source: "q1", target: "q2", symbol: "ε" },
    ];
    const closure = computeEpsilonClosure(["q0"], epsTransitions);
    expect(closure.sort()).toEqual(["q0", "q1", "q2"]);
  });

  it("should convert NFA to DFA via Subset Construction", () => {
    const nfa: AutomatonDefinition = {
      type: "NFA",
      alphabet: ["0", "1"],
      states: [
        { id: "A", label: "A", isStart: true, isAccept: false },
        { id: "B", label: "B", isStart: false, isAccept: true },
      ],
      transitions: [
        { id: "t1", source: "A", target: "A", symbol: "0, 1" },
        { id: "t2", source: "A", target: "B", symbol: "1" },
      ],
    };
    const res = convertNfaToDfa(nfa);
    expect(res.steps.length).toBeGreaterThan(0);
    expect(res.convertedDfaNodes.length).toBeGreaterThan(0);
  });

  it("should minimize DFA using Hopcroft partition refinement", () => {
    const minRes = minimizeDFA(dfaEnding01);
    expect(minRes.minimizedStateCount).toBeLessThanOrEqual(3);
    expect(minRes.partitionSteps.length).toBeGreaterThan(0);
  });

  it("should simulate Moore machine transduction correctly", () => {
    const moore: AutomatonDefinition = {
      type: "Moore",
      alphabet: ["a", "b"],
      states: [
        { id: "q0", label: "q0", isStart: true, isAccept: false, mooreOutput: "0" },
        { id: "q1", label: "q1", isStart: false, isAccept: false, mooreOutput: "1" },
      ],
      transitions: [
        { id: "t1", source: "q0", target: "q1", symbol: "a" },
        { id: "t2", source: "q1", target: "q0", symbol: "b" },
      ],
    };

    const res = simulateMooreMealy(moore, "ab");
    expect(res.outputString).toBe("010"); // initial q0(0) -> read 'a' -> q1(1) -> read 'b' -> q0(0)
  });
});
