# Propositional Logic & Mathematical Induction

Welcome to the **LogicVerse Propositional Logic Guide**. This guide covers Well-Formed Formulas (WFF), truth tables, logical equivalences, satisfiability (SAT), and mathematical induction.

---

## 1. Propositional Variables & Logical Operators

A **proposition** is a declarative statement that is either True ($T / 1$) or False ($F / 0$).

### Core Operators:
1. **Negation ($\neg A$)**: Truth value flipped.
2. **Conjunction ($A \land B$)**: True iff both $A$ and $B$ are True.
3. **Disjunction ($A \lor B$)**: True iff at least one of $A$ or $B$ is True.
4. **Exclusive OR ($A \oplus B$)**: True iff exactly one of $A$ or $B$ is True.
5. **Conditional / Implication ($A \to B$)**: False iff $A$ is True and $B$ is False ($\neg A \lor B$).
6. **Biconditional / Equivalence ($A \leftrightarrow B$)**: True iff $A$ and $B$ have identical truth values.

---

## 2. Truth Tables & Classification

A truth table lists all $2^n$ possible assignments for $n$ propositional variables.

### WFF Classification:
- **Tautology**: True under **all** variable assignments (e.g. $A \lor \neg A$).
- **Contradiction**: False under **all** variable assignments (e.g. $A \land \neg A$).
- **Contingency**: True under some assignments and False under others.

---

## 3. Fundamental Logical Equivalences

Two formulas $P$ and $Q$ are logically equivalent ($P \equiv Q$) iff $P \leftrightarrow Q$ is a tautology.

- **De Morgan's Laws**:
  $$\neg (A \land B) \equiv \neg A \lor \neg B$$
  $$\neg (A \lor B) \equiv \neg A \land \neg B$$
- **Distributive Laws**:
  $$A \land (B \lor C) \equiv (A \land B) \lor (A \land C)$$
  $$A \lor (B \land C) \equiv (A \lor B) \land (A \lor C)$$
- **Contrapositive**:
  $$A \to B \equiv \neg B \to \neg A$$

---

## 4. Mathematical Induction

Used to prove that a predicate $P(n)$ is true for all integers $n \ge n_0$.

1. **Base Step**: Prove $P(n_0)$ is true.
2. **Inductive Hypothesis**: Assume $P(k)$ holds for an arbitrary $k \ge n_0$.
3. **Inductive Step**: Show that $P(k) \implies P(k+1)$ holds.
4. **Conclusion**: By Principle of Mathematical Induction, $P(n)$ holds $\forall n \ge n_0$.
