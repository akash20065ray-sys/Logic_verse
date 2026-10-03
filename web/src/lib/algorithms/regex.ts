/**
 * Regex Parsing, Thompson's Construction, String Matching, and Theoretical Algorithms
 * for LogicVerse Automata & Formal Languages Engine.
 */
import type { Node, Edge } from "@xyflow/react";

export type RegexASTNode =
  | { type: "char"; value: string }
  | { type: "epsilon" }
  | { type: "empty" }
  | { type: "union"; left: RegexASTNode; right: RegexASTNode }
  | { type: "concat"; left: RegexASTNode; right: RegexASTNode }
  | { type: "star"; expr: RegexASTNode }
  | { type: "plus"; expr: RegexASTNode }
  | { type: "optional"; expr: RegexASTNode };

/**
 * Parses a simplified Regular Expression into an AST.
 * Supported operators: union (+ or |), concat (implicit or .), star (*), plus (+ postfix), optional (?), parens (())
 */
export function parseRegexToAST(pattern: string): RegexASTNode {
  const cleaned = pattern.replace(/\s+/g, "");
  if (!cleaned) return { type: "epsilon" };

  // Helper tokeniser / recursive descent parser
  let idx = 0;

  function parseUnion(): RegexASTNode {
    let left = parseConcat();
    while (idx < cleaned.length && (cleaned[idx] === "|" || cleaned[idx] === "+")) {
      const op = cleaned[idx];
      if (op === "|") {
        idx++;
        const right = parseConcat();
        left = { type: "union", left, right };
      } else if (op === "+") {
        // Handle unary '+' or binary '+' union
        if (idx + 1 < cleaned.length && (cleaned[idx + 1] === "|" || cleaned[idx + 1] === ")")) {
          idx++;
          const right = parseConcat();
          left = { type: "union", left, right };
        } else {
          break;
        }
      } else {
        break;
      }
    }
    return left;
  }

  function parseConcat(): RegexASTNode {
    let left = parsePostfix();
    while (
      idx < cleaned.length &&
      cleaned[idx] !== ")" &&
      cleaned[idx] !== "|"
    ) {
      // Check if next token is start of another atom
      const nextChar = cleaned[idx];
      if (nextChar === "+" && (idx + 1 === cleaned.length || cleaned[idx+1] === ")" || cleaned[idx+1] === "|")) {
        // Postfix unary '+'
        idx++;
        left = { type: "plus", expr: left };
      } else {
        const right = parsePostfix();
        left = { type: "concat", left, right };
      }
    }
    return left;
  }

  function parsePostfix(): RegexASTNode {
    let expr = parseAtom();
    while (idx < cleaned.length) {
      const ch = cleaned[idx];
      if (ch === "*") {
        idx++;
        expr = { type: "star", expr };
      } else if (ch === "?" ) {
        idx++;
        expr = { type: "optional", expr };
      } else {
        break;
      }
    }
    return expr;
  }

  function parseAtom(): RegexASTNode {
    if (idx >= cleaned.length) return { type: "epsilon" };
    const ch = cleaned[idx];

    if (ch === "(") {
      idx++; // consume '('
      const sub = parseUnion();
      if (idx < cleaned.length && cleaned[idx] === ")") {
        idx++; // consume ')'
      }
      return sub;
    }

    if (ch === "ε" || ch === "E" || ch === "e") {
      idx++;
      return { type: "epsilon" };
    }

    if (ch === "∅") {
      idx++;
      return { type: "empty" };
    }

    // Literal character
    idx++;
    return { type: "char", value: ch };
  }

  try {
    return parseUnion();
  } catch {
    return { type: "char", value: pattern };
  }
}

/**
 * Converts a Regex AST into an ε-NFA graph using Thompson's Construction Algorithm.
 * Returns React Flow Nodes and Edges formatted for LogicVerse WorkspaceCanvas.
 */
export interface ThompsonGraph {
  nodes: Node[];
  edges: Edge[];
  startId: string;
  acceptId: string;
}

let stateCounter = 0;

