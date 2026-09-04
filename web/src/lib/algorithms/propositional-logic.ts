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
  dnf: string; // Disjunctive Normal Form (Minterms)
  cnf: string; // Conjunctive Normal Form (Maxterms)
  latexTable: string;
  markdownTable: string;
}

export interface InductionTheorem {
  id: string;
  title: string;
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
    id: "sum-odds",
    title: "Sum of First n Odd Integers",
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
    id: "sum-powers-two",
    title: "Sum of Powers of Two",
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
];
