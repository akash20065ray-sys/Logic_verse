import type { Node, Edge } from "@xyflow/react";

export interface TemplateDefinition {
  id: string;
  title: string;
  description: string;
  moduleId?: string;
  topicId?: string;
  nodes: Node[];
  edges: Edge[];
}

export const SET_THEORY_TEMPLATES: Record<string, TemplateDefinition> = {
  "union-intersection": {
    id: "union-intersection",
    title: "Union & Intersection",
    description: "Standard 2-set setup computing union A ∪ B with real-time inclusion-exclusion.",
    moduleId: "set-theory",
    topicId: "set-operations",
    nodes: [
      {
        id: "set-a",
        type: "set",
        position: { x: 80, y: 80 },
        data: { label: "A", kind: "set", elements: [1, 2, 3, 4], accent: "blue" },
      },
      {
        id: "set-b",
        type: "set",
        position: { x: 80, y: 240 },
        data: { label: "B", kind: "set", elements: [3, 4, 5, 6], accent: "purple" },
      },
      {
        id: "op-union",
        type: "operation",
        position: { x: 340, y: 160 },
        data: { label: "Union", kind: "operation", symbol: "∪" },
      },
      {
        id: "result-1",
        type: "result",
        position: { x: 560, y: 160 },
        data: { label: "A ∪ B", kind: "result", elements: [1, 2, 3, 4, 5, 6] },
      },
    ],
    edges: [
      {
        id: "e-a-op",
        source: "set-a",
        target: "op-union",
        targetHandle: "handle-a",
        animated: true,
        style: { stroke: "var(--lv-blue)", strokeWidth: 2 },
      },
      {
        id: "e-b-op",
        source: "set-b",
        target: "op-union",
        targetHandle: "handle-b",
        animated: true,
        style: { stroke: "var(--lv-purple)", strokeWidth: 2 },
      },
      {
        id: "e-op-res",
        source: "op-union",
        target: "result-1",
        animated: true,
        style: { stroke: "var(--lv-cyan)", strokeWidth: 2 },
      },
    ],
  },
  "difference-symdiff": {
    id: "difference-symdiff",
    title: "Difference & Symmetric Difference",
    description: "Demonstrates non-commutative set subtraction A − B versus exclusive-or A ⊕ B.",
    moduleId: "set-theory",
    topicId: "set-operations",
    nodes: [
      {
        id: "set-a",
        type: "set",
        position: { x: 80, y: 80 },
        data: { label: "A", kind: "set", elements: [1, 2, 3, 4, 5], accent: "blue" },
      },
      {
        id: "set-b",
        type: "set",
        position: { x: 80, y: 260 },
        data: { label: "B", kind: "set", elements: [4, 5, 6, 7], accent: "purple" },
      },
      {
        id: "op-diff",
        type: "operation",
        position: { x: 340, y: 90 },
        data: { label: "Difference", kind: "operation", symbol: "−" },
      },
      {
        id: "result-diff",
        type: "result",
        position: { x: 540, y: 90 },
        data: { label: "A − B", kind: "result", elements: [1, 2, 3] },
      },
      {
        id: "op-symdiff",
        type: "operation",
        position: { x: 340, y: 250 },
        data: { label: "Symmetric Difference", kind: "operation", symbol: "⊕" },
      },
      {
        id: "result-symdiff",
        type: "result",
        position: { x: 540, y: 250 },
        data: { label: "A ⊕ B", kind: "result", elements: [1, 2, 3, 6, 7] },
      },
    ],
    edges: [
      {
        id: "e-a-diff",
        source: "set-a",
        target: "op-diff",
        targetHandle: "handle-a",
        animated: true,
        style: { stroke: "var(--lv-blue)", strokeWidth: 2 },
      },
      {
        id: "e-b-diff",
        source: "set-b",
        target: "op-diff",
        targetHandle: "handle-b",
        animated: true,
        style: { stroke: "var(--lv-purple)", strokeWidth: 2 },
      },
      {
        id: "e-diff-res",
        source: "op-diff",
        target: "result-diff",
        animated: true,
        style: { stroke: "var(--lv-cyan)", strokeWidth: 2 },
      },
      {
        id: "e-a-sym",
        source: "set-a",
        target: "op-symdiff",
        targetHandle: "handle-a",
        animated: true,
        style: { stroke: "var(--lv-blue)", strokeWidth: 2 },
      },
      {
        id: "e-b-sym",
        source: "set-b",
        target: "op-symdiff",
        targetHandle: "handle-b",
        animated: true,
        style: { stroke: "var(--lv-purple)", strokeWidth: 2 },
      },
      {
        id: "e-sym-res",
        source: "op-symdiff",
        target: "result-symdiff",
        animated: true,
        style: { stroke: "var(--lv-cyan)", strokeWidth: 2 },
      },
    ],
  },
  "power-set": {
    id: "power-set",
    title: "Power Set Visualizer",
    description: "Generates all 2^n subsets of a given finite set.",
    moduleId: "set-theory",
    topicId: "power-set",
    nodes: [
      {
        id: "set-a",
        type: "set",
        position: { x: 100, y: 140 },
        data: { label: "A", kind: "set", elements: ["x", "y", "z"], accent: "cyan" },
      },
      {
        id: "op-power",
        type: "operation",
        position: { x: 340, y: 155 },
        data: { label: "Power Set", kind: "operation", symbol: "𝒫" },
      },
      {
        id: "result-power",
        type: "result",
        position: { x: 540, y: 140 },
        data: { label: "𝒫(A)", kind: "result", elements: ["∅", "{x}", "{y}", "{z}", "{x,y}", "{x,z}", "{y,z}", "{x,y,z}"] },
      },
    ],
    edges: [
      {
        id: "e-a-power",
        source: "set-a",
        target: "op-power",
        animated: true,
        style: { stroke: "var(--lv-cyan)", strokeWidth: 2 },
      },
      {
        id: "e-power-res",
        source: "op-power",
        target: "result-power",
        animated: true,
        style: { stroke: "var(--lv-purple)", strokeWidth: 2 },
      },
    ],
  },
  "cartesian-product": {
    id: "cartesian-product",
    title: "Cartesian Product",
    description: "Constructs ordered pairs A × B with |A| × |B| cardinality.",
    moduleId: "set-theory",
    topicId: "set-operations",
    nodes: [
      {
        id: "set-a",
        type: "set",
        position: { x: 90, y: 80 },
        data: { label: "A", kind: "set", elements: [1, 2, 3], accent: "blue" },
      },
      {
        id: "set-b",
        type: "set",
        position: { x: 90, y: 240 },
        data: { label: "B", kind: "set", elements: ["x", "y"], accent: "purple" },
      },
      {
        id: "op-cartesian",
        type: "operation",
        position: { x: 340, y: 160 },
        data: { label: "Cartesian Product", kind: "operation", symbol: "×" },
      },
      {
        id: "result-cartesian",
        type: "result",
        position: { x: 540, y: 150 },
        data: { label: "A × B", kind: "result", elements: ["(1,x)", "(1,y)", "(2,x)", "(2,y)", "(3,x)", "(3,y)"] },
      },
    ],
    edges: [
      {
        id: "e-a-prod",
        source: "set-a",
        target: "op-cartesian",
        targetHandle: "handle-a",
        animated: true,
        style: { stroke: "var(--lv-blue)", strokeWidth: 2 },
      },
      {
        id: "e-b-prod",
        source: "set-b",
        target: "op-cartesian",
        targetHandle: "handle-b",
        animated: true,
        style: { stroke: "var(--lv-purple)", strokeWidth: 2 },
      },
      {
        id: "e-prod-res",
        source: "op-cartesian",
        target: "result-cartesian",
        animated: true,
        style: { stroke: "var(--lv-cyan)", strokeWidth: 2 },
      },
    ],
  },
  "cardinality-demo": {
    id: "cardinality-demo",
    title: "Cardinality & Counting",
    description: "Inspects set sizes and verifies the Inclusion-Exclusion principle.",
    moduleId: "set-theory",
    topicId: "cardinality",
    nodes: [
      {
        id: "set-a",
        type: "set",
        position: { x: 80, y: 100 },
        data: { label: "A", kind: "set", elements: [2, 3, 5, 7, 11], accent: "blue" },
      },
      {
        id: "op-card",
        type: "operation",
        position: { x: 340, y: 115 },
        data: { label: "Cardinality", kind: "operation", symbol: "|·|" },
      },
      {
        id: "result-card",
        type: "result",
        position: { x: 520, y: 100 },
        data: { label: "|A|", kind: "result", elements: [5] },
      },
    ],
    edges: [
      {
        id: "e-a-card",
        source: "set-a",
        target: "op-card",
        animated: true,
        style: { stroke: "var(--lv-blue)", strokeWidth: 2 },
      },
      {
        id: "e-card-res",
        source: "op-card",
        target: "result-card",
        animated: true,
        style: { stroke: "var(--lv-cyan)", strokeWidth: 2 },
      },
    ],
  },
};

