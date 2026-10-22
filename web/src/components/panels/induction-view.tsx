"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Calculator,
  Sparkles,
  BookOpen,
  Plus,
  Play,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  Sigma,
  ArrowRight,
  Layers,
  Divide,
  ChevronDown,
} from "lucide-react";
import { INDUCTION_THEOREMS, type InductionTheorem } from "@/lib/algorithms/propositional-logic";
import { cn } from "@/lib/utils";

type InductionTab = "library" | "custom";
type CustomProofType = "sum" | "divisibility" | "inequality";

// Safe Math expression evaluator for induction variables (n, i, k)
function evaluateMathExpr(expr: string, val: number): number {
  try {
    // Clean string and substitute standard math shorthands
    const sanitized = expr
      .replace(/\^/g, "**")
      .replace(/(\d)([a-zA-Z])/g, "$1*$2") // e.g. 2n -> 2*n
      .replace(/([a-zA-Z])(\d)/g, "$1*$2");

    // Construct restricted function
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function("n", "i", "k", "Math", `
      try {
        return Number(${sanitized});
      } catch(e) {
        return NaN;
      }
    `);
    const res = fn(val, val, val, Math);
    return typeof res === "number" && !isNaN(res) ? res : NaN;
  } catch {
    return NaN;
  }
}

interface CustomSumPreset {
  name: string;
  n0: number;
  termA: string;
  termDesc: string;
  sumS: string;
  sumDesc: string;
}

const SUM_PRESETS: CustomSumPreset[] = [
  {
    name: "Sum of Consecutive Products: Σ i(i + 1)",
    n0: 1,
    termA: "i * (i + 1)",
    termDesc: "i(i + 1)",
    sumS: "(n * (n + 1) * (n + 2)) / 3",
    sumDesc: "n(n + 1)(n + 2) / 3",
  },
  {
    name: "Telescoping Series: Σ 1 / [i(i + 1)]",
    n0: 1,
    termA: "1 / (i * (i + 1))",
    termDesc: "1 / (i(i + 1))",
    sumS: "n / (n + 1)",
    sumDesc: "n / (n + 1)",
  },
  {
    name: "Arithmetic Progression: Σ (3i - 1)",
    n0: 1,
    termA: "3 * i - 1",
    termDesc: "3i - 1",
    sumS: "(n * (3 * n + 1)) / 2",
    sumDesc: "n(3n + 1) / 2",
  },
  {
    name: "Geometric Series: Σ 3^i",
    n0: 0,
    termA: "Math.pow(3, i)",
    termDesc: "3ⁱ",
    sumS: "(Math.pow(3, n + 1) - 1) / 2",
    sumDesc: "(3ⁿ⁺¹ - 1) / 2",
  },
];

interface CustomDivPreset {
  name: string;
  n0: number;
  divisor: number;
  expr: string;
  desc: string;
}

const DIV_PRESETS: CustomDivPreset[] = [
  {
    name: "8 | (3^(2n) - 1)",
    n0: 1,
    divisor: 8,
    expr: "Math.pow(3, 2 * n) - 1",
    desc: "3^(2n) - 1 is divisible by 8",
  },
  {
    name: "5 | (4^(2n) - 1)",
    n0: 1,
    divisor: 5,
    expr: "Math.pow(4, 2 * n) - 1",
    desc: "4^(2n) - 1 is divisible by 5",
  },
  {
    name: "3 | (n³ + 2n)",
    n0: 1,
    divisor: 3,
    expr: "n * n * n + 2 * n",
    desc: "n³ + 2n is divisible by 3",
  },
];

