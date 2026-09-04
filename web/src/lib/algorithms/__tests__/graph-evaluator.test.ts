import { describe, it, expect } from "vitest";
import { evaluateCanvasGraph } from "../graph-evaluator";
import type { Node, Edge } from "@xyflow/react";

describe("graph-evaluator", () => {
  it("evaluates a standard 2-set union into result node", () => {
    const nodes: Node[] = [
      { id: "set-1", type: "set", position: { x: 0, y: 0 }, data: { label: "A", elements: [1, 2, 3] } },
      { id: "set-2", type: "set", position: { x: 0, y: 100 }, data: { label: "B", elements: [3, 4, 5] } },
      { id: "op-1", type: "operation", position: { x: 100, y: 50 }, data: { label: "Union", symbol: "∪" } },
      { id: "res-1", type: "result", position: { x: 200, y: 50 }, data: { label: "Result", elements: [] } },
    ];

    const edges: Edge[] = [
      { id: "e1", source: "set-1", target: "op-1", targetHandle: "handle-a" },
      { id: "e2", source: "set-2", target: "op-1", targetHandle: "handle-b" },
      { id: "e3", source: "op-1", target: "res-1" },
    ];

    const evalResult = evaluateCanvasGraph(nodes, edges);
    expect(evalResult.errors.filter((e) => e.type === "error")).toHaveLength(0);
    expect(evalResult.primaryResult).not.toBeNull();
    expect(evalResult.primaryResult?.elements.sort()).toEqual([1, 2, 3, 4, 5]);

    const resultNode = evalResult.updatedNodes.find((n) => n.id === "res-1");
    expect(resultNode?.data?.elements).toEqual([1, 2, 3, 4, 5]);
  });

  it("evaluates unary operation (Power Set)", () => {
    const nodes: Node[] = [
      { id: "set-1", type: "set", position: { x: 0, y: 0 }, data: { label: "A", elements: ["a", "b"] } },
      { id: "op-1", type: "operation", position: { x: 100, y: 50 }, data: { label: "Power Set", symbol: "𝒫" } },
      { id: "res-1", type: "result", position: { x: 200, y: 50 }, data: { label: "Result", elements: [] } },
    ];

    const edges: Edge[] = [
      { id: "e1", source: "set-1", target: "op-1" },
      { id: "e2", source: "op-1", target: "res-1" },
    ];

    const evalResult = evaluateCanvasGraph(nodes, edges);
    expect(evalResult.primaryResult?.elements).toHaveLength(4);
  });

  it("detects cycle error when graph contains a loop", () => {
    const nodes: Node[] = [
      { id: "op-1", type: "operation", position: { x: 0, y: 0 }, data: { symbol: "∪" } },
      { id: "op-2", type: "operation", position: { x: 100, y: 0 }, data: { symbol: "∩" } },
    ];

    const edges: Edge[] = [
      { id: "e1", source: "op-1", target: "op-2" },
      { id: "e2", source: "op-2", target: "op-1" },
    ];

    const evalResult = evaluateCanvasGraph(nodes, edges);
    expect(evalResult.errors.some((e) => e.type === "error" && e.message.includes("Cycle detected"))).toBe(true);
  });

  it("handles multi-operation chained pipelines: (A ∪ B) ∩ C", () => {
    const nodes: Node[] = [
      { id: "set-a", type: "set", position: { x: 0, y: 0 }, data: { label: "A", elements: [1, 2, 3] } },
      { id: "set-b", type: "set", position: { x: 0, y: 80 }, data: { label: "B", elements: [3, 4, 5] } },
      { id: "set-c", type: "set", position: { x: 0, y: 160 }, data: { label: "C", elements: [2, 3, 6] } },
      { id: "op-union", type: "operation", position: { x: 120, y: 40 }, data: { symbol: "∪", label: "Union" } },
      { id: "op-inter", type: "operation", position: { x: 240, y: 100 }, data: { symbol: "∩", label: "Intersection" } },
      { id: "res-final", type: "result", position: { x: 360, y: 100 }, data: { label: "Final" } },
    ];

    const edges: Edge[] = [
      { id: "e1", source: "set-a", target: "op-union", targetHandle: "handle-a" },
      { id: "e2", source: "set-b", target: "op-union", targetHandle: "handle-b" },
      { id: "e3", source: "op-union", target: "op-inter", targetHandle: "handle-a" },
      { id: "e4", source: "set-c", target: "op-inter", targetHandle: "handle-b" },
      { id: "e5", source: "op-inter", target: "res-final" },
    ];

    const evalResult = evaluateCanvasGraph(nodes, edges);
    // (A ∪ B) = [1, 2, 3, 4, 5]
    // (A ∪ B) ∩ C = [2, 3]
    const finalResultNode = evalResult.updatedNodes.find((n) => n.id === "res-final");
    const finalElements = finalResultNode?.data?.elements as number[];
    expect(finalElements?.sort()).toEqual([2, 3]);
  });
});
