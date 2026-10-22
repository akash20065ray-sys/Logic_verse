// Deterministic Propositional Logic & Boolean Algebra engine.
// UI-free, zero React imports, independently unit-testable.

export type LogicUnaryOp = "¬";
export type LogicBinaryOp = "∧" | "∨" | "→" | "↔" | "⊕";
export type LogicOp = LogicUnaryOp | LogicBinaryOp;

export type LogicAST =
  | { type: "var"; name: string }
  | { type: "const"; value: boolean }
  | { type: "unary"; op: LogicUnaryOp; operand: LogicAST }
  | { type: "binary"; op: LogicBinaryOp; left: LogicAST; right: LogicAST };

export interface TruthTableRow {
  assignment: Record<string, boolean>;
  subexpressions: Record<string, boolean>;
  result: boolean;
}

export interface TruthTable {
  variables: string[];
  subexpressionHeaders: string[];
  rows: TruthTableRow[];
  isTautology: boolean;
  isContradiction: boolean;
  isContingent: boolean;
  falsifyingAssignment?: Record<string, boolean>; // Counter-example to being a Tautology
  satisfyingAssignment?: Record<string, boolean>; // Witness to being Satisfiable
  dnf: string; // Disjunctive Normal Form (Minterms)
  cnf: string; // Conjunctive Normal Form (Maxterms)
  latexTable: string;
  markdownTable: string;
}

export interface InductionTheorem {
  id: string;
  title: string;
  category?: "sums" | "divisibility" | "inequalities" | "powers";
  formula: string;
  lhsDescription: (n: number) => string;
  rhsDescription: (n: number) => string;
  evalLhs: (n: number) => number;
  evalRhs: (n: number) => number;
  baseCase: {
    n: number;
    lhs: string;
    rhs: string;
    lhsVal: number;
    rhsVal: number;
    verified: boolean;
  };
  hypothesis: {
    statement: string;
  };
  inductiveStep: {
    goal: string;
    derivationSteps: string[];
    conclusion: string;
  };
}

// 1. Evaluate AST given an environment
export function evaluateAST(ast: LogicAST, env: Record<string, boolean>): boolean {
  switch (ast.type) {
    case "const":
      return ast.value;
    case "var":
      return env[ast.name] ?? false;
    case "unary":
      return !evaluateAST(ast.operand, env);
    case "binary": {
      const l = evaluateAST(ast.left, env);
      const r = evaluateAST(ast.right, env);
      switch (ast.op) {
        case "∧":
          return l && r;
        case "∨":
          return l || r;
        case "→":
          return !l || r; // Material implication: F only when T -> F
        case "↔":
          return l === r;
        case "⊕":
          return l !== r;
      }
    }
  }
}

// 2. Format AST to readable string & LaTeX
export function formatAST(ast: LogicAST): string {
  switch (ast.type) {
    case "const":
      return ast.value ? "⊤" : "⊥";
    case "var":
      return ast.name;
    case "unary":
      return `¬${formatAST(ast.operand)}`;
    case "binary":
      return `(${formatAST(ast.left)} ${ast.op} ${formatAST(ast.right)})`;
  }
}

export function formatASTLatex(ast: LogicAST): string {
  switch (ast.type) {
    case "const":
      return ast.value ? "\\top" : "\\bot";
    case "var":
      return ast.name;
    case "unary":
      return `\\neg ${formatASTLatex(ast.operand)}`;
    case "binary": {
      const opLatex =
        ast.op === "∧"
          ? "\\land"
          : ast.op === "∨"
          ? "\\lor"
          : ast.op === "→"
          ? "\\implies"
          : ast.op === "↔"
          ? "\\iff"
          : "\\oplus";
      return `(${formatASTLatex(ast.left)} ${opLatex} ${formatASTLatex(ast.right)})`;
    }
  }
}

// 3. Extract all variables from AST
export function getVariables(ast: LogicAST): string[] {
  const vars = new Set<string>();
  function traverse(node: LogicAST) {
    if (node.type === "var") vars.add(node.name);
    else if (node.type === "unary") traverse(node.operand);
    else if (node.type === "binary") {
      traverse(node.left);
      traverse(node.right);
    }
  }
  traverse(ast);
  return Array.from(vars).sort();
}

