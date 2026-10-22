"use client";

import { useState, useMemo } from "react";
import {
  GitBranch,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowUp,
  Download,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  computeHasseDiagram,
  RELATION_PRESETS,
  type RelationPreset,
} from "@/lib/algorithms/relations";
import { useWorkspaceStore } from "@/store/workspace-store";

const HASSE_PRESETS: RelationPreset[] = [
  ...RELATION_PRESETS.filter((p) => p.name.includes("Divisibility")),
  {
    name: "Boolean Lattice 𝒫({a, b})",
    description: "Subset inclusion poset on the power set of {a, b}. Classic 4-node diamond lattice.",
    elements: ["∅", "{a}", "{b}", "{a,b}"],
    pairs: [
      ["∅", "∅"], ["∅", "{a}"], ["∅", "{b}"], ["∅", "{a,b}"],
      ["{a}", "{a}"], ["{a}", "{a,b}"],
      ["{b}", "{b}"], ["{b}", "{a,b}"],
      ["{a,b}", "{a,b}"],
    ],
  },
  {
    name: "Divisibility D₂₄ ({1, 2, 3, 4, 6, 8, 12, 24})",
    description: "Divisors of 24 ordered by divisibility.",
    elements: ["1", "2", "3", "4", "6", "8", "12", "24"],
    pairs: [
      ["1", "1"], ["1", "2"], ["1", "3"], ["1", "4"], ["1", "6"], ["1", "8"], ["1", "12"], ["1", "24"],
      ["2", "2"], ["2", "4"], ["2", "6"], ["2", "8"], ["2", "12"], ["2", "24"],
      ["3", "3"], ["3", "6"], ["3", "12"], ["3", "24"],
      ["4", "4"], ["4", "8"], ["4", "12"], ["4", "24"],
      ["6", "6"], ["6", "12"], ["6", "24"],
      ["8", "8"], ["8", "24"],
      ["12", "12"], ["12", "24"],
      ["24", "24"],
    ],
  },
  {
    name: "Linear Chain Poset ({1, 2, 3, 4})",
    description: "Total order where 1 ≤ 2 ≤ 3 ≤ 4.",
    elements: ["1", "2", "3", "4"],
    pairs: [
      ["1", "1"], ["1", "2"], ["1", "3"], ["1", "4"],
      ["2", "2"], ["2", "3"], ["2", "4"],
      ["3", "3"], ["3", "4"],
      ["4", "4"],
    ],
  },
];

