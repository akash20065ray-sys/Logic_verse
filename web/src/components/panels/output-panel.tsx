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
  Table,
  Sigma,
  Calculator,
  Sparkles,
  X,
  Plus,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { cn } from "@/lib/utils";
import { VennDiagram } from "./venn-diagram";
import { TruthTableView } from "./truth-table-view";
import { InductionView } from "./induction-view";
import { DiagonalizationView } from "./diagonalization-view";
import { PieSolverView } from "./pie-solver-view";

export function OutputPanel() {
  const activeModuleId = useWorkspaceStore((s) => s.activeModuleId);
  const outputTab = useWorkspaceStore((s) => s.outputTab);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);

  const isLogic = activeModuleId === "logic";

  // Set Theory store data
  const graphEvaluation = useWorkspaceStore((s) => s.graphEvaluation);
  const activeStepIndex = useWorkspaceStore((s) => s.activeStepIndex);
  const setStepIndex = useWorkspaceStore((s) => s.setStepIndex);
  const stepForward = useWorkspaceStore((s) => s.stepForward);
  const stepBackward = useWorkspaceStore((s) => s.stepBackward);
  const isPlayingSteps = useWorkspaceStore((s) => s.isPlayingSteps);
  const setIsPlayingSteps = useWorkspaceStore((s) => s.setIsPlayingSteps);

  // Logic store data
  const logicEvaluation = useWorkspaceStore((s) => s.logicEvaluation);

  const nodes = useWorkspaceStore((s) => s.nodes);

  const [copied, setCopied] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Pick errors based on active module
  const currentErrors = isLogic ? logicEvaluation.errors : graphEvaluation.errors;
  const errorCount = currentErrors.filter((e) => e.type === "error").length;
  const warningCount = currentErrors.filter((e) => e.type === "warning").length;

  const { primaryResult, primarySets, allSteps, formalModel } = graphEvaluation;

  // Auto-play step simulation for Set Theory
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isLogic && isPlayingSteps && allSteps.length > 0) {
      timer = setInterval(() => {
        if (activeStepIndex < allSteps.length - 1) {
          stepForward();
        } else {
          setIsPlayingSteps(false);
        }
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isLogic, isPlayingSteps, activeStepIndex, allSteps.length, stepForward, setIsPlayingSteps]);

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleDownloadJson() {
    const data = JSON.stringify(
      {
        version: "0.2",
        module: activeModuleId,
        nodes: nodes,
        evaluation: isLogic ? logicEvaluation : graphEvaluation,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logicverse-${activeModuleId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportModalOpen(false);
  }

  const [closedTabs, setClosedTabs] = useState<Set<string>>(new Set());

  // Automatically unhide a tab when activated
  useEffect(() => {
    if (closedTabs.has(outputTab)) {
      setClosedTabs((prev) => {
        const next = new Set(prev);
        next.delete(outputTab);
        return next;
      });
    }
  }, [outputTab, closedTabs]);

  function handleCloseTab(tabId: string) {
    setClosedTabs((prev) => new Set(prev).add(tabId));
    if (outputTab === tabId) {
      setOutputTab("output");
    }
  }

  function handleOpenTab(tabId: typeof outputTab) {
    setClosedTabs((prev) => {
      const next = new Set(prev);
      next.delete(tabId);
      return next;
    });
    setOutputTab(tabId);
  }

  const tabs = isLogic
    ? [
        { id: "output" as const, label: "Truth Table", icon: Table, closable: false },
        { id: "induction" as const, label: "Induction", icon: Sigma, closable: false },
        { id: "formal-model" as const, label: "Formal WFF", icon: Code2, closable: false },
        { id: "errors" as const, label: "Errors", icon: AlertTriangle, closable: false },
      ]
    : [
        { id: "output" as const, label: "Output & Venn", icon: CheckCircle2, closable: false },
        { id: "pie-solver" as const, label: "Inclusion-Exclusion (PIE)", icon: Calculator, closable: true },
        { id: "diagonalization" as const, label: "Diagonalization (Cantor)", icon: Sparkles, closable: true },
        { id: "steps" as const, label: "Steps", icon: Play, closable: false },
        { id: "formal-model" as const, label: "Formal Model", icon: Code2, closable: false },
        { id: "errors" as const, label: "Errors", icon: AlertTriangle, closable: false },
      ];

  const visibleTabs = tabs.filter((t) => !t.closable || !closedTabs.has(t.id) || outputTab === t.id);
  const hiddenTools = tabs.filter((t) => t.closable && closedTabs.has(t.id) && outputTab !== t.id);

  return (
    <div className="flex h-full flex-col">
      {/* Header Tabs */}
      <div className="flex items-center border-b border-lv-border-soft px-3 shrink-0">
        {visibleTabs.map((tab) => {
          const hasErrors = tab.id === "errors" && (errorCount > 0 || warningCount > 0);
          const isActive = outputTab === tab.id;

          return (
            <div
              key={tab.id}
              onClick={() => setOutputTab(tab.id)}
              className={cn(
                "group relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors cursor-pointer select-none",
                isActive ? "text-lv-text font-semibold" : "text-lv-faint hover:text-lv-muted hover:bg-lv-surface/40"
              )}
            >
              <tab.icon className={cn("h-3.5 w-3.5", isActive ? "text-lv-cyan" : "text-lv-faint")} />
              <span>{tab.label}</span>
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

              {/* Cut / Close Tab option */}
              {tab.closable && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.id);
                  }}
                  className="ml-1 -mr-1 flex items-center justify-center h-4 w-4 rounded-full text-lv-faint hover:bg-lv-surface hover:text-lv-text transition-colors"
                  title={`Close and cut ${tab.label} tab`}
                >
                  <X className="h-3 w-3" />
                </span>
              )}

              {isActive && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-lv-cyan" />
              )}
            </div>
          );
        })}

        {/* Quick re-add button if tools are cut/closed */}
        {hiddenTools.length > 0 && (
          <div className="flex items-center gap-1 pl-1">
            {hiddenTools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleOpenTab(tool.id)}
                className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-mono text-lv-faint hover:text-lv-text hover:bg-lv-surface/60 transition-colors border border-dashed border-lv-border-soft"
                title={`Reopen ${tool.label}`}
              >
                <Plus className="h-3 w-3" />
                <span>{tool.id === "pie-solver" ? "PIE Solver" : "Diagonalization"}</span>
              </button>
            ))}
          </div>
        )}

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
        {/* LOGIC: TRUTH TABLE TAB */}
        {isLogic && outputTab === "output" && (
          <TruthTableView
            truthTable={logicEvaluation.truthTable}
            activeAssignments={logicEvaluation.variableAssignments}
          />
        )}

        {/* LOGIC: INDUCTION TAB */}
        {isLogic && outputTab === "induction" && <InductionView />}

        {/* SET THEORY: OUTPUT TAB */}
        {!isLogic && outputTab === "output" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="space-y-3">
              {primaryResult ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-lv-faint">
                      Active Evaluation
                    </span>
                    <span className="rounded bg-lv-blue/20 px-2 py-0.5 text-xs text-lv-blue font-bold">
                      {primaryResult.notation}
                    </span>
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
                </>
              ) : (
                <div className="text-lv-muted py-6 flex flex-col gap-2">
                  <p>Ready. Connect sets into an operation node on the canvas to compute results live.</p>
                  <p className="text-xs text-lv-faint">Try clicking "Templates" in the palette to see instant demonstrations.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <VennDiagram
                labelA={primarySets[0]?.label ?? "A"}
                elementsA={primarySets[0]?.elements ?? []}
                labelB={primarySets[1]?.label ?? "B"}
                elementsB={primarySets[1]?.elements ?? []}
                labelC={primarySets[2]?.label ?? "C"}
                elementsC={primarySets[2]?.elements ?? []}
                activeOperation={primaryResult?.notation ?? "∪"}
              />
            </div>
          </div>
        )}

        {/* SET THEORY: PIE SOLVER TAB */}
        {!isLogic && outputTab === "pie-solver" && (
          <PieSolverView onClose={() => handleCloseTab("pie-solver")} />
        )}

        {/* SET THEORY: DIAGONALIZATION TAB */}
        {!isLogic && outputTab === "diagonalization" && (
          <DiagonalizationView onClose={() => handleCloseTab("diagonalization")} />
        )}

        {/* SET THEORY: STEPS TAB */}
        {!isLogic && outputTab === "steps" && (
          <div className="space-y-4">
            {allSteps.length === 0 ? (
              <div className="text-lv-muted py-4">
                No active execution steps. Connect components on the canvas to generate algorithmic trace steps.
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}

        {/* FORMAL MODEL TAB (Shared / Adapted) */}
        {outputTab === "formal-model" && (
          <div className="space-y-4">
            {isLogic ? (
              <div className="space-y-3">
                <p className="text-lv-faint text-xs">// Well-Formed Formula (WFF) Specification & LaTeX</p>
                <div className="rounded-xl border border-lv-border bg-lv-surface/70 p-3 space-y-1">
                  <div className="text-xs text-lv-faint">Canonical Expression</div>
                  <div className="text-sm font-bold text-lv-cyan">
                    {logicEvaluation.activeExpression}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-lv-faint">LaTeX Formula</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(logicEvaluation.latexExpression, "logic-latex")}
                      className="flex items-center gap-1 rounded bg-lv-surface px-2 py-0.5 text-[11px] text-lv-muted hover:text-lv-text"
                    >
                      {copied === "logic-latex" ? <Check className="h-3 w-3 text-lv-success" /> : <Copy className="h-3 w-3" />}
                      Copy LaTeX
                    </button>
                  </div>
                  <div className="rounded-lg border border-lv-border bg-lv-panel p-2.5 text-xs text-lv-text select-all">
                    {logicEvaluation.latexExpression}
                  </div>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}

        {/* ERRORS TAB */}
        {outputTab === "errors" && (
          <div className="space-y-2">
            {currentErrors.length === 0 ? (
              <div className="flex items-center gap-2 text-lv-success py-4">
                <CheckCircle2 className="h-4 w-4 text-lv-success" />
                <span>
                  {isLogic
                    ? "All logic gate connections are well-formed and valid."
                    : "All connections valid. Model conforms to Discrete Mathematics rules."}
                </span>
              </div>
            ) : (
              currentErrors.map((err) => (
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
                Export {isLogic ? "Logic" : "Set Theory"} Model
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
                  const md = isLogic
                    ? `# Logic Model: ${logicEvaluation.activeExpression}\n\nLaTeX: \`${logicEvaluation.latexExpression}\`\n\nTruth Table:\n${logicEvaluation.truthTable?.markdownTable ?? ""}`
                    : `# ${primaryResult?.notation ?? "LogicVerse Model"}\n\n- Definition: ${formalModel.definitions[0] ?? ""}\n- Result: {${primaryResult?.elements.join(", ") ?? ""}}\n- Cardinality: ${primaryResult?.cardinality ?? 0}\n\nLaTeX:\n\`\`\`latex\n${formalModel.latex}\n\`\`\``;
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
