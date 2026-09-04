"use client";

import { useEffect, useState } from "react";
import {
  Download,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Copy,
  Check,
  Code2,
  FileText,
  Info,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { cn } from "@/lib/utils";
import { VennDiagram } from "./venn-diagram";

const TABS: { id: "output" | "steps" | "formal-model" | "errors"; label: string }[] = [
  { id: "output", label: "Output" },
  { id: "steps", label: "Steps" },
  { id: "formal-model", label: "Formal Model" },
  { id: "errors", label: "Errors" },
];

export function OutputPanel() {
  const outputTab = useWorkspaceStore((s) => s.outputTab);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);
  const graphEvaluation = useWorkspaceStore((s) => s.graphEvaluation);
  const activeStepIndex = useWorkspaceStore((s) => s.activeStepIndex);
  const setStepIndex = useWorkspaceStore((s) => s.setStepIndex);
  const stepForward = useWorkspaceStore((s) => s.stepForward);
  const stepBackward = useWorkspaceStore((s) => s.stepBackward);
  const isPlayingSteps = useWorkspaceStore((s) => s.isPlayingSteps);
  const setIsPlayingSteps = useWorkspaceStore((s) => s.setIsPlayingSteps);
  const nodes = useWorkspaceStore((s) => s.nodes);

  const [copied, setCopied] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const { primaryResult, primarySets, allSteps, formalModel, errors } = graphEvaluation;
  const errorCount = errors.filter((e) => e.type === "error").length;
  const warningCount = errors.filter((e) => e.type === "warning").length;

  // Auto-play step simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingSteps && allSteps.length > 0) {
      timer = setInterval(() => {
        if (activeStepIndex < allSteps.length - 1) {
          stepForward();
        } else {
          setIsPlayingSteps(false);
        }
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlayingSteps, activeStepIndex, allSteps.length, stepForward, setIsPlayingSteps]);

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleDownloadJson() {
    const data = JSON.stringify(
      {
        version: "0.1",
        project: "LogicVerse Formal Model",
        nodes: nodes,
        formalModel: formalModel,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logicverse-model-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportModalOpen(false);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header Tabs */}
      <div className="flex items-center border-b border-lv-border-soft px-3 shrink-0">
        {TABS.map((tab) => {
          const hasErrors = tab.id === "errors" && (errorCount > 0 || warningCount > 0);
          return (
            <button
              key={tab.id}
              onClick={() => setOutputTab(tab.id)}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                outputTab === tab.id ? "text-lv-text font-semibold" : "text-lv-faint hover:text-lv-muted"
              )}
            >
              {tab.label}
              {hasErrors && (
                <span
                  className={cn(
                    "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                    errorCount > 0 ? "bg-lv-error" : "bg-lv-warning"
                  )}
                >
                  {errorCount + warningCount}
                </span>
              )}
              {outputTab === tab.id && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-lv-cyan" />
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setExportModalOpen(true)}
          className="ml-auto flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-lv-faint transition-colors hover:bg-lv-surface hover:text-lv-text"
        >
          <Download className="h-3 w-3" />
          Export
        </button>
      </div>

      {/* Dock Content */}
      <div className="lv-scrollbar flex-1 overflow-y-auto px-4 py-3 font-mono text-[13px]">
        {/* OUTPUT TAB */}
        {outputTab === "output" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="space-y-3">
              {primaryResult ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-lv-success" />
                      <span className="font-semibold text-lv-text text-sm">
                        {primaryResult.notation}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `${primaryResult.notation} = {${primaryResult.elements.join(", ")}}`,
                          "result"
                        )
                      }
                      className="flex items-center gap-1 rounded bg-lv-surface px-2 py-0.5 text-[11px] text-lv-muted hover:text-lv-text"
                    >
                      {copied === "result" ? <Check className="h-3 w-3 text-lv-success" /> : <Copy className="h-3 w-3" />}
                      Copy Result
                    </button>
                  </div>

                  <div className="rounded-xl border border-lv-border bg-lv-surface/70 p-3">
                    <div className="text-xs text-lv-faint mb-1">Roster Notation</div>
                    <div className="text-sm font-bold text-lv-cyan break-words">
                      {primaryResult.elements.length === 0
                        ? "∅ (empty set)"
                        : `{ ${primaryResult.elements.join(", ")} }`}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-lv-muted border-t border-lv-border-soft pt-2">
                      <span>Cardinality: <strong className="text-lv-text">|{primaryResult.notation}| = {primaryResult.cardinality}</strong></span>
                      {primarySets.length >= 2 && (
                        <span>
                          |{primarySets[0].label}| = {primarySets[0].elements.length}, |{primarySets[1].label}| = {primarySets[1].elements.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inclusion-Exclusion formula display if applicable */}
                  {primaryResult.notation.includes("∪") && primarySets.length >= 2 && (
                    <div className="rounded-lg bg-lv-panel/80 border border-lv-border-soft p-2.5 text-xs text-lv-muted space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-lv-faint font-semibold">
                        Principle of Inclusion-Exclusion
                      </div>
                      <div className="text-lv-text font-mono">
                        |A ∪ B| = |A| + |B| − |A ∩ B|
                      </div>
                      <div className="text-lv-cyan">
                        = {primarySets[0].elements.length} + {primarySets[1].elements.length} −{" "}
                        {primarySets[0].elements.length + primarySets[1].elements.length - primaryResult.cardinality}{" "}
                        = {primaryResult.cardinality}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-lv-muted py-6 flex flex-col gap-2">
                  <p>Ready. Connect sets into an operation node on the canvas to compute results live.</p>
                  <p className="text-xs text-lv-faint">Try clicking "Templates" in the palette to see instant demonstrations.</p>
                </div>
              )}
            </div>

            {/* Venn Diagram Visualizer Column */}
            <div className="flex flex-col">
              <VennDiagram
                labelA={primarySets[0]?.label ?? "A"}
                elementsA={primarySets[0]?.elements ?? []}
                labelB={primarySets[1]?.label ?? "B"}
                elementsB={primarySets[1]?.elements ?? []}
                activeOperation={primaryResult?.notation ?? "∪"}
              />
            </div>
          </div>
        )}

        {/* STEPS TAB */}
        {outputTab === "steps" && (
          <div className="space-y-4">
            {allSteps.length === 0 ? (
              <div className="text-lv-muted py-4">
                No active execution steps. Connect components on the canvas to generate algorithmic trace steps.
              </div>
            ) : (
              <>
                {/* Stepper Controls Bar */}
                <div className="flex items-center gap-2 border-b border-lv-border-soft pb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStepIndex(0);
                      setIsPlayingSteps(false);
                    }}
                    className="rounded p-1 text-lv-faint hover:bg-lv-surface hover:text-lv-text"
                    title="Reset to Step 1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={stepBackward}
                    disabled={activeStepIndex === 0}
                    className="rounded p-1 text-lv-faint hover:bg-lv-surface hover:text-lv-text disabled:opacity-30"
                    title="Previous Step"
                  >
                    <SkipBack className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPlayingSteps(!isPlayingSteps)}
                    className="flex items-center gap-1.5 rounded-lg bg-lv-blue/20 text-lv-blue px-3 py-1 text-xs font-semibold hover:bg-lv-blue/30 transition-colors"
                  >
                    {isPlayingSteps ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {isPlayingSteps ? "Pause" : "Play Trace"}
                  </button>
                  <button
                    type="button"
                    onClick={stepForward}
                    disabled={activeStepIndex === allSteps.length - 1}
                    className="rounded p-1 text-lv-faint hover:bg-lv-surface hover:text-lv-text disabled:opacity-30"
                    title="Next Step"
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                  </button>

                  <span className="ml-auto text-xs font-mono text-lv-muted">
                    Step {activeStepIndex + 1} of {allSteps.length}
                  </span>
                </div>

                {/* Active Step Card */}
                {allSteps[activeStepIndex] && (
                  <div className="rounded-xl border border-lv-cyan/40 bg-lv-surface/70 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-lv-cyan uppercase tracking-wider">
                        Step {allSteps[activeStepIndex].stepNumber}: {allSteps[activeStepIndex].title}
                      </span>
                      {allSteps[activeStepIndex].formalRule && (
                        <span className="rounded bg-lv-panel px-2 py-0.5 text-[11px] font-mono text-lv-muted border border-lv-border">
                          {allSteps[activeStepIndex].formalRule}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-lv-text leading-relaxed">
                      {allSteps[activeStepIndex].description}
                    </p>
                    {allSteps[activeStepIndex].intermediateResult && (
                      <div className="mt-2 text-xs text-lv-cyan">
                        Intermediate state: {"{"}
                        {allSteps[activeStepIndex].intermediateResult?.join(", ")}
                        {"}"}
                      </div>
                    )}
                  </div>
                )}

                {/* Steps Timeline Overview */}
                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] uppercase tracking-wider text-lv-faint font-semibold">
                    Execution Trace
                  </div>
                  {allSteps.map((step, idx) => (
                    <button
                      key={step.stepNumber}
                      type="button"
                      onClick={() => setStepIndex(idx)}
                      className={cn(
                        "w-full text-left flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors",
                        activeStepIndex === idx
                          ? "bg-lv-surface border border-lv-cyan/40 text-lv-text font-medium"
                          : "hover:bg-lv-surface/40 text-lv-muted"
                      )}
                    >
                      <span>
                        {step.stepNumber}. {step.title}
                      </span>
                      {activeStepIndex === idx && (
                        <span className="h-1.5 w-1.5 rounded-full bg-lv-cyan" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* FORMAL MODEL TAB */}
        {outputTab === "formal-model" && (
          <div className="space-y-4">
            <div>
              <p className="text-lv-faint text-xs mb-2">// Formal logic representation & set-builder specification</p>
              <div className="rounded-xl border border-lv-border bg-lv-surface/70 p-3 space-y-2">
                <div className="text-xs text-lv-faint">Set-Builder Definition</div>
                <div className="text-sm font-bold text-lv-cyan">
                  {formalModel.definitions[0] || formalModel.expression}
                </div>
              </div>
            </div>

            {formalModel.properties.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-lv-faint mb-2">
                  Axiomatic Set Properties
                </div>
                <ul className="space-y-1">
                  {formalModel.properties.map((prop, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-lv-muted">
                      <span className="h-1.5 w-1.5 rounded-full bg-lv-purple" />
                      {prop}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-lv-faint">LaTeX Representation</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(formalModel.latex, "latex")}
                  className="flex items-center gap-1 rounded bg-lv-surface px-2 py-0.5 text-[11px] text-lv-muted hover:text-lv-text"
                >
                  {copied === "latex" ? <Check className="h-3 w-3 text-lv-success" /> : <Copy className="h-3 w-3" />}
                  Copy LaTeX
                </button>
              </div>
              <div className="rounded-lg border border-lv-border bg-lv-panel p-2.5 text-xs text-lv-text select-all">
                {formalModel.latex}
              </div>
            </div>
          </div>
        )}

        {/* ERRORS & VALIDATION TAB */}
        {outputTab === "errors" && (
          <div className="space-y-2">
            {errors.length === 0 ? (
              <div className="flex items-center gap-2 text-lv-success py-4">
                <CheckCircle2 className="h-4 w-4 text-lv-success" />
                <span>All connections valid. Model conforms to Discrete Mathematics rules.</span>
              </div>
            ) : (
              errors.map((err) => (
                <div
                  key={err.id}
                  className={cn(
                    "rounded-xl border p-3 text-xs space-y-1",
                    err.type === "error"
                      ? "border-lv-error/50 bg-lv-error/10 text-lv-error"
                      : err.type === "warning"
                      ? "border-lv-warning/50 bg-lv-warning/10 text-lv-warning"
                      : "border-lv-blue/50 bg-lv-blue/10 text-lv-blue"
                  )}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {err.type === "error" ? (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-lv-error" />
                    ) : (
                      <Info className="h-4 w-4 shrink-0" />
                    )}
                    <span>{err.message}</span>
                  </div>
                  {err.remedy && <p className="text-[11px] opacity-80 pl-6">{err.remedy}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Export Modal */}
      {exportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setExportModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-lv-border bg-lv-panel p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-lv-border-soft pb-3">
              <h3 className="text-sm font-semibold text-lv-text flex items-center gap-2">
                <Download className="h-4 w-4 text-lv-cyan" />
                Export Model & Workspace
              </h3>
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="text-xs text-lv-faint hover:text-lv-text"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleDownloadJson}
                className="flex w-full items-center justify-between rounded-xl border border-lv-border bg-lv-surface p-3 text-left hover:border-lv-cyan/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Code2 className="h-4 w-4 text-lv-cyan" />
                  <div>
                    <div className="text-xs font-semibold text-lv-text">JSON Project File</div>
                    <div className="text-[11px] text-lv-faint">Save canvas nodes, edges, and AST</div>
                  </div>
                </div>
                <Download className="h-4 w-4 text-lv-faint" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const md = `# ${primaryResult?.notation ?? "LogicVerse Model"}\n\n- Definition: ${formalModel.definitions[0] ?? ""}\n- Result: {${primaryResult?.elements.join(", ") ?? ""}}\n- Cardinality: ${primaryResult?.cardinality ?? 0}\n\nLaTeX:\n\`\`\`latex\n${formalModel.latex}\n\`\`\``;
                  copyToClipboard(md, "md-report");
                  setExportModalOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-lv-border bg-lv-surface p-3 text-left hover:border-lv-purple/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-lv-purple" />
                  <div>
                    <div className="text-xs font-semibold text-lv-text">Copy Markdown Report</div>
                    <div className="text-[11px] text-lv-faint">Formatted mathematical summary</div>
                  </div>
                </div>
                <Copy className="h-4 w-4 text-lv-faint" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
