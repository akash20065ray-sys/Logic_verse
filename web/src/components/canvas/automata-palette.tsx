"use client";

import { useState } from "react";
import {
  Plus,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sparkles,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { AUTOMATA_TEMPLATES } from "@/lib/templates";
import { cn } from "@/lib/utils";

export function AutomataPalette() {
  const nodes = useWorkspaceStore((s) => s.nodes);
  const addNode = useWorkspaceStore((s) => s.addNode);
  const setNodes = useWorkspaceStore((s) => s.setNodes);
  const clearCanvas = useWorkspaceStore((s) => s.clearCanvas);
  const loadTemplate = useWorkspaceStore((s) => s.loadTemplate);
  const selectedNodeId = useWorkspaceStore((s) => s.selectedNodeId);

  const automataInputString = useWorkspaceStore((s) => s.automataInputString);
  const setAutomataInputString = useWorkspaceStore((s) => s.setAutomataInputString);
  const automataSimulation = useWorkspaceStore((s) => s.automataSimulation);
  const activeAutomataStepIndex = useWorkspaceStore((s) => s.activeAutomataStepIndex);
  const setAutomataStepIndex = useWorkspaceStore((s) => s.setAutomataStepIndex);

  const [isPlaying, setIsPlaying] = useState(false);
  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);

  function handleAddState() {
    const stateCount = nodes.filter((n) => n.type === "automata-state").length;
    const isStart = stateCount === 0;
    const label = `q${stateCount}`;

    const newNode = {
      id: `q-${Date.now()}`,
      type: "automata-state",
      position: {
        x: 100 + (stateCount % 4) * 160,
        y: 120 + Math.floor(stateCount / 4) * 120,
      },
      data: {
        label,
        isStart,
        isAccept: false,
        kind: "state",
      },
    };

    addNode(newNode);
  }

  function handleToggleStart() {
    if (!selectedNodeId) return;
    const updated = nodes.map((n) => {
      if (n.id === selectedNodeId) {
        return { ...n, data: { ...n.data, isStart: !n.data?.isStart } };
      }
      // If setting this node to start, un-start others
      return { ...n, data: { ...n.data, isStart: false } };
    });
    setNodes(updated);
  }

  function handleToggleAccept() {
    if (!selectedNodeId) return;
    const updated = nodes.map((n) =>
      n.id === selectedNodeId
        ? { ...n, data: { ...n.data, isAccept: !n.data?.isAccept } }
        : n
    );
    setNodes(updated);
  }

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
    <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-lv-border/80 bg-lv-panel/90 p-2 shadow-2xl backdrop-blur-md font-mono text-xs">
      {/* Add State Button */}
      <button
        type="button"
        onClick={handleAddState}
        className="flex items-center gap-1.5 rounded-xl bg-lv-blue/20 px-3 py-1.5 font-semibold text-lv-blue hover:bg-lv-blue/30 transition-colors border border-lv-blue/40"
      >
        <Plus className="h-4 w-4" />
        Add State (qₙ)
      </button>

      {/* Selected State Property Toggles */}
      {selectedNodeId && (
        <div className="flex items-center gap-1 border-l border-r border-lv-border-soft px-2">
          <button
            type="button"
            onClick={handleToggleStart}
            className="flex items-center gap-1 rounded-lg bg-lv-surface px-2 py-1 text-lv-cyan hover:bg-lv-cyan/20 transition-colors border border-lv-cyan/30"
            title="Toggle Initial/Start State"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            Start State
          </button>
          <button
            type="button"
            onClick={handleToggleAccept}
            className="flex items-center gap-1 rounded-lg bg-lv-surface px-2 py-1 text-lv-purple hover:bg-lv-purple/20 transition-colors border border-lv-purple/30"
            title="Toggle Final/Accepting State"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Accept State
          </button>
        </div>
      )}

      {/* Live String Simulation Controls */}
      <div className="flex items-center gap-2 border-l border-lv-border-soft pl-2">
        <span className="text-[11px] text-lv-faint">Input String:</span>
        <input
          type="text"
          value={automataInputString}
          onChange={(e) => setAutomataInputString(e.target.value)}
          className="w-24 rounded-lg border border-lv-border bg-lv-surface px-2 py-1 text-xs font-mono font-bold text-lv-cyan focus:border-lv-cyan focus:outline-none"
          placeholder="e.g. 101"
        />

        <div className="flex items-center gap-1 bg-lv-surface/70 rounded-lg p-0.5 border border-lv-border-soft">
          <button
            type="button"
            onClick={() => setAutomataStepIndex(0)}
            className="p-1 text-lv-faint hover:text-lv-text"
            title="Reset Simulation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={stepBackward}
            disabled={activeAutomataStepIndex === 0}
            className="p-1 text-lv-faint hover:text-lv-text disabled:opacity-30"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={stepForward}
            disabled={activeAutomataStepIndex === stepsCount - 1}
            className="p-1 text-lv-cyan hover:text-lv-cyan/80 disabled:opacity-30"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>

        {stepsCount > 0 && (
          <span className="text-[11px] font-mono text-lv-muted">
            Step {activeAutomataStepIndex + 1}/{stepsCount}
          </span>
        )}
      </div>

      {/* Presets Dropdown */}
      <div className="relative border-l border-lv-border-soft pl-2">
        <button
          type="button"
          onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
          className="flex items-center gap-1.5 rounded-xl border border-lv-border bg-lv-surface px-2.5 py-1.5 text-lv-muted hover:text-lv-text transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5 text-lv-cyan" />
          <span>Presets</span>
          <ChevronDown className="h-3 w-3 text-lv-faint" />
        </button>

        {presetDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 rounded-xl border border-lv-border bg-lv-panel p-1.5 shadow-2xl space-y-1 z-30">
            {Object.values(AUTOMATA_TEMPLATES).map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => {
                  loadTemplate(tmpl.id);
                  setPresetDropdownOpen(false);
                }}
                className="w-full text-left rounded-lg p-2 text-xs hover:bg-lv-surface transition-colors"
              >
                <div className="font-bold text-lv-text">{tmpl.title}</div>
                <div className="text-[10px] text-lv-faint truncate">{tmpl.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clear Canvas */}
      <button
        type="button"
        onClick={clearCanvas}
        className="ml-auto rounded-xl p-1.5 text-lv-faint hover:bg-lv-surface hover:text-lv-error transition-colors"
        title="Clear Canvas"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
