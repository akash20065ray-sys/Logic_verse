import { Bot, GitBranch, ShieldCheck } from "lucide-react";

export function LogicAiSection() {
  return (
    <section id="logicai" className="border-t border-lv-border-soft py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-lv-faint">
            Contextual tutoring
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-lv-text sm:text-4xl">
            Meet LogicAI.
          </h2>
          <p className="mt-4 max-w-md text-lv-muted">
            Not a generic chatbot in a sidebar. LogicAI receives your exact
            canvas, formal model, algorithm trace, and error state — so when
            you ask <span className="text-lv-text">&ldquo;why did my DFA reject 1011?&rdquo;</span>,
            it answers with your automaton, not a textbook example.
          </p>

          <div className="mt-8 space-y-5">
            <div className="flex gap-3.5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-lv-success" strokeWidth={1.75} />
              <p className="text-sm text-lv-muted">
                <span className="text-lv-text">The algorithm engine computes.</span>{" "}
                Deterministic results never come from a model guess — LogicAI
                only explains what already ran.
              </p>
            </div>
            <div className="flex gap-3.5">
              <GitBranch className="mt-0.5 h-5 w-5 shrink-0 text-lv-cyan" strokeWidth={1.75} />
              <p className="text-sm text-lv-muted">
                <span className="text-lv-text">Full execution trace as context.</span>{" "}
                Every state transition and stack operation is passed in, so
                explanations reference the real run, step by step.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-lv-border bg-lv-panel/70 p-6">
          <div className="mb-4 flex items-center gap-2 text-xs text-lv-faint">
            <Bot className="h-3.5 w-3.5 text-lv-purple" />
            LogicAI · Set Theory · Project &ldquo;Union Practice&rdquo;
          </div>
          <div className="space-y-3">
            <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-lv-blue/15 px-4 py-2.5 text-sm text-lv-text">
              Why is A ∪ B bigger than A ∩ B here?
            </div>
            <div className="max-w-[90%] rounded-xl rounded-tl-sm border border-lv-border bg-lv-surface px-4 py-3 text-sm leading-relaxed text-lv-muted">
              Your canvas has A = {"{2, 4, 6, 8}"} and B = {"{4, 8, 12}"}.
              The union keeps every element from both sets — 5 total — while
              the intersection keeps only what they share: {"{4, 8}"}. Union
              is always at least as large as intersection for the same pair.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
