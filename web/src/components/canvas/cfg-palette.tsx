"use client";

import { useState } from "react";
import {
  Code2,
  GitBranch,
  Table,
  Layers,
  Plus,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Play,
  Sigma,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { parseGrammarText, buildParseTreeGraph, runCykParser } from "@/lib/algorithms/cfg";

export function CfgPalette() {
  const paletteOpen = useWorkspaceStore((s) => s.paletteOpen);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const cfgSubMode = useWorkspaceStore((s) => s.cfgSubMode);
  const nodes = useWorkspaceStore((s) => s.nodes);

  if (!paletteOpen) {
    return (
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-lv-border bg-lv-panel/90 px-3 py-2 text-xs font-medium text-lv-text shadow-xl backdrop-blur-xl hover:bg-lv-surface hover:border-purple-500 transition-all font-mono"
        title="Open CFG Palette"
      >
        <Code2 className="w-3.5 h-3.5 text-purple-400" />
        <span>Palette ({cfgSubMode})</span>
        <span className="rounded-full bg-lv-surface px-1.5 py-0.5 font-mono text-[10px] text-lv-muted">
          {nodes.length}
        </span>
      </button>
    );
  }

  if (cfgSubMode === "parse-tree") return <ParseTreePalette />;
  if (cfgSubMode === "cnf-gnf") return <CnfPalette />;
  if (cfgSubMode === "cyk") return <CykPalette />;

  return <GrammarBuilderPalette />;
}

// ----------------------------------------------------------------------
// 1. GRAMMAR BUILDER PALETTE
// ----------------------------------------------------------------------
function GrammarBuilderPalette() {
  const cfgRawRules = useWorkspaceStore((s) => s.cfgRawRules);
  const setCfgRawRules = useWorkspaceStore((s) => s.setCfgRawRules);
  const cfgInputString = useWorkspaceStore((s) => s.cfgInputString);
  const setCfgInputString = useWorkspaceStore((s) => s.setCfgInputString);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);
  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);

  const grammar = parseGrammarText(cfgRawRules);
  const cykRes = runCykParser(cfgRawRules, cfgInputString);

  function insertSymbol(sym: string) {
    setCfgRawRules(cfgRawRules + sym);
  }

  function handleBuildParseTreeCanvas() {
    const treeG = buildParseTreeGraph(grammar, cfgInputString);
    recomputeGraph(treeG.nodes, treeG.edges);
    setOutputTab("cfg-parse-tree");
  }

  const presets = [
    {
      label: "aⁿbⁿ Language",
      rules: "S -> a S b | ε",
    },
    {
      label: "Even Palindromes",
      rules: "S -> a S a | b S b | ε",
    },
    {
      label: "Arithmetic Expr",
      rules: "E -> E + T | T\nT -> T * F | F\nF -> ( E ) | a",
    },
    {
      label: "Balanced Parens ()",
      rules: "S -> ( S ) S | ε",
    },
  ];

  return (
    <PaletteContainer title="CFG Grammar Builder" onClose={() => setPaletteOpen(false)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-lv-faint uppercase tracking-wider block">
            Production Rules R (V ➔ (V ∪ Σ)*):
          </label>
          <span className="text-[10px] font-mono text-purple-300">
            {grammar.variables.length} Vars, {grammar.terminals.length} Terms
          </span>
        </div>

        <textarea
          rows={3}
          value={cfgRawRules}
          onChange={(e) => setCfgRawRules(e.target.value)}
          className="w-full rounded-xl border border-purple-500/40 bg-lv-surface p-2.5 text-xs font-mono font-bold text-purple-300 focus:border-purple-400 focus:outline-none"
          placeholder="S -> A B | a&#10;A -> a S | a&#10;B -> b"
        />

        {/* Quick Symbol Insertion Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <OpBtn label="S" onClick={() => insertSymbol("S")} />
          <OpBtn label="A" onClick={() => insertSymbol("A")} />
          <OpBtn label="B" onClick={() => insertSymbol("B")} />
          <OpBtn label="➔" onClick={() => insertSymbol(" -> ")} />
          <OpBtn label="|" onClick={() => insertSymbol(" | ")} />
          <OpBtn label="ε" onClick={() => insertSymbol("ε")} />
        </div>
      </div>

      {/* Preset Grammars */}
      <div className="space-y-1 pt-1 border-t border-lv-border-soft">
        <span className="text-[10px] text-lv-faint font-mono">Preset Grammars:</span>
        <div className="flex flex-wrap items-center gap-1">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setCfgRawRules(p.rules)}
              className="rounded-lg bg-lv-surface border border-lv-border px-2 py-0.5 text-[11px] font-mono text-lv-muted hover:text-purple-300 hover:border-purple-400 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input String CYK Tester */}
      <div className="border-t border-lv-border-soft pt-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-lv-faint uppercase tracking-wider">
            Test String w (CYK Parser):
          </label>
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
              cykRes.isAccepted
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
            }`}
          >
            {cykRes.isAccepted ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {cykRes.isAccepted ? "w ∈ L(G)" : "w ∉ L(G)"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={cfgInputString}
            onChange={(e) => setCfgInputString(e.target.value)}
            className="flex-1 rounded-xl border border-lv-border bg-lv-surface px-3 py-1.5 text-xs font-mono font-bold text-lv-text focus:border-purple-400 focus:outline-none"
            placeholder="e.g. aab"
          />
          <button
            type="button"
            onClick={handleBuildParseTreeCanvas}
            className="flex items-center gap-1 rounded-xl bg-purple-600 text-white px-3 py-1.5 text-xs font-bold shadow-md hover:bg-purple-500 transition-colors shrink-0"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Parse Tree</span>
          </button>
        </div>
      </div>
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// 2. PARSE TREE PALETTE
// ----------------------------------------------------------------------
function ParseTreePalette() {
  const cfgRawRules = useWorkspaceStore((s) => s.cfgRawRules);
  const cfgInputString = useWorkspaceStore((s) => s.cfgInputString);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);
  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);

  function handleBuildTree() {
    const grammar = parseGrammarText(cfgRawRules);
    const treeG = buildParseTreeGraph(grammar, cfgInputString);
    recomputeGraph(treeG.nodes, treeG.edges);
    setOutputTab("cfg-parse-tree");
  }

  return (
    <PaletteContainer title="Parse Tree & Derivation Visualizer" onClose={() => setPaletteOpen(false)}>
      <p className="text-[11px] text-lv-muted leading-relaxed">
        Generates hierarchical syntax derivation trees from start symbol S down to terminal leaves.
      </p>

      <button
        type="button"
        onClick={handleBuildTree}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/30 transition-colors"
      >
        <GitBranch className="w-3.5 h-3.5" />
        Render Parse Tree Canvas Graph
      </button>
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// 3. CNF / GNF CONVERSION PALETTE
// ----------------------------------------------------------------------
function CnfPalette() {
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);

  return (
    <PaletteContainer title="Chomsky Normal Form (CNF) Reduction" onClose={() => setPaletteOpen(false)}>
      <p className="text-[11px] text-lv-muted leading-relaxed">
        Reduces CFG productions into CNF (A ➔ BC or A ➔ a) via 4 canonical reduction steps.
      </p>

      <button
        type="button"
        onClick={() => setOutputTab("cfg-cnf-tab")}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-sky-500/20 border border-sky-500/40 py-2 text-xs font-bold text-sky-400 hover:bg-sky-500/30 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        View Step-by-Step CNF Conversion Trace
      </button>
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// 4. CYK ALGORITHM PALETTE
// ----------------------------------------------------------------------
function CykPalette() {
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);

  return (
    <PaletteContainer title="CYK Parsing Dynamic Programming Table" onClose={() => setPaletteOpen(false)}>
      <p className="text-[11px] text-lv-muted leading-relaxed">
        Dynamic programming triangular matrix testing membership w ∈ L(G) in O(n³·|G|) time.
      </p>

      <button
        type="button"
        onClick={() => setOutputTab("cfg-cyk-tab")}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 transition-colors"
      >
        <Table className="w-3.5 h-3.5" />
        View Triangular CYK Parsing Table
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
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2.5 rounded-2xl border border-lv-border/90 bg-lv-panel/95 p-3.5 shadow-2xl backdrop-blur-xl font-mono text-xs w-[360px] sm:w-[440px]">
      <div className="flex items-center justify-between border-b border-lv-border-soft pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
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
      className="rounded-lg bg-lv-surface px-2 py-1 text-[11px] font-mono font-bold text-purple-300 border border-lv-border hover:bg-purple-500/15 hover:border-purple-400 transition-colors"
    >
      {label}
    </button>
  );
}
