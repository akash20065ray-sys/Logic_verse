import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-lv-border-soft py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <p className="font-mono text-xs text-lv-faint">
          LogicVerse — v0.1 Foundation
        </p>
        <div className="flex gap-6 text-xs text-lv-faint">
          <Link href="/workspace/set-theory" className="hover:text-lv-muted">
            Workspace
          </Link>
          <Link href="/dashboard" className="hover:text-lv-muted">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
