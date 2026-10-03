"use client";

import { parseCanvasToAutomaton, convertNfaToDfa } from "@/lib/algorithms/automata";
import { useWorkspaceStore } from "@/store/workspace-store";
import { GitBranch, ArrowRight, Download, CheckCircle2 } from "lucide-react";

export function NfaToDfaView() {
  const nodes = useWorkspaceStore((s) => s.nodes);
  const edges = useWorkspaceStore((s) => s.edges);
  const setNodes = useWorkspaceStore((s) => s.setNodes);
  const setEdges = useWorkspaceStore((s) => s.setEdges);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);

  const automaton = parseCanvasToAutomaton(nodes, edges);
  const result = convertNfaToDfa(automaton);

  function handleLoadDfaToCanvas() {
    if (result.convertedDfaNodes.length > 0) {
      setNodes(result.convertedDfaNodes);
      setEdges(result.convertedDfaEdges);
      setOutputTab("automata-sim");
    }
  }

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lv-border-soft pb-3">
        <div>
          <h3 className="text-sm font-bold text-lv-text flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-lv-cyan" /> NFA → DFA Subset Construction (Powerset Algorithm)
          </h3>
          <p className="text-[11px] text-lv-faint mt-0.5">{result.explanation}</p>
        </div>

        <button
          type="button"
          onClick={handleLoadDfaToCanvas}
          className="flex items-center gap-1.5 rounded-xl bg-lv-cyan px-3 py-1.5 font-semibold text-lv-bg hover:opacity-90 transition-opacity"
        >
          <Download className="h-3.5 w-3.5" />
          Load Converted DFA to Canvas
        </button>
      </div>

      {/* Subset Construction Step Table */}
      <div className="rounded-2xl border border-lv-border bg-lv-surface/60 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-lv-cyan">
          <span>Subset Construction Table (2^Q Powerset States)</span>
          <span className="text-[10px] bg-lv-cyan/20 text-lv-cyan px-2 py-0.5 rounded font-mono">
            Equivalent DFA Generated
          </span>
        </div>

        <div className="overflow-x-auto lv-scrollbar">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-lv-border text-lv-faint bg-lv-panel/80">
                <th className="p-2.5">DFA State</th>
                <th className="p-2.5">NFA Subset (ε-closure)</th>
                <th className="p-2.5">Properties</th>
                {automaton.alphabet.map((char) => (
                  <th key={char} className="p-2.5 font-bold text-lv-cyan">
                    δ_DFA(Q, '{char}')
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.steps.map((row) => (
                <tr key={row.dfaStateId} className="border-b border-lv-border-soft hover:bg-lv-panel/40">
                  <td className="p-2.5 font-bold text-lv-cyan">{row.dfaStateId}</td>
                  <td className="p-2.5 font-mono text-lv-text">
                    &#123; {row.nfaStateIds.join(", ") || "∅"} &#125;
                  </td>
                  <td className="p-2.5 text-[11px]">
                    {row.isStart && <span className="text-lv-cyan font-bold mr-2">Start</span>}
                    {row.isAccept && <span className="text-lv-purple font-bold">Accepting (F)</span>}
                    {!row.isStart && !row.isAccept && <span className="text-lv-faint">—</span>}
                  </td>
                  {automaton.alphabet.map((char) => (
                    <td key={char} className="p-2.5 font-mono text-lv-blue">
                      {row.transitions[char] || "∅"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equivalent DFA Graph Model Summary */}
      <div className="rounded-2xl border border-lv-cyan/30 bg-lv-panel p-4 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-lv-cyan flex items-center justify-between">
          <span>Equivalent Deterministic Finite Automaton (DFA)</span>
          <span className="text-[10px] text-lv-faint">{result.convertedDfaNodes.length} States, {result.convertedDfaEdges.length} Transitions</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {result.convertedDfaNodes.map((n) => (
            <div key={n.id} className="rounded-xl border border-lv-border-soft bg-lv-surface p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lv-cyan text-xs">{n.id}</span>
                <div className="flex gap-1 text-[10px]">
                  {Boolean(n.data?.isStart) && <span className="bg-lv-cyan/20 text-lv-cyan px-1.5 py-0.5 rounded font-bold">START</span>}
                  {Boolean(n.data?.isAccept) && <span className="bg-lv-purple/20 text-lv-purple px-1.5 py-0.5 rounded font-bold">ACCEPT</span>}
                </div>
              </div>
              <p className="text-[11px] text-lv-faint font-mono whitespace-pre-wrap">{(n.data?.label as string) || ""}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
