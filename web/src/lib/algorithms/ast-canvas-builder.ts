import type { Node, Edge } from "@xyflow/react";
import type { LogicAST } from "./propositional-logic";
import { getVariables, formatAST } from "./propositional-logic";

export function buildCanvasFromAST(ast: LogicAST): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // 1. Create Variable nodes in the leftmost column
  const variables = getVariables(ast);
  const varNodeMap = new Map<string, string>(); // varName -> nodeId

  variables.forEach((name, idx) => {
    const id = `var-${name.toLowerCase()}`;
    varNodeMap.set(name, id);
    nodes.push({
      id,
      type: "logic-var",
      position: { x: 60, y: 80 + idx * 100 },
      data: { label: name, kind: "logic-var", value: true },
    });
  });

  // Track AST node heights and depths
  let opCounter = 0;

  interface LayoutResult {
    nodeId: string;
    depth: number;
    y: number;
  }

  function layoutNode(node: LogicAST, currentDepth: number, nextY: { val: number }): LayoutResult {
    if (node.type === "var") {
      const id = varNodeMap.get(node.name) || `var-${node.name.toLowerCase()}`;
      const existing = nodes.find((n) => n.id === id);
      return {
        nodeId: id,
        depth: 0,
        y: existing ? existing.position.y : 80,
      };
    }

    if (node.type === "const") {
      opCounter++;
      const id = `const-${opCounter}`;
      const y = nextY.val;
      nextY.val += 90;
      nodes.push({
        id,
        type: "logic-var",
        position: { x: 60, y },
        data: { label: node.value ? "⊤" : "⊥", kind: "logic-var", value: node.value },
      });
      return { nodeId: id, depth: 0, y };
    }

    if (node.type === "unary") {
      const child = layoutNode(node.operand, currentDepth + 1, nextY);
      opCounter++;
      const id = `op-not-${opCounter}`;
      const depth = child.depth + 1;
      const x = 80 + depth * 160;
      const y = child.y;

      nodes.push({
        id,
        type: "logic-op",
        position: { x, y },
        data: { label: "NOT", kind: "logic-op", symbol: "¬" },
      });

      edges.push({
        id: `e-${child.nodeId}-${id}`,
        source: child.nodeId,
        target: id,
        targetHandle: "handle-unary",
        animated: true,
        style: { stroke: "var(--lv-cyan)", strokeWidth: 2 },
      });

      return { nodeId: id, depth, y };
    }

    // Binary operator
    const left = layoutNode(node.left, currentDepth + 1, nextY);
    const right = layoutNode(node.right, currentDepth + 1, nextY);

    opCounter++;
    const opLabels: Record<string, string> = {
      "∧": "AND",
      "∨": "OR",
      "→": "IMPLIES",
      "↔": "IFF",
      "⊕": "XOR",
    };

    const id = `op-${opCounter}`;
    const depth = Math.max(left.depth, right.depth) + 1;
    const x = 80 + depth * 160;
    const y = (left.y + right.y) / 2;

    nodes.push({
      id,
      type: "logic-op",
      position: { x, y },
      data: { label: opLabels[node.op] || node.op, kind: "logic-op", symbol: node.op },
    });

    edges.push({
      id: `e-${left.nodeId}-${id}-p`,
      source: left.nodeId,
      target: id,
      targetHandle: "handle-p",
      animated: true,
      style: { stroke: "var(--lv-cyan)", strokeWidth: 2 },
    });

    edges.push({
      id: `e-${right.nodeId}-${id}-q`,
      source: right.nodeId,
      target: id,
      targetHandle: "handle-q",
      animated: true,
      style: { stroke: "var(--lv-purple)", strokeWidth: 2 },
    });

    return { nodeId: id, depth, y };
  }

  const nextY = { val: 80 + variables.length * 100 };
  const root = layoutNode(ast, 0, nextY);

  // 3. Add Result Probe connected to root
  const probeX = 100 + (root.depth + 1) * 160;
  const probeId = "res-probe-main";
  nodes.push({
    id: probeId,
    type: "logic-result",
    position: { x: probeX, y: root.y },
    data: { label: formatAST(ast), kind: "logic-result" },
  });

  edges.push({
    id: `e-${root.nodeId}-${probeId}`,
    source: root.nodeId,
    target: probeId,
    animated: true,
    style: { stroke: "var(--lv-cyan)", strokeWidth: 2 },
  });

  return { nodes, edges };
}
