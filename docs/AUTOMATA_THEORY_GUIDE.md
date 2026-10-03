# Finite Automata & Transducers

Welcome to the **LogicVerse Automata Theory Guide**. This guide covers Deterministic Finite Automata (DFA), Nondeterministic Finite Automata (NFA), $\varepsilon$-NFA conversion, Hopcroft DFA Minimization, and Transducers (Moore & Mealy Machines).

---

## 1. Formal 5-Tuple Definition

A **Finite Automaton** $M$ is defined as a 5-tuple:
$$M = (Q, \Sigma, \delta, q_0, F)$$
- $Q$: Finite set of states.
- $\Sigma$: Input alphabet.
- $\delta$: Transition function.
- $q_0 \in Q$: Initial start state.
- $F \subseteq Q$: Set of final / accepting states.

---

## 2. DFA vs NFA vs $\varepsilon$-NFA

1. **DFA (Deterministic)**: Transition function $\delta: Q \times \Sigma \to Q$ is deterministic and total. For every state $q$ and symbol $a$, exactly 1 next state exists.
2. **NFA (Nondeterministic)**: Transition function $\delta: Q \times \Sigma \to \mathcal{P}(Q)$ maps to a set of next states.
3. **$\varepsilon$-NFA**: Transition function $\delta: Q \times (\Sigma \cup \{\varepsilon\}) \to \mathcal{P}(Q)$ permits spontaneous transitions without consuming input.

---

## 3. Subset Construction Algorithm ($\varepsilon$-NFA $\to$ NFA $\to$ DFA)

Converts any NFA into an equivalent DFA with states representing subsets of $Q$:
1. Compute $\varepsilon\text{-closure}(q_0)$ for initial DFA state $S_0$.
2. For each unvisited DFA state set $S \subseteq Q$ and symbol $a \in \Sigma$:
   $$S' = \varepsilon\text{-closure}\left( \bigcup_{q \in S} \delta(q, a) \right)$$
3. Mark $S'$ as accepting if $S' \cap F \neq \emptyset$.
4. Repeat until no new subset states are discovered.

---

## 4. DFA Minimization (Hopcroft's Algorithm)

Minimizes the number of states in a DFA while preserving language acceptance:
1. Split states into non-accepting group $P_0 = \{ Q \setminus F \}$ and accepting group $P_1 = \{ F \}$.
2. Refine partition $P$ iteratively: two states $p, q$ belong to the same group if $\forall a \in \Sigma$, $\delta(p, a)$ and $\delta(q, a)$ land in the same group of $P$.
3. Repeat until partition stabilizes. Merge equivalent state groups.

---

## 5. Transducers: Moore & Mealy Machines

Automata that produce output strings $\Delta^*$ in response to input.

### Moore Machine (State-Based Output):
Output depends only on the current state:
$$\lambda: Q \to \Delta$$

### Mealy Machine (Transition-Based Output):
Output depends on both current state and input symbol:
$$\lambda: Q \times \Sigma \to \Delta$$

### Equivalence & Conversion:
- Any Moore machine can be converted into a Mealy machine by copying state outputs onto incoming transition edges.
- Any Mealy machine can be converted into a Moore machine by splitting states $q$ into $(q, y_i)$ for each distinct incoming output symbol $y_i$.
