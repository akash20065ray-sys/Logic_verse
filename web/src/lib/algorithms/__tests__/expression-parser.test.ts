import { describe, it, expect } from "vitest";
import { parseExpression } from "../expression-parser";
import { buildCanvasFromAST } from "../ast-canvas-builder";
import { evaluateAST, formatAST, generateTruthTable } from "../propositional-logic";

describe("expression-parser and canvas builder", () => {
  it("parses simple conjunction: P & Q", () => {
    const ast = parseExpression("P & Q");
    expect(formatAST(ast)).toBe("(P ∧ Q)");
    expect(evaluateAST(ast, { P: true, Q: false })).toBe(false);
  });

  it("handles standard keyboard typing shortcuts: ~P | (Q -> R)", () => {
    const ast = parseExpression("~P | (Q -> R)");
    expect(formatAST(ast)).toBe("(¬P ∨ (Q → R))");
    expect(evaluateAST(ast, { P: true, Q: true, R: false })).toBe(false);
    expect(evaluateAST(ast, { P: false, Q: true, R: false })).toBe(true);
  });

  it("handles mathematical symbols: (P ∧ Q) → (P ∨ Q)", () => {
    const ast = parseExpression("(P ∧ Q) → (P ∨ Q)");
    const tt = generateTruthTable(ast);
    expect(tt.isTautology).toBe(true);
  });

  it("builds valid React Flow nodes and edges from parsed expression", () => {
    const ast = parseExpression("(P -> Q) & P -> Q");
    const { nodes, edges } = buildCanvasFromAST(ast);

    expect(nodes.some((n) => n.id === "var-p")).toBe(true);
    expect(nodes.some((n) => n.id === "var-q")).toBe(true);
    expect(nodes.some((n) => n.type === "logic-result")).toBe(true);
    expect(edges.length).toBeGreaterThan(0);
  });
});
