"use client";

import { useState } from "react";
import {
  Layers,
  Eye,
  EyeOff,
  Plus,
  Sliders,
  MapPin,
  Globe,
  Grid,
  Zap,
  Flame,
  Palette,
  X,
  ChevronDown,
  Sparkles,
  Combine,
  Layers3,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { SetFormModal, type SetFormValues } from "./set-form-modal";
import { WORKSPACE_TEMPLATES } from "@/lib/templates";
import type { SetOperationSymbol } from "@/lib/algorithms/set-theory";

const ACCENTS: ("blue" | "purple" | "cyan")[] = ["blue", "purple", "cyan"];
let setCounter = 0;

const PRESET_SETS = [
  { label: "Primes P", elements: [2, 3, 5, 7, 11, 13] },
  { label: "Evens E", elements: [2, 4, 6, 8, 10, 12] },
  { label: "Odds O", elements: [1, 3, 5, 7, 9, 11] },
  { label: "Vowels V", elements: ["a", "e", "i", "o", "u"] },
  { label: "Fibonacci F", elements: [1, 2, 3, 5, 8, 13] },
];

export function MapLayersPanel() {
  const paletteOpen = useWorkspaceStore((s) => s.paletteOpen);
  const setPaletteOpen = useWorkspaceStore((s) => s.setPaletteOpen);
  const floatingPanelTab = useWorkspaceStore((s) => s.floatingPanelTab);
  const setFloatingPanelTab = useWorkspaceStore((s) => s.setFloatingPanelTab);

  // Layer State
  const mapLayerMode = useWorkspaceStore((s) => s.mapLayerMode);
  const setMapLayerMode = useWorkspaceStore((s) => s.setMapLayerMode);
  const showGisBoundaries = useWorkspaceStore((s) => s.showGisBoundaries);
  const toggleGisBoundaries = useWorkspaceStore((s) => s.toggleGisBoundaries);
  const showHeatmap = useWorkspaceStore((s) => s.showHeatmap);
  const toggleHeatmap = useWorkspaceStore((s) => s.toggleHeatmap);
  const showNodeMarkers = useWorkspaceStore((s) => s.showNodeMarkers);
  const toggleNodeMarkers = useWorkspaceStore((s) => s.toggleNodeMarkers);
  const showEdgeFlow = useWorkspaceStore((s) => s.showEdgeFlow);
  const toggleEdgeFlow = useWorkspaceStore((s) => s.toggleEdgeFlow);
  const layerOpacity = useWorkspaceStore((s) => s.layerOpacity);
  const setLayerOpacity = useWorkspaceStore((s) => s.setLayerOpacity);
  const customLayers = useWorkspaceStore((s) => s.customLayers);
  const toggleCustomLayer = useWorkspaceStore((s) => s.toggleCustomLayer);
  const addCustomLayer = useWorkspaceStore((s) => s.addCustomLayer);

  // Component Palette State
  const addNode = useWorkspaceStore((s) => s.addNode);
  const nodes = useWorkspaceStore((s) => s.nodes);
  const clearCanvas = useWorkspaceStore((s) => s.clearCanvas);
  const loadTemplate = useWorkspaceStore((s) => s.loadTemplate);
  const [formOpen, setFormOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [addLayerModalOpen, setAddLayerModalOpen] = useState(false);
  const [newLayerName, setNewLayerName] = useState("");
  const [newLayerType, setNewLayerType] = useState("spatial");

  function getSmartPosition(type: "set" | "operation" | "result") {
    const existing = nodes.filter((n) => n.type === type);
    const count = existing.length;
    if (type === "set") return { x: 80, y: 80 + count * 140 };
    if (type === "operation") return { x: 340, y: 120 + count * 130 };
    return { x: 540, y: 120 + count * 130 };
  }

  function handleAddSet(values: SetFormValues) {
    const accent = ACCENTS[setCounter % ACCENTS.length];
    setCounter++;
    addNode({
      id: `set-${crypto.randomUUID()}`,
      type: "set",
      position: getSmartPosition("set"),
      data: { label: values.label, kind: "set", elements: values.elements, accent },
    });
    setFormOpen(false);
  }

  function handleAddPresetSet(preset: { label: string; elements: (string | number)[] }) {
    const accent = ACCENTS[setCounter % ACCENTS.length];
    setCounter++;
    addNode({
      id: `set-${crypto.randomUUID()}`,
      type: "set",
      position: getSmartPosition("set"),
      data: { label: preset.label.split(" ")[0], kind: "set", elements: preset.elements, accent },
    });
    setPresetsOpen(false);
  }

  function addOperation(symbol: SetOperationSymbol, label: string) {
    addNode({
      id: `op-${crypto.randomUUID()}`,
      type: "operation",
      position: getSmartPosition("operation"),
      data: { label, kind: "operation", symbol },
    });
  }

  function addResult() {
    addNode({
      id: `result-${crypto.randomUUID()}`,
      type: "result",
      position: getSmartPosition("result"),
      data: { label: "Result", kind: "result", elements: [] },
    });
  }

  function handleCreateLayer(e: React.FormEvent) {
    e.preventDefault();
    if (!newLayerName.trim()) return;
    addCustomLayer({
      id: `layer-${Date.now()}`,
      name: newLayerName.trim(),
      type: newLayerType,
      visible: true,
    });
    setNewLayerName("");
    setAddLayerModalOpen(false);
  }

  if (!paletteOpen) {
    return (
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-lv-border bg-lv-panel/90 px-3.5 py-2 text-xs font-semibold text-lv-text shadow-xl backdrop-blur-xl hover:bg-lv-surface hover:border-lv-cyan transition-all group"
        title="Open Canvas Map Layers & Control Panel"
      >
        <Layers className="w-4 h-4 text-lv-cyan group-hover:scale-110 transition-transform" />
        <span>Map Layers</span>
        <span className="rounded-full bg-lv-cyan/20 px-2 py-0.5 font-mono text-[10px] text-lv-cyan font-bold">
          {4 + customLayers.filter((l) => l.visible).length}
        </span>
      </button>
    );
  }

  return (
    <>
      <div className="absolute left-4 top-4 z-20 flex flex-col w-72 max-h-[calc(100vh-140px)] rounded-2xl border border-lv-border bg-lv-panel/95 p-2.5 shadow-2xl shadow-black/70 backdrop-blur-xl lv-glass overflow-hidden transition-all">
        {/* Header with Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-lv-border-soft pb-2 mb-2">
          <div className="flex items-center gap-1 rounded-xl bg-lv-surface/80 p-0.5 border border-lv-border-soft">
            <button
              type="button"
              onClick={() => setFloatingPanelTab("map-layers")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                floatingPanelTab === "map-layers"
                  ? "bg-lv-cyan text-slate-950 shadow-md shadow-lv-cyan/30"
                  : "text-lv-muted hover:text-lv-text"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Map Layers</span>
            </button>

            <button
              type="button"
              onClick={() => setFloatingPanelTab("palette")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                floatingPanelTab === "palette"
                  ? "bg-lv-blue text-white shadow-md shadow-lv-blue/30"
                  : "text-lv-muted hover:text-lv-text"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Palette</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setPaletteOpen(false)}
            className="rounded-lg p-1 text-lv-faint hover:text-lv-text hover:bg-lv-surface transition-colors"
            title="Minimize Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TAB 1: MAP LAYERS CONTENT */}
        {floatingPanelTab === "map-layers" ? (
          <div className="lv-scrollbar overflow-y-auto space-y-3 pr-1 text-xs">
            {/* Add Layer Primary Action */}
            <button
              type="button"
              onClick={() => setAddLayerModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lv-cyan/20 to-lv-blue/20 border border-lv-cyan/40 px-3 py-2 font-semibold text-lv-cyan hover:from-lv-cyan/30 hover:to-lv-blue/30 transition-all active:scale-98 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Map Layer</span>
            </button>

            {/* BASE MAP ENGINE */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-lv-faint font-semibold">
                <span className="flex items-center gap-1">
                  <Grid className="w-3 h-3 text-lv-cyan" /> Basemap Engine
                </span>
                <span className="text-lv-muted">{mapLayerMode}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setMapLayerMode("vector")}
                  className={`flex items-center gap-1.5 rounded-lg border p-2 text-left transition-all ${
                    mapLayerMode === "vector"
                      ? "border-lv-cyan bg-lv-cyan/15 text-lv-cyan font-medium"
                      : "border-lv-border-soft bg-lv-surface/40 text-lv-muted hover:border-lv-border hover:text-lv-text"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Dark Vector</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMapLayerMode("topo")}
                  className={`flex items-center gap-1.5 rounded-lg border p-2 text-left transition-all ${
                    mapLayerMode === "topo"
                      ? "border-lv-cyan bg-lv-cyan/15 text-lv-cyan font-medium"
                      : "border-lv-border-soft bg-lv-surface/40 text-lv-muted hover:border-lv-border hover:text-lv-text"
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">GIS Topo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMapLayerMode("blueprint")}
                  className={`flex items-center gap-1.5 rounded-lg border p-2 text-left transition-all ${
                    mapLayerMode === "blueprint"
                      ? "border-lv-cyan bg-lv-cyan/15 text-lv-cyan font-medium"
                      : "border-lv-border-soft bg-lv-surface/40 text-lv-muted hover:border-lv-border hover:text-lv-text"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Blueprint</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMapLayerMode("grid")}
                  className={`flex items-center gap-1.5 rounded-lg border p-2 text-left transition-all ${
                    mapLayerMode === "grid"
                      ? "border-lv-cyan bg-lv-cyan/15 text-lv-cyan font-medium"
                      : "border-lv-border-soft bg-lv-surface/40 text-lv-muted hover:border-lv-border hover:text-lv-text"
                  }`}
                >
                  <Grid className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Dot Grid</span>
                </button>
              </div>
            </div>

            <div className="h-px bg-lv-border-soft" />

            {/* ACTIVE SPATIAL & MODEL LAYERS */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-lv-faint font-semibold flex items-center justify-between">
                <span>Active Layers</span>
                <span className="text-[9px] text-lv-cyan">
                  {4 + customLayers.filter((l) => l.visible).length} visible
                </span>
              </div>

              {/* Layer 1: GIS Boundaries */}
              <LayerToggleRow
                icon={Globe}
                label="GIS Spatial Boundaries"
                subLabel="District & region polygons"
                active={showGisBoundaries}
                onToggle={toggleGisBoundaries}
                color="text-emerald-400"
              />

              {/* Layer 2: Node Markers */}
              <LayerToggleRow
                icon={MapPin}
                label="Node Points & Data Badges"
                subLabel="Set A, B & Operation cards"
                active={showNodeMarkers}
                onToggle={toggleNodeMarkers}
                color="text-sky-400"
              />

              {/* Layer 3: Edge Flow */}
              <LayerToggleRow
                icon={Zap}
                label="Flow Stream & Transitions"
                subLabel="Animated graph connection arcs"
                active={showEdgeFlow}
                onToggle={toggleEdgeFlow}
                color="text-cyan-400"
              />

              {/* Layer 4: Cardinality Heatmap */}
              <LayerToggleRow
                icon={Flame}
                label="Cardinality Density Heatmap"
                subLabel="Set overlap heat overlay"
                active={showHeatmap}
                onToggle={toggleHeatmap}
                color="text-amber-400"
              />

              {/* Custom User Layers */}
              {customLayers.map((layer) => (
                <LayerToggleRow
                  key={layer.id}
                  icon={Layers}
                  label={layer.name}
                  subLabel={`Custom ${layer.type} overlay`}
                  active={layer.visible}
                  onToggle={() => toggleCustomLayer(layer.id)}
                  color="text-purple-400"
                />
              ))}
            </div>

            <div className="h-px bg-lv-border-soft" />

            {/* LAYER OPACITY CONTROLLER */}
            <div className="space-y-1.5 p-2 rounded-xl bg-lv-surface/40 border border-lv-border-soft">
              <div className="flex items-center justify-between text-xs text-lv-muted font-medium">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-lv-cyan" /> Layer Opacity
                </span>
                <span className="font-mono text-[10px] text-lv-cyan">
                  {Math.round(layerOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={layerOpacity}
                onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-lv-border rounded-lg appearance-none cursor-pointer accent-lv-cyan"
              />
            </div>
          </div>
        ) : (
          /* TAB 2: PALETTE CONTENT */
          <div className="lv-scrollbar overflow-y-auto space-y-1 pr-1">
            <PaletteButton icon={Plus} label="Add Set" onClick={() => setFormOpen(true)} accent />

            {/* Presets dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setPresetsOpen(!presetsOpen);
                  setTemplatesOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-lv-muted transition-colors hover:bg-lv-surface hover:text-lv-text"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-lv-purple" />
                  Preset Sets
                </span>
                <ChevronDown className="h-3 w-3 text-lv-faint" />
              </button>

              {presetsOpen && (
                <div className="absolute left-full top-0 ml-2 z-50 w-44 rounded-xl border border-lv-border bg-lv-panel/95 p-1.5 shadow-2xl backdrop-blur-xl">
                  <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-lv-faint">
                    Quick Sets
                  </div>
                  {PRESET_SETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleAddPresetSet(p)}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs text-lv-muted hover:bg-lv-surface hover:text-lv-text text-left"
                    >
                      <span>{p.label}</span>
                      <span className="font-mono text-[10px] text-lv-faint">n={p.elements.length}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="my-1 h-px bg-lv-border-soft" />

            <div className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-lv-faint">
              Binary Operations
            </div>
            <PaletteButton icon={Combine} label="Union ∪" onClick={() => addOperation("∪", "Union")} />
            <PaletteButton icon={Combine} label="Intersect ∩" onClick={() => addOperation("∩", "Intersection")} />
            <PaletteButton icon={Combine} label="Difference −" onClick={() => addOperation("−", "Difference")} />
            <PaletteButton icon={Combine} label="Symmetric Diff ⊕" onClick={() => addOperation("⊕", "Symmetric Diff")} />
            <PaletteButton icon={Combine} label="Cartesian Prod ×" onClick={() => addOperation("×", "Cartesian Product")} />

            <div className="my-1 h-px bg-lv-border-soft" />

            <div className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-lv-faint">
              Unary Operations
            </div>
            <PaletteButton icon={Combine} label="Power Set 𝒫" onClick={() => addOperation("𝒫", "Power Set")} />
            <PaletteButton icon={Combine} label="Cardinality |·|" onClick={() => addOperation("|·|", "Cardinality")} />

            <div className="my-1 h-px bg-lv-border-soft" />

            <PaletteButton icon={Layers3} label="Add Result" onClick={addResult} />

            <div className="my-1 h-px bg-lv-border-soft" />

            {/* Templates dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setTemplatesOpen(!templatesOpen);
                  setPresetsOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-lv-cyan transition-colors hover:bg-lv-surface"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-lv-cyan" />
                  Templates
                </span>
                <ChevronDown className="h-3 w-3 text-lv-faint" />
              </button>

              {templatesOpen && (
                <div className="absolute left-full bottom-0 ml-2 z-50 w-56 rounded-xl border border-lv-border bg-lv-panel/95 p-1.5 shadow-2xl backdrop-blur-xl space-y-0.5">
                  <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-lv-faint">
                    Load Example Model
                  </div>
                  {Object.values(WORKSPACE_TEMPLATES).map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        loadTemplate(tmpl.id);
                        setTemplatesOpen(false);
                      }}
                      className="flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left hover:bg-lv-surface text-lv-muted hover:text-lv-text transition-colors"
                    >
                      <span className="text-xs font-medium text-lv-text">{tmpl.title}</span>
                      <span className="text-[10px] text-lv-faint line-clamp-1">{tmpl.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={clearCanvas}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-lv-faint transition-colors hover:bg-lv-surface hover:text-lv-error w-full"
            >
              <RotateCcw className="h-3 w-3" />
              Clear canvas
            </button>
          </div>
        )}
      </div>

      {/* Set Form Modal */}
      <SetFormModal
        open={formOpen}
        title="Add a new set"
        onSubmit={handleAddSet}
        onClose={() => setFormOpen(false)}
      />

      {/* Add Custom Map Layer Modal */}
      {addLayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-lv-border bg-lv-panel p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-lv-border-soft pb-2">
              <h3 className="text-sm font-bold text-lv-text flex items-center gap-2">
                <Layers className="w-4 h-4 text-lv-cyan" /> Add Custom Map Layer
              </h3>
              <button
                type="button"
                onClick={() => setAddLayerModalOpen(false)}
                className="text-xs text-lv-faint hover:text-lv-text"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLayer} className="space-y-3 text-xs">
              <div>
                <label className="block text-lv-muted font-medium mb-1">Layer Name</label>
                <input
                  type="text"
                  placeholder="e.g. County Boundaries / Heat Zone"
                  value={newLayerName}
                  onChange={(e) => setNewLayerName(e.target.value)}
                  className="w-full rounded-xl border border-lv-border bg-lv-surface px-3 py-2 text-lv-text focus:border-lv-cyan focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-lv-muted font-medium mb-1">Layer Type</label>
                <select
                  value={newLayerType}
                  onChange={(e) => setNewLayerType(e.target.value)}
                  className="w-full rounded-xl border border-lv-border bg-lv-surface px-3 py-2 text-lv-text focus:border-lv-cyan focus:outline-none"
                >
                  <option value="spatial">Spatial Boundary Overlay</option>
                  <option value="heatmap">Density Heatmap Layer</option>
                  <option value="vector">Vector Arcs Layer</option>
                  <option value="set">Set Region Overlay</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddLayerModalOpen(false)}
                  className="rounded-xl px-3 py-1.5 text-lv-muted hover:bg-lv-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newLayerName.trim()}
                  className="rounded-xl bg-lv-cyan px-4 py-1.5 font-semibold text-slate-950 shadow-md disabled:opacity-50"
                >
                  Create Layer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function LayerToggleRow({
  icon: Icon,
  label,
  subLabel,
  active,
  onToggle,
  color,
}: {
  icon: typeof Globe;
  label: string;
  subLabel: string;
  active: boolean;
  onToggle: () => void;
  color: string;
}) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-center justify-between rounded-xl border p-2 transition-all cursor-pointer ${
        active
          ? "border-lv-border bg-lv-surface/90 text-lv-text"
          : "border-lv-border-soft/60 bg-lv-surface/20 text-lv-faint hover:bg-lv-surface/50"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 ${active ? color : "text-lv-faint"}`} />
        <div className="truncate">
          <div className="font-medium truncate text-[11px]">{label}</div>
          <div className="text-[9px] text-lv-faint truncate">{subLabel}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`p-1 rounded-lg transition-colors ${
          active ? "text-lv-cyan hover:bg-lv-cyan/20" : "text-lv-faint hover:text-lv-muted"
        }`}
      >
        {active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function PaletteButton({
  icon: Icon,
  label,
  onClick,
  accent,
}: {
  icon: typeof Plus;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors w-full ${
        accent
          ? "bg-lv-blue/15 text-lv-blue font-medium hover:bg-lv-blue/25"
          : "text-lv-muted hover:bg-lv-surface hover:text-lv-text"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${accent ? "text-lv-blue" : "text-lv-muted"}`} strokeWidth={2} />
      {label}
    </button>
  );
}
