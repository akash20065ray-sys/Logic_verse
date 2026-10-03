"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";
import type { SetOperationSymbol } from "@/lib/algorithms/set-theory";

export interface OperationNodeData {
  label: string;
  kind: "operation";
  symbol: SetOperationSymbol;
  [key: string]: unknown;
}

const OP_LIST: { symbol: SetOperationSymbol; label: string; isUnary?: boolean }[] = [
  { symbol: "∪", label: "Union" },
  { symbol: "∩", label: "Intersection" },
  { symbol: "−", label: "Difference" },
  { symbol: "⊕", label: "Symmetric Diff" },
  { symbol: "×", label: "Cartesian Prod" },
  { symbol: "𝒫", label: "Power Set", isUnary: true },
  { symbol: "|·|", label: "Cardinality", isUnary: true },
  { symbol: "∁", label: "Complement", isUnary: true },
];

export function OperationNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as OperationNodeData;
  const deleteNode = useWorkspaceStore((s) => s.deleteNode);
  const setNodes = useWorkspaceStore((s) => s.setNodes);
  const nodes = useWorkspaceStore((s) => s.nodes);
  const [menuOpen, setMenuOpen] = useState(false);

  const symbol = nodeData.symbol || "∪";
  const isUnary = symbol === "𝒫" || symbol === "|·|" || symbol === "∁";

  function handleSwitchOp(newSymbol: SetOperationSymbol, newLabel: string) {
    const updated = nodes.map((n) =>
      n.id === id
        ? {
            ...n,
            data: {
              ...n.data,
              symbol: newSymbol,
              label: newLabel,
            },
          }
        : n
    );
    setNodes(updated);
    setMenuOpen(false);
  }

  return (
    <div
      className={cn(
        "group relative flex min-w-[72px] flex-col items-center justify-center rounded-2xl border bg-lv-panel/95 p-2 shadow-xl shadow-black/40 backdrop-blur-md transition-all",
        selected
          ? "border-lv-purple ring-2 ring-lv-purple/50 shadow-lv-purple/20"
          : "border-lv-border hover:border-lv-faint"
      )}
      title={`${nodeData.label} (${symbol})`}
    >
      {/* Handles */}
      {isUnary ? (
        <Handle
          type="target"
          position={Position.Left}
          id="handle-unary"
          className="!h-3 !w-3 !border-2 !border-lv-purple !bg-lv-surface hover:!scale-125 transition-transform"
        />
      ) : (
        <>
          <div className="absolute -left-3 top-2.5 flex items-center">
            <Handle
              type="target"
              position={Position.Left}
              id="handle-a"
              className="!h-2.5 !w-2.5 !border-2 !border-lv-blue !bg-lv-panel"
            />
            <span className="ml-3 text-[9px] font-mono text-lv-blue font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              A
            </span>
          </div>
          <div className="absolute -left-3 bottom-2.5 flex items-center">
            <Handle
              type="target"
              position={Position.Left}
              id="handle-b"
              className="!h-2.5 !w-2.5 !border-2 !border-lv-purple !bg-lv-panel"
            />
            <span className="ml-3 text-[9px] font-mono text-lv-purple font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              B
            </span>
          </div>
        </>
      )}

      {/* Symbol Display & Switcher button */}
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-lv-purple/20 to-lv-blue/20 hover:from-lv-purple/30 hover:to-lv-blue/30 transition-all active:scale-95"
      >
        <span className="font-mono text-2xl font-bold text-lv-text">{symbol}</span>
      </button>

      <span className="mt-1 text-[10px] font-medium text-lv-muted truncate max-w-[68px]">
        {nodeData.label}
      </span>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="handle-out"
        className="!h-3 !w-3 !border-2 !border-lv-cyan !bg-lv-surface hover:!scale-125 transition-transform"
      />

      {/* Delete button on hover / selected */}
      {selected && (
        <button
          type="button"
          onClick={() => deleteNode(id)}
          aria-label="Delete operation"
          className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-lv-error text-white shadow hover:scale-110 transition-transform"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      )}

      {/* Quick Op Selector Dropdown */}
      {menuOpen && (
        <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-xl border border-lv-border bg-lv-panel p-1.5 shadow-2xl backdrop-blur-xl w-36 space-y-0.5">
          <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-lv-faint">
            Change Operation
          </div>
          {OP_LIST.map((op) => (
            <button
              key={op.symbol}
              type="button"
              onClick={() => handleSwitchOp(op.symbol, op.label)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs font-mono transition-colors",
                op.symbol === symbol
                  ? "bg-lv-surface text-lv-cyan font-bold"
                  : "text-lv-muted hover:bg-lv-surface/70 hover:text-lv-text"
              )}
            >
              <span>{op.label}</span>
              <span className="text-sm font-bold text-lv-text">{op.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
