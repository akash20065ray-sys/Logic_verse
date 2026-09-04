# LogicVerse — v0.1 Foundation

> Build. Visualize. Simulate. Understand.

An AI-powered visual IDE for Discrete Mathematics and Theory of Computation.

## Overview

LogicVerse turns Discrete Mathematics and Theory of Computation into an interactive, visual IDE where students build mathematical graphs, simulate algorithms step-by-step, observe dynamic Venn diagrams, and receive context-aware explanations from **LogicAI**.

### Features Implemented
- **Topological DAG Canvas Engine**: Build, connect, and chain arbitrary set operations and logic gates with real-time dependency resolution.
- **Set Theory & Formal Logic Suite**:
  - Sets: Union ($A \cup B$), Intersection ($A \cap B$), Difference ($A - B$), Symmetric Difference ($A \oplus B$), Cartesian Product ($A \times B$), Power Set ($\mathcal{P}(A)$), Cardinality ($|A|$).
  - Logic: Propositional variables ($P, Q$), truth tables, DNF/CNF canonical forms, and **Falsifying Counter-Example Finder**.
- **Interactive 2-Set & 3-Set SVG Venn Diagrams**: Dynamic 8-region mathematical partitioning with element distribution.
- **Principle of Inclusion & Exclusion (PIE) Solver**: Step-by-step arithmetic and cardinality solver with real-world survey presets.
- **Cantor's Diagonalization & Countability Explorer**: Interactive uncountability proof of $\mathbb{R}$ with live anti-diagonal construction, plus Cantor's snake path for $\mathbb{Q}^+$.
- **Mathematical Induction Visualizer**: Step-by-step interactive derivation for summation theorems.
- **Context-Aware LogicAI**: Pedagogical math assistant that inspects your live canvas to answer questions, explain steps, and diagnose mistakes.
- **Model Validation**: Real-time error detection for cycle prevention, disconnected handles, and duplicate sets.
- **Export & Persistence**: LocalStorage autosave and export to JSON, Markdown, and LaTeX.

## Quick Start

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) or navigate to the workspace directly at [http://localhost:3000/workspace/set-theory](http://localhost:3000/workspace/set-theory).

## Scripts

```bash
cd web
npm run dev       # Local dev server
npm run build     # Production Next.js build
npx vitest run    # Run algorithmic unit tests
npx tsc --noEmit  # TypeScript type checking
```
