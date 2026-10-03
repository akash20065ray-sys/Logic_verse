import type { GraphEvaluation } from "./graph-evaluator";
import type { LogicEvaluation } from "./logic-graph-evaluator";
import type { AutomatonSimulation } from "./automata";

export interface AiResponse {
  message: string;
  suggestedAction?: {
    label: string;
    actionType: "load-template" | "add-node" | "fix-error";
    templateId?: string;
  };
  keyTakeaways?: string[];
}

export function generateExplanation(evalResult: GraphEvaluation): AiResponse {
  const { primaryResult, primarySets, errors } = evalResult;

  if (errors.some((e) => e.type === "error")) {
    const err = errors.find((e) => e.type === "error");
    return {
      message: `I notice an issue with the canvas graph: **${err?.message}**.\n\n${err?.remedy || "Please adjust your node connections so the graph flows in one direction without circular loops."}`,
      suggestedAction: {
        label: "Fix canvas connections",
        actionType: "fix-error",
      },
    };
  }

  if (primarySets.length === 0) {
    return {
      message:
        "Your canvas is currently empty. To get started, click **Add Set** on the palette to define sets (e.g. $A = \\{1, 2, 3\\}$), drop an operation like **Union (∪)** or **Intersection (∩)**, and connect them to a **Result** node!",
      suggestedAction: {
        label: "Load Union Example",
        actionType: "load-template",
        templateId: "union-intersection",
      },
    };
  }

  if (!primaryResult) {
    const warning = errors.find((e) => e.type === "warning");
    return {
      message: `You have ${primarySets.length} set(s) on the canvas (${primarySets.map((s) => `${s.label} = {${s.elements.join(", ")}}`).join(", ")}). ${
        warning
          ? `However, **${warning.message}** ${warning.remedy || ""}`
          : "Connect an operation node between your sets and link it to a Result node to compute the model."
      }`,
      suggestedAction: {
        label: "Connect Result Node",
        actionType: "add-node",
      },
    };
  }

  const [setA, setB] = primarySets;
  const elementsFormatted = primaryResult.elements.length === 0 ? "∅ (empty set)" : `{${primaryResult.elements.join(", ")}}`;

  let details = "";
  if (primaryResult.notation.includes("∪")) {
    details = `The **Union (∪)** collects every distinct element that belongs to **${setA?.label ?? "A"}**, **${setB?.label ?? "B"}**, or both. Since elements already present are not duplicated, the result has cardinality $|${primaryResult.notation}| = ${primaryResult.cardinality}$.`;
  } else if (primaryResult.notation.includes("∩")) {
    details = `The **Intersection (∩)** filters for elements simultaneously present in both **${setA?.label ?? "A"}** and **${setB?.label ?? "B"}**. ${
      primaryResult.elements.length === 0
        ? `Since they share no common elements, the sets are **disjoint** and the intersection is the empty set $\\emptyset$.`
        : `Shared elements found: ${elementsFormatted}.`
    }`;
  } else if (primaryResult.notation.includes("−")) {
    details = `The **Difference (−)** (or relative complement) starts with **${setA?.label ?? "A"}** and strips away any element also in **${setB?.label ?? "B"}**. Note that set difference is **non-commutative**: $A - B \\ne B - A$ whenever $A \\ne B$.`;
  } else if (primaryResult.notation.includes("⊕")) {
    details = `The **Symmetric Difference (⊕)** computes the exclusive OR: elements in either set, but strictly **not in both**. It is equivalent to $(A \\cup B) - (A \\cap B)$.`;
  } else if (primaryResult.notation.includes("×")) {
    details = `The **Cartesian Product (×)** constructs ordered pairs $(a, b)$ where $a \\in A$ and $b \\in B$. The total number of pairs is exactly $|A| \\times |B| = ${setA?.elements.length ?? 0} \\times ${setB?.elements.length ?? 0} = ${primaryResult.cardinality}$.`;
  } else if (primaryResult.notation.includes("𝒫")) {
    details = `The **Power Set 𝒫** is the set of all subsets. For a set of size $n = ${setA?.elements.length ?? 0}$, there are exactly $2^n = ${primaryResult.cardinality}$ subsets.`;
  } else {
    details = `Computed expression: **${primaryResult.notation}** = ${elementsFormatted}.`;
  }

  return {
    message: `### Current Model Analysis: **${primaryResult.notation}**\n\n- **Input Sets**: ${primarySets.map((s) => `${s.label} = \\{${s.elements.join(", ")}\\} (|${s.label}| = ${s.elements.length})`).join(", ")}\n- **Result**: ${primaryResult.notation} = **${elementsFormatted}**\n- **Cardinality**: $|${primaryResult.notation}| = ${primaryResult.cardinality}$\n\n${details}`,
    keyTakeaways: primaryResult.properties.slice(0, 3),
  };
}

