"use client";

import { useState, useMemo } from "react";
import { Calculator, Sparkles, BookOpen, CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

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
    name: "Sports Survey (Cricket & Football)",
    type: "2-set",
    labelA: "Cricket",
    labelB: "Football",
    valA: 60,
    valB: 40,
    valAB: 25,
    universe: 100,
    story: "In a group of 100 students: 60 like Cricket, 40 like Football, and 25 like both games.",
  },
  {
    name: "Tech Skills (Python, Web, AI)",
    type: "3-set",
    labelA: "Python",
    labelB: "Web Dev",
    labelC: "AI/ML",
    valA: 50,
    valB: 45,
    valC: 40,
    valAB: 20,
    valBC: 18,
    valAC: 15,
    valABC: 10,
    universe: 100,
    story: "Out of 100 engineers: 50 know Python, 45 Web Dev, 40 AI/ML; overlaps are measured across all disciplines.",
  },
];

export function PieSolverView() {
  const [activePresetIdx, setActivePresetIdx] = useState<number>(0);
  const [numSets, setNumSets] = useState<2 | 3>(2);

  // 2-Set state
  const [labelA, setLabelA] = useState("Cricket");
  const [labelB, setLabelB] = useState("Football");
  const [valA, setValA] = useState(60);
  const [valB, setValB] = useState(40);
  const [valAB, setValAB] = useState(25);
  const [valU, setValU] = useState(100);

  // 3-Set additions
  const [labelC, setLabelC] = useState("AI/ML");
  const [valC, setValC] = useState(40);
  const [valBC, setValBC] = useState(18);
  const [valAC, setValAC] = useState(15);
  const [valABC, setValABC] = useState(10);

  function loadPreset(idx: number) {
    setActivePresetIdx(idx);
    const p = PRESETS[idx];
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
      setLabelC(p.labelC || "C");
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

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-lv-border bg-lv-surface/60 p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setNumSets(2)}
              className={cn(
                "rounded-md px-2.5 py-1 transition-colors",
                numSets === 2 ? "bg-lv-cyan/20 font-bold text-lv-cyan" : "text-lv-faint hover:text-lv-text"
              )}
            >
              2 Sets
            </button>
            <button
              type="button"
              onClick={() => setNumSets(3)}
              className={cn(
                "rounded-md px-2.5 py-1 transition-colors",
                numSets === 3 ? "bg-lv-cyan/20 font-bold text-lv-cyan" : "text-lv-faint hover:text-lv-text"
              )}
            >
              3 Sets
            </button>
          </div>

          <select
            value={activePresetIdx}
            onChange={(e) => loadPreset(Number(e.target.value))}
            className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted font-mono"
          >
            {PRESETS.map((p, idx) => (
              <option key={idx} value={idx}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Inputs Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-lv-border bg-lv-panel/70 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-lv-faint uppercase">
              <span>Given Cardinalities</span>
              <span>Universe |𝒰| = {valU}</span>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <label className="space-y-1">
                <span className="text-lv-blue font-bold">|{labelA}|</span>
                <input
                  type="number"
                  min={0}
                  value={valA}
                  onChange={(e) => setValA(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1.5 text-lv-text focus:border-lv-cyan focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-lv-purple font-bold">|{labelB}|</span>
                <input
                  type="number"
                  min={0}
                  value={valB}
                  onChange={(e) => setValB(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1.5 text-lv-text focus:border-lv-cyan focus:outline-none"
                />
              </label>

              {numSets === 3 && (
                <label className="space-y-1">
                  <span className="text-lv-cyan font-bold">|{labelC}|</span>
                  <input
                    type="number"
                    min={0}
                    value={valC}
                    onChange={(e) => setValC(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1.5 text-lv-text focus:border-lv-cyan focus:outline-none"
                  />
                </label>
              )}

              <label className="space-y-1">
                <span className="text-lv-muted font-bold">|{labelA} ∩ {labelB}|</span>
                <input
                  type="number"
                  min={0}
                  value={valAB}
                  onChange={(e) => setValAB(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1.5 text-lv-text focus:border-lv-cyan focus:outline-none"
                />
              </label>

              {numSets === 3 && (
                <>
                  <label className="space-y-1">
                    <span className="text-lv-muted font-bold">|{labelB} ∩ {labelC}|</span>
                    <input
                      type="number"
                      min={0}
                      value={valBC}
                      onChange={(e) => setValBC(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1.5 text-lv-text focus:border-lv-cyan focus:outline-none"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-lv-muted font-bold">|{labelA} ∩ {labelC}|</span>
                    <input
                      type="number"
                      min={0}
                      value={valAC}
                      onChange={(e) => setValAC(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1.5 text-lv-text focus:border-lv-cyan focus:outline-none"
                    />
                  </label>

                  <label className="space-y-1 col-span-2">
                    <span className="text-white font-bold">|{labelA} ∩ {labelB} ∩ {labelC}| (Center)</span>
                    <input
                      type="number"
                      min={0}
                      value={valABC}
                      onChange={(e) => setValABC(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-lg border border-lv-cyan/60 bg-lv-surface px-2.5 py-1.5 text-lv-cyan font-bold focus:border-lv-cyan focus:outline-none"
                    />
                  </label>
                </>
              )}

              <label className="space-y-1 col-span-2">
                <span className="text-lv-faint">Total Survey Sample Size (|𝒰|)</span>
                <input
                  type="number"
                  min={0}
                  value={valU}
                  onChange={(e) => setValU(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1.5 text-lv-text focus:border-lv-cyan focus:outline-none"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Solved Derivation & Region Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Formula Step-by-Step */}
          <div className="rounded-2xl border border-lv-cyan/40 bg-lv-cyan/10 p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-lv-cyan uppercase">
              <span>Principle of Inclusion-Exclusion Equation</span>
              <Sparkles className="h-4 w-4" />
            </div>

            {numSets === 2 ? (
              <div className="space-y-2 font-mono text-xs">
                <div className="text-lv-text font-bold text-sm">
                  |A ∪ B| = |A| + |B| − |A ∩ B|
                </div>
                <div className="text-lv-muted">
                  = {valA} + {valB} − {valAB}
                </div>
                <div className="text-lg font-bold text-lv-cyan">
                  = {union2}
                </div>
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                <div className="text-lv-text font-bold text-sm">
                  |A ∪ B ∪ C| = (|A| + |B| + |C|) − (|A∩B| + |B∩C| + |A∩C|) + |A∩B∩C|
                </div>
                <div className="text-lv-muted">
                  = ({valA} + {valB} + {valC}) − ({valAB} + {valBC} + {valAC}) + {valABC}
                </div>
                <div className="text-lv-muted">
                  = {sumSingles} − {sumPairs} + {valABC}
                </div>
                <div className="text-lg font-bold text-lv-cyan">
                  = {union3}
                </div>
              </div>
            )}
          </div>

          {/* Canonical Exam / Homework Answers Card */}
          <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-4 space-y-3 shadow-xl">
            <div className="text-xs font-mono font-bold text-lv-text uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-lv-success" />
              Direct Answers to Survey Questions
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="rounded-xl border border-lv-border bg-lv-panel/60 p-2.5">
                <div className="text-lv-faint text-[10px]">At least one activity</div>
                <div className="text-sm font-bold text-lv-text">
                  |{labelA} ∪ {labelB}{numSets === 3 ? ` ∪ ${labelC}` : ""}| ={" "}
                  <span className="text-lv-cyan">{numSets === 2 ? union2 : union3}</span>
                </div>
              </div>

              <div className="rounded-xl border border-lv-border bg-lv-panel/60 p-2.5">
                <div className="text-lv-faint text-[10px]">Neither activity</div>
                <div className="text-sm font-bold text-lv-text">
                  |𝒰| − Union ={" "}
                  <span className="text-lv-error">{numSets === 2 ? neither2 : neither3}</span>
                </div>
              </div>

              {numSets === 2 ? (
                <>
                  <div className="rounded-xl border border-lv-border bg-lv-panel/60 p-2.5">
                    <div className="text-lv-blue text-[10px]">Only {labelA}</div>
                    <div className="text-sm font-bold text-lv-text">
                      |A − B| = {valA} − {valAB} ={" "}
                      <span className="text-lv-blue">{onlyA2}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-lv-border bg-lv-panel/60 p-2.5">
                    <div className="text-lv-purple text-[10px]">Only {labelB}</div>
                    <div className="text-sm font-bold text-lv-text">
                      |B − A| = {valB} − {valAB} ={" "}
                      <span className="text-lv-purple">{onlyB2}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl border border-lv-border bg-lv-panel/60 p-2.5">
                    <div className="text-lv-blue text-[10px]">Strictly {labelA} only</div>
                    <div className="text-sm font-bold text-lv-blue">{onlyA3}</div>
                  </div>
                  <div className="rounded-xl border border-lv-border bg-lv-panel/60 p-2.5">
                    <div className="text-lv-purple text-[10px]">Strictly {labelB} only</div>
                    <div className="text-sm font-bold text-lv-purple">{onlyB3}</div>
                  </div>
                  <div className="rounded-xl border border-lv-border bg-lv-panel/60 p-2.5">
                    <div className="text-lv-cyan text-[10px]">Strictly {labelC} only</div>
                    <div className="text-sm font-bold text-lv-cyan">{onlyC3}</div>
                  </div>
                  <div className="rounded-xl border border-lv-border bg-lv-panel/60 p-2.5">
                    <div className="text-white text-[10px]">All Three Simultaneously</div>
                    <div className="text-sm font-bold text-white">{centerABC}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
