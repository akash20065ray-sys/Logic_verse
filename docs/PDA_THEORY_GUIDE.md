# Pushdown Automata (PDA) & Stack Memory Theory

Welcome to the **LogicVerse Pushdown Automata (PDA) Module**. This guide provides a formal mathematical, architectural, and algorithmic breakdown of Pushdown Automata, Stack Memory operations, Context-Free Language acceptance, and Determinism vs Nondeterminism in PDAs.

---

## 1. Formal 7-Tuple Definition of PDA

A **Pushdown Automaton (PDA)** $M$ is a finite state machine augmented with an unbounded **Last-In, First-Out (LIFO) Stack Memory**.

It is formally defined as a 7-tuple:
$$M = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$$

- **$Q$**: Finite set of internal states.
- **$\Sigma$**: Finite input alphabet.
- **$\Gamma$**: Finite **stack alphabet** (symbols allowed on stack).
- **$\delta$**: Transition function:
  $$\delta: Q \times (\Sigma \cup \{\varepsilon\}) \times \Gamma \to \mathcal{P}_{\text{finite}}(Q \times \Gamma^*)$$
  *(Reads current state $q$, optional input symbol $a$, pops top stack symbol $X$, and transitions to next state $p$ while pushing string $\gamma \in \Gamma^*$ onto the stack).*
- **$q_0 \in Q$**: Initial start state.
- **$Z_0 \in \Gamma$**: Initial bottom-of-stack marker symbol.
- **$F \subseteq Q$**: Set of accepting final states.

---

## 2. Transition Notation & Stack Operations

A PDA transition edge labeled $a, X / \gamma$ from state $q_i \to q_j$ specifies:
1. **Input symbol $a$**: Consumes $a \in \Sigma$ (or $\varepsilon$ for spontaneous moves).
2. **Pop symbol $X$**: Removes top symbol $X \in \Gamma$ from stack.
3. **Push string $\gamma$**: Pushes string $\gamma \in \Gamma^*$ onto stack top.

### Common Stack Actions ($\gamma$):
- **Push Symbol $A$ ($X \to A X$)**: Top stack symbol $X$ is replaced by $AX$ (net addition of $A$).
- **Pop Symbol ($\gamma = \varepsilon$)**: Top stack symbol $X$ is removed (net deletion).
- **No-Op / Retain ($X \to X$)**: Top stack symbol $X$ remains unchanged.

---

## 3. Modes of Language Acceptance

A PDA can accept an input string $w \in \Sigma^*$ in two equivalent ways:

### 1. Acceptance by Final State ($L(M)$):
$$L(M) = \{ w \in \Sigma^* \mid (q_0, w, Z_0) \vdash^* (q_f, \varepsilon, \gamma) \text{ where } q_f \in F \}$$
The input is entirely consumed and the machine stops in an accepting state $q_f \in F$, regardless of stack contents.

### 2. Acceptance by Empty Stack ($N(M)$):
$$N(M) = \{ w \in \Sigma^* \mid (q_0, w, Z_0) \vdash^* (q, \varepsilon, \varepsilon) \text{ for any } q \in Q \}$$
The input is entirely consumed and the stack becomes completely empty $\varepsilon$.

### Equivalence Theorem:
A language $L$ is accepted by a PDA by final state **if and only if** $L$ is accepted by a PDA by empty stack:
$$L(M_{final}) \iff N(M_{empty}) \iff L \text{ is a Context-Free Language (CFL)}$$

---

## 4. Deterministic vs Nondeterministic PDAs

- **DPDA (Deterministic PDA)**: At most one valid transition exists for any configuration $(q, a, X)$, and if $\delta(q, \varepsilon, X) \neq \emptyset$, then $\delta(q, a, X) = \emptyset$ for all $a \in \Sigma$.
- **NPDA (Nondeterministic PDA)**: May have multiple choice transitions for $(q, a, X)$.

### Critical Power Distinction:
Unlike Finite Automata (where DFA $\equiv$ NFA), **Nondeterministic PDAs are strictly more powerful than Deterministic PDAs**!
- $L_{\text{palindromes}} = \{ w w^R \mid w \in \{a,b\}^* \}$ is accepted by an **NPDA**, but **cannot** be recognized by any DPDA.

---

## 5. Canonical PDA Example ($L = \{ a^n b^n \mid n \ge 1 \}$)

1. **State $q_0$ (Start / Reading $a$'s)**:
   - Read 'a', pop $Z_0$, push $A Z_0$: $\delta(q_0, a, Z_0) \to (q_0, A Z_0)$.
   - Read 'a', pop $A$, push $A A$: $\delta(q_0, a, A) \to (q_0, A A)$.
2. **Transition $q_0 \to q_1$ (Switch to $b$'s)**:
   - Read 'b', pop $A$, push $\varepsilon$: $\delta(q_0, b, A) \to (q_1, \varepsilon)$.
3. **State $q_1$ (Popping $b$'s)**:
   - Read 'b', pop $A$, push $\varepsilon$: $\delta(q_1, b, A) \to (q_1, \varepsilon)$.
4. **Acceptance Transition $q_1 \to q_f$**:
   - Read $\varepsilon$, pop $Z_0$, push $Z_0$: $\delta(q_1, \varepsilon, Z_0) \to (q_f, Z_0)$ where $q_f \in F$.
