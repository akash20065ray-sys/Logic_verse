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
import { SetFormModal, type SetFormValues } from "./set-form-modal";
import { CanvasPalette } from "./canvas-palette";
import { LogicPalette } from "./logic-palette";

const NODE_TYPES = {
  set: SetNode,
  operation: OperationNode,
  result: ResultNode,
  "logic-var": LogicVarNode,
  "logic-op": LogicOpNode,
  "logic-result": LogicResultNode,
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

  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const nodeTypes = useMemo(() => NODE_TYPES, []);

  // Try loading saved project on first mount or load default starter
  useEffect(() => {
    const loaded = loadSavedProject();
    if (!loaded && nodes.length === 0) {
      if (activeModuleId === "logic") {
        loadTemplate("modus-ponens");
      } else {
        loadTemplate("union-intersection");
      }
    }
  }, [activeModuleId]);

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
      const newEdge: Edge = {
        ...connection,
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        animated: true,
        style: {
          stroke: isLogic ? "var(--lv-cyan)" : "var(--lv-blue)",
          strokeWidth: 2,
        },
      };
      const newEdges = addEdge(newEdge, edges);
      setEdges(newEdges);
    },
    [edges, setEdges, activeModuleId]
  );

  function handleEditSubmit(values: SetFormValues) {
    if (!editingNode) return;
    const currentNodes = useWorkspaceStore.getState().nodes;
    const updatedNodes = currentNodes.map((n) =>
      n.id === editingNode.id
        ? { ...n, data: { ...n.data, label: values.label, elements: values.elements } }
        : n
    );
    setNodes(updatedNodes);
    setEditingNode(null);
  }

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={() => selectNode(null)}
        onNodeClick={(_, node) => selectNode(node.id)}
        onNodeDoubleClick={(_, node) => {
          if (node.type === "set") setEditingNode(node);
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
      {activeModuleId === "logic" ? <LogicPalette /> : <CanvasPalette />}

      {editingNode && (
        <SetFormModal
          open={!!editingNode}
          title={`Edit set ${(editingNode.data as unknown as SetNodeData).label}`}
          initial={{
            label: (editingNode.data as unknown as SetNodeData).label,
            elements: (editingNode.data as unknown as SetNodeData).elements,
          }}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingNode(null)}
        />
      )}
    </div>
  );
}
