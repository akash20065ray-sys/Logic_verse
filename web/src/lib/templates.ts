import type { Node, Edge } from "@xyflow/react";

export interface TemplateDefinition {
  id: string;
  title: string;
  description: string;
  topicId?: string;
  nodes: Node[];
  edges: Edge[];
}

export const WORKSPACE_TEMPLATES: Record<string, TemplateDefinition> = {
  "union-intersection": {
    id: "union-intersection",
    title: "Union & Intersection",
    description: "Standard 2-set setup computing union A ∪ B with real-time inclusion-exclusion.",
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

export const DEFAULT_STARTER_TEMPLATE = WORKSPACE_TEMPLATES["union-intersection"];
