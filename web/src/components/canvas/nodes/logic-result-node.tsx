"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Sparkles, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";

export interface LogicResultNodeData {
  label: string;
  kind: "logic-result";
  truthValue?: boolean | null;
  hasValue?: boolean;
  isTautology?: boolean;
  isContradiction?: boolean;
  [key: string]: unknown;
}

export function LogicResultNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as LogicResultNodeData;
  const deleteNode = useWorkspaceStore((s) => s.deleteNode);

  const hasValue = Boolean(nodeData.hasValue);
  const truthValue = nodeData.truthValue;

  return (
    <div
      className={cn(
        "group relative min-w-[190px] max-w-[280px] rounded-2xl border bg-gradient-to-br from-lv-panel via-lv-panel to-lv-surface/90 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur-md transition-all",
        hasValue
          ? truthValue
            ? "border-lv-success/60 shadow-lv-success/10"
            : "border-lv-error/60 shadow-lv-error/10"
          : "border-lv-border border-dashed",
        selected && "ring-2 ring-lv-cyan/50"
      )}
    >
      {/* Target input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="handle-in"
        className="!h-3 !w-3 !border-2 !border-lv-cyan !bg-lv-panel hover:!scale-125 transition-transform"
      />

      <div className="flex items-center gap-1.5 border-b border-lv-border-soft/60 pb-2">
        <Sparkles className="h-3.5 w-3.5 text-lv-cyan shrink-0" />
        <span className="font-mono text-xs font-semibold text-lv-cyan truncate">
          Logic Probe
        </span>

        {nodeData.isTautology && (
          <span className="ml-auto rounded-full bg-lv-success/15 border border-lv-success/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-lv-success">
            TAUTOLOGY ⊤
          </span>
        )}
        {nodeData.isContradiction && (
          <span className="ml-auto rounded-full bg-lv-error/15 border border-lv-error/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-lv-error">
            CONTRADICTION ⊥
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="font-mono text-xs text-lv-text truncate max-w-[180px]">
          {nodeData.label || "Connect gate…"}
        </div>

        {hasValue && truthValue !== null && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-lg px-2 py-0.5 font-mono text-xs font-bold shrink-0",
              truthValue
                ? "bg-lv-success/20 text-lv-success border border-lv-success/30"
                : "bg-lv-error/20 text-lv-error border border-lv-error/30"
            )}
          >
            {truthValue ? (
              <>
                <CheckCircle2 className="h-3 w-3" /> TRUE
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" /> FALSE
              </>
            )}
          </span>
        )}
      </div>

      {/* Output handle so results can be chained into further gates */}
      <Handle
        type="source"
        position={Position.Right}
        id="handle-out"
        className="!h-3 !w-3 !border-2 !border-lv-cyan !bg-lv-panel hover:!scale-125 transition-transform"
      />

      {/* Delete button */}
      {selected && (
        <button
          type="button"
          onClick={() => deleteNode(id)}
          aria-label="Delete probe"
          className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-lv-error text-white shadow hover:scale-110 transition-transform"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
}
