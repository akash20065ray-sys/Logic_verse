# Regular Expressions (Regex) in Theory of Computation

Welcome to the **LogicVerse Regular Expressions (Regex) Module**. This guide provides a comprehensive mathematical, theoretical, and algorithmic breakdown of Regular Expressions, their equivalence to Finite Automata, and fundamental theorems of Formal Language Theory.

---

## 1. Formal Definition & Alphabet $\Sigma$

A **Regular Expression (RE)** over an alphabet $\Sigma$ is a formal notation used to specify a **Regular Language** $L(R) \subseteq \Sigma^*$.

### Primitive Regular Expressions (Base Cases):
1. **Empty Set ($\emptyset$)**: Represents the empty language $L(\emptyset) = \{\}$.
2. **Empty String ($\varepsilon$)**: Represents the language containing only the empty string $L(\varepsilon) = \{\varepsilon\}$.
3. **Symbol ($a \in \Sigma$)**: Represents the singleton language $L(a) = \{a\}$.

### Recursive Operators & Semantics (Inductive Step):
If $R_1$ and $R_2$ are regular expressions denoting languages $L(R_1)$ and $L(R_2)$:
- **Union / Alternation ($R_1 | R_2$ or $R_1 + R_2$)**:
  $$L(R_1 + R_2) = L(R_1) \cup L(R_2)$$
- **Concatenation ($R_1 \cdot R_2$ or $R_1 R_2$)**:
  $$L(R_1 R_2) = \{ w_1 w_2 \mid w_1 \in L(R_1) \text{ and } w_2 \in L(R_2) \}$$
- **Kleene Star ($R^*$)**: Zero or more repetitions:
  $$L(R^*) = \bigcup_{i=0}^{\infty} L(R)^i \quad \text{where } L(R)^0 = \{\varepsilon\}$$
- **Kleene Plus ($R^+$)**: One or more repetitions ($R^+ = R R^*$):
  $$L(R^+) = \bigcup_{i=1}^{\infty} L(R)^i$$
- **Optional ($R?$)**: Zero or one repetition ($R? = \varepsilon + R$):
  $$L(R?) = \{\varepsilon\} \cup L(R)$$

### Operator Precedence Hierarchy:
1. **Parentheses `()`**: Highest precedence (overrides standard order).
2. **Kleene Closure `*` / `+` / `?`**: Postfix unary operators.
3. **Concatenation `·`**: Implicit or explicit binary operator.
4. **Union `+` / `|`**: Lowest precedence binary operator.

---

## 2. Converting Regex to NFA: Thompson's Construction Algorithm

**Thompson's Construction** converts any regular expression $R$ into an equivalent $\varepsilon$-NFA $N(R)$ with **exactly one start state** and **exactly one final state**.

### Structural Automata Snippets:
1. **Symbol $a$**:
   $$q_0 \xrightarrow{a} q_1$$
2. **Union ($R_1 + R_2$)**:
   - Create new start state $q_{start}$ with $\varepsilon$-transitions to $N(R_1).start$ and $N(R_2).start$.
   - Create new accept state $q_{accept}$ with $\varepsilon$-transitions from $N(R_1).accept$ and $N(R_2).accept$.
3. **Concatenation ($R_1 R_2$)**:
   - Join $N(R_1).accept \xrightarrow{\varepsilon} N(R_2).start$.
4. **Kleene Star ($R^*$)**:
   - Create new $q_{start}$ and $q_{accept}$.
   - Add $\varepsilon$-transitions: $q_{start} \to N(R).start$, $N(R).accept \to N(R).start$, $N(R).accept \to q_{accept}$, and bypass $q_{start} \to q_{accept}$.

---

## 3. Converting Automata to Regex: State Elimination & Arden's Theorem

### State Elimination Algorithm:
1. Add a single start state $q_s$ with $\varepsilon$-transition to the old start state.
2. Add a single accept state $q_f$ with $\varepsilon$-transitions from all old accept states.
3. For each intermediate state $q_k$, eliminate $q_k$ by updating transition labels between every pair $q_i \to q_j$:
   $$R_{ij}^{\text{new}} = R_{ij} + R_{ik} \cdot (R_{kk})^* \cdot R_{kj}$$
4. When only $q_s$ and $q_f$ remain, the label on $q_s \to q_f$ is the final Regex.

