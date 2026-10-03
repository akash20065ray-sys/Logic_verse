"use client";

import { useWorkspaceStore } from "@/store/workspace-store";
import { convertGrammarToCNF } from "@/lib/algorithms/cfg";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export function CfgCnfView() {
  const cfgRawRules = useWorkspaceStore((s) => s.cfgRawRules);
  const steps = convertGrammarToCNF(cfgRawRules);

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-lv-border-soft pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-sm text-lv-text uppercase tracking-wider">
            Chomsky Normal Form (CNF) Reduction Steps
          </span>
        </div>
        <span className="rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2.5 py-0.5 text-xs font-bold">
          CNF: A ➔ BC or A ➔ a
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => (
          <div key={idx} className="rounded-xl border border-lv-border bg-lv-panel p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                {step.stepName}
              </span>
              <span className="rounded bg-lv-surface px-2 py-0.5 text-[10px] text-lv-faint border border-lv-border">
                {step.rules.length} rules
              </span>
            </div>
            <p className="text-xs text-lv-muted">{step.description}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {step.rules.map((r, rIdx) => (
                <span key={rIdx} className="rounded-lg bg-lv-surface/80 border border-lv-border px-2.5 py-1 text-xs font-bold text-purple-300">
                  {r}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
