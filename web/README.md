# LogicVerse — v0.1 Foundation

> Build. Visualize. Simulate. Understand.

An AI-powered visual IDE for Discrete Mathematics and Theory of Computation.
This is the **Phase 1 foundation build** described in the project spec
(section 31): the shell, design system, workspace, and one fully-working
reference module (Set Theory) that establishes the architecture every future
module will reuse.

## What's implemented

- **Landing page** — hero with an animated finite-automaton signature element,
  workflow explainer (Build -> Run -> See -> Understand), module grid covering
  all 6 syllabus units, and a LogicAI preview section.
- **Dashboard** — recent projects, learning-analytics summary (strong /
  needs-practice topics), stat cards.
- **Workspace** — the three-panel IDE shell:
  - Left: Module Explorer (tree nav across all 7 modules / 6 units)
  - Center: infinite canvas (React Flow) + floating component palette
  - Right: LogicAI panel (context-aware chat UI, not yet wired to a model)
  - Bottom: Output dock with Output / Steps / Formal Model / Errors tabs
- **Set Theory engine** — a real, deterministic, independently-tested
  algorithm module (`src/lib/algorithms/set-theory.ts`): union, intersection,
  difference, symmetric difference, Cartesian product, cardinality, power
  set, inclusion-exclusion. The canvas nodes call into this engine directly;
  nothing is hardcoded or faked (see spec rule: "never present fake
  functionality as working").
- **Design system** — dark theme using the exact palette specified (navy
  background, blue/purple/cyan accents), Inter for UI, monospace for formal
  notation, glass panels, subtle motion.

## Fixed after initial testing

- **Right panel (LogicAI) disappearing** — it was hidden below the `lg`
  breakpoint (1024px), so any window narrower than that silently lost the
  whole right column with no error. Both side panels now only fully collapse
  below `sm` (640px, true mobile), matching spec section 20.
- **Adding your own set elements** — "Add Set" now opens a form (name +
  comma-separated elements) instead of dropping a fixed preset. Double-click
  any set node on the canvas to edit it after the fact; connected results
  recompute automatically.
- **LogicAI welcome message was misleading** — it read as if the chat worked.
  It now says plainly that this is a UI preview not yet wired to a model.

## What's intentionally NOT built yet

Per the spec's phased strategy (section 29) and rule "build one complete
module before expanding to the next," the following are staged as
`coming-soon` in the module registry but not implemented: Logic, Relations &
Functions, Automata (DFA/NFA), Regex, CFG, PDA/TM, LogicAI's actual model
integration, authentication, backend/API, and persistence. The workspace
shell and canvas architecture are built to accommodate all of them without
rework — see `src/lib/modules.ts` to add a new module definition, and
`src/components/canvas/nodes/` for the pattern to follow for new node types.

## Getting started

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`. Try the workspace directly at
`http://localhost:3000/workspace/set-theory` — use the palette in the
top-left of the canvas to add sets and an operation node, then drag a
connection from each set into the operation, and from the operation into a
result node. The result recomputes live from the deterministic engine.

Note: this environment builds with `next/font/google` disabled (system font
fallback) because sandboxed network egress blocks fonts.googleapis.com. If
you have normal internet access locally, you can swap back to
`next/font/google` in `src/app/layout.tsx` for self-hosted Inter/JetBrains
Mono — no other changes needed.

## Scripts

```bash
npm run dev       # local dev server
npm run build     # production build
npm run start     # run the production build
npx tsc --noEmit  # type-check
npx vitest run    # run algorithm unit tests
```

## Project structure

```
web/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx               # Landing page
│   │   ├── dashboard/              # Dashboard
│   │   └── workspace/[moduleId]/   # Workspace shell (dynamic per module)
│   ├── components/
│   │   ├── landing/                # Hero, workflow, modules, LogicAI sections
│   │   ├── layout/                 # Header, footer, dashboard sidebar
│   │   ├── workspace/               # Toolbar, module explorer, shell
│   │   ├── canvas/                  # React Flow canvas + custom nodes
│   │   └── panels/                  # LogicAI panel, output dock
│   ├── lib/
│   │   ├── algorithms/              # Deterministic algorithm engines (UI-free)
│   │   ├── modules.ts                # Module registry (add new subjects here)
│   │   └── utils.ts
│   ├── store/                      # Zustand workspace state
│   └── types/                      # Shared TypeScript types
```

This mirrors the monorepo philosophy from spec section 24 at a scale
appropriate for v0.1 — a `packages/` split (ui, canvas, algorithms, ai,
shared) is the natural next step once a second app (e.g. a FastAPI backend)
joins the repo.

## Next implementation step

Per spec section 32, the next milestone is deepening the Set Theory module:
Venn diagram generation, step-by-step operation animation, power-set
visualization, and project save/export — before moving to Unit I Logic.
