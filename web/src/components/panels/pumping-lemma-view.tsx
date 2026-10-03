"use client";

import { useState } from "react";
import { generatePumpingLemmaProof } from "@/lib/algorithms/regex";
import { AlertCircle, CheckCircle2, Sigma, ArrowRight } from "lucide-react";

export function PumpingLemmaView() {
  const [lang, setLang] = useState<"anbn" | "wwR" | "0n1n">("anbn");
  const [p, setP] = useState(3);
  const [i, setI] = useState(2);

  const proof = generatePumpingLemmaProof(lang, p, i);

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-lv-border-soft pb-2">
        <div className="flex items-center gap-2">
          <Sigma className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-sm text-lv-text uppercase tracking-wider">
            Pumping Lemma Formal Proof Generator
          </span>
        </div>
        <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 text-xs font-bold">
          Proof by Contradiction
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setLang("anbn")}
          className={`rounded-xl p-3 border text-left transition-colors ${
            lang === "anbn"
              ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold"
              : "bg-lv-surface border-lv-border text-lv-muted"
          }`}
        >
          <div className="text-xs font-bold">L = {"{ aⁿ bⁿ | n ≥ 0 }"}</div>
          <div className="text-[11px] opacity-75 mt-0.5">Equal count of a's and b's</div>
        </button>
        <button
          type="button"
          onClick={() => setLang("wwR")}
          className={`rounded-xl p-3 border text-left transition-colors ${
            lang === "wwR"
              ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold"
              : "bg-lv-surface border-lv-border text-lv-muted"
          }`}
        >
          <div className="text-xs font-bold">L = {"{ w wᴿ | w ∈ {a,b}* }"}</div>
          <div className="text-[11px] opacity-75 mt-0.5">Even-length palindromes</div>
        </button>
        <button
          type="button"
          onClick={() => setLang("0n1n")}
          className={`rounded-xl p-3 border text-left transition-colors ${
            lang === "0n1n"
              ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold"
              : "bg-lv-surface border-lv-border text-lv-muted"
          }`}
        >
          <div className="text-xs font-bold">L = {"{ 0ⁿ 1ⁿ | n ≥ 0 }"}</div>
          <div className="text-[11px] opacity-75 mt-0.5 font-mono">Binary non-regular language</div>
        </button>
      </div>

      {/* Proof Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-lv-border bg-lv-surface/70 p-3">
        <div>
          <label className="text-[11px] font-bold text-lv-faint block mb-1">
            Pumping Length p = {p}
          </label>
          <input
            type="range"
            min={2}
            max={8}
            value={p}
            onChange={(e) => setP(Number(e.target.value))}
            className="w-full accent-amber-400"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-lv-faint block mb-1">
            Pump Exponent i = {i}
          </label>
          <input
            type="range"
            min={0}
            max={6}
            value={i}
            onChange={(e) => setI(Number(e.target.value))}
            className="w-full accent-amber-400"
          />
        </div>
      </div>

      {/* String Partition Breakdown */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2">
        <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
          <span>String Partition s = xyz ("{proof.chosenString}"):</span>
          <span>|s| = {proof.chosenString.length} ≥ p ({p})</span>
        </div>

        <div className="flex items-center gap-2 text-sm font-bold font-mono">
          <span className="rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 px-3 py-1">
            x = "{proof.partitionX}"
          </span>
          <span className="text-lv-faint">+</span>
          <span className="rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1">
            y = "{proof.partitionY}"
          </span>
          <span className="text-lv-faint">+</span>
          <span className="rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1">
            z = "{proof.partitionZ}"
          </span>
        </div>

        <div className="pt-1 flex items-center gap-2 text-xs">
          <ArrowRight className="w-4 h-4 text-amber-400" />
          <span className="text-lv-muted">Pumped string s' = x y^{i} z:</span>
          <span className="font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-amber-500/40">
            "{proof.pumpedString}"
          </span>
        </div>
      </div>

      {/* Step-by-Step Formal Proof Lines */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-lv-faint uppercase tracking-wider block">
          Formal Step-by-Step Proof Deduction
        </span>
        <div className="space-y-1.5">
          {proof.proofSteps.map((step, idx) => (
            <div key={idx} className="rounded-xl border border-lv-border bg-lv-panel p-2.5 text-xs text-lv-text">
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
