"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// The signature element: a small DFA that accepts strings ending in "01",
// animating its own execution on a loop. This is the most characteristic
// artifact of the product's world — states, transitions, acceptance —
// rendered as the hero itself rather than a generic stat block.

const INPUT = "1101";

// q0 --1--> q0, q0 --0--> q1, q1 --1--> q0, q1 --0--> q1 (accepts strings ending in 0... simplified demo)
const TRANSITIONS: Record<string, Record<string, string>> = {
  q0: { "0": "q1", "1": "q0" },
  q1: { "0": "q1", "1": "q2" },
  q2: { "0": "q1", "1": "q0" },
};
const START = "q0";
const ACCEPT = new Set(["q2"]);

const POSITIONS: Record<string, { x: number; y: number }> = {
  q0: { x: 90, y: 130 },
  q1: { x: 260, y: 60 },
  q2: { x: 260, y: 200 },
};

function runTrace(input: string) {
  const trace: { state: string; read?: string }[] = [{ state: START }];
  let current = START;
  for (const ch of input) {
    current = TRANSITIONS[current]?.[ch] ?? current;
    trace.push({ state: current, read: ch });
  }
  return trace;
}

export function AutomatonHero() {
  const [step, setStep] = useState(0);
  const trace = runTrace(INPUT);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % (trace.length + 6));
    }, 850);
    return () => clearInterval(interval);
  }, [trace.length]);

  const activeIndex = Math.min(step, trace.length - 1);
  const activeState = trace[activeIndex]?.state ?? START;
  const isDone = step >= trace.length - 1;
  const accepted = isDone && ACCEPT.has(activeState);
  const readSoFar = INPUT.slice(0, activeIndex);
  const remaining = INPUT.slice(activeIndex);

  return (
    <div className="relative w-full max-w-md">
      <svg
        viewBox="0 0 340 260"
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label="Animated deterministic finite automaton accepting a sample string"
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--lv-faint)" />
          </marker>
        </defs>

        {/* Edges */}
        {Object.entries(TRANSITIONS).flatMap(([from, tr]) =>
          Object.entries(tr).map(([symbol, to]) => {
            const p1 = POSITIONS[from];
            const p2 = POSITIONS[to];
            if (from === to) {
              return (
                <g key={`${from}-${symbol}-${to}`}>
                  <path
                    d={`M ${p1.x - 10} ${p1.y - 22} C ${p1.x - 45} ${p1.y - 55}, ${p1.x + 45} ${p1.y - 55}, ${p1.x + 10} ${p1.y - 22}`}
                    fill="none"
                    stroke="var(--lv-border)"
                    strokeWidth="1.5"
                    markerEnd="url(#arrow)"
                  />
                  <text x={p1.x} y={p1.y - 55} textAnchor="middle" fontSize="11" fill="var(--lv-muted)" fontFamily="var(--font-mono-ui)">
                    {symbol}
                  </text>
                </g>
              );
            }
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;
            const curveOffset = from < to ? 14 : -14;
            const cx = mx + nx * curveOffset;
            const cy = my + ny * curveOffset;
            return (
              <g key={`${from}-${symbol}-${to}`}>
                <path
                  d={`M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke="var(--lv-border)"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow)"
                />
                <text x={cx} y={cy} textAnchor="middle" fontSize="11" fill="var(--lv-muted)" fontFamily="var(--font-mono-ui)">
                  {symbol}
                </text>
              </g>
            );
          })
        )}

        {/* Start arrow */}
        <path d={`M 20 ${POSITIONS.q0.y} L ${POSITIONS.q0.x - 22} ${POSITIONS.q0.y}`} stroke="var(--lv-faint)" strokeWidth="1.5" markerEnd="url(#arrow)" />

        {/* Nodes */}
        {Object.entries(POSITIONS).map(([id, pos]) => {
          const isActive = id === activeState;
          const isAccept = ACCEPT.has(id);
          return (
            <g key={id}>
              {isAccept && (
                <circle cx={pos.x} cy={pos.y} r={26} fill="none" stroke="var(--lv-border)" strokeWidth="1.5" />
              )}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={22}
                fill={isActive ? (accepted ? "rgba(34,197,94,0.15)" : "rgba(37,99,235,0.18)") : "var(--lv-surface)"}
                stroke={isActive ? (accepted && isDone ? "var(--lv-success)" : "var(--lv-blue)") : "var(--lv-border)"}
                strokeWidth={isActive ? 2 : 1.5}
                animate={{ scale: isActive ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="12" fill="var(--lv-text)" fontFamily="var(--font-mono-ui)">
                {id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Input tape readout */}
      <div className="mt-6 flex items-center justify-center gap-1 font-mono text-sm">
        <span className="text-lv-cyan">{readSoFar}</span>
        <span className="text-lv-muted">{remaining}</span>
        <AnimatePresence mode="wait">
          {isDone && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "ml-3 rounded-full px-2.5 py-0.5 text-xs font-medium",
                accepted ? "bg-lv-success/15 text-lv-success" : "bg-lv-error/15 text-lv-error"
              )}
            >
              {accepted ? "Accepted" : "Rejected"}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}
