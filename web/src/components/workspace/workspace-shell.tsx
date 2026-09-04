"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { WorkspaceToolbar } from "./workspace-toolbar";
import { ModuleExplorer } from "./module-explorer";
import { LogicAiPanel } from "@/components/panels/logicai-panel";
import { OutputPanel } from "@/components/panels/output-panel";
import { WorkspaceCanvas } from "@/components/canvas/workspace-canvas";
import { CanvasPalette } from "@/components/canvas/canvas-palette";
import { useWorkspaceStore } from "@/store/workspace-store";
import { getModule } from "@/lib/modules";

function WorkspaceShellContent({ moduleId }: { moduleId: string }) {
  const setActiveModule = useWorkspaceStore((s) => s.setActiveModule);
  const aiPanelOpen = useWorkspaceStore((s) => s.aiPanelOpen);
  const outputPanelOpen = useWorkspaceStore((s) => s.outputPanelOpen);
  const loadTemplate = useWorkspaceStore((s) => s.loadTemplate);
  const mod = getModule(moduleId);
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");

  useEffect(() => {
    setActiveModule(moduleId);
  }, [moduleId, setActiveModule]);

  useEffect(() => {
    if (topic === "cardinality") {
      loadTemplate("cardinality-demo");
    } else if (topic === "power-set") {
      loadTemplate("power-set");
    } else if (topic === "set-operations" || topic === "venn") {
      loadTemplate("union-intersection");
    }
  }, [topic, loadTemplate]);

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-lv-bg">
      <WorkspaceToolbar projectName={mod ? `${mod.title} — Project Workspace` : "Workspace Project"} />

      <div className="flex min-h-0 flex-1">
        {/* Left: Module Explorer */}
        <aside className="hidden w-56 shrink-0 border-r border-lv-border-soft bg-lv-panel/70 sm:block lg:w-64">
          <ModuleExplorer activeModuleId={moduleId} />
        </aside>

        {/* Center: Canvas + bottom dock */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <WorkspaceCanvas />
            <CanvasPalette />
          </div>
          {outputPanelOpen && (
            <div className="h-64 shrink-0 border-t border-lv-border-soft bg-lv-panel/90 shadow-2xl">
              <OutputPanel />
            </div>
          )}
        </div>

        {/* Right: LogicAI */}
        {aiPanelOpen && (
          <aside className="hidden w-72 shrink-0 border-l border-lv-border-soft bg-lv-panel/70 sm:block lg:w-80">
            <LogicAiPanel />
          </aside>
        )}
      </div>
    </div>
  );
}

export function WorkspaceShell({ moduleId }: { moduleId: string }) {
  return (
    <Suspense fallback={<div className="h-dvh w-full bg-lv-bg flex items-center justify-center text-lv-faint">Loading Workspace…</div>}>
      <WorkspaceShellContent moduleId={moduleId} />
    </Suspense>
  );
}
