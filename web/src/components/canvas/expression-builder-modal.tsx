"use client";

import { useState, useRef, useEffect } from "react";
import { X, Sparkles, Wand2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { parseExpression } from "@/lib/algorithms/expression-parser";
import { buildCanvasFromAST } from "@/lib/algorithms/ast-canvas-builder";
import { formatAST, formatASTLatex } from "@/lib/algorithms/propositional-logic";
import { useWorkspaceStore } from "@/store/workspace-store";

interface ExpressionBuilderModalProps {
  open: boolean;
  onClose: () => void;
}

const PRESETS = [
  { label: "De Morgan's Law", expr: "¬(P ∧ Q) ↔ (¬P ∨ ¬Q)" },
  { label: "Transitivity of Implication", expr: "((P → Q) ∧ (Q → R)) → (P → R)" },
  { label: "Material Implication", expr: "(P → Q) ↔ (¬P ∨ Q)" },
  { label: "Modus Ponens", expr: "((P → Q) ∧ P) → Q" },
  { label: "Law of Excluded Middle", expr: "P ∨ ¬P" },
  { label: "XOR Equivalence", expr: "(P ⊕ Q) ↔ ((P ∨ Q) ∧ ¬(P ∧ Q))" },
];

const SYMBOLS = [
  { char: "P", label: "P" },
  { char: "Q", label: "Q" },
  { char: "R", label: "R" },
  { char: "S", label: "S" },
  { char: "¬", label: "NOT ¬" },
  { char: "∧", label: "AND ∧" },
  { char: "∨", label: "OR ∨" },
  { char: "→", label: "→ IMPLIES" },
  { char: "↔", label: "↔ IFF" },
  { char: "⊕", label: "⊕ XOR" },
  { char: "(", label: "(" },
  { char: ")", label: ")" },
];

export function ExpressionBuilderModal({ open, onClose }: ExpressionBuilderModalProps) {
  const [expression, setExpression] = useState("((P → Q) ∧ P) → Q");
  const [error, setError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);

  // Validate on input change
  useEffect(() => {
    if (!expression.trim()) {
      setError("Enter a Boolean expression.");
      setParsedPreview(null);
      return;
    }
    try {
      const ast = parseExpression(expression);
      setError(null);
      setParsedPreview(formatAST(ast));
    } catch (err: unknown) {
      setError((err as Error).message);
      setParsedPreview(null);
    }
  }, [expression]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  function insertSymbol(sym: string) {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart ?? expression.length;
    const end = inputRef.current.selectionEnd ?? expression.length;
    const next = expression.slice(0, start) + sym + expression.slice(end);
    setExpression(next);
    setTimeout(() => {
      inputRef.current?.focus();
      const nextPos = start + sym.length;
      inputRef.current?.setSelectionRange(nextPos, nextPos);
    }, 0);
  }

  function handleBuildOnCanvas() {
    try {
      const ast = parseExpression(expression);
      const { nodes, edges } = buildCanvasFromAST(ast);
      recomputeGraph(nodes, edges);
      setOutputTab("output");
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-lv-border bg-lv-panel p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-lv-border-soft pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lv-cyan/15 text-lv-cyan">
              <Wand2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-lv-text">Expression Builder</h2>
              <p className="text-xs text-lv-faint">Type or construct any propositional formula</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-lv-faint hover:bg-lv-surface hover:text-lv-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Input area */}
        <div className="space-y-2">
          <label htmlFor="expr-input" className="text-xs font-mono uppercase tracking-wider text-lv-faint font-semibold">
            Formula Expression
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              id="expr-input"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !error && handleBuildOnCanvas()}
              placeholder="e.g. (P ∧ Q) → R or P -> Q"
              className="w-full rounded-xl border border-lv-border bg-lv-surface px-3.5 py-2.5 font-mono text-sm text-lv-text placeholder:text-lv-faint focus:border-lv-cyan focus:outline-none focus:ring-1 focus:ring-lv-cyan"
            />
          </div>

          {/* Validation preview or error */}
          {error ? (
            <div className="flex items-center gap-1.5 text-xs text-lv-error">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : parsedPreview ? (
            <div className="flex items-center gap-1.5 text-xs text-lv-success">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono text-lv-muted">Parsed WFF:</span>
              <span className="font-mono font-bold text-lv-cyan">{parsedPreview}</span>
            </div>
          ) : null}
        </div>

        {/* Keypad */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-lv-faint font-semibold">
            Quick-Insert Symbol Keypad
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SYMBOLS.map((s) => (
              <button
                key={s.char}
                type="button"
                onClick={() => insertSymbol(s.char)}
                className="flex items-center justify-center rounded-lg border border-lv-border bg-lv-surface/80 px-2.5 py-1.5 font-mono text-xs font-bold text-lv-text hover:border-lv-cyan/50 hover:bg-lv-surface hover:text-lv-cyan transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-lv-faint font-semibold">
            One-Click Theorem Presets
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setExpression(p.expr)}
                className="flex items-center justify-between rounded-lg border border-lv-border bg-lv-panel px-2.5 py-1.5 text-left text-xs text-lv-muted hover:border-lv-purple/40 hover:bg-lv-surface hover:text-lv-text transition-colors"
              >
                <span className="truncate">{p.label}</span>
                <span className="font-mono text-[10px] text-lv-faint">{p.expr.slice(0, 14)}…</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions footer */}
        <div className="flex items-center justify-between border-t border-lv-border-soft pt-3">
          <span className="text-[11px] text-lv-faint font-mono">
            Accepts both math (∧, ∨, ¬, →) & keyboard (&, |, ~, -&gt;)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3.5 py-1.5 text-xs text-lv-muted hover:bg-lv-surface hover:text-lv-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBuildOnCanvas}
              disabled={!!error}
              className="flex items-center gap-1.5 rounded-lg bg-lv-cyan px-4 py-1.5 font-mono text-xs font-bold text-black hover:bg-cyan-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(34,211,238,0.3)]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Build on Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
