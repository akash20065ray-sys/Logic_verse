"use client";

import { parseCanvasToAutomaton, minimizeDFA } from "@/lib/algorithms/automata";
import { useWorkspaceStore } from "@/store/workspace-store";
import { Sparkles, Download, Layers } from "lucide-react";

export function DfaMinimizationView() {
  const nodes = useWorkspaceStore((s) => s.nodes);
  const edges = useWorkspaceStore((s) => s.edges);
  const setNodes = useWorkspaceStore((s) => s.setNodes);
  const setEdges = useWorkspaceStore((s) => s.setEdges);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);

  const automaton = parseCanvasToAutomaton(nodes, edges);
  const minResult = minimizeDFA(automaton);

  function handleLoadMinimalDfa() {
    if (minResult.minimizedNodes.length > 0) {
      setNodes(minResult.minimizedNodes);
      setEdges(minResult.minimizedEdges);
      setOutputTab("automata-sim");
    }
  }

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lv-border-soft pb-3">
        <div>
          <h3 className="text-sm font-bold text-lv-text flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-lv-purple" /> DFA Minimization (Partition Refinement Algorithm)
          </h3>
          <p className="text-[11px] text-lv-faint mt-0.5">{minResult.explanation}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-[11px]">
            <div className="text-lv-faint">State Count Reduction:</div>
            <div className="font-bold text-lv-purple">
              {minResult.originalStateCount} states → {minResult.minimizedStateCount} minimal states
            </div>
          </div>

          <button
            type="button"
            onClick={handleLoadMinimalDfa}
            className="flex items-center gap-1.5 rounded-xl bg-lv-purple px-3 py-1.5 font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <Download className="h-3.5 w-3.5" />
            Load Minimal DFA to Canvas
          </button>
        </div>
      </div>

      {/* Partition Steps Trace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-lv-border bg-lv-surface/60 p-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-lv-purple flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Equivalence Partitioning Steps (k-equivalence)
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto lv-scrollbar pr-1">
            {minResult.partitionSteps.map((step) => (
              <div key={step.stepNumber} className="rounded-xl border border-lv-border-soft bg-lv-panel/80 p-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-lv-purple">
                  <span>Step {step.stepNumber} Partition</span>
                  <span className="text-lv-faint">{step.partitions.length} groups</span>
                </div>
                <div className="text-xs font-mono font-bold text-lv-cyan">
                  {step.partitions.map((p) => `{ ${p.join(", ")} }`).join("  ||  ")}
                </div>
                <p className="text-[11px] text-lv-faint">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Distinguishability Matrix */}
        <div className="rounded-2xl border border-lv-border bg-lv-surface/60 p-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-lv-cyan">
            State Distinguishability Matrix Table
          </div>

          <div className="overflow-x-auto lv-scrollbar">
            <table className="w-full text-center text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-lv-border text-lv-faint bg-lv-panel/80">
                  <th className="p-2 text-left">State</th>
                  {automaton.states.map((s) => (
                    <th key={s.id} className="p-2 font-bold text-lv-cyan">
                      {s.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {automaton.states.map((s1) => (
                  <tr key={s1.id} className="border-b border-lv-border-soft hover:bg-lv-panel/40">
                    <td className="p-2 font-bold text-left text-lv-text">{s1.label}</td>
                    {automaton.states.map((s2) => {
                      const isDist = minResult.distinguishabilityMatrix[s1.label]?.[s2.label];
                      return (
                        <td
                          key={s2.id}
                          className={`p-2 font-bold ${
                            s1.id === s2.id
                              ? "text-lv-faint"
                              : isDist
                              ? "text-lv-error bg-lv-error/10"
                              : "text-lv-success bg-lv-success/10"
                          }`}
                        >
                          {s1.id === s2.id ? "—" : isDist ? "X" : "≡"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-lv-faint flex items-center justify-between border-t border-lv-border-soft pt-2">
            <span><strong className="text-lv-error">X</strong> = Distinguishable</span>
            <span><strong className="text-lv-success">≡</strong> = Equivalent (Merged)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
