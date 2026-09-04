"use client";

import { useState, useMemo } from "react";
import { GitBranch, AlertCircle, CheckCircle2, RotateCcw, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  computeHasseDiagram,
  RELATION_PRESETS,
  type RelationPreset,
} from "@/lib/algorithms/relations";

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
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [elements, setElements] = useState<string[]>(HASSE_PRESETS[0].elements);
  const [pairs, setPairs] = useState<[string, string][]>(HASSE_PRESETS[0].pairs);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  function loadPreset(idx: number) {
    setActiveIdx(idx);
    const p = HASSE_PRESETS[idx];
    setElements([...p.elements]);
    setPairs([...p.pairs]);
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

        <div className="flex items-center gap-2">
          <select
            value={activeIdx}
            onChange={(e) => loadPreset(Number(e.target.value))}
            className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted font-mono"
          >
            {HASSE_PRESETS.map((p, idx) => (
              <option key={idx} value={idx}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => loadPreset(activeIdx)}
            className="flex items-center gap-1 rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted hover:text-lv-text font-mono"
            title="Reset to preset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {!hasse.isPoset ? (
        <div className="rounded-2xl border border-lv-error/30 bg-lv-error/10 p-6 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-lv-error mx-auto" />
          <h4 className="text-sm font-bold text-lv-error">Cannot Generate Hasse Diagram</h4>
          <p className="text-xs text-lv-muted max-w-md mx-auto">{hasse.error}</p>
          <p className="text-[11px] text-lv-faint">
            A Hasse diagram requires a valid Partial Order (Reflexive, Anti-symmetric, and Transitive).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: SVG Diagram Canvas */}
          <div className="lg:col-span-7 space-y-3">
            <div className="rounded-2xl border border-lv-border bg-lv-panel/70 p-4 shadow-xl flex flex-col items-center justify-center min-h-[300px]">
              <div className="flex items-center justify-between w-full text-xs font-mono text-lv-faint mb-2">
                <span>Transitive & Reflexive Reduction Applied</span>
                <span className="text-lv-cyan">
                  {hasse.nodes.length} Elements | {hasse.covers.length} Cover Edges
                </span>
              </div>

              <div className="relative w-full max-w-[400px] aspect-[4/3] bg-lv-surface/30 rounded-xl border border-lv-border-soft p-2">
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
                        stroke={isHighlighted ? "var(--lv-cyan)" : "var(--lv-border)"}
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
                    <span className="text-lv-purple font-bold">Greatest Element (Top)</span>
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
                    <span className="text-lv-cyan font-bold">Least Element (Bottom)</span>
                    <span className="text-lv-text font-bold text-sm">
                      {hasse.leastElement ?? "None (No single minimum)"}
                    </span>
                  </div>
                  <div className="text-[11px] text-lv-faint">
                    An element l such that ∀a ∈ A: l ≤ a.
                  </div>
                </div>

                {/* Maximal & Minimal Sets */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-xl border border-lv-border bg-lv-panel/60 p-2.5 space-y-1">
                    <div className="text-lv-faint text-[10px] uppercase font-bold">Maximal Elements</div>
                    <div className="text-lv-text font-bold text-sm">
                      {"{"} {hasse.maximalElements.join(", ")} {"}"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-lv-border bg-lv-panel/60 p-2.5 space-y-1">
                    <div className="text-lv-faint text-[10px] uppercase font-bold">Minimal Elements</div>
                    <div className="text-lv-text font-bold text-sm">
                      {"{"} {hasse.minimalElements.join(", ")} {"}"}
                    </div>
                  </div>
                </div>

                {/* Hasse Rule Explanation */}
                <div className="rounded-xl border border-lv-border-soft bg-lv-surface/50 p-3 text-[11px] text-lv-muted space-y-1.5 leading-relaxed">
                  <div className="font-bold text-lv-text flex items-center gap-1">
                    <ArrowUp className="h-3 w-3 text-lv-cyan" />
                    How the Hasse Diagram was constructed:
                  </div>
                  <p>
                    1. <strong>Reflexive Reduction:</strong> Loops $(a, a)$ deleted.
                  </p>
                  <p>
                    2. <strong>Transitive Reduction:</strong> If $a \le b$ and $b \le c$, redundant chord $(a, c)$ removed.
                  </p>
                  <p>
                    3. <strong>Planar Layout:</strong> Nodes with longer chains placed strictly above lower elements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
