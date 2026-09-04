"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { WorkspaceToolbar } from "./workspace-toolbar";
import { ModuleExplorer } from "./module-explorer";
import { LogicAiPanel } from "@/components/panels/logicai-panel";
import { OutputPanel } from "@/components/panels/output-panel";
import { WorkspaceCanvas } from "@/components/canvas/workspace-canvas";
import { ExpressionBuilderModal } from "@/components/canvas/expression-builder-modal";
import { useWorkspaceStore } from "@/store/workspace-store";
import { getModule } from "@/lib/modules";

function WorkspaceShellContent({ moduleId }: { moduleId: string }) {
  const setActiveModule = useWorkspaceStore((s) => s.setActiveModule);
  const aiPanelOpen = useWorkspaceStore((s) => s.aiPanelOpen);
  const outputPanelOpen = useWorkspaceStore((s) => s.outputPanelOpen);
  const loadTemplate = useWorkspaceStore((s) => s.loadTemplate);
  const expressionModalOpen = useWorkspaceStore((s) => s.expressionModalOpen);
  const setExpressionModalOpen = useWorkspaceStore((s) => s.setExpressionModalOpen);

  // Resizable state
  const leftPanelWidth = useWorkspaceStore((s) => s.leftPanelWidth);
  const setLeftPanelWidth = useWorkspaceStore((s) => s.setLeftPanelWidth);
  const rightPanelWidth = useWorkspaceStore((s) => s.rightPanelWidth);
  const setRightPanelWidth = useWorkspaceStore((s) => s.setRightPanelWidth);
  const bottomPanelHeight = useWorkspaceStore((s) => s.bottomPanelHeight);
  const setBottomPanelHeight = useWorkspaceStore((s) => s.setBottomPanelHeight);

  const mod = getModule(moduleId);
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");

  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [isResizingBottom, setIsResizingBottom] = useState(false);

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
    } else if (topic === "truth-table") {
      loadTemplate("modus-ponens");
    } else if (topic === "equivalence") {
      loadTemplate("de-morgan-logic");
    } else if (topic === "expression-builder") {
      loadTemplate("excluded-middle");
    }
  }, [topic, loadTemplate]);

  // Mouse drag handlers for resizing
  const handleLeftResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingLeft(true);
  }, []);

  const handleRightResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingRight(true);
  }, []);

  const handleBottomResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingBottom(true);
  }, []);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (isResizingLeft) {
        setLeftPanelWidth(e.clientX);
      }
      if (isResizingRight) {
        setRightPanelWidth(window.innerWidth - e.clientX);
      }
      if (isResizingBottom) {
        setBottomPanelHeight(window.innerHeight - e.clientY);
      }
    }

    function handleMouseUp() {
      setIsResizingLeft(false);
      setIsResizingRight(false);
      setIsResizingBottom(false);
    }

    if (isResizingLeft || isResizingRight || isResizingBottom) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [isResizingLeft, isResizingRight, isResizingBottom, setLeftPanelWidth, setRightPanelWidth, setBottomPanelHeight]);

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-lv-bg">
      <WorkspaceToolbar projectName={mod ? `${mod.title} — Project Workspace` : "Workspace Project"} />

      <div className="flex min-h-0 flex-1 relative">
        {/* Left: Module Explorer */}
        <aside
          style={{ width: `${leftPanelWidth}px` }}
          className="hidden shrink-0 border-r border-lv-border-soft bg-lv-panel/70 sm:block overflow-hidden transition-none"
        >
          <ModuleExplorer activeModuleId={moduleId} />
        </aside>

        {/* Left Drag Resize Handle */}
        <div
          onMouseDown={handleLeftResizeStart}
          title="Drag to resize left panel"
          className="hidden sm:flex items-center justify-center w-1.5 cursor-col-resize hover:bg-lv-cyan/60 active:bg-lv-cyan z-30 transition-colors group"
        >
          <div className="w-0.5 h-8 rounded-full bg-lv-border group-hover:bg-lv-cyan transition-colors" />
        </div>

        {/* Center: Canvas + bottom dock */}
        <div className="flex min-w-0 flex-1 flex-col relative">
          <div className="relative min-h-0 flex-1">
            <WorkspaceCanvas />
          </div>

          {/* Bottom Drag Resize Handle */}
          {outputPanelOpen && (
            <div
              onMouseDown={handleBottomResizeStart}
              title="Drag to resize bottom dock"
              className="flex items-center justify-center h-1.5 w-full cursor-row-resize hover:bg-lv-cyan/60 active:bg-lv-cyan z-30 transition-colors group border-t border-lv-border-soft"
            >
              <div className="h-0.5 w-12 rounded-full bg-lv-border group-hover:bg-lv-cyan transition-colors" />
            </div>
          )}

          {outputPanelOpen && (
            <div
              style={{ height: `${bottomPanelHeight}px` }}
              className="shrink-0 bg-lv-panel/90 shadow-2xl overflow-hidden transition-none"
            >
              <OutputPanel />
            </div>
          )}
        </div>

        {/* Right Drag Resize Handle */}
        {aiPanelOpen && (
          <div
            onMouseDown={handleRightResizeStart}
            title="Drag to resize LogicAI panel"
            className="hidden sm:flex items-center justify-center w-1.5 cursor-col-resize hover:bg-lv-cyan/60 active:bg-lv-cyan z-30 transition-colors group"
          >
            <div className="w-0.5 h-8 rounded-full bg-lv-border group-hover:bg-lv-cyan transition-colors" />
          </div>
        )}

        {/* Right: LogicAI */}
        {aiPanelOpen && (
          <aside
            style={{ width: `${rightPanelWidth}px` }}
            className="hidden shrink-0 border-l border-lv-border-soft bg-lv-panel/70 sm:block overflow-hidden transition-none"
          >
            <LogicAiPanel />
          </aside>
        )}
      </div>

      {/* Expression Builder Modal */}
      <ExpressionBuilderModal
        open={expressionModalOpen}
        onClose={() => setExpressionModalOpen(false)}
      />
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