export function HasseDiagramView() {
  const storeElements = useWorkspaceStore((s) => s.relationsElements);
  const storePairs = useWorkspaceStore((s) => s.relationsPairs);

  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [elements, setElements] = useState<string[]>(HASSE_PRESETS[0].elements);
  const [pairs, setPairs] = useState<[string, string][]>(HASSE_PRESETS[0].pairs);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Custom Poset Builder State
  const [customMode, setCustomMode] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>("1, 2, 3, 6, 12");
  const [orderRule, setOrderRule] = useState<"divisibility" | "linear" | "subset">("divisibility");

  function loadPreset(idx: number) {
    setActiveIdx(idx);
    setCustomMode(false);
    const p = HASSE_PRESETS[idx];
    if (!p) return;
    setElements([...p.elements]);
    setPairs([...p.pairs]);
  }

  function handleImportFromMatrix() {
    setElements([...storeElements]);
    setPairs([...storePairs]);
    setCustomMode(false);
  }

  function handleBuildFromRule() {
    const raw = customInput
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const unique = Array.from(new Set(raw));
    if (unique.length === 0) return;

    if (orderRule === "divisibility") {
      const nums = unique
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0)
        .sort((a, b) => a - b);
      if (nums.length === 0) return;
      const strElems = nums.map(String);
      const newPairs: [string, string][] = [];
      for (const a of nums) {
        for (const b of nums) {
          if (b % a === 0) {
            newPairs.push([String(a), String(b)]);
          }
        }
      }
      setElements(strElems);
      setPairs(newPairs);
    } else if (orderRule === "linear") {
      const strElems = [...unique];
      const newPairs: [string, string][] = [];
      for (let i = 0; i < strElems.length; i++) {
        for (let j = i; j < strElems.length; j++) {
          newPairs.push([strElems[i], strElems[j]]);
        }
      }
      setElements(strElems);
      setPairs(newPairs);
    } else if (orderRule === "subset") {
      // Power set of up to 3 elements for clean visualization
      const base = unique.slice(0, 3);
      const subsets: string[] = ["∅"];
      const n = base.length;
      for (let i = 1; i < (1 << n); i++) {
        const sub: string[] = [];
        for (let j = 0; j < n; j++) {
          if ((i & (1 << j)) !== 0) sub.push(base[j]);
        }
        subsets.push(`{${sub.join(",")}}`);
      }
      const newPairs: [string, string][] = [];
      for (let i = 0; i < subsets.length; i++) {
        for (let j = 0; j < subsets.length; j++) {
          const s1 = subsets[i] === "∅" ? [] : subsets[i].slice(1, -1).split(",");
          const s2 = subsets[j] === "∅" ? [] : subsets[j].slice(1, -1).split(",");
          const isSubset = s1.every((x) => s2.includes(x));
          if (isSubset) {
            newPairs.push([subsets[i], subsets[j]]);
          }
        }
      }
      setElements(subsets);
      setPairs(newPairs);
    }
  }

  function handleAutoFixToPoset() {
    // Add reflexive closure
    const nextPairs = [...pairs];
    for (const e of elements) {
      if (!nextPairs.some(([x, y]) => x === e && y === e)) {
        nextPairs.push([e, e]);
      }
    }
    // Remove symmetry cycles: if (a, b) and (b, a) with a != b, remove one
    const filtered: [string, string][] = [];
    for (const [a, b] of nextPairs) {
      if (a === b) {
        filtered.push([a, b]);
      } else {
        const hasReverse = filtered.some(([x, y]) => x === b && y === a);
        if (!hasReverse) {
          filtered.push([a, b]);
        }
      }
    }
    // Add transitive closure
    let changed = true;
    while (changed) {
      changed = false;
      for (const [a, b] of [...filtered]) {
        for (const [c, d] of [...filtered]) {
          if (b === c) {
            if (!filtered.some(([x, y]) => x === a && y === d)) {
              filtered.push([a, d]);
              changed = true;
            }
          }
        }
      }
    }
    setPairs(filtered);
  }

  const hasse = useMemo(() => computeHasseDiagram(elements, pairs), [elements, pairs]);

  // Lookup node coordinate map
  const nodeMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    if (hasse.isPoset) {
      for (const n of hasse.nodes) {
        map.set(n.id, { x: n.x, y: n.y });
      }
    }
    return map;
  }, [hasse]);

  return (
    <div className="flex h-full flex-col space-y-4 overflow-y-auto p-4 lv-scrollbar text-lv-text">
      {/* Header & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lv-border-soft pb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-lv-cyan" />
          <h3 className="text-sm font-bold text-lv-text">
            Automated Hasse Diagram Generator (Poset Reduction)
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
            value={activeIdx}
            onChange={(e) => loadPreset(Number(e.target.value))}
            className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted font-mono focus:border-lv-cyan focus:outline-hidden"
          >
            {HASSE_PRESETS.map((p, idx) => (
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
                ? "border-lv-cyan bg-lv-cyan/20 text-lv-cyan"
                : "border-lv-border bg-lv-surface text-lv-muted hover:text-lv-text"
            )}
          >
            {customMode ? "Close Builder" : "Custom Poset Builder"}
          </button>
        </div>
      </div>

      {/* Custom Poset Rule Builder */}
      {customMode && (
        <div className="rounded-2xl border border-lv-cyan/30 bg-lv-cyan/5 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-lv-cyan">
            <span>Generate Poset by Mathematical Rule</span>
            <span className="text-[11px] text-lv-faint">Auto-computes reflexive, antisymmetric & transitive pairs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setOrderRule("divisibility");
                setCustomInput("1, 2, 3, 4, 6, 12");
              }}
              className={cn(
                "rounded-xl border p-2 text-left text-xs font-mono transition-all",
                orderRule === "divisibility"
                  ? "border-lv-cyan bg-lv-cyan/20 text-lv-text"
                  : "border-lv-border bg-lv-surface/50 text-lv-muted"
              )}
            >
              <div className="font-bold">Divisibility Poset</div>
              <div className="text-[10px] text-lv-faint">a | b (e.g. 1, 2, 3, 4, 6, 12)</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setOrderRule("linear");
                setCustomInput("1, 2, 3, 4, 5");
              }}
              className={cn(
                "rounded-xl border p-2 text-left text-xs font-mono transition-all",
                orderRule === "linear"
                  ? "border-lv-cyan bg-lv-cyan/20 text-lv-text"
                  : "border-lv-border bg-lv-surface/50 text-lv-muted"
              )}
            >
              <div className="font-bold">Total / Linear Chain</div>
              <div className="text-[10px] text-lv-faint">a ≤ b chain (e.g. 1, 2, 3, 4, 5)</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setOrderRule("subset");
                setCustomInput("a, b, c");
              }}
              className={cn(
                "rounded-xl border p-2 text-left text-xs font-mono transition-all",
                orderRule === "subset"
                  ? "border-lv-cyan bg-lv-cyan/20 text-lv-text"
                  : "border-lv-border bg-lv-surface/50 text-lv-muted"
              )}
            >
              <div className="font-bold">Subset Lattice 𝒫(S)</div>
              <div className="text-[10px] text-lv-faint">Power set inclusion (e.g. a, b)</div>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBuildFromRule()}
              placeholder="Enter elements..."
              className="flex-1 rounded-xl border border-lv-border bg-lv-panel px-3 py-1.5 text-xs font-mono text-lv-text focus:border-lv-cyan focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleBuildFromRule}
              className="rounded-xl border border-lv-cyan bg-lv-cyan/20 px-4 py-1.5 text-xs font-bold text-lv-cyan hover:bg-lv-cyan/30 transition-colors"
            >
              Generate Poset
            </button>
          </div>
        </div>
      )}

      {!hasse.isPoset ? (
        <div className="rounded-2xl border border-lv-error/30 bg-lv-error/10 p-6 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-lv-error mx-auto" />
          <h4 className="text-sm font-bold text-lv-error">Cannot Generate Hasse Diagram</h4>
          <p className="text-xs text-lv-muted max-w-md mx-auto">{hasse.error}</p>
          <p className="text-[11px] text-lv-faint">
            A Hasse diagram requires a valid Partial Order (Reflexive, Anti-symmetric, and Transitive).
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAutoFixToPoset}
              className="rounded-xl border border-lv-cyan bg-lv-cyan/20 px-3 py-1.5 text-xs font-mono font-bold text-lv-cyan hover:bg-lv-cyan/30 transition-colors"
            >
              ⚡ Auto-Fix to Poset (Add Reflexive & Transitive Closures)
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: SVG Diagram Canvas */}
          <div className="lg:col-span-7 space-y-3">
            <div className="rounded-2xl border border-lv-border bg-lv-panel/70 p-4 shadow-xl flex flex-col items-center justify-center min-h-[320px]">
              <div className="flex items-center justify-between w-full text-xs font-mono text-lv-faint mb-2">
                <span>Transitive & Reflexive Reduction Applied</span>
                <span className="text-lv-cyan font-bold">
                  {hasse.nodes.length} Elements | {hasse.covers.length} Cover Edges
                </span>
              </div>

              <div className="relative w-full max-w-[440px] aspect-[4/3] bg-lv-surface/30 rounded-xl border border-lv-border-soft p-3">
                <svg
                  viewBox="0 0 360 250"
                  className="w-full h-full overflow-visible select-none"
                  role="img"
                  aria-label="Hasse Diagram"
                >
                  {/* Edges */}
                  {hasse.covers.map(([from, to], idx) => {
                    const u = nodeMap.get(from);
                    const v = nodeMap.get(to);
                    if (!u || !v) return null;

                    const isHighlighted = hoveredNode === from || hoveredNode === to;

                    return (
                      <line
                        key={idx}
                        x1={u.x}
                        y1={u.y}
                        x2={v.x}
                        y2={v.y}
                        stroke={isHighlighted ? "var(--lv-cyan)" : "rgba(148, 163, 184, 0.4)"}
                        strokeWidth={isHighlighted ? 2.5 : 1.5}
                        className="transition-colors duration-200"
                      />
                    );
                  })}

                  {/* Nodes */}
                  {hasse.nodes.map((n) => {
                    const isHovered = hoveredNode === n.id;
                    const isGreatest = hasse.greatestElement === n.id;
                    const isLeast = hasse.leastElement === n.id;

                    return (
                      <g
                        key={n.id}
                        onMouseEnter={() => setHoveredNode(n.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className="cursor-pointer transition-transform duration-200"
                      >
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={18}
                          fill={
                            isGreatest
                              ? "rgba(139,92,246,0.3)"
                              : isLeast
                              ? "rgba(34,211,238,0.3)"
                              : isHovered
                              ? "rgba(37,99,235,0.4)"
                              : "rgba(11,17,29,0.85)"
                          }
                          stroke={
                            isGreatest
                              ? "var(--lv-purple)"
                              : isLeast
                              ? "var(--lv-cyan)"
                              : isHovered
                              ? "white"
                              : "var(--lv-blue)"
                          }
                          strokeWidth={isHovered ? 2.5 : 1.5}
                        />
                        <text
                          x={n.x}
                          y={n.y + 4}
                          textAnchor="middle"
                          fill="var(--lv-text)"
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="var(--font-mono-ui)"
                        >
                          {n.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="w-full flex items-center justify-between text-[11px] font-mono text-lv-faint mt-2">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-lv-purple"></span> Top = Greatest
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-lv-cyan"></span> Bottom = Least
                </span>
                <span>Directed upward</span>
              </div>
            </div>
          </div>

          {/* Right: Extremal Elements Analysis */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-4 shadow-xl space-y-3">
              <div className="text-xs font-mono font-bold text-lv-text uppercase tracking-wider">
                Extremal Elements of Poset
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                {/* Greatest & Least Element */}
                <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lv-purple font-bold">Greatest Element (Top ⊤)</span>
                    <span className="text-lv-text font-bold text-sm">
                      {hasse.greatestElement ?? "None (No single maximum)"}
                    </span>
                  </div>
                  <div className="text-[11px] text-lv-faint">
                    An element g such that ∀a ∈ A: a ≤ g.
                  </div>
                </div>

                <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lv-cyan font-bold">Least Element (Bottom ⊥)</span>
                    <span className="text-lv-text font-bold text-sm">
                      {hasse.leastElement ?? "None (No single minimum)"}
                    </span>
                  </div>
                  <div className="text-[11px] text-lv-faint">
                    An element l such that ∀a ∈ A: l ≤ a.
                  </div>
                </div>

                {/* Maximal & Minimal Sets */}
                <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lv-text font-bold">Maximal Elements</span>
                    <span className="text-lv-text font-bold">
                      {"{"} {hasse.maximalElements.join(", ")} {"}"}
                    </span>
                  </div>
                  <div className="text-[11px] text-lv-faint">
                    Elements with no strictly greater elements above them.
                  </div>
                </div>

                <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lv-text font-bold">Minimal Elements</span>
                    <span className="text-lv-text font-bold">
                      {"{"} {hasse.minimalElements.join(", ")} {"}"}
                    </span>
                  </div>
                  <div className="text-[11px] text-lv-faint">
                    Elements with no strictly smaller elements below them.
                  </div>
                </div>
              </div>
            </div>

            {/* Poset Mathematical Info Card */}
            <div className="rounded-2xl border border-lv-border bg-lv-surface/50 p-4 text-xs font-mono text-lv-muted space-y-2">
              <div className="font-bold text-lv-text text-[11px] uppercase tracking-wider">
                Hasse Diagram Reduction Rules:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-lv-faint">
                <li>Eliminates all reflexive loops (a, a) since reflexivity is assumed.</li>
                <li>Eliminates all transitive shortcuts: if a &lt; b and b &lt; c, edge (a, c) is omitted.</li>
                <li>Draws only covering relations: a &lt;: b (b covers a).</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
