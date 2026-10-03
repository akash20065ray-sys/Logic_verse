"use client";

import { useState } from "react";
import {
  Sparkles,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Wand2,
  GitBranch,
  X,
  Code2,
  Layers,
  HelpCircle,
  Binary,
  Trash2,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { buildThompsonNfa, testRegexMatch, generatePumpingLemmaProof } from "@/lib/algorithms/regex";

export function RegexPalette() {
  const paletteOpen = useWorkspaceStore((s) => s.paletteOpen);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const regexSubMode = useWorkspaceStore((s) => s.regexSubMode);

  if (!paletteOpen) {
    return (
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-lv-border bg-lv-panel/90 px-3 py-2 text-xs font-medium text-lv-text shadow-xl backdrop-blur-xl hover:bg-lv-surface hover:border-lv-cyan transition-all font-mono"
        title="Open Regex Palette"
      >
        <Code2 className="w-3.5 h-3.5 text-lv-cyan" />
        <span>Palette ({regexSubMode})</span>
      </button>
    );
  }

  if (regexSubMode === "re-to-nfa") return <ReToNfaPalette />;
  if (regexSubMode === "pumping-lemma") return <PumpingLemmaPalette />;
  if (regexSubMode === "myhill-nerode") return <MyhillNerodePalette />;

  return <RegexBuilderPalette />;
}

// ----------------------------------------------------------------------
// 1. REGEX BUILDER PALETTE
// ----------------------------------------------------------------------
function RegexBuilderPalette() {
  const regexPattern = useWorkspaceStore((s) => s.regexPattern);
  const setRegexPattern = useWorkspaceStore((s) => s.setRegexPattern);
  const regexTestString = useWorkspaceStore((s) => s.regexTestString);
  const setRegexTestString = useWorkspaceStore((s) => s.setRegexTestString);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);
  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);

  const matchTrace = testRegexMatch(regexPattern, regexTestString);

  function insertOperator(op: string) {
    setRegexPattern(regexPattern + op);
  }

  function handleBuildNfaOnCanvas() {
    const thompson = buildThompsonNfa(regexPattern);
    recomputeGraph(thompson.nodes, thompson.edges);
    setOutputTab("regex-nfa");
  }

  const presets = [
    { label: "a(b|c)*", pattern: "a(b|c)*" },
    { label: "(0|1)*10", pattern: "(0|1)*10" },
    { label: "a*b*c*", pattern: "a*b*c*" },
    { label: "(ab)+", pattern: "(ab)+" },
    { label: "0(0|1)*0", pattern: "0(0|1)*0" },
  ];

  return (
    <PaletteContainer title="Regex Builder Palette" onClose={() => setPaletteOpen(false)}>
      {/* Pattern Input & Quick Operators */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-lv-faint uppercase tracking-wider block">
          Regular Expression Pattern R:
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={regexPattern}
            onChange={(e) => setRegexPattern(e.target.value)}
            className="flex-1 rounded-xl border border-lv-cyan/40 bg-lv-surface px-3 py-1.5 text-xs font-mono font-bold text-lv-cyan focus:border-lv-cyan focus:outline-none shadow-inner"
            placeholder="e.g. a(b|c)*"
          />
          <button
            type="button"
            onClick={handleBuildNfaOnCanvas}
            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-lv-cyan to-blue-600 px-3 py-1.5 font-bold text-slate-950 text-xs shadow-md hover:opacity-90 transition-all shrink-0"
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>NFA Graph</span>
          </button>
        </div>

        {/* Quick Operator Insertion Buttons */}
        <div className="flex flex-wrap items-center gap-1 pt-1">
          <OpBtn label="Star (*)" onClick={() => insertOperator("*")} />
          <OpBtn label="Plus (+)" onClick={() => insertOperator("+")} />
          <OpBtn label="Union (|)" onClick={() => insertOperator("|")} />
          <OpBtn label="Concat (·)" onClick={() => insertOperator("")} />
          <OpBtn label="Group ()" onClick={() => insertOperator("()")} />
          <OpBtn label="Epsilon (ε)" onClick={() => insertOperator("ε")} />
        </div>
      </div>

      {/* Preset Chips */}
      <div className="space-y-1 pt-1">
        <span className="text-[10px] text-lv-faint font-mono">Preset Expressions:</span>
        <div className="flex flex-wrap items-center gap-1">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setRegexPattern(p.pattern)}
              className="rounded-lg bg-lv-surface/80 border border-lv-border px-2 py-0.5 text-[11px] font-mono text-lv-muted hover:text-lv-cyan hover:border-lv-cyan/40 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Test String Validator */}
      <div className="border-t border-lv-border-soft pt-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-lv-faint uppercase tracking-wider">
            Test String Simulation (w):
          </label>
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
              matchTrace.isMatch
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
            }`}
          >
            {matchTrace.isMatch ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {matchTrace.isMatch ? "Accepted w ∈ L(R)" : "Rejected w ∉ L(R)"}
          </span>
        </div>

        <input
          type="text"
          value={regexTestString}
          onChange={(e) => setRegexTestString(e.target.value)}
          className="w-full rounded-xl border border-lv-border bg-lv-surface px-3 py-1.5 text-xs font-mono font-bold text-lv-text focus:border-lv-cyan focus:outline-none"
          placeholder="e.g. abbc"
        />
      </div>
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// 2. RE -> NFA PALETTE (Thompson's Construction)
// ----------------------------------------------------------------------
function ReToNfaPalette() {
  const regexPattern = useWorkspaceStore((s) => s.regexPattern);
  const setRegexPattern = useWorkspaceStore((s) => s.setRegexPattern);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);
  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);

  function handleConvert() {
    const thompson = buildThompsonNfa(regexPattern);
    recomputeGraph(thompson.nodes, thompson.edges);
    setOutputTab("regex-nfa");
  }

  return (
    <PaletteContainer title="RE ➔ NFA (Thompson's Construction)" onClose={() => setPaletteOpen(false)}>
      <p className="text-[11px] text-lv-muted leading-relaxed">
        Converts any regular expression into an equivalent ε-NFA with 1 start state and 1 accept state.
      </p>

      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={regexPattern}
          onChange={(e) => setRegexPattern(e.target.value)}
          className="flex-1 rounded-xl border border-lv-purple/40 bg-lv-surface px-3 py-1.5 text-xs font-mono font-bold text-lv-purple focus:outline-none"
          placeholder="e.g. (a|b)*abb"
        />
        <button
          type="button"
          onClick={handleConvert}
          className="flex items-center gap-1 rounded-xl bg-lv-purple text-white px-3 py-1.5 text-xs font-bold shadow-md hover:bg-lv-purple/90 transition-colors shrink-0"
        >
          <GitBranch className="w-3.5 h-3.5" />
          Build Graph
        </button>
      </div>

      <div className="rounded-xl border border-lv-purple/30 bg-lv-purple/10 p-2.5 text-[11px] font-mono text-lv-purple space-y-1">
        <div className="font-bold flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          Thompson Rules Applied:
        </div>
        <div>1. Base cases: a ➔ (q₀ ──a──➔ q₁)</div>
        <div>2. Union (R₁|R₂): Parallel branches with ε splits & joins</div>
        <div>3. Kleene Star (R*): Loopback ε edge + zero-bypass edge</div>
      </div>
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// 3. PUMPING LEMMA PALETTE
// ----------------------------------------------------------------------
function PumpingLemmaPalette() {
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);

  const [targetLang, setTargetLang] = useState<"anbn" | "wwR" | "0n1n">("anbn");
  const [p, setP] = useState(3);
  const [i, setI] = useState(2);

  const proof = generatePumpingLemmaProof(targetLang, p, i);

  return (
    <PaletteContainer title="Pumping Lemma Proof Visualizer" onClose={() => setPaletteOpen(false)}>
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-lv-faint uppercase tracking-wider block">
          Target Non-Regular Language:
        </label>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTargetLang("anbn")}
            className={`flex-1 rounded-xl py-1.5 text-xs font-mono font-bold border transition-colors ${
              targetLang === "anbn"
                ? "bg-lv-cyan/20 text-lv-cyan border-lv-cyan/50"
                : "bg-lv-surface text-lv-muted border-lv-border"
            }`}
          >
            L = aⁿbⁿ
          </button>
          <button
            type="button"
            onClick={() => setTargetLang("wwR")}
            className={`flex-1 rounded-xl py-1.5 text-xs font-mono font-bold border transition-colors ${
              targetLang === "wwR"
                ? "bg-lv-purple/20 text-lv-purple border-lv-purple/50"
                : "bg-lv-surface text-lv-muted border-lv-border"
            }`}
          >
            L = wwᴿ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div>
          <span className="text-lv-faint">Pumping Length p: {p}</span>
          <input
            type="range"
            min={2}
            max={6}
            value={p}
            onChange={(e) => setP(Number(e.target.value))}
            className="w-full accent-lv-cyan"
          />
        </div>
        <div>
          <span className="text-lv-faint">Pump Exponent i: {i}</span>
          <input
            type="range"
            min={0}
            max={5}
            value={i}
            onChange={(e) => setI(Number(e.target.value))}
            className="w-full accent-lv-purple"
          />
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] font-mono text-amber-300 space-y-1">
        <div className="font-bold flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          Pumped String Result:
        </div>
        <div className="text-xs font-bold text-white tracking-widest break-all">
          s' = xy^{i}z = "{proof.pumpedString}"
        </div>
        <div className="text-[10px] opacity-90">
          {proof.isContradiction
            ? "❌ s' ∉ L ⟹ Contradiction! Language is NOT regular."
            : "✔️ String remains in language for this choice."}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOutputTab("pumping-lemma-tab")}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/30 transition-colors"
      >
        View Full Formal Proof
      </button>
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// 4. MYHILL-NERODE PALETTE
// ----------------------------------------------------------------------
function MyhillNerodePalette() {
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);

  return (
    <PaletteContainer title="Myhill–Nerode Theorem Analyzer" onClose={() => setPaletteOpen(false)}>
      <p className="text-[11px] text-lv-muted leading-relaxed">
        Analyzes the index of right-congruence relation ~L and estimates minimal DFA equivalence classes.
      </p>

      <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-2.5 text-[11px] font-mono text-sky-300 space-y-1">
        <div className="font-bold flex items-center gap-1">
          <Binary className="w-3.5 h-3.5" />
          Equivalence Classes Index:
        </div>
        <div>• Regular Language ⟺ Finite Equivalence Classes</div>
        <div>• Equivalence Classes = Minimal DFA State Count</div>
      </div>

      <button
        type="button"
        onClick={() => setOutputTab("myhill-nerode-tab")}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-sky-500/20 border border-sky-500/40 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/30 transition-colors"
      >
        View Distinguishability Matrix
      </button>
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// HELPER CONTAINER & BUTTONS
// ----------------------------------------------------------------------
function PaletteContainer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const clearCanvas = useWorkspaceStore((s) => s.clearCanvas);

  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2.5 rounded-2xl border border-lv-border/90 bg-lv-panel/95 p-3.5 shadow-2xl backdrop-blur-xl font-mono text-xs w-[360px] sm:w-[450px]">
      <div className="flex items-center justify-between border-b border-lv-border-soft pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-lv-cyan/15 text-lv-cyan">
            <Code2 className="h-3.5 w-3.5" />
          </span>
          <span className="font-bold text-lv-text text-xs uppercase tracking-wider">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center gap-1 rounded-lg bg-lv-surface px-2 py-1 text-[11px] font-semibold text-lv-faint hover:text-lv-error hover:bg-lv-surface/90 transition-colors border border-lv-border-soft"
            title="Clear Canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-lv-faint hover:text-lv-text hover:bg-lv-surface transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

function OpBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-lv-surface px-2 py-1 text-[11px] font-mono font-bold text-lv-cyan border border-lv-border hover:bg-lv-cyan/15 hover:border-lv-cyan/40 transition-colors"
    >
      {label}
    </button>
  );
}
