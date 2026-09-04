"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, CheckCircle2, XCircle, FileSpreadsheet } from "lucide-react";
import type { TruthTable } from "@/lib/algorithms/propositional-logic";
import { cn } from "@/lib/utils";

interface TruthTableViewProps {
  truthTable: TruthTable | null;
  activeAssignments?: Record<string, boolean>;
}

export function TruthTableView({ truthTable, activeAssignments = {} }: TruthTableViewProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!truthTable || truthTable.rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-lv-muted space-y-2">
        <FileSpreadsheet className="h-8 w-8 text-lv-faint" />
        <p className="text-sm">No proposition connected yet.</p>
        <p className="text-xs text-lv-faint">
          Connect variables into logic gates and attach a Result Probe to generate the full Truth Table.
        </p>
      </div>
    );
  }

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const {
    variables,
    subexpressionHeaders,
    rows,
    isTautology,
    isContradiction,
    isContingent,
    dnf,
    cnf,
    markdownTable,
  } = truthTable;

  return (
    <div className="space-y-4">
      {/* Classification Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lv-border-soft pb-3">
        <div className="flex items-center gap-2">
          {isTautology && (
            <span className="flex items-center gap-1.5 rounded-full bg-lv-success/15 border border-lv-success/30 px-3 py-1 font-mono text-xs font-bold text-lv-success">
              <CheckCircle2 className="h-4 w-4" />
              TAUTOLOGY (Valid under all interpretations)
            </span>
          )}
          {isContradiction && (
            <span className="flex items-center gap-1.5 rounded-full bg-lv-error/15 border border-lv-error/30 px-3 py-1 font-mono text-xs font-bold text-lv-error">
              <XCircle className="h-4 w-4" />
              CONTRADICTION (Unsatisfiable)
            </span>
          )}
          {isContingent && (
            <span className="flex items-center gap-1.5 rounded-full bg-lv-cyan/15 border border-lv-cyan/30 px-3 py-1 font-mono text-xs font-bold text-lv-cyan">
              <Sparkles className="h-4 w-4" />
              CONTINGENCY (Satisfiable & Falsifiable)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => copy(markdownTable, "md-table")}
            className="flex items-center gap-1 rounded-lg bg-lv-surface px-2.5 py-1 font-mono text-xs text-lv-muted hover:text-lv-text border border-lv-border transition-colors"
          >
            {copied === "md-table" ? <Check className="h-3.5 w-3.5 text-lv-success" /> : <Copy className="h-3.5 w-3.5" />}
            Copy Table
          </button>
        </div>
      </div>

      {/* Truth Table */}
      <div className="overflow-x-auto rounded-xl border border-lv-border bg-lv-surface/40">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-lv-border bg-lv-panel/80">
              {variables.map((v) => (
                <th key={v} className="px-3.5 py-2.5 font-bold text-lv-cyan border-r border-lv-border-soft">
                  {v}
                </th>
              ))}
              {subexpressionHeaders.map((h, i) => {
                const isFinal = i === subexpressionHeaders.length - 1;
                return (
                  <th
                    key={h}
                    className={cn(
                      "px-3.5 py-2.5 font-semibold",
                      isFinal ? "text-lv-text bg-lv-surface/60 font-bold" : "text-lv-muted border-r border-lv-border-soft"
                    )}
                  >
                    {h}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              // Highlight if this row matches current canvas variable toggles
              const isCurrent = variables.every(
                (v) => activeAssignments[v] === undefined || activeAssignments[v] === r.assignment[v]
              );

              return (
                <tr
                  key={idx}
                  className={cn(
                    "border-b border-lv-border-soft/60 transition-colors",
                    isCurrent ? "bg-lv-cyan/10" : idx % 2 === 0 ? "bg-transparent" : "bg-lv-panel/30",
                    "hover:bg-lv-surface/60"
                  )}
                >
                  {variables.map((v) => (
                    <td key={v} className="px-3.5 py-2 border-r border-lv-border-soft">
                      <TruthBadge value={r.assignment[v]} />
                    </td>
                  ))}
                  {subexpressionHeaders.map((h, i) => {
                    const isFinal = i === subexpressionHeaders.length - 1;
                    return (
                      <td
                        key={h}
                        className={cn(
                          "px-3.5 py-2",
                          isFinal ? "bg-lv-surface/40 font-bold" : "border-r border-lv-border-soft"
                        )}
                      >
                        <TruthBadge value={r.subexpressions[h]} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Canonical Normal Forms (DNF / CNF) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-3 space-y-1">
          <div className="text-[10px] uppercase tracking-wider font-mono text-lv-cyan font-semibold">
            Disjunctive Normal Form (DNF / Minterms)
          </div>
          <div className="font-mono text-xs text-lv-text break-words select-all">
            {dnf}
          </div>
        </div>

        <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-3 space-y-1">
          <div className="text-[10px] uppercase tracking-wider font-mono text-lv-purple font-semibold">
            Conjunctive Normal Form (CNF / Maxterms)
          </div>
          <div className="font-mono text-xs text-lv-text break-words select-all">
            {cnf}
          </div>
        </div>
      </div>
    </div>
  );
}

function TruthBadge({ value }: { value: boolean | undefined }) {
  if (value === undefined) return <span className="text-lv-faint">-</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center h-5 w-5 rounded font-mono text-[11px] font-bold shadow-xs",
        value
          ? "bg-lv-success/20 text-lv-success border border-lv-success/40"
          : "bg-lv-error/20 text-lv-error border border-lv-error/40"
      )}
    >
      {value ? "T" : "F"}
    </span>
  );
}
