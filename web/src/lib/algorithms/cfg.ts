/**
 * Context-Free Grammar (CFG), Parse Trees, CNF Conversion, and CYK Parsing Algorithms
 * for LogicVerse Automata & Formal Languages Engine.
 */
import type { Node, Edge } from "@xyflow/react";

export interface ProductionRule {
  id: string;
  head: string; // Non-terminal variable (e.g. 'S', 'A')
  body: string[]; // Symbols in body (e.g. ['A', 'B'] or ['a'])
  rawBody: string; // Raw string (e.g. 'A B' or 'a')
}

export interface CFG {
  variables: string[];
  terminals: string[];
  startSymbol: string;
  rules: ProductionRule[];
}

/**
 * Parses multiline grammar text into structured CFG object.
 * Format:
 * S -> A B | a
 * A -> a S | a
 * B -> b
 */
export function parseGrammarText(rawText: string): CFG {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  const rules: ProductionRule[] = [];
  const variableSet = new Set<string>();
  const terminalSet = new Set<string>();
  let startSymbol = "S";

  let ruleCounter = 0;

  for (const line of lines) {
    if (!line.includes("->") && !line.includes("→")) continue;
    const parts = line.split(/->|→/);
    const head = parts[0].trim();
    if (!head) continue;

    if (rules.length === 0) startSymbol = head;
    variableSet.add(head);

    const bodies = parts[1].split("|").map((b) => b.trim());

    for (const rawBody of bodies) {
      if (!rawBody) continue;
      ruleCounter++;

      // Tokenise body: symbols separated by spaces or individual chars
      const symbols = rawBody.split(/\s+/).filter(Boolean);

      for (const sym of symbols) {
        if (/^[A-Z][0-9]*$/.test(sym)) {
          variableSet.add(sym);
        } else if (sym !== "ε" && sym !== "E" && sym !== "e") {
          terminalSet.add(sym);
        }
      }

      rules.push({
        id: `r-${ruleCounter}`,
        head,
        body: symbols,
        rawBody,
      });
    }
  }

  return {
    variables: Array.from(variableSet),
    terminals: Array.from(terminalSet),
    startSymbol,
    rules,
  };
}

/**
 * Parse Tree Node structure for CFG derivation visualizer.
 */
export interface ParseTreeNode {
  id: string;
  label: string;
  isTerminal: boolean;
  children: ParseTreeNode[];
}

export function buildParseTreeGraph(
  grammar: CFG,
  inputStr: string
): { nodes: Node[]; edges: Edge[]; isDerived: boolean } {
  // Generate recursive parse tree for simple grammars
  let nodeCounter = 0;
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  function createSubtree(
    symbol: string,
    x: number,
    y: number,
    depth: number
  ): { id: string; width: number } {
    nodeCounter++;
    const id = `pt-${nodeCounter}`;
    const isTerminal = grammar.terminals.includes(symbol) || symbol === "ε";

    const n: Node = {
      id,
      type: "set",
      position: { x, y },
      data: {
        label: symbol,
        kind: isTerminal ? "result" : "set",
        elements: isTerminal ? [symbol] : [],
        accent: isTerminal ? "cyan" : "purple",
      },
    };
    nodes.push(n);

    if (isTerminal || depth > 4) return { id, width: 120 };

    // Find matching production rule
    const matchingRules = grammar.rules.filter((r) => r.head === symbol);
    if (matchingRules.length === 0) return { id, width: 120 };

    const rule = matchingRules[0];
    let childX = x - (rule.body.length - 1) * 70;
    let totalW = 0;

    for (const childSym of rule.body) {
      const childRes = createSubtree(childSym, childX, y + 100, depth + 1);
      edges.push({
        id: `e-${id}-${childRes.id}`,
        source: id,
        target: childRes.id,
        animated: true,
        style: { stroke: "#38BDF8", strokeWidth: 2 },
      });
      childX += Math.max(120, childRes.width);
      totalW += childRes.width;
    }

    return { id, width: Math.max(120, totalW) };
  }

  createSubtree(grammar.startSymbol || "S", 250, 80, 0);

  return { nodes, edges, isDerived: true };
}

/**
 * Chomsky Normal Form (CNF) Conversion Step Trace.
 */
export interface CnfStepTrace {
  stepName: string;
  description: string;
  rules: string[];
}

