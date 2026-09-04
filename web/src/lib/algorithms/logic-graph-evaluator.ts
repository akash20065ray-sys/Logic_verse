import type { Node, Edge } from "@xyflow/react";
import {
  type LogicAST,
  type LogicBinaryOp,
  type LogicUnaryOp,
  type TruthTable,
  evaluateAST,
  formatAST,
  formatASTLatex,
  generateTruthTable,
} from "./propositional-logic";
import type { ValidationError } from "./graph-evaluator";

export interface LogicEvaluation {
  updatedNodes: Node[];
  truthTable: TruthTable | null;
  activeExpression: string;
  latexExpression: string;
  isTautology: boolean;
  isContradiction: boolean;
  isContingent: boolean;
  currentTruthValue: boolean | null;
  variableAssignments: Record<string, boolean>;
  errors: ValidationError[];
}

export function evaluateLogicGraph(nodes: Node[], edges: Edge[]): LogicEvaluation {
  const errors: ValidationError[] = [];
  const astMap = new Map<string, LogicAST>();
  const env: Record<string, boolean> = {};

  // 1. Gather variables and current assignments
  for (const node of nodes) {
    if (node.type === "logic-var") {
      const varName = (node.data?.label as string) || "P";
      const val = Boolean(node.data?.value ?? true);
      env[varName] = val;
      astMap.set(node.id, { type: "var", name: varName });
    }
  }

  // 2. Build incoming edges lookup
  const incomingMap = new Map<string, Edge[]>();
  for (const edge of edges) {
    const list = incomingMap.get(edge.target) || [];
    list.push(edge);
    incomingMap.set(edge.target, list);
  }

  // 3. Detect cycles using DFS
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
    if (!visited.has(n.id) && checkCycle(n.id)) {
      hasCycle = true;
      errors.push({
        id: `cycle-${n.id}`,
        type: "error",
        nodeId: n.id,
        message: "Circular logic connection detected. Logic formulas must form an acyclic tree.",
        remedy: "Disconnect the feedback loop.",
      });
      break;
    }
  }

  // 4. Topological resolution of connectives
  let progress = true;
  let passes = 0;
  const maxPasses = nodes.length + 4;

  while (progress && !hasCycle && passes < maxPasses) {
    progress = false;
    passes++;

    for (const node of nodes) {
      if (astMap.has(node.id)) continue;

      if (node.type === "logic-op") {
        const symbol = (node.data?.symbol as string) || "∧";
        const isUnary = symbol === "¬";
        const incoming = incomingMap.get(node.id) || [];

        if (isUnary) {
          if (incoming.length === 0) continue;
          const srcAst = astMap.get(incoming[0].source);
          if (srcAst) {
            astMap.set(node.id, { type: "unary", op: "¬" as LogicUnaryOp, operand: srcAst });
            progress = true;
          }
        } else {
          if (incoming.length < 2) continue;

          let edgeA = incoming.find((e) => e.targetHandle === "handle-p");
          let edgeB = incoming.find((e) => e.targetHandle === "handle-q");
          if (!edgeA || !edgeB) {
            edgeA = incoming[0];
            edgeB = incoming[1];
          }

          const leftAst = astMap.get(edgeA.source);
          const rightAst = astMap.get(edgeB.source);

          if (leftAst && rightAst) {
            astMap.set(node.id, {
              type: "binary",
              op: symbol as LogicBinaryOp,
              left: leftAst,
              right: rightAst,
            });
            progress = true;
          }
        }
      } else if (node.type === "logic-result") {
        const incoming = incomingMap.get(node.id) || [];
        if (incoming.length === 0) continue;
        const srcAst = astMap.get(incoming[0].source);
        if (srcAst) {
          astMap.set(node.id, srcAst);
          progress = true;
        }
      }
    }
  }

  // 5. Check incomplete connections
  for (const node of nodes) {
    if (node.type === "logic-op") {
      const symbol = (node.data?.symbol as string) || "∧";
      const isUnary = symbol === "¬";
      const incoming = incomingMap.get(node.id) || [];

      if (isUnary && incoming.length === 0) {
        errors.push({
          id: `missing-in-${node.id}`,
          type: "warning",
          nodeId: node.id,
          message: `NOT (¬) gate requires 1 input.`,
          remedy: "Connect a variable or gate to this NOT node.",
        });
      } else if (!isUnary && incoming.length < 2) {
        errors.push({
          id: `missing-in-${node.id}`,
          type: "warning",
          nodeId: node.id,
          message: `Gate '${symbol}' requires 2 inputs (connected: ${incoming.length}).`,
          remedy: "Connect both operand inputs to this gate.",
        });
      }
    }
  }

  // 6. Find root formula for Truth Table
  let rootAst: LogicAST | null = null;
  const resultNodes = nodes.filter((n) => n.type === "logic-result");
  for (const rn of resultNodes) {
    const ast = astMap.get(rn.id);
    if (ast) {
      rootAst = ast;
      break;
    }
  }

  if (!rootAst) {
    const opNodes = nodes.filter((n) => n.type === "logic-op");
    for (const op of opNodes.reverse()) {
      const ast = astMap.get(op.id);
      if (ast) {
        rootAst = ast;
        break;
      }
    }
  }

  // 7. Generate truth table & properties
  let truthTable: TruthTable | null = null;
  let activeExpression = "No expression";
  let latexExpression = "\\text{No expression}";
  let isTautology = false;
  let isContradiction = false;
  let isContingent = false;
  let currentTruthValue: boolean | null = null;

  if (rootAst) {
    activeExpression = formatAST(rootAst);
    latexExpression = formatASTLatex(rootAst);
    currentTruthValue = evaluateAST(rootAst, env);
    truthTable = generateTruthTable(rootAst);
    isTautology = truthTable.isTautology;
    isContradiction = truthTable.isContradiction;
    isContingent = truthTable.isContingent;
  }

  // 8. Update nodes with live evaluation state
  const updatedNodes = nodes.map((node) => {
    const ast = astMap.get(node.id);
    if (node.type === "logic-result") {
      if (ast) {
        const val = evaluateAST(ast, env);
        return {
          ...node,
          data: {
            ...node.data,
            label: formatAST(ast),
            truthValue: val,
            hasValue: true,
            isTautology,
            isContradiction,
          },
        };
      }
      return {
        ...node,
        data: {
          ...node.data,
          label: "Result (Waiting)",
          truthValue: null,
          hasValue: false,
        },
      };
    } else if (node.type === "logic-op") {
      if (ast) {
        const val = evaluateAST(ast, env);
        return {
          ...node,
          data: {
            ...node.data,
            truthValue: val,
            hasValue: true,
          },
        };
      }
    }
    return node;
  });

  return {
    updatedNodes,
    truthTable,
    activeExpression,
    latexExpression,
    isTautology,
    isContradiction,
    isContingent,
    currentTruthValue,
    variableAssignments: env,
    errors,
  };
}
