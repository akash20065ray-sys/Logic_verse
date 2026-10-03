"use client";

import { useState, useMemo } from "react";
import {
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeFunction } from "@/lib/algorithms/relations";

interface FunctionPreset {
  name: string;
  domain: string[];
  codomain: string[];
  mapping: Record<string, string>;
  description: string;
}

const FUNCTION_PRESETS: FunctionPreset[] = [
  {
    name: "Bijective (One-to-One & Onto)",
    domain: ["a", "b", "c"],
    codomain: ["1", "2", "3"],
    mapping: { a: "1", b: "2", c: "3" },
    description: "Every element has a unique image and every codomain target is covered. Perfectly invertible!",
  },
  {
    name: "Injective only (One-to-One, Not Onto)",
    domain: ["a", "b", "c"],
    codomain: ["1", "2", "3", "4"],
    mapping: { a: "1", b: "2", c: "3" },
    description: "No two inputs share a target, but element '4' is left uncovered.",
  },
  {
    name: "Surjective only (Onto, Not One-to-One)",
    domain: ["a", "b", "c", "d"],
    codomain: ["1", "2", "3"],
    mapping: { a: "1", b: "1", c: "2", d: "3" },
    description: "Every codomain element is covered, but target '1' has collisions from both 'a' and 'b'.",
  },
  {
    name: "Neither Injective nor Surjective",
    domain: ["a", "b", "c"],
    codomain: ["1", "2", "3"],
    mapping: { a: "1", b: "1", c: "2" },
    description: "Collisions on target '1' and target '3' is left uncovered.",
  },
];