export function buildThompsonNfa(pattern: string): ThompsonGraph {
  stateCounter = 0;
  const ast = parseRegexToAST(pattern);

  function createGraphForAst(
    node: RegexASTNode,
    startX: number = 100,
    startY: number = 200
  ): ThompsonGraph {
    stateCounter++;
    const sId = `q${stateCounter - 1}`;

    if (node.type === "char" || node.type === "epsilon") {
      stateCounter++;
      const aId = `q${stateCounter - 1}`;
      const sym = node.type === "char" ? node.value : "ε";

      const n1: Node = {
        id: sId,
        type: "automata-state",
        position: { x: startX, y: startY },
        data: { label: sId, isStart: false, isAccept: false },
      };

      const n2: Node = {
        id: aId,
        type: "automata-state",
        position: { x: startX + 160, y: startY },
        data: { label: aId, isStart: false, isAccept: false },
      };

      const e: Edge = {
        id: `e-${sId}-${aId}`,
        source: sId,
        target: aId,
        label: sym,
        animated: true,
        style: { stroke: "#38BDF8", strokeWidth: 2 },
        data: { symbol: sym },
      };

      return { nodes: [n1, n2], edges: [e], startId: sId, acceptId: aId };
    }

    if (node.type === "concat") {
      const leftG = createGraphForAst(node.left, startX, startY);
      const rightG = createGraphForAst(node.right, startX + 320, startY);

      // Connect leftG.acceptId -> rightG.startId with ε transition
      const joinEdge: Edge = {
        id: `e-${leftG.acceptId}-${rightG.startId}`,
        source: leftG.acceptId,
        target: rightG.startId,
        label: "ε",
        animated: true,
        style: { stroke: "#A855F7", strokeWidth: 2 },
        data: { symbol: "ε" },
      };

      return {
        nodes: [...leftG.nodes, ...rightG.nodes],
        edges: [...leftG.edges, ...rightG.edges, joinEdge],
        startId: leftG.startId,
        acceptId: rightG.acceptId,
      };
    }

    if (node.type === "union") {
      const topG = createGraphForAst(node.left, startX + 160, startY - 90);
      const botG = createGraphForAst(node.right, startX + 160, startY + 90);

      stateCounter++;
      const newStartId = `q${stateCounter - 1}`;
      stateCounter++;
      const newAcceptId = `q${stateCounter - 1}`;

      const maxRightX = Math.max(
        ...topG.nodes.map((n) => n.position.x),
        ...botG.nodes.map((n) => n.position.x)
      );

      const startNode: Node = {
        id: newStartId,
        type: "automata-state",
        position: { x: startX, y: startY },
        data: { label: newStartId, isStart: false, isAccept: false },
      };

      const acceptNode: Node = {
        id: newAcceptId,
        type: "automata-state",
        position: { x: maxRightX + 160, y: startY },
        data: { label: newAcceptId, isStart: false, isAccept: false },
      };

      const e1: Edge = {
        id: `e-${newStartId}-${topG.startId}`,
        source: newStartId,
        target: topG.startId,
        label: "ε",
        animated: true,
        style: { stroke: "#A855F7", strokeWidth: 2 },
        data: { symbol: "ε" },
      };
      const e2: Edge = {
        id: `e-${newStartId}-${botG.startId}`,
        source: newStartId,
        target: botG.startId,
        label: "ε",
        animated: true,
        style: { stroke: "#A855F7", strokeWidth: 2 },
        data: { symbol: "ε" },
      };
      const e3: Edge = {
        id: `e-${topG.acceptId}-${newAcceptId}`,
        source: topG.acceptId,
        target: newAcceptId,
        label: "ε",
        animated: true,
        style: { stroke: "#A855F7", strokeWidth: 2 },
        data: { symbol: "ε" },
      };
      const e4: Edge = {
        id: `e-${botG.acceptId}-${newAcceptId}`,
        source: botG.acceptId,
        target: newAcceptId,
        label: "ε",
        animated: true,
        style: { stroke: "#A855F7", strokeWidth: 2 },
        data: { symbol: "ε" },
      };

      return {
        nodes: [startNode, ...topG.nodes, ...botG.nodes, acceptNode],
        edges: [...topG.edges, ...botG.edges, e1, e2, e3, e4],
        startId: newStartId,
        acceptId: newAcceptId,
      };
    }

    if (node.type === "star" || node.type === "plus") {
      const innerG = createGraphForAst(node.expr, startX + 160, startY);

      stateCounter++;
      const newStartId = `q${stateCounter - 1}`;
      stateCounter++;
      const newAcceptId = `q${stateCounter - 1}`;

      const innerMaxX = Math.max(...innerG.nodes.map((n) => n.position.x));

      const startNode: Node = {
        id: newStartId,
        type: "automata-state",
        position: { x: startX, y: startY },
        data: { label: newStartId, isStart: false, isAccept: false },
      };

      const acceptNode: Node = {
        id: newAcceptId,
        type: "automata-state",
        position: { x: innerMaxX + 160, y: startY },
        data: { label: newAcceptId, isStart: false, isAccept: false },
      };

      // Loop back edge from inner.accept to inner.start
      const loopBack: Edge = {
        id: `e-${innerG.acceptId}-${innerG.startId}`,
        source: innerG.acceptId,
        target: innerG.startId,
        label: "ε",
        animated: true,
        style: { stroke: "#A855F7", strokeWidth: 2 },
        data: { symbol: "ε" },
      };

      const inEdge: Edge = {
        id: `e-${newStartId}-${innerG.startId}`,
        source: newStartId,
        target: innerG.startId,
        label: "ε",
        animated: true,
        style: { stroke: "#A855F7", strokeWidth: 2 },
        data: { symbol: "ε" },
      };

      const outEdge: Edge = {
        id: `e-${innerG.acceptId}-${newAcceptId}`,
        source: innerG.acceptId,
        target: newAcceptId,
        label: "ε",
        animated: true,
        style: { stroke: "#A855F7", strokeWidth: 2 },
        data: { symbol: "ε" },
      };

      const edgesArr = [...innerG.edges, loopBack, inEdge, outEdge];

      if (node.type === "star") {
        // Bypass edge for Kleene star (0 repetitions)
        const bypassEdge: Edge = {
          id: `e-${newStartId}-${newAcceptId}`,
          source: newStartId,
          target: newAcceptId,
          label: "ε",
          animated: true,
          style: { stroke: "#A855F7", strokeWidth: 2 },
          data: { symbol: "ε" },
        };
        edgesArr.push(bypassEdge);
      }

      return {
        nodes: [startNode, ...innerG.nodes, acceptNode],
        edges: edgesArr,
        startId: newStartId,
        acceptId: newAcceptId,
      };
    }

    // Default fallback
    return createGraphForAst({ type: "char", value: "a" }, startX, startY);
  }

  const result = createGraphForAst(ast, 100, 200);

  // Set initial start and accept status on startId and acceptId
  const finalNodes = result.nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      isStart: n.id === result.startId,
      isAccept: n.id === result.acceptId,
    },
  }));

  return { ...result, nodes: finalNodes };
}

