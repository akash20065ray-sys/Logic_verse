import { evaluateCanvasGraph } from "@/lib/algorithms/graph-evaluator";
import { evaluateLogicGraph } from "@/lib/algorithms/logic-graph-evaluator";
import {
  evaluateRelationProperties,
  computeWarshall,
  computeHasseDiagram,
  analyzeFunction,
} from "@/lib/algorithms/relations";
import {
  simulateAutomaton,
} from "@/lib/algorithms/automata";
import {
  testRegexMatch,
  buildThompsonNfa,
  generatePumpingLemmaProof,
} from "@/lib/algorithms/regex";
import {
  parseGrammarText,
  convertGrammarToCNF,
  runCykParser,
} from "@/lib/algorithms/cfg";
import { simulatePda, generateAnBnPdaGraph } from "@/lib/algorithms/pda";
import {
  simulateTuringMachine,
  generateBinaryIncrementerTmGraph,
} from "@/lib/algorithms/turing-machine";
import {
  answerDiscreteMathQuestion,
} from "@/lib/algorithms/logic-ai-engine";

console.log("=== LOGICVERSE FULL DOMAIN & CHATBOT VERIFICATION SUITE ===");
let passed = 0;
let total = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName}: ${detail || "Assertion failed"}`);
  }
}

// ---------------------------------------------------------
// 1. SET THEORY ENGINE TESTS
// ---------------------------------------------------------
console.log("\n--- Testing 1. Set Theory Engine ---");
const setNodes = [
  { id: "A", type: "set", position: { x: 0, y: 0 }, data: { label: "A", elements: [1, 2, 3] } },
  { id: "B", type: "set", position: { x: 200, y: 0 }, data: { label: "B", elements: [2, 3, 4] } },
  { id: "op1", type: "operation", position: { x: 100, y: 150 }, data: { operationType: "union" } },
  { id: "res1", type: "result", position: { x: 100, y: 300 }, data: { label: "Result" } },
];
const setEdges = [
  { id: "e1", source: "A", target: "op1" },
  { id: "e2", source: "B", target: "op1" },
  { id: "e3", source: "op1", target: "res1" },
];
const setEval = evaluateCanvasGraph(setNodes, setEdges);
assert(setEval.primaryResult !== null, "Set Theory: Primary Result computed");
assert(setEval.primaryResult?.cardinality === 4, "Set Theory: A ∪ B cardinality == 4", `Got ${setEval.primaryResult?.cardinality}`);
assert(JSON.stringify(setEval.primaryResult?.elements) === JSON.stringify([1, 2, 3, 4]), "Set Theory: A ∪ B elements == [1, 2, 3, 4]");

// ---------------------------------------------------------
// 2. PROPOSITIONAL LOGIC ENGINE TESTS
// ---------------------------------------------------------
console.log("\n--- Testing 2. Propositional Logic Engine ---");
const logicNodes = [
  { id: "P", type: "logic-var", position: { x: 0, y: 0 }, data: { label: "P", value: true } },
  { id: "Q", type: "logic-var", position: { x: 200, y: 0 }, data: { label: "Q", value: false } },
  { id: "gate", type: "logic-op", position: { x: 100, y: 150 }, data: { gateType: "AND" } },
  { id: "res", type: "logic-result", position: { x: 100, y: 300 }, data: { label: "Output" } },
];
const logicEdges = [
  { id: "le1", source: "P", target: "gate" },
  { id: "le2", source: "Q", target: "gate" },
  { id: "le3", source: "gate", target: "res" },
];
const logicEval = evaluateLogicGraph(logicNodes, logicEdges);
assert(logicEval.currentTruthValue === false, "Logic: P=T, Q=F => P AND Q == False");

// ---------------------------------------------------------
// 3. RELATIONS & FUNCTIONS ENGINE TESTS
// ---------------------------------------------------------
console.log("\n--- Testing 3. Relations & Functions Engine ---");
const elements = ["a", "b", "c"];
const pairs: [string, string][] = [["a", "a"], ["b", "b"], ["c", "c"], ["a", "b"], ["b", "c"], ["a", "c"]];
const relProps = evaluateRelationProperties(elements, pairs);
assert(relProps.isReflexive === true, "Relations: Matrix is Reflexive");
assert(relProps.isSymmetric === false, "Relations: Matrix is non-Symmetric");

const closureSteps = computeWarshall(elements, pairs);
assert(closureSteps.length === 4, "Relations: Warshall steps generated for 3 elements");

const hasse = computeHasseDiagram(elements, pairs);
assert(hasse.isPoset === true, "Relations: Hasse poset computation successful");

const fnProps = analyzeFunction(["1", "2", "3"], ["x", "y", "z"], { "1": "x", "2": "y", "3": "z" });
assert(fnProps.isInjective && fnProps.isSurjective && fnProps.isBijective, "Functions: 1-to-1 mapping is Bijective");

// ---------------------------------------------------------
// 4. FINITE AUTOMATA ENGINE TESTS
// ---------------------------------------------------------
console.log("\n--- Testing 4. Finite Automata Engine ---");
const faDef = {
  type: "DFA" as const,
  states: [
    { id: "q0", label: "q0", isStart: true, isAccept: false },
    { id: "q1", label: "q1", isStart: false, isAccept: true },
  ],
  alphabet: ["0", "1"],
  startState: "q0",
  acceptStates: ["q1"],
  transitions: [
    { id: "t00", source: "q0", target: "q0", symbol: "0" },
    { id: "t01", source: "q0", target: "q1", symbol: "1" },
    { id: "t10", source: "q1", target: "q0", symbol: "0" },
    { id: "t11", source: "q1", target: "q1", symbol: "1" },
  ],
  isNfa: false,
};
const faSimAccepted = simulateAutomaton(faDef, "01");
assert(faSimAccepted.isAccepted === true, "Automata: DFA accepts '01'");
const faSimRejected = simulateAutomaton(faDef, "00");
assert(faSimRejected.isAccepted === false, "Automata: DFA rejects '00'");

// ---------------------------------------------------------
// 5. REGULAR EXPRESSIONS ENGINE TESTS
// ---------------------------------------------------------
console.log("\n--- Testing 5. Regular Expressions Engine ---");
const regMatch = testRegexMatch("a(b|c)*", "abbc");
assert(regMatch.isMatch === true, "Regex: 'a(b|c)*' matches 'abbc'");
const thompson = buildThompsonNfa("a|b");
assert(thompson.nodes.length > 0, "Regex: Thompson NFA graph generated");
const pumping = generatePumpingLemmaProof("anbn", 3, 2);
assert(pumping.isContradiction === true, "Regex: Pumping lemma proof generated for aⁿbⁿ");

// ---------------------------------------------------------
// 6. CONTEXT-FREE GRAMMAR ENGINE TESTS
// ---------------------------------------------------------
console.log("\n--- Testing 6. Context-Free Grammar Engine ---");
const grammarText = "S -> a S b | ε";
const grammar = parseGrammarText(grammarText);
assert(grammar.variables.includes("S"), "CFG: Grammar parser extracts variable S");

const cykRes = runCykParser("S -> A B\nA -> a\nB -> b", "ab");
assert(cykRes.isAccepted === true, "CFG: CYK parser accepts 'ab' under S -> A B");

const cnfTrace = convertGrammarToCNF(grammarText);
assert(cnfTrace.length >= 4, "CFG: CNF 4-step conversion trace generated");

// ---------------------------------------------------------
// 7. PUSHDOWN AUTOMATA (PDA) ENGINE TESTS
// ---------------------------------------------------------
console.log("\n--- Testing 7. Pushdown Automata (PDA) Engine ---");
const pdaPreset = generateAnBnPdaGraph();
const pdaSimAccept = simulatePda(pdaPreset.pda, "aabb");
assert(pdaSimAccept.isAcceptedFinalState || pdaSimAccept.isAcceptedEmptyStack, "PDA: Accepts 'aabb' (aⁿbⁿ)");
const pdaSimReject = simulatePda(pdaPreset.pda, "aabbb");
assert(!pdaSimReject.isAcceptedFinalState && !pdaSimReject.isAcceptedEmptyStack, "PDA: Rejects 'aabbb'");

// ---------------------------------------------------------
// 8. TURING MACHINE ENGINE TESTS
// ---------------------------------------------------------
console.log("\n--- Testing 8. Turing Machine Engine ---");
const tmPreset = generateBinaryIncrementerTmGraph();
const tmSim = simulateTuringMachine(tmPreset.tm, "1011");
assert(tmSim.isAccepted === true, "TM: Binary incrementer halts & accepts '1011'");
assert(tmSim.finalTapeString === "1100", "TM: Binary incrementer computes 1011 + 1 == 1100", `Got ${tmSim.finalTapeString}`);

// ---------------------------------------------------------
// 9. LOGICAI CHATBOT ENGINE TESTS ACROSS ALL DOMAINS
// ---------------------------------------------------------
console.log("\n--- Testing 9. LogicAI Chatbot Tutor ---");
const qSet = answerDiscreteMathQuestion("What is the cardinality of union?", setEval, undefined, "set-theory");
assert(qSet.message.length > 0, "Chatbot: Responds to Set Theory question");

const qLogic = answerDiscreteMathQuestion("Is this formula a tautology?", setEval, logicEval, "logic");
assert(qLogic.message.length > 0, "Chatbot: Responds to Propositional Logic question");

const qAutomata = answerDiscreteMathQuestion("Explain DFA vs NFA difference", setEval, undefined, "automata");
assert(qAutomata.message.includes("DFA") && qAutomata.message.includes("NFA"), "Chatbot: Explains DFA vs NFA");

const qRegex = answerDiscreteMathQuestion("How does Pumping Lemma work?", setEval, undefined, "regex");
assert(qRegex.message.includes("Pumping Lemma"), "Chatbot: Explains Pumping Lemma");

const qCfg = answerDiscreteMathQuestion("How does CYK parsing work in CNF?", setEval, undefined, "cfg");
assert(qCfg.message.includes("CYK"), "Chatbot: Explains CYK parsing");

const qPda = answerDiscreteMathQuestion("Explain Pushdown Automata stack memory", setEval, undefined, "pda-tm");
assert(qPda.message.includes("Pushdown Automata"), "Chatbot: Explains PDA stack memory");

const qTm = answerDiscreteMathQuestion("Explain Turing Machine infinite tape and Halting problem", setEval, undefined, "pda-tm");
assert(qTm.message.includes("Turing Machine"), "Chatbot: Explains Turing Machine & Halting Problem");

console.log(`\n=== FINAL RESULT: ${passed} / ${total} TESTS PASSED ===\n`);
