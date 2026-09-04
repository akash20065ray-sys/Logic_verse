import type { GraphEvaluation } from "./graph-evaluator";
import type { LogicEvaluation } from "./logic-graph-evaluator";

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
  const { activeExpression, truthTable, currentTruthValue, isTautology, isContradiction, isContingent, errors } =
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
    {
      id: "de-morgan",
      title: "De Morgan's Laws",
      desc: "Verify that (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ visually on the canvas.",
    },
    {
      id: "cartesian-product",
      title: "Cartesian Product",
      desc: "Generate coordinate pairs A × B and explore relation domains.",
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
    {
      id: "material-implication",
      title: "Material Implication",
      desc: "Explores why P → Q ≡ ¬P ∨ Q.",
    },
    {
      id: "excluded-middle",
      title: "Law of Excluded Middle",
      desc: "Classic tautology: P ∨ ¬P.",
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
  moduleId?: string
): AiResponse {
  const q = query.toLowerCase();
  const isLogic = moduleId === "logic" || q.includes("logic") || q.includes("truth table") || q.includes("tautology") || q.includes("modus") || q.includes("induction");

  if (isLogic && logicEval) {
    if (q.includes("explain") || q.includes("what is happening") || q.includes("current")) {
      return generateLogicExplanation(logicEval);
    }
    if (q.includes("hint") || q.includes("help") || q.includes("clue")) {
      return generateLogicHint(logicEval);
    }
    if (q.includes("example") || q.includes("generate") || q.includes("template")) {
      return generateLogicExample();
    }
    if (q.includes("tautology")) {
      return {
        message:
          "### What is a Tautology?\n\nA **Tautology** is a propositional formula that is **True under every possible truth assignment** (every row of its truth table is $T$).\n\nExamples:\n- Law of Excluded Middle: $P \\lor \\neg P$\n- Law of Non-Contradiction: $\\neg(P \\land \\neg P)$\n- Modus Ponens: $((P \\to Q) \\land P) \\to Q$\n\nIf even a single row in the truth table is False, the formula is not a tautology.",
        suggestedAction: {
          label: "Load Modus Ponens Tautology",
          actionType: "load-template",
          templateId: "modus-ponens",
        },
      };
    }
    if (q.includes("modus ponens") || q.includes("inference")) {
      return {
        message:
          "### Modus Ponens (Law of Detachment)\n\n$$\\frac{P \\to Q, \\quad P}{\\therefore Q}$$\n\nIf statement $P \\to Q$ is true, and premise $P$ is true, then conclusion $Q$ must necessarily be true. The conditional statement $((P \\to Q) \\land P) \\to Q$ is a **Tautology**.",
        suggestedAction: {
          label: "Load Modus Ponens",
          actionType: "load-template",
          templateId: "modus-ponens",
        },
      };
    }
    if (q.includes("implication") || q.includes("->") || q.includes("implies")) {
      return {
        message:
          "### Material Implication (P → Q)\n\n$P \\to Q$ asserts: *\"If P is true, then Q must be true.\"*\n\n- When $P = \\text{True}$ and $Q = \\text{False}$, the promise is broken: **False**.\n- When $P = \\text{False}$, the statement is **vacuously True**, regardless of $Q$!\n- Equivalent to: $\\neg P \\lor Q$ (Material Implication equivalence).",
        suggestedAction: {
          label: "Load Material Implication",
          actionType: "load-template",
          templateId: "material-implication",
        },
      };
    }
    if (q.includes("induction")) {
      return {
        message:
          "### Principle of Mathematical Induction\n\nTo prove a statement $P(n)$ is true for all natural numbers $n \\ge 1$:\n\n1. **Base Step**: Prove $P(1)$ is true.\n2. **Inductive Hypothesis**: Assume $P(k)$ is true for an arbitrary integer $k \\ge 1$.\n3. **Inductive Step**: Prove that $P(k) \\implies P(k + 1)$.\n\nClick the **Induction tab** in the output dock to step through visual induction proofs!",
      };
    }
  }

  // Set Theory or General queries
  if (q.includes("explain") || q.includes("what is happening") || q.includes("current")) {
    return generateExplanation(evalResult);
  }

  if (q.includes("hint") || q.includes("help") || q.includes("clue")) {
    return generateHint(evalResult);
  }

  if (q.includes("example") || q.includes("generate") || q.includes("template")) {
    return generateExample();
  }

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

  return {
    message: `I understand you're asking about: "${query}".\n\n${
      isLogic && logicEval
        ? generateLogicExplanation(logicEval).message
        : generateExplanation(evalResult).message
    }\n\nYou can ask about **Truth tables**, **Tautologies**, **Material Implication**, **De Morgan's laws**, or **Mathematical Induction**!`,
  };
}