export function FunctionMapperView() {
  const [activePresetIdx, setActivePresetIdx] = useState<number>(0);
  const [domain, setDomain] = useState<string[]>(FUNCTION_PRESETS[0].domain);
  const [codomain, setCodomain] = useState<string[]>(FUNCTION_PRESETS[0].codomain);
  const [mapping, setMapping] = useState<Record<string, string>>(FUNCTION_PRESETS[0].mapping);

  const [selectedDomainElem, setSelectedDomainElem] = useState<string | null>(null);

  function loadPreset(idx: number) {
    setActivePresetIdx(idx);
    const p = FUNCTION_PRESETS[idx];
    setDomain([...p.domain]);
    setCodomain([...p.codomain]);
    setMapping({ ...p.mapping });
    setSelectedDomainElem(null);
  }

  function handleTargetClick(target: string) {
    if (!selectedDomainElem) return;
    setMapping((prev) => ({
      ...prev,
      [selectedDomainElem]: target,
    }));
    setSelectedDomainElem(null);
  }

  const analysis = useMemo(
    () => analyzeFunction(domain, codomain, mapping),
    [domain, codomain, mapping]
  );

  return (
    <div className="flex h-full flex-col space-y-4 overflow-y-auto p-4 lv-scrollbar text-lv-text">
      {/* Header & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lv-border-soft pb-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-lv-cyan" />
          <h3 className="text-sm font-bold text-lv-text">
            Function Mapping & Bijection Analyzer (f: A → B)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activePresetIdx}
            onChange={(e) => loadPreset(Number(e.target.value))}
            className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted font-mono"
          >
            {FUNCTION_PRESETS.map((p, idx) => (
              <option key={idx} value={idx}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => loadPreset(activePresetIdx)}
            className="flex items-center gap-1 rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted hover:text-lv-text font-mono"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Bipartite Diagram */}
        <div className="lg:col-span-7 space-y-3">
          <div className="rounded-2xl border border-lv-border bg-lv-panel/70 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-lv-faint">
              <span>Click a Domain element, then click a Codomain element to map</span>
              {selectedDomainElem && (
                <span className="text-lv-cyan font-bold animate-pulse">
                  Select target for "{selectedDomainElem}" →
                </span>
              )}
            </div>

            {/* Bipartite Graph Canvas */}
            <div className="relative w-full max-w-[440px] h-[240px] mx-auto bg-lv-surface/30 rounded-xl border border-lv-border-soft p-3">
              <svg viewBox="0 0 440 240" className="w-full h-full select-none overflow-visible">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="var(--lv-cyan)" />
                  </marker>
                </defs>

                {/* Drawn Mapping Arrows */}
                {domain.map((d, dIdx) => {
                  const target = mapping[d];
                  if (!target) return null;
                  const tIdx = codomain.indexOf(target);
                  if (tIdx === -1) return null;

                  const y1 = 40 + (dIdx * (160 / Math.max(1, domain.length - 1)));
                  const y2 = 40 + (tIdx * (160 / Math.max(1, codomain.length - 1)));

                  return (
                    <line
                      key={`${d}->${target}`}
                      x1={100}
                      y1={y1}
                      x2={330}
                      y2={y2}
                      stroke="var(--lv-cyan)"
                      strokeWidth={2}
                      markerEnd="url(#arrowhead)"
                      className="transition-all duration-300 opacity-80 hover:opacity-100"
                    />
                  );
                })}

                {/* Domain Column A */}
                <text x={80} y={18} textAnchor="middle" fill="var(--lv-blue)" fontSize="12" fontWeight="bold" fontFamily="var(--font-mono-ui)">
                  Domain A
                </text>
                {domain.map((d, idx) => {
                  const y = 40 + (idx * (160 / Math.max(1, domain.length - 1)));
                  const isSelected = selectedDomainElem === d;

                  return (
                    <g
                      key={d}
                      onClick={() => setSelectedDomainElem(d)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={80}
                        cy={y}
                        r={16}
                        fill={isSelected ? "rgba(37,99,235,0.4)" : "rgba(11,17,29,0.85)"}
                        stroke={isSelected ? "white" : "var(--lv-blue)"}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        className="transition-all hover:scale-105"
                      />
                      <text
                        x={80}
                        y={y + 4}
                        textAnchor="middle"
                        fill="var(--lv-text)"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="var(--font-mono-ui)"
                      >
                        {d}
                      </text>
                    </g>
                  );
                })}

                {/* Codomain Column B */}
                <text x={350} y={18} textAnchor="middle" fill="var(--lv-purple)" fontSize="12" fontWeight="bold" fontFamily="var(--font-mono-ui)">
                  Codomain B
                </text>
                {codomain.map((c, idx) => {
                  const y = 40 + (idx * (160 / Math.max(1, codomain.length - 1)));

                  return (
                    <g
                      key={c}
                      onClick={() => handleTargetClick(c)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={350}
                        cy={y}
                        r={16}
                        fill="rgba(11,17,29,0.85)"
                        stroke="var(--lv-purple)"
                        strokeWidth={1.5}
                        className="transition-all hover:stroke-white hover:scale-105"
                      />
                      <text
                        x={350}
                        y={y + 4}
                        textAnchor="middle"
                        fill="var(--lv-text)"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="var(--font-mono-ui)"
                      >
                        {c}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Right Classification & Invertibility */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-4 shadow-xl space-y-3">
            <div className="text-xs font-mono font-bold text-lv-text uppercase tracking-wider flex items-center justify-between">
              <span>Function Classification</span>
              {analysis.isBijective && (
                <span className="rounded-full bg-lv-success/20 border border-lv-success/40 px-2.5 py-0.5 text-lv-success font-bold text-[10px]">
                  BIJECTIVE (INVERTIBLE)
                </span>
              )}
            </div>

            {/* Badges Grid */}
            <div className="space-y-2 text-xs font-mono">
              {/* Injective */}
              <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Injective (One-to-One)</span>
                  {analysis.isInjective ? (
                    <CheckCircle2 className="h-4 w-4 text-lv-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-lv-error" />
                  )}
                </div>
                <div className="text-[11px] text-lv-faint">
                  {analysis.isInjective
                    ? "∀x₁ ≠ x₂: f(x₁) ≠ f(x₂) (No duplicate targets)"
                    : `Collision on ${analysis.collisions.map((c) => `target '${c.target}' from [${c.sources.join(",")}]`).join("; ")}`}
                </div>
              </div>

              {/* Surjective */}
              <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Surjective (Onto)</span>
                  {analysis.isSurjective ? (
                    <CheckCircle2 className="h-4 w-4 text-lv-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-lv-error" />
                  )}
                </div>
                <div className="text-[11px] text-lv-faint">
                  {analysis.isSurjective
                    ? "Codomain = Range (Every element in B is covered)"
                    : `Uncovered targets: { ${analysis.uncoveredCodomain.join(", ")} }`}
                </div>
              </div>

              {/* Inverse Function Card */}
              {analysis.isBijective && analysis.inverseMapping && (
                <div className="rounded-xl border border-lv-success/30 bg-lv-success/10 p-3 space-y-1.5 mt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-lv-success uppercase">
                    <Sparkles className="h-4 w-4" />
                    Inverse Function f⁻¹: B → A Exists
                  </div>
                  <div className="text-xs font-mono text-lv-text">
                    {Object.entries(analysis.inverseMapping)
                      .map(([b, a]) => `f⁻¹(${b}) = ${a}`)
                      .join(", ")}
                  </div>
                </div>
              )}

              {/* Pigeonhole Principle */}
              {analysis.pigeonholeApplies && (
                <div className="rounded-xl border border-lv-warning/30 bg-lv-warning/10 p-2.5 text-[11px] text-lv-warning space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Pigeonhole Principle in Effect:
                  </div>
                  <p>
                    |Domain| ({domain.length}) &gt; |Codomain| ({codomain.length}) ⇒ At least one target must receive at least <strong>{analysis.minMaxCollisions}</strong> mappings. Thus, f <strong>cannot be Injective</strong>!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
