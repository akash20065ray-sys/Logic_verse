"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";

export interface AutomataStateFormValues {
  label: string;
  isStart: boolean;
  isAccept: boolean;
  mooreOutput?: string;
}

interface AutomataStateModalProps {
  open: boolean;
  title: string;
  initial: AutomataStateFormValues;
  onSubmit: (values: AutomataStateFormValues) => void;
  onClose: () => void;
}

export function AutomataStateModal({
  open,
  title,
  initial,
  onSubmit,
  onClose,
}: AutomataStateModalProps) {
  const [label, setLabel] = useState(initial.label);
  const [isStart, setIsStart] = useState(initial.isStart);
  const [isAccept, setIsAccept] = useState(initial.isAccept);
  const [mooreOutput, setMooreOutput] = useState(initial.mooreOutput || "0");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    onSubmit({
      label: label.trim(),
      isStart,
      isAccept,
      mooreOutput: mooreOutput.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-lv-border bg-lv-panel p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-lv-border-soft pb-3">
          <h3 className="text-sm font-bold text-lv-text">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-lv-faint hover:text-lv-text transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-lv-muted mb-1">
              State Label (e.g. q0, q1, S0)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-xl border border-lv-border bg-lv-surface px-3 py-2 text-sm font-mono text-lv-text focus:border-lv-cyan focus:outline-none"
              placeholder="State name..."
              autoFocus
            />
          </div>

          <div className="space-y-2 pt-1 border-t border-lv-border-soft">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isStart}
                onChange={(e) => setIsStart(e.target.checked)}
                className="h-4 w-4 rounded border-lv-border bg-lv-surface text-lv-cyan focus:ring-0"
              />
              <span className="text-xs font-semibold text-lv-text">
                Start State (Initial Configuration)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAccept}
                onChange={(e) => setIsAccept(e.target.checked)}
                className="h-4 w-4 rounded border-lv-border bg-lv-surface text-lv-purple focus:ring-0"
              />
              <span className="text-xs font-semibold text-lv-text">
                Accept State (Final / F)
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-lv-muted mb-1">
              Moore Machine Output Symbol (optional)
            </label>
            <input
              type="text"
              value={mooreOutput}
              onChange={(e) => setMooreOutput(e.target.value)}
              className="w-full rounded-xl border border-lv-border bg-lv-surface px-3 py-2 text-sm font-mono text-lv-text focus:border-lv-cyan focus:outline-none"
              placeholder="e.g. 0, 1, A..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-lv-border-soft">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-lv-border bg-lv-surface px-3 py-1.5 text-xs text-lv-muted hover:text-lv-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 rounded-xl bg-lv-cyan px-4 py-1.5 text-xs font-semibold text-lv-bg hover:opacity-90 transition-opacity"
            >
              <Check className="h-3.5 w-3.5" />
              Save State
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
