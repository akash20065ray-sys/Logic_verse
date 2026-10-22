"use client";

import { useState, useMemo } from "react";
import { Binary, CheckCircle2, AlertCircle, Layers, ArrowRight, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MyhillLanguage {
  id: string;
  name: string;
  alphabet: string[];
  description: string;
  isRegular: boolean;
  indexK: string;
  classes: Array<{
    eqClass: string;
    rep: string;
    description: string;
    transitions: string;
    distinguishing: string;
    dfaState: string;
    isAccepting: boolean;
  }>;
  classifyString: (w: string) => {
    classIndex: number;
    explanation: string;
  };
}

const MYHILL_LANGUAGES: MyhillLanguage[] = [
  {
    id: "ends-abb",
    name: "Strings ending in 'abb'",
    alphabet: ["a", "b"],
    description: "L = { w ∈ {a, b}* | w ends with 'abb' }",
    isRegular: true,
    indexK: "4 (Minimal DFA has 4 states)",
    classes: [
      {
        eqClass: "[ε]",
        rep: "ε",
        description: "Strings ending neither in 'a', 'ab', nor 'abb' (e.g., ε, b, bb)",
        transitions: "a ➔ [a], b ➔ [ε]",
        distinguishing: "z = 'abb' (ε·abb ∈ L vs b·abb ∈ L)",
        dfaState: "q₀ (Start State)",
        isAccepting: false,
      },
      {
        eqClass: "[a]",
        rep: "a",
        description: "Strings whose longest suffix matching prefix of 'abb' is 'a' (e.g., a, ba, bba)",
        transitions: "a ➔ [a], b ➔ [ab]",
        distinguishing: "z = 'bb' (a·bb ∈ L vs ε·bb ∉ L)",
        dfaState: "q₁ (State after 'a')",
        isAccepting: false,
      },
      {
        eqClass: "[ab]",
        rep: "ab",
        description: "Strings ending in 'ab' (e.g., ab, aab, bab)",
        transitions: "a ➔ [a], b ➔ [abb]",
        distinguishing: "z = 'b' (ab·b ∈ L vs a·b ∉ L)",
        dfaState: "q₂ (State after 'ab')",
        isAccepting: false,
      },
      {
        eqClass: "[abb]",
        rep: "abb",
        description: "Strings ending in 'abb' (Accepting Equivalence Class)",
        transitions: "a ➔ [a], b ➔ [ε]",
        distinguishing: "z = ε (abb ∈ L)",
        dfaState: "q₃ (Accept State q_F)",
        isAccepting: true,
      },
    ],
    classifyString: (w: string) => {
      if (w.endsWith("abb")) {
        return { classIndex: 3, explanation: `Suffix matches 'abb' ➔ Maps to accepting class [abb].` };
      }
      if (w.endsWith("ab")) {
        return { classIndex: 2, explanation: `Suffix matches 'ab' ➔ Maps to class [ab]. Needs 'b' to reach L.` };
      }
      if (w.endsWith("a")) {
        return { classIndex: 1, explanation: `Suffix matches 'a' ➔ Maps to class [a]. Needs 'bb' to reach L.` };
      }
      return { classIndex: 0, explanation: `Suffix matches neither ➔ Maps to default start class [ε].` };
    },
  },
  {
    id: "even-a-even-b",
    name: "Even 'a's and Even 'b's",
    alphabet: ["a", "b"],
    description: "L = { w ∈ {a, b}* | |w|_a is even and |w|_b is even }",
    isRegular: true,
    indexK: "4 (Minimal DFA has 4 states)",
    classes: [
      {
        eqClass: "[ε] (Even a, Even b)",
        rep: "ε",
        description: "Even count of a's, Even count of b's (e.g., ε, aa, bb, abba)",
        transitions: "a ➔ [a], b ➔ [b]",
        distinguishing: "z = ε (ε ∈ L)",
        dfaState: "q₀ (Start & Accept State)",
        isAccepting: true,
      },
      {
        eqClass: "[a] (Odd a, Even b)",
        rep: "a",
        description: "Odd count of a's, Even count of b's (e.g., a, aaa, abb)",
        transitions: "a ➔ [ε], b ➔ [ab]",
        distinguishing: "z = 'a' (a·a ∈ L vs b·a ∉ L)",
        dfaState: "q₁ (Odd a, Even b)",
        isAccepting: false,
      },
      {
        eqClass: "[b] (Even a, Odd b)",
        rep: "b",
        description: "Even count of a's, Odd count of b's (e.g., b, bbb, aab)",
        transitions: "a ➔ [ab], b ➔ [ε]",
        distinguishing: "z = 'b' (b·b ∈ L vs a·b ∉ L)",
        dfaState: "q₂ (Even a, Odd b)",
        isAccepting: false,
      },
      {
        eqClass: "[ab] (Odd a, Odd b)",
        rep: "ab",
        description: "Odd count of a's, Odd count of b's (e.g., ab, ba, aaab)",
        transitions: "a ➔ [b], b ➔ [a]",
        distinguishing: "z = 'ab' (ab·ab ∈ L vs a·ab ∉ L)",
        dfaState: "q₃ (Odd a, Odd b)",
        isAccepting: false,
      },
    ],
    classifyString: (w: string) => {
      let countA = 0;
      let countB = 0;
      for (const ch of w) {
        if (ch === "a") countA++;
        if (ch === "b") countB++;
      }
      const evenA = countA % 2 === 0;
      const evenB = countB % 2 === 0;
      if (evenA && evenB) return { classIndex: 0, explanation: `|w|_a=${countA} (even), |w|_b=${countB} (even) ➔ [ε] (Accept)` };
      if (!evenA && evenB) return { classIndex: 1, explanation: `|w|_a=${countA} (odd), |w|_b=${countB} (even) ➔ [a]` };
      if (evenA && !evenB) return { classIndex: 2, explanation: `|w|_a=${countA} (even), |w|_b=${countB} (odd) ➔ [b]` };
      return { classIndex: 3, explanation: `|w|_a=${countA} (odd), |w|_b=${countB} (odd) ➔ [ab]` };
    },
  },
  {
    id: "contains-101",
    name: "Contains substring '101'",
    alphabet: ["0", "1"],
    description: "L = { w ∈ {0, 1}* | w contains '101' as a contiguous substring }",
    isRegular: true,
    indexK: "4 (Minimal DFA has 4 states)",
    classes: [
      {
        eqClass: "[ε]",
        rep: "ε",
        description: "No match yet; last read char was 0 or start",
        transitions: "0 ➔ [ε], 1 ➔ [1]",
        distinguishing: "z = '101' (ε·101 ∈ L)",
        dfaState: "q₀ (Start State)",
        isAccepting: false,
      },
      {
        eqClass: "[1]",
        rep: "1",
        description: "String ends in '1' without having seen '101'",
        transitions: "0 ➔ [10], 1 ➔ [1]",
        distinguishing: "z = '01' (1·01 ∈ L vs 0·01 ∉ L)",
        dfaState: "q₁ (Seen '1')",
        isAccepting: false,
      },
      {
        eqClass: "[10]",
        rep: "10",
        description: "String ends in '10' without having seen '101'",
        transitions: "0 ➔ [ε], 1 ➔ [101]",
        distinguishing: "z = '1' (10·1 ∈ L vs 1·1 ∉ L)",
        dfaState: "q₂ (Seen '10')",
        isAccepting: false,
      },
      {
        eqClass: "[101]",
        rep: "101",
        description: "String contains '101' anywhere (Dead absorbing accept state)",
        transitions: "0 ➔ [101], 1 ➔ [101]",
        distinguishing: "z = ε (Already in L)",
        dfaState: "q₃ (Accepting Trap State)",
        isAccepting: true,
      },
    ],
    classifyString: (w: string) => {
      if (w.includes("101")) {
        return { classIndex: 3, explanation: `Contains '101' ➔ In permanent accept class [101].` };
      }
      if (w.endsWith("10")) {
        return { classIndex: 2, explanation: `Ends in '10' ➔ Next '1' will complete '101' to accept.` };
      }
      if (w.endsWith("1")) {
        return { classIndex: 1, explanation: `Ends in '1' ➔ Needs '01' to accept.` };
      }
      return { classIndex: 0, explanation: `No matching suffix ➔ Start class [ε].` };
    },
  },
  {
    id: "anbn-infinite",
    name: "Non-Regular: L = { aⁿ bⁿ | n ≥ 0 }",
    alphabet: ["a", "b"],
    description: "L = { aⁿ bⁿ | n ≥ 0 } — Demonstrates infinite right-congruence classes",
    isRegular: false,
    indexK: "∞ (Infinite equivalence classes ⟹ Non-Regular by Myhill-Nerode)",
    classes: [
      {
        eqClass: "[a⁰ = ε]",
        rep: "ε",
        description: "Class for 0 leading a's; distinguished from aᵏ by z = b⁰ vs bᵏ",
        transitions: "a ➔ [a¹], b ➔ [Trap]",
        distinguishing: "z = ε (ε ∈ L vs a ∉ L)",
        dfaState: "Class 0",
        isAccepting: true,
      },
      {
        eqClass: "[a¹]",
        rep: "a",
        description: "Needs exactly 1 'b' to form ab ∈ L",
        transitions: "a ➔ [a²], b ➔ [Accept 1]",
        distinguishing: "z = 'b' (a·b ∈ L vs a²·b ∉ L)",
        dfaState: "Class 1",
        isAccepting: false,
      },
      {
        eqClass: "[a²]",
        rep: "aa",
        description: "Needs exactly 2 'b's to form aabb ∈ L",
        transitions: "a ➔ [a³], b ➔ [ab]",
        distinguishing: "z = 'bb' (a²·bb ∈ L vs a³·bb ∉ L)",
        dfaState: "Class 2",
        isAccepting: false,
      },
      {
        eqClass: "[aᵏ] for all k ≥ 0",
        rep: "aᵏ",
        description: "Every distinct power aⁱ and aʲ has distinguishing extension z = bⁱ such that aⁱbⁱ ∈ L but aʲbⁱ ∉ L!",
        transitions: "Infinite chain of distinct equivalence classes",
        distinguishing: "z = bᵏ (witness for each k)",
        dfaState: "Infinite States (No finite DFA can exist)",
        isAccepting: false,
      },
    ],
    classifyString: (w: string) => {
      return {
        classIndex: 3,
        explanation: `Each string aᵏ forms a distinct equivalence class distinguished by extension z = bᵏ. Since the number of equivalence classes is infinite (Index = ∞), L cannot be recognized by any finite automaton.`,
      };
    },
  },
];

export function MyhillNerodeView() {
  const [selectedLangId, setSelectedLangId] = useState<string>(MYHILL_LANGUAGES[0].id);
  const [testString, setTestString] = useState<string>("ababb");

  const lang = useMemo(() => {
    return MYHILL_LANGUAGES.find((l) => l.id === selectedLangId) || MYHILL_LANGUAGES[0];
  }, [selectedLangId]);

  const testClassification = useMemo(() => {
    return lang.classifyString(testString);
  }, [lang, testString]);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lv-border-soft pb-2.5">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-sm text-lv-text uppercase tracking-wider">
            Myhill–Nerode Equivalence Class Matrix & Minimal DFA Index
          </span>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-bold border",
            lang.isRegular
              ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
              : "bg-rose-500/20 text-rose-300 border-rose-500/40"
          )}
        >
          Index: {lang.indexK}
        </span>
      </div>

      {/* Language Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        {MYHILL_LANGUAGES.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setSelectedLangId(l.id)}
            className={cn(
              "rounded-xl p-2.5 border text-left transition-all",
              selectedLangId === l.id
                ? "bg-sky-500/15 border-sky-500/50 text-sky-300 font-bold shadow-sm shadow-sky-500/10"
                : "bg-lv-surface border-lv-border text-lv-muted hover:text-lv-text hover:bg-lv-panel"
            )}
          >
            <div className="text-xs font-bold truncate">{l.name}</div>
            <div className="text-[10px] text-lv-faint truncate mt-0.5">{l.description}</div>
          </button>
        ))}
      </div>

      {/* Formal Theorem Description */}
      <div className="rounded-xl border border-lv-border bg-lv-panel/90 p-3 space-y-1">
        <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Myhill–Nerode Theorem Formal Statement
        </div>
        <p className="text-[11px] text-lv-muted leading-relaxed">
          A language <span className="text-lv-text font-bold">L ⊆ Σ*</span> is regular if and only if the number of equivalence classes of the right congruence relation <span className="text-sky-300 font-bold">~L</span> is finite.
          Two strings <span className="text-lv-cyan">x</span> and <span className="text-lv-cyan">y</span> are equivalent (<span className="text-sky-300">x ~L y</span>) if and only if for all extensions <span className="text-purple-300">z ∈ Σ*</span>:
          <span className="text-lv-text font-bold block pt-0.5">xz ∈ L ⟺ yz ∈ L</span>
        </p>
      </div>

      {/* Interactive String Classifier */}
      <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
            <Play className="h-3.5 w-3.5" /> Interactive String Classifier w ➔ [w]
          </span>
          <span className="text-[11px] text-lv-faint">
            Maps arbitrary string to its canonical equivalence class
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Type input string w..."
            className="flex-1 rounded-xl border border-lv-border bg-lv-panel px-3 py-1.5 text-xs font-mono text-lv-cyan font-bold focus:outline-none focus:border-sky-400"
          />
          <button
            type="button"
            onClick={() => setTestString(testString + (lang.alphabet[0] || "a"))}
            className="rounded-lg bg-lv-surface hover:bg-lv-panel px-2.5 py-1.5 text-xs font-bold text-lv-text border border-lv-border"
          >
            +{lang.alphabet[0] || "a"}
          </button>
          <button
            type="button"
            onClick={() => setTestString(testString + (lang.alphabet[1] || "b"))}
            className="rounded-lg bg-lv-surface hover:bg-lv-panel px-2.5 py-1.5 text-xs font-bold text-lv-text border border-lv-border"
          >
            +{lang.alphabet[1] || "b"}
          </button>
          <button
            type="button"
            onClick={() => setTestString("")}
            className="rounded-lg bg-lv-surface hover:bg-lv-panel px-2.5 py-1.5 text-xs font-bold text-lv-faint border border-lv-border"
          >
            Clear (ε)
          </button>
        </div>

        <div className="rounded-xl bg-lv-panel p-2.5 border border-sky-500/20 text-xs flex items-center justify-between">
          <div className="text-lv-muted">
            String <strong className="text-lv-cyan">"{testString || "ε"}"</strong> belongs to:
            <span className="ml-2 font-bold text-sky-400">
              {lang.classes[testClassification.classIndex]?.eqClass || "[?]"}
            </span>
          </div>
          <span className="text-[11px] text-lv-faint">
            {testClassification.explanation}
          </span>
        </div>
      </div>

      {/* Equivalence Classes Table */}
      <div className="overflow-x-auto rounded-xl border border-lv-border bg-lv-panel">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-lv-border bg-lv-surface/70 text-lv-faint">
              <th className="p-2.5 font-bold">Equivalence Class [x]</th>
              <th className="p-2.5 font-bold">Canonical Rep</th>
              <th className="p-2.5 font-bold">Class Description</th>
              <th className="p-2.5 font-bold">Transitions (δ)</th>
              <th className="p-2.5 font-bold">Distinguishing Extension z</th>
              <th className="p-2.5 font-bold">Minimal DFA State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lv-border-soft">
            {lang.classes.map((c, idx) => {
              const isActive = testClassification.classIndex === idx;
              return (
                <tr
                  key={idx}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? "bg-sky-500/15 font-semibold text-lv-text"
                      : "hover:bg-lv-surface/40"
                  )}
                >
                  <td className="p-2.5 font-bold text-sky-400 flex items-center gap-1.5">
                    {isActive && <CheckCircle2 className="h-3 w-3 text-sky-400" />}
                    {c.eqClass}
                  </td>
                  <td className="p-2.5 font-mono text-lv-text">{c.rep}</td>
                  <td className="p-2.5 text-lv-muted text-[11px]">{c.description}</td>
                  <td className="p-2.5 font-mono text-purple-300 text-[11px]">{c.transitions}</td>
                  <td className="p-2.5 text-lv-cyan font-mono text-[11px]">{c.distinguishing}</td>
                  <td className="p-2.5 font-bold text-emerald-400">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] border",
                        c.isAccepting
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-lv-surface text-lv-faint border-lv-border"
                      )}
                    >
                      {c.dfaState}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
