"use client";

import { useState, useMemo } from "react";
import {
  Grid3X3,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Layers,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  evaluateRelationProperties,
  buildRelationMatrix,
  RELATION_PRESETS,
} from "@/lib/algorithms/relations";

export function RelationMatrixView() {
  const [activePresetIdx, setActivePresetIdx] = useState<number>(0);
  const [elements, setElements] = useState<string[]>(RELATION_PRESETS[0].elements);
  const [pairs, setPairs] = useState<[string, string][]>(RELATION_PRESETS[0].pairs);

  function loadPreset(idx: number) {
    setActivePresetIdx(idx);
    const p = RELATION_PRESETS[idx];
    setElements([...p.elements]);
    setPairs([...p.pairs]);
  }

  function togglePair(a: string, b: string) {
    const exists = pairs.some(([x, y]) => x === a && y === b);
    if (exists) {
      setPairs(pairs.filter(([x, y]) => !(x === a && y === b)));
    } else {
      setPairs([...pairs, [a, b]]);
    }
  }

  const matrix = useMemo(() => buildRelationMatrix(elements, pairs), [elements, pairs]);
  const props = useMemo(() => evaluateRelationProperties(elements, pairs), [elements, pairs]);

  return (
    <div className="flex h-full flex-col space-y-4 overflow-y-auto p-4 lv-scrollbar text-lv-text">
      {/* Top Header & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lv-border-soft pb-3">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-4 w-4 text-lv-purple" />
          <h3 className="text-sm font-bold text-lv-text">
            Relation Adjacency Matrix & Property Verifier
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activePresetIdx}
            onChange={(e) => loadPreset(Number(e.target.value))}
            className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted font-mono"
          >
            {RELATION_PRESETS.map((p, idx) => (
              <option key={idx} value={idx}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => loadPreset(activePresetIdx)}
            className="flex items-center gap-1 rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted hover:text-lv-text font-mono"
            title="Reset to preset defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive 0/1 Matrix */}
        <div className="lg:col-span-6 space-y-3">
          <div className="rounded-2xl border border-lv-border bg-lv-panel/70 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-lv-faint">
              <span>Click cells to toggle (a, b) ∈ R</span>
              <span className="text-lv-purple font-bold">|R| = {pairs.length} pairs</span>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto py-2">
              <table className="border-collapse font-mono text-xs mx-auto select-none">
                <thead>
                  <tr>
                    <th className="p-2 text-lv-faint text-right font-bold w-10">R</th>
                    {elements.map((e) => (
                      <th key={e} className="p-2 text-center text-lv-cyan font-bold w-9">
                        {e}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {elements.map((rowElem, i) => (
                    <tr key={rowElem}>
                      <td className="p-2 text-right text-lv-cyan font-bold">{rowElem}</td>
                      {elements.map((colElem, j) => {
                        const isSet = matrix[i][j];
                        const isDiagonal = i === j;

                        return (
                          <td key={colElem} className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => togglePair(rowElem, colElem)}
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-xs font-bold transition-all",
                                isSet
                                  ? "bg-lv-purple/30 border-lv-purple text-lv-purple shadow-xs scale-105"
                                  : "bg-lv-surface/30 border-lv-border-soft/40 text-lv-faint hover:border-lv-border",
                                isDiagonal && "ring-1 ring-lv-cyan/30"
                              )}
                              title={`Toggle (${rowElem}, ${colElem})`}
                            >
                              {isSet ? "1" : "0"}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Active Pairs Roster */}
            <div className="rounded-xl border border-lv-border-soft bg-lv-surface/50 p-2.5 text-xs font-mono text-lv-muted space-y-1">
              <div className="text-[10px] uppercase text-lv-faint font-semibold">Roster Representation:</div>
              <div className="text-lv-text break-words max-h-16 overflow-y-auto lv-scrollbar text-[11px]">
                R = {"{"} {pairs.map(([a, b]) => `(${a}, ${b})`).join(", ")} {"}"}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mathematical Classification & Proof Checks */}
        <div className="lg:col-span-6 space-y-4">
          {/* Classification Badges */}
          <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-4 shadow-xl space-y-3">
            <div className="text-xs font-mono font-bold text-lv-text uppercase tracking-wider flex items-center justify-between">
              <span>Relation Classification</span>
              {props.isEquivalence && (
                <span className="rounded-full bg-lv-success/20 border border-lv-success/40 px-2.5 py-0.5 text-lv-success font-bold text-[10px]">
                  EQUIVALENCE RELATION
                </span>
              )}
              {props.isPartialOrder && (
                <span className="rounded-full bg-lv-purple/20 border border-lv-purple/40 px-2.5 py-0.5 text-lv-purple font-bold text-[10px]">
                  PARTIAL ORDER (POSET)
                </span>
              )}
            </div>

            {/* Property Row Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {/* Reflexive */}
              <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Reflexive</span>
                  {props.isReflexive ? (
                    <CheckCircle2 className="h-4 w-4 text-lv-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-lv-error" />
                  )}
                </div>
                <div className="text-[11px] text-lv-faint">
                  {props.isReflexive
                    ? "∀a ∈ A: (a, a) ∈ R"
                    : `Missing: ${props.reflexiveMissing.map((x) => `(${x},${x})`).slice(0, 3).join(", ")}`}
                </div>
              </div>

              {/* Symmetric */}
              <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Symmetric</span>
                  {props.isSymmetric ? (
                    <CheckCircle2 className="h-4 w-4 text-lv-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-lv-error" />
                  )}
                </div>
                <div className="text-[11px] text-lv-faint">
                  {props.isSymmetric
                    ? "(a, b) ∈ R ⇒ (b, a) ∈ R"
                    : `Missing: ${props.symmetricMissing.map(([x, y]) => `(${x},${y})`).slice(0, 2).join(", ")}`}
                </div>
              </div>

              {/* Anti-symmetric */}
              <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Anti-Symmetric</span>
                  {props.isAntiSymmetric ? (
                    <CheckCircle2 className="h-4 w-4 text-lv-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-lv-error" />
                  )}
                </div>
                <div className="text-[11px] text-lv-faint">
                  {props.isAntiSymmetric
                    ? "(a, b) ∧ (b, a) ⇒ a = b"
                    : `Cycles: ${props.antiSymmetricViolations.map(([x, y]) => `(${x},${y})`).slice(0, 2).join(", ")}`}
                </div>
              </div>

              {/* Transitive */}
              <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Transitive</span>
                  {props.isTransitive ? (
                    <CheckCircle2 className="h-4 w-4 text-lv-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-lv-error" />
                  )}
                </div>
                <div className="text-[11px] text-lv-faint">
                  {props.isTransitive
                    ? "(a, b) ∧ (b, c) ⇒ (a, c)"
                    : props.transitiveViolations.length > 0
                    ? `Fails on (${props.transitiveViolations[0].a},${props.transitiveViolations[0].b}) ∧ (${props.transitiveViolations[0].b},${props.transitiveViolations[0].c})`
                    : "Not transitive"}
                </div>
              </div>
            </div>

            {/* Equivalence Classes if Equivalence */}
            {props.isEquivalence && (
              <div className="rounded-xl border border-lv-success/30 bg-lv-success/10 p-3 space-y-2 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-lv-success uppercase">
                  <Layers className="h-4 w-4" />
                  Quotient Set Partitions (A / R)
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {props.equivalenceClasses.map((c, i) => (
                    <span
                      key={i}
                      className="rounded-lg border border-lv-success/40 bg-lv-success/20 px-2.5 py-1 text-lv-text"
                    >
                      [{c.rep}] = {"{"} {c.members.join(", ")} {"}"}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