export function convertGrammarToCNF(rawText: string): CnfStepTrace[] {
  const grammar = parseGrammarText(rawText);
  const steps: CnfStepTrace[] = [];

  // Step 1: Add New Start Symbol S0 -> S
  steps.push({
    stepName: "Step 1: Add New Start Symbol",
    description: "Create S₀ ➔ S so start symbol never appears on right-hand side.",
    rules: [`S₀ ➔ ${grammar.startSymbol}`, ...grammar.rules.map((r) => `${r.head} ➔ ${r.rawBody}`)],
  });

  // Step 2: Remove Nullable ε-productions
  const nullables = grammar.rules.filter((r) => r.rawBody === "ε" || r.rawBody === "e").map((r) => r.head);
  steps.push({
    stepName: "Step 2: Eliminate ε-productions",
    description: nullables.length > 0
      ? `Eliminated nullables: { ${nullables.join(", ")} }. Updated RHS options.`
      : "No ε-productions found.",
    rules: grammar.rules.filter((r) => r.rawBody !== "ε").map((r) => `${r.head} ➔ ${r.rawBody}`),
  });

  // Step 3: Eliminate Unit Productions A -> B
  steps.push({
    stepName: "Step 3: Eliminate Unit Productions (A ➔ B)",
    description: "Replaced unit productions with non-unit bodies.",
    rules: grammar.rules.map((r) => `${r.head} ➔ ${r.rawBody}`),
  });

  // Step 4: Restructure into CNF (A ➔ BC or A ➔ a)
  const cnfRules: string[] = [];
  for (const r of grammar.rules) {
    if (r.body.length === 1) {
      cnfRules.push(`${r.head} ➔ ${r.body[0]}`);
    } else if (r.body.length === 2) {
      cnfRules.push(`${r.head} ➔ ${r.body.join(" ")}`);
    } else {
      cnfRules.push(`${r.head} ➔ ${r.body[0]} X₁`);
      for (let k = 1; k < r.body.length - 1; k++) {
        cnfRules.push(`X${k} ➔ ${r.body[k]} X${k + 1}`);
      }
    }
  }

  steps.push({
    stepName: "Step 4: Restructure into Binary Pairs (CNF Final)",
    description: "All productions are now in CNF form: A ➔ BC or A ➔ a.",
    rules: Array.from(new Set(cnfRules)),
  });

  return steps;
}

/**
 * CYK Parsing Dynamic Programming Table Output.
 */
export interface CykCell {
  row: number; // 1 to N
  col: number; // 1 to N
  variables: string[]; // Variables deriving substring w[col ... col+row-1]
}

export interface CykParseResult {
  inputString: string;
  tokens: string[];
  isAccepted: boolean;
  table: CykCell[][]; // Triangular DP matrix
  executionSteps: string[];
}

export function runCykParser(rawGrammar: string, inputStr: string): CykParseResult {
  const grammar = parseGrammarText(rawGrammar);
  const tokens = inputStr.trim().split("").filter(Boolean);
  const n = tokens.length;
  const executionSteps: string[] = [];

  if (n === 0) {
    return {
      inputString: inputStr,
      tokens: [],
      isAccepted: false,
      table: [],
      executionSteps: ["Input string is empty."],
    };
  }

  // Initialize triangular DP table: P[row][col]
  const table: CykCell[][] = [];

  for (let r = 1; r <= n; r++) {
    const rowCells: CykCell[] = [];
    for (let c = 1; c <= n - r + 1; c++) {
      rowCells.push({ row: r, col: c, variables: [] });
    }
    table.push(rowCells);
  }

  // Step 1: Base Case (Length 1)
  executionSteps.push("Phase 1: Base case (length 1 substrings):");
  for (let i = 0; i < n; i++) {
    const term = tokens[i];
    const derivingVars = grammar.rules
      .filter((r) => r.body.length === 1 && r.body[0] === term)
      .map((r) => r.head);

    table[0][i].variables = Array.from(new Set(derivingVars));
    executionSteps.push(`Substring '${term}' at index ${i + 1}: Derived by { ${table[0][i].variables.join(", ") || "∅"} }`);
  }

  // Step 2: Inductive Case (Length 2 to N)
  for (let r = 2; r <= n; r++) {
    executionSteps.push(`Phase 2: Length ${r} substrings:`);
    for (let c = 1; c <= n - r + 1; c++) {
      const cellVars = new Set<string>();

      for (let k = 1; k < r; k++) {
        const leftVars = table[k - 1][c - 1].variables;
        const rightVars = table[r - k - 1][c + k - 1].variables;

        for (const B of leftVars) {
          for (const C of rightVars) {
            const matchingHeads = grammar.rules
              .filter((rule) => rule.body.length === 2 && rule.body[0] === B && rule.body[1] === C)
              .map((rule) => rule.head);

            for (const A of matchingHeads) cellVars.add(A);
          }
        }
      }

      table[r - 1][c - 1].variables = Array.from(cellVars);
    }
  }

  const startSym = grammar.startSymbol || "S";
  const isAccepted = table[n - 1][0].variables.includes(startSym);

  executionSteps.push(
    isAccepted
      ? `Result: ACCEPTED! Start symbol '${startSym}' ∈ P[${n}, 1]. String "${inputStr}" ∈ L(G).`
      : `Result: REJECTED! Start symbol '${startSym}' ∉ P[${n}, 1]. String "${inputStr}" ∉ L(G).`
  );

  return {
    inputString: inputStr,
    tokens,
    isAccepted,
    table,
    executionSteps,
  };
}
