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
  Plus,
  Trash2,
  Wand2,
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
    description: "Every element has a unique image and every codomain target is covered. Invertible!",
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

  // Custom Domain/Codomain Editor State
  const [domainInput, setDomainInput] = useState<string>(domain.join(", "));
  const [codomainInput, setCodomainInput] = useState<string>(codomain.join(", "));
  const [showSetEditor, setShowSetEditor] = useState<boolean>(false);

  function loadPreset(idx: number) {
    setActivePresetIdx(idx);
    const p = FUNCTION_PRESETS[idx];
    if (!p) return;
    setDomain([...p.domain]);
    setCodomain([...p.codomain]);
    setMapping({ ...p.mapping });
    setDomainInput(p.domain.join(", "));
    setCodomainInput(p.codomain.join(", "));
    setSelectedDomainElem(null);
  }

  function handleApplySets() {
    const rawD = domainInput
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const uniqueD = Array.from(new Set(rawD));

    const rawC = codomainInput
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const uniqueC = Array.from(new Set(rawC));

    if (uniqueD.length === 0 || uniqueC.length === 0) return;

    setDomain(uniqueD);
    setCodomain(uniqueC);

    // Keep valid mappings or auto-map to first element
    const nextMapping: Record<string, string> = {};
    for (const d of uniqueD) {
      if (mapping[d] && uniqueC.includes(mapping[d])) {
        nextMapping[d] = mapping[d];
      } else {
        nextMapping[d] = uniqueC[0];
      }
    }
    setMapping(nextMapping);
    setSelectedDomainElem(null);
    setShowSetEditor(false);
  }

  function handleTargetClick(target: string) {
    if (!selectedDomainElem) return;
    setMapping((prev) => ({
      ...prev,
      [selectedDomainElem]: target,
    }));
    setSelectedDomainElem(null);
  }

  function handleSetOneToOne() {
    const nextMapping: Record<string, string> = {};
    domain.forEach((d, i) => {
      if (codomain[i]) {
        nextMapping[d] = codomain[i];
      } else {
        nextMapping[d] = codomain[codomain.length - 1];
      }
    });
    setMapping(nextMapping);
    setSelectedDomainElem(null);
  }

  function handleSetConstant() {
    if (codomain.length === 0) return;
    const target = codomain[0];
    const nextMapping: Record<string, string> = {};
    domain.forEach((d) => {
      nextMapping[d] = target;
    });
    setMapping(nextMapping);
    setSelectedDomainElem(null);
  }

  function handleClearMapping() {
    setMapping({});
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

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activePresetIdx}
            onChange={(e) => loadPreset(Number(e.target.value))}
            className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted font-mono focus:border-lv-cyan focus:outline-hidden"
          >
            {FUNCTION_PRESETS.map((p, idx) => (
              <option key={idx} value={idx}>
                Preset: {p.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowSetEditor(!showSetEditor)}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors",
              showSetEditor
                ? "border-lv-cyan bg-lv-cyan/20 text-lv-cyan font-bold"
                : "border-lv-border bg-lv-surface text-lv-muted hover:text-lv-text"
            )}
          >
            {showSetEditor ? "Close Set Editor" : "Edit Sets A & B"}
          </button>

          <button
            type="button"
            onClick={() => loadPreset(activePresetIdx)}
            className="flex items-center gap-1 rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted hover:text-lv-text font-mono transition-colors"
            title="Reset preset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Custom Sets A & B Editor */}
      {showSetEditor && (
        <div className="rounded-2xl border border-lv-cyan/30 bg-lv-cyan/5 p-4 space-y-3">
          <div className="text-xs font-mono font-bold text-lv-cyan flex items-center justify-between">
            <span>Configure Domain Set A & Codomain Set B</span>
            <span className="text-[11px] text-lv-faint">Type comma-separated element labels</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-lv-blue font-bold">Domain A (|A| = {domain.length}):</label>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="e.g. a, b, c, d"
                className="w-full rounded-xl border border-lv-border bg-lv-panel px-3 py-1.5 text-xs font-mono text-lv-text focus:border-lv-cyan focus:outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-lv-purple font-bold">Codomain B (|B| = {codomain.length}):</label>
              <input
                type="text"
                value={codomainInput}
                onChange={(e) => setCodomainInput(e.target.value)}
                placeholder="e.g. 1, 2, 3, 4"
                className="w-full rounded-xl border border-lv-border bg-lv-panel px-3 py-1.5 text-xs font-mono text-lv-text focus:border-lv-cyan focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplySets}
            className="rounded-xl border border-lv-cyan bg-lv-cyan/20 px-4 py-1.5 text-xs font-mono font-bold text-lv-cyan hover:bg-lv-cyan/30 transition-colors"
          >
            Apply Sets A & B
          </button>
        </div>
      )}

      {/* Quick Mapping Action Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
        <span className="text-[10px] uppercase text-lv-faint font-bold mr-1">Quick Mappings:</span>
        <button
          type="button"
          onClick={handleSetOneToOne}
          className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-[11px] text-lv-muted hover:text-lv-text hover:border-lv-border-hover transition-colors"
        >
          1-to-1 Mapping
        </button>
        <button
          type="button"
          onClick={handleSetConstant}
          className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-[11px] text-lv-muted hover:text-lv-text hover:border-lv-border-hover transition-colors"
        >
          Constant f(x) = {codomain[0] ?? "b₀"}
        </button>
        <button
          type="button"
          onClick={handleClearMapping}
          className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-[11px] text-lv-error/80 hover:text-lv-error hover:border-lv-error/40 transition-colors"
        >
          Clear Mappings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Bipartite Diagram */}
        <div className="lg:col-span-7 space-y-3">
          <div className="rounded-2xl border border-lv-border bg-lv-panel/70 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-lv-faint">
              <span>Click a Domain node, then click a Codomain node to map</span>
              {selectedDomainElem && (
                <span className="text-lv-cyan font-bold animate-pulse">
                  Select target for &ldquo;{selectedDomainElem}&rdquo; →
                </span>
              )}
            </div>

            {/* Bipartite Graph Canvas */}
            <div className="relative w-full max-w-[460px] min-h-[260px] mx-auto bg-lv-surface/30 rounded-xl border border-lv-border-soft p-3">
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
                  const isTargetHit = Object.values(mapping).includes(c);

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
                        fill={isTargetHit ? "rgba(168,85,247,0.3)" : "rgba(11,17,29,0.85)"}
                        stroke={isTargetHit ? "var(--lv-purple)" : "var(--lv-border)"}
                        strokeWidth={isTargetHit ? 2 : 1.5}
                        className="transition-all hover:scale-105"
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

            {/* Individual Mapping Table */}
            <div className="rounded-xl border border-lv-border-soft bg-lv-surface/50 p-2.5 text-xs font-mono">
              <div className="text-[10px] uppercase text-lv-faint font-semibold mb-1">
                Mapping Assignments f(x):
              </div>
              <div className="flex flex-wrap gap-2">
                {domain.map((d) => (
                  <div key={d} className="flex items-center gap-1 rounded-lg border border-lv-border bg-lv-panel px-2 py-0.5">
                    <span className="text-lv-cyan font-bold">{d}</span>
                    <span className="text-lv-faint">→</span>
                    <select
                      value={mapping[d] ?? ""}
                      onChange={(e) =>
                        setMapping((prev) => ({ ...prev, [d]: e.target.value }))
                      }
                      className="rounded bg-transparent text-lv-purple font-bold focus:outline-hidden"
                    >
                      <option value="" disabled>Select</option>
                      {codomain.map((c) => (
                        <option key={c} value={c} className="bg-lv-surface text-lv-text">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Classification & Invertibility */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-4 shadow-xl space-y-3">
            <div className="text-xs font-mono font-bold text-lv-text uppercase tracking-wider flex items-center justify-between">
              <span>Function Analysis</span>
              {analysis.isBijective && (
                <span className="rounded-full bg-lv-success/20 border border-lv-success/40 px-2.5 py-0.5 text-lv-success font-bold text-[10px]">
                  BIJECTIVE (INVERTIBLE)
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs font-mono">
              {/* Injective */}
              <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-3 space-y-1">
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
                    ? "∀a,b ∈ A: f(a) = f(b) ⇒ a = b (No collisions)"
                    : `Collisions on: ${analysis.collisions.map((c) => `${c.target} ← {${c.sources.join(", ")}}`).join("; ")}`}
                </div>
              </div>

              {/* Surjective */}
              <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-3 space-y-1">
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
                    ? "∀y ∈ B, ∃x ∈ A: f(x) = y (Image = Codomain)"
                    : `Uncovered targets in B: {${analysis.uncoveredCodomain.join(", ")}}`}
                </div>
              </div>

              {/* Inverse Mapping if Bijective */}
              {analysis.isBijective && analysis.inverseMapping && (
                <div className="rounded-xl border border-lv-success/30 bg-lv-success/10 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-lv-success uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    Inverse Function f⁻¹: B → A
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {Object.entries(analysis.inverseMapping).map(([target, src]) => (
                      <span key={target} className="rounded bg-lv-success/20 px-2 py-0.5 text-lv-text border border-lv-success/30">
                        f⁻¹({target}) = {src}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pigeonhole Alert */}
              {analysis.pigeonholeApplies && (
                <div className="rounded-xl border border-lv-warning/30 bg-lv-warning/10 p-2.5 text-xs space-y-1">
                  <div className="flex items-center gap-1 text-lv-warning font-bold text-[11px]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Pigeonhole Principle Triggered:
                  </div>
                  <p className="text-[11px] text-lv-faint leading-relaxed">
                    |Domain| ({domain.length}) &gt; |Codomain| ({codomain.length}). Therefore, by Dirichlet&apos;s Box Principle, at least one target must receive multiple inputs. Injectivity is impossible.
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
