"use client";

import { useState, useMemo } from "react";
import { Calculator, Sparkles, BookOpen, CheckCircle2, RotateCcw, X, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";
import type { SetNodeData } from "../canvas/nodes/set-node";

interface ProblemPreset {
  name: string;
  type: "2-set" | "3-set";
  labelA: string;
  labelB: string;
  labelC?: string;
  valA: number;
  valB: number;
  valC?: number;
  valAB: number;
  valBC?: number;
  valAC?: number;
  valABC?: number;
  universe: number;
  story: string;
}

const PRESETS: ProblemPreset[] = [
  {
    name: "Standard 2-Set Model (A & B Overlap)",
    type: "2-set",
    labelA: "Set A",
    labelB: "Set B",
    valA: 60,
    valB: 40,
    valAB: 25,
    universe: 100,
    story: "Universe |𝒰| = 100 with subsets A and B, where |A| = 60, |B| = 40, and overlap |A ∩ B| = 25.",
  },
  {
    name: "3-Set Generalized PIE Model (A, B, C)",
    type: "3-set",
    labelA: "Set A",
    labelB: "Set B",
    labelC: "Set C",
    valA: 50,
    valB: 45,
    valC: 40,
    valAB: 20,
    valBC: 18,
    valAC: 15,
    valABC: 10,
    universe: 100,
    story: "Universe |𝒰| = 100 with three finite subsets A, B, and C having pairwise and triple intersections.",
  },
  {
    name: "Mutually Disjoint Sets (A ∩ B = ∅)",
    type: "2-set",
    labelA: "Set A",
    labelB: "Set B",
    valA: 40,
    valB: 35,
    valAB: 0,
    universe: 100,
    story: "Mutually disjoint subsets where |A ∩ B| = 0, so |A ∪ B| = |A| + |B| without subtractive reduction.",
  },
  {
    name: "Subset Inclusion Model (A ⊆ B)",
    type: "2-set",
    labelA: "Set A",
    labelB: "Set B",
    valA: 30,
    valB: 70,
    valAB: 30,
    universe: 100,
    story: "Subset containment where A ⊆ B, meaning |A ∩ B| = |A| = 30 and |A ∪ B| = |B| = 70.",
  },
];

interface PieSolverViewProps {
  onClose?: () => void;
}

export function PieSolverView({ onClose }: PieSolverViewProps = {}) {
  const nodes = useWorkspaceStore((s) => s.nodes);

  const [activePresetIdx, setActivePresetIdx] = useState<number>(0);
  const [numSets, setNumSets] = useState<2 | 3>(2);

  // 2-Set state
  const [labelA, setLabelA] = useState("Set A");
  const [labelB, setLabelB] = useState("Set B");
  const [valA, setValA] = useState(60);
  const [valB, setValB] = useState(40);
  const [valAB, setValAB] = useState(25);
  const [valU, setValU] = useState(100);

  // 3-Set additions
  const [labelC, setLabelC] = useState("Set C");
  const [valC, setValC] = useState(40);
  const [valBC, setValBC] = useState(18);
  const [valAC, setValAC] = useState(15);
  const [valABC, setValABC] = useState(10);

  // Detect Set nodes on workspace canvas
  const canvasSetNodes = useMemo(() => {
    return nodes.filter((n) => n.type === "set" && n.data?.elements && Array.isArray(n.data.elements));
  }, [nodes]);

  function loadPreset(idx: number) {
    setActivePresetIdx(idx);
    const p = PRESETS[idx];
    if (!p) return;
    if (p.type === "2-set") {
      setNumSets(2);
      setLabelA(p.labelA);
      setLabelB(p.labelB);
      setValA(p.valA);
      setValB(p.valB);
      setValAB(p.valAB);
      setValU(p.universe);
    } else {
      setNumSets(3);
      setLabelA(p.labelA);
      setLabelB(p.labelB);
      setLabelC(p.labelC || "Set C");
      setValA(p.valA);
      setValB(p.valB);
      setValC(p.valC || 40);
      setValAB(p.valAB);
      setValBC(p.valBC || 18);
      setValAC(p.valAC || 15);
      setValABC(p.valABC || 10);
      setValU(p.universe);
    }
  }

  function handleImportFromCanvas() {
    if (canvasSetNodes.length < 2) return;
    const sA = canvasSetNodes[0].data as unknown as SetNodeData;
    const sB = canvasSetNodes[1].data as unknown as SetNodeData;
    const elemsA = sA.elements.map(String);
    const elemsB = sB.elements.map(String);
    const commonAB = elemsA.filter((x) => elemsB.includes(x));

    if (canvasSetNodes.length >= 3) {
      setNumSets(3);
      const sC = canvasSetNodes[2].data as unknown as SetNodeData;
      const elemsC = sC.elements.map(String);
      const commonBC = elemsB.filter((x) => elemsC.includes(x));
      const commonAC = elemsA.filter((x) => elemsC.includes(x));
      const commonABC = commonAB.filter((x) => elemsC.includes(x));

      setLabelA(sA.label || "Set A");
      setLabelB(sB.label || "Set B");
      setLabelC(sC.label || "Set C");
      setValA(elemsA.length);
      setValB(elemsB.length);
      setValC(elemsC.length);
      setValAB(commonAB.length);
      setValBC(commonBC.length);
      setValAC(commonAC.length);
      setValABC(commonABC.length);

      const allUnique = Array.from(new Set([...elemsA, ...elemsB, ...elemsC]));
      setValU(Math.max(100, allUnique.length));
    } else {
      setNumSets(2);
      setLabelA(sA.label || "Set A");
      setLabelB(sB.label || "Set B");
      setValA(elemsA.length);
      setValB(elemsB.length);
      setValAB(commonAB.length);

      const allUnique = Array.from(new Set([...elemsA, ...elemsB]));
      setValU(Math.max(100, allUnique.length));
    }
  }

  // 2-Set Calculations
  const union2 = useMemo(() => Math.max(0, valA + valB - valAB), [valA, valB, valAB]);
  const onlyA2 = useMemo(() => Math.max(0, valA - valAB), [valA, valAB]);
  const onlyB2 = useMemo(() => Math.max(0, valB - valAB), [valB, valAB]);
  const neither2 = useMemo(() => Math.max(0, valU - union2), [valU, union2]);

  // 3-Set Calculations
  const sumSingles = valA + valB + valC;
  const sumPairs = valAB + valBC + valAC;
  const union3 = useMemo(
    () => Math.max(0, sumSingles - sumPairs + valABC),
    [sumSingles, sumPairs, valABC]
  );
  const neither3 = useMemo(() => Math.max(0, valU - union3), [valU, union3]);

  // 3-Set region decompositions:
  const centerABC = valABC;
  const regionAB = Math.max(0, valAB - valABC);
  const regionBC = Math.max(0, valBC - valABC);
  const regionAC = Math.max(0, valAC - valABC);
  const onlyA3 = Math.max(0, valA - (regionAB + regionAC + centerABC));
  const onlyB3 = Math.max(0, valB - (regionAB + regionBC + centerABC));
  const onlyC3 = Math.max(0, valC - (regionAC + regionBC + centerABC));

  return (
    <div className="flex h-full flex-col space-y-4 overflow-y-auto p-4 lv-scrollbar text-lv-text">
      {/* Header & Preset Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lv-border-soft pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-lv-cyan" />
          <h3 className="text-sm font-bold text-lv-text">
            Principle of Inclusion & Exclusion (PIE) Solver
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canvasSetNodes.length >= 2 && (
            <button
              type="button"
              onClick={handleImportFromCanvas}
              className="rounded-lg border border-lv-cyan/40 bg-lv-cyan/10 px-2.5 py-1 text-xs font-mono text-lv-cyan hover:bg-lv-cyan/20 transition-colors"
              title="Import set cardinalities directly from active canvas nodes"
            >
              ← Sync from Canvas Sets
            </button>
          )}

          <div className="flex rounded-lg border border-lv-border bg-lv-surface/60 p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setNumSets(2)}
              className={cn(
                "rounded px-2.5 py-1 transition-all",
                numSets === 2 ? "bg-lv-cyan/20 text-lv-cyan font-bold" : "text-lv-muted hover:text-lv-text"
              )}
            >
              2-Set PIE
            </button>
            <button
              type="button"
              onClick={() => setNumSets(3)}
              className={cn(
                "rounded px-2.5 py-1 transition-all",
                numSets === 3 ? "bg-lv-purple/20 text-lv-purple font-bold" : "text-lv-muted hover:text-lv-text"
              )}
            >
              3-Set PIE
            </button>
          </div>

          <select
            value={activePresetIdx}
            onChange={(e) => loadPreset(Number(e.target.value))}
            className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted font-mono focus:border-lv-cyan focus:outline-hidden"
          >
            {PRESETS.map((p, idx) => (
              <option key={idx} value={idx}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => loadPreset(activePresetIdx)}
            className="flex items-center gap-1 rounded-lg border border-lv-border bg-lv-surface px-2 py-1 text-xs text-lv-muted hover:text-lv-text font-mono transition-colors"
            title="Reset preset"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Input Values */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-lv-border bg-lv-panel/70 p-4 shadow-xl space-y-3.5">
            <div className="text-xs font-mono font-bold uppercase text-lv-text tracking-wider flex items-center justify-between">
              <span>Set Cardinalities Input</span>
              <span className="text-[10px] text-lv-cyan font-normal">Live Dynamic Recalculation</span>
            </div>

            {/* Set Labels & Individual Cardinalities */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={labelA}
                  onChange={(e) => setLabelA(e.target.value)}
                  className="col-span-6 rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-lv-blue font-bold focus:border-lv-blue focus:outline-hidden"
                  placeholder="Set A Label"
                />
                <span className="col-span-2 text-right text-lv-faint text-[11px]">|A| =</span>
                <input
                  type="number"
                  min="0"
                  value={valA}
                  onChange={(e) => setValA(Math.max(0, Number(e.target.value)))}
                  className="col-span-4 rounded-lg border border-lv-border bg-lv-surface px-2 py-1 text-right text-lv-text font-bold focus:border-lv-blue focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={labelB}
                  onChange={(e) => setLabelB(e.target.value)}
                  className="col-span-6 rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-lv-purple font-bold focus:border-lv-purple focus:outline-hidden"
                  placeholder="Set B Label"
                />
                <span className="col-span-2 text-right text-lv-faint text-[11px]">|B| =</span>
                <input
                  type="number"
                  min="0"
                  value={valB}
                  onChange={(e) => setValB(Math.max(0, Number(e.target.value)))}
                  className="col-span-4 rounded-lg border border-lv-border bg-lv-surface px-2 py-1 text-right text-lv-text font-bold focus:border-lv-purple focus:outline-hidden"
                />
              </div>

              {numSets === 3 && (
                <div className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={labelC}
                    onChange={(e) => setLabelC(e.target.value)}
                    className="col-span-6 rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-lv-emerald font-bold focus:border-lv-emerald focus:outline-hidden"
                    placeholder="Set C Label"
                  />
                  <span className="col-span-2 text-right text-lv-faint text-[11px]">|C| =</span>
                  <input
                    type="number"
                    min="0"
                    value={valC}
                    onChange={(e) => setValC(Math.max(0, Number(e.target.value)))}
                    className="col-span-4 rounded-lg border border-lv-border bg-lv-surface px-2 py-1 text-right text-lv-text font-bold focus:border-lv-emerald focus:outline-hidden"
                  />
                </div>
              )}
            </div>

            {/* Intersections Input */}
            <div className="border-t border-lv-border-soft pt-3 space-y-2 text-xs font-mono">
              <div className="text-[10px] uppercase text-lv-faint font-semibold">Intersection Cardinalities:</div>

              <div className="grid grid-cols-12 gap-2 items-center">
                <span className="col-span-8 text-lv-cyan">|{labelA} ∩ {labelB}| =</span>
                <input
                  type="number"
                  min="0"
                  value={valAB}
                  onChange={(e) => setValAB(Math.max(0, Number(e.target.value)))}
                  className="col-span-4 rounded-lg border border-lv-border bg-lv-surface px-2 py-1 text-right text-lv-text font-bold focus:border-lv-cyan focus:outline-hidden"
                />
              </div>

              {numSets === 3 && (
                <>
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-8 text-lv-cyan">|{labelB} ∩ {labelC}| =</span>
                    <input
                      type="number"
                      min="0"
                      value={valBC}
                      onChange={(e) => setValBC(Math.max(0, Number(e.target.value)))}
                      className="col-span-4 rounded-lg border border-lv-border bg-lv-surface px-2 py-1 text-right text-lv-text font-bold focus:border-lv-cyan focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-8 text-lv-cyan">|{labelA} ∩ {labelC}| =</span>
                    <input
                      type="number"
                      min="0"
                      value={valAC}
                      onChange={(e) => setValAC(Math.max(0, Number(e.target.value)))}
                      className="col-span-4 rounded-lg border border-lv-border bg-lv-surface px-2 py-1 text-right text-lv-text font-bold focus:border-lv-cyan focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-8 text-lv-purple font-bold">|{labelA} ∩ {labelB} ∩ {labelC}| =</span>
                    <input
                      type="number"
                      min="0"
                      value={valABC}
                      onChange={(e) => setValABC(Math.max(0, Number(e.target.value)))}
                      className="col-span-4 rounded-lg border border-lv-border bg-lv-surface px-2 py-1 text-right text-lv-purple font-bold focus:border-lv-purple focus:outline-hidden"
                    />
                  </div>
                </>
              )}

              {/* Total Universe */}
              <div className="grid grid-cols-12 gap-2 items-center border-t border-lv-border-soft pt-2">
                <span className="col-span-8 text-lv-faint">Total Universe Size (|𝒰|) =</span>
                <input
                  type="number"
                  min="0"
                  value={valU}
                  onChange={(e) => setValU(Math.max(0, Number(e.target.value)))}
                  className="col-span-4 rounded-lg border border-lv-border bg-lv-surface px-2 py-1 text-right text-lv-text font-bold focus:border-lv-border focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Step-by-Step PIE Deductions & Region Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          {/* Formal Formula Decomposition */}
          <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-4 shadow-xl space-y-3 font-mono text-xs">
            <div className="text-xs font-bold uppercase text-lv-cyan tracking-wider flex items-center justify-between">
              <span>Step-by-Step PIE Solution</span>
              <span className="rounded-full bg-lv-cyan/20 border border-lv-cyan/40 px-2 py-0.5 text-[10px] text-lv-cyan">
                {numSets === 2 ? "2-Set Theorem" : "3-Set Generalized Theorem"}
              </span>
            </div>

            {numSets === 2 ? (
              <div className="space-y-2 bg-lv-panel/60 p-3 rounded-xl border border-lv-border">
                <div className="text-[11px] text-lv-faint font-semibold">General 2-Set Formula:</div>
                <div className="text-lv-cyan font-bold text-xs">
                  |A ∪ B| = |A| + |B| − |A ∩ B|
                </div>
                <div className="text-lv-muted text-xs">
                  |{labelA} ∪ {labelB}| = {valA} + {valB} − {valAB} = <strong className="text-lv-success text-sm">{union2}</strong>
                </div>
              </div>
            ) : (
              <div className="space-y-2 bg-lv-panel/60 p-3 rounded-xl border border-lv-border">
                <div className="text-[11px] text-lv-faint font-semibold">General 3-Set Inclusion-Exclusion Formula:</div>
                <div className="text-lv-cyan font-bold text-xs">
                  |A ∪ B ∪ C| = (|A| + |B| + |C|) − (|A ∩ B| + |B ∩ C| + |A ∩ C|) + |A ∩ B ∩ C|
                </div>
                <div className="text-lv-muted text-xs">
                  = ({valA} + {valB} + {valC}) − ({valAB} + {valBC} + {valAC}) + {valABC}
                </div>
                <div className="text-lv-muted text-xs">
                  = {sumSingles} − {sumPairs} + {valABC} = <strong className="text-lv-success text-sm">{union3}</strong>
                </div>
              </div>
            )}

            {/* Disjoint Venn Regions Breakdown */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] uppercase text-lv-faint font-bold">
                Pairwise Disjoint Region Cardinalities:
              </div>

              {numSets === 2 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="rounded-lg bg-lv-panel/70 p-2.5 border border-lv-border space-y-0.5">
                    <div className="text-[10px] text-lv-blue font-bold">Only {labelA}</div>
                    <div className="text-sm font-bold text-lv-text">{onlyA2}</div>
                    <div className="text-[9px] text-lv-faint">|A \ B| = {valA} - {valAB}</div>
                  </div>

                  <div className="rounded-lg bg-lv-panel/70 p-2.5 border border-lv-border space-y-0.5">
                    <div className="text-[10px] text-lv-purple font-bold">Only {labelB}</div>
                    <div className="text-sm font-bold text-lv-text">{onlyB2}</div>
                    <div className="text-[9px] text-lv-faint">|B \ A| = {valB} - {valAB}</div>
                  </div>

                  <div className="rounded-lg bg-lv-panel/70 p-2.5 border border-lv-border space-y-0.5">
                    <div className="text-[10px] text-lv-cyan font-bold">Both ({labelA} ∩ {labelB})</div>
                    <div className="text-sm font-bold text-lv-text">{valAB}</div>
                    <div className="text-[9px] text-lv-faint">Overlap</div>
                  </div>

                  <div className="rounded-lg bg-lv-panel/70 p-2.5 border border-lv-border space-y-0.5">
                    <div className="text-[10px] text-lv-faint font-bold">Neither (Complement)</div>
                    <div className="text-sm font-bold text-lv-text">{neither2}</div>
                    <div className="text-[9px] text-lv-faint">|𝒰| - |A ∪ B|</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="rounded-lg bg-lv-panel/70 p-2 border border-lv-border">
                    <div className="text-[10px] text-lv-blue font-bold">Only {labelA}</div>
                    <div className="text-sm font-bold text-lv-text">{onlyA3}</div>
                  </div>

                  <div className="rounded-lg bg-lv-panel/70 p-2 border border-lv-border">
                    <div className="text-[10px] text-lv-purple font-bold">Only {labelB}</div>
                    <div className="text-sm font-bold text-lv-text">{onlyB3}</div>
                  </div>

                  <div className="rounded-lg bg-lv-panel/70 p-2 border border-lv-border">
                    <div className="text-[10px] text-lv-emerald font-bold">Only {labelC}</div>
                    <div className="text-sm font-bold text-lv-text">{onlyC3}</div>
                  </div>

                  <div className="rounded-lg bg-lv-panel/70 p-2 border border-lv-border">
                    <div className="text-[10px] text-lv-cyan font-bold">Only A ∩ B</div>
                    <div className="text-sm font-bold text-lv-text">{regionAB}</div>
                  </div>

                  <div className="rounded-lg bg-lv-panel/70 p-2 border border-lv-border">
                    <div className="text-[10px] text-lv-cyan font-bold">Only B ∩ C</div>
                    <div className="text-sm font-bold text-lv-text">{regionBC}</div>
                  </div>

                  <div className="rounded-lg bg-lv-panel/70 p-2 border border-lv-border">
                    <div className="text-[10px] text-lv-cyan font-bold">Only A ∩ C</div>
                    <div className="text-sm font-bold text-lv-text">{regionAC}</div>
                  </div>

                  <div className="rounded-lg bg-lv-panel/70 p-2 border border-lv-purple/40 bg-lv-purple/10">
                    <div className="text-[10px] text-lv-purple font-bold">All 3 (A ∩ B ∩ C)</div>
                    <div className="text-sm font-bold text-lv-purple">{centerABC}</div>
                  </div>

                  <div className="rounded-lg bg-lv-panel/70 p-2 border border-lv-border">
                    <div className="text-[10px] text-lv-faint font-bold">Neither (Complement)</div>
                    <div className="text-sm font-bold text-lv-text">{neither3}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Quantitative Answers */}
            <div className="rounded-xl border border-lv-success/30 bg-lv-success/5 p-3 space-y-1.5 pt-2">
              <div className="flex items-center gap-1 text-xs font-bold text-lv-success uppercase">
                <CheckCircle2 className="h-4 w-4" />
                Set Cardinality Results:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-xs text-lv-muted">
                <li>
                  Total elements belonging to at least one set: <strong className="text-lv-text">{numSets === 2 ? union2 : union3}</strong>
                </li>
                <li>
                  Elements belonging strictly to exactly one set:{" "}
                  <strong className="text-lv-text">
                    {numSets === 2 ? onlyA2 + onlyB2 : onlyA3 + onlyB3 + onlyC3}
                  </strong>
                </li>
                <li>
                  Elements outside all specified sets (in 𝒰 \ ∪): <strong className="text-lv-text">{numSets === 2 ? neither2 : neither3}</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
