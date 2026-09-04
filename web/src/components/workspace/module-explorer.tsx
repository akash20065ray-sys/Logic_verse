"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDot,
  Lock,
  Clock,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";
import type { ModuleStatus } from "@/types/module";
import { useWorkspaceStore } from "@/store/workspace-store";

const STATUS_ICON: Record<ModuleStatus, typeof Circle> = {
  available: CircleDot,
  "in-progress": Circle,
  locked: Lock,
  "coming-soon": Clock,
};

const TOPIC_TEMPLATE_MAP: Record<string, string> = {
  "set-operations": "union-intersection",
  "cardinality": "cardinality-demo",
  "power-set": "power-set",
  "venn": "union-intersection",
  "expression-builder": "excluded-middle",
  "truth-table": "modus-ponens",
  "equivalence": "de-morgan-logic",
  "induction": "modus-ponens",
};

export function ModuleExplorer({ activeModuleId }: { activeModuleId: string }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set([activeModuleId]));
  const [previewModule, setPreviewModule] = useState<typeof MODULES[0] | null>(null);
  const loadTemplate = useWorkspaceStore((s) => s.loadTemplate);
  const setOutputTab = useWorkspaceStore((s) => s.setOutputTab);
  const setActiveModule = useWorkspaceStore((s) => s.setActiveModule);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleTopicClick(topicId: string, targetModuleId: string) {
    if (targetModuleId !== activeModuleId) {
      window.location.href = `/workspace/${targetModuleId}?topic=${topicId}`;
      return;
    }

    const templateId = TOPIC_TEMPLATE_MAP[topicId];
    if (templateId) {
      loadTemplate(templateId);
      if (topicId === "venn") {
        setOutputTab("output");
      } else if (topicId === "induction") {
        setOutputTab("induction");
      } else if (topicId === "truth-table") {
        setOutputTab("output");
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-lv-border-soft px-4 py-3 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-lv-faint">
          Module Explorer
        </span>
        <span className="text-[10px] font-mono text-lv-cyan bg-lv-cyan/10 px-1.5 py-0.5 rounded">
          Syllabus
        </span>
      </div>

      <nav className="lv-scrollbar flex-1 overflow-y-auto px-2 py-2" aria-label="Modules">
        {MODULES.map((mod) => {
          const isOpen = expanded.has(mod.id);
          const isActive = mod.id === activeModuleId;
          const isAvailable = mod.status === "available";

          return (
            <div key={mod.id} className="mb-1">
              <button
                type="button"
                onClick={() => toggle(mod.id)}
                className={cn(
                  "flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors",
                  isActive
                    ? "bg-lv-surface/90 text-lv-text font-medium"
                    : "text-lv-muted hover:bg-lv-surface/50 hover:text-lv-text"
                )}
              >
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-lv-faint" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-lv-faint" />
                )}
                <span className="truncate">{mod.shortLabel}</span>
                {!isAvailable && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewModule(mod);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        setPreviewModule(mod);
                      }
                    }}
                    className="ml-auto rounded-full bg-lv-surface px-1.5 py-0.5 text-[9px] font-mono text-lv-faint hover:text-lv-cyan transition-colors cursor-pointer"
                  >
                    Preview
                  </span>
                )}
              </button>

              {isOpen && (
                <ul className="ml-5 border-l border-lv-border-soft pl-3 mt-1 space-y-0.5">
                  {mod.topics.map((topic) => {
                    const Icon = STATUS_ICON[topic.status];
                    const isClickable = isAvailable && topic.status === "available";

                    return (
                      <li key={topic.id}>
                        <button
                          type="button"
                          onClick={() => {
                            if (isClickable) {
                              handleTopicClick(topic.id, mod.id);
                            } else {
                              setPreviewModule(mod);
                            }
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-left transition-colors",
                            isClickable
                              ? "text-lv-muted hover:bg-lv-surface/70 hover:text-lv-text"
                              : "text-lv-faint hover:text-lv-muted hover:bg-lv-surface/30 cursor-pointer"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-3 w-3 shrink-0",
                              isClickable ? "text-lv-cyan" : "text-lv-faint"
                            )}
                          />
                          <span className="truncate">{topic.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Upcoming Module Syllabus Preview Modal */}
      {previewModule && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setPreviewModule(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-lv-border bg-lv-panel p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-lv-border-soft pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-lv-purple/20 px-2 py-0.5 font-mono text-xs text-lv-purple font-semibold">
                  {previewModule.unit}
                </span>
                <h3 className="text-base font-bold text-lv-text">{previewModule.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModule(null)}
                className="text-xs text-lv-faint hover:text-lv-text"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-lv-muted leading-relaxed">
              {previewModule.description}
            </p>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-lv-faint uppercase font-mono tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-lv-cyan" />
                Syllabus Topics & Visualizers
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {previewModule.topics.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 rounded-xl border border-lv-border bg-lv-surface p-2.5 text-xs text-lv-text"
                  >
                    <Sparkles className="h-3 w-3 text-lv-purple shrink-0" />
                    <span className="truncate">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-lv-surface/60 border border-lv-border p-3 text-xs text-lv-faint">
              💡 <em>Phase 1 ships Set Theory as the reference module. Unit {previewModule.unit} visualizers follow the same deterministic graph contract!</em>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
