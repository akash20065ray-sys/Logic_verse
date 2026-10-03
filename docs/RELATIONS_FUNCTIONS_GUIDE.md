# Relations, Functions & Order Theory

Welcome to the **LogicVerse Relations & Functions Guide**. This guide covers binary relations, relation matrices, Warshall's algorithm, Hasse diagrams, posets, and function properties.

---

## 1. Binary Relations & Representation

A **Binary Relation $R$** from set $A$ to set $B$ is a subset of the Cartesian product $R \subseteq A \times B$.

### Relation Matrix Representation ($M_R$):
For sets $A = \{a_1, \dots, a_n\}$ and $B = \{b_1, \dots, b_m\}$, $M_R$ is an $n \times m$ boolean matrix where:
$$M_R[i, j] = \begin{cases} 1 & \text{if } (a_i, b_j) \in R \\ 0 & \text{if } (a_i, b_j) \notin R \end{cases}$$

---

## 2. Properties of Relations on a Set $A$

- **Reflexive**: $\forall x \in A, \quad (x, x) \in R$.
- **Symmetric**: $\forall x, y \in A, \quad (x, y) \in R \implies (y, x) \in R$.
- **Anti-Symmetric**: $\forall x, y \in A, \quad ((x, y) \in R \land (y, x) \in R) \implies x = y$.
- **Transitive**: $\forall x, y, z \in A, \quad ((x, y) \in R \land (y, z) \in R) \implies (x, z) \in R$.

---

## 3. Transitive Closure & Warshall's Algorithm

The **Transitive Closure $R^*$** is the smallest transitive relation containing $R$.

### Warshall's Algorithm:
Given boolean relation matrix $W = M_R$:
$$\text{For } k = 1 \dots n:$$
$$\text{For } i = 1 \dots n:$$
$$\text{For } j = 1 \dots n:$$
$$W[i, j] = W[i, j] \lor (W[i, k] \land W[k, j])$$

Time complexity: $\mathcal{O}(n^3)$.

---

## 4. Partial Orders & Hasse Diagrams

A relation $R$ on set $S$ is a **Partial Order (Poset $(S, \preceq)$)** if $R$ is Reflexive, Anti-Symmetric, and Transitive.

### Hasse Diagram Construction:
1. Draw relation directed graph.
2. Remove all self-loops (reflexivity).
3. Remove all transitive edges (e.g. if $x \to y$ and $y \to z$, remove $x \to z$).
4. Arrange vertices so that $x$ is placed lower than $y$ whenever $x \prec y$, drawing undirected upward edges.

---

## 5. Functions & Properties

A **Function $f: A \to B$** assigns to each element $x \in A$ exactly one element $f(x) \in B$.

- **Injective (One-to-One)**: $f(x_1) = f(x_2) \implies x_1 = x_2$.
- **Surjective (Onto)**: Range equal to codomain ($\forall y \in B, \exists x \in A, f(x) = y$).
- **Bijective**: Both Injective and Surjective. A bijection $f$ possesses a unique inverse function $f^{-1}: B \to A$.
