"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface SetFormValues {
  label: string;
  elements: (string | number)[];
}

interface SetFormModalProps {
  open: boolean;
  title: string;
  initial?: SetFormValues;
  onSubmit: (values: SetFormValues) => void;
  onClose: () => void;
}

// Parses a comma-separated string into set elements, converting to numbers
// where possible (so {2, 4, 6} behaves numerically) and trimming whitespace.
function parseElements(raw: string): (string | number)[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => (isFinite(Number(s)) && s !== "" ? Number(s) : s));
}

export function SetFormModal({ open, title, initial, onSubmit, onClose }: SetFormModalProps) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [elementsRaw, setElementsRaw] = useState(initial?.elements.join(", ") ?? "");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setLabel(initial?.label ?? "");
      setElementsRaw(initial?.elements.join(", ") ?? "");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, initial]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      setError("Give your set a name, e.g. A");
      return;
    }
    const elements = parseElements(elementsRaw);
    if (elements.length === 0) {
      setError("Add at least one element, separated by commas");
      return;
    }
    onSubmit({ label: trimmedLabel, elements });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-lv-border bg-lv-panel p-5 shadow-2xl shadow-black/50">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-lv-text">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-lv-faint transition-colors hover:bg-lv-surface hover:text-lv-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="set-name" className="mb-1.5 block text-xs text-lv-muted">
              Set name
            </label>
            <input
              ref={inputRef}
              id="set-name"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="A"
              maxLength={12}
              className="w-full rounded-lg border border-lv-border bg-lv-surface px-3 py-2 font-mono text-sm text-lv-text placeholder:text-lv-faint focus:outline-none focus:ring-1 focus:ring-lv-cyan"
            />
          </div>

          <div>
            <label htmlFor="set-elements" className="mb-1.5 block text-xs text-lv-muted">
              Elements (comma-separated)
            </label>
            <input
              id="set-elements"
              value={elementsRaw}
              onChange={(e) => setElementsRaw(e.target.value)}
              placeholder="1, 2, 3, apple, x"
              className="w-full rounded-lg border border-lv-border bg-lv-surface px-3 py-2 font-mono text-sm text-lv-text placeholder:text-lv-faint focus:outline-none focus:ring-1 focus:ring-lv-cyan"
            />
            <p className="mt-1.5 text-[11px] text-lv-faint">
              Numbers and text both work — duplicates are removed automatically.
            </p>
          </div>

          {error && <p className="text-xs text-lv-error">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs text-lv-muted transition-colors hover:bg-lv-surface hover:text-lv-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-lv-blue px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600"
            >
              {initial ? "Save changes" : "Add set"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