### Arden's Theorem:
If $P$ and $Q$ are two regular expressions over $\Sigma$ and $\varepsilon \notin L(P)$, then the equation:
$$R = Q + R P$$
has the **unique solution**:
$$R = Q P^*$$

---

## 4. Brzozowski Derivatives & Direct Regex Evaluation

The **Brzozowski Derivative** of a regular expression $R$ with respect to a symbol $a \in \Sigma$, denoted $\frac{d}{da}(R)$, is the regular expression accepting $\{ w \mid aw \in L(R) \}$.

### Derivative Rules:
- $\frac{d}{da}(\varepsilon) = \emptyset$
- $\frac{d}{da}(\emptyset) = \emptyset$
- $\frac{d}{da}(a) = \varepsilon$
- $\frac{d}{da}(b) = \emptyset \quad (b \neq a)$
- $\frac{d}{da}(R_1 + R_2) = \frac{d}{da}(R_1) + \frac{d}{da}(R_2)$
- $\frac{d}{da}(R_1 R_2) = \frac{d}{da}(R_1) R_2 + \delta(R_1) \frac{d}{da}(R_2)$ where $\delta(R_1) = \varepsilon$ if $\varepsilon \in L(R_1)$ else $\emptyset$.
- $\frac{d}{da}(R^*) = \frac{d}{da}(R) R^*$

Using derivatives, string acceptance $w = a_1 a_2 \dots a_n \in L(R)$ can be computed by evaluating:
$$\varepsilon \in L\left( \frac{d}{da_n} \dots \frac{d}{da_2} \frac{d}{da_1} (R) \right)$$

---

## 5. Pumping Lemma for Regular Languages

Used to **prove that a language $L$ is NOT regular** by contradiction.

### Statement:
If $L$ is a regular language, then there exists an integer constant $p \ge 1$ (pumping length) such that every string $s \in L$ with $|s| \ge p$ can be written as $s = xyz$ satisfying:
1. $|xy| \le p$
2. $|y| \ge 1$
3. $\forall i \ge 0, \quad x y^i z \in L$

### Canonical Proof Example ($L = \{ a^n b^n \mid n \ge 0 \}$):
1. Assume $L$ is regular. Let $p$ be its pumping length.
2. Choose string $s = a^p b^p \in L$, where $|s| = 2p \ge p$.
3. By condition 1, $xy$ lies entirely within the initial $a^p$ block ($xy = a^k$ for $k \le p$).
4. Since $|y| \ge 1$, $y = a^m$ for some $m \ge 1$.
5. Pump $y$ with $i = 2$: $x y^2 z = a^{p+m} b^p$.
6. Since $m \ge 1$, $p + m \neq p$, so $x y^2 z \notin L$, contradicting the Pumping Lemma!
7. Therefore, $L$ is **not regular**.

---

## 6. Myhill-Nerode Theorem

The **Myhill-Nerode Theorem** provides a necessary and sufficient condition for a language $L$ to be regular based on equivalence classes.

### Right Congruence Relation ($\sim_L$):
Two strings $x, y \in \Sigma^*$ are **distinguishable** with respect to $L$ if $\exists z \in \Sigma^*$ such that:
$$(xz \in L \text{ and } yz \notin L) \quad \text{or} \quad (xz \notin L \text{ and } yz \in L)$$
If no such distinguishing extension $z$ exists, $x \sim_L y$.

### Theorem Statement:
A language $L$ is regular **if and only if** the number of equivalence classes of $\sim_L$ (the index of $\sim_L$) is **finite**.

### Connection to DFA Minimization:
The number of equivalence classes of $\sim_L$ is **exactly equal** to the number of states in the minimal DFA accepting $L$!

---

## 7. Interactive LogicVerse Regex Tooling

The **LogicVerse Regex Module** features:
1. **Regex Builder & Live Tester**: Interactive expression bar with instant string simulation & AST visualizer.
2. **RE $\to$ NFA Converter**: Automatic Thompson's Construction graph generation on canvas.
3. **Pumping Lemma Inspector**: Interactive proof visualizer for non-regular languages ($a^n b^n$, $w w^R$, $0^n 1^n$).
4. **Myhill-Nerode Analyzer**: Equivalence class matrix generator.
