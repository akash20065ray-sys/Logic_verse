"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkspaceStore } from "@/store/workspace-store";
import { SetNode, type SetNodeData } from "./nodes/set-node";
import { OperationNode } from "./nodes/operation-node";
import { ResultNode } from "./nodes/result-node";
import { LogicVarNode } from "./nodes/logic-var-node";
import { LogicOpNode } from "./nodes/logic-op-node";
import { LogicResultNode } from "./nodes/logic-result-node";
import { AutomataStateNode } from "./nodes/automata-state-node";
import { SetFormModal, type SetFormValues } from "./set-form-modal";
import { AutomataStateModal, type AutomataStateFormValues } from "./automata-state-modal";
import { CanvasPalette } from "./canvas-palette";
import { LogicPalette } from "./logic-palette";
import { AutomataPalette } from "./automata-palette";

const NODE_TYPES = {
  set: SetNode,
  operation: OperationNode,
  result: ResultNode,
  "logic-var": LogicVarNode,
  "logic-op": LogicOpNode,
  "logic-result": LogicResultNode,
  "automata-state": AutomataStateNode,
};

export function WorkspaceCanvas() {
  const nodes = useWorkspaceStore((s) => s.nodes);
  const edges = useWorkspaceStore((s) => s.edges);
  const onNodesChange = useWorkspaceStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkspaceStore((s) => s.onEdgesChange);
  const setEdges = useWorkspaceStore((s) => s.setEdges);
  const setNodes = useWorkspaceStore((s) => s.setNodes);
  const selectNode = useWorkspaceStore((s) => s.selectNode);
  const selectedNodeId = useWorkspaceStore((s) => s.selectedNodeId);
  const deleteNode = useWorkspaceStore((s) => s.deleteNode);
  const activeModuleId = useWorkspaceStore((s) => s.activeModuleId);
  const loadSavedProject = useWorkspaceStore((s) => s.loadSavedProject);
  const loadTemplate = useWorkspaceStore((s) => s.loadTemplate);

  const automataSimulation = useWorkspaceStore((s) => s.automataSimulation);
  const activeAutomataStepIndex = useWorkspaceStore((s) => s.activeAutomataStepIndex);

  const [editingSetNode, setEditingSetNode] = useState<Node | null>(null);
  const [editingAutomataNode, setEditingAutomataNode] = useState<Node | null>(null);

  const nodeTypes = useMemo(() => NODE_TYPES, []);

  // Try loading saved project on first mount or load default starter
  useEffect(() => {
    const loaded = loadSavedProject();
    if (!loaded && nodes.length === 0) {
      if (activeModuleId === "logic") {
        loadTemplate("modus-ponens");
      } else if (activeModuleId === "automata") {
        loadTemplate("dfa-ending-01");
      } else {
        loadTemplate("union-intersection");
      }
    }
  }, [activeModuleId]);

  // Dynamic active transition edge highlighting during simulation
  const currentStep = automataSimulation?.steps?.[activeAutomataStepIndex];
  const activeEdgeIds = currentStep?.activeEdgeIds || [];

  const styledEdges = useMemo(() => {
    if (activeModuleId !== "automata" || activeEdgeIds.length === 0) {
      return edges;
    }
    return edges.map((e) => {
      const isActive = activeEdgeIds.includes(e.id);
      return {
        ...e,
        animated: isActive,
        style: isActive
          ? { stroke: "#38BDF8", strokeWidth: 4, filter: "drop-shadow(0 0 6px #38BDF8)" }
          : { stroke: "#1E293B", strokeWidth: 1.5, opacity: 0.5 },
      };
    });
  }, [edges, activeModuleId, activeEdgeIds]);

  // Keyboard shortcut: Delete or Backspace to delete selected node
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedNodeId &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        deleteNode(selectedNodeId);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeId, deleteNode]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const isLogic = activeModuleId === "logic";
      const isAutomata = activeModuleId === "automata";
      const symbol = isAutomata ? prompt("Transition Symbol (e.g. 0, 1, ε):", "0") || "0" : "";

      const newEdge: Edge = {
        ...connection,
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        animated: true,
        label: isAutomata ? symbol : undefined,
        style: {
          stroke: isAutomata ? "#38BDF8" : isLogic ? "var(--lv-cyan)" : "var(--lv-blue)",
          strokeWidth: 2,
        },
      };
      const newEdges = addEdge(newEdge, edges);
      setEdges(newEdges);
    },
    [edges, setEdges, activeModuleId]
  );

  function handleSetEditSubmit(values: SetFormValues) {
    if (!editingSetNode) return;
    const currentNodes = useWorkspaceStore.getState().nodes;
    const updatedNodes = currentNodes.map((n) =>
      n.id === editingSetNode.id
        ? { ...n, data: { ...n.data, label: values.label, elements: values.elements } }
        : n
    );
    setNodes(updatedNodes);
    setEditingSetNode(null);
  }

  function handleAutomataEditSubmit(values: AutomataStateFormValues) {
    if (!editingAutomataNode) return;
    const currentNodes = useWorkspaceStore.getState().nodes;
    const updatedNodes = currentNodes.map((n) => {
      if (n.id === editingAutomataNode.id) {
        return {
          ...n,
          data: {
            ...n.data,
            label: values.label,
            isStart: values.isStart,
            isAccept: values.isAccept,
            mooreOutput: values.mooreOutput,
          },
        };
      }
      // Unset start flag if editing to be start
      if (values.isStart) {
        return { ...n, data: { ...n.data, isStart: false } };
      }
      return n;
    });
    setNodes(updatedNodes);
    setEditingAutomataNode(null);
  }

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={() => selectNode(null)}
        onNodeClick={(_, node) => selectNode(node.id)}
        onNodeDoubleClick={(_, node) => {
          if (node.type === "set") setEditingSetNode(node);
          if (node.type === "automata-state") setEditingAutomataNode(node);
        }}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          style: { stroke: "var(--lv-border)", strokeWidth: 2 },
          animated: true,
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1D2A40" />
        <Controls
          className="!border !border-lv-border !bg-lv-panel [&_button]:!border-lv-border-soft [&_button]:!bg-lv-panel [&_button]:!fill-lv-muted [&_button:hover]:!bg-lv-surface"
          showInteractive={false}
        />
        <MiniMap
          className="!border !border-lv-border !bg-lv-panel"
          maskColor="rgba(7,11,20,0.7)"
          nodeColor="#1D2A40"
        />
      </ReactFlow>

      {/* Floating Dynamic Palette according to active module */}
      {activeModuleId === "logic" ? (
        <LogicPalette />
      ) : activeModuleId === "automata" ? (
        <AutomataPalette />
      ) : (
        <CanvasPalette />
      )}

      {editingSetNode && (
        <SetFormModal
          open={!!editingSetNode}
          title={`Edit set ${(editingSetNode.data as unknown as SetNodeData).label}`}
          initial={{
            label: (editingSetNode.data as unknown as SetNodeData).label,
            elements: (editingSetNode.data as unknown as SetNodeData).elements,
          }}
          onSubmit={handleSetEditSubmit}
          onClose={() => setEditingSetNode(null)}
        />
      )}

      {editingAutomataNode && (
        <AutomataStateModal
          open={!!editingAutomataNode}
          title={`Edit state ${(editingAutomataNode.data as unknown as AutomataStateFormValues).label}`}
          initial={{
            label: (editingAutomataNode.data as unknown as AutomataStateFormValues).label || "",
            isStart: Boolean(editingAutomataNode.data?.isStart),
            isAccept: Boolean(editingAutomataNode.data?.isAccept),
            mooreOutput: (editingAutomataNode.data?.mooreOutput as string) || "0",
          }}
          onSubmit={handleAutomataEditSubmit}
          onClose={() => setEditingAutomataNode(null)}
        />
      )}
    </div>
  );
}

