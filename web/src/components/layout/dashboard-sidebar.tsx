import Link from "next/link";
import { Braces, LayoutDashboard, FolderKanban, BarChart3, Settings } from "lucide-react";

const NAV = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard", active: true },
  { icon: FolderKanban, label: "Projects", href: "/dashboard" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard" },
  { icon: Settings, label: "Settings", href: "/dashboard" },
];

export function DashboardSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-lv-border-soft bg-lv-panel/60 sm:flex">
      <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-lv-blue to-lv-purple">
          <Braces className="h-4 w-4 text-white" strokeWidth={2.25} />
        </span>
        <span className="font-mono text-sm font-semibold text-lv-text">LogicVerse</span>
      </Link>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
              item.active
                ? "bg-lv-surface text-lv-text"
                : "text-lv-muted hover:bg-lv-surface/60 hover:text-lv-text"
            }`}
          >
            <item.icon className="h-4 w-4" strokeWidth={1.75} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-lv-border-soft p-4">
        <Link
          href="/workspace/set-theory"
          className="block rounded-lg bg-lv-blue px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          New Project
        </Link>
      </div>
    </aside>
  );
}
