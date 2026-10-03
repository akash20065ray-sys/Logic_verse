import { create } from "zustand";
import type { Node, Edge, NodeChange, EdgeChange } from "@xyflow/react";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import { evaluateCanvasGraph, type GraphEvaluation } from "@/lib/algorithms/graph-evaluator";
import { evaluateLogicGraph, type LogicEvaluation } from "@/lib/algorithms/logic-graph-evaluator";
import {
  parseCanvasToAutomaton,
  simulateAutomaton,
  type AutomatonSimulation,
} from "@/lib/algorithms/automata";
import {
  WORKSPACE_TEMPLATES,
  DEFAULT_STARTER_TEMPLATE,
  DEFAULT_LOGIC_TEMPLATE,
  DEFAULT_AUTOMATA_TEMPLATE,
} from "@/lib/templates";

interface WorkspaceState {
  activeModuleId: string;
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;

  // Panel toggles & sizes
  aiPanelOpen: boolean;
  outputPanelOpen: boolean;
  paletteOpen: boolean;
  floatingPanelTab: "map-layers" | "palette";
  expressionModalOpen: boolean;

  // Map & Canvas Layers State
  mapLayerMode: "vector" | "topo" | "grid" | "blueprint" | "void";
  showGisBoundaries: boolean;
  showHeatmap: boolean;
  showNodeMarkers: boolean;
  showEdgeFlow: boolean;
  layerOpacity: number;
  customLayers: { id: string; name: string; type: string; visible: boolean }[];

  setFloatingPanelTab: (tab: "map-layers" | "palette") => void;
  setMapLayerMode: (mode: "vector" | "topo" | "grid" | "blueprint" | "void") => void;
  toggleGisBoundaries: () => void;
  toggleHeatmap: () => void;
  toggleNodeMarkers: () => void;
  toggleEdgeFlow: () => void;
  setLayerOpacity: (opacity: number) => void;
  addCustomLayer: (layer: { id: string; name: string; type: string; visible: boolean }) => void;
  toggleCustomLayer: (id: string) => void;
  outputTab:
    | "output"
    | "steps"
    | "formal-model"
    | "errors"
    | "induction"
    | "diagonalization"
    | "pie-solver"
    | "matrix"
    | "hasse"
    | "warshall"
    | "functions"
    | "automata-sim"
    | "nfa-dfa"
    | "minimization"
    | "moore-mealy"
    | "regex-test"
    | "regex-nfa"
    | "pumping-lemma-tab"
    | "myhill-nerode-tab"
    | "cfg-parse-tree"
    | "cfg-cnf-tab"
    | "cfg-cyk-tab"
    | "pda-stack-tab"
    | "tm-tape-tab";

  leftPanelWidth: number;
  rightPanelWidth: number;
  bottomPanelHeight: number;

  activeStepIndex: number;
  isPlayingSteps: boolean;
  graphEvaluation: GraphEvaluation;
  logicEvaluation: LogicEvaluation;

  // Automata Store Slice
  automataSubMode: "DFA" | "NFA" | "E-NFA" | "Moore" | "Mealy";
  automataInputString: string;
  automataSimulation: AutomatonSimulation;
  activeAutomataStepIndex: number;
  setAutomataSubMode: (mode: "DFA" | "NFA" | "E-NFA" | "Moore" | "Mealy") => void;
  setAutomataInputString: (str: string) => void;
  setAutomataStepIndex: (idx: number) => void;

  // Regex Store Slice
  regexSubMode: "regex-builder" | "re-to-nfa" | "pumping-lemma" | "myhill-nerode";
  regexPattern: string;
  regexTestString: string;
  setRegexSubMode: (mode: "regex-builder" | "re-to-nfa" | "pumping-lemma" | "myhill-nerode") => void;
  setRegexPattern: (pat: string) => void;
  setRegexTestString: (str: string) => void;

  // Relations Store Slice
  relationsSubMode: "matrix" | "hasse" | "warshall" | "functions";
  setRelationsSubMode: (mode: "matrix" | "hasse" | "warshall" | "functions") => void;

  // CFG Store Slice
  cfgSubMode: "grammar-builder" | "parse-tree" | "cnf-gnf" | "cyk";
  cfgRawRules: string;
  cfgInputString: string;
  setCfgSubMode: (mode: "grammar-builder" | "parse-tree" | "cnf-gnf" | "cyk") => void;
  setCfgRawRules: (rules: string) => void;
  setCfgInputString: (str: string) => void;

