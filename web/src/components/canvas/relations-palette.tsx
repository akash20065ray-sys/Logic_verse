"use client";

import { useState } from "react";
import {
  Grid3X3,
  GitBranch,
  Route,
  ArrowRightLeft,
  Plus,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Binary,
  Layers,
  ArrowRight,
} from "lucide-react";
import type { Node, Edge } from "@xyflow/react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { computeHasseDiagram, type HasseNode } from "@/lib/algorithms/relations";
import type { SetNodeData } from "./nodes/set-node";

export function RelationsPalette() {
  const paletteOpen = useWorkspaceStore((s) => s.paletteOpen);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const relationsSubMode = useWorkspaceStore((s) => s.relationsSubMode);
  const nodes = useWorkspaceStore((s) => s.nodes);

  if (!paletteOpen) {
    return (
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-lv-border bg-lv-panel/90 px-3 py-2 text-xs font-medium text-lv-text shadow-xl backdrop-blur-xl hover:bg-lv-surface hover:border-purple-500 transition-all font-mono"
        title="Open Relations & Functions Palette"
      >
        <Grid3X3 className="w-3.5 h-3.5 text-purple-400" />
        <span>Palette (Relations)</span>
        <span className="rounded-full bg-lv-surface px-1.5 py-0.5 font-mono text-[10px] text-lv-muted">
          {nodes.length}
        </span>
      </button>
    );
  }

  if (relationsSubMode === "hasse") return <HassePalette />;
  if (relationsSubMode === "warshall") return <WarshallPalette />;
  if (relationsSubMode === "functions") return <FunctionsPalette />;

  return <RelationMatrixPalette />;
}