export const LOGIC_TEMPLATES: Record<string, TemplateDefinition> = {
  "modus-ponens": {
    id: "modus-ponens",
    title: "Modus Ponens ((P → Q) ∧ P) → Q",
    description: "Classic rule of logical inference. Demonstrates a canonical Tautology.",
    moduleId: "logic",
    topicId: "truth-table",
    nodes: [
      { id: "var-p", type: "logic-var", position: { x: 60, y: 80 }, data: { label: "P", value: true } },
      { id: "var-q", type: "logic-var", position: { x: 60, y: 220 }, data: { label: "Q", value: true } },
      { id: "gate-imp1", type: "logic-op", position: { x: 230, y: 80 }, data: { label: "IMPLIES", symbol: "→" } },
      { id: "gate-and", type: "logic-op", position: { x: 370, y: 140 }, data: { label: "AND", symbol: "∧" } },
      { id: "gate-imp2", type: "logic-op", position: { x: 520, y: 140 }, data: { label: "IMPLIES", symbol: "→" } },
      { id: "res-mp", type: "logic-result", position: { x: 680, y: 140 }, data: { label: "Result" } },
    ],
    edges: [
      { id: "e1", source: "var-p", target: "gate-imp1", targetHandle: "handle-p", animated: true, style: { stroke: "var(--lv-cyan)", strokeWidth: 2 } },
      { id: "e2", source: "var-q", target: "gate-imp1", targetHandle: "handle-q", animated: true, style: { stroke: "var(--lv-purple)", strokeWidth: 2 } },
      { id: "e3", source: "gate-imp1", target: "gate-and", targetHandle: "handle-p", animated: true, style: { stroke: "var(--lv-cyan)", strokeWidth: 2 } },
      { id: "e4", source: "var-p", target: "gate-and", targetHandle: "handle-q", animated: true, style: { stroke: "var(--lv-cyan)", strokeWidth: 2 } },
      { id: "e5", source: "gate-and", target: "gate-imp2", targetHandle: "handle-p", animated: true, style: { stroke: "var(--lv-cyan)", strokeWidth: 2 } },
      { id: "e6", source: "var-q", target: "gate-imp2", targetHandle: "handle-q", animated: true, style: { stroke: "var(--lv-purple)", strokeWidth: 2 } },
      { id: "e7", source: "gate-imp2", target: "res-mp", animated: true, style: { stroke: "var(--lv-success)", strokeWidth: 2 } },
    ],
  },
  "de-morgan-logic": {
    id: "de-morgan-logic",
    title: "De Morgan: ¬(P ∧ Q)",
    description: "Evaluates the negated conjunction to compare against ¬P ∨ ¬Q.",
    moduleId: "logic",
    topicId: "equivalence",
    nodes: [
      { id: "var-p", type: "logic-var", position: { x: 80, y: 90 }, data: { label: "P", value: true } },
      { id: "var-q", type: "logic-var", position: { x: 80, y: 210 }, data: { label: "Q", value: false } },
      { id: "gate-and", type: "logic-op", position: { x: 260, y: 150 }, data: { label: "AND", symbol: "∧" } },
      { id: "gate-not", type: "logic-op", position: { x: 420, y: 150 }, data: { label: "NOT", symbol: "¬" } },
      { id: "res-dm", type: "logic-result", position: { x: 580, y: 150 }, data: { label: "Result" } },
    ],
    edges: [
      { id: "e1", source: "var-p", target: "gate-and", targetHandle: "handle-p", animated: true, style: { stroke: "var(--lv-cyan)", strokeWidth: 2 } },
      { id: "e2", source: "var-q", target: "gate-and", targetHandle: "handle-q", animated: true, style: { stroke: "var(--lv-purple)", strokeWidth: 2 } },
      { id: "e3", source: "gate-and", target: "gate-not", targetHandle: "handle-unary", animated: true, style: { stroke: "var(--lv-cyan)", strokeWidth: 2 } },
      { id: "e4", source: "gate-not", target: "res-dm", animated: true, style: { stroke: "var(--lv-cyan)", strokeWidth: 2 } },
    ],
  },
  "material-implication": {
    id: "material-implication",
    title: "Material Implication: P → Q",
    description: "Shows that P → Q evaluates to False only when P is True and Q is False.",
    moduleId: "logic",
    topicId: "truth-table",
    nodes: [
      { id: "var-p", type: "logic-var", position: { x: 100, y: 90 }, data: { label: "P", value: true } },
      { id: "var-q", type: "logic-var", position: { x: 100, y: 210 }, data: { label: "Q", value: false } },
      { id: "gate-imp", type: "logic-op", position: { x: 300, y: 150 }, data: { label: "IMPLIES", symbol: "→" } },
      { id: "res-imp", type: "logic-result", position: { x: 500, y: 150 }, data: { label: "Result" } },
    ],
    edges: [
      { id: "e1", source: "var-p", target: "gate-imp", targetHandle: "handle-p", animated: true, style: { stroke: "var(--lv-cyan)", strokeWidth: 2 } },
      { id: "e2", source: "var-q", target: "gate-imp", targetHandle: "handle-q", animated: true, style: { stroke: "var(--lv-purple)", strokeWidth: 2 } },
      { id: "e3", source: "gate-imp", target: "res-imp", animated: true, style: { stroke: "var(--lv-cyan)", strokeWidth: 2 } },
    ],
  },
  "excluded-middle": {
    id: "excluded-middle",
    title: "Law of Excluded Middle: P ∨ ¬P",
    description: "Every proposition is either True or False. Canonical tautology.",
    moduleId: "logic",
    topicId: "expression-builder",
    nodes: [
      { id: "var-p", type: "logic-var", position: { x: 80, y: 140 }, data: { label: "P", value: true } },
      { id: "gate-not", type: "logic-op", position: { x: 260, y: 220 }, data: { label: "NOT", symbol: "¬" } },
      { id: "gate-or", type: "logic-op", position: { x: 420, y: 140 }, data: { label: "OR", symbol: "∨" } },
      { id: "res-lem", type: "logic-result", position: { x: 600, y: 140 }, data: { label: "Result" } },
    ],
    edges: [
      { id: "e1", source: "var-p", target: "gate-not", targetHandle: "handle-unary", animated: true, style: { stroke: "var(--lv-cyan)", strokeWidth: 2 } },
      { id: "e2", source: "var-p", target: "gate-or", targetHandle: "handle-p", animated: true, style: { stroke: "var(--lv-cyan)", strokeWidth: 2 } },
      { id: "e3", source: "gate-not", target: "gate-or", targetHandle: "handle-q", animated: true, style: { stroke: "var(--lv-purple)", strokeWidth: 2 } },
      { id: "e4", source: "gate-or", target: "res-lem", animated: true, style: { stroke: "var(--lv-success)", strokeWidth: 2 } },
    ],
  },
};

export const WORKSPACE_TEMPLATES: Record<string, TemplateDefinition> = {
  ...SET_THEORY_TEMPLATES,
  ...LOGIC_TEMPLATES,
};

export const DEFAULT_STARTER_TEMPLATE = SET_THEORY_TEMPLATES["union-intersection"];
export const DEFAULT_LOGIC_TEMPLATE = LOGIC_TEMPLATES["modus-ponens"];
