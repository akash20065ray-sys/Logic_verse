"use client";

import { useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import {
  generateAnBnPdaGraph,
  simulatePda,
  type PdaDefinition,
} from "@/lib/algorithms/pda";

export function PdaPalette() {
  const paletteOpen = useWorkspaceStore((s) => s.paletteOpen);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const pdaSubMode = useWorkspaceStore((s) => s.pdaSubMode);
  const nodes = useWorkspaceStore((s) => s.nodes);

  if (!paletteOpen) {
    return (
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-lv-border bg-lv-panel/90 px-3 py-2 text-xs font-medium text-lv-text shadow-xl backdrop-blur-xl hover:bg-lv-surface hover:border-sky-500 transition-all font-mono"
        title="Open PDA Palette"
      >
        <Layers className="w-3.5 h-3.5 text-sky-400" />
        <span>PDA Palette ({pdaSubMode})</span>
        <span className="rounded-full bg-lv-surface px-1.5 py-0.5 font-mono text-[10px] text-lv-muted">
          {nodes.length}
        </span>
      </button>
    );
  }

  return <PdaBuilderPalette />;
}

function PdaBuilderPalette() {
  const nodes = useWorkspaceStore((s) => s.nodes);
  const edges = useWorkspaceStore((s) => s.edges);
  const addNode = useWorkspaceStore((s) => s.addNode);
  const setEdges = useWorkspaceStore((s) => s.setEdges);
  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);

  const pdaInputString = useWorkspaceStore((s) => s.pdaInputString);
  const setPdaInputString = useWorkspaceStore((s) => s.setPdaInputString);

  // Quick transition input state
  const [fromState, setFromState] = useState("q0");
  const [toState, setToState] = useState("q0");
  const [inputSym, setInputSym] = useState("a");
  const [popSym, setPopSym] = useState("Z0");
  const [pushSym, setPushSym] = useState("A Z0");

  // Construct active PDA definition from canvas graph or default
  const activePda: PdaDefinition = {
    states: nodes.map((n) => n.id),
    inputAlphabet: ["a", "b"],
    stackAlphabet: ["Z0", "A", "B"],
    startState: nodes.find((n) => n.data?.isStart)?.id || nodes[0]?.id || "q0",
    initialStackSymbol: "Z0",
    acceptStates: nodes.filter((n) => n.data?.isAccept).map((n) => n.id),
    transitions: edges.map((e, idx) => {
      const raw = (e.label as string) || "a, Z0 / A Z0";
      const parts = raw.split("/");
      const left = (parts[0] || "").split(",");
      const inp = (left[0] || "a").trim();
      const pop = (left[1] || "Z0").trim();
      const push = (parts[1] || "").trim().split(/\s+/).filter(Boolean);

      return {
        id: e.id || `t-${idx}`,
        fromState: e.source,
        toState: e.target,
        inputSymbol: inp,
        popSymbol: pop,
        pushSymbols: push,
        rawLabel: raw,
      };
    }),
  };

  const simulation = simulatePda(activePda, pdaInputString);

  function handleAddStateNode() {
    const nextIdx = nodes.length;
    const stateId = `q${nextIdx}`;
    const newNode = {
      id: stateId,
      type: "automata-state",
      position: { x: 120 + (nextIdx % 4) * 140, y: 150 + Math.floor(nextIdx / 4) * 120 },
      data: {
        label: `q${nextIdx}`,
        isStart: nextIdx === 0,
        isAccept: false,
      },
    };
    addNode(newNode);
    if (nodes.length === 0) {
      setFromState(stateId);
      setToState(stateId);
    }
  }

  function handleAddTransition() {
    if (!fromState || !toState) return;
    const rawLabel = `${inputSym}, ${popSym} / ${pushSym}`;
    const isSelfLoop = fromState === toState;
    const newEdge = {
      id: `e-${fromState}-${toState}-${Date.now()}`,
      source: fromState,
      target: toState,
      label: rawLabel,
      animated: true,
      type: isSelfLoop ? "smoothstep" : "default",
      style: { stroke: "#38BDF8", strokeWidth: 2 },
    };
    setEdges([...edges, newEdge]);
  }

  function handleLoadAnBnPreset() {
    const preset = generateAnBnPdaGraph();
    recomputeGraph(preset.nodes, preset.edges);
    setPdaInputString("aabb");
    setOutputTab("pda-stack-tab");
  }

  return (
    <PaletteContainer title="PDA & Stack Builder" onClose={() => setPaletteOpen(false)}>
      {/* Node Creation & Preset Buttons */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-lv-faint uppercase tracking-wider block">
          1. Canvas Automata Builder
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddStateNode}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-sky-500/20 border border-sky-500/40 py-2 text-xs font-bold text-sky-400 hover:bg-sky-500/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add State (q{nodes.length})</span>
          </button>
          <button
            type="button"
            onClick={handleLoadAnBnPreset}
            className="flex items-center gap-1 rounded-xl bg-purple-500/20 border border-purple-500/40 px-3 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/30 transition-colors shrink-0"
            title="Load L = { aⁿ bⁿ | n ≥ 1 } preset"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load aⁿbⁿ Preset</span>
          </button>
        </div>
      </div>

      {/* Transition Builder Form */}
      <div className="border-t border-lv-border-soft pt-2 space-y-2">
        <label className="text-[11px] font-bold text-lv-faint uppercase tracking-wider block">
          2. Add Stack Transition δ(q, a, X) ➔ (p, γ)
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <span className="text-[10px] text-lv-faint">From State</span>
            <select
              value={fromState}
              onChange={(e) => setFromState(e.target.value)}
              className="w-full rounded-lg border border-lv-border bg-lv-surface p-1.5 text-xs text-lv-text font-bold"
            >
              {nodes.length === 0 && <option value="q0">q0</option>}
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {(n.data?.label as string) || n.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="text-[10px] text-lv-faint">To State</span>
            <select
              value={toState}
              onChange={(e) => setToState(e.target.value)}
              className="w-full rounded-lg border border-lv-border bg-lv-surface p-1.5 text-xs text-lv-text font-bold"
            >
              {nodes.length === 0 && <option value="q0">q0</option>}
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {(n.data?.label as string) || n.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
          <div>
            <span className="text-[10px] text-lv-faint">Input a</span>
            <input
              type="text"
              value={inputSym}
              onChange={(e) => setInputSym(e.target.value)}
              className="w-full rounded-lg border border-lv-border bg-lv-surface px-2 py-1 text-xs text-sky-300 font-bold"
              placeholder="a / ε"
            />
          </div>
          <div>
            <span className="text-[10px] text-lv-faint">Pop X</span>
            <input
              type="text"
              value={popSym}
              onChange={(e) => setPopSym(e.target.value)}
              className="w-full rounded-lg border border-lv-border bg-lv-surface px-2 py-1 text-xs text-sky-300 font-bold"
              placeholder="Z0 / A"
            />
          </div>
          <div>
            <span className="text-[10px] text-lv-faint">Push γ</span>
            <input
              type="text"
              value={pushSym}
              onChange={(e) => setPushSym(e.target.value)}
              className="w-full rounded-lg border border-lv-border bg-lv-surface px-2 py-1 text-xs text-sky-300 font-bold"
              placeholder="A Z0 / ε"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddTransition}
          disabled={nodes.length === 0}
          className="w-full flex items-center justify-center gap-1 rounded-xl bg-lv-surface border border-sky-500/40 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 disabled:opacity-40 transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>Add Edge Label: {inputSym}, {popSym} / {pushSym}</span>
        </button>
      </div>

      {/* String Execution Simulator */}
      <div className="border-t border-lv-border-soft pt-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-lv-faint uppercase tracking-wider">
            3. Test Input String w:
          </label>
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
              simulation.isAcceptedFinalState || simulation.isAcceptedEmptyStack
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
            }`}
          >
            {simulation.isAcceptedFinalState || simulation.isAcceptedEmptyStack ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {simulation.isAcceptedFinalState
              ? "Accepted (Final State)"
              : simulation.isAcceptedEmptyStack
              ? "Accepted (Empty Stack)"
              : "Rejected"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={pdaInputString}
            onChange={(e) => setPdaInputString(e.target.value)}
            className="flex-1 rounded-xl border border-lv-border bg-lv-surface px-3 py-1.5 text-xs font-mono font-bold text-lv-text focus:border-sky-400 focus:outline-none"
            placeholder="e.g. aabb"
          />
          <button
            type="button"
            onClick={() => setOutputTab("pda-stack-tab")}
            className="flex items-center gap-1 rounded-xl bg-sky-600 text-white px-3 py-1.5 text-xs font-bold shadow-md hover:bg-sky-500 transition-colors shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate Stack</span>
          </button>
        </div>
      </div>
    </PaletteContainer>
  );
}

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
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300">
            <Layers className="h-3.5 w-3.5" />
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
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-lv-faint hover:text-lv-text hover:bg-lv-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