// ----------------------------------------------------------------------
// 1. RELATION MATRIX & PROPERTIES PALETTE
// ----------------------------------------------------------------------
function RelationMatrixPalette() {
  const addNode = useWorkspaceStore((s) => s.addNode);
  const setEdges = useWorkspaceStore((s) => s.setEdges);
  const nodes = useWorkspaceStore((s) => s.nodes);
  const edges = useWorkspaceStore((s) => s.edges);
  const selectedNodeId = useWorkspaceStore((s) => s.selectedNodeId);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);

  function handleAddSetNode() {
    const count = nodes.filter((n) => n.type === "set").length;
    const label = String.fromCharCode(65 + count); // A, B, C...
    const elements = count === 0 ? ["1", "2", "3", "4"] : ["a", "b", "c"];

    addNode({
      id: `set-${Date.now()}`,
      type: "set",
      position: { x: 80 + (count % 3) * 200, y: 100 + Math.floor(count / 3) * 140 },
      data: { label, kind: "set", elements, accent: "purple" },
    });
  }

  function handleAddRelationEdge() {
    if (nodes.length === 0) {
      alert("Please add at least one Set node first.");
      return;
    }
    const sourceId = selectedNodeId || nodes[0].id;
    const targetId = nodes.length > 1 ? (selectedNodeId === nodes[0].id ? nodes[1].id : nodes[0].id) : sourceId;

    const pairInput = prompt("Enter Relation Pair (e.g. (1,2) or a,b):", "(1, 2)");
    if (!pairInput) return;

    const newEdge = {
      id: `rel-${Date.now()}`,
      source: sourceId,
      target: targetId,
      label: pairInput.trim(),
      animated: true,
      style: { stroke: "#A855F7", strokeWidth: 2 },
      data: { pair: pairInput.trim() },
    };

    setEdges([...edges, newEdge]);
  }

  function handleLoadDivisibilityPreset() {
    const setA: Node = {
      id: "set-d12",
      type: "set",
      position: { x: 100, y: 120 },
      data: { label: "D₁₂", kind: "set", elements: ["1", "2", "3", "4", "6", "12"], accent: "purple" },
    };
    recomputeGraph([setA], []);
    setOutputTab("matrix");
  }

  function handleLoadLessEqualPreset() {
    const setA: Node = {
      id: "set-poset",
      type: "set",
      position: { x: 100, y: 120 },
      data: { label: "S", kind: "set", elements: ["1", "2", "3", "4"], accent: "purple" },
    };
    recomputeGraph([setA], []);
    setOutputTab("matrix");
  }

  return (
    <PaletteContainer title="Relation Matrix Palette" onClose={() => setPaletteOpen(false)}>
      <div className="flex flex-wrap items-center gap-1.5">
        <ActionBtn label="+ Set A" onClick={handleAddSetNode} color="purple" icon={Plus} />
        <ActionBtn label="+ Relation Pair R" onClick={handleAddRelationEdge} color="surface" icon={ArrowRight} />
      </div>

      <div className="space-y-1 pt-1 border-t border-lv-border-soft">
        <span className="text-[10px] text-lv-faint font-mono uppercase font-bold">Preset Posets & Relations:</span>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={handleLoadDivisibilityPreset}
            className="rounded-lg bg-lv-surface border border-lv-border px-2 py-1 text-[11px] font-mono text-purple-300 hover:border-purple-400 transition-colors"
          >
            Divisibility D₁₂
          </button>
          <button
            type="button"
            onClick={handleLoadLessEqualPreset}
            className="rounded-lg bg-lv-surface border border-lv-border px-2 py-1 text-[11px] font-mono text-sky-300 hover:border-sky-400 transition-colors"
          >
            Poset (S, ≤)
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-lv-border-soft pt-2">
        <button
          type="button"
          onClick={() => setOutputTab("matrix")}
          className="flex items-center gap-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 px-3 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-500/30 transition-colors"
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          View Matrix & Properties
        </button>
      </div>
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// 2. HASSE DIAGRAM PALETTE (Posets)
// ----------------------------------------------------------------------
function HassePalette() {
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);
  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);

  function handleBuildDivisibilityHasse() {
    const elements = ["1", "2", "3", "4", "6", "12"];
    const pairs: [string, string][] = [];
    for (const a of elements) {
      for (const b of elements) {
        if (Number(b) % Number(a) === 0) {
          pairs.push([a, b]);
        }
      }
    }
    const hasse = computeHasseDiagram(elements, pairs);

    const nodes: Node[] = hasse.nodes.map((hn: HasseNode) => ({
      id: `hasse-${hn.id}`,
      type: "set",
      position: { x: hn.x + 100, y: hn.y + 80 },
      data: { label: hn.label, kind: "set", elements: [hn.label], accent: "purple" },
    }));

    const edges: Edge[] = hasse.covers.map(([from, to]: [string, string]) => ({
      id: `e-${from}-${to}`,
      source: `hasse-${from}`,
      target: `hasse-${to}`,
      animated: true,
      style: { stroke: "#A855F7", strokeWidth: 2 },
    }));

    recomputeGraph(nodes, edges);
    setOutputTab("hasse");
  }

  return (
    <PaletteContainer title="Hasse Diagram Visualizer (Poset)" onClose={() => setPaletteOpen(false)}>
      <p className="text-[11px] text-lv-muted leading-relaxed">
        Generates upward topological Hasse diagrams by performing reflexive & transitive reduction.
      </p>

      <button
        type="button"
        onClick={handleBuildDivisibilityHasse}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/30 transition-colors"
      >
        <GitBranch className="w-3.5 h-3.5" />
        Generate D₁₂ Divisibility Poset Hasse Graph
      </button>
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// 3. WARSHALL'S TRANSITIVE CLOSURE PALETTE
// ----------------------------------------------------------------------
function WarshallPalette() {
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);

  return (
    <PaletteContainer title="Warshall's Algorithm (Transitive Closure R*)" onClose={() => setPaletteOpen(false)}>
      <p className="text-[11px] text-lv-muted leading-relaxed">
        Computes the transitive closure R* step-by-step using dynamic programming pivots W⁽ᵏ⁾[i,j].
      </p>

      <button
        type="button"
        onClick={() => setOutputTab("warshall")}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-sky-500/20 border border-sky-500/40 py-2 text-xs font-bold text-sky-400 hover:bg-sky-500/30 transition-colors"
      >
        <Route className="w-3.5 h-3.5" />
        Run Warshall Matrix Closures Trace
      </button>
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// 4. FUNCTION ANALYZER PALETTE
// ----------------------------------------------------------------------
function FunctionsPalette() {
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);

  return (
    <PaletteContainer title="Function Bijectivity Analyzer" onClose={() => setPaletteOpen(false)}>
      <p className="text-[11px] text-lv-muted leading-relaxed">
        Analyzes function mappings f: A ➔ B for Injective (1-to-1), Surjective (Onto), and Inverse f⁻¹.
      </p>

      <button
        type="button"
        onClick={() => setOutputTab("functions")}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 transition-colors"
      >
        <ArrowRightLeft className="w-3.5 h-3.5" />
        Open Function Mapper & Inspector
      </button>
    </PaletteContainer>
  );
}

// ----------------------------------------------------------------------
// HELPER REUSABLE CONTAINER & BUTTONS
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
            <Grid3X3 className="h-3.5 w-3.5" />
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

function ActionBtn({
  label,
  onClick,
  color,
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  color: "purple" | "surface";
  icon: typeof Plus;
}) {
  const styles =
    color === "purple"
      ? "bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30 font-bold"
      : "bg-lv-surface text-lv-text border-lv-border hover:bg-lv-surface/80 font-semibold";

  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 border transition-colors text-[11px] ${styles}`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );
}
