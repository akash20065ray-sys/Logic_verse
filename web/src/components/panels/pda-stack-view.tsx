"use client";

import { useState, useEffect } from "react";
import {
  Layers,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowDown,
  Info,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import {
  simulatePda,
  generateAnBnPdaGraph,
  type PdaDefinition,
  type PdaStep,
} from "@/lib/algorithms/pda";

export function PdaStackView() {
  const nodes = useWorkspaceStore((s) => s.nodes);
  const edges = useWorkspaceStore((s) => s.edges);
  const pdaInputString = useWorkspaceStore((s) => s.pdaInputString);
  const setPdaInputString = useWorkspaceStore((s) => s.setPdaInputString);
  const activePdaStepIndex = useWorkspaceStore((s) => s.activePdaStepIndex);
  const setPdaStepIndex = useWorkspaceStore((s) => s.setPdaStepIndex);
  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);

  const [isPlaying, setIsPlaying] = useState(false);

  // Construct active PDA definition from canvas graph, fall back to default if empty canvas
  const activePda: PdaDefinition =
    nodes.length > 0
      ? {
          states: nodes.map((n) => n.id),
          inputAlphabet: ["a", "b"],
          stackAlphabet: ["Z0", "A", "B"],
          startState: nodes.find((n) => n.data?.isStart)?.id || nodes[0]?.id || "q0",
          initialStackSymbol: "Z0",
          acceptStates: nodes.filter((n) => n.data?.isAccept).map((n) => n.id),
          transitions: edges.map((e, idx) => {
            const raw = (e.label as string) || "a, Z0 / A Z0";
            const parts = raw.split("/");
            const left = (parts[0] || "").split(",");
            const inp = (left[0] || "a").trim();
            const pop = (left[1] || "Z0").trim();
            const push = (parts[1] || "").trim().split(/\s+/).filter(Boolean);

            return {
              id: e.id || `t-${idx}`,
              fromState: e.source,
              toState: e.target,
              inputSymbol: inp,
              popSymbol: pop,
              pushSymbols: push,
              rawLabel: raw,
            };
          }),
        }
      : generateAnBnPdaGraph().pda;

  const simulation = simulatePda(activePda, pdaInputString);
  const steps = simulation.steps;
  const currentStep: PdaStep | undefined = steps[activePdaStepIndex] || steps[0];

  // Auto step timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && steps.length > 0) {
      timer = setInterval(() => {
        if (activePdaStepIndex < steps.length - 1) {
          setPdaStepIndex(activePdaStepIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activePdaStepIndex, steps.length, setPdaStepIndex]);

  function handleLoadPreset() {
    const preset = generateAnBnPdaGraph();
    recomputeGraph(preset.nodes, preset.edges);
    setPdaInputString("aabb");
    setPdaStepIndex(0);
  }

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Header & Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lv-border-soft pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
            <Layers className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-lv-text">Pushdown Automaton (PDA) Stack Visualizer</h3>
            <p className="text-[11px] text-lv-faint">
              Formal 7-Tuple: M = (Q, Σ, Γ, δ, q₀, Z₀, F) | LIFO Memory Trace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              simulation.isAcceptedFinalState || simulation.isAcceptedEmptyStack
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
            }`}
          >
            {simulation.isAcceptedFinalState || simulation.isAcceptedEmptyStack ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
            {simulation.isAcceptedFinalState
              ? "ACCEPTED (Final State F)"
              : simulation.isAcceptedEmptyStack
              ? "ACCEPTED (Empty Stack NULL)"
              : "REJECTED"}
          </span>

          {nodes.length === 0 && (
            <button
              type="button"
              onClick={handleLoadPreset}
              className="rounded-xl bg-purple-500/20 border border-purple-500/40 px-3 py-1 text-xs font-bold text-purple-300 hover:bg-purple-500/30 transition-colors"
            >
              Load L = aⁿbⁿ PDA
            </button>
          )}
        </div>
      </div>

      {/* Main Split: Visual Stack Memory vs Configuration Trace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Visual LIFO Stack Display Column */}
        <div className="rounded-2xl border border-sky-500/30 bg-lv-surface/70 p-4 space-y-3 flex flex-col items-center justify-start">
          <div className="flex items-center justify-between w-full border-b border-lv-border-soft pb-2">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
              LIFO Stack Memory Γ
            </span>
            <span className="text-[10px] text-lv-faint">
              Depth: {currentStep?.stack.length || 0}
            </span>
          </div>

          {/* Top Pointer */}
          <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs animate-bounce py-1">
            <ArrowDown className="w-3.5 h-3.5" />
            <span>TOP OF STACK [0]</span>
          </div>

          {/* Vertical Stack Frame */}
          <div className="w-full max-w-[200px] flex flex-col gap-1.5 min-h-[160px] justify-end border-b-4 border-sky-500/80 rounded-b-lg p-2 bg-lv-panel/80 shadow-inner">
            {currentStep?.stack && currentStep.stack.length > 0 ? (
              currentStep.stack.map((sym, idx) => (
                <div
                  key={idx}
                  className={`w-full py-2 px-3 rounded-lg border text-center font-mono font-bold transition-all shadow-md ${
                    idx === 0
                      ? "border-sky-400 bg-sky-500/30 text-sky-200 shadow-sky-500/20"
                      : "border-lv-border bg-lv-surface text-lv-muted"
                  }`}
                >
                  <span className="text-[10px] text-lv-faint mr-2">[{idx}]</span>
                  <span className="text-sm">{sym}</span>
                  {idx === 0 && <span className="ml-2 text-[10px] text-sky-400 font-normal">(Top)</span>}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-lv-faint italic text-xs">
                ∅ Empty Stack (Z₀ Popped)
              </div>
            )}
          </div>
        </div>

        {/* Trace Step Execution Table & Step Controls */}
        <div className="md:col-span-2 space-y-3">
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-lv-border-soft pb-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPdaStepIndex(0)}
                className="rounded-lg p-1.5 text-lv-faint hover:bg-lv-surface hover:text-lv-text"
                title="Reset to Initial Configuration"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPdaStepIndex(Math.max(0, activePdaStepIndex - 1))}
                disabled={activePdaStepIndex === 0}
                className="rounded-lg p-1.5 text-lv-faint hover:bg-lv-surface hover:text-lv-text disabled:opacity-30"
                title="Previous Step"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 px-3 py-1.5 text-xs font-bold hover:bg-sky-500/30 transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? "Pause" : "Play Step Trace"}</span>
              </button>
              <button
                type="button"
                onClick={() => setPdaStepIndex(Math.min(steps.length - 1, activePdaStepIndex + 1))}
                disabled={activePdaStepIndex === steps.length - 1}
                className="rounded-lg p-1.5 text-lv-faint hover:bg-lv-surface hover:text-lv-text disabled:opacity-30"
                title="Next Step"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <span className="text-xs font-mono text-lv-muted">
              Step {activePdaStepIndex + 1} of {steps.length}
            </span>
          </div>

          {/* Instant Step Active Card */}
          {currentStep && (
            <div className="rounded-xl border border-sky-500/40 bg-lv-surface/80 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sky-400">
                  Step {currentStep.stepNumber}: State ({currentStep.currentState})
                </span>
                <span className="text-lv-faint font-mono">
                  Remaining Input: <strong className="text-sky-300">"{currentStep.remainingInput || "ε"}"</strong>
                </span>
              </div>
              <p className="text-xs text-lv-text font-bold">{currentStep.actionTaken}</p>
              <div className="flex items-center gap-4 text-[11px] text-lv-faint pt-1 border-t border-lv-border-soft">
                <span>Consumed: "{currentStep.consumedInput || "ε"}"</span>
                <span>Current Symbol: '{currentStep.currentSymbol}'</span>
                <span>Stack Top: '{currentStep.stack[0] || "ε"}'</span>
              </div>
            </div>
          )}

          {/* Trace Execution Table */}
          <div className="max-h-[220px] overflow-y-auto rounded-xl border border-lv-border bg-lv-panel/70">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-lv-surface text-lv-faint font-bold border-b border-lv-border">
                <tr>
                  <th className="p-2">Step</th>
                  <th className="p-2">State</th>
                  <th className="p-2">Consumed</th>
                  <th className="p-2">Remaining</th>
                  <th className="p-2">Stack Γ</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lv-border-soft">
                {steps.map((st, i) => {
                  const isActive = i === activePdaStepIndex;
                  return (
                    <tr
                      key={i}
                      onClick={() => setPdaStepIndex(i)}
                      className={`cursor-pointer transition-colors ${
                        isActive
                          ? "bg-sky-500/20 text-sky-300 font-bold"
                          : "hover:bg-lv-surface/50 text-lv-muted"
                      }`}
                    >
                      <td className="p-2 font-mono">#{st.stepNumber}</td>
                      <td className="p-2 font-mono text-sky-400">{st.currentState}</td>
                      <td className="p-2 font-mono">{st.consumedInput || "ε"}</td>
                      <td className="p-2 font-mono text-purple-300">{st.remainingInput || "ε"}</td>
                      <td className="p-2 font-mono text-amber-300">
                        [{st.stack.join(", ")}]
                      </td>
                      <td className="p-2 font-mono text-[11px] truncate max-w-[180px]">
                        {st.actionTaken}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
