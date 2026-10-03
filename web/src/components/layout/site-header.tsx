import Link from "next/link";
import { Braces } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 lv-glass border-b border-lv-border-soft">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-lv-blue to-lv-purple">
            <Braces className="h-4.5 w-4.5 text-white" strokeWidth={2.25} />
          </span>
          <span className="font-mono text-[15px] font-semibold tracking-tight text-lv-text">
            LogicVerse
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <Link href="#modules" className="text-sm text-lv-muted transition-colors hover:text-lv-text">
            Modules
          </Link>
          <Link href="#workflow" className="text-sm text-lv-muted transition-colors hover:text-lv-text">
            How it works
          </Link>
          <Link href="#logicai" className="text-sm text-lv-muted transition-colors hover:text-lv-text">
            LogicAI
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden text-sm text-lv-muted transition-colors hover:text-lv-text sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/workspace/set-theory"
            className="rounded-lg bg-lv-blue px-4 py-2 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.35)]"
          >
            Open Workspace
          </Link>
        </div>
      </div>
    </header>
  );
}
