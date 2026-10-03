"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";

export interface SetNodeData {
  label: string;
  kind: "set";
  elements: (string | number)[];
  accent?: "blue" | "purple" | "cyan";
  [key: string]: unknown;
}

const ACCENT: Record<string, { ring: string; text: string; dot: string; border: string }> = {
  blue: {
    ring: "ring-lv-blue/40",
    text: "text-lv-blue",
    dot: "bg-lv-blue",
    border: "border-lv-blue/50",
  },
  purple: {
    ring: "ring-lv-purple/40",
    text: "text-lv-purple",
    dot: "bg-lv-purple",
    border: "border-lv-purple/50",
  },
  cyan: {
    ring: "ring-lv-cyan/40",
    text: "text-lv-cyan",
    dot: "bg-lv-cyan",
    border: "border-lv-cyan/50",
  },
};

export function SetNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as SetNodeData;
  const deleteNode = useWorkspaceStore((s) => s.deleteNode);
  const accent = ACCENT[nodeData.accent ?? "blue"] || ACCENT.blue;
  const elements = Array.isArray(nodeData.elements) ? nodeData.elements : [];

  return (
    <div
      title="Double-click to edit this set"
      className={cn(
        "group relative min-w-[180px] max-w-[260px] cursor-pointer rounded-xl border bg-lv-panel/95 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur-md transition-all hover:border-lv-faint",
        accent.border,
        selected ? `ring-2 ${accent.ring}` : ""
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="handle-in"
        className="!h-2.5 !w-2.5 !border-lv-border !bg-lv-faint hover:!scale-125 transition-transform"
      />

      <div className="flex items-center gap-2 border-b border-lv-border-soft/60 pb-2">
        <span className={cn("h-2 w-2 rounded-full shrink-0 shadow-sm", accent.dot)} />
        <span className={cn("font-mono text-sm font-bold truncate", accent.text)}>
          {nodeData.label}
        </span>
        <span className="ml-auto font-mono text-[10px] text-lv-faint">
          |{nodeData.label}| = {elements.length}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1 max-h-24 overflow-y-auto lv-scrollbar">
        {elements.length === 0 ? (
          <span className="font-mono text-xs text-lv-faint italic">∅ (empty set)</span>
        ) : (
          elements.map((el, i) => (
            <span
              key={i}
              className="rounded-md bg-lv-surface border border-lv-border px-1.5 py-0.5 font-mono text-[11px] text-lv-muted"
            >
              {String(el)}
            </span>
          ))
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="handle-out"
        className={cn(
          "!h-3 !w-3 !border-2 !border-lv-panel hover:!scale-125 transition-transform",
          accent.dot
        )}
      />

      {/* Action buttons on hover/select */}
      {selected && (
        <div className="absolute -top-2.5 -right-2.5 flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(id);
            }}
            aria-label="Delete set"
            className="flex h-5 w-5 items-center justify-center rounded-full bg-lv-error text-white shadow hover:scale-110 transition-transform"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
    </div>
  );
}
