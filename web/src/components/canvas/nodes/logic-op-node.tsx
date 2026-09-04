"use client";

import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";
import type { LogicOp } from "@/lib/algorithms/propositional-logic";

export interface LogicOpNodeData {
  label: string;
  kind: "logic-op";
  symbol: LogicOp;
  truthValue?: boolean;
  hasValue?: boolean;
  [key: string]: unknown;
}

const OP_LIST: { symbol: LogicOp; label: string; isUnary?: boolean }[] = [
  { symbol: "¬", label: "NOT", isUnary: true },
  { symbol: "∧", label: "AND" },
  { symbol: "∨", label: "OR" },
  { symbol: "→", label: "IMPLIES" },
  { symbol: "↔", label: "IFF" },
  { symbol: "⊕", label: "XOR" },
];

export function LogicOpNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as LogicOpNodeData;
  const deleteNode = useWorkspaceStore((s) => s.deleteNode);
  const setNodes = useWorkspaceStore((s) => s.setNodes);
  const nodes = useWorkspaceStore((s) => s.nodes);
  const [menuOpen, setMenuOpen] = useState(false);

  const symbol = nodeData.symbol || "∧";
  const isUnary = symbol === "¬";
  const hasValue = Boolean(nodeData.hasValue);
  const truthValue = Boolean(nodeData.truthValue);

  function handleSwitchOp(newSymbol: LogicOp, newLabel: string) {
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
        "group relative flex min-w-[70px] flex-col items-center justify-center rounded-2xl border bg-lv-panel/95 p-2 shadow-xl shadow-black/40 backdrop-blur-md transition-all",
        selected
          ? "border-lv-cyan ring-2 ring-lv-cyan/50"
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
          className="!h-3 !w-3 !border-2 !border-lv-cyan !bg-lv-surface hover:!scale-125 transition-transform"
        />
      ) : (
        <>
          <div className="absolute -left-3 top-2.5 flex items-center">
            <Handle
              type="target"
              position={Position.Left}
              id="handle-p"
              className="!h-2.5 !w-2.5 !border-2 !border-lv-cyan !bg-lv-panel"
            />
            <span className="ml-3 text-[9px] font-mono text-lv-cyan font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              P
            </span>
          </div>
          <div className="absolute -left-3 bottom-2.5 flex items-center">
            <Handle
              type="target"
              position={Position.Left}
              id="handle-q"
              className="!h-2.5 !w-2.5 !border-2 !border-lv-purple !bg-lv-panel"
            />
            <span className="ml-3 text-[9px] font-mono text-lv-purple font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Q
            </span>
          </div>
        </>
      )}

      {/* Gate button */}
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-lv-cyan/20 to-lv-purple/20 hover:from-lv-cyan/30 hover:to-lv-purple/30 transition-all active:scale-95"
      >
        <span className="font-mono text-2xl font-bold text-lv-text">{symbol}</span>
      </button>

      <div className="mt-1 flex items-center gap-1">
        <span className="text-[10px] font-medium text-lv-muted truncate max-w-[60px]">
          {nodeData.label}
        </span>
        {hasValue && (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              truthValue ? "bg-lv-success" : "bg-lv-error"
            )}
          />
        )}
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="handle-out"
        className="!h-3 !w-3 !border-2 !border-lv-cyan !bg-lv-surface hover:!scale-125 transition-transform"
      />

      {/* Delete button */}
      {selected && (
        <button
          type="button"
          onClick={() => deleteNode(id)}
          aria-label="Delete gate"
          className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-lv-error text-white shadow hover:scale-110 transition-transform"
        >
          <Trash2 className="h-2.5 w-2.5" />
        </button>
      )}

      {/* Dropdown to switch connective */}
      {menuOpen && (
        <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-xl border border-lv-border bg-lv-panel p-1.5 shadow-2xl backdrop-blur-xl w-36 space-y-0.5">
          <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-lv-faint">
            Connective
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
