import { describe, it, expect } from "vitest";
import { evaluateCanvasGraph } from "../graph-evaluator";
import {
  generateExplanation,
  generateHint,
  generateExample,
  answerDiscreteMathQuestion,
} from "../logic-ai-engine";
import type { Node, Edge } from "@xyflow/react";

describe("logic-ai-engine", () => {
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

  it("generateExplanation explains current model with exact elements", () => {
    const explanation = generateExplanation(evalResult);
    expect(explanation.message).toContain("A ∪ B");
    expect(explanation.message).toContain("1, 2, 3");
    expect(explanation.message).toContain("Cardinality");
  });

  it("generateHint produces pedagogical hints based on overlap", () => {
    const hint = generateHint(evalResult);
    expect(hint.message).toContain("Inclusion-Exclusion");
  });

  it("generateExample returns selectable template action", () => {
    const ex = generateExample();
    expect(ex.suggestedAction).toBeDefined();
    expect(ex.suggestedAction?.templateId).toBeDefined();
  });

  it("answerDiscreteMathQuestion handles De Morgan questions", () => {
    const answer = answerDiscreteMathQuestion("Tell me about De Morgan's laws", evalResult);
    expect(answer.message).toContain("De Morgan");
  });
});
