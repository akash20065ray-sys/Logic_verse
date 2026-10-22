"use client";

import { useState, useMemo } from "react";
import {
  Grid3X3,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  GitBranch,
  Route,
  ArrowRight,
  Layers,
  Download,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  evaluateRelationProperties,
  buildRelationMatrix,
  computeWarshall,
  RELATION_PRESETS,
} from "@/lib/algorithms/relations";
import { useWorkspaceStore } from "@/store/workspace-store";
import type { SetNodeData } from "../canvas/nodes/set-node";

export function RelationMatrixView() {
  const elements = useWorkspaceStore((s) => s.relationsElements);
  const pairs = useWorkspaceStore((s) => s.relationsPairs);
  const setElements = useWorkspaceStore((s) => s.setRelationsElements);
  const setPairs = useWorkspaceStore((s) => s.setRelationsPairs);
  const togglePair = useWorkspaceStore((s) => s.toggleRelationPair);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);
  const nodes = useWorkspaceStore((s) => s.nodes);

  const [activePresetIdx, setActivePresetIdx] = useState<number>(0);
  const [elementsInput, setElementsInput] = useState<string>(elements.join(", "));
  const [pairsInput, setPairsInput] = useState<string>("");
  const [showPairInput, setShowPairInput] = useState<boolean>(false);

  // Check if any set nodes exist on the canvas
  const canvasSetNodes = useMemo(() => {
    return nodes.filter((n) => n.type === "set" && n.data?.elements && Array.isArray(n.data.elements));
  }, [nodes]);

  function loadPreset(idx: number) {
    setActivePresetIdx(idx);
    const p = RELATION_PRESETS[idx];
    if (!p) return;
    setElements([...p.elements]);
    setPairs([...p.pairs]);
    setElementsInput(p.elements.join(", "));
  }

  function handleApplyElements() {
    const raw = elementsInput
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const unique = Array.from(new Set(raw));
    if (unique.length === 0) return;
    setElements(unique);
    // filter pairs that reference non-existent elements
    const validPairs = pairs.filter(([a, b]) => unique.includes(a) && unique.includes(b));
    setPairs(validPairs);
  }

  function handleApplyCustomPairs() {
    if (!pairsInput.trim()) return;
    // Matches patterns like (a,b), (1, 2), a,b, 1-2 etc.
    const regex = /\(?\s*([a-zA-Z0-9_]+)\s*[,:\-]\s*([a-zA-Z0-9_]+)\s*\)?/g;
    const matches: [string, string][] = [];
    let match;
    while ((match = regex.exec(pairsInput)) !== null) {
      const a = match[1];
      const b = match[2];
      if (elements.includes(a) && elements.includes(b)) {
        if (!matches.some(([x, y]) => x === a && y === b)) {
          matches.push([a, b]);
        }
      }
    }
    if (matches.length > 0) {
      // Merge with existing or replace
      const merged = [...pairs];
      for (const p of matches) {
        if (!merged.some(([x, y]) => x === p[0] && y === p[1])) {
          merged.push(p);
        }
      }
      setPairs(merged);
      setPairsInput("");
      setShowPairInput(false);
    }
  }

  function handleImportCanvasSet(node: typeof nodes[0]) {
    const data = node.data as unknown as SetNodeData;
    if (data?.elements && data.elements.length > 0) {
      const newElems = data.elements.map(String);
      setElements(newElems);
      setElementsInput(newElems.join(", "));
      // Filter out invalid pairs
      setPairs(pairs.filter(([a, b]) => newElems.includes(a) && newElems.includes(b)));
    }
  }

  // --- Quick Closures & Operations ---
  function applyIdentity() {
    const diag: [string, string][] = elements.map((e) => [e, e]);
    setPairs(diag);
  }

  function applyUniversal() {
    const all: [string, string][] = [];
    for (const a of elements) {
      for (const b of elements) {
        all.push([a, b]);
      }
    }
    setPairs(all);
  }

  function applyClear() {
    setPairs([]);
  }

  function applyReflexiveClosure() {
    const next = [...pairs];
    for (const e of elements) {
      if (!next.some(([x, y]) => x === e && y === e)) {
        next.push([e, e]);
      }
    }
    setPairs(next);
  }

  function applySymmetricClosure() {
    const next = [...pairs];
    for (const [a, b] of pairs) {
      if (!next.some(([x, y]) => x === b && y === a)) {
        next.push([b, a]);
      }
    }
    setPairs(next);
  }

  function applyTransitiveClosure() {
    const warshallSteps = computeWarshall(elements, pairs);
    const finalStep = warshallSteps[warshallSteps.length - 1];
    if (!finalStep) return;
    const nextPairs: [string, string][] = [];
    for (let i = 0; i < elements.length; i++) {
      for (let j = 0; j < elements.length; j++) {
        if (finalStep.matrix[i][j]) {
          nextPairs.push([elements[i], elements[j]]);
        }
      }
    }
    setPairs(nextPairs);
  }

  const matrix = useMemo(() => buildRelationMatrix(elements, pairs), [elements, pairs]);
  const props = useMemo(() => evaluateRelationProperties(elements, pairs), [elements, pairs]);

  return (
    <div className="flex h-full flex-col space-y-4 overflow-y-auto p-4 lv-scrollbar text-lv-text">
      {/* Top Header & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lv-border-soft pb-3">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-4 w-4 text-lv-purple" />
          <h3 className="text-sm font-bold text-lv-text">
            Relation Adjacency Matrix & Property Verifier
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activePresetIdx}
            onChange={(e) => loadPreset(Number(e.target.value))}
            className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted font-mono focus:border-lv-purple focus:outline-hidden"
          >
            {RELATION_PRESETS.map((p, idx) => (
              <option key={idx} value={idx}>
                Preset: {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => loadPreset(activePresetIdx)}
            className="flex items-center gap-1 rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-xs text-lv-muted hover:text-lv-text font-mono transition-colors"
            title="Reset to preset defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Set Elements Custom Input & Canvas Sync Bar */}
      <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-3.5 shadow-md space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-lv-text">
            <span className="text-lv-purple">Set A Elements:</span>
            <span className="text-[11px] text-lv-faint">|A| = {elements.length}</span>
          </div>

          {canvasSetNodes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-lv-faint font-mono uppercase">Canvas:</span>
              {canvasSetNodes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleImportCanvasSet(n)}
                  className="rounded-md border border-lv-purple/40 bg-lv-purple/10 px-2 py-0.5 text-[11px] font-mono text-lv-purple hover:bg-lv-purple/20 transition-colors"
                  title={`Import elements from canvas set ${(n.data as unknown as SetNodeData).label}`}
                >
                  Import {(n.data as unknown as SetNodeData).label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={elementsInput}
            onChange={(e) => setElementsInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApplyElements()}
            placeholder="e.g. 1, 2, 3, 4, 5 or a, b, c, d"
            className="flex-1 rounded-xl border border-lv-border bg-lv-panel px-3 py-1.5 text-xs font-mono text-lv-text focus:border-lv-purple focus:outline-hidden"
          />
          <button
            type="button"
            onClick={handleApplyElements}
            className="rounded-xl border border-lv-purple/40 bg-lv-purple/20 px-3 py-1.5 text-xs font-bold text-lv-purple hover:bg-lv-purple/30 transition-colors"
          >
            Apply Set A
          </button>
        </div>
      </div>

      {/* Quick Closures & Pair Action Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
        <span className="text-[10px] uppercase text-lv-faint font-bold mr-1">Quick Relations:</span>
        <button
          type="button"
          onClick={applyIdentity}
          className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-[11px] text-lv-muted hover:text-lv-text hover:border-lv-border-hover transition-colors"
          title="Diagonal relation: (a, a) for all a"
        >
          Identity I_A
        </button>
        <button
          type="button"
          onClick={applyUniversal}
          className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-[11px] text-lv-muted hover:text-lv-text hover:border-lv-border-hover transition-colors"
          title="Universal relation: A × A"
        >
          Universal A×A
        </button>
        <button
          type="button"
          onClick={applyClear}
          className="rounded-lg border border-lv-border bg-lv-surface px-2.5 py-1 text-[11px] text-lv-error/80 hover:text-lv-error hover:border-lv-error/40 transition-colors"
          title="Empty relation: ∅"
        >
          Clear (∅)
        </button>

        <span className="text-lv-border mx-1">|</span>

        <button
          type="button"
          onClick={applyReflexiveClosure}
          className="rounded-lg border border-lv-purple/30 bg-lv-purple/10 px-2 py-1 text-[11px] text-lv-purple hover:bg-lv-purple/20 transition-colors"
          title="Add all missing (a, a) diagonal pairs"
        >
          + Reflexive Closure
        </button>
        <button
          type="button"
          onClick={applySymmetricClosure}
          className="rounded-lg border border-lv-purple/30 bg-lv-purple/10 px-2 py-1 text-[11px] text-lv-purple hover:bg-lv-purple/20 transition-colors"
          title="Add reverse (b, a) for all (a, b)"
        >
          + Symmetric Closure
        </button>
        <button
          type="button"
          onClick={applyTransitiveClosure}
          className="rounded-lg border border-lv-purple/30 bg-lv-purple/10 px-2 py-1 text-[11px] text-lv-purple hover:bg-lv-purple/20 transition-colors"
          title="Add transitive edges using Warshall's algorithm"
        >
          + Transitive Closure (R⁺)
        </button>

        <button
          type="button"
          onClick={() => setShowPairInput(!showPairInput)}
          className="ml-auto rounded-lg border border-lv-border bg-lv-surface px-2 py-1 text-[11px] text-lv-cyan hover:border-lv-cyan transition-colors"
        >
          {showPairInput ? "Hide Pair Input" : "+ Type Custom Pairs"}
        </button>
      </div>

      {showPairInput && (
        <div className="rounded-xl border border-lv-cyan/30 bg-lv-cyan/5 p-3 space-y-2">
          <div className="text-[11px] font-mono text-lv-cyan">
            Type or paste pairs: e.g. <span className="font-bold">(1, 2), (2, 3), (3, 1)</span> or <span className="font-bold">a,b; b,c</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={pairsInput}
              onChange={(e) => setPairsInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCustomPairs()}
              placeholder="(1, 2), (2, 3), (3, 1)"
              className="flex-1 rounded-lg border border-lv-border bg-lv-panel px-3 py-1 text-xs font-mono text-lv-text focus:border-lv-cyan focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleApplyCustomPairs}
              className="rounded-lg border border-lv-cyan bg-lv-cyan/20 px-3 py-1 text-xs font-bold text-lv-cyan hover:bg-lv-cyan/30 transition-colors"
            >
              Add Pairs
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive 0/1 Matrix */}
        <div className="lg:col-span-6 space-y-3">
          <div className="rounded-2xl border border-lv-border bg-lv-panel/70 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-lv-faint">
              <span>Click cells to toggle (a, b) ∈ R</span>
              <span className="text-lv-purple font-bold">|R| = {pairs.length} pairs</span>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto py-2">
              <table className="border-collapse font-mono text-xs mx-auto select-none">
                <thead>
                  <tr>
                    <th className="p-2 text-lv-faint text-right font-bold w-10">R</th>
                    {elements.map((e) => (
                      <th key={e} className="p-2 text-center text-lv-cyan font-bold min-w-9">
                        {e}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {elements.map((rowElem, i) => (
                    <tr key={rowElem}>
                      <td className="p-2 text-right text-lv-cyan font-bold">{rowElem}</td>
                      {elements.map((colElem, j) => {
                        const isSet = matrix[i]?.[j] ?? false;
                        const isDiagonal = i === j;

                        return (
                          <td key={colElem} className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => togglePair(rowElem, colElem)}
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-xs font-bold transition-all",
                                isSet
                                  ? "bg-lv-purple/30 border-lv-purple text-lv-purple shadow-xs scale-105"
                                  : "bg-lv-surface/30 border-lv-border-soft/40 text-lv-faint hover:border-lv-border",
                                isDiagonal && "ring-1 ring-lv-cyan/30"
                              )}
                              title={`Toggle (${rowElem}, ${colElem})`}
                            >
                              {isSet ? "1" : "0"}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Active Pairs Roster */}
            <div className="rounded-xl border border-lv-border-soft bg-lv-surface/50 p-2.5 text-xs font-mono text-lv-muted space-y-1">
              <div className="text-[10px] uppercase text-lv-faint font-semibold">Roster Representation:</div>
              <div className="text-lv-text break-words max-h-20 overflow-y-auto lv-scrollbar text-[11px]">
                R = {"{"} {pairs.map(([a, b]) => `(${a}, ${b})`).join(", ")} {"}"}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mathematical Classification & Proof Checks */}
        <div className="lg:col-span-6 space-y-4">
          {/* Classification Badges */}
          <div className="rounded-2xl border border-lv-border bg-lv-surface/70 p-4 shadow-xl space-y-3">
            <div className="text-xs font-mono font-bold text-lv-text uppercase tracking-wider flex flex-wrap items-center justify-between gap-2">
              <span>Relation Classification</span>
              <div className="flex items-center gap-1.5">
                {props.isEquivalence && (
                  <span className="rounded-full bg-lv-success/20 border border-lv-success/40 px-2.5 py-0.5 text-lv-success font-bold text-[10px]">
                    EQUIVALENCE RELATION
                  </span>
                )}
                {props.isPartialOrder && (
                  <button
                    type="button"
                    onClick={() => setOutputTab("hasse")}
                    className="flex items-center gap-1 rounded-full bg-lv-purple/20 border border-lv-purple/40 px-2.5 py-0.5 text-lv-purple font-bold text-[10px] hover:bg-lv-purple/30 transition-colors"
                    title="View Hasse Diagram for this Poset"
                  >
                    <span>POSET (VIEW HASSE ↗)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Property Row Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {/* Reflexive */}
              <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Reflexive</span>
                  {props.isReflexive ? (
                    <CheckCircle2 className="h-4 w-4 text-lv-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-lv-error" />
                  )}
                </div>
                <div className="text-[11px] text-lv-faint">
                  {props.isReflexive
                    ? "∀a ∈ A: (a, a) ∈ R"
                    : `Missing: ${props.reflexiveMissing.map((x) => `(${x},${x})`).slice(0, 3).join(", ")}`}
                </div>
              </div>

              {/* Symmetric */}
              <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Symmetric</span>
                  {props.isSymmetric ? (
                    <CheckCircle2 className="h-4 w-4 text-lv-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-lv-error" />
                  )}
                </div>
                <div className="text-[11px] text-lv-faint">
                  {props.isSymmetric
                    ? "(a, b) ∈ R ⇒ (b, a) ∈ R"
                    : `Missing: ${props.symmetricMissing.map(([x, y]) => `(${x},${y})`).slice(0, 2).join(", ")}`}
                </div>
              </div>

              {/* Anti-symmetric */}
              <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Anti-Symmetric</span>
                  {props.isAntiSymmetric ? (
                    <CheckCircle2 className="h-4 w-4 text-lv-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-lv-error" />
                  )}
                </div>
                <div className="text-[11px] text-lv-faint">
                  {props.isAntiSymmetric
                    ? "(a, b) ∧ (b, a) ⇒ a = b"
                    : `Violations: ${props.antiSymmetricViolations.map(([x, y]) => `(${x},${y})`).slice(0, 2).join(", ")}`}
                </div>
              </div>

              {/* Transitive */}
              <div className="rounded-xl border border-lv-border bg-lv-panel/70 p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Transitive</span>
                  {props.isTransitive ? (
                    <CheckCircle2 className="h-4 w-4 text-lv-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-lv-error" />
                  )}
                </div>
                <div className="text-[11px] text-lv-faint">
                  {props.isTransitive
                    ? "(a, b) ∧ (b, c) ⇒ (a, c)"
                    : props.transitiveViolations.length > 0
                    ? `Fails on (${props.transitiveViolations[0].a},${props.transitiveViolations[0].b}) ∧ (${props.transitiveViolations[0].b},${props.transitiveViolations[0].c})`
                    : "Not transitive"}
                </div>
              </div>
            </div>

            {/* Equivalence Classes if Equivalence */}
            {props.isEquivalence && (
              <div className="rounded-xl border border-lv-success/30 bg-lv-success/10 p-3 space-y-2 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-lv-success uppercase">
                  <Layers className="h-4 w-4" />
                  Quotient Set Partitions (A / R)
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {props.equivalenceClasses.map((c, i) => (
                    <span
                      key={i}
                      className="rounded-lg border border-lv-success/40 bg-lv-success/20 px-2.5 py-1 text-lv-text"
                    >
                      [{c.rep}] = {"{"} {c.members.join(", ")} {"}"}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Link to Warshall algorithm */}
            <div className="flex items-center justify-between border-t border-lv-border-soft pt-2">
              <span className="text-[11px] text-lv-faint font-mono">Compute transitive closure:</span>
              <button
                type="button"
                onClick={() => setOutputTab("warshall")}
                className="flex items-center gap-1 text-xs font-mono text-lv-cyan hover:underline font-bold"
              >
                <span>Run Warshall Steps</span>
                <Route className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
