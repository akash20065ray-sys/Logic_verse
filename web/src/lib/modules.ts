import type { ModuleDefinition } from "@/types/module";

// This registry drives the Module Explorer (left panel) and the dashboard.
// Phase 1 ships the shell with Set Theory as the working demo module
// (PROJECT SPEC section 31-32); the rest are staged as "coming-soon" so the
// full module architecture is visible from day one without being fake-functional.
export const MODULES: ModuleDefinition[] = [
  {
    id: "set-theory",
    unit: "Foundations",
    title: "Set Theory",
    shortLabel: "Set Theory",
    description:
      "Build sets visually, run operations, generate 2-Set/3-Set Venn diagrams, and explore Cantor's Diagonalization.",
    accent: "blue",
    status: "available",
    topics: [
      { id: "set-builder", label: "Set Builder", status: "available" },
      { id: "set-operations", label: "Union / Intersection / Difference", status: "available" },
      { id: "cardinality", label: "Cardinality & Power Set", status: "available" },
      { id: "venn", label: "Venn Diagram (2-Set / 3-Set)", status: "available" },
      { id: "pie-solver", label: "Inclusion-Exclusion (PIE)", status: "available" },
      { id: "countability", label: "Countability & Diagonalization", status: "available" },
    ],
  },
  {
    id: "logic",
    unit: "Formal Logic",
    title: "Propositional Logic",
    shortLabel: "Logic",
    description: "Truth tables, counter-example finder, tautology verification, and mathematical induction.",
    accent: "cyan",
    status: "available",
    topics: [
      { id: "expression-builder", label: "Expression Builder", status: "available" },
      { id: "truth-table", label: "Truth Table Generator", status: "available" },
      { id: "counter-example", label: "Counter-Example Finder", status: "available" },
      { id: "equivalence", label: "Equivalence Checker", status: "available" },
      { id: "induction", label: "Induction Visualizer", status: "available" },
    ],
  },
  {
    id: "relations-functions",
    unit: "Algebraic Systems",
    title: "Relations & Functions",
    shortLabel: "Relations",
    description: "Relation matrices, closures, Hasse diagrams, and function analysis.",
    accent: "purple",
    status: "available",
    topics: [
      { id: "relation-builder", label: "Relation Matrix & Properties", status: "available" },
      { id: "hasse", label: "Hasse Diagrams (Posets)", status: "available" },
      { id: "warshall", label: "Warshall's Algorithm", status: "available" },
      { id: "functions", label: "Function Analyzer", status: "available" },
    ],
  },
  {
    id: "automata",
    unit: "Automata Theory",
    title: "Finite Automata",
    shortLabel: "DFA / NFA",
    description: "CircuitVerse-style automata builder with step-by-step string simulation, ε-NFA conversion, and DFA minimization.",
    accent: "blue",
    status: "available",
    topics: [
      { id: "dfa-builder", label: "DFA / NFA Builder", status: "available" },
      { id: "epsilon-nfa", label: "ε-NFA Conversion", status: "available" },
      { id: "minimization", label: "DFA Minimization", status: "available" },
      { id: "moore-mealy", label: "Moore ⇄ Mealy", status: "available" },
    ],
  },
  {
    id: "regex",
    unit: "Formal Languages",
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
    unit: "Grammar & Parsing",
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
    unit: "Turing Machines",
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
