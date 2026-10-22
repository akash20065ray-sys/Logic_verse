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

// -------------------------------------------------------------------------
// EXACT NUMERICAL & COMBINATORIAL SOLVER (100% Deterministic Arithmetic)
// -------------------------------------------------------------------------
function extractNumbers(str: string): number[] {
  const matches = str.match(/\d+/g);
  return matches ? matches.map(Number) : [];
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let c = 1;
  for (let i = 1; i <= k; i++) {
    c = (c * (n - i + 1)) / i;
  }
  return Math.round(c);
}

function bellNumber(n: number): number {
  const bell: number[][] = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
  bell[0][0] = 1;
  for (let i = 1; i <= n; i++) {
    bell[i][0] = bell[i - 1][i - 1];
    for (let j = 1; j <= i; j++) {
      bell[i][j] = bell[i][j - 1] + bell[i - 1][j - 1];
    }
  }
  return bell[n][0];
}

export function solveDiscreteMathNumerical(query: string): AiResponse | null {
  const q = query.toLowerCase();
  const nums = extractNumbers(q);

  // 1. Equivalence Relations on set of size n
  if (q.includes("equivalence relation") && nums.length >= 1) {
    const n = nums[0];
    if (n > 15) return null;
    const ans = bellNumber(n);
    return {
      message: `### Exact Solution: Number of Equivalence Relations\n\nFor a set $A$ with cardinality $|A| = ${n}$:\n\n- **Mathematical Law**: The number of distinct equivalence relations on a set of size $n$ equals the **Bell Number** $B_n$, which counts the number of partitions of a set of size $n$.\n- **Formula**: $B_n = \\sum_{k=0}^{n-1} \\binom{n-1}{k} B_k$, with $B_0 = 1$.\n- **Calculation**: For $n = ${n}$, the ${n}^{\\text{th}}$ Bell Number is:\n  $$B_{${n}} = ${ans}$$\n\n**Final Answer:** There are exactly **${ans}** equivalence relations on a set of size $n = ${n}$.`,
      keyTakeaways: [`B_${n} = ${ans}`, "Equivalence Relations = Bell Numbers", "Partitions of a Set"],
    };
  }

  // 2. Reflexive Relations on set of size n
  if ((q.includes("reflexive relation") || q.includes("reflexive")) && !q.includes("symmetric") && nums.length >= 1) {
    const n = nums[0];
    if (n > 20) return null;
    const power = n * (n - 1);
    const ans = Math.pow(2, power);
    return {
      message: `### Exact Solution: Number of Reflexive Relations\n\nFor a set $A$ with $|A| = ${n}$ elements:\n\n- **Mathematical Derivation**:\n  - A relation $R$ is a subset of $A \\times A$, which has a total of $n^2 = ${n}^2 = ${n * n}$ ordered pairs.\n  - For $R$ to be **reflexive**, all $n$ diagonal pairs $(a, a)$ MUST be included in $R$.\n  - This leaves $n^2 - n = n(n-1) = ${n}(${n - 1}) = ${power}$ non-diagonal pairs $(a, b)$ with $a \\ne b$.\n  - Each of these ${power}$ pairs can be either included or excluded (2 choices each).\n- **Formula**: $$2^{n(n-1)} = 2^{${power}} = ${ans >= 1e15 ? ans.toExponential(4) : ans}$$\n\n**Final Answer:** Exactly **${ans >= 1e15 ? ans.toExponential(4) : ans.toLocaleString()}** reflexive relations can be formed on a set of size ${n}.`,
      keyTakeaways: [`2^{n(n-1)} = 2^{${power}} = ${ans}`, "All diagonal pairs required", "Binary choices on off-diagonals"],
    };
  }

  // 3. Symmetric Relations on set of size n
  if ((q.includes("symmetric relation") || q.includes("symmetric")) && !q.includes("antisymmetric") && !q.includes("reflexive") && nums.length >= 1) {
    const n = nums[0];
    if (n > 20) return null;
    const power = (n * (n + 1)) / 2;
    const ans = Math.pow(2, power);
    return {
      message: `### Exact Solution: Number of Symmetric Relations\n\nFor a set $A$ with $|A| = ${n}$ elements:\n\n- **Mathematical Derivation**:\n  - In a relation matrix of size $n \\times n$, there are $n$ diagonal elements and $\\frac{n(n-1)}{2}$ pairs of off-diagonal elements.\n  - For $R$ to be **symmetric**, if $(a, b) \\in R$, then $(b, a) \\in R$. Thus, each off-diagonal pair $(a, b)$ and $(b, a)$ must be decided together (2 choices per pair).\n  - Each of the $n$ diagonal elements $(a, a)$ can also be independently included or excluded (2 choices).\n  - Total independent choices: $n + \\frac{n(n-1)}{2} = \\frac{n(n+1)}{2} = \\frac{${n}(${n + 1})}{2} = ${power}$.\n- **Formula**: $$2^{\\frac{n(n+1)}{2}} = 2^{${power}} = ${ans >= 1e15 ? ans.toExponential(4) : ans}$$\n\n**Final Answer:** Exactly **${ans >= 1e15 ? ans.toExponential(4) : ans.toLocaleString()}** symmetric relations can be formed on a set of size ${n}.`,
      keyTakeaways: [`2^{n(n+1)/2} = 2^{${power}} = ${ans}`, "Pairs decided simultaneously", "Independent diagonals"],
    };
  }

  // 4. Reflexive and Symmetric Relations
  if (q.includes("reflexive") && q.includes("symmetric") && !q.includes("antisymmetric") && nums.length >= 1) {
    const n = nums[0];
    if (n > 20) return null;
    const power = (n * (n - 1)) / 2;
    const ans = Math.pow(2, power);
    return {
      message: `### Exact Solution: Number of Reflexive AND Symmetric Relations\n\nFor a set $A$ with $|A| = ${n}$ elements:\n\n- **Mathematical Derivation**:\n  - **Reflexive requirement**: All $n$ diagonal pairs $(a, a)$ MUST be included (1 choice).\n  - **Symmetric requirement**: For the remaining off-diagonal elements, pairs $(a, b)$ and $(b, a)$ must be decided together.\n  - The number of off-diagonal pairs is $\\frac{n(n-1)}{2} = \\frac{${n}(${n - 1})}{2} = ${power}$.\n- **Formula**: $$2^{\\frac{n(n-1)}{2}} = 2^{${power}} = ${ans}$$\n\n**Final Answer:** Exactly **${ans.toLocaleString()}** relations on a set of size ${n} are both reflexive and symmetric.`,
      keyTakeaways: [`2^{n(n-1)/2} = 2^{${power}} = ${ans}`, "Diagonal fixed to 1", "Off-diagonal pairs symmetric"],
    };
  }

  // 5. Antisymmetric Relations
  if ((q.includes("antisymmetric relation") || q.includes("antisymmetric")) && nums.length >= 1) {
    const n = nums[0];
    if (n > 15) return null;
    const offDiagPairs = (n * (n - 1)) / 2;
    const ans = Math.pow(2, n) * Math.pow(3, offDiagPairs);
    return {
      message: `### Exact Solution: Number of Antisymmetric Relations\n\nFor a set $A$ with $|A| = ${n}$ elements:\n\n- **Mathematical Derivation**:\n  - For the $n$ diagonal elements $(a, a)$, each can be either in $R$ or not in $R$ (2 choices each $\\implies 2^n = 2^{${n}} = ${Math.pow(2, n)}$).\n  - For each of the $\\frac{n(n-1)}{2} = ${offDiagPairs}$ pairs of distinct elements $(a, b)$ with $a \\ne b$, antisymmetric forbids BOTH $(a, b)$ and $(b, a)$ from being in $R$. Thus there are **3 valid choices** for each pair: (1) only $(a, b) \\in R$, (2) only $(b, a) \\in R$, or (3) neither $\\in R$.\n- **Formula**: $$2^n \\times 3^{\\frac{n(n-1)}{2}} = 2^{${n}} \\times 3^{${offDiagPairs}} = ${ans >= 1e15 ? ans.toExponential(4) : ans}$$\n\n**Final Answer:** Exactly **${ans >= 1e15 ? ans.toExponential(4) : ans.toLocaleString()}** antisymmetric relations exist on a set of size ${n}.`,
      keyTakeaways: [`2^n * 3^{n(n-1)/2} = ${ans}`, "3 choices for off-diagonal pairs", "2 choices for diagonals"],
    };
  }

  // 6. Total Relations on set of size n
  if (
    q.includes("relations") &&
    (q.includes("total") || q.includes("how many relations") || q.includes("number of relations")) &&
    nums.length >= 1
  ) {
    const n = nums[0];
    if (n > 10) return null;
    const power = n * n;
    const ans = Math.pow(2, power);
    return {
      message: `### Exact Solution: Total Number of Binary Relations\n\nFor a set $A$ with cardinality $|A| = ${n}$:\n\n- **Mathematical Derivation**:\n  - A binary relation on $A$ is any subset of the Cartesian product $A \\times A$.\n  - The cardinality of $A \\times A$ is $|A| \\times |A| = ${n} \\times ${n} = ${power}$.\n  - The number of subsets of a set of size ${power}$ is $2^{|A \\times A|}$.\n- **Formula**: $$2^{n^2} = 2^{${power}} = ${ans >= 1e15 ? ans.toExponential(4) : ans}$$\n\n**Final Answer:** Exactly **${ans >= 1e15 ? ans.toExponential(4) : ans.toLocaleString()}** relations can be formed on a set of size ${n}.`,
      keyTakeaways: [`2^{n^2} = 2^{${power}} = ${ans}`, "Power set of A x A", "Exponential growth"],
    };
  }

  // 7. Power Set size
  if (
    q.includes("power set") &&
    (q.includes("size") || q.includes("cardinality") || q.includes("elements") || q.includes("how many")) &&
    nums.length >= 1
  ) {
    const n = nums[0];
    if (n > 30) return null;
    const ans = Math.pow(2, n);
    return {
      message: `### Exact Solution: Power Set Cardinality\n\nFor a set $A$ with $|A| = ${n}$ elements:\n\n- **Mathematical Principle**: The power set $\\mathcal{P}(A)$ is the set of all subsets of $A$, including the empty set $\\emptyset$ and $A$ itself.\n- **Formula**: $$|\\mathcal{P}(A)| = 2^{|A|} = 2^{${n}} = ${ans}$$\n\n**Final Answer:** The power set contains exactly **${ans.toLocaleString()}** subsets.`,
      keyTakeaways: [`|P(A)| = 2^n = 2^{${n}} = ${ans}`, "Includes empty set ∅", "Includes full set A"],
    };
  }

  // 8. Functions from A to B
  if (q.includes("function") && (q.includes("how many") || q.includes("number of")) && nums.length >= 2) {
    const m = nums[0]; // size of domain
    const n = nums[1]; // size of codomain

    if (q.includes("injective") || q.includes("one-to-one")) {
      const ans = m <= n ? factorial(n) / (factorial(n - m) || 1) : 0;
      return {
        message: `### Exact Solution: Number of Injective (One-to-One) Functions\n\nFor domain $|A| = ${m}$ and codomain $|B| = ${n}$:\n\n- **Pigeonhole Principle**: If $|A| > |B|$, at least two elements in $A$ must map to the same element in $B$, so NO injective function is possible.\n- **Permutation Formula**: For $|A| \\le |B|$:\n  $$P(|B|, |A|) = \\frac{|B|!}{(|B| - |A|)!} = \\frac{${n}!}{(${n} - ${m})!} = ${ans}$$\n\n**Final Answer:** There are exactly **${ans}** injective functions from a set of size ${m}$ to a set of size ${n}.`,
        keyTakeaways: [`P(${n}, ${m}) = ${ans}`, "One-to-one mapping", m > n ? "Pigeonhole: 0 functions" : "Distinct elements map to distinct targets"],
      };
    }

    if (q.includes("bijective") || q.includes("one-to-one and onto")) {
      const ans = m === n ? factorial(n) : 0;
      return {
        message: `### Exact Solution: Number of Bijective Functions\n\nFor domain $|A| = ${m}$ and codomain $|B| = ${n}$:\n\n- **Bijective Requirement**: A function is bijective if and only if it is both injective and surjective, which strictly requires $|A| = |B|$.\n- **Formula**: If $|A| = |B| = n$, the number of bijections is $n! = ${n}! = ${ans}$. If $|A| \\ne |B|$, the number is **0**.\n\n**Final Answer:** There are exactly **${ans}** bijective functions between these sets.`,
        keyTakeaways: [`n! = ${ans}`, "Requires |A| == |B|", "Invertible permutations"],
      };
    }

    // Total Functions: |B|^|A| = n^m
    const ans = Math.pow(n, m);
    return {
      message: `### Exact Solution: Total Number of Functions\n\nFor domain $|A| = ${m}$ and codomain $|B| = ${n}$:\n\n- **Rule of Product**: Each of the ${m}$ elements in the domain $A$ can independently be mapped to any of the ${n}$ elements in the codomain $B$.\n- **Formula**: $$|B|^{|A|} = ${n}^{${m}} = ${ans}$$\n\n**Final Answer:** There are exactly **${ans.toLocaleString()}** possible functions from $A$ to $B$.`,
      keyTakeaways: [`|B|^{|A|} = ${n}^{${m}} = ${ans}`, "Each domain element chooses independent target", "Rule of product"],
    };
  }

  // 9. Truth table rows for n variables
  if (q.includes("truth table") && (q.includes("rows") || q.includes("how many")) && nums.length >= 1) {
    const n = nums[0];
    if (n > 20) return null;
    const ans = Math.pow(2, n);
    return {
      message: `### Exact Solution: Number of Truth Table Rows\n\nFor a propositional logic formula with $n = ${n}$ distinct variables:\n\n- **Binary Values**: Each boolean variable can be either True (1) or False (0) — exactly 2 possible truth assignments.\n- **Formula**: $$2^n = 2^{${n}} = ${ans}$$\n\n**Final Answer:** The complete truth table requires exactly **${ans}** rows.`,
      keyTakeaways: [`2^n = 2^{${n}} = ${ans} rows`, "Binary truth assignments", "Complete enumeration"],
    };
  }

  // 10. Subsets of size k (Combinations)
  if ((q.includes("subsets of size") || q.includes("combination")) && nums.length >= 2) {
    const k = nums[0];
    const n = nums[1];
    const actualN = Math.max(k, n);
    const actualK = Math.min(k, n);
    const ans = combinations(actualN, actualK);
    return {
      message: `### Exact Solution: Combinations C(n, k)\n\nChoosing $k = ${actualK}$ elements from a set of $n = ${actualN}$ elements without regard to order:\n\n- **Formula**: $$\\binom{n}{k} = \\frac{n!}{k!(n-k)!} = \\frac{${actualN}!}{${actualK}! \\times ${actualN - actualK}!} = ${ans}$$\n\n**Final Answer:** There are exactly **${ans}** subsets of size ${actualK} from a set of size ${actualN}.`,
      keyTakeaways: [`C(${actualN}, ${actualK}) = ${ans}`, "Order does not matter", "Binomial coefficient"],
    };
  }

  return null;
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

  // -------------------------------------------------------------------------
  // 0. CHECK DETERMINISTIC NUMERICAL & COMBINATORIAL SOLVER FIRST (100% Exact)
  // -------------------------------------------------------------------------
  const numericalResult = solveDiscreteMathNumerical(query);
  if (numericalResult) {
    return numericalResult;
  }

  // -------------------------------------------------------------------------
  // 0. CONVERSATIONAL & HELP QUERIES
  // -------------------------------------------------------------------------
  if (
    q === "hi" ||
    q === "hello" ||
    q === "hey" ||
    q.includes("who are you") ||
    q.includes("what is logicai") ||
    q.includes("what can you do")
  ) {
    return {
      message:
        "### Welcome to LogicAI! 🎓\n\nI am your interactive AI tutor for **Discrete Mathematics & Theory of Computation**. I can help you with:\n\n1. **Set Theory**: Set algebra, Venn diagrams, Inclusion-Exclusion (PIE), and Cantor's Diagonalization.\n2. **Propositional Logic**: Truth tables, tautology/contradiction proofs, inference rules (Modus Ponens), and mathematical induction.\n3. **Relations & Functions**: Adjacency matrices, equivalence classes, Hasse diagrams (Posets), Warshall's algorithm, and injectivity/surjectivity analysis.\n4. **Automata & Formal Languages**: DFA, NFA, $\\varepsilon$-closures, subset construction, DFA minimization (Hopcroft), Moore/Mealy machines, and Pumping Lemma.\n5. **Grammars & Parsing**: Context-Free Grammars, Chomsky Normal Form (CNF), and CYK parsing.\n6. **Computability**: Pushdown Automata (PDA) with stack memory and Turing Machines (TM) with Halting Problem undecidability.\n\nAsk me any concept, theorem, or proof, or type **\"Explain this step\"** to inspect your active canvas in real time!",
      keyTakeaways: ["Discrete Math Tutor", "Interactive Proofs", "Theory of Computation"],
    };
  }

  if (q.includes("how to use") || q.includes("getting started") || q.includes("help me start")) {
    return {
      message:
        "### How to Use LogicVerse 🚀\n\n- **Workspace Canvas**: Drag and drop mathematical objects (Sets, States, Logic Variables, Operators) from the floating palette.\n- **Connections**: Drag wires between output handles and input handles to compose formulas or transitions.\n- **Bottom Dock**: Switch tabs to view live Adjacency Matrices, Truth Tables, Hasse diagrams, CYK parse tables, and step-by-step simulators.\n- **Presets**: Load classic problems (like Divisibility Posets, Modus Ponens, or DFA ending in 01) directly from the toolbar.\n\nWhat concept or module would you like to explore today?",
      keyTakeaways: ["Visual Canvas", "Live Evaluators", "Interactive Presets"],
    };
  }

  // -------------------------------------------------------------------------
  // 0.1 LIVE WORKSPACE STATE & CANVAS INSPECTION QUERIES
  // -------------------------------------------------------------------------
  if (
    q.includes("what is going on") ||
    q.includes("my canvas") ||
    q.includes("my workspace") ||
    q.includes("current state") ||
    q.includes("on screen") ||
    q.includes("what am i doing") ||
    q.includes("explain this step") ||
    q.includes("explain my") ||
    q.includes("see my workspace") ||
    q.includes("see my canvas")
  ) {
    if (moduleId === "automata" && automataSim) {
      return generateAutomataExplanation(automataSim, activeAutomataStepIndex);
    }
    if (moduleId === "logic" && logicEval) {
      return generateLogicExplanation(logicEval);
    }
    return generateExplanation(evalResult);
  }

  // -------------------------------------------------------------------------
  // 1. SPECIFIC RELATIONS & FUNCTIONS QUERIES
  // -------------------------------------------------------------------------

  // Warshall's Algorithm / Transitive Closure
  if (q.includes("warshall") || q.includes("transitive closure")) {
    return {
      message:
        "### Relations & Functions: Warshall's Algorithm (Transitive Closure)\n\nWarshall's algorithm computes the **transitive closure** $R^+$ of a binary relation (or directed reachability in a graph) in **$O(n^3)$ time** using dynamic programming:\n\n- **Matrix Sequence**: Computes $W^{(0)}, W^{(1)}, \\dots, W^{(n)}$ where $W^{(0)}$ is the initial 0/1 adjacency matrix.\n- **Dynamic Recurrence**: At step $k$ with pivot vertex $v_k$:\n  $$W^{(k)}[i, j] = W^{(k-1)}[i, j] \\lor \\left(W^{(k-1)}[i, k] \\land W^{(k-1)}[k, j]\\right)$$\n- **Intuition**: A path exists from $i$ to $j$ using intermediate vertices in $\\{v_1, \\dots, v_k\\}$ if there was already a path, OR if there is a path from $i$ to $v_k$ AND from $v_k$ to $j$.\n\nOpen the **Warshall Algorithm** tab in the dock to watch the step-by-step matrix transitions and active pivot highlights live!",
      keyTakeaways: ["O(n³) Dynamic Programming", "Recurrence Relation", "Transitive Closure R⁺"],
      suggestedAction: {
        label: "View Warshall Simulator Tab",
        actionType: "load-template",
        templateId: "divisibility-poset",
      },
    };
  }

  // Function Mapper tool
  if (q.includes("function mapper")) {
    return {
      message:
        "### Function Mapper Visualizer\n\nThe **Function Mapper** visualizes mappings from **Domain** $A$ to **Codomain** $B$ with interactive directional arrows:\n\n- Set custom Domain elements $A$ and Codomain elements $B$.\n- Connect elements using interactive point-and-click arrows.\n- Evaluates live whether the function is **Injective (one-to-one)**, **Surjective (onto)**, or **Bijective (invertible)**.\n- Alerts when the **Pigeonhole Principle** prevents injectivity ($|A| > |B|$).",
      keyTakeaways: ["Function Mapper", "Domain to Codomain", "Interactive Arrow Mappings"],
    };
  }

  // Hasse Diagrams, Posets & Lattices
  if (
    q.includes("hasse") ||
    q.includes("poset") ||
    q.includes("partial order") ||
    q.includes("lattice") ||
    q.includes("extremal") ||
    q.includes("greatest") ||
    q.includes("least")
  ) {
    return {
      message:
        "### Relations & Functions: Hasse Diagrams for Posets\n\nA **Partial Order and Poset** $(A, \\le)$ is a relation that is **Reflexive**, **Anti-symmetric**, and **Transitive**.\n\n#### 3 Reduction Rules to Draw a Hasse Diagram:\n1. **Omit Reflexive Loops**: Eliminate all $(a, a)$ self-loops since reflexivity is mathematically assumed.\n2. **Omit Transitive Edges**: Eliminate transitive shortcuts: if $a < b$ and $b < c$, the edge $(a, c)$ is deleted.\n3. **Upward Directional Flow**: Place smaller elements lower and larger elements higher. An upward edge is drawn from $a$ to $b$ if and only if **$b$ covers $a$** ($a \\lessdot b$).\n\n#### Extremal Elements in a Poset:\n- **Maximal**: No element is strictly greater ($x \\not< y$ for any $y$).\n- **Minimal**: No element is strictly smaller ($y \\not< x$ for any $y$).\n- **Greatest Element (Top $\\top$)**: An element $g$ such that $\\forall a, a \\le g$ (unique if it exists).\n- **Least Element (Bottom $\\bot$)**: An element $l$ such that $\\forall a, l \\le a$ (unique if it exists).\n- **Lattice**: A poset where every pair $\\{a, b\\}$ has a unique Least Upper Bound (LUB / join $\\lor$) and Greatest Lower Bound (GLB / meet $\\land$).",
      keyTakeaways: ["Partial Order and Poset", "Reflexive & Transitive Reduction", "Covering Relation a ⋖ b", "Greatest Top and Least Bottom"],
      suggestedAction: {
        label: "Open Hasse Diagram Tab",
        actionType: "load-template",
        templateId: "divisibility-poset",
      },
    };
  }

  // Injective / Surjective / Bijective Functions & Composition
  if (
    q.includes("injective") ||
    q.includes("injection") ||
    q.includes("one-to-one") ||
    q.includes("one to one") ||
    q.includes("surjective") ||
    q.includes("surjection") ||
    q.includes("onto") ||
    q.includes("bijective") ||
    q.includes("bijection") ||
    q.includes("invertible") ||
    q.includes("inverse function") ||
    q.includes("composition")
  ) {
    if (q.includes("composition")) {
      return {
        message:
          "### Relations & Functions: Function Composition (g ∘ f)\n\nGiven functions $f: A \\to B$ and $g: B \\to C$, the **Composition** $(g \\circ f): A \\to C$ is defined by:\n$$(g \\circ f)(x) = g(f(x))$$\n\n- **Associativity**: Function composition is always associative: $h \\circ (g \\circ f) = (h \\circ g) \\circ f$.\n- **Preservation Properties**:\n  - If both $f$ and $g$ are **Injective**, then $(g \\circ f)$ is Injective.\n  - If both $f$ and $g$ are **Surjective**, then $(g \\circ f)$ is Surjective.\n  - If both $f$ and $g$ are **Bijective**, then $(g \\circ f)$ is Bijective, and $(g \\circ f)^{-1} = f^{-1} \\circ g^{-1}$.",
        keyTakeaways: ["(g ∘ f)(x) = g(f(x))", "Associative", "Preserves Injective & Surjective"],
      };
    }
    return {
      message:
        "### Relations & Functions: Injective vs Surjective vs Bijective\n\nFor a function $f: A \\to B$:\n\n1. **Injective (One-to-One)**:\n   - **Definition**: Distinct inputs produce distinct outputs: $f(a) = f(b) \\implies a = b$, or equivalently $a \\ne b \\implies f(a) \\ne f(b)$.\n   - **Collision Test**: No two domain arrows point to the same codomain target.\n   - **Cardinality Constraint**: Requires $|A| \\le |B|$. By the **Pigeonhole** Principle, if $|A| > |B|$, collisions are inevitable and $f$ cannot be injective!\n\n2. **Surjective (Onto)**:\n   - **Definition**: Every element in the codomain is mapped: $\\forall y \\in B, \\exists x \\in A: f(x) = y$.\n   - **Range Test**: $\\text{Range}(f) = B$ (full codomain coverage).\n   - **Cardinality Constraint**: Requires $|A| \\ge |B|$.\n\n3. **Bijective (One-to-One & Onto)**:\n   - **Definition**: Both **Injective** and **Surjective** simultaneously.\n   - **Invertibility & Inverse Function**: A function $f$ is invertible and has a unique **inverse function** ($f^{-1}$ or $f⁻¹$) if and only if $f$ is **Bijective**!\n   - **Cardinality Constraint**: For finite sets, a bijection requires $|A| = |B|$ ($|a| = |b|$).\n\nOpen the **Function Mapper** tab in the dock to experiment with custom domain and codomain mappings live!",
      keyTakeaways: ["Injective: No Collisions (Pigeonhole Constraint)", "Surjective: Full Codomain Coverage", "Bijective: Invertible with Inverse Function f⁻¹ (|A| = |B|)"],
    };
  }

  // Equivalence Relations & Partitions
  if (
    q.includes("equivalence relation") ||
    q.includes("equivalence class") ||
    q.includes("partition") ||
    q.includes("quotient set")
  ) {
    return {
      message:
        "### Relations & Functions: Equivalence Relations & Partitions\n\nA relation $R$ on set $A$ is an **Equivalence Relation** if and only if it satisfies three axioms:\n\n1. **Reflexive**: $\\forall a \\in A, (a, a) \\in R$.\n2. **Symmetric**: $(a, b) \\in R \\implies (b, a) \\in R$.\n3. **Transitive**: $(a, b) \\in R \\land (b, c) \\in R \\implies (a, c) \\in R$.\n\n#### Fundamental Theorem of Equivalence Relations:\n- Every equivalence relation partitions $A$ into pairwise **disjoint equivalence classes**:\n  $$[a] = \\{x \\in A \\mid (a, x) \\in R\\}$$\n- The union of all classes equals $A$, and any two classes are either identical ($[a] = [b]$) or completely disjoint ($[a] \\cap [b] = \\emptyset$).\n- The collection of all equivalence classes is called the **quotient set** $A / R$.",
      keyTakeaways: ["Reflexive + Symmetric + Transitive", "Disjoint Equivalence Classes", "Quotient Set A / R"],
    };
  }

  // Relation Properties (Reflexivity, Symmetry, Transitivity, Antisymmetry, Asymmetry, Irreflexivity)
  if (
    q.includes("reflexive") ||
    (q.includes("symmetric") && !q.includes("symmetric difference")) ||
    q.includes("antisymmetric") ||
    q.includes("irreflexive") ||
    q.includes("transitive") ||
    q.includes("asymmetric")
  ) {
    return {
      message:
        "### Relations & Functions: Binary Relation Properties\n\nLet $R \\subseteq A \\times A$ be a binary relation:\n\n- **Reflexive**: $\\forall a \\in A, (a, a) \\in R$ (Main diagonal of adjacency matrix contains all 1s).\n- **Irreflexive**: $\\forall a \\in A, (a, a) \\notin R$ (Main diagonal is all 0s).\n- **Symmetric**: $(a, b) \\in R \\implies (b, a) \\in R$ (Matrix is symmetric across main diagonal: $M = M^T$).\n- **Anti-symmetric**: $(a, b) \\in R \\land (b, a) \\in R \\implies a = b$ (No two-way cycles between distinct elements).\n- **Asymmetric**: Irreflexive and Anti-symmetric ($(a, b) \\in R \\implies (b, a) \\notin R$).\n- **Transitive**: $(a, b) \\in R \\land (b, c) \\in R \\implies (a, c) \\in R$ (If $M^2[i, j] > 0$, then $M[i, j] = 1$).",
      keyTakeaways: ["Diagonal Matrix Tests", "Symmetry M = Mᵀ", "Transitivity Closure"],
    };
  }

  // Domain, Codomain, Range & Pigeonhole Principle
  if (q.includes("codomain") || q.includes("domain") || q.includes("pigeonhole") || q.includes("range")) {
    return {
      message:
        "### Relations & Functions: Domain, Codomain & Pigeonhole Principle\n\n- **Domain ($A$)**: The set of all inputs for which $f(x)$ is defined.\n- **Codomain ($B$)**: The target set containing all allowed potential outputs.\n- **Range / Image ($f(A)$)**: The actual subset of $B$ achieved by inputs: $\\{f(x) \\mid x \\in A\\} \\subseteq B$.\n\n#### The Pigeonhole Principle (Dirichlet's Box Principle):\nIf $n$ items are put into $m$ containers, and $n > m$, then at least one container must contain more than one item.\n- **Consequence for Functions**: If $|\\text{Domain}| > |\\text{Codomain}|$, any function $f: A \\to B$ **cannot be injective**! Collisions are guaranteed.",
      keyTakeaways: ["Domain vs Codomain", "Range ⊆ Codomain", "Pigeonhole: Collisions if |A| > |B|"],
    };
  }

  // General Relations & Cartesian Product connections
  if (
    ((q.includes("relation") || q.includes("relations")) &&
      !q.includes("in relation to") &&
      !q.includes("equivalence relation") &&
      !q.includes("quotient set")) ||
    (moduleId === "relations-functions" &&
      !q.includes("explain") &&
      !q.includes("hint") &&
      !q.includes("step") &&
      !q.includes("cartesian"))
  ) {
    return {
      message:
        "### Relations & Functions: Core Concepts & Cartesian Product\n\n- **Binary Relation Definition**: Every binary relation $R$ from set $A$ to set $B$ is formally defined as a subset of the **Cartesian Product**: $R \\subseteq A \\times B$.\n- **Matrix Representation**: An $n \\times n$ boolean matrix where $M[i, j] = 1 \\iff (a_i, a_j) \\in R$.\n- **Equivalence Relation**: Reflexive + Symmetric + Transitive (partitions $A$ into quotient classes).\n- **Partial Order (Poset)**: Reflexive + Anti-symmetric + Transitive (represented visually via Hasse diagrams).\n- **Functions $f: A \\to B$**: Special binary relations where each input $a \\in A$ maps to exactly one output $b \\in B$.\n\nUse the tabs below to explore the **Adjacency Matrix**, **Hasse Diagram**, **Warshall Transitive Closures**, and **Function Mapper**!",
      keyTakeaways: ["Binary Relation Subset of Cartesian Product A × B", "Matrix Representation", "Posets & Equivalence"],
    };
  }

  // -------------------------------------------------------------------------
  // 2. PDA & TURING MACHINE QUERIES
  // -------------------------------------------------------------------------
  if (
    q.includes("pda") ||
    q.includes("pushdown") ||
    q.includes("turing") ||
    q.includes("tape") ||
    q.includes("halting") ||
    q.includes("stack") ||
    q.includes("church-turing")
  ) {
    if (q.includes("turing") || q.includes("tape") || q.includes("halting") || q.includes("church")) {
      return {
        message:
          "### Turing Machine (TM) & Infinite Tape Memory\n\n- **7-Tuple Definition**: $M = (Q, \\Sigma, \\Gamma, \\delta, q_0, B, F)$\n  - $Q$: Finite state set, $\\Sigma$: Input alphabet, $\\Gamma$: Tape alphabet ($\\Sigma \\subset \\Gamma$, $B \\in \\Gamma$ is blank).\n  - $\\delta$: Transition function: $Q \\times \\Gamma \\rightarrow Q \\times \\Gamma \\times \\{L, R, S\\}$.\n- **Infinite 2-Way Tape**: Head moves Left ($L$) or Right ($R$) while scanning and rewriting symbols on an infinite 2-way tape.\n- **Halting Problem ($A_{TM}$)**: Alan Turing proved in 1936 that determining whether an arbitrary TM halts on input $w$ is **undecidable** using Cantor's diagonalization technique.\n- **Church-Turing Thesis**: Any effective algorithmic computation can be carried out by a Turing Machine.",
        keyTakeaways: ["Turing Machine 7-Tuple", "Infinite 2-Way Tape", "Undecidable Halting Problem", "Church-Turing Thesis"],
      };
    }
    return {
      message:
        "### Pushdown Automata (PDA) & Stack Memory\n\n- **7-Tuple Definition**: $M = (Q, \\Sigma, \\Gamma, \\delta, q_0, Z_0, F)$\n- **Stack Memory**: Operates with Last-In First-Out (**LIFO**) storage, popping the top symbol and pushing a string of symbols: $\\delta(q, a, X) \\rightarrow \\{(p, \\gamma)\\}$.\n- **Two Acceptance Criteria**:\n  1. **Acceptance by Final State ($F$)**: Reaches an accepting final state $q_f \\in F$ after consuming the full input string.\n  2. **Acceptance by Empty Stack (NULL)**: Pops all stack symbols until the stack is completely empty $\\emptyset$.\n- **Power**: Recognizes **Context-Free Languages (CFLs)** (e.g. $L = \\{a^n b^n \\mid n \\ge 0\\}$). Note: Deterministic PDAs (DPDAs) are strictly less powerful than Non-deterministic PDAs (NPDAs)!",
      keyTakeaways: ["LIFO Stack Memory", "Final State and Empty Stack Acceptance", "Accepts CFLs (e.g. aⁿbⁿ)"],
    };
  }

  // -------------------------------------------------------------------------
  // 3. CFG & CYK PARSING QUERIES
  // -------------------------------------------------------------------------
  if (
    (q.includes("cfg") ||
      q.includes("grammar") ||
      q.includes("parse") ||
      (q.includes("cnf") && !q.includes("conjunctive")) ||
      q.includes("cyk") ||
      q.includes("chomsky") ||
      q.includes("ambiguous")) &&
    !q.includes("conjunctive")
  ) {
    if (q.includes("cyk")) {
      return {
        message:
          "### CYK Parsing Algorithm (Cocke–Younger–Kasami)\n\nA dynamic programming algorithm testing membership $w \\in L(G)$ in **$O(n^3 \\cdot |G|)$ time** (or $O(n^3)$) for grammars in Chomsky Normal Form (CNF):\n\n- **Table Construction**: Builds a triangular table $V_{i,j}$ where entry $V_{i,j}$ contains non-terminals deriving substring $w[i \\dots i+j-1]$ of length $j$.\n- **Base Case ($j=1$)**: $V_{i,1} = \\{A \\mid A \\to w[i] \\in R\\}$.\n- **Inductive Step**: $V_{i,j} = \\bigcup_{k=1}^{j-1} \\{A \\mid A \\to BC \\in R, B \\in V_{i,k}, C \\in V_{i+k, j-k}\\}$.\n- **Acceptance**: String $w$ is accepted if start symbol $S \\in V_{1,n}$.",
        keyTakeaways: ["O(n³) Dynamic Programming", "Triangular Table V_{i,j}", "Requires CNF Grammar"],
      };
    }
    if (q.includes("cnf") || q.includes("chomsky normal form") || q.includes("chomsky")) {
      return {
        message:
          "### Chomsky Normal Form (CNF)\n\nA Context-Free Grammar is in **Chomsky Normal Form (CNF)** if every production rule has one of the forms:\n\n1. **$A \\to BC$ ($A \\rightarrow BC$ or A -> BC)**: Exactly two non-terminals on RHS.\n2. **$A \\to a$ ($A \\rightarrow a$ or A -> a)**: Exactly one terminal symbol on RHS.\n3. **$S \\to \\varepsilon$**: Permitted only if $S$ does not appear on any RHS.\n\n#### The 4 Step CNF Reduction Pipeline:\n1. **START**: Introduce new start symbol $S_0 \\to S$.\n2. **NULL ($\\varepsilon$)**: Eliminate all $\\varepsilon$-rules $A \\to \\varepsilon$ by substitution.\n3. **UNIT**: Eliminate unit rules $A \\to B$.\n4. **TERM & BINARY**: Replace mixed terminals with dummy non-terminals and cascade long RHS rules into binary pairs.",
        keyTakeaways: ["CNF Rules A -> BC or A -> a", "4-Step Reduction Pipeline (START, NULL, UNIT, BINARY)", "CYK Prerequisite"],
      };
    }
    return {
      message:
        "### Context-Free Grammar (CFG) & Parse Trees\n\n- **4-Tuple Definition**: A CFG is defined as $G = (V, \\Sigma, R, S)$ (or $V, Sigma, R, S$) where $V$ is non-terminals, $\\Sigma$ is terminals, $R$ is production rules, and $S$ is start symbol.\n- **Derivations**: Leftmost or rightmost sequential substitutions of non-terminals until only terminal characters remain.\n- **Parse Tree**: Hierarchical syntax tree representing the grammatical derivation.\n- **Ambiguity**: If a string $w$ has two or more distinct parse trees (or distinct leftmost derivations), the grammar is **ambiguous**!",
      keyTakeaways: ["4-Tuple (V, Sigma, R, S)", "Derivations & Parse Tree", "Grammar Ambiguity"],
    };
  }

  // -------------------------------------------------------------------------
  // 4. REGULAR EXPRESSIONS & PUMPING LEMMA QUERIES
  // -------------------------------------------------------------------------
  if (
    q.includes("pumping lemma") ||
    q.includes("non-regular") ||
    q.includes("pumping") ||
    q.includes("myhill") ||
    q.includes("thompson") ||
    q.includes("regex") ||
    q.includes("regular expression") ||
    q.includes("arden") ||
    q.includes("kleene")
  ) {
    if (q.includes("pumping")) {
      return {
        message:
          "### Pumping Lemma for Regular Languages\n\nIf $L$ is regular, there exists an integer pumping length $p \\ge 1$ such that any string $w \\in L$ with $|w| \\ge p$ can be divided into $w = xyz$ satisfying:\n\n1. $|xy| \\le p$\n2. $|y| > 0$\n3. $xy^i z \\in L$ for **all** $i \\ge 0$\n\n#### Adversarial Proof Technique (Contradiction):\nTo prove $L = \\{a^n b^n \\mid n \\ge 0\\}$ is non-regular:\n- Assume $L$ is regular with pumping length $p$.\n- Choose test string $w = a^p b^p \\in L$ ($|w| = 2p \\ge p$).\n- Since $|xy| \\le p$, $y$ consists strictly of $a$'s ($y = a^k, k > 0$).\n- Pump $i=2$: $x y^2 z = a^{p+k} b^p \\notin L$, contradicting the lemma! Hence $L$ is non-regular.",
        keyTakeaways: ["Proof by Contradiction", "String Division w = xyz", "Pumping Length p", "Proves Non-Regular Languages"],
      };
    }
    if (q.includes("thompson")) {
      return {
        message:
          "### Thompson's Construction Algorithm\n\nAn inductive algorithm that converts any regular expression directly into an equivalent $\\varepsilon$-NFA (epsilon-NFA) with a unique start state and unique accept state:\n\n- **Base Cases**: $\\varepsilon$ transition, single symbol $a$, empty set $\\emptyset$.\n- **Union ($R_1 | R_2$)**: Introduces a new start state branching via $\\varepsilon$ to $R_1$ and $R_2$, merging to a single accept state.\n- **Concatenation ($R_1 R_2$)**: Connects accept state of $R_1$ to start state of $R_2$ via $\\varepsilon$.\n- **Kleene Star ($R^*$)**: Adds $\\varepsilon$ loopback from accept to start, plus an $\\varepsilon$ bypass.",
        keyTakeaways: ["Regex to ε-NFA", "O(|r|) States and Transitions", "Structural Induction"],
      };
    }
    if (q.includes("arden")) {
      return {
        message:
          "### Arden's Theorem for Regular Languages\n\nArden's Theorem provides a method to solve regular expression equations:\n\n- **Statement**: Let $P$ and $Q$ be regular expressions. If $\\varepsilon \\notin P$, then the equation:\n  $$R = Q + RP$$\n  has the unique solution:\n  $$R = QP^* \\quad (R = QP*)$$\n- **Application**: Used to systematically convert a Finite Automaton state graph into an equivalent regular expression by setting up linear equations for each state.",
        keyTakeaways: ["Arden's Theorem: R = QP*", "Unique Solution if ε ∉ P", "Automata to Regex Conversion"],
      };
    }
    if (q.includes("myhill") || q.includes("nerode")) {
      return {
        message:
          "### Myhill–Nerode Theorem\n\nDefines the indistinguishability equivalence relation $x \\equiv_L y$ on strings: $x \\equiv_L y \\iff \\forall z, xz \\in L \\iff yz \\in L$.\n\n- **Theorem**: A language $L$ is regular **if and only if** the relation $\\equiv_L$ has a **finite number of equivalence classes** (finite index).\n- **Minimality**: The number of equivalence classes of $\\equiv_L$ equals the exact number of states in the **minimal DFA** for $L$!",
        keyTakeaways: ["Indistinguishability Relation", "Finite Index Condition", "Exact Minimal DFA States"],
      };
    }
    if (q.includes("kleene")) {
      return {
        message:
          "### Kleene Star Operation & Regular Expressions\n\n- **Kleene Star ($A^*$)**: The set of all strings formed by concatenating zero or more strings from $A$, including the empty string $\\varepsilon$: $A^* = \\bigcup_{i=0}^\\infty A^i$.\n- **Positive Closure ($A^+$)**: Concatenating one or more strings: $A^+ = A A^*$.\n- **Regular Expression Operations**: Union ($+$ or $|$), Concatenation ($\\cdot$), and Kleene Star ($*$).",
        keyTakeaways: ["Kleene Star A*", "Zero or More Concatenations", "Regular Expression Operators"],
      };
    }
    return {
      message:
        "### Regular Expressions & Formal Languages\n\nRegular expressions define languages recognized by Finite Automata:\n\n- **Operations**: Union ($+$ or $|$), Concatenation ($\\cdot$), Kleene Star ($*$).\n- **Arden's Theorem**: If $P$ and $Q$ are regular expressions with $\\varepsilon \\notin P$, then $R = Q + RP$ has the unique solution $R = QP^*$.\n- **Expressive Equivalence**: By Kleene's Theorem, **Regular Expressions are equivalent in expressive power to DFAs and NFAs** (both characterize regular languages).",
      keyTakeaways: ["Kleene's Theorem", "Arden's Theorem R = QP*", "Equivalent to DFA and NFA"],
    };
  }

  // -------------------------------------------------------------------------
  // 5. FINITE AUTOMATA (DFA, NFA, MINIMIZATION)
  // -------------------------------------------------------------------------
  if (
    q.includes("dfa") ||
    q.includes("nfa") ||
    q.includes("automata") ||
    q.includes("automaton") ||
    q.includes("minimization") ||
    q.includes("hopcroft") ||
    q.includes("moore") ||
    q.includes("mealy") ||
    q.includes("subset construction") ||
    q.includes("trap") ||
    q.includes("dead state") ||
    q.includes("accept")
  ) {
    if (q.includes("epsilon") || q.includes("ε")) {
      return {
        message:
          "### Epsilon-NFA (ε-NFA) & ε-Transitions\n\nAn **$\\\\varepsilon$-NFA** is a Non-deterministic Finite Automaton allowing spontaneous transitions without consuming an input character:\n\n- **Transition Function**: $\\delta: Q \\times (\\Sigma \\cup \\{\\varepsilon\\}) \\to \\mathcal{P}(Q)$.\n- **$\\\\varepsilon$-Closure**: $\\text{ECLOSE}(q)$ is the set of all states reachable from $q$ taking zero or more $\\varepsilon$-transitions.\n- **Equivalence**: Any $\\varepsilon$-NFA can be transformed into an equivalent standard NFA and DFA without $\\varepsilon$-transitions.",
        keyTakeaways: ["NFA with ε-Transitions", "Epsilon Closure", "Equivalent to Standard NFA & DFA"],
      };
    }
    if (q.includes("5-tuple") || (q.includes("definition") && q.includes("dfa"))) {
      return {
        message:
          "### 5-Tuple Formal Definition of a DFA\n\nA Deterministic Finite Automaton (DFA) is formally defined as a **5-tuple**:\n$$M = (Q, \\Sigma, \\delta, q_0, F)$$\n\n1. **$Q$**: Finite set of states.\n2. **$\\Sigma$ (Sigma)**: Finite input alphabet.\n3. **$\\delta$ (Delta)**: Deterministic transition function $\\delta: Q \\times \\Sigma \\to Q$.\n4. **$q_0$ (or $q₀$)**: Start state ($q_0 \\in Q$).\n5. **$F$**: Set of final accepting states ($F \\subseteq Q$).",
        keyTakeaways: ["5-Tuple (Q, Sigma, Delta, q₀, F)", "Deterministic Transition", "Final State Acceptance"],
      };
    }
    if (q.includes("dfa") && q.includes("nfa")) {
      return {
        message:
          "### DFA vs NFA Comparison\n\n- **DFA (Deterministic Finite Automaton)**: Transition function $\\delta: Q \\times \\Sigma \\rightarrow Q$. For every state and symbol, there is **exactly one** deterministic next state. No $\\varepsilon$-transitions.\n- **NFA (Non-deterministic Finite Automaton)**: Transition function $\\delta: Q \\times \\Sigma_\\varepsilon \\rightarrow \\mathcal{P}(Q)$. Can branch into **multiple states** simultaneously or make spontaneous $\\varepsilon$-transitions without reading input.\n- **Equivalence**: NFAs and DFAs have the **same expressive power** and recognize the exact same class of regular languages! Any NFA with $n$ states can be converted to an equivalent DFA with up to $2^n$ states via **Subset Construction (Powerset Algorithm)**.",
        keyTakeaways: ["DFA: 1 Path vs NFA: Multiple Paths", "Same Expressive Power", "Subset Construction (2ⁿ)"],
      };
    }
    if (q.includes("minimization") || q.includes("hopcroft") || q.includes("minimize")) {
      return {
        message:
          "### DFA Minimization (Hopcroft's Algorithm)\n\nFinds the unique minimal DFA accepting the same regular language in **$O(|\\Sigma| n \\log n)$ time** (or $O(|Sigma| n \\log n)$):\n\n1. **Partition 0**: Split states into accepting $F$ and non-accepting $Q \\setminus F$.\n2. **Partition Refinement**: For each input symbol $a$, split group $G$ if states in $G$ transition to different target groups under $a$.\n3. **Termination**: Stop when no partition can be further split. Merge indistinguishable states into single macro-states.\n4. **Uniqueness**: The resulting minimal DFA is mathematically unique up to state renaming!",
        keyTakeaways: ["Hopcroft O(|Sigma| n log n)", "Partition Refinement", "Unique Minimal DFA"],
      };
    }
    if (q.includes("moore") || q.includes("mealy")) {
      return {
        message:
          "### Moore vs Mealy Machine Transducers\n\nFinite state machine transducers with outputs:\n\n- **Moore Machine**: Output depends **strictly on the current state**: $\\lambda: Q \\rightarrow \\Delta$. Output changes only when state changes. (Length of output is $|w| + 1$).\n- **Mealy Machine**: Output depends on **both current state and current input symbol**: $\\lambda: Q \\times \\Sigma \\rightarrow \\Delta$. Output is emitted along the transition edge. (Length of output is $|w|$).\n- Both machines are functionally equivalent and can be converted into each other.",
        keyTakeaways: ["Moore: Output on State", "Mealy: Output on Transition", "Equivalent Transducer Machines"],
      };
    }
    if (q.includes("trap") || q.includes("dead")) {
      return {
        message:
          "### Trap State (Dead State) in a DFA\n\nA **Trap State** (or Dead State) is a non-accepting state with state transitions looping back to itself for all input symbols once an invalid prefix is recognized. Once entered, the machine can never reach a final state.",
        keyTakeaways: ["Trap State", "Non-accepting Self-Loop", "State Transitions"],
      };
    }
    if (q.includes("accept") || q.includes("reject")) {
      return {
        message:
          "### Finite Automaton String Acceptance\n\nA finite automaton **Accepts** an input string $w$ if after processing every character, the active state is in the set of **Final States ($F$)**. If the computation path halts in a non-accepting state, the input string is **Rejected**.",
        keyTakeaways: ["Accepted if Active State ∈ Final State F", "Rejected Otherwise", "Full String Consumed"],
      };
    }
    if (q.includes("class of languages") || q.includes("recognize") || q.includes("regular language")) {
      return {
        message:
          "### Language Class Recognized by DFAs\n\nDeterministic Finite Automata (**DFA**) recognize the exact class of **Regular languages** (Chomsky Type-3). By Kleene's Theorem, regular languages are precisely those that can be recognized by a DFA, recognized by an NFA, or generated by a regular expression.",
        keyTakeaways: ["DFAs Recognize Regular Languages", "Chomsky Type-3 Hierarchy", "Kleene's Theorem"],
      };
    }
    if (automataSim && (q.includes("step") || q.includes("simulation") || q.includes("trace") || q.includes("run") || q.includes("canvas") || q.includes("current"))) {
      return generateAutomataExplanation(automataSim, activeAutomataStepIndex);
    }
    return {
      message:
        "### Finite Automata (FA) Overview\n\n- **5-Tuple**: $M = (Q, \\Sigma, \\delta, q_0, F)$ (Q, Sigma, Delta, q₀, F).\n- **Regular Languages**: DFAs recognize the exact class of **Regular** languages.\n- States transition upon reading characters of input string $w \\in \\Sigma^*$.\n- If the final state is in $F$, the string is **Accepted**; otherwise, it is **Rejected**.\n\nUse the **Automata Palette** to draw states and transitions, and test strings in the live simulator!",
      keyTakeaways: ["5-Tuple (Q, Sigma, Delta, q₀, F)", "Regular Languages", "State Transitions"],
    };
  }

  // -------------------------------------------------------------------------
  // 6. PROPOSITIONAL LOGIC QUERIES
  // -------------------------------------------------------------------------
  if (
    q.includes("modus") ||
    q.includes("inference") ||
    q.includes("tautology") ||
    q.includes("contradiction") ||
    q.includes("truth table") ||
    q.includes("implication") ||
    q.includes("induction") ||
    q.includes("inductive") ||
    q.includes("well-ordering") ||
    q.includes("well ordering") ||
    q.includes("odd") ||
    q.includes("cubes") ||
    q.includes("nicomachus") ||
    q.includes("squares") ||
    q.includes("divisibility") ||
    q.includes("domino") ||
    q.includes("dnf") ||
    q.includes("cnf") ||
    q.includes("conjunctive") ||
    q.includes("resolution") ||
    q.includes("contingency") ||
    q.includes("equivalence") ||
    q.includes("syllogism")
  ) {
    if (q.includes("modus ponens")) {
      return {
        message:
          "### Modus Ponens (Law of Detachment)\n\nModus Ponens is the fundamental rule of inference:\n$$\\frac{P \\to Q, \\quad P}{\\therefore Q} \\qquad ((P \\to Q) \\land P) \\to Q$$\n\n- From premise $P \\to Q$ ($P \\rightarrow Q$ or P → Q) and premise $P$, we soundly deduce $Q$.\n- The statement $((P \\to Q) \\land P) \\to Q$ is an unconditional **Tautology**.",
        keyTakeaways: ["Modus Ponens: ((P → Q) ∧ P) → Q", "Tautology", "Sound Rule of Inference"],
      };
    }
    if (q.includes("modus tollens")) {
      return {
        message:
          "### Modus Tollens (Denying the Consequent)\n\n$$\\frac{P \\to Q, \\quad \\neg Q}{\\therefore \\neg P} \\qquad ((P \\to Q) \\land \\neg Q) \\to \\neg P$$\n\n- From conditional premise $P \\to Q$ ($P \\rightarrow Q$) and denial of consequent $\\neg Q$ ($¬Q$), we deduce $\\neg P$ ($¬P$).\n- The formula $((P \\to Q) \\land \\neg Q) \\to \\neg P$ is an unconditional **Tautology**.",
        keyTakeaways: ["Modus Tollens: ((P → Q) ∧ ¬Q) → ¬P", "Denying Consequent", "Tautology"],
      };
    }
    if (q.includes("hypothetical syllogism")) {
      return {
        message:
          "### Hypothetical Syllogism (Transitivity of Implication)\n\n$$\\frac{P \\to Q, \\quad Q \\to R}{\\therefore P \\to R} \\qquad ((P \\to Q) \\land (Q \\to R)) \\to (P \\to R)$$\n\n- Establishes that logical implication is transitive: from $P \\to Q$ and $Q \\to R$, we deduce $P \\to R$ ($P \\rightarrow R$ or P → R).\n- Represents a universal **Tautology**.",
        keyTakeaways: ["Hypothetical Syllogism: P → R", "Transitivity of Implication", "Tautology"],
      };
    }
    if (q.includes("disjunctive syllogism")) {
      return {
        message:
          "### Disjunctive Syllogism\n\n$$\\frac{P \\lor Q, \\quad \\neg P}{\\therefore Q} \\qquad ((P \\lor Q) \\land \\neg P) \\to Q$$\n\n- Given disjunction $P \\lor Q$ ($P \\lor Q$ or P ∨ Q) and negation $\\neg P$, we deduce $Q$.\n- An unconditional **Tautology**.",
        keyTakeaways: ["Disjunctive Syllogism: (P ∨ Q) ∧ ¬P → Q", "Rule of Inference", "Tautology"],
      };
    }
    if (q.includes("resolution")) {
      return {
        message:
          "### Resolution Rule in Automated Theorem Proving\n\nThe **Resolution** principle is a sound rule of inference:\n$$\\frac{P \\lor Q, \\quad \\neg P \\lor R}{\\therefore Q \\lor R}$$\n\n- Used in SAT solvers and automated reasoning.\n- Pairs complimentary literals $P$ and $\\neg P$ to produce the resolvent $(Q \\lor R)$.",
        keyTakeaways: ["Resolution Inference Rule", "Resolvent Clause Q ∨ R", "SAT Theorem Proving"],
      };
    }
    if (
      q.includes("rules of inference") ||
      (q.includes("inference") && !q.includes("modus") && !q.includes("resolution") && !q.includes("syllogism"))
    ) {
      return {
        message:
          "### Rules of Inference in Propositional Logic\n\n**Rules of inference** are valid deductive argument patterns used to establish true conclusions from premises. Each sound rule of inference corresponds to an unconditional **tautology** (such tautologies include Modus Ponens $[(P \\to Q) \\land P] \\to Q$, Modus Tollens, and Hypothetical Syllogism) that is always true in every row of a truth table.",
        keyTakeaways: ["Rules of Inference", "Sound Deductions", "Based on Tautologies"],
      };
    }
    if (q.includes("contingency")) {
      return {
        message:
          "### Contingency in Propositional Logic\n\nA **Contingency** is a compound proposition whose truth table is neither all True nor all False. Its truth value depends on the truth values of its constituent variables (true under some interpretations, false under others).",
        keyTakeaways: ["Contingency: Mixed Truth Table", "Neither Tautology nor Contradiction", "Satisfiable but not Valid"],
      };
    }
    if (q.includes("equivalence") || q.includes("equivalent")) {
      return {
        message:
          "### Logical Equivalence (P ≡ Q)\n\nTwo propositions $P$ and $Q$ are **logically equivalent** ($P \\equiv Q$) if and only if they evaluate to the exact same truth values in every row of their **Truth Table**, or equivalently, their biconditional $P \\leftrightarrow Q$ is a **Tautology**.",
        keyTakeaways: ["Logical Equivalence P ≡ Q", "Identical Truth Table Columns", "Biconditional Tautology"],
      };
    }
    if (q.includes("implication") || q.includes("p → q") || q.includes("p -> q")) {
      return {
        message:
          "### Material Implication (P → Q)\n\nThe conditional **Implication** $P \\to Q$ ($P \\rightarrow Q$ or P → Q) is false if and only if $P$ is True and $Q$ is False. It is logically equivalent to $\\neg P \\lor Q$. Inference rules like Modus Ponens $((P \\to Q) \\land P) \\to Q$ form a fundamental **tautology** (and generate tautologies across logic proofs).",
        keyTakeaways: ["Implication P → Q ≡ ¬P ∨ Q", "False only when T → F", "Forms a Tautology (Tautologies)"],
      };
    }
    if (q.includes("dnf")) {
      return {
        message:
          "### Disjunctive Normal Form (DNF)\n\nA boolean proposition is in **Disjunctive Normal Form (DNF)** if it is a disjunction (OR $\\lor$) of **minterms** (conjunctions AND $\\land$ of literals). There is exactly one minterm for each True row in the truth table.",
        keyTakeaways: ["DNF: Disjunction of Minterms", "OR of ANDs", "Canonical Form"],
      };
    }
    if (q.includes("cnf") || q.includes("conjunctive") || q.includes("maxterm")) {
      return {
        message:
          "### Conjunctive Normal Form (CNF)\n\nA boolean proposition is in **Conjunctive Normal Form (CNF)** if it is a conjunction (AND $\\land$) of **maxterms** (disjunctions OR $\\lor$ of literals). There is exactly one maxterm for each False row in the truth table.",
        keyTakeaways: ["CNF: Conjunction of Maxterms", "AND of ORs", "SAT Solver Format"],
      };
    }
    if (
      q.includes("induction") ||
      q.includes("inductive") ||
      q.includes("base step") ||
      q.includes("base case") ||
      q.includes("weak induction") ||
      q.includes("strong induction") ||
      q.includes("well-ordering") ||
      q.includes("well ordering") ||
      q.includes("odd") ||
      q.includes("cubes") ||
      q.includes("nicomachus") ||
      q.includes("squares") ||
      q.includes("divisibility") ||
      q.includes("domino")
    ) {
      if (q.includes("inductive hypothesis") || q.includes("p(k)")) {
        return {
          message:
            "### Inductive Hypothesis P(k)\n\nThe **Inductive Hypothesis** is the foundational assumption in a proof by mathematical induction where we assume the statement $P(k)$ is true for an arbitrary integer $k \\ge n_0$. This assumption serves as the algebraic bridge to prove $P(k+1)$.",
          keyTakeaways: ["Inductive Hypothesis P(k)", "Assumption for Step k", "Bridge to P(k+1)"],
        };
      }
      if (q.includes("inductive step") || q.includes("p(k+1)")) {
        return {
          message:
            "### Inductive Step P(k) ⇒ P(k+1)\n\nThe **Inductive Step** proves the conditional implication $P(k) \\implies P(k+1)$. Assuming the inductive hypothesis $P(k)$ is true, we algebraically deduce that $P(k+1)$ must also hold true, completing the domino induction chain.",
          keyTakeaways: ["Inductive Step P(k) ⇒ P(k+1)", "Deduces P(k+1) from P(k)", "Domino Chain Reaction"],
        };
      }
      if (q.includes("well-ordering") || q.includes("well ordering")) {
        return {
          message:
            "### The Well-Ordering Principle & Mathematical Induction\n\nThe **Well-Ordering Principle** states that every non-empty set of non-negative integers contains a least (smallest) element. This principle is mathematically equivalent to the Principle of Mathematical **Induction** and provides the axiomatic foundation for inductive proofs.",
          keyTakeaways: ["Well-Ordering Principle", "Equivalent to Mathematical Induction", "Least Element Axiom"],
        };
      }
      if (q.includes("squares")) {
        return {
          message:
            "### Sum of Squares by Mathematical Induction\n\nTheorem: $1^2 + 2^2 + \\dots + n^2 = \\frac{n(n+1)(2n+1)}{6}$ ($n(n+1)(2n+1)/6$).\n\n1. **Base Case $P(1)$**: $1^2 = 1$, RHS = $\\frac{1(2)(3)}{6} = 1$. Base step holds!\n2. **Inductive Hypothesis $P(k)$**: Assume $1^2 + \\dots + k^2 = \\frac{k(k+1)(2k+1)}{6}$.\n3. **Inductive Step $P(k+1)$**: Add $(k+1)^2$ to both sides:\n   $$\\frac{k(k+1)(2k+1)}{6} + (k+1)^2 = \\frac{(k+1)[k(2k+1) + 6(k+1)]}{6} = \\frac{(k+1)(k+2)(2k+3)}{6}$$\n   Inductive step holds. By Mathematical Induction, the theorem is proven for all $n \\ge 1$.",
          keyTakeaways: ["Sum of Squares n(n+1)(2n+1)/6", "Induction Base Case", "Inductive Step"],
        };
      }
      if (q.includes("cubes") || q.includes("nicomachus")) {
        return {
          message:
            "### Sum of Cubes by Mathematical Induction (Nicomachus' Identity)\n\nTheorem: $1^3 + 2^3 + \\dots + n^3 = \\left(\\frac{n(n+1)}{2}\\right)^2$ ($[n(n+1)/2]^2$).\n\n1. **Base Step**: At $n=1$, $1^3 = 1$, RHS = $[1(2)/2]^2 = 1$.\n2. **Inductive Hypothesis $P(k)$**: Assume $\\sum_{i=1}^k i^3 = [k(k+1)/2]^2$.\n3. **Inductive Step $P(k+1)$**: $[k(k+1)/2]^2 + (k+1)^3 = \\left[\\frac{(k+1)(k+2)}{2}\\right]^2$.\n   Proven for all $n \\ge 1$ by Mathematical **Induction**.",
          keyTakeaways: ["Sum of Cubes [n(n+1)/2]^2", "Nicomachus' Identity", "Mathematical Induction"],
        };
      }
      if (q.includes("odd")) {
        return {
          message:
            "### Sum of First n Odd Integers by Mathematical Induction\n\nTheorem: $1 + 3 + 5 + \\dots + (2n - 1) = n^2$ ($n²$ or n^2).\n\n1. **Base Case $P(1)$**: $2(1) - 1 = 1$, RHS = $1^2 = 1$.\n2. **Inductive Hypothesis $P(k)$**: Assume $1 + 3 + \\dots + (2k - 1) = k^2$.\n3. **Inductive Step $P(k+1)$**: $k^2 + (2(k+1) - 1) = k^2 + 2k + 1 = (k+1)^2$.\n   Hence by Mathematical **Induction**, the sum of first $n$ odd integers is always $n^2$ ($n²$).",
          keyTakeaways: ["Sum of Odds = n²", "Base Step P(1)", "Mathematical Induction Complete"],
        };
      }
      return {
        message:
          "### Mathematical Induction Proof Technique 📐\n\nMathematical Induction is a deductive proof technique to establish that a proposition $P(n)$ is true for all integers $n \\ge n_0$:\n\n1. **Base Case $P(n_0)$** (or $P(n₀)$): Verify that the proposition explicitly holds for the smallest element $n_0$. Like the first falling domino in a domino chain, without the base case the chain cannot start!\n2. **Inductive Hypothesis $P(k)$**: Assume $P(k)$ is true for an arbitrary integer $k \\ge n_0$.\n3. **Inductive Step $P(k) \\implies P(k+1)$**: Prove that under the assumption of $P(k)$, the next statement $P(k+1)$ logically follows: $\\sum_{i=n_0}^{k+1} a(i) = S(k) + a(k+1)$.\n4. **Weak Induction vs Strong Induction**:\n   - **Weak Induction**: Assumes only $P(k)$ to deduce $P(k+1)$.\n   - **Strong Induction**: Assumes $P(n_0) \\land P(n_0+1) \\land \\dots \\land P(k)$ to deduce $P(k+1)$.\n5. **The Well-Ordering Principle**: Every non-empty subset of non-negative integers has a least element; this provides the foundational axiomatic backing for Mathematical Induction.\n\n#### Classic Identities:\n- Sum of Integers: $\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$ ($n(n+1)/2$).\n- Sum of Squares: $\\sum_{i=1}^n i^2 = \\frac{n(n+1)(2n+1)}{6}$ ($n(n+1)(2n+1)/6$).\n- Divisibility: $3 \\mid (n^3 + 2n)$ for all $n \\ge 1$.\n- Inequalities: $2^n > n$ ($2^n > n$) for all $n \\ge 1$.\n\nOpen the **Induction Proofs** tab to explore interactive ladders or build custom theorems!",
        keyTakeaways: ["Base Case P(n₀) & Domino Chain", "Inductive Hypothesis P(k)", "Inductive Step P(k) ⇒ P(k+1)", "Weak Induction vs Strong Induction", "Well-Ordering Principle"],
        suggestedAction: {
          label: "Open Induction Prover Tab",
          actionType: "load-template",
          templateId: "modus-ponens",
        },
      };
    }
    if (q.includes("tautology") || q.includes("truth table") || q.includes("contradiction")) {
      return {
        message:
          "### Truth Tables & Proposition Classifications\n\nA **Truth Table** lists all $2^n$ ($2ⁿ$) interpretations for $n$ variables:\n\n- **Tautology (⊤)**: A compound proposition that evaluates to **True in every row** (e.g. $P \\lor \\neg P$). Represents a universal law of logic.\n- **Contradiction (⊥)**: Evaluates to **False in every row** (e.g. $P \\land \\neg P$). Unsatisfiable formula.\n- **Contingency**: True in some rows, false in others (e.g. $P \\to Q$).\n- **Canonical DNF**: Disjunction of Minterms (one minterm for each True row).\n- **Canonical CNF**: Conjunction of Maxterms (one maxterm for each False row).",
        keyTakeaways: ["2ⁿ Interpretations", "Tautology (⊤) vs Contradiction (⊥)", "Canonical DNF / CNF"],
      };
    }
  }

  // -------------------------------------------------------------------------
  // 7. SET THEORY QUERIES
  // -------------------------------------------------------------------------
  if (
    q.includes("union") ||
    q.includes("intersection") ||
    q.includes("power set") ||
    q.includes("powerset") ||
    q.includes("cardinality") ||
    q.includes("de morgan") ||
    q.includes("demorgan") ||
    q.includes("cantor") ||
    q.includes("diagonalization") ||
    q.includes("inclusion-exclusion") ||
    q.includes("pie") ||
    q.includes("cartesian") ||
    q.includes("complement") ||
    q.includes("subset") ||
    q.includes("disjoint") ||
    q.includes("difference") ||
    q.includes("symmetric difference") ||
    q.includes("empty")
  ) {
    if (q.includes("de morgan") || q.includes("demorgan")) {
      return {
        message:
          "### De Morgan's Laws (Duality)\n\nDe Morgan's laws state that the complement of a union is the intersection of complements, and vice versa:\n\n1. **Set Theory**:\n   $$(A \\cup B)^c = A^c \\cap B^c \\qquad (A \\cap B)^c = A^c \\cup B^c$$\n2. **Propositional Logic**:\n   $$\\neg (P \\lor Q) \\equiv \\neg P \\land \\neg Q \\quad (¬(P ∨ Q) ≡ ¬P ∧ ¬Q)$$\n   $$\\neg (P \\land Q) \\equiv \\neg P \\lor \\neg Q \\quad (¬(P ∧ Q) ≡ ¬P ∨ ¬Q)$$\n\nBoth reflect exact algebraic duality between sum and product under negation.",
        keyTakeaways: ["(A ∪ B)ᶜ = Aᶜ ∩ Bᶜ", "¬(P ∨ Q) ≡ ¬P ∧ ¬Q", "Sets & Logic Duality"],
      };
    }
    if (q.includes("disjoint")) {
      return {
        message:
          "### Mutually Disjoint Sets\n\nTwo sets $A$ and $B$ are **mutually disjoint** if and only if they share no common elements, meaning their intersection is the empty set:\n$$A \\cap B = \\emptyset \\quad (A ∩ B = ∅)$$\n\n- If $A$ and $B$ are disjoint, $|A \\cap B| = 0$.\n- By the Principle of Inclusion-Exclusion, for disjoint sets: $|A \\cup B| = |A| + |B|$.",
        keyTakeaways: ["Mutually Disjoint: A ∩ B = ∅", "|A ∩ B| = 0", "|A ∪ B| = |A| + |B|"],
      };
    }
    if (q.includes("symmetric difference") || q.includes("⊕")) {
      return {
        message:
          "### Symmetric Difference (A ⊕ B)\n\nThe **Symmetric Difference** $A \\oplus B$ (or $A \\Delta B$) collects elements that belong to **either** set $A$ or set $B$, but strictly not both:\n$$A \\oplus B = (A - B) \\cup (B - A) = (A \\cup B) - (A \\cap B)$$\n\n- Computes the **exclusive OR** between sets.\n- Commutative: $A \\oplus B = B \\oplus A$.\n- Nilpotent: $A \\oplus A = \\emptyset$.",
        keyTakeaways: ["Symmetric Difference A ⊕ B", "Exclusive OR", "In Either Set but Not Both"],
      };
    }
    if (q.includes("difference") || q.includes("relative complement")) {
      return {
        message:
          "### Set Difference (A - B) & Relative Complement\n\nThe **Set Difference** $A - B$ (or relative complement of $B$ in $A$) contains all elements that belong to $A$ but do **not** belong to $B$:\n$$A - B = \\{x \\mid x \\in A \\land x \\notin B\\}$$\n\n- Non-commutative: $A - B \\ne B - A$ in general.\n- If $A \\subseteq B$ (subset), then $A - B = \\emptyset$.",
        keyTakeaways: ["Set Difference A - B", "Relative Complement", "Subset Condition"],
      };
    }
    if (q.includes("empty set") || q === "what is an empty set?" || q.includes("empty")) {
      return {
        message:
          "### The Empty Set ∅\n\nThe **Empty Set** $\\emptyset$ (or $\\{\\}$) is the unique set containing zero elements:\n\n- **Cardinality**: $|\\emptyset| = 0$.\n- **Universal Subset**: The empty set is a subset of every set: $\\emptyset \\subseteq A$.\n- **Intersection Annihilator**: $A \\cap \\emptyset = \\emptyset$.\n- **Union Identity**: $A \\cup \\emptyset = A$.\n- **Power Set**: $\\mathcal{P}(\\emptyset) = \\{\\emptyset\\}$ has $|\\mathcal{P}(\\emptyset)| = 2^0 = 1$.",
        keyTakeaways: ["Empty Set ∅", "Cardinality |∅| = 0", "Subset of Every Set"],
      };
    }
    if (q.includes("subset")) {
      return {
        message:
          "### Subsets (A ⊆ B)\n\nA set $A$ is a **subset** of $B$ ($A \\subseteq B$) if every element of $A$ is also in $B$:\n$$\\forall x, x \\in A \\implies x \\in B$$\n\n- **Proper Subset ($A \\subset B$)**: $A \\subseteq B$ and $A \\ne B$.\n- **Power Set**: The set of all subsets of $B$ is the Power Set $\\mathcal{P}(B)$ with cardinality $2^{|B|}$.",
        keyTakeaways: ["Subset A ⊆ B", "Power Set of Subsets", "Proper Subsets"],
      };
    }
    if (q.includes("power set") || q.includes("powerset") || q.includes("2^a") || q.includes("2^n")) {
      return {
        message:
          "### Power Set 𝒫(A)\n\nThe **Power Set** $\\mathcal{P}(A)$ (or $2^A$) is the set of **all subsets** of $A$:\n\n- If $|A| = n$, then $|\\mathcal{P}(A)| = 2^n$ (e.g. for $|A| = 4$, $2^4 = 16$ subsets).\n- Always includes the empty set $\\emptyset$ and $A$ itself.\n- **Cantor's Theorem**: For every set $A$, $|A| < |\\mathcal{P}(A)|$ (strictly greater cardinality, even for infinite sets!).",
        keyTakeaways: ["|𝒫(A)| = 2ⁿ Subsets", "Always Contains ∅ and A", "Cantor's Theorem: |A| < |𝒫(A)|"],
      };
    }
    if (q.includes("cantor") || q.includes("diagonalization") || q.includes("uncountable")) {
      return {
        message:
          "### Cantor's Diagonalization & Countability\n\nGeorg Cantor proved that the real numbers $\\mathbb{R}$ in the interval $(0, 1)$ are **uncountably infinite**:\n\n1. Assume $(0, 1)$ can be listed in a countable sequence $r_1, r_2, r_3, \\dots$\n2. Construct a new number $d = 0.d_1 d_2 d_3 \\dots$ where the $i$-th digit $d_i$ differs from the $i$-th digit of $r_i$ (e.g. $d_i = 4$ if $r_{ii} = 5$, else $5$).\n3. The constructed number $d$ differs from every number in the list by at least one diagonal digit ($d \\ne r_k$ for all $k$).\n4. Contradiction! Therefore $(0, 1)$ cannot be enumerated. $|\\mathbb{R}| > |\\mathbb{N}|$.",
        keyTakeaways: ["Countable vs Uncountable", "Diagonal Element Inversion", "Used to Prove Undecidability"],
      };
    }
    if (q.includes("union") || q.includes("∪")) {
      return {
        message:
          "### Set Union (A ∪ B)\n\nThe **Union** $A \\cup B$ (or A ∪ B) collects all elements that belong to either set $A$, set $B$, or both:\n$$A \\cup B = \\{x \\mid x \\in A \\lor x \\in B\\}$$\n\n- **Idempotence**: $A \\cup A = A$.\n- **Identity**: $A \\cup \\emptyset = A$.\n- **Universal**: $A \\cup U = U$.\n- **Cardinality**: $|A \\cup B| = |A| + |B| - |A \\cap B|$ (Principle of Inclusion-Exclusion).",
        keyTakeaways: ["A ∪ B = {x | x ∈ A ∨ x ∈ B}", "Belongs to Either Set A, B or Both", "Identity: A ∪ ∅ = A"],
      };
    }
    if (q.includes("intersection") || q.includes("∩")) {
      return {
        message:
          "### Set Intersection (A ∩ B)\n\nThe **Intersection** $A \\cap B$ contains elements present in **both** sets simultaneously:\n$$A \\cap B = \\{x \\mid x \\in A \\land x \\in B\\}$$\n\n- If $A \\cap B = \\emptyset$, the sets are called **mutually disjoint**.\n- **Idempotence**: $A \\cap A = A$.\n- **Identity**: $A \\cap U = A$.\n- **Annihilator**: $A \\cap \\emptyset = \\emptyset$.",
        keyTakeaways: ["A ∩ B = {x | x ∈ A ∧ x ∈ B}", "Disjoint if A ∩ B = ∅", "Identity: A ∩ U = A"],
      };
    }
    if (q.includes("cartesian") || q.includes("product") || q.includes("×")) {
      return {
        message:
          "### Cartesian Product (A × B)\n\nThe **Cartesian Product** $A \\times B$ is the set of all ordered pairs $(a, b)$:\n$$A \\times B = \\{(a, b) \\mid a \\in A \\land b \\in B\\}$$\n\n- **Cardinality**: $|A \\times B| = |A| \\cdot |B|$ ($|A|$ times $|B|$).\n- **Non-commutative**: $A \\times B \\ne B \\times A$ in general (unless $A = B$ or one is empty).\n- **Basis of Relations**: Any binary relation $R$ from $A$ to $B$ is a subset $R \\subseteq A \\times B$.",
        keyTakeaways: ["Ordered Pairs (a, b)", "|A × B| = |A| · |B|", "Foundation of Binary Relations"],
      };
    }
    if (q.includes("cardinality") || q.includes("size") || q.includes("inclusion-exclusion") || q.includes("pie")) {
      return {
        message:
          "### Cardinality & Principle of Inclusion-Exclusion (PIE)\n\n**Cardinality** $|S|$ is the count of distinct elements in set $S$.\n\n#### Inclusion-Exclusion Principle:\n- **For 2 Sets**: $|A \\cup B| = |A| + |B| - |A \\cap B|$\n- **For 3 Sets**:\n  $$|A \\cup B \\cup C| = |A| + |B| + |C| - (|A \\cap B| + |A \\cap C| + |B \\cap C|) + |A \\cap B \\cap C|$$\n  Formula: $|A \\cup B \\cup C|$ ($|a \\cup b \\cup c|$ or $|a ∪ b ∪ c|$) prevents triple-overlap overcounting.",
        keyTakeaways: ["|A ∪ B| = |A| + |B| - |A ∩ B|", "|A ∪ B ∪ C| Formula", "Venn Overlap Correction"],
      };
    }
  }

  // -------------------------------------------------------------------------
  // 8. LIVE CONTEXT / EXPLAIN STEP QUERIES
  // -------------------------------------------------------------------------
  if (
    q.includes("explain") ||
    q.includes("current") ||
    q.includes("what is happening") ||
    q.includes("step") ||
    q.includes("canvas")
  ) {
    if (moduleId === "automata" && automataSim) {
      return generateAutomataExplanation(automataSim, activeAutomataStepIndex);
    }
    if (moduleId === "logic" && logicEval) {
      return generateLogicExplanation(logicEval);
    }
    if (moduleId === "relations-functions") {
      return {
        message:
          "### Current Relations & Functions Model\n\nYour relation model is active in the dock below:\n\n- Click **Adjacency Matrix** to view 0/1 entries and property verifications (Reflexive, Symmetric, Transitive, Poset, Equivalence).\n- Click **Hasse Diagram** to see the reduced transitive poset ordering.\n- Click **Warshall** to step through the reachability closures $W^{(0)} \\to W^{(n)}$.\n- Click **Function Mapper** to analyze injectivity and surjectivity.",
        keyTakeaways: ["Adjacency Matrix", "Poset Reduction", "Warshall Closure"],
      };
    }
    return generateExplanation(evalResult);
  }

  if (q.includes("hint") || q.includes("help") || q.includes("clue")) {
    if (moduleId === "logic" && logicEval) {
      return generateLogicHint(logicEval);
    }
    return generateHint(evalResult);
  }

  if (q.includes("example") || q.includes("template")) {
    if (moduleId === "logic") {
      return generateLogicExample();
    }
    return generateExample();
  }

  // Fallback to domain explanation or general overview
  if (moduleId === "logic" && logicEval) {
    return generateLogicExplanation(logicEval);
  }
  return generateExplanation(evalResult);
}

