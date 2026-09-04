"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Braces,
  Save,
  Play,
  Share2,
  Settings,
  PanelRight,
  PanelBottom,
  Check,
  RotateCcw,
  Wand2,
  Palette,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { cn } from "@/lib/utils";

export function WorkspaceToolbar({ projectName }: { projectName: string }) {
  const activeModuleId = useWorkspaceStore((s) => s.activeModuleId);
  const aiPanelOpen = useWorkspaceStore((s) => s.aiPanelOpen);
  const outputPanelOpen = useWorkspaceStore((s) => s.outputPanelOpen);
  const paletteOpen = useWorkspaceStore((s) => s.paletteOpen);
  const toggleAiPanel = useWorkspaceStore((s) => s.toggleAiPanel);
  const toggleOutputPanel = useWorkspaceStore((s) => s.toggleOutputPanel);
  const togglePalette = useWorkspaceStore((s) => s.togglePalette);
  const toggleExpressionModal = useWorkspaceStore((s) => s.toggleExpressionModal);
  const saveProject = useWorkspaceStore((s) => s.saveProject);
  const saveStatus = useWorkspaceStore((s) => s.saveStatus);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);
  const setIsPlayingSteps = useWorkspaceStore((s) => s.setIsPlayingSteps);
  const setStepIndex = useWorkspaceStore((s) => s.setStepIndex);
  const recomputeGraph = useWorkspaceStore((s) => s.recomputeGraph);
  const clearCanvas = useWorkspaceStore((s) => s.clearCanvas);
  const loadTemplate = useWorkspaceStore((s) => s.loadTemplate);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  function handleRun() {
    recomputeGraph();
    if (activeModuleId === "logic") {
      setOutputTab("output");
    } else {
      setOutputTab("steps");
      setStepIndex(0);
      setIsPlayingSteps(true);
    }
  }

  function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  }

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-between border-b border-lv-border-soft bg-lv-panel px-3 z-40">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-lv-surface/60 transition-colors"
          title="Return to Home"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-lv-blue to-lv-purple shadow">
            <Braces className="h-4 w-4 text-white" strokeWidth={2.25} />
          </span>
          <span className="font-mono text-sm font-bold text-lv-text hidden sm:inline">
            LogicVerse
          </span>
        </Link>
        <div className="h-5 w-px bg-lv-border" />
        <span className="text-sm font-medium text-lv-text truncate max-w-[180px] sm:max-w-none">
          {projectName}
        </span>
        {saveStatus ? (
          <span className="rounded-full bg-lv-success/15 border border-lv-success/30 px-2 py-0.5 text-[10px] font-mono text-lv-success animate-fade-in">
            {saveStatus}
          </span>
        ) : (
          <span className="rounded-full border border-lv-border px-2 py-0.5 text-[10px] text-lv-faint hidden md:inline">
            Local sync
          </span>
        )}
      </div>

      {/* Toolbar actions */}
      <div className="flex items-center gap-1.5">
        {/* Custom Expression Builder button */}
        <button
          type="button"
          onClick={toggleExpressionModal}
          className="inline-flex items-center gap-1.5 rounded-lg border border-lv-cyan/40 bg-lv-cyan/10 px-2.5 py-1.5 text-xs font-semibold text-lv-cyan hover:bg-lv-cyan/20 transition-all active:scale-95 shadow-xs"
          title="Build your own formula"
        >
          <Wand2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Expression Builder</span>
        </button>

        <ToolbarButton icon={Save} label="Save" onClick={saveProject} />
        <ToolbarButton icon={Play} label="Run" accent onClick={handleRun} />
        <ToolbarButton
          icon={copiedShare ? Check : Share2}
          label={copiedShare ? "Copied!" : "Share"}
          onClick={handleShare}
        />

        <div className="mx-1 h-5 w-px bg-lv-border" />

        {/* Palette Toggle */}
        <ToolbarIconToggle
          icon={Palette}
          label="Toggle components palette"
          active={paletteOpen}
          onClick={togglePalette}
        />

        <ToolbarIconToggle
          icon={PanelRight}
          label="Toggle LogicAI panel"
          active={aiPanelOpen}
          onClick={toggleAiPanel}
        />
        <ToolbarIconToggle
          icon={PanelBottom}
          label="Toggle output dock"
          active={outputPanelOpen}
          onClick={toggleOutputPanel}
        />

        {/* Settings button & popover */}
        <div className="relative">
          <ToolbarIconToggle
            icon={Settings}
            label="Settings"
            active={settingsOpen}
            onClick={() => setSettingsOpen(!settingsOpen)}
          />

          {settingsOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-lv-border bg-lv-panel p-3 shadow-2xl backdrop-blur-xl space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-lv-faint font-semibold border-b border-lv-border-soft pb-1.5">
                Workspace Controls
              </div>

              <button
                type="button"
                onClick={() => {
                  togglePalette();
                  setSettingsOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs text-lv-muted hover:bg-lv-surface hover:text-lv-text transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Palette className="h-3.5 w-3.5 text-lv-cyan" />
                  <span>Floating Palette</span>
                </span>
                <span className="font-mono text-[10px] text-lv-faint">{paletteOpen ? "ON" : "OFF"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (activeModuleId === "logic") {
                    loadTemplate("modus-ponens");
                  } else {
                    loadTemplate("union-intersection");
                  }
                  setSettingsOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-lv-muted hover:bg-lv-surface hover:text-lv-text transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5 text-lv-cyan" />
                <span>Reset to Default Model</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  clearCanvas();
                  setSettingsOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-lv-error hover:bg-lv-surface transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5 text-lv-error" />
                <span>Clear Canvas</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  accent,
  onClick,
}: {
  icon: typeof Save;
  label: string;
  accent?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all active:scale-95",
        accent
          ? "bg-lv-blue text-white hover:bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.3)]"
          : "text-lv-muted hover:bg-lv-surface hover:text-lv-text"
      )}
      aria-label={label}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ToolbarIconToggle({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof PanelRight;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        active
          ? "bg-lv-surface text-lv-cyan border border-lv-border"
          : "text-lv-faint hover:bg-lv-surface hover:text-lv-muted"
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
    </button>
  );
}