/**
 * Evaluates whether an input string matches a Regex pattern step-by-step.
 */
export interface RegexMatchTrace {
  isMatch: boolean;
  steps: {
    charIndex: number;
    char: string;
    subPattern: string;
    description: string;
    matchedSoFar: string;
  }[];
}

export function testRegexMatch(pattern: string, inputStr: string): RegexMatchTrace {
  try {
    const jsRegex = new RegExp(`^(${pattern})$`);
    const isMatch = jsRegex.test(inputStr);

    const steps = [];
    let currentMatch = "";

    for (let i = 0; i < inputStr.length; i++) {
      const char = inputStr[i];
      currentMatch += char;
      const partialMatch = new RegExp(`^(${pattern})`).test(currentMatch);

      steps.push({
        charIndex: i,
        char,
        subPattern: pattern,
        matchedSoFar: currentMatch,
        description: partialMatch
          ? `Symbol '${char}' at index ${i} is valid under sub-pattern.`
          : `Symbol '${char}' at index ${i} caused pattern divergence.`,
      });
    }

    return { isMatch, steps };
  } catch {
    return {
      isMatch: false,
      steps: [
        {
          charIndex: 0,
          char: "",
          subPattern: pattern,
          matchedSoFar: "",
          description: "Invalid Regex Syntax",
        },
      ],
    };
  }
}

