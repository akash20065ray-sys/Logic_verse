# LogicVerse — v0.1 Foundation

> Build. Visualize. Simulate. Understand.

An AI-powered visual IDE for Discrete Mathematics and Theory of Computation.

## Overview

LogicVerse turns Discrete Mathematics and Theory of Computation into an interactive, visual IDE where students build mathematical graphs, simulate algorithms step-by-step, observe dynamic Venn diagrams, and receive context-aware explanations from **LogicAI**.

### Features Implemented
- **Topological DAG Canvas Engine**: Build, connect, and chain arbitrary set operations with real-time dependency resolution.
- **Full Operation Suite**:
  - Binary: Union ($A \cup B$), Intersection ($A \cap B$), Difference ($A - B$), Symmetric Difference ($A \oplus B$), Cartesian Product ($A \times B$).
  - Unary: Power Set ($\mathcal{P}(A)$), Cardinality ($|A|$), Complement ($A^c$).
- **Interactive SVG Venn Diagram**: Mathematically shaded regions with exact element placement in $A \setminus B$, $B \setminus A$, and $A \cap B$.
- **Step-by-Step Execution Scrubber**: Scrub through algorithmic execution traces with Play/Pause, Forward, and Back controls.
- **Context-Aware LogicAI**: Pedagogical math tutor that inspects your live canvas to answer questions, explain steps with user-defined sets, and load templates.
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
