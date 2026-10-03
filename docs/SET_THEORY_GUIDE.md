# Set Theory & Foundations

Welcome to the **LogicVerse Set Theory Guide**. This guide provides a formal mathematical and algorithmic overview of Set Theory, set builder notation, operations, Venn diagrams, Inclusion-Exclusion, and Cantor's Diagonalization.

---

## 1. Fundamental Definitions

A **Set** is a well-defined collection of distinct objects, referred to as elements or members.

- **Roster Notation**: Listing elements explicitly between curly braces:
  $$A = \{2, 3, 5, 7, 11\}$$
- **Set-Builder Notation**: Defining elements by a characterizing property:
  $$A = \{ x \in \mathbb{Z}^+ \mid x \text{ is prime and } x \le 11 \}$$
- **Empty Set ($\emptyset$)**: The unique set containing no elements:
  $$\emptyset = \{\} \quad \text{where } |\emptyset| = 0$$
- **Universal Set ($U$)**: The domain containing all possible objects under consideration.

---

## 2. Fundamental Set Operations

Given sets $A, B \subseteq U$:

1. **Union ($A \cup B$)**:
   $$A \cup B = \{ x \mid x \in A \lor x \in B \}$$
2. **Intersection ($A \cap B$)**:
   $$A \cap B = \{ x \mid x \in A \land x \in B \}$$
3. **Difference ($A \setminus B$ or $A - B$)**:
   $$A \setminus B = \{ x \mid x \in A \land x \notin B \}$$
4. **Symmetric Difference ($A \Delta B$)**:
   $$A \Delta B = (A \setminus B) \cup (B \setminus A) = (A \cup B) \setminus (A \cap B)$$
5. **Absolute Complement ($A'$)**:
   $$A' = U \setminus A = \{ x \in U \mid x \notin A \}$$
6. **Power Set ($\mathcal{P}(A)$)**: The set of all subsets of $A$:
   $$\mathcal{P}(A) = \{ S \mid S \subseteq A \}$$
   If $|A| = n$, then $|\mathcal{P}(A)| = 2^n$.

---

## 3. Venn Diagrams & Set Inclusion

Venn diagrams visually represent sets as closed geometric regions within a rectangle denoting the universal set $U$.

- **2-Set Venn Diagram**: Splits space into 4 disjoint regions ($A \cap B$, $A \setminus B$, $B \setminus A$, $(A \cup B)'$).
- **3-Set Venn Diagram**: Splits space into 8 disjoint regions corresponding to combinations of $A, B, C$.

---

## 4. Principle of Inclusion-Exclusion (PIE)

PIE calculates the cardinality of the union of multiple overlapping finite sets.

### 2-Set Case:
$$|A \cup B| = |A| + |B| - |A \cap B|$$

### 3-Set Case:
$$|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|$$

---

## 5. Countability & Cantor's Diagonalization

- **Countably Infinite Set**: A set $S$ that can be placed in one-to-one correspondence with natural numbers $\mathbb{N}$ (cardinality $\aleph_0$). Examples: $\mathbb{Z}, \mathbb{Q}$.
- **Uncountably Infinite Set**: A set $S$ that cannot be mapped bijectively to $\mathbb{N}$ (cardinality $\mathfrak{c} = 2^{\aleph_0}$). Example: Real numbers $\mathbb{R}$.

### Cantor's Diagonal Argument (Uncountability of $\mathbb{R}$):
1. Assume the open interval $(0, 1)$ is countable and can be listed as a sequence $r_1, r_2, r_3, \dots$ in decimal expansion:
   $$r_1 = 0.d_{11} d_{12} d_{13} \dots$$
   $$r_2 = 0.d_{21} d_{22} d_{23} \dots$$
   $$r_3 = 0.d_{31} d_{32} d_{33} \dots$$
2. Construct a new number $x = 0.x_1 x_2 x_3 \dots$ by defining digit $x_k \neq d_{kk}$.
3. Number $x$ differs from every listed $r_k$ at the $k$-th decimal position.
4. Thus $x \in (0, 1)$ is not in the list, contradicting the claim that the list was complete.
5. Therefore, $(0, 1)$ and $\mathbb{R}$ are **uncountably infinite**.