export function generateLogicExplanation(evalResult: LogicEvaluation): AiResponse {
  const { activeExpression, truthTable, currentTruthValue, isTautology, isContradiction, errors } =
    evalResult;

  if (errors.some((e) => e.type === "error")) {
    const err = errors.find((e) => e.type === "error");
    return {
      message: `Logic Error detected: **${err?.message}**.\n\n${err?.remedy || "Please review your connections."}`,
    };
  }

  if (!truthTable || truthTable.rows.length === 0) {
    return {
      message:
        "Your logic canvas has no active formula probe. Add proposition variables (e.g. $P, Q$), connect them with logic gates like **AND (∧)** or **IMPLIES (→)**, and link to a **Result Probe** to see the full Truth Table!",
      suggestedAction: {
        label: "Load Modus Ponens",
        actionType: "load-template",
        templateId: "modus-ponens",
      },
    };
  }

  const classification = isTautology
    ? "an unconditional **TAUTOLOGY (⊤)** (true under every truth assignment)"
    : isContradiction
    ? "an unsatisfiable **CONTRADICTION (⊥)** (false under all truth assignments)"
    : "a **CONTINGENCY** (its truth value depends on the variable assignments)";

  return {
    message: `### Propositional Logic Analysis: **${activeExpression}**\n\n- **Current Value**: ${currentTruthValue ? "TRUE (T)" : "FALSE (F)"}\n- **Classification**: This proposition is ${classification}.\n- **Variables**: ${truthTable.variables.join(", ")} (${truthTable.rows.length} total interpretations)\n\nCheck the **Truth Table** tab in the dock below to inspect each row and see the canonical DNF/CNF expansions!`,
    keyTakeaways: [
      isTautology ? "Valid theorem" : isContradiction ? "Unsatisfiable" : "Satisfiable",
      `Canonical DNF: ${truthTable.dnf}`,
      `Canonical CNF: ${truthTable.cnf}`,
    ],
  };
}

export function generateAutomataExplanation(
  automataSim?: AutomatonSimulation,
  activeStepIdx: number = 0
): AiResponse {
  if (!automataSim || automataSim.steps.length === 0) {
    return {
      message:
        "The Automata canvas has no active simulation. Add states ($q_0, q_1$), connect transition edges with input symbols ('0', '1', 'ε'), and type a test string in the top palette to see live diagram step highlighting!",
    };
  }

  const { inputString, isAccepted, steps, explanation } = automataSim;
  const currentStep = steps[Math.min(activeStepIdx, steps.length - 1)];

  const stepList = steps
    .map(
      (s) =>
        `- **Step ${s.stepIndex}**: \`${s.transitionRule}\` → active state(s) **{ ${s.activeStateIds.join(", ")} }** (remaining string: "${s.remainingString}")`
    )
    .join("\n");

  return {
    message: `### Automata Simulation Step-by-Step Breakdown for "${inputString}"\n\n${explanation}\n\n#### Active Step ${currentStep.stepIndex} Highlight:\n- **Transition Fired**: \`${currentStep.transitionRule}\`\n- **Consumed Symbol**: \`${currentStep.charConsumed !== null ? `'${currentStep.charConsumed}'` : "Start Configuration"}\`\n- **Explanation**: ${currentStep.description}\n\n#### Complete Step-wise Computation Trace:\n${stepList}\n\n*Observe your canvas: the active state node(s) and active transition edge are glowing in real time as you step forward/backward!*`,
    keyTakeaways: [
      isAccepted ? "String Accepted by Machine" : "String Rejected by Machine",
      `Active Step: ${currentStep.stepIndex} of ${steps.length - 1}`,
      `Current State(s): { ${currentStep.activeStateIds.join(", ")} }`,
    ],
  };
}

