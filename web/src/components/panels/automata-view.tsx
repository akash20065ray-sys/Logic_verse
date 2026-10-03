"use client";

import { useState } from "react";
import {
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  CheckCircle2,
  XCircle,
  Code2,
  Table,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { parseCanvasToAutomaton, simulateAutomaton } from "@/lib/algorithms/automata";
import { cn } from "@/lib/utils";

export function AutomataView() {
  const nodes = useWorkspaceStore((s) => s.nodes);
  const edges = useWorkspaceStore((s) => s.edges);

  const automataInputString = useWorkspaceStore((s) => s.automataInputString);
  const setAutomataInputString = useWorkspaceStore((s) => s.setAutomataInputString);
  const automataSimulation = useWorkspaceStore((s) => s.automataSimulation);
  const activeAutomataStepIndex = useWorkspaceStore((s) => s.activeAutomataStepIndex);
  const setAutomataStepIndex = useWorkspaceStore((s) => s.setAutomataStepIndex);

  const automaton = parseCanvasToAutomaton(nodes, edges);

  // Multi-string test suite state
  const [testSuite, setTestSuite] = useState<string[]>(["01", "101", "0001", "110", ""]);
  const [newTestInput, setNewTestInput] = useState("");

  function handleAddTestString(e: React.FormEvent) {
    e.preventDefault();
    if (!testSuite.includes(newTestInput)) {
      setTestSuite([...testSuite, newTestInput]);
      setNewTestInput("");
    }
  }

  function handleRemoveTestString(str: string) {
    setTestSuite(testSuite.filter((s) => s !== str));
  }

  const currentStep = automataSimulation?.steps?.[activeAutomataStepIndex];
  const stepsCount = automataSimulation?.steps?.length || 0;

  // Formal 5-tuple representation
  const Q = automaton.states.map((s) => s.label).join(", ");
  const Sigma = automaton.alphabet.join(", ");
  const q0 = automaton.states.find((s) => s.isStart)?.label || "q0";
  const F = automaton.states.filter((s) => s.isAccept).map((s) => s.label).join(", ");

  const latex5Tuple = `M = (Q, \\Sigma, \\delta, q_0, F)\nQ = \\{${Q}\\}\n\\Sigma = \\{${Sigma}\\}\nq_0 = ${q0}\nF = \\{${F}\\}`;

  return (
    <div className="space-y-4 font-mono">
      {/* Top Header: Machine Type Badge + 5-Tuple Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lv-border-soft pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-lv-blue/20 px-2.5 py-1 text-xs font-bold text-lv-blue border border-lv-blue/40">
            {automaton.type} MACHINE
          </span>
          <span className="text-xs text-lv-faint">
            |Q| = {automaton.states.length} states, Σ = &#123; {Sigma} &#125;
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-lv-faint">Start State q₀:</span>
          <span className="font-bold text-lv-cyan">{q0}</span>
          <span className="text-lv-faint ml-2">Accepting F:</span>
          <span className="font-bold text-lv-purple">&#123; {F || "none"} &#125;</span>
        </div>
      </div>

      {/* Main Grid: Single String Step Execution vs Multi-String Test Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Step-by-Step Simulation Execution Card */}
        <div className="space-y-3 rounded-2xl border border-lv-border bg-lv-surface/60 p-4">
          <div className="flex items-center justify-between border-b border-lv-border-soft pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-lv-cyan flex items-center gap-1.5">
              <Play className="h-3.5 w-3.5" /> Step-by-Step Execution Trace
            </span>
            <span className="text-xs text-lv-faint">
              Input: <strong className="text-lv-text font-bold">"{automataInputString}"</strong>
            </span>
          </div>

          {/* Active Step Details */}
          {currentStep ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-lv-cyan/30 bg-lv-panel/80 p-3">
                <div>
                  <div className="text-[11px] text-lv-faint">Step {currentStep.stepIndex} Transition Rule</div>
                  <div className="text-sm font-bold text-lv-cyan mt-0.5">
                    {currentStep.transitionRule}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-lv-faint">Consumed Prefix</div>
                  <div className="text-xs font-mono font-bold text-lv-purple">
                    "{currentStep.consumedPrefix}"<span className="text-lv-faint"> (rem: "{currentStep.remainingString}")</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-lv-text leading-relaxed bg-lv-panel/40 p-2.5 rounded-lg border border-lv-border-soft">
                {currentStep.description}
              </p>

              {/* Final Acceptance Status Banner */}
              {activeAutomataStepIndex === stepsCount - 1 && (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl p-3 text-xs font-bold border",
                    automataSimulation.isAccepted
                      ? "border-lv-success/50 bg-lv-success/10 text-lv-success"
                      : "border-lv-error/50 bg-lv-error/10 text-lv-error"
                  )}
                >
                  {automataSimulation.isAccepted ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-lv-success" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-lv-error" />
                  )}
                  <span>{automataSimulation.explanation}</span>
                </div>
              )}

              {/* Step Controls Bar */}
              <div className="flex items-center gap-2 pt-1 border-t border-lv-border-soft">
                <button
                  type="button"
                  onClick={() => setAutomataStepIndex(0)}
                  className="rounded p-1.5 text-lv-faint hover:bg-lv-panel hover:text-lv-text"
                  title="Reset to Step 0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAutomataStepIndex(Math.max(0, activeAutomataStepIndex - 1))}
                  disabled={activeAutomataStepIndex === 0}
                  className="rounded p-1.5 text-lv-faint hover:bg-lv-panel hover:text-lv-text disabled:opacity-30"
                >
                  <SkipBack className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAutomataStepIndex(Math.min(stepsCount - 1, activeAutomataStepIndex + 1))}
                  disabled={activeAutomataStepIndex === stepsCount - 1}
                  className="rounded p-1.5 text-lv-cyan hover:bg-lv-panel disabled:opacity-30"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </button>
                <span className="ml-auto text-[11px] text-lv-faint">
                  Step {activeAutomataStepIndex + 1} of {stepsCount}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-lv-faint text-xs">
              No states or steps to display. Add states to your canvas to run simulation.
            </div>
          )}
        </div>

        {/* Right: Multi-String Test Suite / Batch Tester */}
        <div className="space-y-3 rounded-2xl border border-lv-border bg-lv-surface/60 p-4">
          <div className="flex items-center justify-between border-b border-lv-border-soft pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-lv-purple flex items-center gap-1.5">
              <Table className="h-3.5 w-3.5" /> Multi-String Test Suite
            </span>
            <span className="text-[11px] text-lv-faint">Batch Tester</span>
          </div>

          <form onSubmit={handleAddTestString} className="flex gap-2">
            <input
              type="text"
              value={newTestInput}
              onChange={(e) => setNewTestInput(e.target.value)}
              placeholder="Add test string..."
              className="flex-1 rounded-xl border border-lv-border bg-lv-panel px-3 py-1.5 text-xs text-lv-text focus:border-lv-purple focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1 rounded-xl bg-lv-purple/20 px-3 py-1.5 text-xs font-semibold text-lv-purple hover:bg-lv-purple/30 transition-colors border border-lv-purple/40"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </form>

          {/* Test Table List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto lv-scrollbar pr-1">
            {testSuite.map((testStr, idx) => {
              const sim = simulateAutomaton(automaton, testStr);
              const isCurrent = automataInputString === testStr;

              return (
                <div
                  key={idx}
                  onClick={() => setAutomataInputString(testStr)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-2 text-xs transition-colors cursor-pointer select-none",
                    isCurrent
                      ? "border-lv-cyan bg-lv-cyan/10 font-bold"
                      : "border-lv-border-soft bg-lv-panel/70 hover:bg-lv-panel"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {sim.isAccepted ? (
                      <CheckCircle2 className="h-4 w-4 text-lv-success shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-lv-error shrink-0" />
                    )}
                    <span className="font-mono text-lv-text">
                      "{testStr}" <span className="text-[10px] text-lv-faint">({testStr.length} chars)</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                        sim.isAccepted
                          ? "bg-lv-success/20 text-lv-success"
                          : "bg-lv-error/20 text-lv-error"
                      )}
                    >
                      {sim.isAccepted ? "ACCEPTED" : "REJECTED"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTestString(testStr);
                      }}
                      className="text-lv-faint hover:text-lv-error p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Card: Transition Matrix Table δ(q, a) */}
      <div className="rounded-2xl border border-lv-border bg-lv-surface/60 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-lv-border-soft pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-lv-text flex items-center gap-1.5">
            <Table className="h-3.5 w-3.5 text-lv-cyan" /> Transition Matrix δ: Q × Σ → Q
          </span>
          <span className="text-[11px] text-lv-faint">Formal State Table</span>
        </div>

        <div className="overflow-x-auto lv-scrollbar">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-lv-border text-lv-faint bg-lv-panel/80">
                <th className="p-2.5">State (q)</th>
                <th className="p-2.5">Properties</th>
                {automaton.alphabet.map((char) => (
                  <th key={char} className="p-2.5 font-bold text-lv-cyan">
                    δ(q, '{char}')
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {automaton.states.map((st) => {
                return (
                  <tr key={st.id} className="border-b border-lv-border-soft hover:bg-lv-panel/40">
                    <td className="p-2.5 font-bold text-lv-text">
                      {st.isStart ? "→ " : ""}
                      {st.isAccept ? "(( " + st.label + " ))" : st.label}
                    </td>
                    <td className="p-2.5 text-[11px] text-lv-faint">
                      {st.isStart && <span className="text-lv-cyan mr-2">Start</span>}
                      {st.isAccept && <span className="text-lv-purple">Accept</span>}
                      {!st.isStart && !st.isAccept && "—"}
                    </td>
                    {automaton.alphabet.map((char) => {
                      const matches = automaton.transitions
                        .filter((t) => {
                          if (t.source !== st.id) return false;
                          const syms = t.symbol.split(",").map((s) => s.trim());
                          return syms.includes(char);
                        })
                        .map((t) => automaton.states.find((s) => s.id === t.target)?.label || t.target);

                      return (
                        <td key={char} className="p-2.5 text-lv-cyan font-semibold">
                          {matches.length === 0 ? "∅" : matches.join(", ")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