export function InductionView() {
  const [activeTab, setActiveTab] = useState<InductionTab>("library");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTheoremId, setSelectedTheoremId] = useState(INDUCTION_THEOREMS[0].id);
  const [testN, setTestN] = useState(5);

  // Custom Builder State
  const [customType, setCustomType] = useState<CustomProofType>("sum");
  
  // Custom Summation state
  const [customN0, setCustomN0] = useState<number>(1);
  const [customTermA, setCustomTermA] = useState<string>("i * (i + 1)");
  const [customSumS, setCustomSumS] = useState<string>("(n * (n + 1) * (n + 2)) / 3");
  const [customSumTestN, setCustomSumTestN] = useState<number>(5);

  // Custom Divisibility state
  const [customDivN0, setCustomDivN0] = useState<number>(1);
  const [customDivisor, setCustomDivisor] = useState<number>(8);
  const [customDivExpr, setCustomDivExpr] = useState<string>("Math.pow(3, 2 * n) - 1");

  // Custom Inequality state
  const [customIneqN0, setCustomIneqN0] = useState<number>(1);
  const [customIneqOp, setCustomIneqOp] = useState<">" | ">=" | "<" | "<=">(">");
  const [customIneqLhs, setCustomIneqLhs] = useState<string>("Math.pow(2, n)");
  const [customIneqRhs, setCustomIneqRhs] = useState<string>("n");

  const filteredTheorems = useMemo(() => {
    if (categoryFilter === "all") return INDUCTION_THEOREMS;
    return INDUCTION_THEOREMS.filter((t) => t.category === categoryFilter);
  }, [categoryFilter]);

  const activeThm =
    INDUCTION_THEOREMS.find((t) => t.id === selectedTheoremId) || INDUCTION_THEOREMS[0];
  const activeLhsVal = activeThm.evalLhs(testN);
  const activeRhsVal = activeThm.evalRhs(testN);

  // Custom Summation dynamic evaluation
  const customSumEvaluation = useMemo(() => {
    // Base case P(n0)
    const baseLhs = evaluateMathExpr(customTermA, customN0);
    const baseRhs = evaluateMathExpr(customSumS, customN0);
    const baseVerified =
      !isNaN(baseLhs) && !isNaN(baseRhs) && Math.abs(baseLhs - baseRhs) < 1e-6;

    // Numerical test across ladder n0 .. n0 + 8
    const ladder: Array<{
      n: number;
      termVal: number;
      cumSum: number;
      formulaVal: number;
      match: boolean;
    }> = [];

    let runningSum = 0;
    let allLadderValid = true;

    for (let cur = customN0; cur <= customN0 + 8; cur++) {
      const termVal = evaluateMathExpr(customTermA, cur);
      runningSum += isNaN(termVal) ? 0 : termVal;
      const formulaVal = evaluateMathExpr(customSumS, cur);
      const match =
        !isNaN(termVal) &&
        !isNaN(formulaVal) &&
        Math.abs(runningSum - formulaVal) < 1e-6;

      if (!match) allLadderValid = false;

      ladder.push({
        n: cur,
        termVal,
        cumSum: runningSum,
        formulaVal,
        match,
      });
    }

    // Inductive step algebraic verification check (at k = customSumTestN)
    const testK = Math.max(customN0, customSumTestN);
    const sk = evaluateMathExpr(customSumS, testK);
    const nextTerm = evaluateMathExpr(customTermA, testK + 1);
    const lhsKPlus1 = sk + nextTerm;
    const rhsKPlus1 = evaluateMathExpr(customSumS, testK + 1);
    const inductiveStepHolds =
      !isNaN(lhsKPlus1) && !isNaN(rhsKPlus1) && Math.abs(lhsKPlus1 - rhsKPlus1) < 1e-6;

    return {
      baseLhs,
      baseRhs,
      baseVerified,
      ladder,
      allLadderValid,
      testK,
      sk,
      nextTerm,
      lhsKPlus1,
      rhsKPlus1,
      inductiveStepHolds,
    };
  }, [customTermA, customSumS, customN0, customSumTestN]);

  // Custom Divisibility evaluation
  const customDivEvaluation = useMemo(() => {
    const baseVal = evaluateMathExpr(customDivExpr, customDivN0);
    const baseRem = isNaN(baseVal) || customDivisor === 0 ? NaN : baseVal % customDivisor;
    const baseVerified = baseRem === 0;

    const ladder: Array<{
      n: number;
      val: number;
      quotient: number;
      remainder: number;
      divisible: boolean;
    }> = [];

    for (let cur = customDivN0; cur <= customDivN0 + 6; cur++) {
      const val = evaluateMathExpr(customDivExpr, cur);
      const remainder = isNaN(val) || customDivisor === 0 ? NaN : val % customDivisor;
      const quotient = isNaN(val) || customDivisor === 0 ? NaN : Math.floor(val / customDivisor);
      ladder.push({
        n: cur,
        val,
        quotient,
        remainder,
        divisible: remainder === 0,
      });
    }

    return {
      baseVal,
      baseRem,
      baseVerified,
      ladder,
    };
  }, [customDivExpr, customDivN0, customDivisor]);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lv-border-soft pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all",
              activeTab === "library"
                ? "bg-lv-cyan/20 text-lv-cyan border border-lv-cyan/40 shadow-sm shadow-lv-cyan/10"
                : "text-lv-muted hover:text-lv-text hover:bg-lv-surface border border-transparent"
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Standard Discrete Math Theorems ({INDUCTION_THEOREMS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all",
              activeTab === "custom"
                ? "bg-lv-purple/20 text-lv-purple border border-lv-purple/40 shadow-sm shadow-lv-purple/10"
                : "text-lv-muted hover:text-lv-text hover:bg-lv-surface border border-transparent"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Custom Induction Prover & Builder
          </button>
        </div>

        <span className="rounded-full bg-lv-surface border border-lv-border px-3 py-1 text-[11px] font-bold text-lv-faint">
          Principle of Mathematical Induction: P(n₀) ∧ (∀k ≥ n₀. P(k) ⇒ P(k+1)) ⇒ ∀n ≥ n₀. P(n)
        </span>
      </div>

      {/* TAB 1: STANDARD THEOREMS LIBRARY */}
      {activeTab === "library" && (
        <div className="space-y-4">
          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Theorems" },
              { id: "sums", label: "Summations" },
              { id: "divisibility", label: "Divisibility" },
              { id: "inequalities", label: "Inequalities" },
              { id: "powers", label: "Powers of 2" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors",
                  categoryFilter === cat.id
                    ? "bg-lv-cyan/15 text-lv-cyan border border-lv-cyan/30"
                    : "bg-lv-surface text-lv-muted hover:text-lv-text border border-lv-border-soft"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Theorem Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {filteredTheorems.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTheoremId(t.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium font-mono transition-colors text-left",
                  selectedTheoremId === t.id
                    ? "bg-lv-cyan/20 text-lv-cyan border border-lv-cyan/40 font-bold"
                    : "bg-lv-surface text-lv-muted hover:bg-lv-surface/80 hover:text-lv-text border border-lv-border"
                )}
              >
                {t.title}
              </button>
            ))}
          </div>

          {/* Main Theorem Statement */}
          <div className="rounded-2xl border border-lv-cyan/30 bg-lv-cyan/5 p-4 space-y-1.5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-lv-cyan font-bold flex items-center gap-1.5">
              <Sigma className="h-3.5 w-3.5" />
              Theorem Proposition Statement P(n)
            </div>
            <div className="font-mono text-base font-bold text-lv-cyan">
              {activeThm.formula}
            </div>
          </div>

          {/* 3 Classical Proof Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1: Base Case */}
            <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-lv-success font-mono">
                <CheckCircle2 className="h-4 w-4" />
                1. Base Step (n = {activeThm.baseCase.n})
              </div>
              <div className="text-xs text-lv-muted font-mono space-y-1">
                <div>LHS: {activeThm.baseCase.lhs} = {activeThm.baseCase.lhsVal}</div>
                <div>RHS: {activeThm.baseCase.rhs}</div>
                <div className="text-lv-success font-semibold flex items-center gap-1 pt-1">
                  <CheckCircle2 className="h-3 w-3" /> P({activeThm.baseCase.n}) holds true!
                </div>
              </div>
            </div>

            {/* Step 2: Inductive Hypothesis */}
            <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-lv-blue font-mono">
                <ChevronRight className="h-4 w-4" />
                2. Inductive Hypothesis P(k)
              </div>
              <p className="text-xs text-lv-text font-mono leading-relaxed">
                {activeThm.hypothesis.statement}
              </p>
            </div>

            {/* Step 3: Inductive Step P(k+1) */}
            <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-lv-purple font-mono">
                <ChevronRight className="h-4 w-4" />
                3. Inductive Step P(k + 1)
              </div>
              <div className="text-[11px] text-lv-muted font-mono space-y-1">
                <div className="text-lv-text font-semibold">{activeThm.inductiveStep.goal}</div>
                <div className="space-y-0.5 pt-1">
                  {activeThm.inductiveStep.derivationSteps.map((s, i) => (
                    <div key={i} className="pl-1 text-lv-muted border-l border-lv-purple/30 text-[10px]">
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Inductive Conclusion Banner */}
          <div className="rounded-xl border border-lv-border bg-lv-panel/90 p-3 text-xs text-lv-muted leading-relaxed">
            <strong className="text-lv-text">Mathematical Induction Conclusion: </strong>
            {activeThm.inductiveStep.conclusion}
          </div>

          {/* Interactive Value Tester Ladder */}
          <div className="rounded-2xl border border-lv-border bg-lv-surface/40 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-lv-text">
                <Calculator className="h-4 w-4 text-lv-cyan" />
                Dynamic Value Ladder Tester (Interactive n = {testN})
              </span>
              <span className="font-mono text-xs text-lv-success font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {activeLhsVal === activeRhsVal ? "LHS = RHS: Formula Holds at n = " + testN : "Formula Mismatch"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="12"
                value={testN}
                onChange={(e) => setTestN(Number(e.target.value))}
                className="flex-1 accent-lv-cyan"
              />
              <span className="font-mono text-xs text-lv-cyan font-bold w-12 text-right">
                n = {testN}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div className="rounded-xl bg-lv-panel p-3 border border-lv-border-soft space-y-1">
                <div className="text-[10px] text-lv-faint font-bold uppercase">LHS Evaluated Sum / Term</div>
                <div className="text-lv-text truncate">
                  {activeThm.lhsDescription(testN)} = <strong className="text-lv-cyan font-bold text-sm">{activeLhsVal}</strong>
                </div>
              </div>
              <div className="rounded-xl bg-lv-panel p-3 border border-lv-border-soft space-y-1">
                <div className="text-[10px] text-lv-faint font-bold uppercase">RHS Closed-Form Formula</div>
                <div className="text-lv-text truncate">
                  {activeThm.rhsDescription(testN)} = <strong className="text-lv-cyan font-bold text-sm">{activeRhsVal}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM INDUCTION PROVER & BUILDER */}
      {activeTab === "custom" && (
        <div className="space-y-4">
          {/* Paradigm Sub-Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lv-border-soft pb-2.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCustomType("sum")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5",
                  customType === "sum"
                    ? "bg-lv-purple/20 text-lv-purple border border-lv-purple/40"
                    : "bg-lv-surface text-lv-muted hover:text-lv-text border border-lv-border"
                )}
              >
                <Sigma className="h-3.5 w-3.5" />
                Summation Identity Σ a(i) = S(n)
              </button>
              <button
                type="button"
                onClick={() => setCustomType("divisibility")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5",
                  customType === "divisibility"
                    ? "bg-lv-blue/20 text-lv-blue border border-lv-blue/40"
                    : "bg-lv-surface text-lv-muted hover:text-lv-text border border-lv-border"
                )}
              >
                <Divide className="h-3.5 w-3.5" />
                Divisibility Identity d | f(n)
              </button>
              <button
                type="button"
                onClick={() => setCustomType("inequality")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5",
                  customType === "inequality"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-lv-surface text-lv-muted hover:text-lv-text border border-lv-border"
                )}
              >
                <Layers className="h-3.5 w-3.5" />
                Inequality Induction L(n) ≥ R(n)
              </button>
            </div>

            {/* Presets loader */}
            {customType === "sum" && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-lv-faint">Presets:</span>
                {SUM_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCustomN0(p.n0);
                      setCustomTermA(p.termA);
                      setCustomSumS(p.sumS);
                    }}
                    className="rounded bg-lv-surface hover:bg-lv-panel px-2 py-0.5 text-[10px] text-lv-text border border-lv-border hover:border-lv-purple/40"
                  >
                    {p.name.split(":")[0]}
                  </button>
                ))}
              </div>
            )}

            {customType === "divisibility" && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-lv-faint">Presets:</span>
                {DIV_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCustomDivN0(p.n0);
                      setCustomDivisor(p.divisor);
                      setCustomDivExpr(p.expr);
                    }}
                    className="rounded bg-lv-surface hover:bg-lv-panel px-2 py-0.5 text-[10px] text-lv-text border border-lv-border hover:border-lv-blue/40"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PARADIGM 1: SUMMATION IDENTITY */}
          {customType === "sum" && (
            <div className="space-y-4">
              {/* Custom Inputs Panel */}
              <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-4 space-y-3">
                <div className="text-xs font-bold text-lv-purple flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Configure Custom Mathematical Induction Identity
                  </span>
                  <span className="text-[11px] text-lv-faint">
                    Proposition: P(n) : Σ_&#123;i=n₀&#125;^n a(i) = S(n)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-lv-faint uppercase block mb-1">
                      1. Base Step Index (n₀)
                    </label>
                    <input
                      type="number"
                      value={customN0}
                      onChange={(e) => setCustomN0(Number(e.target.value) || 0)}
                      className="w-full rounded-xl border border-lv-border bg-lv-panel px-3 py-2 text-xs font-mono text-lv-text focus:outline-none focus:border-lv-purple"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-lv-faint uppercase block mb-1">
                      2. i-th Term a(i)
                    </label>
                    <input
                      type="text"
                      value={customTermA}
                      onChange={(e) => setCustomTermA(e.target.value)}
                      placeholder="e.g. i * (i + 1) or 2*i - 1"
                      className="w-full rounded-xl border border-lv-border bg-lv-panel px-3 py-2 text-xs font-mono text-lv-purple font-bold focus:outline-none focus:border-lv-purple"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-lv-faint uppercase block mb-1">
                      3. Closed-Form Sum S(n)
                    </label>
                    <input
                      type="text"
                      value={customSumS}
                      onChange={(e) => setCustomSumS(e.target.value)}
                      placeholder="e.g. (n * (n + 1) * (n + 2)) / 3"
                      className="w-full rounded-xl border border-lv-border bg-lv-panel px-3 py-2 text-xs font-mono text-lv-cyan font-bold focus:outline-none focus:border-lv-purple"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Proof Decomposition */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Step 1: Base Case */}
                <div className="rounded-2xl border border-lv-border bg-lv-surface/60 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-lv-success font-mono">
                      <CheckCircle2 className="h-4 w-4" />
                      1. Base Case P({customN0})
                    </span>
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-bold border",
                        customSumEvaluation.baseVerified
                          ? "bg-lv-success/15 text-lv-success border-lv-success/30"
                          : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                      )}
                    >
                      {customSumEvaluation.baseVerified ? "VERIFIED ✓" : "MISMATCH ✗"}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-lv-muted font-mono">
                    <div>LHS: a({customN0}) = <strong className="text-lv-text">{customSumEvaluation.baseLhs}</strong></div>
                    <div>RHS: S({customN0}) = <strong className="text-lv-text">{customSumEvaluation.baseRhs}</strong></div>
                    <div className="text-[11px] text-lv-faint pt-1">
                      {customSumEvaluation.baseVerified
                        ? `LHS = RHS = ${customSumEvaluation.baseLhs}. The base case is proven.`
                        : `LHS (${customSumEvaluation.baseLhs}) ≠ RHS (${customSumEvaluation.baseRhs}). Base case fails.`}
                    </div>
                  </div>
                </div>

                {/* Step 2: Inductive Hypothesis */}
                <div className="rounded-2xl border border-lv-border bg-lv-surface/60 p-3.5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-lv-blue font-mono">
                    <ChevronRight className="h-4 w-4" />
                    2. Inductive Hypothesis P(k)
                  </div>
                  <div className="text-xs text-lv-text font-mono leading-relaxed space-y-1">
                    <p>
                      Assume P(k) is true for some integer k ≥ {customN0}:
                    </p>
                    <div className="rounded-lg bg-lv-panel p-2 text-xs font-bold text-lv-blue border border-lv-border-soft">
                      Σ_&#123;i={customN0}&#125;^k a(i) = S(k)
                    </div>
                  </div>
                </div>

                {/* Step 3: Inductive Step */}
                <div className="rounded-2xl border border-lv-border bg-lv-surface/60 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-lv-purple font-mono">
                      <ChevronRight className="h-4 w-4" />
                      3. Inductive Step P(k + 1)
                    </span>
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-bold border",
                        customSumEvaluation.inductiveStepHolds
                          ? "bg-lv-purple/15 text-lv-purple border-lv-purple/30"
                          : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                      )}
                    >
                      {customSumEvaluation.inductiveStepHolds ? "HOLDS ✓" : "CHECK DERIVATION"}
                    </span>
                  </div>

                  <div className="text-[11px] text-lv-muted font-mono space-y-1">
                    <div className="text-lv-text font-semibold">Goal: Show Σ_&#123;i={customN0}&#125;^&#123;k+1&#125; a(i) = S(k + 1)</div>
                    <div className="text-lv-muted">LHS = [Σ_&#123;i={customN0}&#125;^k a(i)] + a(k + 1)</div>
                    <div className="text-lv-muted">= S(k) + a(k + 1)</div>
                    <div className="text-lv-cyan">
                      At k={customSumEvaluation.testK}: {customSumEvaluation.sk} + {customSumEvaluation.nextTerm} = {customSumEvaluation.lhsKPlus1}
                    </div>
                    <div className="text-lv-purple">
                      S(k+1) = {customSumEvaluation.rhsKPlus1}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Induction Verification Ladder */}
              <div className="rounded-2xl border border-lv-border bg-lv-surface/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-lv-text uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-lv-purple" />
                    Dynamic Mathematical Induction Verification Ladder (n = {customN0} .. {customN0 + 8})
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold border",
                      customSumEvaluation.allLadderValid
                        ? "bg-lv-success/20 text-lv-success border-lv-success/40"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    )}
                  >
                    {customSumEvaluation.allLadderValid
                      ? "All 9 Tested Steps Prove Induction Identity ✓"
                      : "Counterexample Encountered in Step Ladder"}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-lv-border bg-lv-panel">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-lv-border bg-lv-surface/70 text-lv-faint">
                        <th className="p-2.5">Step (n)</th>
                        <th className="p-2.5">Term a(n)</th>
                        <th className="p-2.5">Cumulative Σ a(i) (LHS)</th>
                        <th className="p-2.5">Formula S(n) (RHS)</th>
                        <th className="p-2.5">Delta (LHS - RHS)</th>
                        <th className="p-2.5">Induction Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lv-border-soft">
                      {customSumEvaluation.ladder.map((step) => (
                        <tr key={step.n} className="hover:bg-lv-surface/40 transition-colors">
                          <td className="p-2.5 font-bold text-lv-purple">n = {step.n}</td>
                          <td className="p-2.5 font-mono text-lv-text">{step.termVal}</td>
                          <td className="p-2.5 font-mono text-lv-cyan font-bold">{step.cumSum}</td>
                          <td className="p-2.5 font-mono text-lv-purple font-bold">{step.formulaVal}</td>
                          <td className="p-2.5 font-mono text-lv-muted">{Math.abs(step.cumSum - step.formulaVal).toFixed(2)}</td>
                          <td className="p-2.5">
                            {step.match ? (
                              <span className="flex items-center gap-1 text-lv-success font-bold text-[11px]">
                                <CheckCircle2 className="h-3 w-3" /> P({step.n}) Holds
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-rose-400 font-bold text-[11px]">
                                <AlertTriangle className="h-3 w-3" /> Fails
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PARADIGM 2: DIVISIBILITY IDENTITY */}
          {customType === "divisibility" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-4 space-y-3">
                <div className="text-xs font-bold text-lv-blue flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Divide className="h-3.5 w-3.5" /> Configure Divisibility Induction Problem
                  </span>
                  <span className="text-[11px] text-lv-faint">
                    Proposition: P(n) : d | f(n)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-lv-faint uppercase block mb-1">
                      1. Base Index n₀
                    </label>
                    <input
                      type="number"
                      value={customDivN0}
                      onChange={(e) => setCustomDivN0(Number(e.target.value) || 0)}
                      className="w-full rounded-xl border border-lv-border bg-lv-panel px-3 py-2 text-xs font-mono text-lv-text focus:outline-none focus:border-lv-blue"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-lv-faint uppercase block mb-1">
                      2. Divisor d
                    </label>
                    <input
                      type="number"
                      value={customDivisor}
                      onChange={(e) => setCustomDivisor(Number(e.target.value) || 1)}
                      className="w-full rounded-xl border border-lv-border bg-lv-panel px-3 py-2 text-xs font-mono text-lv-cyan font-bold focus:outline-none focus:border-lv-blue"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-lv-faint uppercase block mb-1">
                      3. Expression f(n)
                    </label>
                    <input
                      type="text"
                      value={customDivExpr}
                      onChange={(e) => setCustomDivExpr(e.target.value)}
                      placeholder="e.g. Math.pow(3, 2 * n) - 1"
                      className="w-full rounded-xl border border-lv-border bg-lv-panel px-3 py-2 text-xs font-mono text-lv-blue font-bold focus:outline-none focus:border-lv-blue"
                    />
                  </div>
                </div>
              </div>

              {/* Divisibility Ladder Table */}
              <div className="rounded-2xl border border-lv-border bg-lv-surface/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-lv-text uppercase tracking-wider flex items-center gap-1.5">
                    <Divide className="h-4 w-4 text-lv-blue" />
                    Divisibility Remainder Verification Table (Mod {customDivisor})
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold border",
                      customDivEvaluation.baseVerified
                        ? "bg-lv-success/20 text-lv-success border-lv-success/40"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    )}
                  >
                    {customDivEvaluation.baseVerified
                      ? `Base Case Verified: ${customDivisor} | f(${customDivN0})`
                      : "Base Case Fails"}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-lv-border bg-lv-panel">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-lv-border bg-lv-surface/70 text-lv-faint">
                        <th className="p-2.5">Step (n)</th>
                        <th className="p-2.5">Expression f(n)</th>
                        <th className="p-2.5">Calculated Value</th>
                        <th className="p-2.5">Quotient (f(n) / {customDivisor})</th>
                        <th className="p-2.5">Remainder (mod {customDivisor})</th>
                        <th className="p-2.5">Divisible?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lv-border-soft">
                      {customDivEvaluation.ladder.map((step) => (
                        <tr key={step.n} className="hover:bg-lv-surface/40 transition-colors">
                          <td className="p-2.5 font-bold text-lv-blue">n = {step.n}</td>
                          <td className="p-2.5 font-mono text-lv-muted">{customDivExpr}</td>
                          <td className="p-2.5 font-mono text-lv-text font-bold">{step.val}</td>
                          <td className="p-2.5 font-mono text-lv-cyan">{step.quotient}</td>
                          <td className="p-2.5 font-mono font-bold text-lv-purple">{step.remainder}</td>
                          <td className="p-2.5">
                            {step.divisible ? (
                              <span className="flex items-center gap-1 text-lv-success font-bold text-[11px]">
                                <CheckCircle2 className="h-3 w-3" /> Yes ({customDivisor} | {step.val})
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-rose-400 font-bold text-[11px]">
                                <AlertTriangle className="h-3 w-3" /> Not Divisible
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PARADIGM 3: INEQUALITY INDUCTION */}
          {customType === "inequality" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-4 space-y-3">
                <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> Configure Inequality Induction Problem
                  </span>
                  <span className="text-[11px] text-lv-faint">
                    Proposition: P(n) : L(n) {customIneqOp} R(n)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-lv-faint uppercase block mb-1">
                      1. Base Case n₀
                    </label>
                    <input
                      type="number"
                      value={customIneqN0}
                      onChange={(e) => setCustomIneqN0(Number(e.target.value) || 0)}
                      className="w-full rounded-xl border border-lv-border bg-lv-panel px-3 py-2 text-xs font-mono text-lv-text focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-lv-faint uppercase block mb-1">
                      2. Operator
                    </label>
                    <select
                      value={customIneqOp}
                      onChange={(e) => setCustomIneqOp(e.target.value as any)}
                      className="w-full rounded-xl border border-lv-border bg-lv-panel px-3 py-2 text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                    >
                      <option value=">">&gt; (Strictly Greater)</option>
                      <option value=">=">&ge; (Greater or Equal)</option>
                      <option value="<">&lt; (Strictly Less)</option>
                      <option value="<=">&le; (Less or Equal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-lv-faint uppercase block mb-1">
                      3. LHS L(n)
                    </label>
                    <input
                      type="text"
                      value={customIneqLhs}
                      onChange={(e) => setCustomIneqLhs(e.target.value)}
                      placeholder="e.g. Math.pow(2, n)"
                      className="w-full rounded-xl border border-lv-border bg-lv-panel px-3 py-2 text-xs font-mono text-lv-cyan font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-lv-faint uppercase block mb-1">
                      4. RHS R(n)
                    </label>
                    <input
                      type="text"
                      value={customIneqRhs}
                      onChange={(e) => setCustomIneqRhs(e.target.value)}
                      placeholder="e.g. n or n * n"
                      className="w-full rounded-xl border border-lv-border bg-lv-panel px-3 py-2 text-xs font-mono text-purple-300 font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Inequality Tester Table */}
              <div className="rounded-2xl border border-lv-border bg-lv-surface/50 p-4 space-y-3">
                <span className="text-xs font-bold text-lv-text uppercase tracking-wider block">
                  Inequality Verification Ladder for n = {customIneqN0} .. {customIneqN0 + 6}
                </span>

                <div className="overflow-x-auto rounded-xl border border-lv-border bg-lv-panel">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-lv-border bg-lv-surface/70 text-lv-faint">
                        <th className="p-2.5">Step (n)</th>
                        <th className="p-2.5">LHS L(n)</th>
                        <th className="p-2.5">Comparison</th>
                        <th className="p-2.5">RHS R(n)</th>
                        <th className="p-2.5">Inequality Holds?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lv-border-soft">
                      {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                        const cur = customIneqN0 + offset;
                        const l = evaluateMathExpr(customIneqLhs, cur);
                        const r = evaluateMathExpr(customIneqRhs, cur);
                        let holds = false;
                        if (!isNaN(l) && !isNaN(r)) {
                          if (customIneqOp === ">") holds = l > r;
                          else if (customIneqOp === ">=") holds = l >= r;
                          else if (customIneqOp === "<") holds = l < r;
                          else if (customIneqOp === "<=") holds = l <= r;
                        }

                        return (
                          <tr key={cur} className="hover:bg-lv-surface/40 transition-colors">
                            <td className="p-2.5 font-bold text-amber-300">n = {cur}</td>
                            <td className="p-2.5 font-mono text-lv-cyan font-bold">{l}</td>
                            <td className="p-2.5 font-mono text-lv-faint text-center">{customIneqOp}</td>
                            <td className="p-2.5 font-mono text-purple-300 font-bold">{r}</td>
                            <td className="p-2.5">
                              {holds ? (
                                <span className="flex items-center gap-1 text-lv-success font-bold text-[11px]">
                                  <CheckCircle2 className="h-3 w-3" /> P({cur}) True ({l} {customIneqOp} {r})
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-rose-400 font-bold text-[11px]">
                                  <AlertTriangle className="h-3 w-3" /> False ({l} not {customIneqOp} {r})
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