export function generateHint(evalResult: GraphEvaluation): AiResponse {
  const { primaryResult, primarySets } = evalResult;

  if (primarySets.length >= 2 && primaryResult) {
    const [setA, setB] = primarySets;
    const common = setA.elements.filter((x) => setB.elements.includes(x));

    if (common.length === 0) {
      return {
        message: `💡 **Pedagogical Hint**: Notice that **${setA.label}** and **${setB.label}** have no common elements (${setA.label} ∩ ${setB.label} = ∅). They are **mutually disjoint**. In this special case, $|${setA.label} ∪ ${setB.label}| = |${setA.label}| + |${setB.label}|$. Try changing an element to see how inclusion-exclusion subtracts the overlap!`,
      };
    } else {
      return {
        message: `💡 **Pedagogical Hint**: The elements \\{${common.join(", ")}\\} are shared between ${setA.label} and ${setB.label}. In the Principle of Inclusion-Exclusion, we subtract $|${setA.label} ∩ ${setB.label}| = ${common.length}$ so those elements aren't counted twice in the union!`,
      };
    }
  }

  return {
    message:
      "💡 **Pedagogical Hint**: Explore chaining operations! Connect the output of a Union into an Intersection with a third set to visualize complex expressions like $(A \\cup B) \\cap C$.",
  };
}

export function generateLogicHint(evalResult: LogicEvaluation): AiResponse {
  const { truthTable, activeExpression } = evalResult;

  if (truthTable?.isTautology) {
    return {
      message: `💡 **Pedagogical Hint**: Notice that **${activeExpression}** is a **Tautology**! Every row in the truth table evaluates to True. That means it represents a universally valid law of inference or identity.`,
    };
  }

  if (activeExpression.includes("→")) {
    return {
      message:
        "💡 **Pedagogical Hint**: Remember the Material Implication rule: $P \\to Q$ is False **only when $P = \\text{True}$ and $Q = \\text{False}$**. If the premise $P$ is False, the conditional is vacuously True!",
    };
  }

  return {
    message:
      "💡 **Pedagogical Hint**: Try clicking the (T / F) toggle buttons directly on your variable nodes to observe how truth values propagate live through your logic gates!",
  };
}

export function generateExample(): AiResponse {
  const templates = [
    {
      id: "union-intersection",
      title: "Union & Intersection",
      desc: "Compare how A ∪ B combines elements while A ∩ B extracts common elements.",
    },
    {
      id: "difference-symdiff",
      title: "Difference & Symmetric Difference",
      desc: "Understand set subtraction A − B versus exclusive-or A ⊕ B.",
    },
    {
      id: "power-set",
      title: "Power Set Visualizer",
      desc: "Witness the exponential 2^n growth of subsets of A.",
    },
  ];

  const picked = templates[Math.floor(Math.random() * templates.length)];

  return {
    message: `✨ Here is an illustrative concept for your workspace:\n\n**${picked.title}**\n${picked.desc}\n\nWould you like me to load this template onto your canvas?`,
    suggestedAction: {
      label: `Load "${picked.title}"`,
      actionType: "load-template",
      templateId: picked.id,
    },
  };
}

export function generateLogicExample(): AiResponse {
  const templates = [
    {
      id: "modus-ponens",
      title: "Modus Ponens",
      desc: "The primary inference rule: ((P → Q) ∧ P) → Q.",
    },
    {
      id: "de-morgan-logic",
      title: "De Morgan's Law",
      desc: "Demonstrates that ¬(P ∧ Q) ≡ ¬P ∨ ¬Q.",
    },
  ];

  const picked = templates[Math.floor(Math.random() * templates.length)];

  return {
    message: `✨ Logic Theorem Suggestion:\n\n**${picked.title}**\n${picked.desc}\n\nWould you like me to load this theorem onto your canvas?`,
    suggestedAction: {
      label: `Load "${picked.title}"`,
      actionType: "load-template",
      templateId: picked.id,
    },
  };
}

