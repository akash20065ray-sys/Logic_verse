import type { GraphEvaluation } from "./graph-evaluator";

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

export function answerDiscreteMathQuestion(query: string, evalResult: GraphEvaluation): AiResponse {
  const q = query.toLowerCase();

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
        "### De Morgan's Laws for Sets\n\n1. **First Law**: $(A \\cup B)^c = A^c \\cap B^c$\n   *The complement of the union equals the intersection of the complements.*\n\n2. **Second Law**: $(A \\cap B)^c = A^c \\cup B^c$\n   *The complement of the intersection equals the union of the complements.*\n\nThese laws allow you to convert between OR (union) and AND (intersection) by distributing the negation.",
      suggestedAction: {
        label: "Load De Morgan Template",
        actionType: "load-template",
        templateId: "de-morgan",
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
        "### Power Set 𝒫(A)\n\nThe power set of $A$, denoted $\\mathcal{P}(A)$ or $2^A$, is the collection of **all possible subsets** of $A$.\n\n- If $|A| = n$, then $|\mathcal{P}(A)| = 2^n$.\n- Always includes the empty set $\\emptyset$ and the full set $A$ itself.\n- For example, if $A = \\{1, 2\\}$, then $\\mathcal{P}(A) = \\{\\emptyset, \\{1\\}, \\{2\\}, \\{1, 2\\}\\}$ ($2^2 = 4$ subsets).",
      suggestedAction: {
        label: "Load Power Set Template",
        actionType: "load-template",
        templateId: "power-set",
      },
    };
  }

  if (q.includes("cartesian") || q.includes("product") || q.includes("pair")) {
    return {
      message:
        "### Cartesian Product A × B\n\nThe Cartesian product produces ordered pairs $(x, y)$ such that $x \\in A$ and $y \\in B$.\n\n- Formally: $A \\times B = \\{ (x, y) \\mid x \\in A \\land y \\in B \\}$\n- Cardinality rule: $|A \\times B| = |A| \\cdot |B|$\n- Non-commutative: $A \\times B \\ne B \\times A$ unless $A = B$ or one is empty.",
      suggestedAction: {
        label: "Load Cartesian Product Template",
        actionType: "load-template",
        templateId: "cartesian-product",
      },
    };
  }

  if (q.includes("venn") || q.includes("diagram")) {
    return {
      message:
        "### Venn Diagrams in LogicVerse\n\nA Venn diagram visually depicts set relationships in an enclosed universe $\\mathcal{U}$:\n\n- **A only**: $A - B$\n- **B only**: $B - A$\n- **Overlap**: $A \\cap B$\n- **Total shaded**: $A \\cup B$\n\nLook at the **Output tab** in the bottom dock — LogicVerse renders an interactive, real SVG Venn diagram populated with your exact canvas elements!",
    };
  }

  // General discrete math response referencing canvas
  return {
    message: `I understand you're asking about: "${query}".\n\n${generateExplanation(evalResult).message}\n\nYou can also ask me about **De Morgan's laws**, **Power sets**, **Cartesian products**, **Inclusion-exclusion**, or click **Generate example** to explore preset configurations!`,
  };
}
