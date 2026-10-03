"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, Calculator } from "lucide-react";
import { INDUCTION_THEOREMS } from "@/lib/algorithms/propositional-logic";
import { cn } from "@/lib/utils";

export function InductionView() {
  const [selectedTheoremId, setSelectedTheoremId] = useState(INDUCTION_THEOREMS[0].id);
  const [testN, setTestN] = useState(5);

  const thm = INDUCTION_THEOREMS.find((t) => t.id === selectedTheoremId) || INDUCTION_THEOREMS[0];
  const lhsVal = thm.evalLhs(testN);
  const rhsVal = thm.evalRhs(testN);

  return (
    <div className="space-y-4">
      {/* Theorem Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-lv-border-soft pb-2.5">
        {INDUCTION_THEOREMS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedTheoremId(t.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium font-mono transition-colors",
              selectedTheoremId === t.id
                ? "bg-lv-cyan/15 text-lv-cyan border border-lv-cyan/30"
                : "text-lv-muted hover:bg-lv-surface hover:text-lv-text"
            )}
          >
            {t.title}
          </button>
        ))}
      </div>

      {/* Main Theorem Statement */}
      <div className="rounded-xl border border-lv-border bg-lv-panel/80 p-3.5 space-y-1.5">
        <div className="text-[10px] uppercase font-mono tracking-wider text-lv-faint font-semibold">
          Theorem Statement
        </div>
        <div className="font-mono text-sm font-bold text-lv-cyan">
          {thm.formula}
        </div>
      </div>

      {/* Proof Steps: Base Case, Hypothesis, Inductive Step */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Step 1: Base Case */}
        <div className="rounded-xl border border-lv-border bg-lv-surface/50 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-lv-success font-mono">
            <CheckCircle2 className="h-3.5 w-3.5" />
            1. Base Step (n = {thm.baseCase.n})
          </div>
          <div className="text-xs text-lv-muted font-mono space-y-1">
            <div>LHS: {thm.baseCase.lhs} = {thm.baseCase.lhsVal}</div>
            <div>RHS: {thm.baseCase.rhs}</div>
            <div className="text-lv-success font-semibold">LHS = RHS ✓ Verified</div>
          </div>
        </div>

        {/* Step 2: Inductive Hypothesis */}
        <div className="rounded-xl border border-lv-border bg-lv-surface/50 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-lv-blue font-mono">
            <ChevronRight className="h-3.5 w-3.5" />
            2. Inductive Hypothesis P(k)
          </div>
          <p className="text-xs text-lv-text font-mono leading-relaxed">
            {thm.hypothesis.statement}
          </p>
        </div>

        {/* Step 3: Inductive Step P(k+1) */}
        <div className="rounded-xl border border-lv-border bg-lv-surface/50 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-lv-purple font-mono">
            <ChevronRight className="h-3.5 w-3.5" />
            3. Inductive Step P(k + 1)
          </div>
          <div className="text-[11px] text-lv-muted font-mono space-y-1">
            <div className="text-lv-text font-semibold">{thm.inductiveStep.goal}</div>
            {thm.inductiveStep.derivationSteps.map((s, i) => (
              <div key={i} className="pl-1 text-lv-muted">{s}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Value Tester Ladder */}
      <div className="rounded-xl border border-lv-border bg-lv-surface/30 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-lv-text">
            <Calculator className="h-3.5 w-3.5 text-lv-cyan" />
            Interactive Value Tester (n = {testN})
          </span>
          <span className="font-mono text-xs text-lv-success font-bold">
            {lhsVal === rhsVal ? "LHS = RHS (Formula Holds)" : "Mismatch"}
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
          <span className="font-mono text-xs text-lv-cyan font-bold w-8 text-right">
            n={testN}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
          <div className="rounded-lg bg-lv-panel/70 p-2 border border-lv-border-soft">
            <div className="text-[10px] text-lv-faint">LHS Summation</div>
            <div className="text-lv-text truncate">{thm.lhsDescription(testN)} = <strong className="text-lv-cyan">{lhsVal}</strong></div>
          </div>
          <div className="rounded-lg bg-lv-panel/70 p-2 border border-lv-border-soft">
            <div className="text-[10px] text-lv-faint">RHS Formula</div>
            <div className="text-lv-text truncate">{thm.rhsDescription(testN)} = <strong className="text-lv-cyan">{rhsVal}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
