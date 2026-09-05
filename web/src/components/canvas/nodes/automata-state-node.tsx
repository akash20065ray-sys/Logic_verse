"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { cn } from "@/lib/utils";

export interface AutomataStateNodeData {
  label: string;
  isStart?: boolean;
  isAccept?: boolean;
  mooreOutput?: string;
  kind?: string;
}

export const AutomataStateNode = memo(function AutomataStateNode({
  id,
  data,
  selected,
}: NodeProps) {
  const nodeData = data as unknown as AutomataStateNodeData;
  const { label, isStart, isAccept, mooreOutput } = nodeData;

  const activeModuleId = useWorkspaceStore((s) => s.activeModuleId);
  const automataSimulation = useWorkspaceStore((s) => s.automataSimulation);
  const activeAutomataStepIndex = useWorkspaceStore((s) => s.activeAutomataStepIndex);

  // Check if this state is active in the current step of string simulation
  const currentStep = automataSimulation?.steps?.[activeAutomataStepIndex];
  const isActive = Boolean(
    activeModuleId === "automata" &&
      currentStep?.activeStateIds?.includes(id)
  );

  return (
    <div className="relative group">
      {/* Start State Indicator Arrow */}
      {isStart && (
        <div className="absolute -left-7 top-1/2 -translate-y-1/2 flex items-center text-lv-cyan animate-pulse">
          <ArrowRight className="h-5 w-5 font-bold" />
        </div>
      )}

      {/* Target & Source Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="handle-left"
        className="!h-3 !w-3 !bg-lv-cyan !border-2 !border-lv-panel transition-transform hover:scale-125"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="handle-top"
        className="!h-3 !w-3 !bg-lv-cyan !border-2 !border-lv-panel transition-transform hover:scale-125"
      />

      {/* Main State Circle */}
      <div
        className={cn(
          "relative flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-lg select-none",
          selected
            ? "border-lv-cyan shadow-lv-cyan/30 shadow-md ring-2 ring-lv-cyan/50"
            : isAccept
            ? "border-lv-purple bg-lv-panel"
            : "border-lv-border bg-lv-panel",
          isActive && "border-lv-cyan bg-lv-cyan/20 ring-4 ring-lv-cyan/60 scale-110 shadow-xl shadow-lv-cyan/40"
        )}
      >
        {/* Inner Ring for Accepting State */}
        {isAccept && (
          <div
            className={cn(
              "absolute inset-1.5 rounded-full border-2 border-dashed pointer-events-none transition-colors",
              isActive ? "border-lv-cyan" : "border-lv-purple/70"
            )}
          />
        )}

        {/* State Label */}
        <div className="flex flex-col items-center justify-center text-center">
          <span
            className={cn(
              "font-mono text-sm font-bold tracking-tight transition-colors",
              isActive ? "text-lv-cyan font-black" : "text-lv-text"
            )}
          >
            {label}
          </span>
          {mooreOutput !== undefined && (
            <span className="text-[10px] font-mono text-lv-faint -mt-0.5">
              / {mooreOutput}
            </span>
          )}
        </div>

        {/* Active Simulation Step Pulse Ring */}
        {isActive && (
          <span className="absolute -inset-1.5 rounded-full border border-lv-cyan animate-ping opacity-50 pointer-events-none" />
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="handle-right"
        className="!h-3 !w-3 !bg-lv-cyan !border-2 !border-lv-panel transition-transform hover:scale-125"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="handle-bottom"
        className="!h-3 !w-3 !bg-lv-cyan !border-2 !border-lv-panel transition-transform hover:scale-125"
      />
    </div>
  );
});