  // PDA Store Slice
  pdaSubMode: "pda-builder" | "stack-sim";
  pdaInputString: string;
  activePdaStepIndex: number;
  setPdaSubMode: (mode: "pda-builder" | "stack-sim") => void;
  setPdaInputString: (str: string) => void;
  setPdaStepIndex: (idx: number) => void;

  // TM Store Slice
  tmSubMode: "tm-builder" | "tape-sim";
  tmInputString: string;
  activeTmStepIndex: number;
  setTmSubMode: (mode: "tm-builder" | "tape-sim") => void;
  setTmInputString: (str: string) => void;
  setTmStepIndex: (idx: number) => void;

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
  togglePalette: () => void;
  setPaletteOpen: (open: boolean) => void;
  toggleExpressionModal: () => void;
  setExpressionModalOpen: (open: boolean) => void;

  setLeftPanelWidth: (w: number) => void;
  setRightPanelWidth: (w: number) => void;
  setBottomPanelHeight: (h: number) => void;

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

const initialSetEval = evaluateCanvasGraph([], []);
const initialLogicEval = evaluateLogicGraph([], []);
const initialAutomatonDef = parseCanvasToAutomaton([], []);
const initialAutomataSim = simulateAutomaton(initialAutomatonDef, "");

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeModuleId: "set-theory",
  nodes: [],
  edges: [],
  selectedNodeId: null,

  aiPanelOpen: true,
  outputPanelOpen: true,
  paletteOpen: true,
  floatingPanelTab: "map-layers",
  expressionModalOpen: false,

  mapLayerMode: "vector",
  showGisBoundaries: true,
  showHeatmap: true,
  showNodeMarkers: true,
  showEdgeFlow: true,
  layerOpacity: 0.85,
  customLayers: [
    { id: "layer-1", name: "District Boundaries", type: "spatial", visible: true },
    { id: "layer-2", name: "Set Region Overlay", type: "set", visible: true },
    { id: "layer-3", name: "Cardinality Density", type: "heatmap", visible: true },
  ],

  setFloatingPanelTab: (tab) => set({ floatingPanelTab: tab }),
  setMapLayerMode: (mode) => set({ mapLayerMode: mode }),
  toggleGisBoundaries: () => set({ showGisBoundaries: !get().showGisBoundaries }),
  toggleHeatmap: () => set({ showHeatmap: !get().showHeatmap }),
  toggleNodeMarkers: () => set({ showNodeMarkers: !get().showNodeMarkers }),
  toggleEdgeFlow: () => set({ showEdgeFlow: !get().showEdgeFlow }),
  setLayerOpacity: (opacity) => set({ layerOpacity: opacity }),
  addCustomLayer: (layer) => set({ customLayers: [...get().customLayers, layer] }),
  toggleCustomLayer: (id) =>
    set({
      customLayers: get().customLayers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    }),
  outputTab: "output",

  leftPanelWidth: 260,
  rightPanelWidth: 320,
  bottomPanelHeight: 260,

  activeStepIndex: 0,
  isPlayingSteps: false,
  graphEvaluation: initialSetEval,
  logicEvaluation: initialLogicEval,

  automataSubMode: "DFA",
  automataInputString: "101",
  automataSimulation: initialAutomataSim,
  activeAutomataStepIndex: 0,

  setAutomataSubMode: (mode) => set({ automataSubMode: mode }),
  setAutomataInputString: (str: string) => {
    set({ automataInputString: str });
    get().recomputeGraph();
  },

  setAutomataStepIndex: (idx: number) => {
    set({ activeAutomataStepIndex: idx });
  },

  regexSubMode: "regex-builder",
  regexPattern: "a(b|c)*",
  regexTestString: "abbc",

  setRegexSubMode: (mode) => set({ regexSubMode: mode }),
  setRegexPattern: (pat: string) => set({ regexPattern: pat }),
  setRegexTestString: (str: string) => set({ regexTestString: str }),

  relationsSubMode: "matrix",
  setRelationsSubMode: (mode) => set({ relationsSubMode: mode }),

  cfgSubMode: "grammar-builder",
  cfgRawRules: "S -> A B | a\nA -> a S | a\nB -> b",
  cfgInputString: "aab",

  setCfgSubMode: (mode) => set({ cfgSubMode: mode }),
  setCfgRawRules: (rules: string) => set({ cfgRawRules: rules }),
  setCfgInputString: (str: string) => set({ cfgInputString: str }),

  pdaSubMode: "pda-builder",
  pdaInputString: "aabb",
  activePdaStepIndex: 0,

