<div align="center">

# ⚡ LogicVerse
### Visual IDE & Algorithmic Simulation Engine for Discrete Mathematics & Automata Theory

[![Next.js 15](https://img.shields.io/badge/Next.js-15.0%2B-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-443e38?style=flat-square)](https://zustand-demo.pmnd.rs/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest%20Passed-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

<p align="center">
  <b>Build. Visualize. Simulate. Understand.</b><br/>
  An interactive, zero-latency visual IDE transforming abstract theoretical computer science into dynamic, inspectable computational models.
</p>

</div>

---

## 🌟 Executive Overview

**LogicVerse** bridges the gap between formal mathematical abstraction and practical visual intuition. It provides computer science students, researchers, and educators with a node-based topological canvas to construct discrete systems, simulate state transitions step-by-step, verify truth tables, inspect memory stacks, and interact with **LogicAI**—a context-aware pedagogical copilot.

```
                      ┌────────────────────────────────────────┐
                      │        Topological DAG Canvas          │
                      │  (Node Placement & Wire Interconnect)  │
                      └───────────────────┬────────────────────┘
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   ▼                                             ▼
     ┌────────────────────────────┐               ┌─────────────────────────────┐
     │  Discrete Mathematics Core │               │   Automata & Formal Grammars │
     ├────────────────────────────┤               ├─────────────────────────────┤
     │ • Boolean Propositional    │               │ • DFA / NFA State Machines  │
     │ • Dynamic Venn Partitioning│               │ • Pushdown Automata (PDA)   │
     │ • PIE Cardinality Solver   │               │ • Turing Machines (Tape MBR)│
     │ • Cantor Diagonalization   │               │ • Moore & Mealy Transducers │
     └────────────────────────────┘               └─────────────────────────────┘
                   │                                             │
                   └──────────────────────┬──────────────────────┘
                                          ▼
                      ┌────────────────────────────────────────┐
                      │     Reactive State & Execution Engine  │
                      │  (Zustand Workspace • Step Debugger)   │
                      └───────────────────┬────────────────────┘
                                          ▼
                      ┌────────────────────────────────────────┐
                      │         LogicAI Pedagogical Layer      │
                      │ (Graph Analysis • Counter-Examples)    │
                      └────────────────────────────────────────┘
```

---

## 🔬 Core Architectural Modules

### 1. 📐 Topological DAG Canvas Engine
* **Dynamic Dependency Graph:** Evaluates connected operations using topological sort in $\mathcal{O}(|V| + |E|)$ time, resolving parent gate dependencies prior to child state evaluation.
* **Propagation Delay Modeling:** Simulates real-world physical gate propagation delays and multi-phase clock cycles.
* **Model Validation:** Continuous cycle detection (Floyd's & Tarjan's algorithms), disconnected port alerts, and real-time schema validation.

### 2. 🧮 Set Theory & Formal Logic Suite
* **Set Operations:** Computes set expressions in real-time across arbitrary universes:
  $$\text{Union } (A \cup B), \quad \text{Intersection } (A \cap B), \quad \text{Difference } (A \setminus B), \quad \text{Symmetric Difference } (A \oplus B)$$
  $$\text{Cartesian Product } (A \times B), \quad \text{Power Set } (\mathcal{P}(A)), \quad \text{Cardinality } (|A|)$$
* **Dynamic SVG Venn Diagrams:** Real-time 2-set and 3-set geometric Euler/Venn regions with dynamic element distribution and highlight clipping.
* **Principle of Inclusion & Exclusion (PIE):** Step-by-step arithmetic solver for arbitrary multi-set cardinality surveys:
  $$|A \cup B \cup C| = |A| + |B| + |C| - (|A \cap B| + |A \cap C| + |B \cap C|) + |A \cap B \cap C|$$
* **Propositional Logic & Falsifying Counter-Example Finder:** Generates full $2^N$ truth tables and converts expressions into Canonical Disjunctive (DNF) and Conjunctive (CNF) Normal Forms.

### 3. 🤖 Automata & Computation Theory Suite
* **DFA & NFA Simulator:** Interactive state-transition graphs:
  $$M = \langle Q, \Sigma, \delta, q_0, F \rangle$$
  Multi-string concurrent batch validation, step-by-step playback with glowing active state indicators.
* **NFA $\to$ DFA Powerset Construction:** Converts non-deterministic machines into equivalent minimal deterministic state automata ($2^{|Q|}$ subset construction visualizer).
* **Hopcroft DFA Minimization:** Distinguishability table matrix algorithm partitioning states into minimal equivalent equivalence classes.
* **Pushdown Automata (PDA):** 
  $$M = \langle Q, \Sigma, \Gamma, \delta, q_0, Z_0, F \rangle$$
  Interactive LIFO stack visualizer tracking push/pop dynamics, instantaneous description (ID) snapshots, and non-deterministic branch exploration.
* **Turing Machine (TM) Simulator:** 
  $$M = \langle Q, \Sigma, \Gamma, \delta, q_0, q_{accept}, q_{reject} \rangle$$
  Infinite bidirectional tape simulation with read/write head animations, step controllers, and transition matrix inspectors.
* **Moore & Mealy Transducers:** Synchronous finite-state machines mapping input symbol streams to computed output sequences.

### 4. ♾️ Cantor's Diagonalization & Countability Explorer
* **Uncountability of $\mathbb{R}$:** Live construction of the diagonal real number $d = 0.d_1 d_2 d_3 \dots$ flipping digits to demonstrate the impossibility of a bijection between $\mathbb{N}$ and $[0, 1)$.
* **Rational Snake Path:** Visual matrix exploration illustrating Cantor's enumeration of positive rationals $\mathbb{Q}^+$.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | High-performance React framework with server rendering |
| **Language** | TypeScript 5.x | Strict static type safety for mathematical data models |
| **Styling** | TailwindCSS v4 + Glassmorphism | Dark minimalist systems aesthetic & responsive UI |
| **State Management**| Zustand | Zero-overhead reactive canvas store and history manager |
| **Mathematical Rendering**| KaTeX & MathJax | LaTeX equation rendering at native speeds |
| **Testing** | Vitest | Deterministic test suite for algorithmic verification |

---

## 🚀 Quickstart & Setup

### Prerequisites
* **Node.js:** v18.17+ or v20+
* **Package Manager:** `npm`, `pnpm`, or `yarn`

### Installation
```bash
# Clone the repository
git clone https://github.com/akash20065ray-sys/Logic_verse.git
cd Logic_verse/web

# Install dependencies
npm install

# Launch local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Verification & Scripts

```bash
cd web

# Run Vitest test suite
npx vitest run

# Run TypeScript static type check
npx tsc --noEmit

# Build production bundle
npm run build
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

<div align="center">
  <sub>Engineered by Akash Kumar • Interactive Discrete Logic Systems</sub>
</div>
