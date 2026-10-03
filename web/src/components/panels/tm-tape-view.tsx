"use client";

import { useState, useEffect } from "react";
import {
  Cpu,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowDown,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import {
  simulateTuringMachine,
  generateBinaryIncrementerTmGraph,
  type TmDefinition,
  type TmStep,
} from "@/lib/algorithms/turing-machine";

export function TmTapeView() {
  const nodes = useWorkspaceStore((s) => s.nodes);
  const edges = useWorkspaceStore((s) => s.edges);
  const tmInputString = useWorkspaceStore((s) => s.tmInputString);
  const setTmInputString = useWorkspaceStore((s) => s.setTmInputString);
  const activeTmStepIndex = useWorkspaceStore((s) => s.activeTmStepIndex);
  const setTmStepIndex = useWorkspaceStore((s) => s.setTmStepIndex);
  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);

  const [isPlaying, setIsPlaying] = useState(false);

  // Construct active TM definition from canvas graph or default preset
  const activeTm: TmDefinition =
    nodes.length > 0
      ? {
          states: nodes.map((n) => n.id),
          inputAlphabet: ["0", "1"],
          tapeAlphabet: ["0", "1", "B", "X", "Y"],
          startState: nodes.find((n) => n.data?.isStart)?.id || nodes[0]?.id || "q0",
          blankSymbol: "B",
          acceptStates: nodes.filter((n) => n.data?.isAccept).map((n) => n.id),
          rejectStates: [],
          transitions: edges.map((e, idx) => {
            const raw = (e.label as string) || "0 / 1, R";
            const parts = raw.split("/");
            const read = (parts[0] || "0").trim();
            const rightParts = (parts[1] || "").split(",");
            const write = (rightParts[0] || "1").trim();
            const dirStr = (rightParts[1] || "R").trim().toUpperCase();
            const dir: "L" | "R" | "S" = dirStr === "L" ? "L" : dirStr === "S" ? "S" : "R";

            return {
              id: e.id || `t-${idx}`,
              fromState: e.source,
              toState: e.target,
              readSymbol: read,
              writeSymbol: write,
              moveDirection: dir,
              rawLabel: raw,
            };
          }),
        }
      : generateBinaryIncrementerTmGraph().tm;

  const simulation = simulateTuringMachine(activeTm, tmInputString);
  const steps = simulation.steps;
  const currentStep: TmStep | undefined = steps[activeTmStepIndex] || steps[0];

  // Auto step timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && steps.length > 0) {
      timer = setInterval(() => {
        if (activeTmStepIndex < steps.length - 1) {
          setTmStepIndex(activeTmStepIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeTmStepIndex, steps.length, setTmStepIndex]);

  function handleLoadPreset() {
    const preset = generateBinaryIncrementerTmGraph();
    recomputeGraph(preset.nodes, preset.edges);
    setTmInputString("1011");
    setTmStepIndex(0);
  }

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Header & Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lv-border-soft pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
            <Cpu className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-lv-text">Turing Machine (TM) Infinite 2-Way Tape Visualizer</h3>
            <p className="text-[11px] text-lv-faint">
              Formal 7-Tuple: M = (Q, Σ, Γ, δ, q₀, B, F) | Tape Scanned Head Motion (L, R, S)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              simulation.isAccepted
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
            }`}
          >
            {simulation.isAccepted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            {simulation.isAccepted ? "ACCEPTED & HALTED (q_F)" : "REJECTED / RUNNING"}
          </span>

          {nodes.length === 0 && (
            <button
              type="button"
              onClick={handleLoadPreset}
              className="rounded-xl bg-purple-500/20 border border-purple-500/40 px-3 py-1 text-xs font-bold text-purple-300 hover:bg-purple-500/30 transition-colors"
            >
              Load Incrementer TM (w+1)
            </button>
          )}
        </div>
      </div>

      {/* Infinite 2-Way Tape Strip Visualizer */}
      <div className="rounded-2xl border border-blue-500/30 bg-lv-surface/70 p-4 space-y-3 flex flex-col items-center">
        <div className="flex items-center justify-between w-full border-b border-lv-border-soft pb-2">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
            Infinite 2-Way Memory Tape Γ*
          </span>
          <span className="text-[10px] text-lv-faint">
            Head Index: cell [{currentStep?.headPosition ?? 0}] | Final Result:{" "}
            <strong className="text-emerald-400">"{simulation.finalTapeString}"</strong>
          </span>
        </div>

        {/* Horizontal Scrollable Tape Cells */}
        <div className="w-full overflow-x-auto lv-scrollbar py-2">
          <div className="flex items-center justify-center min-w-max gap-1">
            <span className="text-lv-faint text-xs font-mono px-2">... B</span>
            {currentStep?.tape.map((sym, idx) => {
              const isHead = idx === currentStep.headPosition;
              return (
                <div key={idx} className="flex flex-col items-center">
                  {/* Head Marker Arrow */}
                  <div className="h-5 flex items-center justify-center">
                    {isHead && <ArrowDown className="w-4 h-4 text-blue-400 animate-bounce" />}
                  </div>

                  {/* Tape Cell */}
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-xl border text-sm font-bold font-mono transition-all shadow-md ${
                      isHead
                        ? "border-blue-400 bg-blue-500/30 text-blue-200 ring-2 ring-blue-400/50 shadow-blue-500/20"
                        : "border-lv-border bg-lv-panel text-lv-muted"
                    }`}
                  >
                    {sym}
                  </div>
                  <span className="text-[9px] text-lv-faint mt-1">[{idx}]</span>
                </div>
              );
            })}
            <span className="text-lv-faint text-xs font-mono px-2">B ...</span>
          </div>
        </div>
      </div>

      {/* Execution Controls & Step Table */}
      <div className="space-y-3">
        {/* Controls Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-lv-border-soft pb-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTmStepIndex(0)}
              className="rounded-lg p-1.5 text-lv-faint hover:bg-lv-surface hover:text-lv-text"
              title="Reset to Initial State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setTmStepIndex(Math.max(0, activeTmStepIndex - 1))}
              disabled={activeTmStepIndex === 0}
              className="rounded-lg p-1.5 text-lv-faint hover:bg-lv-surface hover:text-lv-text disabled:opacity-30"
              title="Previous Step"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 px-3 py-1.5 text-xs font-bold hover:bg-blue-500/30 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "Pause" : "Play Tape Trace"}</span>
            </button>
            <button
              type="button"
              onClick={() => setTmStepIndex(Math.min(steps.length - 1, activeTmStepIndex + 1))}
              disabled={activeTmStepIndex === steps.length - 1}
              className="rounded-lg p-1.5 text-lv-faint hover:bg-lv-surface hover:text-lv-text disabled:opacity-30"
              title="Next Step"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-mono text-lv-muted">
            Step {activeTmStepIndex + 1} of {steps.length}
          </span>
        </div>

        {/* Step Table Log */}
        <div className="max-h-[200px] overflow-y-auto rounded-xl border border-lv-border bg-lv-panel/70">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-lv-surface text-lv-faint font-bold border-b border-lv-border">
              <tr>
                <th className="p-2">Step</th>
                <th className="p-2">State</th>
                <th className="p-2">Tape Head Pos</th>
                <th className="p-2">Read Symbol</th>
                <th className="p-2">Tape Contents</th>
                <th className="p-2">Action Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lv-border-soft">
              {steps.map((st, i) => {
                const isActive = i === activeTmStepIndex;
                return (
                  <tr
                    key={i}
                    onClick={() => setTmStepIndex(i)}
                    className={`cursor-pointer transition-colors ${
                      isActive
                        ? "bg-blue-500/20 text-blue-300 font-bold"
                        : "hover:bg-lv-surface/50 text-lv-muted"
                    }`}
                  >
                    <td className="p-2 font-mono">#{st.stepNumber}</td>
                    <td className="p-2 font-mono text-blue-400">{st.currentState}</td>
                    <td className="p-2 font-mono">[{st.headPosition}]</td>
                    <td className="p-2 font-mono text-amber-300">'{st.readSymbol}'</td>
                    <td className="p-2 font-mono text-purple-300">[{st.tape.join(", ")}]</td>
                    <td className="p-2 font-mono text-[11px] truncate max-w-[220px]">
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
  );
}
