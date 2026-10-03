import type { LogicAST, LogicBinaryOp, LogicUnaryOp } from "./propositional-logic";

type TokenType =
  | "VAR"
  | "CONST"
  | "NOT"
  | "AND"
  | "OR"
  | "XOR"
  | "IMPLIES"
  | "IFF"
  | "LPAREN"
  | "RPAREN"
  | "EOF";

interface Token {
  type: TokenType;
  value: string;
}

// 1. Tokenizer
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (ch === "(") {
      tokens.push({ type: "LPAREN", value: "(" });
      i++;
      continue;
    }

    if (ch === ")") {
      tokens.push({ type: "RPAREN", value: ")" });
      i++;
      continue;
    }

    // Negation: ¬, ~, !
    if (ch === "¬" || ch === "~" || ch === "!") {
      tokens.push({ type: "NOT", value: "¬" });
      i++;
      continue;
    }

    // Conjunction: ∧, &&, &
    if (ch === "∧" || (ch === "&" && input[i + 1] === "&")) {
      tokens.push({ type: "AND", value: "∧" });
      i += ch === "∧" ? 1 : 2;
      continue;
    }
    if (ch === "&") {
      tokens.push({ type: "AND", value: "∧" });
      i++;
      continue;
    }

    // Disjunction: ∨, ||, |
    if (ch === "∨" || (ch === "|" && input[i + 1] === "|")) {
      tokens.push({ type: "OR", value: "∨" });
      i += ch === "∨" ? 1 : 2;
      continue;
    }
    if (ch === "|") {
      tokens.push({ type: "OR", value: "∨" });
      i++;
      continue;
    }

    // Biconditional: ↔, <->, <=>
    if (
      ch === "↔" ||
      (ch === "<" && input.slice(i, i + 3) === "<->") ||
      (ch === "<" && input.slice(i, i + 3) === "<=>")
    ) {
      tokens.push({ type: "IFF", value: "↔" });
      i += ch === "↔" ? 1 : 3;
      continue;
    }

    // Implication: →, ->, =>
    if (
      ch === "→" ||
      (ch === "-" && input[i + 1] === ">") ||
      (ch === "=" && input[i + 1] === ">")
    ) {
      tokens.push({ type: "IMPLIES", value: "→" });
      i += ch === "→" ? 1 : 2;
      continue;
    }

    // XOR: ⊕, ^
    if (ch === "⊕" || ch === "^") {
      tokens.push({ type: "XOR", value: "⊕" });
      i++;
      continue;
    }

    // Text symbols: "xor", "and", "or", "not", "true", "false", or Variable names
    if (/[a-zA-Z_]/.test(ch)) {
      let word = "";
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
        word += input[i];
        i++;
      }
      const lower = word.toLowerCase();
      if (lower === "not") tokens.push({ type: "NOT", value: "¬" });
      else if (lower === "and") tokens.push({ type: "AND", value: "∧" });
      else if (lower === "or") tokens.push({ type: "OR", value: "∨" });
      else if (lower === "xor") tokens.push({ type: "XOR", value: "⊕" });
      else if (lower === "implies") tokens.push({ type: "IMPLIES", value: "→" });
      else if (lower === "iff") tokens.push({ type: "IFF", value: "↔" });
      else if (lower === "true" || word === "⊤") tokens.push({ type: "CONST", value: "true" });
      else if (lower === "false" || word === "⊥") tokens.push({ type: "CONST", value: "false" });
      else tokens.push({ type: "VAR", value: word.toUpperCase() });
      continue;
    }

    // Constant symbols
    if (ch === "⊤" || ch === "1") {
      tokens.push({ type: "CONST", value: "true" });
      i++;
      continue;
    }
    if (ch === "⊥" || ch === "0") {
      tokens.push({ type: "CONST", value: "false" });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: '${ch}' at index ${i}`);
  }

  tokens.push({ type: "EOF", value: "" });
  return tokens;
}

// 2. Precedence Parser (Pratt / Operator Precedence)
export function parseExpression(input: string): LogicAST {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Expression cannot be empty.");
  }

  const tokens = tokenize(trimmed);
  let pos = 0;

  function peek(): Token {
    return tokens[pos];
  }

  function consume(expected?: TokenType): Token {
    const t = peek();
    if (expected && t.type !== expected) {
      throw new Error(`Expected token '${expected}', got '${t.type}' (${t.value})`);
    }
    pos++;
    return t;
  }

  // Precedence levels:
  // 1: IFF (↔)
  // 2: IMPLIES (→)
  // 3: OR (∨), XOR (⊕)
  // 4: AND (∧)
  // 5: NOT (¬)
  function parsePrimary(): LogicAST {
    const t = peek();

    if (t.type === "NOT") {
      consume("NOT");
      const operand = parsePrimary();
      return { type: "unary", op: "¬" as LogicUnaryOp, operand };
    }

    if (t.type === "LPAREN") {
      consume("LPAREN");
      const expr = parseEquivalence();
      consume("RPAREN");
      return expr;
    }

    if (t.type === "CONST") {
      consume("CONST");
      return { type: "const", value: t.value === "true" };
    }

    if (t.type === "VAR") {
      consume("VAR");
      return { type: "var", name: t.value };
    }

    throw new Error(`Unexpected token '${t.value || t.type}'`);
  }

  function parseAnd(): LogicAST {
    let left = parsePrimary();
    while (peek().type === "AND") {
      consume("AND");
      const right = parsePrimary();
      left = { type: "binary", op: "∧" as LogicBinaryOp, left, right };
    }
    return left;
  }

  function parseOrXor(): LogicAST {
    let left = parseAnd();
    while (peek().type === "OR" || peek().type === "XOR") {
      const opToken = consume();
      const op = (opToken.value === "⊕" ? "⊕" : "∨") as LogicBinaryOp;
      const right = parseAnd();
      left = { type: "binary", op, left, right };
    }
    return left;
  }

  function parseImplies(): LogicAST {
    let left = parseOrXor();
    // Implication is right-associative: P -> Q -> R == P -> (Q -> R)
    if (peek().type === "IMPLIES") {
      consume("IMPLIES");
      const right = parseImplies();
      return { type: "binary", op: "→" as LogicBinaryOp, left, right };
    }
    return left;
  }

  function parseEquivalence(): LogicAST {
    let left = parseImplies();
    while (peek().type === "IFF") {
      consume("IFF");
      const right = parseImplies();
      left = { type: "binary", op: "↔" as LogicBinaryOp, left, right };
    }
    return left;
  }

  const ast = parseEquivalence();
  if (peek().type !== "EOF") {
    throw new Error(`Unexpected trailing input: '${peek().value}'`);
  }
  return ast;
}
