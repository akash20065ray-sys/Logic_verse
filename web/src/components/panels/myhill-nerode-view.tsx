"use client";

import { Binary, CheckCircle2, AlertCircle, Layers } from "lucide-react";

export function MyhillNerodeView() {
  const classes = [
    {
      eqClass: "[ε] = { ε }",
      rep: "ε",
      transitions: "a ➔ [a], b ➔ [b]",
      distinguishing: "z = 'a' (εa ∈ L vs ba ∉ L)",
      dfaState: "q₀ (Start State)",
    },
    {
      eqClass: "[a] = { a, aa, aaa, ... }",
      rep: "a",
      transitions: "a ➔ [a], b ➔ [ab]",
      distinguishing: "z = 'b' (ab ∈ L vs bb ∉ L)",
      dfaState: "q₁ (State after 'a')",
    },
    {
      eqClass: "[ab] = { ab, aab, aaab, ... }",
      rep: "ab",
      transitions: "a ➔ [a], b ➔ [abb]",
      distinguishing: "z = 'b' (abb ∈ L)",
      dfaState: "q₂ (State after 'ab')",
    },
    {
      eqClass: "[abb] = { abb, aabb, ... }",
      rep: "abb",
      transitions: "a ➔ [a], b ➔ [b]",
      distinguishing: "z = ε (Already in L)",
      dfaState: "q₃ (Accept State q𝐹)",
    },
  ];

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-lv-border-soft pb-2">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-sm text-lv-text uppercase tracking-wider">
            Myhill–Nerode Equivalence Class Matrix
          </span>
        </div>
        <span className="rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2.5 py-0.5 text-xs font-bold">
          Index k = 4 (Minimal DFA States)
        </span>
      </div>

      <p className="text-lv-muted leading-relaxed">
        The Myhill-Nerode Theorem states that a language L is regular if and only if the number of equivalence classes of right congruence ~L is finite.
      </p>

      {/* Equivalence Classes Table */}
      <div className="overflow-x-auto rounded-xl border border-lv-border bg-lv-panel">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-lv-border bg-lv-surface/70 text-lv-faint">
              <th className="p-2.5 font-bold">Equivalence Class [x]</th>
              <th className="p-2.5 font-bold">Canonical Rep</th>
              <th className="p-2.5 font-bold">Distinguishing Extension z</th>
              <th className="p-2.5 font-bold">Minimal DFA State Mapping</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lv-border-soft">
            {classes.map((c, idx) => (
              <tr key={idx} className="hover:bg-lv-surface/40 transition-colors">
                <td className="p-2.5 font-bold text-sky-400">{c.eqClass}</td>
                <td className="p-2.5 font-mono text-lv-text">{c.rep}</td>
                <td className="p-2.5 text-lv-muted">{c.distinguishing}</td>
                <td className="p-2.5 font-bold text-emerald-400">{c.dfaState}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
