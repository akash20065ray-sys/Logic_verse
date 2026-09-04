"use client";

import { useState } from "react";
import {
  Plus,
  Combine,
  Layers3,
  ChevronDown,
  Sparkles,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { SetFormModal, type SetFormValues } from "./set-form-modal";
import { WORKSPACE_TEMPLATES } from "@/lib/templates";
import type { SetOperationSymbol } from "@/lib/algorithms/set-theory";

const ACCENTS: ("blue" | "purple" | "cyan")[] = ["blue", "purple", "cyan"];
let setCounter = 0;

const PRESET_SETS = [
  { label: "Primes P", elements: [2, 3, 5, 7, 11, 13] },
  { label: "Evens E", elements: [2, 4, 6, 8, 10, 12] },
  { label: "Odds O", elements: [1, 3, 5, 7, 9, 11] },
  { label: "Vowels V", elements: ["a", "e", "i", "o", "u"] },
  { label: "Fibonacci F", elements: [1, 2, 3, 5, 8, 13] },
];

export function CanvasPalette() {
  const addNode = useWorkspaceStore((s) => s.addNode);
  const nodes = useWorkspaceStore((s) => s.nodes);
  const clearCanvas = useWorkspaceStore((s) => s.clearCanvas);
  const loadTemplate = useWorkspaceStore((s) => s.loadTemplate);
  const [formOpen, setFormOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(false);

  function getSmartPosition(type: "set" | "operation" | "result") {
    const existing = nodes.filter((n) => n.type === type);
    const count = existing.length;
    if (type === "set") {
      return { x: 80, y: 80 + count * 140 };
    }
    if (type === "operation") {
      return { x: 340, y: 120 + count * 130 };
    }
    return { x: 540, y: 120 + count * 130 };
  }

  function handleAddSet(values: SetFormValues) {
    const accent = ACCENTS[setCounter % ACCENTS.length];
    setCounter++;
    addNode({
      id: `set-${crypto.randomUUID()}`,
      type: "set",
      position: getSmartPosition("set"),
      data: { label: values.label, kind: "set", elements: values.elements, accent },
    });
    setFormOpen(false);
  }

  function handleAddPresetSet(preset: { label: string; elements: (string | number)[] }) {
    const accent = ACCENTS[setCounter % ACCENTS.length];
    setCounter++;
    addNode({
      id: `set-${crypto.randomUUID()}`,
      type: "set",
      position: getSmartPosition("set"),
      data: { label: preset.label.split(" ")[0], kind: "set", elements: preset.elements, accent },
    });
    setPresetsOpen(false);
  }

  function addOperation(symbol: SetOperationSymbol, label: string) {
    addNode({
      id: `op-${crypto.randomUUID()}`,
      type: "operation",
      position: getSmartPosition("operation"),
      data: { label, kind: "operation", symbol },
    });
  }

  function addResult() {
    addNode({
      id: `result-${crypto.randomUUID()}`,
      type: "result",
      position: getSmartPosition("result"),
      data: { label: "Result", kind: "result", elements: [] },
    });
  }

  return (
    <>
      <div className="absolute left-4 top-4 z-10 flex flex-col gap-1 rounded-2xl border border-lv-border bg-lv-panel/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl lv-glass">
        <div className="px-2 py-1 flex items-center justify-between border-b border-lv-border-soft pb-1.5 mb-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-lv-faint font-semibold">
            Palette
          </span>
          <span className="rounded-full bg-lv-surface px-1.5 py-0.5 text-[9px] font-mono text-lv-muted">
            {nodes.length} nodes
          </span>
        </div>

        {/* Add Custom Set */}
        <PaletteButton icon={Plus} label="Add Set" onClick={() => setFormOpen(true)} accent />

        {/* Presets dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setPresetsOpen(!presetsOpen);
              setTemplatesOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-lv-muted transition-colors hover:bg-lv-surface hover:text-lv-text"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-lv-purple" />
              Preset Sets
            </span>
            <ChevronDown className="h-3 w-3 text-lv-faint" />
          </button>

          {presetsOpen && (
            <div className="absolute left-full top-0 ml-2 z-50 w-44 rounded-xl border border-lv-border bg-lv-panel/95 p-1.5 shadow-2xl backdrop-blur-xl">
              <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-lv-faint">
                Quick Sets
              </div>
              {PRESET_SETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleAddPresetSet(p)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs text-lv-muted hover:bg-lv-surface hover:text-lv-text text-left"
                >
                  <span>{p.label}</span>
                  <span className="font-mono text-[10px] text-lv-faint">n={p.elements.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="my-1 h-px bg-lv-border-soft" />

        <div className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-lv-faint">
          Binary Operations
        </div>
        <PaletteButton icon={Combine} label="Union ∪" onClick={() => addOperation("∪", "Union")} />
        <PaletteButton icon={Combine} label="Intersect ∩" onClick={() => addOperation("∩", "Intersection")} />
        <PaletteButton icon={Combine} label="Difference −" onClick={() => addOperation("−", "Difference")} />
        <PaletteButton icon={Combine} label="Symmetric Diff ⊕" onClick={() => addOperation("⊕", "Symmetric Diff")} />
        <PaletteButton icon={Combine} label="Cartesian Prod ×" onClick={() => addOperation("×", "Cartesian Product")} />

        <div className="my-1 h-px bg-lv-border-soft" />

        <div className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-lv-faint">
          Unary Operations
        </div>
        <PaletteButton icon={Combine} label="Power Set 𝒫" onClick={() => addOperation("𝒫", "Power Set")} />
        <PaletteButton icon={Combine} label="Cardinality |·|" onClick={() => addOperation("|·|", "Cardinality")} />

        <div className="my-1 h-px bg-lv-border-soft" />

        {/* Add Result Node */}
        <PaletteButton icon={Layers3} label="Add Result" onClick={addResult} />

        <div className="my-1 h-px bg-lv-border-soft" />

        {/* Templates dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setTemplatesOpen(!templatesOpen);
              setPresetsOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-lv-cyan transition-colors hover:bg-lv-surface"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-lv-cyan" />
              Templates
            </span>
            <ChevronDown className="h-3 w-3 text-lv-faint" />
          </button>

          {templatesOpen && (
            <div className="absolute left-full bottom-0 ml-2 z-50 w-56 rounded-xl border border-lv-border bg-lv-panel/95 p-1.5 shadow-2xl backdrop-blur-xl space-y-0.5">
              <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-lv-faint">
                Load Example Model
              </div>
              {Object.values(WORKSPACE_TEMPLATES).map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    loadTemplate(tmpl.id);
                    setTemplatesOpen(false);
                  }}
                  className="flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left hover:bg-lv-surface text-lv-muted hover:text-lv-text transition-colors"
                >
                  <span className="text-xs font-medium text-lv-text">{tmpl.title}</span>
                  <span className="text-[10px] text-lv-faint line-clamp-1">{tmpl.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear canvas */}
        <button
          type="button"
          onClick={clearCanvas}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-lv-faint transition-colors hover:bg-lv-surface hover:text-lv-error"
        >
          <RotateCcw className="h-3 w-3" />
          Clear canvas
        </button>
      </div>

      <SetFormModal
        open={formOpen}
        title="Add a new set"
        onSubmit={handleAddSet}
        onClose={() => setFormOpen(false)}
      />
    </>
  );
}

function PaletteButton({
  icon: Icon,
  label,
  onClick,
  accent,
}: {
  icon: typeof Plus;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
        accent
          ? "bg-lv-blue/15 text-lv-blue font-medium hover:bg-lv-blue/25"
          : "text-lv-muted hover:bg-lv-surface hover:text-lv-text"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${accent ? "text-lv-blue" : "text-lv-muted"}`} strokeWidth={2} />
      {label}
    </button>
  );
}
