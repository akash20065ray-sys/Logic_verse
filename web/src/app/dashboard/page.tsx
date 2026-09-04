import Link from "next/link";
import { TrendingUp, Clock, Target, ArrowUpRight } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MODULES } from "@/lib/modules";

const RECENT_PROJECTS = [
  { id: "1", name: "Union Practice", module: "Set Theory", updated: "2 hours ago", accent: "blue" },
  { id: "2", name: "Venn Diagram Demo", module: "Set Theory", updated: "Yesterday", accent: "purple" },
];

const STRONG_TOPICS = ["Set Operations", "Cardinality"];
const NEEDS_PRACTICE = ["Context-Free Grammar", "Pushdown Automata"];

export default function DashboardPage() {
  return (
    <div className="flex h-dvh w-full bg-lv-bg">
      <DashboardSidebar />

      <main className="lv-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
          <div className="mb-10">
            <h1 className="text-2xl font-semibold tracking-tight text-lv-text">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-lv-muted">
              Here&rsquo;s where your learning stands across LogicVerse.
            </p>
          </div>

          {/* Stats row */}
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={TrendingUp} label="Overall progress" value="84%" accent="text-lv-cyan" />
            <StatCard icon={Target} label="Modules started" value="1 / 7" accent="text-lv-blue" />
            <StatCard icon={Clock} label="Time this week" value="2h 15m" accent="text-lv-purple" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Recent projects */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-medium text-lv-text">Recent projects</h2>
                <Link href="/workspace/set-theory" className="text-xs text-lv-muted hover:text-lv-text">
                  View all
                </Link>
              </div>
              <div className="space-y-2.5">
                {RECENT_PROJECTS.map((p) => (
                  <Link
                    key={p.id}
                    href="/workspace/set-theory"
                    className="group flex items-center justify-between rounded-xl border border-lv-border bg-lv-panel/60 px-4 py-3.5 transition-colors hover:bg-lv-surface/60"
                  >
                    <div>
                      <p className="text-sm font-medium text-lv-text">{p.name}</p>
                      <p className="mt-0.5 text-xs text-lv-faint">
                        {p.module} · Updated {p.updated}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-lv-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lv-text" />
                  </Link>
                ))}

                {/* Empty-state style prompt for unstarted modules */}
                <div className="rounded-xl border border-dashed border-lv-border px-4 py-3.5 text-xs text-lv-faint">
                  {MODULES.filter((m) => m.status !== "available").length} more modules
                  waiting to be started once they ship.
                </div>
              </div>
            </div>

            {/* Learning analytics summary */}
            <div>
              <h2 className="mb-4 text-sm font-medium text-lv-text">Topic strength</h2>
              <div className="rounded-xl border border-lv-border bg-lv-panel/60 p-4">
                <p className="mb-2 text-xs font-medium text-lv-success">Strong topics</p>
                <ul className="mb-4 space-y-1.5">
                  {STRONG_TOPICS.map((t) => (
                    <li key={t} className="flex items-center gap-2 text-xs text-lv-muted">
                      <span className="h-1 w-1 rounded-full bg-lv-success" />
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mb-2 text-xs font-medium text-lv-warning">Needs practice</p>
                <ul className="space-y-1.5">
                  {NEEDS_PRACTICE.map((t) => (
                    <li key={t} className="flex items-center gap-2 text-xs text-lv-muted">
                      <span className="h-1 w-1 rounded-full bg-lv-warning" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-lv-border bg-lv-panel/60 p-4">
      <div className="flex items-center gap-2 text-xs text-lv-faint">
        <Icon className={`h-3.5 w-3.5 ${accent}`} strokeWidth={1.75} />
        {label}
      </div>
      <p className="mt-2 font-mono text-2xl text-lv-text">{value}</p>
    </div>
  );
}
