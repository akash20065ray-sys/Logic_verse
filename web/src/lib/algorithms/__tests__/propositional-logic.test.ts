import { describe, it, expect } from "vitest";
import {
  evaluateAST,
  formatAST,
  generateTruthTable,
  checkEquivalence,
  INDUCTION_THEOREMS,
  type LogicAST,
} from "../propositional-logic";

describe("propositional logic engine", () => {
  const P: LogicAST = { type: "var", name: "P" };
  const Q: LogicAST = { type: "var", name: "Q" };

  it("evaluates basic connectives correctly", () => {
    const pAndQ: LogicAST = { type: "binary", op: "∧", left: P, right: Q };
    expect(evaluateAST(pAndQ, { P: true, Q: true })).toBe(true);
    expect(evaluateAST(pAndQ, { P: true, Q: false })).toBe(false);

    const pOrQ: LogicAST = { type: "binary", op: "∨", left: P, right: Q };
    expect(evaluateAST(pOrQ, { P: false, Q: true })).toBe(true);
    expect(evaluateAST(pOrQ, { P: false, Q: false })).toBe(false);

    const notP: LogicAST = { type: "unary", op: "¬", operand: P };
    expect(evaluateAST(notP, { P: true })).toBe(false);
    expect(evaluateAST(notP, { P: false })).toBe(true);
  });

  it("evaluates material implication (P → Q) correctly", () => {
    const implies: LogicAST = { type: "binary", op: "→", left: P, right: Q };
    expect(evaluateAST(implies, { P: true, Q: true })).toBe(true);
    expect(evaluateAST(implies, { P: true, Q: false })).toBe(false); // only false case
    expect(evaluateAST(implies, { P: false, Q: true })).toBe(true);
    expect(evaluateAST(implies, { P: false, Q: false })).toBe(true);
  });

  it("generates complete 2^n row truth table", () => {
    const pOrQ: LogicAST = { type: "binary", op: "∨", left: P, right: Q };
    const tt = generateTruthTable(pOrQ);
    expect(tt.variables).toEqual(["P", "Q"]);
    expect(tt.rows).toHaveLength(4);
    expect(tt.isContingent).toBe(true);
    expect(tt.isTautology).toBe(false);
    expect(tt.isContradiction).toBe(false);
  });

  it("detects Law of Excluded Middle as Tautology: P ∨ ¬P", () => {
    const notP: LogicAST = { type: "unary", op: "¬", operand: P };
    const lem: LogicAST = { type: "binary", op: "∨", left: P, right: notP };
    const tt = generateTruthTable(lem);
    expect(tt.isTautology).toBe(true);
    expect(tt.isContradiction).toBe(false);
    expect(tt.isContingent).toBe(false);
  });

  it("detects Contradiction: P ∧ ¬P", () => {
    const notP: LogicAST = { type: "unary", op: "¬", operand: P };
    const contra: LogicAST = { type: "binary", op: "∧", left: P, right: notP };
    const tt = generateTruthTable(contra);
    expect(tt.isContradiction).toBe(true);
    expect(tt.isTautology).toBe(false);
  });

  it("verifies Modus Ponens as a Tautology: ((P → Q) ∧ P) → Q", () => {
    const pImpliesQ: LogicAST = { type: "binary", op: "→", left: P, right: Q };
    const premise: LogicAST = { type: "binary", op: "∧", left: pImpliesQ, right: P };
    const modusPonens: LogicAST = { type: "binary", op: "→", left: premise, right: Q };

    const tt = generateTruthTable(modusPonens);
    expect(tt.isTautology).toBe(true);
  });

  it("verifies De Morgan's Law: ¬(P ∧ Q) ≡ ¬P ∨ ¬Q", () => {
    const pAndQ: LogicAST = { type: "binary", op: "∧", left: P, right: Q };
    const lhs: LogicAST = { type: "unary", op: "¬", operand: pAndQ };

    const notP: LogicAST = { type: "unary", op: "¬", operand: P };
    const notQ: LogicAST = { type: "unary", op: "¬", operand: Q };
    const rhs: LogicAST = { type: "binary", op: "∨", left: notP, right: notQ };

    const eq = checkEquivalence(lhs, rhs);
    expect(eq.equivalent).toBe(true);
    expect(eq.counterexample).toBeUndefined();
  });

  it("catches non-equivalent formulas with counterexample", () => {
    // P ∧ Q is NOT equivalent to P ∨ Q
    const pAndQ: LogicAST = { type: "binary", op: "∧", left: P, right: Q };
    const pOrQ: LogicAST = { type: "binary", op: "∨", left: P, right: Q };

    const eq = checkEquivalence(pAndQ, pOrQ);
    expect(eq.equivalent).toBe(false);
    expect(eq.counterexample).toBeDefined();
  });

  it("verifies induction theorems base cases and step logic", () => {
    const thm = INDUCTION_THEOREMS[0]; // sum of integers
    expect(thm.baseCase.verified).toBe(true);
    expect(thm.evalLhs(5)).toBe(15);
    expect(thm.evalRhs(5)).toBe(15);
  });
});
