"use client";

/**
 * AutomataPalette: Dedicated Component Palettes for Theory of Computation.
 * Renders distinct palettes for DFA, NFA, ε-NFA, Moore (State Output Y = λ(q)), and Mealy (Edge Output a/y).
 */
import { useState } from "react";
import {
  Plus,
  Play,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sparkles,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Wand2,
  Cpu,
  GitMerge,
  Settings2,
  X,
  AlertCircle,
  Repeat,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import {
  parseCanvasToAutomaton,
  checkDfaCompleteness,
  generateAutomatonFromPrompt,
} from "@/lib/algorithms/automata";

export function AutomataPalette() {
  const paletteOpen = useWorkspaceStore((s) => s.paletteOpen);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const automataSubMode = useWorkspaceStore((s) => s.automataSubMode);
  const nodes = useWorkspaceStore((s) => s.nodes);

  if (!paletteOpen) {
    return (
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-lv-border bg-lv-panel/90 px-3 py-2 text-xs font-medium text-lv-text shadow-xl backdrop-blur-xl hover:bg-lv-surface hover:border-lv-cyan transition-all font-mono"
        title="Open Automata Palette"
      >
        <Cpu className="w-3.5 h-3.5 text-lv-cyan" />
        <span>Palette ({automataSubMode})</span>
        <span className="rounded-full bg-lv-surface px-1.5 py-0.5 font-mono text-[10px] text-lv-muted">
          {nodes.length}
        </span>
      </button>
    );
  }

  // Render the exact dedicated palette for the selected subsection
  if (automataSubMode === "NFA") return <NfaPalette />;
  if (automataSubMode === "E-NFA") return <EpsilonNfaPalette />;
  if (automataSubMode === "Moore") return <MoorePalette />;
  if (automataSubMode === "Mealy") return <MealyPalette />;

  // Default: DFA Palette
  return <DfaPalette />;
}

// ----------------------------------------------------------------------
// 1. DFA PALETTE (Deterministic Finite Automaton)
// ----------------------------------------------------------------------
function DfaPalette() {
  const nodes = useWorkspaceStore((s) => s.nodes);
  const edges = useWorkspaceStore((s) => s.edges);
  const addNode = useWorkspaceStore((s) => s.addNode);
  const setEdges = useWorkspaceStore((s) => s.setEdges);
  const selectedNodeId = useWorkspaceStore((s) => s.selectedNodeId);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);
  const clearCanvas = useWorkspaceStore((s) => s.clearCanvas);

  const [promptInput, setPromptInput] = useState("");
  const automaton = parseCanvasToAutomaton(nodes, edges);
  const dfaCheck = checkDfaCompleteness(automaton);

  function handleCreateState(kind: "start" | "normal" | "final") {
    const count = nodes.filter((n) => n.type === "automata-state").length;
    const isStart = kind === "start" || (count === 0 && !nodes.some((n) => n.data?.isStart));
    const isAccept = kind === "final";
    const label = `q${count}`;

    addNode({
      id: `q-${Date.now()}`,
      type: "automata-state",
      position: { x: 120 + (count % 4) * 170, y: 140 + Math.floor(count / 4) * 130 },
      data: { label, isStart, isAccept, kind: "state" },
    });
  }

  function handleAddTransition(isSelfLoop: boolean = false, isMulti: boolean = false) {
    if (nodes.length === 0) return;
    const sourceId = selectedNodeId || nodes[0].id;
    const targetId = isSelfLoop ? sourceId : nodes.length > 1 ? nodes[1].id : sourceId;

    const defaultSym = isMulti ? "0, 1" : "0";
    const promptMsg = isSelfLoop
      ? `Enter Self-Loop Symbol for state (e.g. 0, 1):`
      : isMulti
      ? `Enter Multi-Symbols separated by commas (e.g. 0, 1):`
      : `Enter Transition Symbol (e.g. 0, 1):`;

    const sym = prompt(promptMsg, defaultSym) || "0";

    const newEdge = {
      id: `e-${sourceId}-${targetId}-${Date.now()}`,
      source: sourceId,
      target: targetId,
      animated: true,
      type: sourceId === targetId ? "smoothstep" : "default",
      label: sym.trim(),
      data: { symbol: sym.trim() },
      style: { stroke: "#38BDF8", strokeWidth: 2 },
    };

    setEdges([...edges, newEdge]);
  }

  function handleGenerateFromPrompt(e: React.FormEvent) {
    e.preventDefault();
    if (!promptInput.trim()) return;
    const res = generateAutomatonFromPrompt(promptInput);
    recomputeGraph(res.nodes, res.edges);
    setPromptInput("");
  }

  return (
    <PaletteContainer title="DFA Machine Palette" stateCount={nodes.length} onClose={() => setPaletteOpen(false)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <StateBtn label="Start (q₀)" onClick={() => handleCreateState("start")} color="cyan" icon={ArrowRight} />
        <StateBtn label="State (qₙ)" onClick={() => handleCreateState("normal")} color="surface" icon={Plus} />
        <StateBtn label="Final (q𝐹)" onClick={() => handleCreateState("final")} color="purple" icon={CheckCircle2} />
        <ActionBtn label="Transition" onClick={() => handleAddTransition(false, false)} />
        <ActionBtn label="Self-Loop ↺" onClick={() => handleAddTransition(true, false)} />
        <ActionBtn label="Multi-Symbol (0,1)" onClick={() => handleAddTransition(false, true)} />
      </div>

      {/* DFA Completeness Checker Warning */}
      {nodes.length > 0 && (
        <div className={`flex items-center justify-between p-2 rounded-xl border text-[11px] font-mono ${
          dfaCheck.isComplete
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
        }`}>
          <div className="flex items-center gap-1.5 truncate">
            {dfaCheck.isComplete ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
            <span className="truncate">
              {dfaCheck.isComplete
                ? "DFA Complete (∀ state has rules for Σ={0,1})"
                : `Missing ${dfaCheck.missingTransitions.length} rules (e.g. ${dfaCheck.missingTransitions[0]?.stateLabel} for '${dfaCheck.missingTransitions[0]?.symbol}')`}
            </span>
          </div>
        </div>
      )}

      <PromptForm input={promptInput} setInput={setPromptInput} onSubmit={handleGenerateFromPrompt} placeholder="DFA Question (e.g. 'DFA ending with 01')" />

      <div className="flex items-center justify-between border-t border-lv-border-soft pt-2">
        <button
          type="button"
          onClick={() => setOutputTab("minimization")}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 transition-colors"
        >
          <GitMerge className="h-3.5 w-3.5" />
          Minimize DFA (Hopcroft Algorithm)
        </button>
        <ClearBtn onClick={clearCanvas} />
      </div>

      <SimulationFooter />
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// 2. NFA PALETTE (Nondeterministic Finite Automaton)
// ----------------------------------------------------------------------
function NfaPalette() {
  const nodes = useWorkspaceStore((s) => s.nodes);
  const edges = useWorkspaceStore((s) => s.edges);
  const addNode = useWorkspaceStore((s) => s.addNode);
  const setEdges = useWorkspaceStore((s) => s.setEdges);
  const selectedNodeId = useWorkspaceStore((s) => s.selectedNodeId);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);
  const clearCanvas = useWorkspaceStore((s) => s.clearCanvas);

  const [promptInput, setPromptInput] = useState("");

  function handleCreateState(kind: "start" | "normal" | "final") {
    const count = nodes.filter((n) => n.type === "automata-state").length;
    const isStart = kind === "start" || (count === 0 && !nodes.some((n) => n.data?.isStart));
    const isAccept = kind === "final";
    const label = `q${count}`;

    addNode({
      id: `q-${Date.now()}`,
      type: "automata-state",
      position: { x: 120 + (count % 4) * 170, y: 140 + Math.floor(count / 4) * 130 },
      data: { label, isStart, isAccept, kind: "state" },
    });
  }

  function handleAddTransition(isSelfLoop: boolean = false) {
    if (nodes.length === 0) return;
    const sourceId = selectedNodeId || nodes[0].id;
    const targetId = isSelfLoop ? sourceId : nodes.length > 1 ? nodes[1].id : sourceId;
    const sym = prompt(isSelfLoop ? "NFA Self-Loop Symbol:" : "NFA Transition Symbol:", "0") || "0";

    setEdges([
      ...edges,
      {
        id: `e-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        target: targetId,
        animated: true,
        type: sourceId === targetId ? "smoothstep" : "default",
        label: sym.trim(),
        data: { symbol: sym.trim() },
        style: { stroke: "#38BDF8", strokeWidth: 2 },
      },
    ]);
  }

  function handleGenerateFromPrompt(e: React.FormEvent) {
    e.preventDefault();
    if (!promptInput.trim()) return;
    const res = generateAutomatonFromPrompt(promptInput);
    recomputeGraph(res.nodes, res.edges);
    setPromptInput("");
  }

  return (
    <PaletteContainer title="NFA Machine Palette" stateCount={nodes.length} onClose={() => setPaletteOpen(false)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <StateBtn label="Start (q₀)" onClick={() => handleCreateState("start")} color="cyan" icon={ArrowRight} />
        <StateBtn label="State (qₙ)" onClick={() => handleCreateState("normal")} color="surface" icon={Plus} />
        <StateBtn label="Final (q𝐹)" onClick={() => handleCreateState("final")} color="purple" icon={CheckCircle2} />
        <ActionBtn label="Transition" onClick={() => handleAddTransition(false)} />
        <ActionBtn label="Self-Loop ↺" onClick={() => handleAddTransition(true)} />
      </div>

      <PromptForm input={promptInput} setInput={setPromptInput} onSubmit={handleGenerateFromPrompt} placeholder="NFA Question (e.g. 'NFA with 101')" />

      <div className="flex items-center justify-between border-t border-lv-border-soft pt-2">
        <button
          type="button"
          onClick={() => setOutputTab("nfa-dfa")}
          className="flex items-center gap-1.5 rounded-xl bg-lv-cyan/20 border border-lv-cyan/40 px-3 py-1.5 text-xs font-bold text-lv-cyan hover:bg-lv-cyan/30 transition-colors"
        >
          <GitMerge className="h-3.5 w-3.5" />
          Convert NFA ➔ DFA (Subset Construction)
        </button>
        <ClearBtn onClick={clearCanvas} />
      </div>

      <SimulationFooter />
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// 3. EPSILON-NFA PALETTE (ε-NFA)
// ----------------------------------------------------------------------
function EpsilonNfaPalette() {
  const nodes = useWorkspaceStore((s) => s.nodes);
  const edges = useWorkspaceStore((s) => s.edges);
  const addNode = useWorkspaceStore((s) => s.addNode);
  const setEdges = useWorkspaceStore((s) => s.setEdges);
  const selectedNodeId = useWorkspaceStore((s) => s.selectedNodeId);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);
  const clearCanvas = useWorkspaceStore((s) => s.clearCanvas);

  const [promptInput, setPromptInput] = useState("");

  function handleCreateState(kind: "start" | "normal" | "final") {
    const count = nodes.filter((n) => n.type === "automata-state").length;
    const isStart = kind === "start" || (count === 0 && !nodes.some((n) => n.data?.isStart));
    const isAccept = kind === "final";
    const label = `q${count}`;

    addNode({
      id: `q-${Date.now()}`,
      type: "automata-state",
      position: { x: 120 + (count % 4) * 170, y: 140 + Math.floor(count / 4) * 130 },
      data: { label, isStart, isAccept, kind: "state" },
    });
  }

  function handleAddTransition(symbolPreset?: string, isSelfLoop: boolean = false) {
    if (nodes.length === 0) return;
    const sourceId = selectedNodeId || nodes[0].id;
    const targetId = isSelfLoop ? sourceId : nodes.length > 1 ? nodes[1].id : sourceId;
    const sym = symbolPreset || prompt("Enter Transition Symbol (e.g. 0, 1, ε):", "ε") || "ε";

    setEdges([
      ...edges,
      {
        id: `e-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        target: targetId,
        animated: true,
        type: sourceId === targetId ? "smoothstep" : "default",
        label: sym.trim(),
        data: { symbol: sym.trim() },
        style: { stroke: "#A855F7", strokeWidth: 2 },
      },
    ]);
  }

  function handleGenerateFromPrompt(e: React.FormEvent) {
    e.preventDefault();
    if (!promptInput.trim()) return;
    const res = generateAutomatonFromPrompt(promptInput);
    recomputeGraph(res.nodes, res.edges);
    setPromptInput("");
  }

  return (
    <PaletteContainer title="ε-NFA Machine Palette" stateCount={nodes.length} onClose={() => setPaletteOpen(false)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <StateBtn label="Start (q₀)" onClick={() => handleCreateState("start")} color="cyan" icon={ArrowRight} />
        <StateBtn label="State (qₙ)" onClick={() => handleCreateState("normal")} color="surface" icon={Plus} />
        <StateBtn label="Final (q𝐹)" onClick={() => handleCreateState("final")} color="purple" icon={CheckCircle2} />
        <ActionBtn label="Transition" onClick={() => handleAddTransition()} />
        <button
          type="button"
          onClick={() => handleAddTransition("ε")}
          className="flex items-center gap-1 rounded-xl bg-lv-purple/20 px-2.5 py-1.5 font-bold text-lv-purple hover:bg-lv-purple/30 border border-lv-purple/40 text-[11px]"
        >
          + ε Edge
        </button>
        <ActionBtn label="Self-Loop ↺" onClick={() => handleAddTransition(undefined, true)} />
      </div>

      <PromptForm input={promptInput} setInput={setPromptInput} onSubmit={handleGenerateFromPrompt} placeholder="ε-NFA Question (e.g. 'ε-NFA for 0*1*2*')" />

      <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-lv-border-soft pt-2">
        <button
          type="button"
          onClick={() => setOutputTab("nfa-dfa")}
          className="flex items-center gap-1 rounded-xl bg-sky-500/20 border border-sky-500/40 px-2.5 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500/30 transition-colors"
        >
          Option 1: Convert ε-NFA ➔ NFA
        </button>
        <button
          type="button"
          onClick={() => setOutputTab("nfa-dfa")}
          className="flex items-center gap-1 rounded-xl bg-lv-purple/20 border border-lv-purple/40 px-2.5 py-1.5 text-xs font-bold text-lv-purple hover:bg-lv-purple/30 transition-colors"
        >
          Option 2: Direct Convert to DFA
        </button>
        <ClearBtn onClick={clearCanvas} />
      </div>

      <SimulationFooter />
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// 4. MOORE MACHINE PALETTE (State Output Y = λ(q))
// ----------------------------------------------------------------------
function MoorePalette() {
  const nodes = useWorkspaceStore((s) => s.nodes);
  const edges = useWorkspaceStore((s) => s.edges);
  const addNode = useWorkspaceStore((s) => s.addNode);
  const setEdges = useWorkspaceStore((s) => s.setEdges);
  const selectedNodeId = useWorkspaceStore((s) => s.selectedNodeId);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);
  const clearCanvas = useWorkspaceStore((s) => s.clearCanvas);

  const [promptInput, setPromptInput] = useState("");

  function handleCreateMooreState(isStart: boolean = false, isAccept: boolean = false) {
    const count = nodes.filter((n) => n.type === "automata-state").length;
    const label = `q${count}`;
    const out = prompt(`Enter State Output Y = λ(${label}) (e.g. 0 or 1):`, "0");
    const mooreOutput = out !== null ? out.trim() : "0";

    addNode({
      id: `q-${Date.now()}`,
      type: "automata-state",
      position: { x: 120 + (count % 4) * 170, y: 140 + Math.floor(count / 4) * 130 },
      data: { label, isStart, isAccept, mooreOutput, kind: "state" },
    });
  }

  function handleAddTransition(isSelfLoop: boolean = false) {
    if (nodes.length === 0) return;
    const sourceId = selectedNodeId || nodes[0].id;
    const targetId = isSelfLoop ? sourceId : nodes.length > 1 ? nodes[1].id : sourceId;
    const sym = prompt(isSelfLoop ? "Moore Self-Loop Symbol:" : "Moore Transition Symbol:", "0") || "0";

    setEdges([
      ...edges,
      {
        id: `e-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        target: targetId,
        animated: true,
        type: sourceId === targetId ? "smoothstep" : "default",
        label: sym.trim(),
        data: { symbol: sym.trim() },
        style: { stroke: "#F59E0B", strokeWidth: 2 },
      },
    ]);
  }

  function handleGenerateFromPrompt(e: React.FormEvent) {
    e.preventDefault();
    if (!promptInput.trim()) return;
    const res = generateAutomatonFromPrompt(promptInput);
    recomputeGraph(res.nodes, res.edges);
    setPromptInput("");
  }

  return (
    <PaletteContainer title="Moore Machine Palette (State Output Y = λ(q))" stateCount={nodes.length} onClose={() => setPaletteOpen(false)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <StateBtn label="Start State" onClick={() => handleCreateMooreState(true, false)} color="cyan" icon={ArrowRight} />
        <StateBtn label="+ Moore State (q / Y)" onClick={() => handleCreateMooreState(false, false)} color="surface" icon={Settings2} />
        <StateBtn label="Final State" onClick={() => handleCreateMooreState(false, true)} color="purple" icon={CheckCircle2} />
        <ActionBtn label="Transition" onClick={() => handleAddTransition(false)} />
        <ActionBtn label="Self-Loop ↺" onClick={() => handleAddTransition(true)} />
      </div>

      <PromptForm input={promptInput} setInput={setPromptInput} onSubmit={handleGenerateFromPrompt} placeholder="Moore Question (e.g. 'Moore machine 1s mod 3')" />

      <div className="flex items-center justify-between border-t border-lv-border-soft pt-2">
        <button
          type="button"
          onClick={() => setOutputTab("moore-mealy")}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/30 transition-colors"
        >
          <GitMerge className="h-3.5 w-3.5" />
          Convert Moore ➔ Mealy Machine
        </button>
        <ClearBtn onClick={clearCanvas} />
      </div>

      <SimulationFooter />
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// 5. MEALY MACHINE PALETTE (Edge Output a / y)
// ----------------------------------------------------------------------
function MealyPalette() {
  const nodes = useWorkspaceStore((s) => s.nodes);
  const edges = useWorkspaceStore((s) => s.edges);
  const addNode = useWorkspaceStore((s) => s.addNode);
  const setEdges = useWorkspaceStore((s) => s.setEdges);
  const selectedNodeId = useWorkspaceStore((s) => s.selectedNodeId);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);
  const clearCanvas = useWorkspaceStore((s) => s.clearCanvas);

  const [promptInput, setPromptInput] = useState("");

  function handleCreateState(kind: "start" | "normal" | "final") {
    const count = nodes.filter((n) => n.type === "automata-state").length;
    const isStart = kind === "start" || (count === 0 && !nodes.some((n) => n.data?.isStart));
    const isAccept = kind === "final";
    const label = `q${count}`;

    addNode({
      id: `q-${Date.now()}`,
      type: "automata-state",
      position: { x: 120 + (count % 4) * 170, y: 140 + Math.floor(count / 4) * 130 },
      data: { label, isStart, isAccept, kind: "state" },
    });
  }

  function handleAddMealyTransition(isSelfLoop: boolean = false) {
    if (nodes.length === 0) return;
    const sourceId = selectedNodeId || nodes[0].id;
    const targetId = isSelfLoop ? sourceId : nodes.length > 1 ? nodes[1].id : sourceId;

    const sym = prompt("Enter Input Symbol a (e.g. 0, 1):", "0") || "0";
    const out = prompt("Enter Mealy Transition Output y (e.g. 0, 1):", "1") || "1";

    setEdges([
      ...edges,
      {
        id: `e-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        target: targetId,
        animated: true,
        type: sourceId === targetId ? "smoothstep" : "default",
        label: `${sym.trim()} / ${out.trim()}`,
        data: { mealyOutput: out.trim(), symbol: sym.trim() },
        style: { stroke: "#F59E0B", strokeWidth: 2 },
      },
    ]);
  }

  function handleGenerateFromPrompt(e: React.FormEvent) {
    e.preventDefault();
    if (!promptInput.trim()) return;
    const res = generateAutomatonFromPrompt(promptInput);
    recomputeGraph(res.nodes, res.edges);
    setPromptInput("");
  }

  return (
    <PaletteContainer title="Mealy Machine Palette (Edge Output a / y)" stateCount={nodes.length} onClose={() => setPaletteOpen(false)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <StateBtn label="Start (q₀)" onClick={() => handleCreateState("start")} color="cyan" icon={ArrowRight} />
        <StateBtn label="Mealy State" onClick={() => handleCreateState("normal")} color="surface" icon={Plus} />
        <StateBtn label="Final State" onClick={() => handleCreateState("final")} color="purple" icon={CheckCircle2} />
        <ActionBtn label="Mealy Transition (a / y)" onClick={() => handleAddMealyTransition(false)} />
        <ActionBtn label="Mealy Self-Loop ↺" onClick={() => handleAddMealyTransition(true)} />
      </div>

      <PromptForm input={promptInput} setInput={setPromptInput} onSubmit={handleGenerateFromPrompt} placeholder="Mealy Question (e.g. 'Mealy sequence detector 10')" />

      <div className="flex items-center justify-between border-t border-lv-border-soft pt-2">
        <button
          type="button"
          onClick={() => setOutputTab("moore-mealy")}
          className="flex items-center gap-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 px-3 py-1.5 text-xs font-bold text-purple-400 hover:bg-purple-500/30 transition-colors"
        >
          <GitMerge className="h-3.5 w-3.5" />
          Convert Mealy ➔ Moore Machine
        </button>
        <ClearBtn onClick={clearCanvas} />
      </div>

      <SimulationFooter />
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// HELPER REUSABLE UI COMPONENTS
// ----------------------------------------------------------------------
function PaletteContainer({
  title,
  stateCount,
  onClose,
  children,
}: {
  title: string;
  stateCount: number;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2.5 rounded-2xl border border-lv-border/90 bg-lv-panel/95 p-3 shadow-2xl backdrop-blur-xl font-mono text-xs w-[360px] sm:w-[480px]">
      <div className="flex items-center justify-between border-b border-lv-border-soft pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-lv-cyan/15 text-lv-cyan">
            <Cpu className="h-3.5 w-3.5" />
          </span>
          <span className="font-bold text-lv-text text-xs uppercase tracking-wider">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-lv-cyan/20 px-2 py-0.5 font-mono text-[10px] text-lv-cyan font-bold">
            {stateCount} states
          </span>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-lv-faint hover:text-lv-text hover:bg-lv-surface transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

function StateBtn({
  label,
  onClick,
  color,
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  color: "cyan" | "purple" | "surface";
  icon: typeof Plus;
}) {
  const styles =
    color === "cyan"
      ? "bg-lv-cyan/20 text-lv-cyan border-lv-cyan/40 hover:bg-lv-cyan/30 font-bold"
      : color === "purple"
      ? "bg-lv-purple/20 text-lv-purple border-lv-purple/40 hover:bg-lv-purple/30 font-bold"
      : "bg-lv-surface text-lv-text border-lv-border hover:bg-lv-surface/80 font-semibold";

  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 border transition-colors text-[11px] ${styles}`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );
}

function ActionBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 rounded-xl bg-lv-surface px-2.5 py-1.5 font-semibold text-lv-muted hover:text-lv-text border border-lv-border transition-colors text-[11px]">
      <ArrowRight className="h-3.5 w-3.5 text-lv-cyan" />
      <span>{label}</span>
    </button>
  );
}

function PromptForm({
  input,
  setInput,
  onSubmit,
  placeholder,
}: {
  input: string;
  setInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder: string;
}) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-1.5 pt-0.5">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-xl border border-lv-border bg-lv-surface px-3 py-1.5 text-xs font-mono text-lv-text placeholder:text-lv-faint focus:border-lv-cyan focus:outline-none"
      />
      <button type="submit" disabled={!input.trim()} className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-lv-cyan to-blue-600 px-3 py-1.5 font-bold text-slate-950 shadow-md disabled:opacity-40 hover:opacity-90 transition-all shrink-0 text-xs">
        <Wand2 className="h-3.5 w-3.5" />
        <span>Build</span>
      </button>
    </form>
  );
}

function ClearBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-xl p-1.5 text-lv-faint hover:bg-lv-surface hover:text-lv-error transition-colors" title="Clear Canvas">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function SimulationFooter() {
  const automataInputString = useWorkspaceStore((s) => s.automataInputString);
  const setAutomataInputString = useWorkspaceStore((s) => s.setAutomataInputString);
  const automataSimulation = useWorkspaceStore((s) => s.automataSimulation);
  const activeAutomataStepIndex = useWorkspaceStore((s) => s.activeAutomataStepIndex);
  const setAutomataStepIndex = useWorkspaceStore((s) => s.setAutomataStepIndex);

  const stepsCount = automataSimulation?.steps?.length || 0;

  function stepForward() {
    if (activeAutomataStepIndex < stepsCount - 1) {
      setAutomataStepIndex(activeAutomataStepIndex + 1);
    }
  }

  function stepBackward() {
    if (activeAutomataStepIndex > 0) {
      setAutomataStepIndex(activeAutomataStepIndex - 1);
    }
  }

  return (
    <div className="flex items-center justify-between border-t border-lv-border-soft pt-2 mt-0.5">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-lv-faint">Input String:</span>
        <input
          type="text"
          value={automataInputString}
          onChange={(e) => setAutomataInputString(e.target.value)}
          className="w-24 rounded-lg border border-lv-border bg-lv-surface px-2 py-1 text-xs font-mono font-bold text-lv-cyan focus:border-lv-cyan focus:outline-none"
          placeholder="e.g. 101"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 bg-lv-surface/70 rounded-lg p-0.5 border border-lv-border-soft">
          <button type="button" onClick={() => setAutomataStepIndex(0)} className="p-1 text-lv-faint hover:text-lv-text" title="Reset Simulation">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={stepBackward} disabled={activeAutomataStepIndex === 0} className="p-1 text-lv-faint hover:text-lv-text disabled:opacity-30">
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={stepForward} disabled={activeAutomataStepIndex === stepsCount - 1} className="p-1 text-lv-cyan hover:text-lv-cyan/80 disabled:opacity-30">
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>

        {stepsCount > 0 && <span className="text-[11px] font-mono text-lv-muted">Step {activeAutomataStepIndex + 1}/{stepsCount}</span>}
      </div>
    </div>
  );
}
