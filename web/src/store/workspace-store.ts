import { create } from "zustand";
import type { Node, Edge, NodeChange, EdgeChange } from "@xyflow/react";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import { evaluateCanvasGraph, type GraphEvaluation } from "@/lib/algorithms/graph-evaluator";
import { evaluateLogicGraph, type LogicEvaluation } from "@/lib/algorithms/logic-graph-evaluator";
import {
  WORKSPACE_TEMPLATES,
  DEFAULT_STARTER_TEMPLATE,
  DEFAULT_LOGIC_TEMPLATE,
} from "@/lib/templates";

interface WorkspaceState {
  activeModuleId: string;
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  aiPanelOpen: boolean;
  outputPanelOpen: boolean;
  outputTab: "output" | "steps" | "formal-model" | "errors" | "induction";
  activeStepIndex: number;
  isPlayingSteps: boolean;
  graphEvaluation: GraphEvaluation;
  logicEvaluation: LogicEvaluation;
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

const initialSetEval = evaluateCanvasGraph(
  DEFAULT_STARTER_TEMPLATE.nodes,
  DEFAULT_STARTER_TEMPLATE.edges
);

const initialLogicEval = evaluateLogicGraph(
  DEFAULT_LOGIC_TEMPLATE.nodes,
  DEFAULT_LOGIC_TEMPLATE.edges
);

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeModuleId: "set-theory",
  nodes: initialSetEval.updatedNodes,
  edges: DEFAULT_STARTER_TEMPLATE.edges,
  selectedNodeId: null,
  aiPanelOpen: true,
  outputPanelOpen: true,
  outputTab: "output",
  activeStepIndex: 0,
  isPlayingSteps: false,
  graphEvaluation: initialSetEval,
  logicEvaluation: initialLogicEval,
  saveStatus: null,
  activeTemplateId: DEFAULT_STARTER_TEMPLATE.id,

  setActiveModule: (id) => {
    const current = get().activeModuleId;
    if (current === id) return;

    if (id === "logic") {
      const evalLogic = evaluateLogicGraph(DEFAULT_LOGIC_TEMPLATE.nodes, DEFAULT_LOGIC_TEMPLATE.edges);
      set({
        activeModuleId: id,
        nodes: evalLogic.updatedNodes,
        edges: DEFAULT_LOGIC_TEMPLATE.edges,
        logicEvaluation: evalLogic,
        activeTemplateId: DEFAULT_LOGIC_TEMPLATE.id,
        activeStepIndex: 0,
      });
    } else {
      const evalSet = evaluateCanvasGraph(DEFAULT_STARTER_TEMPLATE.nodes, DEFAULT_STARTER_TEMPLATE.edges);
      set({
        activeModuleId: id,
        nodes: evalSet.updatedNodes,
        edges: DEFAULT_STARTER_TEMPLATE.edges,
        graphEvaluation: evalSet,
        activeTemplateId: DEFAULT_STARTER_TEMPLATE.id,
        activeStepIndex: 0,
      });
    }
  },

  recomputeGraph: (nodesOverride?: Node[], edgesOverride?: Edge[]) => {
    const currentNodes = nodesOverride ?? get().nodes;
    const currentEdges = edgesOverride ?? get().edges;
    const isLogic = get().activeModuleId === "logic";

    if (isLogic) {
      const evalLogic = evaluateLogicGraph(currentNodes, currentEdges);
      set({
        nodes: evalLogic.updatedNodes,
        logicEvaluation: evalLogic,
        activeStepIndex: 0,
      });
    } else {
      const evalSet = evaluateCanvasGraph(currentNodes, currentEdges);
      set({
        nodes: evalSet.updatedNodes,
        graphEvaluation: evalSet,
        activeStepIndex: 0,
      });
    }
  },

  setNodes: (nodes) => {
    const isLogic = get().activeModuleId === "logic";
    if (isLogic) {
      const evalLogic = evaluateLogicGraph(nodes, get().edges);
      set({ nodes: evalLogic.updatedNodes, logicEvaluation: evalLogic });
    } else {
      const evalSet = evaluateCanvasGraph(nodes, get().edges);
      set({ nodes: evalSet.updatedNodes, graphEvaluation: evalSet });
    }
  },

  setEdges: (edges) => {
    const isLogic = get().activeModuleId === "logic";
    if (isLogic) {
      const evalLogic = evaluateLogicGraph(get().nodes, edges);
      set({ edges, nodes: evalLogic.updatedNodes, logicEvaluation: evalLogic });
    } else {
      const evalSet = evaluateCanvasGraph(get().nodes, edges);
      set({ edges, nodes: evalSet.updatedNodes, graphEvaluation: evalSet });
    }
  },

  onNodesChange: (changes) => {
    const updated = applyNodeChanges(changes, get().nodes);
    const hasRemoval = changes.some((c) => c.type === "remove");
    if (hasRemoval) {
      const remainingIds = new Set(updated.map((n) => n.id));
      const cleanEdges = get().edges.filter(
        (e) => remainingIds.has(e.source) && remainingIds.has(e.target)
      );
      get().recomputeGraph(updated, cleanEdges);
    } else {
      set({ nodes: updated });
    }
  },

  onEdgesChange: (changes) => {
    const updatedEdges = applyEdgeChanges(changes, get().edges);
    get().recomputeGraph(get().nodes, updatedEdges);
  },

  addNode: (node) => {
    const updatedNodes = [...get().nodes, node];
    get().recomputeGraph(updatedNodes, get().edges);
    set({ selectedNodeId: node.id });
  },

  deleteNode: (id) => {
    const updatedNodes = get().nodes.filter((n) => n.id !== id);
    const updatedEdges = get().edges.filter((e) => e.source !== id && e.target !== id);
    get().recomputeGraph(updatedNodes, updatedEdges);
    set({ selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId });
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
    const isLogic = get().activeModuleId === "logic";
    if (isLogic) {
      const evalLogic = evaluateLogicGraph([], []);
      set({
        nodes: [],
        edges: [],
        selectedNodeId: null,
        logicEvaluation: evalLogic,
        activeTemplateId: null,
      });
    } else {
      const evalSet = evaluateCanvasGraph([], []);
      set({
        nodes: [],
        edges: [],
        selectedNodeId: null,
        graphEvaluation: evalSet,
        activeTemplateId: null,
      });
    }
  },

  loadTemplate: (templateId) => {
    const tmpl = WORKSPACE_TEMPLATES[templateId] ?? DEFAULT_STARTER_TEMPLATE;
    const isLogic = tmpl.moduleId === "logic" || get().activeModuleId === "logic";

    if (isLogic) {
      const evalLogic = evaluateLogicGraph(tmpl.nodes, tmpl.edges);
      set({
        nodes: evalLogic.updatedNodes,
        edges: tmpl.edges,
        selectedNodeId: null,
        logicEvaluation: evalLogic,
        activeTemplateId: tmpl.id,
      });
    } else {
      const evalSet = evaluateCanvasGraph(tmpl.nodes, tmpl.edges);
      set({
        nodes: evalSet.updatedNodes,
        edges: tmpl.edges,
        selectedNodeId: null,
        graphEvaluation: evalSet,
        activeTemplateId: tmpl.id,
      });
    }
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
        get().recomputeGraph(parsed.nodes, parsed.edges);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
