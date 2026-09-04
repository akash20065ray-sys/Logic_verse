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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { computeWarshall, RELATION_PRESETS } from "@/lib/algorithms/relations";

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
  const [activePresetIdx, setActivePresetIdx] = useState<number>(0);
  const [elements, setElements] = useState<string[]>(WARSHALL_PRESETS[0].elements);
  const [pairs, setPairs] = useState<[string, string][]>(WARSHALL_PRESETS[0].pairs);

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  function loadPreset(idx: number) {
    setActivePresetIdx(idx);
    setElements([...WARSHALL_PRESETS[idx].elements]);
    setPairs([...WARSHALL_PRESETS[idx].pairs]);
    setStepIndex(0);
    setIsPlaying(false);
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
            Warshall's Algorithm: Transitive Closure Simulator
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activePresetIdx}
            onChange={(e) => loadPreset(Number(e.target.value))}
            className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted font-mono"
          >
            {WARSHALL_PRESETS.map((p, idx) => (
              <option key={idx} value={idx}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

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
                  className="rounded p-1 text-lv-faint hover:bg-lv-surface hover:text-lv-text"
                  title="Reset to W₀"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
                  disabled={stepIndex === 0}
                  className="rounded p-1 text-lv-faint hover:bg-lv-surface hover:text-lv-text disabled:opacity-30"
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
                  className="rounded p-1 text-lv-faint hover:bg-lv-surface hover:text-lv-text disabled:opacity-30"
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
                    {elements.map((e, idx) => {
                      const isPivotCol = currentStep.pivotElement === e;
                      return (
                        <th
                          key={e}
                          className={cn(
                            "p-2 text-center font-bold w-9 transition-colors",
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
                          const val = currentStep.matrix[i][j];
                          const isNewlyAdded = currentStep.newPairs.some(
                            ([x, y]) => x === rowElem && y === colElem
                          );
                          const isPivotCross =
                            currentStep.pivotElement === rowElem || currentStep.pivotElement === colElem;

                          return (
                            <td
                              key={colElem}
                              className={cn(
                                "p-1 text-center transition-all",
                                isPivotCross && "bg-lv-cyan/5"
                              )}
                            >
                              <div
                                className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-xs font-bold transition-all mx-auto",
                                  isNewlyAdded
                                    ? "bg-lv-cyan/30 border-lv-cyan text-lv-cyan scale-110 shadow-md ring-2 ring-lv-cyan/50"
                                    : val
                                    ? "bg-lv-purple/20 border-lv-purple/60 text-lv-purple"
                                    : "bg-lv-surface/30 border-lv-border-soft/40 text-lv-faint opacity-40"
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
          </div>
        </div>

        {/* Right Step Explanation & Formula */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-4 shadow-xl space-y-3">
            <div className="text-xs font-mono font-bold text-lv-text uppercase tracking-wider flex items-center justify-between">
              <span>Step Analysis</span>
              {currentStep.pivotElement && (
                <span className="rounded bg-lv-cyan/20 px-2 py-0.5 text-lv-cyan font-bold text-[10px]">
                  Pivot: Vertex {currentStep.pivotElement}
                </span>
              )}
            </div>

            <div className="rounded-xl border border-lv-border-soft bg-lv-panel/70 p-3 space-y-2 text-xs font-mono">
              <div className="text-lv-cyan font-bold">
                Wₖ[i][j] = Wₖ₋₁[i][j] ∨ (Wₖ₋₁[i][k] ∧ Wₖ₋₁[k][j])
              </div>
              <p className="text-lv-text leading-relaxed">{currentStep.explanation}</p>
            </div>

            {currentStep.newPairs.length > 0 && (
              <div className="rounded-xl border border-lv-success/30 bg-lv-success/15 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-lv-success">
                  <Sparkles className="h-4 w-4" />
                  Newly Added Transitive Edges:
                </div>
                <div className="font-mono text-xs text-lv-text">
                  {currentStep.newPairs.map(([a, b]) => `(${a}, ${b})`).join(", ")}
                </div>
              </div>
            )}

            {stepIndex === steps.length - 1 && (
              <div className="rounded-xl border border-lv-purple/40 bg-lv-purple/10 p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-lv-purple">
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Transitive Closure R⁺ Computed
                </div>
                <p className="text-[11px] text-lv-muted font-mono leading-relaxed">
                  All indirect reachability paths across the digraph have been detected and solidified in $O(V^3)$ time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