// 4. Extract distinct non-trivial subexpressions
export function getSubexpressions(ast: LogicAST): LogicAST[] {
  const list: LogicAST[] = [];
  const seen = new Set<string>();

  function traverse(node: LogicAST) {
    if (node.type === "unary") {
      traverse(node.operand);
      const str = formatAST(node);
      if (!seen.has(str)) {
        seen.add(str);
        list.push(node);
      }
    } else if (node.type === "binary") {
      traverse(node.left);
      traverse(node.right);
      const str = formatAST(node);
      if (!seen.has(str)) {
        seen.add(str);
        list.push(node);
      }
    }
  }

  traverse(ast);
  return list;
}

// 5. Generate complete Truth Table
export function generateTruthTable(ast: LogicAST): TruthTable {
  const variables = getVariables(ast);
  const n = variables.length;
  const numRows = 1 << n; // 2^n rows

  const subexpressions = getSubexpressions(ast);
  const subHeaders = subexpressions.map(formatAST);

  const rows: TruthTableRow[] = [];
  let trueCount = 0;
  let falseCount = 0;

  const minterms: string[] = [];
  const maxterms: string[] = [];

  for (let i = 0; i < numRows; i++) {
    // Generate boolean assignment for variables
    const assignment: Record<string, boolean> = {};
    for (let bit = 0; bit < n; bit++) {
      const varName = variables[bit];
      // MSB first for standard truth table ordering (T, T ... T, F)
      const isTrue = !Boolean((i >> (n - 1 - bit)) & 1);
      assignment[varName] = isTrue;
    }

    // Evaluate subexpressions
    const subResults: Record<string, boolean> = {};
    for (let s = 0; s < subexpressions.length; s++) {
      subResults[subHeaders[s]] = evaluateAST(subexpressions[s], assignment);
    }

    const result = evaluateAST(ast, assignment);
    if (result) {
      trueCount++;
      // Minterm: P ∧ ¬Q ...
      const terms = variables.map((v) => (assignment[v] ? v : `¬${v}`));
      minterms.push(`(${terms.join(" ∧ ")})`);
    } else {
      falseCount++;
      // Maxterm: ¬P ∨ Q ...
      const terms = variables.map((v) => (assignment[v] ? `¬${v}` : v));
      maxterms.push(`(${terms.join(" ∨ ")})`);
    }

    rows.push({
      assignment,
      subexpressions: subResults,
      result,
    });
  }

  const isTautology = falseCount === 0 && numRows > 0;
  const isContradiction = trueCount === 0 && numRows > 0;
  const isContingent = !isTautology && !isContradiction;

  // Extract counterexample: first row where result is false (for tautology check)
  // Extract witness: first row where result is true (for satisfiability check)
  let falsifyingAssignment: Record<string, boolean> | undefined;
  let satisfyingAssignment: Record<string, boolean> | undefined;
  for (const r of rows) {
    if (!r.result && !falsifyingAssignment) {
      falsifyingAssignment = { ...r.assignment };
    }
    if (r.result && !satisfyingAssignment) {
      satisfyingAssignment = { ...r.assignment };
    }
  }

  const dnf =
    minterms.length === 0
      ? "⊥"
      : minterms.length === numRows
      ? "⊤"
      : minterms.join(" ∨ ");

  const cnf =
    maxterms.length === 0
      ? "⊤"
      : maxterms.length === numRows
      ? "⊥"
      : maxterms.join(" ∧ ");

  // Build Markdown table
  const mdHeaders = [...variables, ...subHeaders];
  const mdHeaderLine = `| ${mdHeaders.join(" | ")} |`;
  const mdDividerLine = `| ${mdHeaders.map(() => "---").join(" | ")} |`;
  const mdRows = rows.map((r) => {
    const varVals = variables.map((v) => (r.assignment[v] ? "T" : "F"));
    const subVals = subHeaders.map((h) => (r.subexpressions[h] ? "T" : "F"));
    return `| ${[...varVals, ...subVals].join(" | ")} |`;
  });
  const markdownTable = [mdHeaderLine, mdDividerLine, ...mdRows].join("\n");

  // Build LaTeX table
  const colSpec = "c".repeat(variables.length + subHeaders.length);
  const latexRows = rows.map((r) => {
    const varVals = variables.map((v) => (r.assignment[v] ? "T" : "F"));
    const subVals = subHeaders.map((h) => (r.subexpressions[h] ? "T" : "F"));
    return `${[...varVals, ...subVals].join(" & ")} \\\\`;
  });
  const latexTable = `\\begin{array}{${colSpec}}\n${mdHeaders.join(" & ")} \\\\\n\\hline\n${latexRows.join("\n")}\n\\end{array}`;

  return {
    variables,
    subexpressionHeaders: subHeaders,
    rows,
    isTautology,
    isContradiction,
    isContingent,
    falsifyingAssignment,
    satisfyingAssignment,
    dnf,
    cnf,
    latexTable,
    markdownTable,
  };
}

