"use client";

import { useWorkspaceStore } from "@/store/workspace-store";
import { parseGrammarText, runCykParser } from "@/lib/algorithms/cfg";
import { GitBranch, CheckCircle2, AlertCircle, Code2 } from "lucide-react";

export function CfgParseTreeView() {
  const cfgRawRules = useWorkspaceStore((s) => s.cfgRawRules);
  const cfgInputString = useWorkspaceStore((s) => s.cfgInputString);

  const grammar = parseGrammarText(cfgRawRules);
  const cykRes = runCykParser(cfgRawRules, cfgInputString);

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-lv-border-soft pb-2">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-sm text-lv-text uppercase tracking-wider">
            Context-Free Grammar Parse Tree & Derivation Inspector
          </span>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
            cykRes.isAccepted
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
          }`}
        >
          {cykRes.isAccepted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {cykRes.isAccepted ? "STRING DERIVABLE w ∈ L(G)" : "STRING NOT DERIVABLE w ∉ L(G)"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5 rounded-xl border border-lv-border bg-lv-surface/70 p-3">
          <span className="text-[11px] font-bold text-lv-faint uppercase">Parsed Grammar Summary:</span>
          <div className="text-xs font-bold text-purple-300">
            Start Symbol: {grammar.startSymbol} | Variables: {"{"} {grammar.variables.join(", ")} {"}"}
          </div>
          <div className="text-[11px] text-lv-muted">
            Terminals: {"{"} {grammar.terminals.join(", ")} {"}"}
          </div>
        </div>

        <div className="space-y-1.5 rounded-xl border border-lv-border bg-lv-surface/70 p-3">
          <span className="text-[11px] font-bold text-lv-faint uppercase">Target String w:</span>
          <div className="text-sm font-bold text-lv-cyan font-mono">
            "{cfgInputString}" (length {cfgInputString.length})
          </div>
        </div>
      </div>

      {/* Production Rules List */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-lv-faint uppercase tracking-wider block">
          Active Production Rules R ({grammar.rules.length} Rules)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {grammar.rules.map((r, idx) => (
            <div key={idx} className="rounded-xl border border-lv-border bg-lv-panel p-2 text-xs font-bold text-purple-300">
              {r.head} ➔ {r.rawBody}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
