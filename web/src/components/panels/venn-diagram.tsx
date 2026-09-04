"use client";

import { useState } from "react";
import { type SetElement } from "@/lib/algorithms/set-theory";
import { deduplicate, difference, intersection } from "@/lib/algorithms/set-theory";

interface VennDiagramProps {
  labelA?: string;
  elementsA?: SetElement[];
  labelB?: string;
  elementsB?: SetElement[];
  activeOperation?: string; // e.g. "∪", "∩", "−", "⊕"
}

export function VennDiagram({
  labelA = "A",
  elementsA = [],
  labelB = "B",
  elementsB = [],
  activeOperation = "∪",
}: VennDiagramProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const cleanA = deduplicate(elementsA);
  const cleanB = deduplicate(elementsB);

  const shared = intersection(cleanA, cleanB);
  const onlyA = difference(cleanA, cleanB);
  const onlyB = difference(cleanB, cleanA);

  // SVG Geometry constants
  // Box: 360 x 180
  const cAx = 135;
  const cAy = 90;
  const cBx = 225;
  const cBy = 90;
  const radius = 65;

  // Region active highlight state based on activeOperation
  const isUnion = activeOperation.includes("∪");
  const isIntersection = activeOperation.includes("∩");
  const isDifference = activeOperation.includes("−");
  const isSymDiff = activeOperation.includes("⊕");

  const highlightOnlyA = isUnion || isDifference || isSymDiff;
  const highlightShared = isUnion || isIntersection;
  const highlightOnlyB = isUnion || isSymDiff;

  return (
    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-lv-surface/50 border border-lv-border-soft">
      <div className="flex items-center justify-between w-full px-2 mb-1 text-[11px] font-mono text-lv-faint">
        <span>Universe 𝒰</span>
        <span>
          |{labelA} ∪ {labelB}| = {cleanA.length + cleanB.length - shared.length}
        </span>
      </div>

      <div className="relative w-full max-w-[340px] aspect-[2/1]">
        <svg
          viewBox="0 0 360 180"
          className="w-full h-full overflow-visible select-none"
          role="img"
          aria-label={`Venn diagram of set ${labelA} and set ${labelB}`}
        >
          <defs>
            {/* Clip path for circle A */}
            <clipPath id="clip-circle-a">
              <circle cx={cAx} cy={cAy} r={radius} />
            </clipPath>
            {/* Clip path for circle B */}
            <clipPath id="clip-circle-b">
              <circle cx={cBx} cy={cBy} r={radius} />
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
            r={radius}
            fill={highlightOnlyA ? "rgba(37,99,235,0.22)" : "rgba(37,99,235,0.06)"}
            stroke="var(--lv-blue)"
            strokeWidth="2"
            onMouseEnter={() => setHoveredRegion("A only")}
            onMouseLeave={() => setHoveredRegion(null)}
            className="cursor-pointer transition-all duration-300"
          />

          {/* Circle B fill */}
          <circle
            cx={cBx}
            cy={cBy}
            r={radius}
            fill={highlightOnlyB ? "rgba(139,92,246,0.22)" : "rgba(139,92,246,0.06)"}
            stroke="var(--lv-purple)"
            strokeWidth="2"
            onMouseEnter={() => setHoveredRegion("B only")}
            onMouseLeave={() => setHoveredRegion(null)}
            className="cursor-pointer transition-all duration-300"
          />

          {/* Intersection Lens Fill using clipping */}
          <g clipPath="url(#clip-circle-a)">
            <circle
              cx={cBx}
              cy={cBy}
              r={radius}
              fill={
                highlightShared
                  ? "rgba(34,211,238,0.35)"
                  : isSymDiff || isDifference
                  ? "rgba(11,17,29,0.8)"
                  : "rgba(11,17,29,0.3)"
              }
              onMouseEnter={() => setHoveredRegion("Intersection")}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer transition-all duration-300"
            />
          </g>

          {/* Outlines */}
          <circle cx={cAx} cy={cAy} r={radius} fill="none" stroke="var(--lv-blue)" strokeWidth="2" />
          <circle cx={cBx} cy={cBy} r={radius} fill="none" stroke="var(--lv-purple)" strokeWidth="2" />

          {/* Set Labels */}
          <text
            x={cAx - 35}
            y={cAy - 45}
            fill="var(--lv-blue)"
            fontSize="14"
            fontFamily="var(--font-mono-ui)"
            fontWeight="bold"
          >
            {labelA}
          </text>
          <text
            x={cBx + 25}
            y={cBy - 45}
            fill="var(--lv-purple)"
            fontSize="14"
            fontFamily="var(--font-mono-ui)"
            fontWeight="bold"
          >
            {labelB}
          </text>

          {/* Elements & counts in Region A only */}
          <text
            x={cAx - 22}
            y={cAy - 4}
            textAnchor="middle"
            fill="var(--lv-text)"
            fontSize="11"
            fontFamily="var(--font-mono-ui)"
          >
            {onlyA.slice(0, 3).join(", ")}
            {onlyA.length > 3 ? "…" : ""}
          </text>
          <text
            x={cAx - 22}
            y={cAy + 14}
            textAnchor="middle"
            fill="var(--lv-faint)"
            fontSize="10"
            fontFamily="var(--font-mono-ui)"
          >
            ({onlyA.length})
          </text>

          {/* Elements in Intersection */}
          <text
            x={180}
            y={cAy - 4}
            textAnchor="middle"
            fill="var(--lv-cyan)"
            fontSize="11"
            fontWeight="bold"
            fontFamily="var(--font-mono-ui)"
          >
            {shared.slice(0, 3).join(", ")}
            {shared.length > 3 ? "…" : ""}
          </text>
          <text
            x={180}
            y={cAy + 14}
            textAnchor="middle"
            fill="var(--lv-cyan)"
            fontSize="10"
            fontFamily="var(--font-mono-ui)"
          >
            ({shared.length})
          </text>

          {/* Elements in Region B only */}
          <text
            x={cBx + 22}
            y={cBy - 4}
            textAnchor="middle"
            fill="var(--lv-text)"
            fontSize="11"
            fontFamily="var(--font-mono-ui)"
          >
            {onlyB.slice(0, 3).join(", ")}
            {onlyB.length > 3 ? "…" : ""}
          </text>
          <text
            x={cBx + 22}
            y={cBy + 14}
            textAnchor="middle"
            fill="var(--lv-faint)"
            fontSize="10"
            fontFamily="var(--font-mono-ui)"
          >
            ({onlyB.length})
          </text>
        </svg>
      </div>

      {/* Region Status Tooltip / Footer */}
      <div className="mt-1 flex items-center gap-3 text-[11px] font-mono text-lv-muted">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-lv-blue" />
          {labelA} only: {onlyA.length}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-lv-cyan" />
          Overlap: {shared.length}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-lv-purple" />
          {labelB} only: {onlyB.length}
        </span>
      </div>
    </div>
  );
}
