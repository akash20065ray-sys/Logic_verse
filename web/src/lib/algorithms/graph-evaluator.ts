import type { Node, Edge } from "@xyflow/react";
import {
  applyOperation,
  type SetElement,
  type SetOperationSymbol,
  type OperationResult,
  type AlgorithmStep,
} from "./set-theory";

export interface ValidationError {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  nodeId?: string;
  remedy?: string;
}

export interface GraphEvaluation {
  updatedNodes: Node[];
  resultsByNodeId: Record<string, OperationResult>;
  primaryResult: OperationResult | null;
  primarySets: { id: string; label: string; elements: SetElement[] }[];
  allSteps: AlgorithmStep[];
  formalModel: {
    expression: string;
    latex: string;
    definitions: string[];
    properties: string[];
    jsonAst: Record<string, unknown>;
  };
  errors: ValidationError[];
}

interface NodeResolvedValue {
  label: string;
  elements: SetElement[];
  operationResult?: OperationResult;
}

export function evaluateCanvasGraph(nodes: Node[], edges: Edge[]): GraphEvaluation {
  const errors: ValidationError[] = [];
  const resultsByNodeId: Record<string, OperationResult> = {};
  const resolvedValues = new Map<string, NodeResolvedValue>();

  // 1. Map nodes by ID for fast lookup
  const nodeMap = new Map<string, Node>(nodes.map((n) => [n.id, n]));

  // 2. Validate duplicate set labels
  const setLabels = new Map<string, string[]>();
  for (const n of nodes) {
    if (n.type === "set") {
      const label = (n.data?.label as string) || "Unnamed";
      const existing = setLabels.get(label) || [];
      existing.push(n.id);
      setLabels.set(label, existing);
    }
  }
  for (const [label, ids] of setLabels.entries()) {
    if (ids.length > 1) {
      errors.push({
        id: `dup-${label}`,
        type: "warning",
        message: `Multiple sets have the same name '${label}'.`,
        remedy: "Rename one of them to avoid ambiguous mathematical notation.",
      });
    }
  }

  // 3. Populate base values for Set nodes
  const primarySets: { id: string; label: string; elements: SetElement[] }[] = [];
  for (const n of nodes) {
    if (n.type === "set") {
      const rawElements = (n.data?.elements as SetElement[]) || [];
      const label = (n.data?.label as string) || "Set";
      resolvedValues.set(n.id, { label, elements: rawElements });
      primarySets.push({ id: n.id, label, elements: rawElements });

      if (rawElements.length === 0) {
        errors.push({
          id: `empty-set-${n.id}`,
          type: "info",
          nodeId: n.id,
          message: `Set '${label}' is currently empty (∅).`,
          remedy: "Double-click the set node to add elements.",
        });
      }
    }
  }

  // 4. Build adjacency and dependency maps
  const incomingEdgesByTarget = new Map<string, Edge[]>();
  for (const edge of edges) {
    const list = incomingEdgesByTarget.get(edge.target) || [];
    list.push(edge);
    incomingEdgesByTarget.set(edge.target, list);
  }

  // 5. Detect cycles using DFS
  const visited = new Set<string>();
  const inStack = new Set<string>();
  let hasCycle = false;

  function checkCycle(nodeId: string): boolean {
    visited.add(nodeId);
    inStack.add(nodeId);

    const outgoing = edges.filter((e) => e.source === nodeId);
    for (const edge of outgoing) {
      if (!visited.has(edge.target)) {
        if (checkCycle(edge.target)) return true;
      } else if (inStack.has(edge.target)) {
        return true;
      }
    }

    inStack.delete(nodeId);
    return false;
  }

  for (const n of nodes) {
    if (!visited.has(n.id)) {
      if (checkCycle(n.id)) {
        hasCycle = true;
        errors.push({
          id: `cycle-${n.id}`,
          type: "error",
          nodeId: n.id,
          message: "Cycle detected in canvas connections. The flow graph must be a DAG (Directed Acyclic Graph).",
          remedy: "Remove circular connections between nodes.",
        });
        break;
      }
    }
  }

  if (hasCycle) {
    return {
      updatedNodes: nodes,
      resultsByNodeId: {},
      primaryResult: null,
      primarySets,
      allSteps: [],
      formalModel: {
        expression: "Error: Cycle in graph",
        latex: "\\text{Cycle detected}",
        definitions: [],
        properties: [],
        jsonAst: {},
      },
      errors,
    };
  }

  // 6. Topological Sort / Multi-pass evaluation
  let progress = true;
  let passes = 0;
  const maxPasses = nodes.length + 5;

  while (progress && passes < maxPasses) {
    progress = false;
    passes++;

    for (const node of nodes) {
      if (resolvedValues.has(node.id)) continue;

      if (node.type === "operation") {
        const symbol = (node.data?.symbol as SetOperationSymbol) || "∪";
        const isUnary = symbol === "𝒫" || symbol === "|·|" || symbol === "∁";
        const incoming = incomingEdgesByTarget.get(node.id) || [];

        // Check if required inputs are resolved
        if (isUnary) {
          if (incoming.length === 0) continue;
          const srcId = incoming[0].source;
          const resolvedSrc = resolvedValues.get(srcId);
          if (resolvedSrc) {
            const opResult = applyOperation(
              symbol,
              resolvedSrc.elements,
              undefined,
              resolvedSrc.label
            );
            resolvedValues.set(node.id, {
              label: opResult.notation,
              elements: opResult.elements,
              operationResult: opResult,
            });
            resultsByNodeId[node.id] = opResult;
            progress = true;
          }
        } else {
          // Binary operation
          if (incoming.length < 2) continue;

          // Determine input A and input B based on handles if provided
          let edgeA = incoming.find((e) => e.targetHandle === "handle-a");
          let edgeB = incoming.find((e) => e.targetHandle === "handle-b");

          // If handles not specifically used, use first two incoming edges
          if (!edgeA || !edgeB) {
            edgeA = incoming[0];
            edgeB = incoming[1];
          }

          const resolvedA = resolvedValues.get(edgeA.source);
          const resolvedB = resolvedValues.get(edgeB.source);

          if (resolvedA && resolvedB) {
            const opResult = applyOperation(
              symbol,
              resolvedA.elements,
              resolvedB.elements,
              resolvedA.label,
              resolvedB.label
            );
            resolvedValues.set(node.id, {
              label: opResult.notation,
              elements: opResult.elements,
              operationResult: opResult,
            });
            resultsByNodeId[node.id] = opResult;
            progress = true;
          }
        }
      } else if (node.type === "result") {
        const incoming = incomingEdgesByTarget.get(node.id) || [];
        if (incoming.length === 0) continue;

        const srcId = incoming[0].source;
        const resolvedSrc = resolvedValues.get(srcId);
        if (resolvedSrc) {
          resolvedValues.set(node.id, {
            label: resolvedSrc.label,
            elements: resolvedSrc.elements,
            operationResult: resolvedSrc.operationResult,
          });
          progress = true;
        }
      }
    }
  }

  // 7. Validate unconnected or incompletely connected nodes
  for (const node of nodes) {
    if (node.type === "operation") {
      const symbol = (node.data?.symbol as SetOperationSymbol) || "∪";
      const isUnary = symbol === "𝒫" || symbol === "|·|" || symbol === "∁";
      const incoming = incomingEdgesByTarget.get(node.id) || [];

      if (isUnary && incoming.length === 0) {
        errors.push({
          id: `missing-input-${node.id}`,
          type: "warning",
          nodeId: node.id,
          message: `Operation '${node.data?.label || symbol}' needs 1 input set.`,
          remedy: "Drag a connection from a set into this operation.",
        });
      } else if (!isUnary && incoming.length < 2) {
        errors.push({
          id: `missing-input-${node.id}`,
          type: "warning",
          nodeId: node.id,
          message: `Operation '${node.data?.label || symbol}' needs 2 input sets (received ${incoming.length}).`,
          remedy: "Connect both operand sets to this operation.",
        });
      }
    } else if (node.type === "result") {
      const incoming = incomingEdgesByTarget.get(node.id) || [];
      if (incoming.length === 0) {
        errors.push({
          id: `unconnected-result-${node.id}`,
          type: "info",
          nodeId: node.id,
          message: "Result node is not connected to any operation.",
          remedy: "Drag a line from an operation node into this Result node.",
        });
      }
    }
  }

  // 8. Update node state with evaluated data
  const updatedNodes = nodes.map((node) => {
    const resolved = resolvedValues.get(node.id);
    if (node.type === "result") {
      if (resolved) {
        return {
          ...node,
          data: {
            ...node.data,
            label: resolved.label,
            elements: resolved.elements,
            hasComputedValue: true,
          },
        };
      }
      return {
        ...node,
        data: {
          ...node.data,
          label: "Result (Waiting)",
          elements: [],
          hasComputedValue: false,
        },
      };
    }
    return node;
  });

  // 9. Find primary result for dock (prefer result node, else latest operation)
  let primaryResult: OperationResult | null = null;
  const resultNodes = nodes.filter((n) => n.type === "result");
  for (const rn of resultNodes) {
    const res = resolvedValues.get(rn.id);
    if (res?.operationResult) {
      primaryResult = res.operationResult;
      break;
    }
  }

  if (!primaryResult) {
    const operationNodes = nodes.filter((n) => n.type === "operation");
    for (const op of operationNodes.reverse()) {
      const res = resultsByNodeId[op.id];
      if (res) {
        primaryResult = res;
        break;
      }
    }
  }

  // 10. Assemble steps and formal model
  const allSteps = primaryResult?.steps || [];
  const formalModel = {
    expression: primaryResult ? primaryResult.notation : nodes.length === 0 ? "Empty canvas" : "Incomplete expression",
    latex: primaryResult ? primaryResult.latex : "\\text{Awaiting input}",
    definitions: primaryResult ? [primaryResult.formalDefinition] : [],
    properties: primaryResult ? primaryResult.properties : [],
    jsonAst: {
      type: "FormalSetModel",
      expression: primaryResult?.notation ?? null,
      sets: primarySets,
      resultElements: primaryResult?.elements ?? [],
      cardinality: primaryResult?.cardinality ?? 0,
      timestamp: new Date().toISOString(),
    },
  };

  return {
    updatedNodes,
    resultsByNodeId,
    primaryResult,
    primarySets,
    allSteps,
    formalModel,
    errors,
  };
}
