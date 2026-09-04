import type { ModuleDefinition } from "@/types/module";

// This registry drives the Module Explorer (left panel) and the dashboard.
// Phase 1 ships the shell with Set Theory as the working demo module
// (PROJECT SPEC section 31-32); the rest are staged as "coming-soon" so the
// full syllabus structure is visible from day one without being fake-functional.
export const MODULES: ModuleDefinition[] = [
  {
    id: "set-theory",
    unit: "Unit I",
    title: "Set Theory",
    shortLabel: "Set Theory",
    description:
      "Build sets visually, run operations, and generate Venn diagrams with a live formal model.",
    accent: "blue",
    status: "available",
    topics: [
      { id: "set-builder", label: "Set Builder", status: "available" },
      { id: "set-operations", label: "Union / Intersection / Difference", status: "available" },
      { id: "cardinality", label: "Cardinality", status: "available" },
      { id: "power-set", label: "Power Set", status: "available" },
      { id: "venn", label: "Venn Diagram", status: "available" },
      { id: "countability", label: "Countability & Diagonalization", status: "coming-soon" },
    ],
  },
  {
    id: "logic",
    unit: "Unit I",
    title: "Propositional Logic",
    shortLabel: "Logic",
    description: "Truth tables, tautology checking, and mathematical induction visualizers.",
    accent: "cyan",
    status: "coming-soon",
    topics: [
      { id: "expression-builder", label: "Expression Builder", status: "coming-soon" },
      { id: "truth-table", label: "Truth Table Generator", status: "coming-soon" },
      { id: "equivalence", label: "Equivalence Checker", status: "coming-soon" },
      { id: "induction", label: "Induction Visualizer", status: "coming-soon" },
    ],
  },
  {
    id: "relations-functions",
    unit: "Unit II",
    title: "Relations & Functions",
    shortLabel: "Relations",
    description: "Relation matrices, closures, Hasse diagrams, and function analysis.",
    accent: "purple",
    status: "coming-soon",
    topics: [
      { id: "relation-builder", label: "Relation Builder", status: "coming-soon" },
      { id: "warshall", label: "Warshall's Algorithm", status: "coming-soon" },
      { id: "hasse", label: "Hasse Diagrams", status: "coming-soon" },
      { id: "functions", label: "Function Analyzer", status: "coming-soon" },
    ],
  },
  {
    id: "automata",
    unit: "Unit III",
    title: "Finite Automata",
    shortLabel: "DFA / NFA",
    description: "CircuitVerse-style automata builder with step-by-step string simulation.",
    accent: "blue",
    status: "coming-soon",
    topics: [
      { id: "dfa-builder", label: "DFA / NFA Builder", status: "coming-soon" },
      { id: "epsilon-nfa", label: "ε-NFA Conversion", status: "coming-soon" },
      { id: "minimization", label: "DFA Minimization", status: "coming-soon" },
      { id: "moore-mealy", label: "Moore ⇄ Mealy", status: "coming-soon" },
    ],
  },
  {
    id: "regex",
    unit: "Unit IV",
    title: "Regular Expressions",
    shortLabel: "Regex",
    description: "Visual regex builder with NFA/DFA conversion and Arden's theorem steps.",
    accent: "cyan",
    status: "coming-soon",
    topics: [
      { id: "regex-builder", label: "Regex Builder" , status: "coming-soon" },
      { id: "re-to-nfa", label: "RE → NFA → DFA", status: "coming-soon" },
      { id: "pumping-lemma", label: "Pumping Lemma", status: "coming-soon" },
      { id: "myhill-nerode", label: "Myhill–Nerode", status: "coming-soon" },
    ],
  },
  {
    id: "cfg",
    unit: "Unit V",
    title: "Context-Free Grammar",
    shortLabel: "CFG",
    description: "Grammar builder with animated parse trees, CNF/GNF, and CYK visualization.",
    accent: "purple",
    status: "coming-soon",
    topics: [
      { id: "grammar-builder", label: "Grammar Builder", status: "coming-soon" },
      { id: "parse-tree", label: "Parse Tree", status: "coming-soon" },
      { id: "cnf-gnf", label: "CNF / GNF", status: "coming-soon" },
      { id: "cyk", label: "CYK Algorithm", status: "coming-soon" },
    ],
  },
  {
    id: "pda-tm",
    unit: "Unit VI",
    title: "PDA & Turing Machine",
    shortLabel: "PDA / TM",
    description: "Stack visualization for PDAs and infinite-tape simulation for Turing machines.",
    accent: "blue",
    status: "coming-soon",
    topics: [
      { id: "pda-builder", label: "PDA Builder", status: "coming-soon" },
      { id: "stack-sim", label: "Stack Simulation", status: "coming-soon" },
      { id: "tm-builder", label: "Turing Machine Builder", status: "coming-soon" },
      { id: "tape-sim", label: "Tape Simulation", status: "coming-soon" },
    ],
  },
];

export function getModule(id: string): ModuleDefinition | undefined {
  return MODULES.find((m) => m.id === id);
}
