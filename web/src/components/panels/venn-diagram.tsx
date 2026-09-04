"use client";

import { useState } from "react";
import { type SetElement } from "@/lib/algorithms/set-theory";
import { deduplicate, difference, intersection } from "@/lib/algorithms/set-theory";
import { cn } from "@/lib/utils";

interface VennDiagramProps {
  labelA?: string;
  elementsA?: SetElement[];
  labelB?: string;
  elementsB?: SetElement[];
  labelC?: string;
  elementsC?: SetElement[];
  activeOperation?: string; // e.g. "∪", "∩", "−", "⊕"
  initialMode?: "2-set" | "3-set";
}

export function VennDiagram({
  labelA = "A",
  elementsA = [],
  labelB = "B",
  elementsB = [],
  labelC = "C",
  elementsC = [],
  activeOperation = "∪",
  initialMode,
}: VennDiagramProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // If 3 sets are present or requested, default to 3-set
  const hasThreeSets = elementsC.length > 0 || initialMode === "3-set";
  const [is3Set, setIs3Set] = useState<boolean>(hasThreeSets);

  const cleanA = deduplicate(elementsA);
  const cleanB = deduplicate(elementsB);
  const cleanC = deduplicate(elementsC);

  // 2-Set Regions
  const sharedAB = intersection(cleanA, cleanB);
  const onlyA_2 = difference(cleanA, cleanB);
  const onlyB_2 = difference(cleanB, cleanA);

  // 3-Set Regions:
  // Center: A ∩ B ∩ C
  const sharedABC = intersection(intersection(cleanA, cleanB), cleanC);
  // Two-way overlaps excluding third:
  const onlyAB = difference(intersection(cleanA, cleanB), cleanC);
  const onlyBC = difference(intersection(cleanB, cleanC), cleanA);
  const onlyAC = difference(intersection(cleanA, cleanC), cleanB);
  // Purely single set:
  const onlyA_3 = difference(cleanA, [...cleanB, ...cleanC]);
  const onlyB_3 = difference(cleanB, [...cleanA, ...cleanC]);
  const onlyC_3 = difference(cleanC, [...cleanA, ...cleanB]);

  // Geometry:
  // 2-Set constants: Box 360 x 180
  const cAx = 135;
  const cAy = 90;
  const cBx = 225;
  const cBy = 90;
  const r2 = 65;

  // 3-Set constants: Box 360 x 240
  const c3Ax = 180;
  const c3Ay = 85;
  const c3Bx = 135;
  const c3By = 150;
  const c3Cx = 225;
  const c3Cy = 150;
  const r3 = 62;

  // Operation flags
  const isUnion = activeOperation.includes("∪");
  const isIntersection = activeOperation.includes("∩");
  const isDifference = activeOperation.includes("−");
  const isSymDiff = activeOperation.includes("⊕");

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-lv-surface/50 border border-lv-border-soft shadow-md w-full">
      {/* Top Controls & Cardinality */}
      <div className="flex items-center justify-between w-full px-2 mb-2 text-[11px] font-mono text-lv-faint">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIs3Set(false)}
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold transition-colors",
              !is3Set ? "bg-lv-cyan/20 text-lv-cyan border border-lv-cyan/40" : "text-lv-faint hover:text-lv-text"
            )}
          >
            2 Sets
          </button>
          <button
            type="button"
            onClick={() => setIs3Set(true)}
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold transition-colors",
              is3Set ? "bg-lv-cyan/20 text-lv-cyan border border-lv-cyan/40" : "text-lv-faint hover:text-lv-text"
            )}
          >
            3 Sets
          </button>
        </div>

        <span className="text-lv-cyan font-bold">
          {hoveredRegion ? (
            hoveredRegion
          ) : is3Set ? (
            `|${labelA} ∪ ${labelB} ∪ ${labelC}| = ${deduplicate([...cleanA, ...cleanB, ...cleanC]).length}`
          ) : (
            `|${labelA} ∪ ${labelB}| = ${cleanA.length + cleanB.length - sharedAB.length}`
          )}
        </span>
      </div>

      {/* 2-SET VENN DIAGRAM */}
      {!is3Set ? (
        <div className="relative w-full max-w-[340px] aspect-[2/1]">
          <svg
            viewBox="0 0 360 180"
            className="w-full h-full overflow-visible select-none"
            role="img"
            aria-label={`Venn diagram of set ${labelA} and set ${labelB}`}
          >
            <defs>
              <clipPath id="clip-circle-a">
                <circle cx={cAx} cy={cAy} r={r2} />
              </clipPath>
              <clipPath id="clip-circle-b">
                <circle cx={cBx} cy={cBy} r={r2} />
              </clipPath>
            </defs>

            {/* Universe rectangle */}
            <rect
              x="8"
              y="8"
              width="344"
              height="164"
              rx="12"
              fill="rgba(11,17,29,0.5)"
              stroke="var(--lv-border)"
              strokeWidth="1.5"
            />

            {/* Circle A fill */}
            <circle
              cx={cAx}
              cy={cAy}
              r={r2}
              fill={isUnion || isDifference || isSymDiff ? "rgba(37,99,235,0.22)" : "rgba(37,99,235,0.06)"}
              stroke="var(--lv-blue)"
              strokeWidth="2"
              onMouseEnter={() => setHoveredRegion(`${labelA} only`)}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer transition-all duration-300"
            />

            {/* Circle B fill */}
            <circle
              cx={cBx}
              cy={cBy}
              r={r2}
              fill={isUnion || isSymDiff ? "rgba(139,92,246,0.22)" : "rgba(139,92,246,0.06)"}
              stroke="var(--lv-purple)"
              strokeWidth="2"
              onMouseEnter={() => setHoveredRegion(`${labelB} only`)}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer transition-all duration-300"
            />

            {/* Intersection Lens Fill using clipping */}
            <g clipPath="url(#clip-circle-a)">
              <circle
                cx={cBx}
                cy={cBy}
                r={r2}
                fill={
                  isUnion || isIntersection
                    ? "rgba(34,211,238,0.35)"
                    : isSymDiff || isDifference
                    ? "rgba(11,17,29,0.8)"
                    : "rgba(11,17,29,0.3)"
                }
                onMouseEnter={() => setHoveredRegion(`${labelA} ∩ ${labelB}`)}
                onMouseLeave={() => setHoveredRegion(null)}
                className="cursor-pointer transition-all duration-300"
              />
            </g>

            {/* Outlines */}
            <circle cx={cAx} cy={cAy} r={r2} fill="none" stroke="var(--lv-blue)" strokeWidth="2" />
            <circle cx={cBx} cy={cBy} r={r2} fill="none" stroke="var(--lv-purple)" strokeWidth="2" />

            {/* Labels */}
            <text x={cAx - 35} y={cAy - 45} fill="var(--lv-blue)" fontSize="14" fontFamily="var(--font-mono-ui)" fontWeight="bold">
              {labelA}
            </text>
            <text x={cBx + 25} y={cBy - 45} fill="var(--lv-purple)" fontSize="14" fontFamily="var(--font-mono-ui)" fontWeight="bold">
              {labelB}
            </text>

            {/* Elements in Region A only */}
            <text x={cAx - 22} y={cAy - 4} textAnchor="middle" fill="var(--lv-text)" fontSize="11" fontFamily="var(--font-mono-ui)">
              {onlyA_2.slice(0, 3).join(", ")}{onlyA_2.length > 3 ? "…" : ""}
            </text>
            <text x={cAx - 22} y={cAy + 14} textAnchor="middle" fill="var(--lv-faint)" fontSize="10" fontFamily="var(--font-mono-ui)">
              ({onlyA_2.length})
            </text>

            {/* Elements in Intersection */}
            <text x={180} y={cAy - 4} textAnchor="middle" fill="var(--lv-cyan)" fontSize="11" fontWeight="bold" fontFamily="var(--font-mono-ui)">
              {sharedAB.slice(0, 3).join(", ")}{sharedAB.length > 3 ? "…" : ""}
            </text>
            <text x={180} y={cAy + 14} textAnchor="middle" fill="var(--lv-cyan)" fontSize="10" fontFamily="var(--font-mono-ui)">
              ({sharedAB.length})
            </text>

            {/* Elements in Region B only */}
            <text x={cBx + 22} y={cBy - 4} textAnchor="middle" fill="var(--lv-text)" fontSize="11" fontFamily="var(--font-mono-ui)">
              {onlyB_2.slice(0, 3).join(", ")}{onlyB_2.length > 3 ? "…" : ""}
            </text>
            <text x={cBx + 22} y={cBy + 14} textAnchor="middle" fill="var(--lv-faint)" fontSize="10" fontFamily="var(--font-mono-ui)">
              ({onlyB_2.length})
            </text>
          </svg>
        </div>
      ) : (
        /* 3-SET VENN DIAGRAM */
        <div className="relative w-full max-w-[340px] aspect-[4/3]">
          <svg
            viewBox="0 0 360 240"
            className="w-full h-full overflow-visible select-none"
            role="img"
            aria-label={`3-Set Venn diagram of ${labelA}, ${labelB}, and ${labelC}`}
          >
            {/* Universe rectangle */}
            <rect
              x="8"
              y="8"
              width="344"
              height="224"
              rx="14"
              fill="rgba(11,17,29,0.5)"
              stroke="var(--lv-border)"
              strokeWidth="1.5"
            />

            {/* Circle A (Top) */}
            <circle
              cx={c3Ax}
              cy={c3Ay}
              r={r3}
              fill="rgba(37,99,235,0.15)"
              stroke="var(--lv-blue)"
              strokeWidth="2"
              onMouseEnter={() => setHoveredRegion(`${labelA} only: ${onlyA_3.length} elements`)}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer hover:fill-lv-blue/25 transition-all"
            />

            {/* Circle B (Bottom Left) */}
            <circle
              cx={c3Bx}
              cy={c3By}
              r={r3}
              fill="rgba(139,92,246,0.15)"
              stroke="var(--lv-purple)"
              strokeWidth="2"
              onMouseEnter={() => setHoveredRegion(`${labelB} only: ${onlyB_3.length} elements`)}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer hover:fill-lv-purple/25 transition-all"
            />

            {/* Circle C (Bottom Right) */}
            <circle
              cx={c3Cx}
              cy={c3Cy}
              r={r3}
              fill="rgba(6,182,212,0.15)"
              stroke="var(--lv-cyan)"
              strokeWidth="2"
              onMouseEnter={() => setHoveredRegion(`${labelC} only: ${onlyC_3.length} elements`)}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer hover:fill-lv-cyan/25 transition-all"
            />

            {/* Labels */}
            <text x={c3Ax} y={c3Ay - 45} textAnchor="middle" fill="var(--lv-blue)" fontSize="14" fontWeight="bold" fontFamily="var(--font-mono-ui)">
              {labelA}
            </text>
            <text x={c3Bx - 45} y={c3By + 40} fill="var(--lv-purple)" fontSize="14" fontWeight="bold" fontFamily="var(--font-mono-ui)">
              {labelB}
            </text>
            <text x={c3Cx + 30} y={c3Cy + 40} fill="var(--lv-cyan)" fontSize="14" fontWeight="bold" fontFamily="var(--font-mono-ui)">
              {labelC}
            </text>

            {/* Center: A ∩ B ∩ C */}
            <text
              x={180}
              y={130}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="11"
              fontWeight="bold"
              fontFamily="var(--font-mono-ui)"
              onMouseEnter={() => setHoveredRegion(`${labelA} ∩ ${labelB} ∩ ${labelC}: [${sharedABC.join(", ")}]`)}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer hover:fill-lv-cyan transition-colors"
            >
              {sharedABC.length > 0 ? sharedABC.slice(0, 2).join(",") : "∅"}
            </text>

            {/* Only A */}
            <text x={c3Ax} y={c3Ay - 15} textAnchor="middle" fill="var(--lv-text)" fontSize="10" fontFamily="var(--font-mono-ui)">
              {onlyA_3.length > 0 ? onlyA_3.slice(0, 2).join(",") : "0"}
            </text>

            {/* Only B */}
            <text x={c3Bx - 20} y={c3By + 15} textAnchor="middle" fill="var(--lv-text)" fontSize="10" fontFamily="var(--font-mono-ui)">
              {onlyB_3.length > 0 ? onlyB_3.slice(0, 2).join(",") : "0"}
            </text>

            {/* Only C */}
            <text x={c3Cx + 20} y={c3Cy + 15} textAnchor="middle" fill="var(--lv-text)" fontSize="10" fontFamily="var(--font-mono-ui)">
              {onlyC_3.length > 0 ? onlyC_3.slice(0, 2).join(",") : "0"}
            </text>

            {/* Overlap A ∩ B */}
            <text x={150} y={105} textAnchor="middle" fill="var(--lv-purple)" fontSize="9" fontWeight="bold">
              {onlyAB.length}
            </text>

            {/* Overlap A ∩ C */}
            <text x={210} y={105} textAnchor="middle" fill="var(--lv-cyan)" fontSize="9" fontWeight="bold">
              {onlyAC.length}
            </text>

            {/* Overlap B ∩ C */}
            <text x={180} y={170} textAnchor="middle" fill="var(--lv-blue)" fontSize="9" fontWeight="bold">
              {onlyBC.length}
            </text>
          </svg>
        </div>
      )}

      {/* Region Status Tooltip / Footer */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-lv-muted">
        {!is3Set ? (
          <>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-lv-blue" />
              {labelA} only: {onlyA_2.length}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-lv-cyan" />
              Overlap: {sharedAB.length}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-lv-purple" />
              {labelB} only: {onlyB_2.length}
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-lv-blue" />
              {labelA} only: {onlyA_3.length}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-lv-purple" />
              {labelB} only: {onlyB_3.length}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-lv-cyan" />
              {labelC} only: {onlyC_3.length}
            </span>
            <span className="flex items-center gap-1 font-bold text-lv-text">
              <span className="h-2 w-2 rounded-full bg-white" />
              Center ∩: {sharedABC.length}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
