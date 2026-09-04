import { create } from "zustand";
import type { Node, Edge, NodeChange, EdgeChange } from "@xyflow/react";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import { evaluateCanvasGraph, type GraphEvaluation } from "@/lib/algorithms/graph-evaluator";
import { WORKSPACE_TEMPLATES, DEFAULT_STARTER_TEMPLATE } from "@/lib/templates";

interface WorkspaceState {
  activeModuleId: string;
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  aiPanelOpen: boolean;
  outputPanelOpen: boolean;
  outputTab: "output" | "steps" | "formal-model" | "errors";
  activeStepIndex: number;
  isPlayingSteps: boolean;
  graphEvaluation: GraphEvaluation;
  saveStatus: string | null;
  activeTemplateId: string | null;

  setActiveModule: (id: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addNode: (node: Node) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  toggleAiPanel: () => void;
  toggleOutputPanel: () => void;
  setOutputTab: (tab: WorkspaceState["outputTab"]) => void;
  setStepIndex: (idx: number) => void;
  setIsPlayingSteps: (val: boolean) => void;
  stepForward: () => void;
  stepBackward: () => void;
  clearCanvas: () => void;
  loadTemplate: (templateId: string) => void;
  saveProject: () => void;
  loadSavedProject: () => boolean;
  recomputeGraph: (nodesOverride?: Node[], edgesOverride?: Edge[]) => void;
}

const initialEval = evaluateCanvasGraph(
  DEFAULT_STARTER_TEMPLATE.nodes,
  DEFAULT_STARTER_TEMPLATE.edges
);

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeModuleId: "set-theory",
  nodes: initialEval.updatedNodes,
  edges: DEFAULT_STARTER_TEMPLATE.edges,
  selectedNodeId: null,
  aiPanelOpen: true,
  outputPanelOpen: true,
  outputTab: "output",
  activeStepIndex: 0,
  isPlayingSteps: false,
  graphEvaluation: initialEval,
  saveStatus: null,
  activeTemplateId: DEFAULT_STARTER_TEMPLATE.id,

  setActiveModule: (id) => set({ activeModuleId: id }),

  recomputeGraph: (nodesOverride?: Node[], edgesOverride?: Edge[]) => {
    const currentNodes = nodesOverride ?? get().nodes;
    const currentEdges = edgesOverride ?? get().edges;
    const evaluation = evaluateCanvasGraph(currentNodes, currentEdges);
    set({
      nodes: evaluation.updatedNodes,
      graphEvaluation: evaluation,
      activeStepIndex: 0,
    });
  },

  setNodes: (nodes) => {
    const evaluation = evaluateCanvasGraph(nodes, get().edges);
    set({ nodes: evaluation.updatedNodes, graphEvaluation: evaluation });
  },

  setEdges: (edges) => {
    const evaluation = evaluateCanvasGraph(get().nodes, edges);
    set({ edges, nodes: evaluation.updatedNodes, graphEvaluation: evaluation });
  },

  onNodesChange: (changes) => {
    const updated = applyNodeChanges(changes, get().nodes);
    // Recompute graph if node elements or types were modified or removed
    const hasRemoval = changes.some((c) => c.type === "remove");
    if (hasRemoval) {
      const remainingIds = new Set(updated.map((n) => n.id));
      const cleanEdges = get().edges.filter(
        (e) => remainingIds.has(e.source) && remainingIds.has(e.target)
      );
      const evaluation = evaluateCanvasGraph(updated, cleanEdges);
      set({
        nodes: evaluation.updatedNodes,
        edges: cleanEdges,
        graphEvaluation: evaluation,
      });
    } else {
      set({ nodes: updated });
    }
  },

  onEdgesChange: (changes) => {
    const updatedEdges = applyEdgeChanges(changes, get().edges);
    const evaluation = evaluateCanvasGraph(get().nodes, updatedEdges);
    set({
      edges: updatedEdges,
      nodes: evaluation.updatedNodes,
      graphEvaluation: evaluation,
    });
  },

  addNode: (node) => {
    const updatedNodes = [...get().nodes, node];
    const evaluation = evaluateCanvasGraph(updatedNodes, get().edges);
    set({
      nodes: evaluation.updatedNodes,
      graphEvaluation: evaluation,
      selectedNodeId: node.id,
    });
  },

  deleteNode: (id) => {
    const updatedNodes = get().nodes.filter((n) => n.id !== id);
    const updatedEdges = get().edges.filter((e) => e.source !== id && e.target !== id);
    const evaluation = evaluateCanvasGraph(updatedNodes, updatedEdges);
    set({
      nodes: evaluation.updatedNodes,
      edges: updatedEdges,
      graphEvaluation: evaluation,
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });
  },

  selectNode: (id) => set({ selectedNodeId: id }),
  toggleAiPanel: () => set({ aiPanelOpen: !get().aiPanelOpen }),
  toggleOutputPanel: () => set({ outputPanelOpen: !get().outputPanelOpen }),
  setOutputTab: (tab) => set({ outputTab: tab, outputPanelOpen: true }),

  setStepIndex: (idx) => set({ activeStepIndex: idx }),
  setIsPlayingSteps: (val) => set({ isPlayingSteps: val }),
  stepForward: () => {
    const total = get().graphEvaluation.allSteps.length;
    if (total === 0) return;
    set({ activeStepIndex: Math.min(get().activeStepIndex + 1, total - 1) });
  },
  stepBackward: () => {
    set({ activeStepIndex: Math.max(get().activeStepIndex - 1, 0) });
  },

  clearCanvas: () => {
    const evaluation = evaluateCanvasGraph([], []);
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      graphEvaluation: evaluation,
      activeTemplateId: null,
      activeStepIndex: 0,
      isPlayingSteps: false,
    });
  },

  loadTemplate: (templateId) => {
    const tmpl = WORKSPACE_TEMPLATES[templateId] ?? DEFAULT_STARTER_TEMPLATE;
    const evaluation = evaluateCanvasGraph(tmpl.nodes, tmpl.edges);
    set({
      nodes: evaluation.updatedNodes,
      edges: tmpl.edges,
      selectedNodeId: null,
      graphEvaluation: evaluation,
      activeTemplateId: tmpl.id,
      activeStepIndex: 0,
      isPlayingSteps: false,
    });
  },

  saveProject: () => {
    try {
      const state = {
        nodes: get().nodes,
        edges: get().edges,
        activeModuleId: get().activeModuleId,
        timestamp: new Date().toISOString(),
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(`logicverse_project_${get().activeModuleId}`, JSON.stringify(state));
      }
      set({ saveStatus: "Project saved locally!" });
      setTimeout(() => set({ saveStatus: null }), 2500);
    } catch {
      set({ saveStatus: "Save failed" });
      setTimeout(() => set({ saveStatus: null }), 2500);
    }
  },

  loadSavedProject: () => {
    try {
      if (typeof window === "undefined") return false;
      const raw = localStorage.getItem(`logicverse_project_${get().activeModuleId}`);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        const evaluation = evaluateCanvasGraph(parsed.nodes, parsed.edges);
        set({
          nodes: evaluation.updatedNodes,
          edges: parsed.edges,
          graphEvaluation: evaluation,
          activeStepIndex: 0,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