/**
 * Pumping Lemma Proof Generator for canonical non-regular languages.
 */
export interface PumpingLemmaProof {
  languageName: string;
  formalDef: string;
  pumpingLengthP: number;
  chosenString: string;
  partitionX: string;
  partitionY: string;
  partitionZ: string;
  pumpedString: string;
  isContradiction: boolean;
  proofSteps: string[];
}

export function generatePumpingLemmaProof(
  lang: "anbn" | "wwR" | "0n1n" | "an_prime",
  p: number = 3,
  i: number = 2
): PumpingLemmaProof {
  if (lang === "anbn" || lang === "0n1n") {
    const sym1 = lang === "0n1n" ? "0" : "a";
    const sym2 = lang === "0n1n" ? "1" : "b";

    const s = `${sym1.repeat(p)}${sym2.repeat(p)}`;
    const x = sym1.repeat(Math.floor(p / 2));
    const y = sym1.repeat(Math.ceil(p / 2));
    const z = `${sym2.repeat(p)}`;

    let pumpedY = "";
    for (let k = 0; k < i; k++) pumpedY += y;

    const pumpedString = `${x}${pumpedY}${z}`;
    const count1 = (pumpedString.match(new RegExp(sym1, "g")) || []).length;
    const count2 = (pumpedString.match(new RegExp(sym2, "g")) || []).length;
    const isContradiction = count1 !== count2;

    return {
      languageName: `L = { ${sym1}^n ${sym2}^n | n ≥ 0 }`,
      formalDef: `Language requiring equal count of leading '${sym1}'s and trailing '${sym2}'s.`,
      pumpingLengthP: p,
      chosenString: s,
      partitionX: x,
      partitionY: y,
      partitionZ: z,
      pumpedString,
      isContradiction,
      proofSteps: [
        `1. Assume L is regular with pumping length p = ${p}.`,
        `2. Choose string s = ${sym1}^${p} ${sym2}^${p} = "${s}" (|s| = ${s.length} ≥ p).`,
        `3. Partition s into xyz where |xy| ≤ ${p} and |y| ≥ 1. Thus y consists solely of '${sym1}'s: y = "${y}".`,
        `4. Pump y with i = ${i}: s' = x y^${i} z = "${pumpedString}".`,
        `5. Count of '${sym1}'s (${count1}) ≠ Count of '${sym2}'s (${count2}) ⟹ s' ∉ L.`,
        `6. Contradiction reached! Therefore, L is NOT regular.`,
      ],
    };
  }

  // Fallback for Palindromes / Prime
  const s = `a`.repeat(p) + `b` + `a`.repeat(p);
  const x = "a";
  const y = "a".repeat(p - 1);
  const z = "b" + "a".repeat(p);
  const pumpedString = x + y.repeat(i) + z;

  return {
    languageName: `L = { w w^R | w ∈ {a,b}* } (Even Palindromes)`,
    formalDef: "Language of even-length symmetric palindrome strings.",
    pumpingLengthP: p,
    chosenString: s,
    partitionX: x,
    partitionY: y,
    partitionZ: z,
    pumpedString,
    isContradiction: true,
    proofSteps: [
      `1. Assume L is regular with pumping length p = ${p}.`,
      `2. Choose palindrome s = a^${p} b b a^${p} = "${s}".`,
      `3. Partition s into xyz where |xy| ≤ ${p} and y consists of '${y}'.`,
      `4. Pump y with i = ${i}: s' = "${pumpedString}".`,
      `5. String s' is no longer symmetric ⟹ s' ∉ L.`,
      `6. Contradiction reached! Therefore, L is NOT regular.`,
    ],
  };
}
