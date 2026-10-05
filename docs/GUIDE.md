# LogicVerse Master Theory Guide

Welcome to the **LogicVerse Discrete Mathematics & Theoretical Computer Science Documentation Suite**.

This master guide links all formal theory manuals across LogicVerse domains.

---

## 📚 Table of Contents & Domain Manuals

| Section | Domain Title | Guide Document | Core Theoretical Concepts Covered |
|---|---|---|---|
| **01** | **Set Theory & Foundations** | [`SET_THEORY_GUIDE.md`](file:///c:/logicverse-v0.1-foundation/docs/SET_THEORY_GUIDE.md) | Roster / Set-builder notation, Set operations, 2-Set & 3-Set Venn diagrams, Principle of Inclusion-Exclusion (PIE), Cantor's Diagonalization proof. |
| **02** | **Propositional Logic** | [`LOGIC_THEORY_GUIDE.md`](file:///c:/logicverse-v0.1-foundation/docs/LOGIC_THEORY_GUIDE.md) | Well-Formed Formulas (WFF), Truth table generators, Tautologies, De Morgan's laws, Satisfiability (SAT), Mathematical Induction proofs. |
| **03** | **Relations & Functions** | [`RELATIONS_FUNCTIONS_GUIDE.md`](file:///c:/logicverse-v0.1-foundation/docs/RELATIONS_FUNCTIONS_GUIDE.md) | Binary relation matrices, Reflexive/Symmetric/Transitive properties, Warshall's transitive closure algorithm, Hasse diagrams (Posets), Function injections/surjections/bijections. |
| **04** | **Finite Automata** | [`AUTOMATA_THEORY_GUIDE.md`](file:///c:/logicverse-v0.1-foundation/docs/AUTOMATA_THEORY_GUIDE.md) | 5-tuple FA formalization, DFA, NFA, $\varepsilon$-NFA, Subset Construction, Hopcroft DFA minimization algorithm, Moore & Mealy transducers. |
| **05** | **Regular Expressions** | [`REGEX_THEORY_GUIDE.md`](file:///c:/logicverse-v0.1-foundation/docs/REGEX_THEORY_GUIDE.md) | Formal regex grammar, Thompson's Construction, State Elimination Algorithm, Arden's Theorem, Brzozowski Derivatives, Pumping Lemma proofs, Myhill-Nerode theorem. |
| **06** | **Context-Free Grammar** | [`CFG_THEORY_GUIDE.md`](file:///c:/logicverse-v0.1-foundation/docs/CFG_THEORY_GUIDE.md) | 4-tuple CFG grammar $G=(V,\Sigma,R,S)$, Parse trees & derivations, Ambiguity, Chomsky Normal Form (CNF) conversion, CYK parsing algorithm, Pumping Lemma for CFLs. |
| **07** | **Pushdown Automata (PDA)** | [`PDA_THEORY_GUIDE.md`](file:///c:/logicverse-v0.1-foundation/docs/PDA_THEORY_GUIDE.md) | 7-tuple PDA $M=(Q,\Sigma,\Gamma,\delta,q_0,Z_0,F)$, Stack Push/Pop/No-op operations, Acceptance by Final State vs Empty Stack, Deterministic (DPDA) vs Nondeterministic (NPDA). |
| **08** | **Turing Machines (TM)** | [`TURING_MACHINE_GUIDE.md`](file:///c:/logicverse-v0.1-foundation/docs/TURING_MACHINE_GUIDE.md) | 7-tuple TM $M=(Q,\Sigma,\Gamma,\delta,q_0,B,F)$, Infinite 2-way tape memory, Head read/write & motion ($L,R,S$), Binary Incrementer, Decidability & Halting Problem ($A_{TM}$). |
| **09** | **AI Assistant & Tutor** | [`AI_TUTOR_GUIDE.md`](file:///c:/logicverse-v0.1-foundation/docs/AI_TUTOR_GUIDE.md) | Context-aware AI Assistant, Canvas topology inspection, Step-by-step trace explanations, Proof hints, Tautology verifier, Interactive pedagogical tutoring. |

---

## 🚀 Interactive Application Integration

All theory guides are directly backed by the **LogicVerse Web Application** interactive canvas engine:
- **Empty Canvas Startup**: Clean workspace on load and module switch for customizable design.
- **Context-Sensitive Palettes**: Instant toolbars with clear canvas controls, custom node creators, and quick operator shortcuts.
- **Reactive Output Panel**: Live evaluation, multi-step simulation traces, LaTeX formulas, and Markdown report export.

---

## 🏁 Full-Domain Release Readiness
- All 8 Discrete Mathematics & Automata domains fully integrated.
- 100% test pass rate across unit engines and LogicAI Chatbot prompt suites.
- Production build verified (`npm run build`).