export function answerDiscreteMathQuestion(
  query: string,
  evalResult: GraphEvaluation,
  logicEval?: LogicEvaluation,
  moduleId?: string,
  automataSim?: AutomatonSimulation,
  activeAutomataStepIndex?: number
): AiResponse {
  const q = query.toLowerCase();

  // 1. PDA & TM queries (check first so "Pushdown Automata" isn't misidentified as DFA/NFA Finite Automata)
  if (
    moduleId === "pda-tm" ||
    q.includes("pda") ||
    q.includes("pushdown") ||
    q.includes("turing") ||
    q.includes("tape") ||
    q.includes("halting") ||
    (q.includes("stack") && !q.includes("overflow"))
  ) {
    if (q.includes("turing") || q.includes("tape") || q.includes("halting")) {
      return {
        message:
          "### Turing Machine (TM) & Infinite Tape Memory\n\n- **7-Tuple**: $M = (Q, \\Sigma, \\Gamma, \\delta, q_0, B, F)$\n- **Infinite 2-Way Tape**: Head moves Left ($L$), Right ($R$), or Stays ($S$) while scanning/writing symbols: $\\delta(q, a) \\rightarrow (p, Y, D)$.\n- **Halting Problem ($A_{TM}$)**: It is mathematically **undecidable** whether an arbitrary Turing Machine will halt on input $w$.\n\nUse the **TM Palette** to test binary incrementer $w+1$ or custom tape transition machines!",
        keyTakeaways: ["Church-Turing Thesis", "2-Way Tape", "Undecidability"],
      };
    }
    return {
      message:
        "### Pushdown Automata (PDA) & Stack Memory\n\n- **7-Tuple**: $M = (Q, \\Sigma, \\Gamma, \\delta, q_0, Z_0, F)$\n- **Stack Operation**: Transitions write symbols onto LIFO stack top: $\\delta(q, a, X) \\rightarrow (p, \\gamma)$.\n- **Acceptance Criteria**:\n  1. **Final State ($F$)**: Machine ends input string in an accepting state $q_f \\in F$.\n  2. **Empty Stack (NULL)**: Machine pops all stack symbols until stack is completely empty $\\emptyset$.\n\nUse the **PDA Palette** on the canvas to add states, stack edges `a, X / γ`, and run the live stack visualizer!",
      keyTakeaways: ["LIFO Memory", "DPDA vs NPDA", "CFG Equivalence"],
    };
  }

  // 2. CFG queries
  if (
    moduleId === "cfg" ||
    q.includes("cfg") ||
    q.includes("grammar") ||
    q.includes("parse") ||
    q.includes("cnf") ||
    q.includes("cyk") ||
    q.includes("chomsky")
  ) {
    if (q.includes("cyk")) {
      return {
        message:
          "### CYK Parsing Algorithm\n\nDynamic programming algorithm testing membership $w \\in L(G)$ in $O(n^3 \\cdot |G|)$ time for grammars in CNF:\n\n- Constructs triangular table $V_{i,j}$ where entry $V_{i,j}$ contains non-terminals deriving substring $w[i \\dots i+j-1]$.\n- String $w$ is accepted if start symbol $S \\in V_{1,n}$.",
        keyTakeaways: ["O(n³) Dynamic Programming", "Triangular Table", "Requires CNF"],
      };
    }
    if (q.includes("cnf") || q.includes("chomsky")) {
      return {
        message:
          "### Chomsky Normal Form (CNF)\n\nA Context-Free Grammar is in **CNF** if all production rules are of the form:\n\n1. $A \\rightarrow BC$ (exactly two non-terminals)\n2. $A \\rightarrow a$ (exactly one terminal symbol)\n3. $S \\rightarrow \\varepsilon$ (only if $S$ is start symbol and doesn't appear on RHS)\n\n**4 Reduction Steps**: Start Symbol $\\rightarrow$ $\\varepsilon$-rules $\\rightarrow$ Unit rules ($A \\rightarrow B$) $\\rightarrow$ Restrict RHS to binary non-terminals.",
        keyTakeaways: ["4 Reduction Steps", "Binary Tree Derivations", "CYK Prerequisite"],
      };
    }
    return {
      message:
        "### Context-Free Grammar (CFG)\n\n- **4-Tuple**: $G = (V, \\Sigma, R, S)$\n- Derives strings by replacing non-terminals with production RHS.\n- Use the **CFG Palette** to type rules (e.g. `S -> a S b | ε`), generate hierarchical Parse Trees, and run the CYK parser!",
      keyTakeaways: ["Context-Free Language", "Syntax Derivation Tree", "Parsing Table"],
    };
  }

  // 3. Regex queries
  if (
    moduleId === "regex" ||
    q.includes("regex") ||
    q.includes("regular expression") ||
    q.includes("pumping") ||
    q.includes("myhill")
  ) {
    if (q.includes("pumping")) {
      return {
        message:
          "### Pumping Lemma for Regular Languages\n\nIf $L$ is regular, there exists pumping length $p$ such that any string $w \\in L$ with $|w| \\ge p$ can be split into $w = xyz$ where:\n\n1. $|xy| \\le p$\n2. $|y| > 0$\n3. $xy^i z \\in L$ for all $i \\ge 0$\n\nUsed as a proof by contradiction to show languages like $L = \\{a^n b^n\\}$ are **non-regular**!",
        keyTakeaways: ["Non-Regularity Proof", "Pumping Length p", "Adversarial Game"],
      };
    }
    return {
      message:
        "### Regular Expressions & Formal Languages\n\n- **Thompson's Construction**: Converts regex expressions directly into $\\varepsilon$-NFAs.\n- **Myhill–Nerode Theorem**: A language is regular iff it has a finite number of equivalence classes under the distinguishability relation $x \\sim_L y$.",
      keyTakeaways: ["Thompson NFA", "Myhill-Nerode Matrix", "Arden's Theorem"],
    };
  }

  // 4. Finite Automata queries (DFA / NFA)
  const isAutomata =
    moduleId === "automata" ||
    q.includes("dfa") ||
    q.includes("nfa") ||
    q.includes("finite automata") ||
    q.includes("minimization") ||
    q.includes("hopcroft") ||
    q.includes("moore") ||
    q.includes("mealy");

  if (isAutomata) {
    if (q.includes("dfa") && q.includes("nfa")) {
      return {
        message:
          "### DFA vs NFA Comparison\n\n- **DFA (Deterministic Finite Automaton)**: For every state $q \\in Q$ and input symbol $a \\in \\Sigma$, there is **exactly one** deterministic next state transition $\\delta(q, a) = q'$. No spontaneous $\\varepsilon$-transitions allowed.\n- **NFA (Non-deterministic Finite Automaton)**: Can transition to **multiple states** simultaneously $\\delta(q, a) = \\{q_1, q_2\\}$, or take spontaneous $\\varepsilon$-transitions without consuming input symbols.\n- **Equivalence**: Every NFA can be converted to an equivalent DFA via **Subset Construction (Powerset algorithm)**!",
        suggestedAction: {
          label: "View NFA → DFA Conversion Tab",
          actionType: "load-template",
          templateId: "dfa-ending-01",
        },
      };
    }
    if (q.includes("minimization") || q.includes("minimize") || q.includes("hopcroft")) {
      return {
        message:
          "### DFA Minimization (Hopcroft Partition Refinement)\n\nDFA minimization finds the unique **minimal state DFA** accepting the exact same regular language:\n\n1. Start with 0-equivalence partition splitting accepting states $F$ from non-accepting states $Q \\setminus F$.\n2. Iteratively refine partitions by splitting states that transition to different partition groups under input symbols.\n3. Merge indistinguishable states into single macro-states.",
      };
    }
    if (q.includes("explain") || q.includes("step") || q.includes("what is happening") || q.includes("why") || q.includes("current")) {
      return generateAutomataExplanation(automataSim, activeAutomataStepIndex);
    }
    return generateAutomataExplanation(automataSim, activeAutomataStepIndex);
  }

  // 5. Relations & Functions queries
  if (
    moduleId === "relations-functions" ||
    q.includes("relation") ||
    q.includes("hasse") ||
    q.includes("poset") ||
    q.includes("warshall") ||
    q.includes("function") ||
    q.includes("injective") ||
    q.includes("surjective") ||
    q.includes("bijective")
  ) {
    return {
      message:
        "### Relations & Functions Analysis\n\n- **Reflexive**: $\\forall a, (a, a) \\in R$ (Main diagonal of matrix is all 1s).\n- **Symmetric**: $(a, b) \\in R \\implies (b, a) \\in R$.\n- **Transitive**: $(a, b), (b, c) \\in R \\implies (a, c) \\in R$.\n- **Warshall's Algorithm**: Computes transitive closure $R^+$ in $O(n^3)$ steps.\n- **Hasse Diagram**: Visual representation of Partially Ordered Sets (Posets) omitting reflexive loops and transitive edges.",
      keyTakeaways: ["Binary Relation Matrix", "Warshall O(n³)", "Poset & Hasse Diagrams"],
    };
  }

  // 6. Propositional Logic queries
  const isLogic =
    moduleId === "logic" ||
    q.includes("truth table") ||
    q.includes("tautology") ||
    q.includes("contradiction") ||
    q.includes("modus") ||
    q.includes("induction") ||
    (q.includes("logic") && !q.includes("logicverse"));

  if (isLogic) {
    if (q.includes("modus") || q.includes("inference") || q.includes("ponens")) {
      return {
        message:
          "### Modus Ponens & Rules of Inference\n\n- **Modus Ponens**: $((P \\rightarrow Q) \\land P) \\rightarrow Q$. If $P$ implies $Q$, and $P$ is true, then $Q$ must be true.\n- **Modus Tollens**: $((P \\rightarrow Q) \\land \\neg Q) \\rightarrow \\neg P$.\n- **Hypothetical Syllogism**: $((P \\rightarrow Q) \\land (Q \\rightarrow R)) \\rightarrow (P \\rightarrow R)$.\n\nAll valid rules of inference evaluate to **Tautologies (⊤)** in the Logicverse truth table generator!",
        suggestedAction: {
          label: "Load Modus Ponens Template",
          actionType: "load-template",
          templateId: "modus-ponens",
        },
      };
    }
    if (q.includes("tautology") || q.includes("truth table") || q.includes("contradiction")) {
      return {
        message:
          "### Truth Tables & Proposition Classifications\n\n- **Truth Table**: Evaluates a boolean formula under all $2^n$ interpretations of its $n$ input variables.\n- **Tautology (⊤)**: True under *every* assignment (e.g., $P \\lor \\neg P$).\n- **Contradiction (⊥)**: False under *every* assignment (e.g., $P \\land \\neg P$).\n- **Contingency**: True under some assignments and false under others.",
        keyTakeaways: ["2ⁿ Interpretations", "Tautology vs Contradiction", "Canonical DNF / CNF"],
      };
    }
    if (logicEval) {
      if (q.includes("hint") || q.includes("help") || q.includes("clue")) {
        return generateLogicHint(logicEval);
      }
      if (q.includes("example") || q.includes("generate") || q.includes("template")) {
        return generateLogicExample();
      }
      return generateLogicExplanation(logicEval);
    }
  }

  // Set Theory or General queries
  if (q.includes("de morgan") || q.includes("demorgan")) {
    return {
      message:
        "### De Morgan's Laws\n\n1. **For Sets**: $(A \\cup B)^c = A^c \\cap B^c$\n2. **For Logic**: $\\neg(P \\land Q) \\equiv \\neg P \\lor \\neg Q$\n\nBoth reflect the exact same discrete duality: distributing a negation swaps OR and AND.",
      suggestedAction: {
        label: isLogic ? "Load De Morgan Logic" : "Load De Morgan Sets",
        actionType: "load-template",
        templateId: isLogic ? "de-morgan-logic" : "difference-symdiff",
      },
    };
  }

  if (q.includes("cardinality") || q.includes("size") || q.includes("how many")) {
    const { primaryResult, primarySets } = evalResult;
    return {
      message: `### Cardinality Overview\n\nCardinality $|S|$ denotes the count of distinct elements in set $S$.\n\n${
        primaryResult
          ? `On your canvas:\n- **${primaryResult.notation}** has cardinality **|${primaryResult.notation}| = ${primaryResult.cardinality}**\n${primarySets.map((s) => `- |${s.label}| = ${s.elements.length}`).join("\n")}`
          : "Add sets to your canvas to calculate cardinalities live."
      }\n\n**Key Formula**: $|A \\cup B| = |A| + |B| - |A \\cap B|$ (Inclusion-Exclusion Principle).`,
    };
  }

  if (q.includes("power set") || q.includes("powerset") || q.includes("subset")) {
    return {
      message:
        "### Power Set 𝒫(A)\n\nThe power set of $A$, denoted $\\mathcal{P}(A)$ or $2^A$, is the collection of **all possible subsets** of $A$.\n\n- If $|A| = n$, then $|\mathcal{P}(A)| = 2^n$.\n- Always includes the empty set $\\emptyset$ and the full set $A$ itself.",
      suggestedAction: {
        label: "Load Power Set Template",
        actionType: "load-template",
        templateId: "power-set",
      },
    };
  }

  if (q.includes("explain") || q.includes("what is happening") || q.includes("current")) {
    return generateExplanation(evalResult);
  }

  if (q.includes("hint") || q.includes("help") || q.includes("clue")) {
    return generateHint(evalResult);
  }

  if (q.includes("example") || q.includes("generate") || q.includes("template")) {
    return generateExample();
  }

  return generateExplanation(evalResult);
}

