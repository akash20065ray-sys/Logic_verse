"use client";

import { useWorkspaceStore } from "@/store/workspace-store";
import { testRegexMatch, parseRegexToAST } from "@/lib/algorithms/regex";
import { CheckCircle2, AlertCircle, Code2, Play, Sparkles } from "lucide-react";

export function RegexView() {
  const regexPattern = useWorkspaceStore((s) => s.regexPattern);
  const regexTestString = useWorkspaceStore((s) => s.regexTestString);
  const setRegexPattern = useWorkspaceStore((s) => s.setRegexPattern);
  const setRegexTestString = useWorkspaceStore((s) => s.setRegexTestString);

  const matchTrace = testRegexMatch(regexPattern, regexTestString);
  const ast = parseRegexToAST(regexPattern);

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-lv-border-soft pb-2">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-lv-cyan" />
          <span className="font-bold text-sm text-lv-text uppercase tracking-wider">
            Regex String Matcher & AST Inspector
          </span>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
            matchTrace.isMatch
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
          }`}
        >
          {matchTrace.isMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {matchTrace.isMatch ? "MATCH ACCEPTED" : "MATCH REJECTED"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2 rounded-xl border border-lv-border bg-lv-surface/70 p-3">
          <span className="text-[11px] font-bold text-lv-faint uppercase">Active Pattern R:</span>
          <div className="text-sm font-bold text-lv-cyan">{regexPattern || "(empty)"}</div>
        </div>
        <div className="space-y-2 rounded-xl border border-lv-border bg-lv-surface/70 p-3">
          <span className="text-[11px] font-bold text-lv-faint uppercase">Input String w:</span>
          <div className="text-sm font-bold text-lv-text">{regexTestString || "ε (empty string)"}</div>
        </div>
      </div>

      {/* Step-by-Step Simulation Trace */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-lv-faint uppercase tracking-wider block">
          Simulation Execution Trace ({matchTrace.steps.length} Steps)
        </span>
        <div className="space-y-1.5">
          {matchTrace.steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-lv-border bg-lv-panel p-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-lv-cyan/20 font-bold text-lv-cyan text-[10px]">
                  {idx + 1}
                </span>
                <span className="text-lv-muted">Symbol '{step.char}'</span>
                <span className="text-lv-faint">➔ matched so far: <strong className="text-lv-cyan">"{step.matchedSoFar}"</strong></span>
              </div>
              <span className="text-[11px] text-lv-faint">{step.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AST Json Breakdown */}
      <div className="space-y-1.5 pt-2">
        <span className="text-xs font-bold text-lv-faint uppercase tracking-wider block">
          Abstract Syntax Tree (AST Structure)
        </span>
        <pre className="rounded-xl border border-lv-border bg-lv-panel p-3 text-[11px] font-mono text-lv-cyan overflow-x-auto max-h-48">
          {JSON.stringify(ast, null, 2)}
        </pre>
      </div>
    </div>
  );
}
