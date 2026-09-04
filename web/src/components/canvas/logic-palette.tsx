"use client";

import { useState } from "react";
import {
  Plus,
  Binary,
  Layers3,
  ChevronDown,
  BookOpen,
  RotateCcw,
  Palette,
  X,
  Wand2,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { LOGIC_TEMPLATES } from "@/lib/templates";
import type { LogicOp } from "@/lib/algorithms/propositional-logic";

export function LogicPalette() {
  const addNode = useWorkspaceStore((s) => s.addNode);
  const nodes = useWorkspaceStore((s) => s.nodes);
  const clearCanvas = useWorkspaceStore((s) => s.clearCanvas);
  const loadTemplate = useWorkspaceStore((s) => s.loadTemplate);
  const paletteOpen = useWorkspaceStore((s) => s.paletteOpen);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const setExpressionModalOpen = useWorkspaceStore((s) => s.setExpressionModalOpen);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  function getSmartPosition(type: string) {
    const existing = nodes.filter((n) => n.type === type);
    const count = existing.length;
    if (type === "logic-var") {
      return { x: 80, y: 80 + count * 100 };
    }
    if (type === "logic-op") {
      return { x: 300, y: 100 + count * 110 };
    }
    return { x: 500, y: 120 + count * 110 };
  }

  function addVariable(name: string, initialValue: boolean = true) {
    addNode({
      id: `var-${crypto.randomUUID()}`,
      type: "logic-var",
      position: getSmartPosition("logic-var"),
      data: { label: name, kind: "logic-var", value: initialValue },
    });
  }

  function addGate(symbol: LogicOp, label: string) {
    addNode({
      id: `op-${crypto.randomUUID()}`,
      type: "logic-op",
      position: getSmartPosition("logic-op"),
      data: { label, kind: "logic-op", symbol },
    });
  }

  function addResultProbe() {
    addNode({
      id: `res-${crypto.randomUUID()}`,
      type: "logic-result",
      position: getSmartPosition("logic-result"),
      data: { label: "Result Probe", kind: "logic-result", truthValue: null },
    });
  }

  if (!paletteOpen) {
    return (
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl border border-lv-border bg-lv-panel/90 px-3 py-2 text-xs font-medium text-lv-text shadow-xl backdrop-blur-xl hover:bg-lv-surface hover:border-lv-cyan transition-all"
        title="Open Component Palette"
      >
        <Palette className="w-3.5 h-3.5 text-lv-cyan" />
        <span>Palette</span>
        <span className="rounded-full bg-lv-surface px-1.5 py-0.5 font-mono text-[10px] text-lv-muted">
          {nodes.length}
        </span>
      </button>
    );
  }

  return (
    <div className="absolute left-4 top-4 z-10 flex flex-col gap-1 rounded-2xl border border-lv-border bg-lv-panel/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl lv-glass">
      <div className="px-2 py-1 flex items-center justify-between border-b border-lv-border-soft pb-1.5 mb-1 gap-3">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-lv-cyan font-semibold">
            Logic Gates
          </span>
          <span className="rounded-full bg-lv-surface px-1.5 py-0.5 text-[9px] font-mono text-lv-muted">
            {nodes.length} nodes
          </span>
        </div>
        <button
          type="button"
          onClick={() => setPaletteOpen(false)}
          className="rounded p-0.5 text-lv-faint hover:text-lv-text hover:bg-lv-surface transition-colors"
          title="Minimize Palette"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Custom Formula / Expression Builder */}
      <button
        type="button"
        onClick={() => setExpressionModalOpen(true)}
        className="flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-lv-cyan/20 to-lv-purple/20 border border-lv-cyan/40 px-2.5 py-1.5 text-left text-xs font-semibold text-lv-cyan hover:border-lv-cyan hover:shadow-md hover:shadow-lv-cyan/10 transition-all mb-1"
      >
        <span className="flex items-center gap-1.5">
          <Wand2 className="h-3.5 w-3.5 text-lv-cyan animate-pulse" />
          Build Expression
        </span>
        <span className="text-[10px] bg-lv-cyan/20 text-lv-cyan px-1.5 py-0.5 rounded font-mono">
          NEW
        </span>
      </button>

      {/* Variables Group */}
      <div className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-lv-faint">
        Variables
      </div>
      <div className="grid grid-cols-4 gap-1 px-1">
        {["P", "Q", "R", "S"].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => addVariable(v)}
            className="flex items-center justify-center rounded-lg bg-lv-surface/70 py-1 font-mono text-xs font-bold text-lv-cyan hover:bg-lv-surface hover:text-white transition-colors border border-lv-border"
          >
            {v}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1 px-1 mt-1">
        <button
          type="button"
          onClick={() => addVariable("⊤", true)}
          className="flex items-center justify-center gap-1 rounded-lg bg-lv-success/10 py-1 font-mono text-[11px] font-bold text-lv-success hover:bg-lv-success/20 border border-lv-success/30 transition-colors"
        >
          True ⊤
        </button>
        <button
          type="button"
          onClick={() => addVariable("⊥", false)}
          className="flex items-center justify-center gap-1 rounded-lg bg-lv-error/10 py-1 font-mono text-[11px] font-bold text-lv-error hover:bg-lv-error/20 border border-lv-error/30 transition-colors"
        >
          False ⊥
        </button>
      </div>

      <div className="my-1 h-px bg-lv-border-soft" />

      {/* Logic Connectives Group */}
      <div className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-lv-faint">
        Connectives
      </div>
      <PaletteButton icon={Binary} label="NOT ¬" onClick={() => addGate("¬", "NOT")} />
      <PaletteButton icon={Binary} label="AND ∧" onClick={() => addGate("∧", "AND")} />
      <PaletteButton icon={Binary} label="OR ∨" onClick={() => addGate("∨", "OR")} />
      <PaletteButton icon={Binary} label="IMPLIES →" onClick={() => addGate("→", "IMPLIES")} />
      <PaletteButton icon={Binary} label="IFF ↔" onClick={() => addGate("↔", "IFF")} />
      <PaletteButton icon={Binary} label="XOR ⊕" onClick={() => addGate("⊕", "XOR")} />

      <div className="my-1 h-px bg-lv-border-soft" />

      {/* Result Probe */}
      <PaletteButton icon={Layers3} label="Add Probe" onClick={addResultProbe} accent />

      <div className="my-1 h-px bg-lv-border-soft" />

      {/* Templates Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setTemplatesOpen(!templatesOpen)}
          className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-lv-cyan transition-colors hover:bg-lv-surface"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-lv-cyan" />
            Templates
          </span>
          <ChevronDown className="h-3 w-3 text-lv-faint" />
        </button>

        {templatesOpen && (
          <div className="absolute left-full bottom-0 ml-2 z-50 w-60 rounded-xl border border-lv-border bg-lv-panel/95 p-1.5 shadow-2xl backdrop-blur-xl space-y-0.5">
            <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-lv-faint">
              Load Logic Theorem
            </div>
            {Object.values(LOGIC_TEMPLATES).map((tmpl) => (
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
          ? "bg-lv-cyan/15 text-lv-cyan font-semibold hover:bg-lv-cyan/25"
          : "text-lv-muted hover:bg-lv-surface hover:text-lv-text"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${accent ? "text-lv-cyan" : "text-lv-muted"}`} strokeWidth={2} />
      {label}
    </button>
  );
}
