"use client";

import { parseCanvasToAutomaton, simulateMooreMealy } from "@/lib/algorithms/automata";
import { useWorkspaceStore } from "@/store/workspace-store";
import { ArrowRightLeft, Play } from "lucide-react";

export function MooreMealyView() {
  const nodes = useWorkspaceStore((s) => s.nodes);
  const edges = useWorkspaceStore((s) => s.edges);

  const automataInputString = useWorkspaceStore((s) => s.automataInputString);
  const setAutomataInputString = useWorkspaceStore((s) => s.setAutomataInputString);

  const automaton = parseCanvasToAutomaton(nodes, edges);
  const result = simulateMooreMealy(automaton, automataInputString);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lv-border-soft pb-3">
        <div>
          <h3 className="text-sm font-bold text-lv-text flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-lv-blue" /> Moore & Mealy State Transducer Analyzer
          </h3>
          <p className="text-[11px] text-lv-faint mt-0.5">
            Moore Machine: Output depends on state (Z(t) = λ(q(t))) | Mealy Machine: Output depends on state & transition edge (Z(t) = δ(q(t), x(t)))
          </p>
        </div>
        <span className="rounded-md bg-lv-blue/20 px-2.5 py-1 text-xs font-bold text-lv-blue border border-lv-blue/40">
          MODE: {automaton.type === "Mealy" ? "MEALY TRANSDUCER" : "MOORE TRANSDUCER"}
        </span>
      </div>

      {/* Output String Transduction Banner */}
      <div className="rounded-2xl border border-lv-blue/40 bg-lv-surface/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-lv-faint">Input String (x)</div>
          <div className="text-xs text-lv-faint">Output Sequence (z)</div>
        </div>

        <div className="flex items-center justify-between font-bold text-sm bg-lv-panel p-3 rounded-xl border border-lv-border">
          <span className="text-lv-cyan">"{automataInputString}"</span>
          <ArrowRightLeft className="h-4 w-4 text-lv-faint" />
          <span className="text-lv-purple">"{result.outputString}"</span>
        </div>
      </div>

      {/* Transduction Step Breakdown Table */}
      <div className="rounded-2xl border border-lv-border bg-lv-surface/60 p-4 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-lv-blue flex items-center gap-1.5">
          <Play className="h-3.5 w-3.5" /> Output Transduction Step Trace
        </div>

        <div className="overflow-x-auto lv-scrollbar">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-lv-border text-lv-faint bg-lv-panel/80">
                <th className="p-2.5">Step</th>
                <th className="p-2.5">Consumed Char</th>
                <th className="p-2.5">Active State</th>
                <th className="p-2.5">Output Symbol</th>
                <th className="p-2.5">Cumulative Output</th>
                <th className="p-2.5">Step Description</th>
              </tr>
            </thead>
            <tbody>
              {result.steps.map((step) => (
                <tr key={step.stepIndex} className="border-b border-lv-border-soft hover:bg-lv-panel/40">
                  <td className="p-2.5 font-bold text-lv-faint">Step {step.stepIndex}</td>
                  <td className="p-2.5 font-bold text-lv-cyan">
                    {step.charConsumed !== null ? `'${step.charConsumed}'` : "— (Start)"}
                  </td>
                  <td className="p-2.5 font-bold text-lv-text">{step.activeStateId}</td>
                  <td className="p-2.5 font-bold text-lv-purple">{step.outputGenerated}</td>
                  <td className="p-2.5 font-mono text-lv-success font-bold">{step.cumulativeOutput}</td>
                  <td className="p-2.5 text-[11px] text-lv-faint">{step.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
