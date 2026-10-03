"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";

export interface ResultNodeData {
  label: string;
  kind: "result";
  elements: (string | number)[];
  hasComputedValue?: boolean;
  [key: string]: unknown;
}

export function ResultNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as ResultNodeData;
  const deleteNode = useWorkspaceStore((s) => s.deleteNode);
  const elements = Array.isArray(nodeData.elements) ? nodeData.elements : [];
  const hasValue = nodeData.hasComputedValue ?? elements.length > 0;

  return (
    <div
      className={cn(
        "group relative min-w-[190px] max-w-[280px] rounded-xl border bg-gradient-to-br from-lv-panel via-lv-panel to-lv-surface/90 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur-md transition-all",
        hasValue ? "border-lv-cyan/50 shadow-lv-cyan/10" : "border-lv-border border-dashed",
        selected && "ring-2 ring-lv-cyan/50"
      )}
    >
      {/* Input handle from operation */}
      <Handle
        type="target"
        position={Position.Left}
        id="handle-in"
        className="!h-3 !w-3 !border-2 !border-lv-cyan !bg-lv-panel hover:!scale-125 transition-transform"
      />

      <div className="flex items-center gap-1.5 border-b border-lv-border-soft/60 pb-2">
        <Sparkles className="h-3.5 w-3.5 text-lv-cyan shrink-0" />
        <span className="font-mono text-xs font-semibold text-lv-cyan truncate">
          {nodeData.label || "Result"}
        </span>
        <span className="ml-auto rounded-full bg-lv-cyan/10 px-1.5 py-0.5 font-mono text-[10px] text-lv-cyan">
          n={elements.length}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1 max-h-24 overflow-y-auto lv-scrollbar">
        {elements.length === 0 ? (
          <span className="font-mono text-xs text-lv-faint italic">
            {hasValue ? "∅ (empty set)" : "Connect operation…"}
          </span>
        ) : (
          <>
            {elements.slice(0, 12).map((el, i) => (
              <span
                key={i}
                className="rounded-md bg-lv-cyan/10 border border-lv-cyan/20 px-1.5 py-0.5 font-mono text-[11px] text-lv-text"
              >
                {String(el)}
              </span>
            ))}
            {elements.length > 12 && (
              <span className="rounded-md bg-lv-surface px-1.5 py-0.5 font-mono text-[10px] text-lv-faint">
                +{elements.length - 12} more
              </span>
            )}
          </>
        )}
      </div>

      {/* Output handle so results can be chained into further operations! */}
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
          aria-label="Delete result"
          className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-lv-error text-white shadow hover:scale-110 transition-transform"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
}
