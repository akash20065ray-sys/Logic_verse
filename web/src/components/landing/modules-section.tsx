import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MODULES } from "@/lib/modules";
import { cn } from "@/lib/utils";

const ACCENT_MAP = {
  blue: { text: "text-lv-blue", ring: "group-hover:ring-lv-blue/40", dot: "bg-lv-blue" },
  purple: { text: "text-lv-purple", ring: "group-hover:ring-lv-purple/40", dot: "bg-lv-purple" },
  cyan: { text: "text-lv-cyan", ring: "group-hover:ring-lv-cyan/40", dot: "bg-lv-cyan" },
} as const;

export function ModulesSection() {
  return (
    <section id="modules" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <span className="font-mono text-xs uppercase tracking-widest text-lv-faint">
              Domain Libraries
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-lv-text sm:text-4xl">
              Six domains. One unified reactive engine.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-lv-muted">
            Set Theory and Propositional Logic are fully functional. Every domain
            follows the same Builder → Validator → Algorithm → Visualizer
            contract across the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((mod) => {
            const accent = ACCENT_MAP[mod.accent];
            const isAvailable = mod.status === "available";
            return (
              <Link
                key={mod.id}
                href={isAvailable ? `/workspace/${mod.id}` : "#modules"}
                className={cn(
                  "group relative rounded-2xl border border-lv-border bg-lv-panel/60 p-6 ring-1 ring-transparent transition-all",
                  accent.ring,
                  isAvailable ? "cursor-pointer hover:-translate-y-0.5 hover:bg-lv-surface/60" : "cursor-default opacity-70"
                )}
              >
                <div className="flex items-start justify-between">
                  <span className={cn("font-mono text-xs", accent.text)}>{mod.unit}</span>
                  {isAvailable ? (
                    <ArrowUpRight className="h-4 w-4 text-lv-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lv-text" />
                  ) : (
                    <span className="rounded-full border border-lv-border px-2 py-0.5 text-[10px] text-lv-faint">
                      Coming soon
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-lg font-medium text-lv-text">{mod.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-lv-muted">
                  {mod.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
                  {mod.topics.slice(0, 4).map((t) => (
                    <li key={t.id} className="flex items-center gap-1.5 text-xs text-lv-faint">
                      <span className={cn("h-1 w-1 rounded-full", accent.dot)} />
                      {t.label}
                    </li>
                  ))}
                </ul>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