// 6. Logical Equivalence Checker (F1 ≡ F2)
export function checkEquivalence(
  f1: LogicAST,
  f2: LogicAST
): { equivalent: boolean; counterexample?: Record<string, boolean> } {
  const vars = Array.from(new Set([...getVariables(f1), ...getVariables(f2)])).sort();
  const n = vars.length;
  const numRows = 1 << n;

  for (let i = 0; i < numRows; i++) {
    const assignment: Record<string, boolean> = {};
    for (let bit = 0; bit < n; bit++) {
      assignment[vars[bit]] = !Boolean((i >> (n - 1 - bit)) & 1);
    }

    const val1 = evaluateAST(f1, assignment);
    const val2 = evaluateAST(f2, assignment);

    if (val1 !== val2) {
      return { equivalent: false, counterexample: assignment };
    }
  }

  return { equivalent: true };
}

// 7. Mathematical Induction Library
export const INDUCTION_THEOREMS: InductionTheorem[] = [
  {
    id: "sum-integers",
    title: "Sum of First n Natural Numbers",
    category: "sums",
    formula: "1 + 2 + 3 + ... + n = \\frac{n(n + 1)}{2}",
    lhsDescription: (n) => `1 + 2 + ... + ${n}`,
    rhsDescription: (n) => `(${n} × ${n + 1}) / 2`,
    evalLhs: (n) => (n * (n + 1)) / 2,
    evalRhs: (n) => (n * (n + 1)) / 2,
    baseCase: {
      n: 1,
      lhs: "1",
      rhs: "(1 × (1 + 1)) / 2 = 2 / 2 = 1",
      lhsVal: 1,
      rhsVal: 1,
      verified: true,
    },
    hypothesis: {
      statement: "Assume P(k) is true: 1 + 2 + ... + k = k(k + 1) / 2 for some integer k ≥ 1.",
    },
    inductiveStep: {
      goal: "Prove P(k + 1): 1 + 2 + ... + k + (k + 1) = (k + 1)(k + 2) / 2",
      derivationSteps: [
        "LHS = [1 + 2 + ... + k] + (k + 1)",
        "By Inductive Hypothesis, substitute [k(k + 1) / 2]:",
        "= k(k + 1) / 2 + (k + 1)",
        "= (k(k + 1) + 2(k + 1)) / 2",
        "= (k + 1)(k + 2) / 2 = RHS",
      ],
      conclusion: "Since the base case P(1) holds and P(k) ⇒ P(k+1) is proven, by Mathematical Induction P(n) holds for all n ≥ 1.",
    },
  },
  {
    id: "sum-squares",
    title: "Sum of First n Squares",
    category: "sums",
    formula: "1^2 + 2^2 + ... + n^2 = \\frac{n(n + 1)(2n + 1)}{6}",
    lhsDescription: (n) => `1² + 2² + ... + ${n}²`,
    rhsDescription: (n) => `(${n} × ${n + 1} × ${2 * n + 1}) / 6`,
    evalLhs: (n) => {
      let s = 0;
      for (let i = 1; i <= n; i++) s += i * i;
      return s;
    },
    evalRhs: (n) => (n * (n + 1) * (2 * n + 1)) / 6,
    baseCase: {
      n: 1,
      lhs: "1² = 1",
      rhs: "(1 × 2 × 3) / 6 = 1",
      lhsVal: 1,
      rhsVal: 1,
      verified: true,
    },
    hypothesis: {
      statement: "Assume P(k) is true: 1² + 2² + ... + k² = k(k + 1)(2k + 1) / 6 for some k ≥ 1.",
    },
    inductiveStep: {
      goal: "Prove P(k + 1): 1² + 2² + ... + k² + (k + 1)² = (k + 1)(k + 2)(2k + 3) / 6",
      derivationSteps: [
        "LHS = [1² + 2² + ... + k²] + (k + 1)²",
        "By Inductive Hypothesis, substitute [k(k + 1)(2k + 1) / 6]:",
        "= k(k + 1)(2k + 1) / 6 + 6(k + 1)² / 6",
        "= (k + 1) [k(2k + 1) + 6(k + 1)] / 6",
        "= (k + 1) (2k² + 7k + 6) / 6",
        "= (k + 1)(k + 2)(2k + 3) / 6 = RHS",
      ],
      conclusion: "By Mathematical Induction, the sum of squares identity holds for all n ≥ 1.",
    },
  },
  {
    id: "sum-cubes",
    title: "Sum of First n Cubes (Nicomachus' Identity)",
    category: "sums",
    formula: "1^3 + 2^3 + ... + n^3 = \\left(\\frac{n(n + 1)}{2}\\right)^2",
    lhsDescription: (n) => `1³ + 2³ + ... + ${n}³`,
    rhsDescription: (n) => `[(${n} × ${n + 1}) / 2]²`,
    evalLhs: (n) => {
      let s = 0;
      for (let i = 1; i <= n; i++) s += i * i * i;
      return s;
    },
    evalRhs: (n) => Math.pow((n * (n + 1)) / 2, 2),
    baseCase: {
      n: 1,
      lhs: "1³ = 1",
      rhs: "[(1 × 2) / 2]² = 1² = 1",
      lhsVal: 1,
      rhsVal: 1,
      verified: true,
    },
    hypothesis: {
      statement: "Assume P(k) is true: 1³ + 2³ + ... + k³ = [k(k + 1) / 2]² for some k ≥ 1.",
    },
    inductiveStep: {
      goal: "Prove P(k + 1): 1³ + ... + k³ + (k + 1)³ = [(k + 1)(k + 2) / 2]²",
      derivationSteps: [
        "LHS = [1³ + ... + k³] + (k + 1)³",
        "By Inductive Hypothesis, substitute [k(k + 1) / 2]²:",
        "= k²(k + 1)² / 4 + 4(k + 1)³ / 4",
        "= (k + 1)² [k² + 4(k + 1)] / 4",
        "= (k + 1)² (k² + 4k + 4) / 4",
        "= (k + 1)² (k + 2)² / 4 = [(k + 1)(k + 2) / 2]² = RHS",
      ],
      conclusion: "Thus, the sum of the first n cubes equals the square of the sum of the first n integers.",
    },
  },
  {
    id: "sum-odds",
    title: "Sum of First n Odd Integers",
    category: "sums",
    formula: "1 + 3 + 5 + ... + (2n - 1) = n^2",
    lhsDescription: (n) => `1 + 3 + ... + ${2 * n - 1}`,
    rhsDescription: (n) => `${n}²`,
    evalLhs: (n) => n * n,
    evalRhs: (n) => n * n,
    baseCase: {
      n: 1,
      lhs: "2(1) - 1 = 1",
      rhs: "1² = 1",
      lhsVal: 1,
      rhsVal: 1,
      verified: true,
    },
    hypothesis: {
      statement: "Assume P(k) is true: 1 + 3 + 5 + ... + (2k - 1) = k².",
    },
    inductiveStep: {
      goal: "Prove P(k + 1): 1 + 3 + ... + (2k - 1) + (2(k + 1) - 1) = (k + 1)²",
      derivationSteps: [
        "LHS = [1 + 3 + ... + (2k - 1)] + (2k + 1)",
        "By Inductive Hypothesis, replace sum with k²:",
        "= k² + 2k + 1",
        "= (k + 1)² = RHS",
      ],
      conclusion: "Hence, P(k+1) is true. By Induction, the sum of the first n odd integers is always n².",
    },
  },
  {
    id: "sum-evens",
    title: "Sum of First n Even Numbers",
    category: "sums",
    formula: "2 + 4 + 6 + ... + 2n = n(n + 1)",
    lhsDescription: (n) => `2 + 4 + ... + ${2 * n}`,
    rhsDescription: (n) => `${n} × (${n} + 1)`,
    evalLhs: (n) => n * (n + 1),
    evalRhs: (n) => n * (n + 1),
    baseCase: {
      n: 1,
      lhs: "2(1) = 2",
      rhs: "1(1 + 1) = 2",
      lhsVal: 2,
      rhsVal: 2,
      verified: true,
    },
    hypothesis: {
      statement: "Assume P(k) is true: 2 + 4 + ... + 2k = k(k + 1).",
    },
    inductiveStep: {
      goal: "Prove P(k + 1): 2 + 4 + ... + 2k + 2(k + 1) = (k + 1)(k + 2)",
      derivationSteps: [
        "LHS = [2 + 4 + ... + 2k] + 2(k + 1)",
        "By Inductive Hypothesis, replace bracketed sum with k(k + 1):",
        "= k(k + 1) + 2(k + 1)",
        "= (k + 1)(k + 2) = RHS",
      ],
      conclusion: "By Induction, the sum of first n even integers is always n(n + 1).",
    },
  },
  {
    id: "sum-powers-two",
    title: "Sum of Powers of Two",
    category: "powers",
    formula: "2^0 + 2^1 + 2^2 + ... + 2^n = 2^{n + 1} - 1",
    lhsDescription: (n) => `1 + 2 + 4 + ... + 2^${n}`,
    rhsDescription: (n) => `2^${n + 1} - 1`,
    evalLhs: (n) => (1 << (n + 1)) - 1,
    evalRhs: (n) => (1 << (n + 1)) - 1,
    baseCase: {
      n: 0,
      lhs: "2^0 = 1",
      rhs: "2^{0+1} - 1 = 2 - 1 = 1",
      lhsVal: 1,
      rhsVal: 1,
      verified: true,
    },
    hypothesis: {
      statement: "Assume P(k) is true: 1 + 2 + 4 + ... + 2^k = 2^{k + 1} - 1.",
    },
    inductiveStep: {
      goal: "Prove P(k + 1): 1 + 2 + ... + 2^k + 2^{k + 1} = 2^{k + 2} - 1",
      derivationSteps: [
        "LHS = [1 + 2 + ... + 2^k] + 2^{k + 1}",
        "By Hypothesis, substitute (2^{k + 1} - 1):",
        "= (2^{k + 1} - 1) + 2^{k + 1}",
        "= 2 · 2^{k + 1} - 1",
        "= 2^{k + 2} - 1 = RHS",
      ],
      conclusion: "The inductive step holds. By Mathematical Induction, the identity is true for all n ≥ 0.",
    },
  },
  {
    id: "divisibility-3",
    title: "Divisibility: 3 | (n³ + 2n)",
    category: "divisibility",
    formula: "3 \\mid (n^3 + 2n) \\quad \\text{for all } n \\ge 1",
    lhsDescription: (n) => `${n}³ + 2(${n}) = ${n * n * n + 2 * n}`,
    rhsDescription: (n) => `3 × ${(n * n * n + 2 * n) / 3}`,
    evalLhs: (n) => n * n * n + 2 * n,
    evalRhs: (n) => 3 * Math.floor((n * n * n + 2 * n) / 3),
    baseCase: {
      n: 1,
      lhs: "1³ + 2(1) = 3",
      rhs: "3 × 1 = 3 (Remainder 0)",
      lhsVal: 3,
      rhsVal: 3,
      verified: true,
    },
    hypothesis: {
      statement: "Assume P(k) is true: k³ + 2k = 3m for some integer m ≥ 1.",
    },
    inductiveStep: {
      goal: "Prove P(k + 1): (k + 1)³ + 2(k + 1) is a multiple of 3",
      derivationSteps: [
        "Expand (k + 1)³ + 2(k + 1):",
        "= (k³ + 3k² + 3k + 1) + (2k + 2)",
        "Regroup into [k³ + 2k] + [3k² + 3k + 3]:",
        "= [k³ + 2k] + 3(k² + k + 1)",
        "By Inductive Hypothesis, [k³ + 2k] = 3m:",
        "= 3m + 3(k² + k + 1) = 3 [m + k² + k + 1] = 3 · M",
        "Since M is an integer, (k + 1)³ + 2(k + 1) is divisible by 3.",
      ],
      conclusion: "By Mathematical Induction, 3 divides n³ + 2n for all positive integers n.",
    },
  },
  {
    id: "divisibility-6",
    title: "Divisibility: 6 | (n³ - n)",
    category: "divisibility",
    formula: "6 \\mid (n^3 - n) \\quad \\text{for all } n \\ge 1",
    lhsDescription: (n) => `${n}³ - ${n} = ${n * n * n - n}`,
    rhsDescription: (n) => `6 × ${(n * n * n - n) / 6}`,
    evalLhs: (n) => n * n * n - n,
    evalRhs: (n) => 6 * Math.floor((n * n * n - n) / 6),
    baseCase: {
      n: 1,
      lhs: "1³ - 1 = 0",
      rhs: "6 × 0 = 0 (Remainder 0)",
      lhsVal: 0,
      rhsVal: 0,
      verified: true,
    },
    hypothesis: {
      statement: "Assume P(k) is true: k³ - k = 6m for some integer m ≥ 0.",
    },
    inductiveStep: {
      goal: "Prove P(k + 1): (k + 1)³ - (k + 1) is divisible by 6",
      derivationSteps: [
        "Expand (k + 1)³ - (k + 1):",
        "= k³ + 3k² + 3k + 1 - k - 1",
        "= (k³ - k) + 3(k² + k) = (k³ - k) + 3k(k + 1)",
        "By Hypothesis, (k³ - k) = 6m.",
        "Since k(k + 1) is product of two consecutive integers, it is even (2p):",
        "= 6m + 3(2p) = 6m + 6p = 6(m + p)",
        "Since m + p is an integer, 6 divides (k + 1)³ - (k + 1).",
      ],
      conclusion: "By Mathematical Induction, 6 divides n³ - n for every positive integer n.",
    },
  },
  {
    id: "inequality-2n",
    title: "Inequality: 2^n > n",
    category: "inequalities",
    formula: "2^n > n \\quad \\text{for all } n \\ge 1",
    lhsDescription: (n) => `2^${n} = ${Math.pow(2, n)}`,
    rhsDescription: (n) => `n = ${n}`,
    evalLhs: (n) => Math.pow(2, n),
    evalRhs: (n) => Math.pow(2, n),
    baseCase: {
      n: 1,
      lhs: "2¹ = 2",
      rhs: "n = 1 (2 > 1 holds)",
      lhsVal: 2,
      rhsVal: 2,
      verified: true,
    },
    hypothesis: {
      statement: "Assume P(k) is true: 2^k > k for some integer k ≥ 1.",
    },
    inductiveStep: {
      goal: "Prove P(k + 1): 2^{k + 1} > k + 1",
      derivationSteps: [
        "LHS = 2^{k + 1} = 2 · 2^k",
        "By Inductive Hypothesis, substitute 2^k > k:",
        "2 · 2^k > 2k = k + k",
        "Since k ≥ 1, we have k + k ≥ k + 1:",
        "Thus 2^{k + 1} > k + 1 = RHS",
      ],
      conclusion: "The inductive step holds. By Mathematical Induction, 2^n > n for all n ≥ 1.",
    },
  },
  {
    id: "inequality-powers",
    title: "Inequality: 2^n ≥ n² (n ≥ 4)",
    category: "inequalities",
    formula: "2^n \\ge n^2 \\quad \\text{for all } n \\ge 4",
    lhsDescription: (n) => `2^${n} = ${Math.pow(2, n)}`,
    rhsDescription: (n) => `${n}² = ${n * n}`,
    evalLhs: (n) => Math.pow(2, n),
    evalRhs: (n) => Math.pow(2, n),
    baseCase: {
      n: 4,
      lhs: "2⁴ = 16",
      rhs: "4² = 16 (16 ≥ 16 holds)",
      lhsVal: 16,
      rhsVal: 16,
      verified: true,
    },
    hypothesis: {
      statement: "Assume P(k) is true: 2^k ≥ k² for some integer k ≥ 4.",
    },
    inductiveStep: {
      goal: "Prove P(k + 1): 2^{k + 1} ≥ (k + 1)²",
      derivationSteps: [
        "LHS = 2^{k + 1} = 2 · 2^k ≥ 2k² = k² + k²",
        "For k ≥ 4, we have k² ≥ 4k > 2k + 1:",
        "Therefore k² + k² ≥ k² + 2k + 1 = (k + 1)²",
        "Hence 2^{k + 1} ≥ (k + 1)² = RHS",
      ],
      conclusion: "By Mathematical Induction, 2^n ≥ n² holds for all integers n ≥ 4.",
    },
  },
];

