import { MousePointerClick, PlayCircle, Eye, MessageCircleQuestion } from "lucide-react";

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Build",
    accent: "text-lv-blue",
    ring: "ring-lv-blue/30",
    description:
      "Construct sets, automata, grammars, or machines by dragging components onto an infinite canvas — no notation to memorize first.",
  },
  {
    icon: PlayCircle,
    title: "Run",
    accent: "text-lv-purple",
    ring: "ring-lv-purple/30",
    description:
      "A deterministic algorithm engine — never an AI guess — computes the real result: the transition, the closure, the derivation.",
  },
  {
    icon: Eye,
    title: "See",
    accent: "text-lv-cyan",
    ring: "ring-lv-cyan/30",
    description:
      "Watch execution animate one step at a time: a state changing, a stack pushing, a tape head moving across the cell.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Understand",
    accent: "text-lv-success",
    ring: "ring-lv-success/30",
    description:
      "Ask LogicAI why — it has the exact model, the exact trace, and the exact error in context. No generic answers.",
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="border-t border-lv-border-soft bg-lv-panel/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 max-w-xl">
          <span className="font-mono text-xs uppercase tracking-widest text-lv-faint">
            The loop
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-lv-text sm:text-4xl">
            One workflow, every module.
          </h2>
          <p className="mt-4 text-lv-muted">
            Set theory, automata, grammars, Turing machines — every one of them
            moves through the same four moments, so once you know the loop,
            you know the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-lv-border bg-lv-border sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.title} className="group relative bg-lv-bg p-7 transition-colors hover:bg-lv-surface/60">
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-lv-surface ring-1 ${step.ring}`}>
                <step.icon className={`h-5 w-5 ${step.accent}`} strokeWidth={1.75} />
              </div>
              <h3 className="mt-5 text-lg font-medium text-lv-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-lv-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
