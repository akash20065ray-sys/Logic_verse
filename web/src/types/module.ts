// Core module registry types.
// New subjects (Graph Theory, Compiler Design, etc.) plug in here without
// touching the workspace shell — see PROJECT SPEC section 23.

export type ModuleStatus = "available" | "in-progress" | "locked" | "coming-soon";

export interface ModuleTopic {
  id: string;
  label: string;
  status: ModuleStatus;
}

export interface ModuleDefinition {
  id: string;
  unit: string; // e.g. "Domain 01" or category title
  title: string;
  shortLabel: string; // shown in the explorer tree
  description: string;
  accent: "blue" | "purple" | "cyan";
  status: ModuleStatus;
  topics: ModuleTopic[];
}

// Generic node/edge shape for the canvas (React Flow compatible).
// Every module extends `data` with its own domain fields.
export interface CanvasNodeData {
  label: string;
  kind: string; // e.g. "set", "operation", "state"
  [key: string]: unknown;
}

export interface CanvasProjectState {
  module: string;
  nodes: unknown[];
  edges: unknown[];
  metadata: Record<string, unknown>;
}

// Formal model engine: every visual construct must resolve to a formal
// mathematical representation independent of the UI (PROJECT SPEC section 8).
export interface FormalModel {
  moduleId: string;
  notation: string; // e.g. "A ∪ B"
  latex?: string;
  isValid: boolean;
  validationMessages: ValidationMessage[];
}

export interface ValidationMessage {
  level: "error" | "warning" | "info";
  message: string;
  nodeId?: string;
}
