"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Shuffle,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  evaluateDiagonalization,
  DEFAULT_DECIMAL_ROWS,
  DEFAULT_BINARY_ROWS,
  generateCantorSnake,
} from "@/lib/algorithms/diagonalization";

export function DiagonalizationView() {
  const [tab, setTab] = useState<"diagonal" | "snake">("diagonal");
  const [diagMode, setDiagMode] = useState<"decimal" | "binary">("decimal");
  const [rows, setRows] = useState<number[][]>(DEFAULT_DECIMAL_ROWS);
  const [activeHoverCell, setActiveHoverCell] = useState<{ row: number; col: number } | null>(null);

  // Snake path state
  const [snakeStep, setSnakeStep] = useState<number>(5);
  const [isPlayingSnake, setIsPlayingSnake] = useState<boolean>(false);

  // Switch rows when mode changes
  function switchMode(newMode: "decimal" | "binary") {
    setDiagMode(newMode);
    setRows(newMode === "decimal" ? DEFAULT_DECIMAL_ROWS : DEFAULT_BINARY_ROWS);
    setActiveHoverCell(null);
  }

  function randomizeRows() {
    const size = 6;
    const newRows: number[][] = [];
    for (let r = 0; r < size; r++) {
      const row: number[] = [];
      for (let c = 0; c < size; c++) {
        row.push(diagMode === "binary" ? Math.round(Math.random()) : Math.floor(Math.random() * 10));
      }
      newRows.push(row);
    }
    setRows(newRows);
  }

  const diagState = useMemo(() => {
    return evaluateDiagonalization(rows, diagMode);
  }, [rows, diagMode]);

  const snakeData = useMemo(() => {
    return generateCantorSnake(5);
  }, []);

  return (
    <div className="flex h-full flex-col space-y-4 overflow-y-auto p-4 lv-scrollbar text-lv-text">
      {/* Top Header & Mode Select */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lv-border-soft pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("diagonal")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              tab === "diagonal"
                ? "bg-lv-cyan/20 text-lv-cyan border border-lv-cyan/40 shadow-xs"
                : "text-lv-muted hover:text-lv-text hover:bg-lv-surface"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Cantor's Diagonalization (Uncountability of ℝ)
          </button>
          <button
            type="button"
            onClick={() => setTab("snake")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              tab === "snake"
                ? "bg-lv-purple/20 text-lv-purple border border-lv-purple/40 shadow-xs"
                : "text-lv-muted hover:text-lv-text hover:bg-lv-surface"
            )}
          >
            <ArrowRight className="h-3.5 w-3.5" />
            Cantor's Snake Path (Countability of ℚ)
          </button>
        </div>

        {tab === "diagonal" && (
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-lv-border bg-lv-surface/60 p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => switchMode("decimal")}
                className={cn(
                  "rounded-md px-2.5 py-1 transition-colors",
                  diagMode === "decimal" ? "bg-lv-cyan/20 font-bold text-lv-cyan" : "text-lv-faint hover:text-lv-text"
                )}
              >
                Decimal (0.d₁d₂…)
              </button>
              <button
                type="button"
                onClick={() => switchMode("binary")}
                className={cn(
                  "rounded-md px-2.5 py-1 transition-colors",
                  diagMode === "binary" ? "bg-lv-cyan/20 font-bold text-lv-cyan" : "text-lv-faint hover:text-lv-text"
                )}
              >
                Binary Strings ({`{0,1}`}∞)
              </button>
            </div>
            <button
              type="button"
              onClick={randomizeRows}
              className="flex items-center gap-1.5 rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted hover:text-lv-text transition-colors"
            >
              <Shuffle className="h-3.5 w-3.5" />
              Randomize
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: CANTOR'S DIAGONALIZATION */}
      {tab === "diagonal" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left / Center Grid */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-lv-border bg-lv-panel/70 p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-lv-faint font-mono">
                <span>Hypothetical Countable Enumeration: List L = {`{ s₁, s₂, … }`}</span>
                <span className="text-lv-cyan">Glowing = Diagonal dᵢᵢ</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-lv-border-soft text-lv-faint">
                      <th className="py-2 px-3 text-left w-16">Index</th>
                      <th className="py-2 px-2 text-left w-10">0 .</th>
                      {diagState.rows[0]?.digits.map((_, colIdx) => (
                        <th key={colIdx} className="py-2 px-3 text-center">
                          d_{colIdx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {diagState.rows.map((r, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className={cn(
                          "border-b border-lv-border-soft/40 transition-colors",
                          activeHoverCell?.row === rowIdx ? "bg-lv-cyan/10" : "hover:bg-lv-surface/40"
                        )}
                      >
                        <td className="py-2 px-3 font-bold text-lv-purple">{r.label}</td>
                        <td className="py-2 px-2 text-lv-faint">0 .</td>
                        {r.digits.map((d, colIdx) => {
                          const isDiagonal = rowIdx === colIdx;
                          const isHovered =
                            activeHoverCell?.row === rowIdx && activeHoverCell?.col === colIdx;

                          return (
                            <td
                              key={colIdx}
                              onMouseEnter={() => setActiveHoverCell({ row: rowIdx, col: colIdx })}
                              onMouseLeave={() => setActiveHoverCell(null)}
                              className={cn(
                                "py-2 px-3 text-center transition-all cursor-pointer select-none",
                                isDiagonal
                                  ? "font-bold text-lv-cyan bg-lv-cyan/20 ring-1 ring-lv-cyan/60 rounded-md scale-105 shadow-sm"
                                  : "text-lv-muted",
                                isHovered && "ring-2 ring-white"
                              )}
                            >
                              {d}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Anti-Diagonal Construction Banner */}
            <div className="rounded-2xl border border-lv-cyan/40 bg-lv-cyan/10 p-4 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-lv-cyan uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  Constructed Anti-Diagonal Number (D)
                </div>
                <span className="text-[11px] font-mono text-lv-muted">
                  Rule: {diagMode === "binary" ? "flip 0 ↔ 1" : "if dᵢᵢ=4 then 5 else 4"}
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono text-lg font-bold">
                <span className="text-lv-faint">D = 0 .</span>
                <div className="flex items-center gap-2">
                  {diagState.antiDiagonal.map((d, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg border border-lv-cyan bg-lv-cyan/30 text-lv-cyan shadow-sm transition-transform hover:scale-110",
                        activeHoverCell?.col === idx && "ring-2 ring-white scale-110"
                      )}
                      title={`Differing from s${idx + 1} at position ${idx + 1} (orig: ${diagState.diagonal[idx]})`}
                    >
                      {d}
                    </span>
                  ))}
                  <span className="text-lv-faint">…</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Explanation & Mathematical Proof */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-4 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-lv-text uppercase tracking-wider">
                <AlertCircle className="h-4 w-4 text-lv-purple" />
                Cantor's Reductio Ad Absurdum Proof
              </div>

              <div className="text-xs text-lv-muted space-y-2 leading-relaxed">
                <p>
                  1. <strong>Assumption:</strong> Suppose the interval <span className="text-lv-cyan font-mono">(0, 1)</span> is countable. Then its elements can be listed as a sequence <span className="font-mono text-lv-purple">s₁, s₂, s₃, …</span>.
                </p>
                <p>
                  2. <strong>Construction:</strong> We define a new real number <span className="font-mono text-lv-cyan font-bold">D = 0.D₁D₂D₃…</span> such that each digit <span className="font-mono text-lv-cyan">Dᵢ ≠ dᵢᵢ</span> (differs from the i-th digit of sᵢ).
                </p>
                <p>
                  3. <strong>Contradiction:</strong> Can <span className="font-mono text-lv-cyan">D</span> be anywhere in the list?
                </p>
                <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-lv-faint">
                  {diagState.proofSteps.map((step) => (
                    <li key={step.row} className={cn(activeHoverCell?.row === step.row && "text-lv-cyan font-bold")}>
                      D ≠ {step.label} (differs at digit #{step.col + 1}: {step.antiDigit} vs {step.rowDigit})
                    </li>
                  ))}
                </ul>
                <div className="rounded-xl border border-lv-success/30 bg-lv-success/15 p-2.5 mt-2 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-lv-success shrink-0 mt-0.5" />
                  <span className="text-[11px] text-lv-success font-semibold leading-normal">
                    Therefore, D is NOT in the list! Since every countable list leaves out numbers, (0, 1) is <strong>UNCOUNTABLY INFINITE</strong> (|ℝ| = 𝔠 &gt; ℵ₀).
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CANTOR'S SNAKE (COUNTABILITY OF Q) */}
      {tab === "snake" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-lv-border bg-lv-panel/70 p-4 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-lv-text">
                  Enumerating the Positive Rationals (ℚ⁺) via Cantor's Zigzag
                </h4>
                <p className="text-xs text-lv-muted">
                  Every fraction p/q is plotted on a 2D grid. The zigzag serpentine path walks through every pair without missing any!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSnakeStep((s) => Math.max(1, s - 1))}
                  className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted hover:text-lv-text"
                >
                  Step Back
                </button>
                <span className="font-mono text-xs text-lv-cyan font-bold px-2">
                  Step {snakeStep} / {snakeData.sequence.length}
                </span>
                <button
                  type="button"
                  onClick={() => setSnakeStep((s) => Math.min(snakeData.sequence.length, s + 1))}
                  className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted hover:text-lv-text"
                >
                  Step Forward
                </button>
              </div>
            </div>

            {/* 2D Grid */}
            <div className="overflow-x-auto py-2">
              <table className="border-collapse font-mono text-xs mx-auto">
                <thead>
                  <tr>
                    <th className="p-2 text-lv-faint text-right">p \ q</th>
                    {[1, 2, 3, 4, 5].map((q) => (
                      <th key={q} className="p-2 text-center text-lv-purple font-bold">
                        q = {q}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {snakeData.grid.map((row, pIdx) => (
                    <tr key={pIdx}>
                      <td className="p-2 text-right text-lv-cyan font-bold">p = {pIdx + 1}</td>
                      {row.map((cell, qIdx) => {
                        const isVisited = cell.index !== undefined && cell.index <= snakeStep;
                        const isCurrent = cell.index === snakeStep;

                        return (
                          <td key={qIdx} className="p-2 text-center">
                            <div
                              className={cn(
                                "flex flex-col items-center justify-center h-12 w-14 rounded-xl border transition-all select-none",
                                isCurrent
                                  ? "bg-lv-purple border-white text-white font-bold scale-110 shadow-lg ring-2 ring-lv-purple/60"
                                  : isVisited
                                  ? "bg-lv-purple/25 border-lv-purple/50 text-lv-text"
                                  : "bg-lv-surface/40 border-lv-border-soft/40 text-lv-faint opacity-50"
                              )}
                            >
                              <span className="font-bold">
                                {cell.p}/{cell.q}
                              </span>
                              {cell.index && (
                                <span className="text-[10px] opacity-75 font-mono">
                                  #{cell.index}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl bg-lv-surface/60 border border-lv-border p-3 text-xs text-lv-muted flex items-center justify-between">
              <span>
                Bijection: <strong className="text-lv-text">f: ℕ → ℚ⁺</strong> guarantees every fraction is assigned a unique natural number index.
              </span>
              <span className="font-mono text-lv-success font-bold">
                |ℚ| = |ℕ| = ℵ₀ (Countably Infinite)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
