import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { AutomatonHero } from "./automaton-hero";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden lv-grid-bg">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-lv-bg via-transparent to-lv-bg" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-lv-purple/10 blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-32">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lv-border bg-lv-surface/60 px-3 py-1 text-xs text-lv-muted">
            <Sparkles className="h-3.5 w-3.5 text-lv-cyan" />
            Visual IDE for formal reasoning
          </div>

          <h1 className="font-sans text-5xl font-semibold leading-[1.05] tracking-tight text-lv-text sm:text-6xl">
            Build.{" "}
            <span className="text-lv-blue">Visualize.</span>
            <br />
            <span className="text-lv-purple">Simulate.</span>{" "}
            <span className="text-lv-cyan">Understand.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-lv-muted">
            LogicVerse turns Discrete Mathematics and Theory of Computation into
            something you construct, not just read. Drag states instead of
            memorizing syntax. Watch every algorithm execute step by step.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/workspace/set-theory"
              className="group inline-flex items-center gap-2 rounded-lg bg-lv-blue px-5 py-3 text-sm font-medium text-white transition-all hover:bg-blue-600 hover:shadow-[0_0_24px_rgba(37,99,235,0.4)]"
            >
              Open the workspace
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#workflow"
              className="text-sm font-medium text-lv-muted transition-colors hover:text-lv-text"
            >
              See how it works
            </Link>
          </div>

          <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-lv-border-soft pt-6">
            <div>
              <dt className="text-xs text-lv-faint">Syllabus units</dt>
              <dd className="mt-1 font-mono text-2xl text-lv-text">6</dd>
            </div>
            <div>
              <dt className="text-xs text-lv-faint">Interactive modules</dt>
              <dd className="mt-1 font-mono text-2xl text-lv-text">7</dd>
            </div>
            <div>
              <dt className="text-xs text-lv-faint">Deterministic engine</dt>
              <dd className="mt-1 font-mono text-2xl text-lv-cyan">100%</dd>
            </div>
          </dl>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full rounded-2xl border border-lv-border bg-lv-panel/80 p-8 shadow-2xl shadow-black/40">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-mono text-xs text-lv-faint">automaton.sim</span>
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-lv-error/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-lv-warning/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-lv-success/60" />
              </span>
            </div>
            <AutomatonHero />
          </div>
        </div>
      </div>
    </section>
  );
}
