"use client";

import { useWorkspaceStore } from "@/store/workspace-store";
import { runCykParser } from "@/lib/algorithms/cfg";
import { Table, CheckCircle2, AlertCircle } from "lucide-react";

export function CfgCykView() {
  const cfgRawRules = useWorkspaceStore((s) => s.cfgRawRules);
  const cfgInputString = useWorkspaceStore((s) => s.cfgInputString);

  const cyk = runCykParser(cfgRawRules, cfgInputString);

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-lv-border-soft pb-2">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-sm text-lv-text uppercase tracking-wider">
            CYK Parsing Dynamic Programming Table
          </span>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
            cyk.isAccepted
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
          }`}
        >
          {cyk.isAccepted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {cyk.isAccepted ? "ACCEPT (w ∈ L(G))" : "REJECT (w ∉ L(G))"}
        </span>
      </div>

      <div className="text-xs text-lv-muted">
        Input Tokens w = [ {cyk.tokens.map((t) => `'${t}'`).join(", ")} ] (length n = {cyk.tokens.length})
      </div>

      {/* Triangular DP Table Grid */}
      {cyk.tokens.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-lv-border bg-lv-panel p-3">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="border-b border-lv-border text-lv-faint">
                <th className="p-2 text-left">Length (row)</th>
                {cyk.tokens.map((t, idx) => (
                  <th key={idx} className="p-2 font-bold text-lv-cyan">
                    w[{idx + 1}] = '{t}'
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lv-border-soft">
              {cyk.table.slice().reverse().map((row, rIdx) => {
                const len = cyk.tokens.length - rIdx;
                return (
                  <tr key={rIdx} className="hover:bg-lv-surface/40">
                    <td className="p-2 font-bold text-lv-faint text-left">l = {len}</td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2 font-mono">
                        <span
                          className={`inline-block rounded-lg px-2.5 py-1 text-xs font-bold border ${
                            cell.variables.length > 0
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-lv-surface text-lv-faint border-lv-border"
                          }`}
                        >
                          {cell.variables.length > 0 ? `{ ${cell.variables.join(", ")} }` : "∅"}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Execution Trace */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-lv-faint uppercase tracking-wider block">
          CYK DP Matrix Calculation Trace
        </span>
        <div className="space-y-1 max-h-48 overflow-y-auto lv-scrollbar rounded-xl border border-lv-border bg-lv-panel p-2.5">
          {cyk.executionSteps.map((step, idx) => (
            <div key={idx} className="text-[11px] text-lv-muted">
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
