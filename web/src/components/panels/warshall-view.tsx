"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sparkles,
  Route,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { computeWarshall, RELATION_PRESETS } from "@/lib/algorithms/relations";
import { useWorkspaceStore } from "@/store/workspace-store";

const WARSHALL_PRESETS = [
  {
    name: "Directed Path: 1 → 2 → 3 → 4",
    elements: ["1", "2", "3", "4"],
    pairs: [["1", "2"], ["2", "3"], ["3", "4"]] as [string, string][],
  },
  {
    name: "Two Components: {1→2, 3→4}",
    elements: ["1", "2", "3", "4"],
    pairs: [["1", "2"], ["3", "4"]] as [string, string][],
  },
  {
    name: "Cycle: 1 → 2 → 3 → 1",
    elements: ["1", "2", "3"],
    pairs: [["1", "2"], ["2", "3"], ["3", "1"]] as [string, string][],
  },
];

export function WarshallView() {
  const storeElements = useWorkspaceStore((s) => s.relationsElements);
  const storePairs = useWorkspaceStore((s) => s.relationsPairs);

  const [activePresetIdx, setActivePresetIdx] = useState<number>(0);
  const [elements, setElements] = useState<string[]>(WARSHALL_PRESETS[0].elements);
  const [pairs, setPairs] = useState<[string, string][]>(WARSHALL_PRESETS[0].pairs);

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Custom Graph Input State
  const [customMode, setCustomMode] = useState<boolean>(false);
  const [customVertices, setCustomVertices] = useState<string>(elements.join(", "));
  const [customEdges, setCustomEdges] = useState<string>(
    pairs.map(([a, b]) => `(${a}, ${b})`).join(", ")
  );

  function loadPreset(idx: number) {
    setActivePresetIdx(idx);
    const p = WARSHALL_PRESETS[idx];
    if (!p) return;
    setElements([...p.elements]);
    setPairs([...p.pairs]);
    setCustomVertices(p.elements.join(", "));
    setCustomEdges(p.pairs.map(([a, b]) => `(${a}, ${b})`).join(", "));
    setStepIndex(0);
    setIsPlaying(false);
  }

  function handleImportFromMatrix() {
    setElements([...storeElements]);
    setPairs([...storePairs]);
    setCustomVertices(storeElements.join(", "));
    setCustomEdges(storePairs.map(([a, b]) => `(${a}, ${b})`).join(", "));
    setStepIndex(0);
    setIsPlaying(false);
  }

  function handleApplyCustomGraph() {
    const rawV = customVertices
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const uniqueV = Array.from(new Set(rawV));
    if (uniqueV.length === 0) return;

    const regex = /\(?\s*([a-zA-Z0-9_]+)\s*[,:\-]\s*([a-zA-Z0-9_]+)\s*\)?/g;
    const matches: [string, string][] = [];
    let match;
    while ((match = regex.exec(customEdges)) !== null) {
      const a = match[1];
      const b = match[2];
      if (uniqueV.includes(a) && uniqueV.includes(b)) {
        if (!matches.some(([x, y]) => x === a && y === b)) {
          matches.push([a, b]);
        }
      }
    }

    setElements(uniqueV);
    setPairs(matches);
    setStepIndex(0);
    setIsPlaying(false);
    setCustomMode(false);
  }

  const steps = useMemo(() => computeWarshall(elements, pairs), [elements, pairs]);
  const currentStep = steps[stepIndex] || steps[0];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  return (
    <div className="flex h-full flex-col space-y-4 overflow-y-auto p-4 lv-scrollbar text-lv-text">
      {/* Header & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lv-border-soft pb-3">
        <div className="flex items-center gap-2">
          <Route className="h-4 w-4 text-lv-purple" />
          <h3 className="text-sm font-bold text-lv-text">
            Warshall&apos;s Algorithm: Transitive Closure Simulator
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleImportFromMatrix}
            className="rounded-lg border border-lv-purple/40 bg-lv-purple/10 px-2.5 py-1 text-xs font-mono text-lv-purple hover:bg-lv-purple/20 transition-colors"
            title="Import current elements & pairs from Relation Matrix tab"
          >
            ← Sync from Matrix
          </button>

          <select
            value={activePresetIdx}
            onChange={(e) => loadPreset(Number(e.target.value))}
            className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted font-mono focus:border-lv-purple focus:outline-hidden"
          >
            {WARSHALL_PRESETS.map((p, idx) => (
              <option key={idx} value={idx}>
                Preset: {p.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setCustomMode(!customMode)}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors",
              customMode
                ? "border-lv-purple bg-lv-purple/20 text-lv-purple font-bold"
                : "border-lv-border bg-lv-surface text-lv-muted hover:text-lv-text"
            )}
          >
            {customMode ? "Close Input" : "Custom Graph"}
          </button>
        </div>
      </div>

      {/* Custom Graph Entry Modal / Drawer */}
      {customMode && (
        <div className="rounded-2xl border border-lv-purple/30 bg-lv-purple/5 p-4 space-y-3">
          <div className="text-xs font-mono font-bold text-lv-purple flex items-center justify-between">
            <span>Input Custom Vertices & Directed Edges</span>
            <span className="text-[11px] text-lv-faint">Computes transitive closure R⁺ step-by-step</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-lv-faint">Vertices V:</label>
              <input
                type="text"
                value={customVertices}
                onChange={(e) => setCustomVertices(e.target.value)}
                placeholder="1, 2, 3, 4"
                className="w-full rounded-xl border border-lv-border bg-lv-panel px-3 py-1.5 text-xs font-mono text-lv-text focus:border-lv-purple focus:outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-lv-faint">Directed Edges E:</label>
              <input
                type="text"
                value={customEdges}
                onChange={(e) => setCustomEdges(e.target.value)}
                placeholder="(1, 2), (2, 3), (3, 4)"
                className="w-full rounded-xl border border-lv-border bg-lv-panel px-3 py-1.5 text-xs font-mono text-lv-text focus:border-lv-purple focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyCustomGraph}
            className="rounded-xl border border-lv-purple/40 bg-lv-purple/20 px-4 py-1.5 text-xs font-mono font-bold text-lv-purple hover:bg-lv-purple/30 transition-colors"
          >
            Apply & Trace Warshall Closures
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Matrix Display */}
        <div className="lg:col-span-7 space-y-3">
          <div className="rounded-2xl border border-lv-border bg-lv-panel/70 p-4 shadow-xl space-y-3">
            {/* Scrubber Controls */}
            <div className="flex items-center justify-between border-b border-lv-border-soft pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStepIndex(0);
                    setIsPlaying(false);
                  }}
                  className="rounded p-1 text-lv-faint hover:bg-lv-surface hover:text-lv-text transition-colors"
                  title="Reset to W₀"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
                  disabled={stepIndex === 0}
                  className="rounded p-1 text-lv-faint hover:bg-lv-surface hover:text-lv-text disabled:opacity-30 transition-colors"
                >
                  <SkipBack className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 rounded-lg bg-lv-purple/20 text-lv-purple px-3 py-1 text-xs font-semibold hover:bg-lv-purple/30 transition-colors"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {isPlaying ? "Pause" : "Play Stepper"}
                </button>
                <button
                  type="button"
                  onClick={() => setStepIndex((s) => Math.min(steps.length - 1, s + 1))}
                  disabled={stepIndex === steps.length - 1}
                  className="rounded p-1 text-lv-faint hover:bg-lv-surface hover:text-lv-text disabled:opacity-30 transition-colors"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </button>
              </div>

              <span className="font-mono text-xs font-bold text-lv-cyan">
                Matrix W_{stepIndex} of W_{steps.length - 1}
              </span>
            </div>

            {/* Matrix View */}
            <div className="overflow-x-auto py-2">
              <table className="border-collapse font-mono text-xs mx-auto select-none">
                <thead>
                  <tr>
                    <th className="p-2 text-lv-faint text-right font-bold w-10">W_{stepIndex}</th>
                    {elements.map((e) => {
                      const isPivotCol = currentStep.pivotElement === e;
                      return (
                        <th
                          key={e}
                          className={cn(
                            "p-2 text-center font-bold min-w-9 transition-colors",
                            isPivotCol ? "text-lv-cyan bg-lv-cyan/15 rounded-t-lg" : "text-lv-faint"
                          )}
                        >
                          {e}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {elements.map((rowElem, i) => {
                    const isPivotRow = currentStep.pivotElement === rowElem;
                    return (
                      <tr key={rowElem}>
                        <td
                          className={cn(
                            "p-2 text-right font-bold transition-colors",
                            isPivotRow ? "text-lv-cyan bg-lv-cyan/15 rounded-l-lg" : "text-lv-faint"
                          )}
                        >
                          {rowElem}
                        </td>
                        {elements.map((colElem, j) => {
                          const val = currentStep.matrix[i]?.[j] ?? false;
                          const isPivotCol = currentStep.pivotElement === colElem;
                          const isPivotCell = isPivotRow && isPivotCol;
                          const isNew = currentStep.newPairs.some(
                            ([x, y]) => x === rowElem && y === colElem
                          );

                          return (
                            <td
                              key={colElem}
                              className={cn(
                                "p-1 text-center transition-colors",
                                isPivotRow && isPivotCol
                                  ? "bg-lv-cyan/25"
                                  : isPivotRow || isPivotCol
                                  ? "bg-lv-cyan/5"
                                  : ""
                              )}
                            >
                              <div
                                className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-xs font-bold transition-all mx-auto",
                                  isNew
                                    ? "bg-lv-success/30 border-lv-success text-lv-success scale-105 shadow-md animate-pulse"
                                    : val
                                    ? "bg-lv-purple/20 border-lv-purple text-lv-purple"
                                    : "bg-lv-surface/30 border-lv-border-soft/40 text-lv-faint",
                                  isPivotCell && "ring-2 ring-lv-cyan"
                                )}
                              >
                                {val ? "1" : "0"}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-lv-faint border-t border-lv-border-soft pt-2">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-lv-cyan"></span> Active Pivot k = {currentStep.pivotElement ?? "None (W₀)"}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-lv-success"></span> Newly added path
              </span>
            </div>
          </div>
        </div>

        {/* Right Step Analysis & Math Explanation */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-4 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-lv-text uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-lv-purple" />
              <span>Step {stepIndex} Mathematical Rationale</span>
            </div>

            <p className="text-xs font-mono leading-relaxed text-lv-muted bg-lv-panel/70 p-3 rounded-xl border border-lv-border">
              {currentStep.explanation}
            </p>

            {currentStep.newPairs.length > 0 ? (
              <div className="rounded-xl border border-lv-success/30 bg-lv-success/10 p-3 space-y-1.5 font-mono text-xs">
                <div className="flex items-center gap-1 text-lv-success font-bold text-[11px] uppercase">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  New Paths Added in W_{stepIndex}:
                </div>
                <div className="text-lv-text">
                  {currentStep.newPairs.map(([a, b]) => `(${a} → ${b})`).join(", ")}
                </div>
              </div>
            ) : (
              <div className="text-[11px] font-mono text-lv-faint bg-lv-panel/30 p-2.5 rounded-xl border border-lv-border-soft">
                No new paths discovered using pivot {currentStep.pivotElement ?? "N/A"}. Matrix unchanged.
              </div>
            )}
          </div>

          {/* Warshall Recurrence Card */}
          <div className="rounded-2xl border border-lv-border bg-lv-surface/50 p-4 space-y-2 text-xs font-mono">
            <div className="text-[11px] font-bold text-lv-text uppercase tracking-wider">
              Dynamic Programming Recurrence:
            </div>
            <div className="rounded-xl bg-lv-panel p-2.5 border border-lv-border-soft text-lv-cyan text-[11px]">
              W^(k)[i, j] = W^(k-1)[i, j] ∨ (W^(k-1)[i, k] ∧ W^(k-1)[k, j])
            </div>
            <p className="text-[11px] text-lv-faint leading-relaxed">
              Path exists from i to j through intermediate vertices in {"{"}v₁ ... vₖ{"}"} if a direct path already existed or there is a path from i to vₖ AND from vₖ to j.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
