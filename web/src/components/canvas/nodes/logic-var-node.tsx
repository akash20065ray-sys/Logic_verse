"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";

export interface LogicVarNodeData {
  label: string;
  kind: "logic-var";
  value: boolean;
  [key: string]: unknown;
}

export function LogicVarNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as LogicVarNodeData;
  const deleteNode = useWorkspaceStore((s) => s.deleteNode);
  const setNodes = useWorkspaceStore((s) => s.setNodes);
  const nodes = useWorkspaceStore((s) => s.nodes);

  const value = Boolean(nodeData.value ?? true);
  const isConstant = nodeData.label === "⊤" || nodeData.label === "⊥";

  function toggleValue() {
    if (isConstant) return;
    const updated = nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, value: !value } } : n
    );
    setNodes(updated);
  }

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border bg-lv-panel/95 px-3.5 py-2.5 shadow-xl shadow-black/40 backdrop-blur-md transition-all",
        value ? "border-lv-cyan/50 shadow-lv-cyan/10" : "border-lv-border",
        selected && "ring-2 ring-lv-cyan/50"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-base font-bold text-lv-text">
          {nodeData.label || "P"}
        </span>
      </div>

      {/* Interactive Truth Switcher */}
      <button
        type="button"
        onClick={toggleValue}
        disabled={isConstant}
        title={isConstant ? "Constant value" : "Click to toggle truth assignment (T / F)"}
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-lg font-mono text-xs font-bold transition-all active:scale-95",
          value
            ? "bg-lv-success/20 text-lv-success border border-lv-success/40"
            : "bg-lv-error/20 text-lv-error border border-lv-error/40"
        )}
      >
        {value ? "T" : "F"}
      </button>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="handle-out"
        className={cn(
          "!h-3 !w-3 !border-2 !border-lv-panel hover:!scale-125 transition-transform",
          value ? "!bg-lv-success" : "!bg-lv-error"
        )}
      />

      {/* Delete button */}
      {selected && (
        <button
          type="button"
          onClick={() => deleteNode(id)}
          aria-label="Delete variable"
          className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-lv-error text-white shadow hover:scale-110 transition-transform"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
}