  setPdaSubMode: (mode) => set({ pdaSubMode: mode }),
  setPdaInputString: (str: string) => set({ pdaInputString: str }),
  setPdaStepIndex: (idx: number) => set({ activePdaStepIndex: idx }),

  tmSubMode: "tm-builder",
  tmInputString: "1011",
  activeTmStepIndex: 0,

  setTmSubMode: (mode) => set({ tmSubMode: mode }),
  setTmInputString: (str: string) => set({ tmInputString: str }),
  setTmStepIndex: (idx: number) => set({ activeTmStepIndex: idx }),

  saveStatus: null,
  activeTemplateId: null,

  setActiveModule: (id) => {
    const current = get().activeModuleId;
    if (current === id) return;

    if (id === "logic") {
      const evalLogic = evaluateLogicGraph([], []);
      set({
        activeModuleId: id,
        nodes: [],
        edges: [],
        logicEvaluation: evalLogic,
        activeTemplateId: null,
        activeStepIndex: 0,
        outputTab: "output",
      });
    } else if (id === "automata") {
      const automaton = parseCanvasToAutomaton([], []);
      const sim = simulateAutomaton(automaton, get().automataInputString);
      set({
        activeModuleId: id,
        nodes: [],
        edges: [],
        automataSimulation: sim,
        activeAutomataStepIndex: 0,
        activeTemplateId: null,
        outputTab: "automata-sim",
      });
    } else if (id === "regex") {
      set({
        activeModuleId: id,
        nodes: [],
        edges: [],
        activeTemplateId: null,
        outputTab: "regex-test",
      });
    } else if (id === "cfg") {
      set({
        activeModuleId: id,
        nodes: [],
        edges: [],
        activeTemplateId: null,
        outputTab: "cfg-parse-tree",
      });
    } else if (id === "pda-tm") {
      set({
        activeModuleId: id,
        nodes: [],
        edges: [],
        activeTemplateId: null,
        outputTab: "pda-stack-tab",
        activePdaStepIndex: 0,
      });
    } else if (id === "relations-functions") {
      const evalSet = evaluateCanvasGraph([], []);
      set({
        activeModuleId: id,
        nodes: [],
        edges: [],
        graphEvaluation: evalSet,
        activeTemplateId: null,
        activeStepIndex: 0,
        outputTab: "matrix",
      });
    } else {
      const evalSet = evaluateCanvasGraph([], []);
      set({
        activeModuleId: id,
        nodes: [],
        edges: [],
        graphEvaluation: evalSet,
        activeTemplateId: null,
        activeStepIndex: 0,
        outputTab: "output",
      });
    }
  },

  recomputeGraph: (nodesOverride?: Node[], edgesOverride?: Edge[]) => {
    const currentNodes = nodesOverride ?? get().nodes;
    const currentEdges = edgesOverride ?? get().edges;
    const module = get().activeModuleId;

    if (module === "logic") {
      const evalLogic = evaluateLogicGraph(currentNodes, currentEdges);
      set({
        nodes: evalLogic.updatedNodes,
        edges: currentEdges,
        logicEvaluation: evalLogic,
        activeStepIndex: 0,
      });
    } else if (module === "automata") {
      const automaton = parseCanvasToAutomaton(currentNodes, currentEdges);
      const sim = simulateAutomaton(automaton, get().automataInputString);
      set({
        nodes: currentNodes,
        edges: currentEdges,
        automataSimulation: sim,
        activeAutomataStepIndex: Math.min(get().activeAutomataStepIndex, Math.max(0, sim.steps.length - 1)),
      });
    } else {
      const evalSet = evaluateCanvasGraph(currentNodes, currentEdges);
      set({
        nodes: evalSet.updatedNodes,
        edges: currentEdges,
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
  togglePalette: () => set({ paletteOpen: !get().paletteOpen }),
  setPaletteOpen: (open) => set({ paletteOpen: open }),
  toggleExpressionModal: () => set({ expressionModalOpen: !get().expressionModalOpen }),
  setExpressionModalOpen: (open) => set({ expressionModalOpen: open }),

  setLeftPanelWidth: (w) => set({ leftPanelWidth: Math.max(180, Math.min(w, 480)) }),
  setRightPanelWidth: (w) => set({ rightPanelWidth: Math.max(220, Math.min(w, 600)) }),
  setBottomPanelHeight: (h) => set({ bottomPanelHeight: Math.max(140, Math.min(h, 550)) }),

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
    try {
      if (typeof window !== "undefined") {
        const mod = get().activeModuleId;
        localStorage.removeItem(`logicverse_project_${mod}`);
      }
    } catch {}
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
