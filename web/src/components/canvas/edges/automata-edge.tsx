"use client";

/**
 * AutomataEdge: Custom React Flow edge component for Theory of Computation diagrams.
 * Renders curved SVG loop arcs for self-loops (q_i ↺ q_i) and smooth Bezier curves for transition edges.
 */
import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";

export const AutomataEdge = memo(function AutomataEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  style = {},
  markerEnd,
  source,
  target,
  animated,
}: EdgeProps) {
  const isSelfLoop = source === target;

  if (isSelfLoop) {
    // Custom SVG Loop Path for Self-Loops (q_i ↺ q_i)
    const radiusX = 30;
    const radiusY = 35;
    const loopX = sourceX;
    const loopY = sourceY - 20;

    const edgePath = `M ${sourceX - 10} ${sourceY - 10} C ${sourceX - radiusX} ${sourceY - radiusY * 2}, ${sourceX + radiusX} ${sourceY - radiusY * 2}, ${sourceX + 10} ${sourceY - 10}`;

    const labelX = sourceX;
    const labelY = sourceY - radiusY * 1.5;

    return (
      <>
        <path
          id={id}
          className={`react-flow__edge-path ${animated ? "animated" : ""}`}
          d={edgePath}
          style={{
            stroke: (style.stroke as string) || "#38BDF8",
            strokeWidth: (style.strokeWidth as number) || 2,
            fill: "none",
            ...style,
          }}
          markerEnd={markerEnd}
        />
        {label && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -100%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: "all",
              }}
              className="nodrag nopan rounded-lg border border-lv-cyan/40 bg-lv-panel/95 px-2 py-0.5 font-mono text-[11px] font-extrabold text-lv-cyan shadow-lg backdrop-blur-md"
            >
              ↺ {label}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }

  // Smooth Bezier Curve Path for Normal & Multi-Edge Transitions
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan rounded-lg border border-lv-border-soft bg-lv-panel/95 px-2 py-0.5 font-mono text-[11px] font-extrabold text-lv-cyan shadow-md backdrop-blur-md"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
