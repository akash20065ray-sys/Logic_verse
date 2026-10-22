"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Lightbulb,
  Wand2,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Trash2,
  Cpu,
  Layers,
  GitBranch,
  Table,
  Settings,
  Key,
  Check,
  AlertCircle,
  X,
  ExternalLink,
  Zap,
  Route,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";
import {
  answerDiscreteMathQuestion,
  formatHumanReadableMath,
  generateExplanation,
  generateExample,
  generateHint,
  generateLogicExplanation,
  generateLogicExample,
  generateLogicHint,
  generateAutomataExplanation,
  type AiResponse,
} from "@/lib/algorithms/logic-ai-engine";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  source?: "ai-live" | "local-engine";
  suggestedAction?: AiResponse["suggestedAction"];
  keyTakeaways?: string[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hello! I am **LogicAI**, your live AI tutor for Discrete Mathematics & Theory of Computation. I inspect your canvas graphs, state transitions, PDA stack memories, Turing Machine tapes, parse trees, and formal proofs in real time.\n\nAsk me anything — from explaining the exact step on your canvas to proving theorems, solving relation matrices, or explaining complexity classes!",
    source: "local-engine",
  },
];

export function LogicAiPanel() {
  const graphEvaluation = useWorkspaceStore((s) => s.graphEvaluation);
  const logicEvaluation = useWorkspaceStore((s) => s.logicEvaluation);
  const automataSimulation = useWorkspaceStore((s) => s.automataSimulation);
  const activeAutomataStepIndex = useWorkspaceStore((s) => s.activeAutomataStepIndex);
  const activeModuleId = useWorkspaceStore((s) => s.activeModuleId);
  const nodes = useWorkspaceStore((s) => s.nodes);
  const edges = useWorkspaceStore((s) => s.edges);
  const automataInputString = useWorkspaceStore((s) => s.automataInputString);
  const loadTemplate = useWorkspaceStore((s) => s.loadTemplate);
  const relationsElements = useWorkspaceStore((s) => s.relationsElements);
  const relationsPairs = useWorkspaceStore((s) => s.relationsPairs);
  const relationsSubMode = useWorkspaceStore((s) => s.relationsSubMode);

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // AI Configuration State (stored in localStorage)
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"gemini" | "openai" | "groq" | "ollama">("gemini");
  const [modelName, setModelName] = useState("gemini-1.5-flash");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("logicverse_ai_key") || "";
      const savedProvider = (localStorage.getItem("logicverse_ai_provider") as typeof provider) || "gemini";
      const savedModel = localStorage.getItem("logicverse_ai_model") || "gemini-1.5-flash";
      setApiKey(savedKey);
      setProvider(savedProvider);
      setModelName(savedModel);
    }
  }, []);

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("logicverse_ai_key", apiKey.trim());
      localStorage.setItem("logicverse_ai_provider", provider);
      localStorage.setItem("logicverse_ai_model", modelName.trim());
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setSettingsOpen(false);
    }, 1200);
  }

  function handleClearKey() {
    setApiKey("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("logicverse_ai_key");
    }
  }

  const isLogic = activeModuleId === "logic";
  const isAutomata = activeModuleId === "automata";

  const quickActions =
    activeModuleId === "pda-tm"
      ? [
          { icon: Layers, label: "Explain Stack Memory", query: "Explain Pushdown Automata stack memory" },
          { icon: Cpu, label: "Turing Machine Halting", query: "Explain Turing Machine infinite 2-way tape and Halting problem" },
          { icon: ShieldCheck, label: "Final State vs Empty Stack", query: "Explain PDA acceptance by final state vs empty stack" },
        ]
      : activeModuleId === "cfg"
      ? [
          { icon: GitBranch, label: "Explain Parse Tree", query: "Explain Context-Free Grammar parse tree" },
          { icon: Sparkles, label: "Chomsky Normal Form", query: "Explain CNF 4-step reduction" },
          { icon: Table, label: "CYK Parsing Table", query: "Explain CYK dynamic programming table" },
        ]
      : activeModuleId === "regex"
      ? [
          { icon: Sparkles, label: "Pumping Lemma Game", query: "Explain Pumping Lemma for Regular Languages" },
          { icon: GitBranch, label: "Thompson's Construction", query: "Explain Thompson NFA construction" },
        ]
      : activeModuleId === "relations-functions"
      ? [
          { icon: Route, label: "Warshall Algorithm", query: "Explain Warshall algorithm for transitive closure" },
          { icon: GitBranch, label: "Hasse Poset Diagram", query: "What is Hasse diagram for Posets?" },
          { icon: ArrowRight, label: "Injective vs Surjective", query: "Is this function injective or surjective?" },
          { icon: ShieldCheck, label: "Equivalence Classes", query: "Explain equivalence relation and quotient classes" },
        ]
      : [
          { icon: Lightbulb, label: "Explain this step", query: "Explain this step" },
          { icon: Wand2, label: "Generate example", query: "Generate example" },
          { icon: BookOpen, label: "Give me a hint", query: "Give me a hint" },
          { icon: ShieldCheck, label: "Check validity", query: "Check validity" },
        ];

  // Build canvas context summary to feed into LLM
  function getCanvasContextSummary() {
    let summary = `Module: ${activeModuleId}. Node count: ${nodes.length}, Edge count: ${edges.length}.`;
    let details: Record<string, unknown> = {};

    if (activeModuleId === "automata" && automataSimulation) {
      summary += `\nAutomata Simulation on "${automataInputString}": Accepted = ${automataSimulation.isAccepted}.`;
      summary += `\nStep ${activeAutomataStepIndex + 1} of ${automataSimulation.steps.length}.`;
      const currentStep = automataSimulation.steps[activeAutomataStepIndex];
      if (currentStep) {
        summary += `\nActive Step Rule: ${currentStep.transitionRule}, Active states: [${currentStep.activeStateIds.join(", ")}], Remaining string: "${currentStep.remainingString}".`;
      }
      details = {
        states: nodes.map((n) => ({ id: n.id, label: n.data?.label, isStart: n.data?.isStart, isAccept: n.data?.isAccept })),
        transitions: edges.map((e) => ({ source: e.source, target: e.target, symbol: e.label || e.data?.symbol })),
        inputString: automataInputString,
        currentStep,
      };
    } else if (activeModuleId === "logic") {
      summary += `\nFormula: ${logicEvaluation.activeExpression}, Current value: ${logicEvaluation.currentTruthValue}. Tautology: ${logicEvaluation.isTautology}.`;
      details = {
        expression: logicEvaluation.activeExpression,
        variables: logicEvaluation.truthTable?.variables,
        isTautology: logicEvaluation.isTautology,
      };
    } else if (activeModuleId === "set-theory" && graphEvaluation.primaryResult) {
      summary += `\nSets: ${graphEvaluation.primarySets.map((s) => `${s.label} = {${s.elements.join(", ")}}`).join("; ")}.`;
      summary += `\nResult: ${graphEvaluation.primaryResult.notation} = {${graphEvaluation.primaryResult.elements.join(", ")}}. Cardinality: ${graphEvaluation.primaryResult.cardinality}.`;
      details = {
        primaryResult: graphEvaluation.primaryResult,
        sets: graphEvaluation.primarySets,
      };
    } else if (activeModuleId === "relations-functions") {
      summary += `\nRelations & Functions active submode: "${relationsSubMode}". Set A Elements = [${relationsElements.join(", ")}]. Active pairs count = ${relationsPairs.length}. Pairs = ${relationsPairs.map(([a,b]) => `(${a},${b})`).slice(0, 10).join(", ")}.`;
      details = {
        subMode: relationsSubMode,
        elements: relationsElements,
        pairs: relationsPairs,
      };
    }

    return {
      moduleId: activeModuleId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      summary,
      activeStep: activeAutomataStepIndex,
      inputString: automataInputString,
      details,
    };
  }

  async function processQuery(text: string) {
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    const canvasContext = getCanvasContextSummary();

    try {
      // 1. Try calling the Next.js AI API route
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          canvasContext,
          apiKey: apiKey.trim() || undefined,
          provider,
          model: modelName.trim() || undefined,
        }),
      });

      const data = await resp.json();

      if (resp.ok && data.status === "success" && data.content) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: formatHumanReadableMath(data.content),
            source: "ai-live",
          },
        ]);
        setIsThinking(false);
        return;
      }

      // 2. If fallback needed or no API key, use local discrete math algorithmic engine
      let localResponse: AiResponse;
      if (text === "Explain this step") {
        localResponse = isAutomata
          ? generateAutomataExplanation(automataSimulation, activeAutomataStepIndex)
          : isLogic
          ? generateLogicExplanation(logicEvaluation)
          : generateExplanation(graphEvaluation);
      } else if (text === "Generate example") {
        localResponse = isLogic ? generateLogicExample() : generateExample();
      } else if (text === "Give me a hint") {
        localResponse = isLogic ? generateLogicHint(logicEvaluation) : generateHint(graphEvaluation);
      } else {
        localResponse = answerDiscreteMathQuestion(
          text,
          graphEvaluation,
          logicEvaluation,
          activeModuleId,
          automataSimulation,
          activeAutomataStepIndex
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: localResponse.message,
          source: "local-engine",
          suggestedAction: localResponse.suggestedAction,
          keyTakeaways: localResponse.keyTakeaways,
        },
      ]);
    } catch (err) {
      console.error("Chat error, using fallback engine:", err);
      const fallback = answerDiscreteMathQuestion(
        text,
        graphEvaluation,
        logicEvaluation,
        activeModuleId,
        automataSimulation,
        activeAutomataStepIndex
      );

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: fallback.message,
          source: "local-engine",
          suggestedAction: fallback.suggestedAction,
          keyTakeaways: fallback.keyTakeaways,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || isThinking) return;
    setInput("");
    processQuery(text);
  }

  function handleActionClick(action: NonNullable<ChatMessage["suggestedAction"]>) {
    if (action.actionType === "load-template" && action.templateId) {
      loadTemplate(action.templateId);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Loaded the **${action.label}** template onto your canvas! Check out the updated elements on your screen.`,
          source: "local-engine",
        },
      ]);
    }
  }

  const hasApiKey = Boolean(apiKey.trim());

  return (
    <div className="flex h-full flex-col font-sans">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-lv-border-soft px-4 py-3 shrink-0 bg-lv-panel/90">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-lv-purple/15">
          <Bot className="h-3.5 w-3.5 text-lv-purple" />
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-lv-text">
              LogicAI Tutor
            </span>
            {hasApiKey ? (
              <span className="flex items-center gap-1 rounded-full bg-lv-success/15 border border-lv-success/30 px-2 py-0.5 text-[10px] text-lv-success font-mono font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-lv-success animate-pulse" />
                Live AI ({provider.toUpperCase()})
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-lv-cyan/10 border border-lv-cyan/20 px-2 py-0.5 text-[10px] text-lv-cyan font-mono">
                <Zap className="h-2.5 w-2.5" />
                Local Engine
              </span>
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {/* Settings / API Key Button */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-mono transition-colors border",
              hasApiKey
                ? "border-lv-border bg-lv-surface text-lv-muted hover:text-lv-text"
                : "border-lv-purple/40 bg-lv-purple/15 text-lv-purple hover:bg-lv-purple/25 animate-pulse"
            )}
            title="Configure AI Provider & API Key"
          >
            <Settings className="h-3 w-3" />
            <span className="hidden sm:inline">{hasApiKey ? "AI Config" : "Connect AI"}</span>
          </button>

          {/* Clear History */}
          <button
            type="button"
            onClick={() => setMessages(INITIAL_MESSAGES)}
            className="rounded p-1 text-lv-faint hover:text-lv-error hover:bg-lv-surface transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="lv-scrollbar flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[94%] rounded-xl px-3.5 py-3 text-[13px] leading-relaxed shadow-sm transition-all",
              msg.role === "user"
                ? "ml-auto rounded-tr-sm bg-lv-blue/20 border border-lv-blue/30 text-lv-text font-medium"
                : "rounded-tl-sm border border-lv-border bg-lv-surface/80 text-lv-text"
            )}
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-lv-faint mb-1.5 pb-1 border-b border-lv-border-soft/60">
              <span className="font-bold flex items-center gap-1">
                {msg.role === "assistant" ? <Bot className="h-3 w-3 text-lv-purple" /> : "Student"}
                {msg.role === "assistant" ? "LogicAI" : "You"}
              </span>
              {msg.source && (
                <span className={cn("text-[9px] px-1.5 py-0.2 rounded font-mono", msg.source === "ai-live" ? "text-lv-success bg-lv-success/10 font-bold" : "text-lv-faint")}>
                  {msg.source === "ai-live" ? "✦ Live AI Reasoning" : "⚙ Local AST Engine"}
                </span>
              )}
            </div>

            <div className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed">{formatHumanReadableMath(msg.content)}</div>

            {/* Key takeaways pills if provided */}
            {msg.keyTakeaways && msg.keyTakeaways.length > 0 && (
              <div className="mt-3 border-t border-lv-border-soft pt-2 space-y-1">
                <div className="text-[10px] uppercase font-mono tracking-wider text-lv-faint">Takeaways</div>
                {msg.keyTakeaways.map((k, i) => (
                  <div key={i} className="text-[11px] font-mono text-lv-cyan flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-lv-cyan" />
                    {formatHumanReadableMath(k)}
                  </div>
                ))}
              </div>
            )}

            {/* Interactive action button if provided */}
            {msg.suggestedAction && (
              <div className="mt-3 pt-2 border-t border-lv-border-soft">
                <button
                  type="button"
                  onClick={() => handleActionClick(msg.suggestedAction!)}
                  className="flex items-center gap-1.5 rounded-lg bg-lv-purple/20 border border-lv-purple/30 px-3 py-1.5 text-xs font-medium text-lv-purple hover:bg-lv-purple/30 transition-colors"
                >
                  <span>{msg.suggestedAction.label}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Live Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 rounded-xl border border-lv-cyan/30 bg-lv-cyan/5 px-3.5 py-2.5 text-xs font-mono text-lv-cyan animate-pulse max-w-[85%]">
            <Sparkles className="h-3.5 w-3.5 animate-spin text-lv-cyan" />
            <span>LogicAI is reasoning over your model & theory...</span>
          </div>
        )}
      </div>

      {/* Quick Action Chips & Input Field */}
      <div className="border-t border-lv-border-soft px-3 py-3 shrink-0 bg-lv-panel/70">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              disabled={isThinking}
              onClick={() => processQuery(action.query)}
              className="inline-flex items-center gap-1 rounded-full border border-lv-border bg-lv-surface/60 px-2.5 py-1 text-[11px] text-lv-muted transition-colors hover:border-lv-purple/40 hover:text-lv-text active:scale-95 disabled:opacity-40"
            >
              <action.icon className="h-3 w-3 text-lv-purple" />
              {action.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-lv-border bg-lv-surface px-3 py-2 focus-within:border-lv-cyan/60 transition-colors">
          <input
            value={input}
            disabled={isThinking}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              hasApiKey
                ? "Ask anything in Discrete Math, TOC, or your canvas..."
                : "Ask anything (Tip: Click Connect AI to enable full LLM)..."
            }
            className="flex-1 bg-transparent text-[13px] text-lv-text placeholder:text-lv-faint focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isThinking || !input.trim()}
            aria-label="Send message"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-lv-blue text-white hover:bg-blue-600 transition-colors disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Settings / API Key Modal */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-lv-border bg-lv-panel p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-lv-border-soft pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lv-purple/20 text-lv-purple">
                  <Key className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-lv-text">Connect Live AI Model</h3>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="text-lv-faint hover:text-lv-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-lv-faint leading-relaxed">
              Connect a real AI provider to turn LogicAI into an open-ended tutor capable of answering{" "}
              <strong>any</strong> theorem, proof, algorithm, or discrete math problem while inspecting your canvas.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-semibold text-lv-muted mb-1.5">
                  AI Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "gemini", label: "Google Gemini (Free tier)", rec: true },
                    { id: "groq", label: "Groq (Ultra-fast)" },
                    { id: "openai", label: "OpenAI" },
                    { id: "ollama", label: "Ollama (Local)" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setProvider(p.id as typeof provider);
                        if (p.id === "gemini") setModelName("gemini-1.5-flash");
                        if (p.id === "groq") setModelName("llama-3.3-70b-versatile");
                        if (p.id === "openai") setModelName("gpt-4o-mini");
                        if (p.id === "ollama") setModelName("llama3");
                      }}
                      className={cn(
                        "rounded-xl border p-2 text-left text-xs transition-colors font-medium",
                        provider === p.id
                          ? "border-lv-cyan bg-lv-cyan/10 text-lv-cyan font-bold"
                          : "border-lv-border bg-lv-surface text-lv-muted hover:bg-lv-surface/80"
                      )}
                    >
                      <div>{p.label}</div>
                      {p.rec && <span className="text-[10px] text-lv-success font-normal">Recommended</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              {provider !== "ollama" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-lv-muted">
                      {provider.toUpperCase()} API Key
                    </label>
                    {provider === "gemini" && (
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] text-lv-cyan hover:underline"
                      >
                        Get free Gemini key <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {provider === "groq" && (
                      <a
                        href="https://console.groq.com/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] text-lv-cyan hover:underline"
                      >
                        Get free Groq key <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={provider === "gemini" ? "AIzaSy..." : "sk-..."}
                    className="w-full rounded-xl border border-lv-border bg-lv-surface px-3 py-2 text-xs font-mono text-lv-text focus:border-lv-cyan focus:outline-none"
                  />
                  <p className="text-[10px] text-lv-faint mt-1">
                    Your key is stored locally in your browser and never saved to any external database.
                  </p>
                </div>
              )}

              {/* Model Name */}
              <div>
                <label className="block text-xs font-semibold text-lv-muted mb-1">
                  Model Identifier
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. gemini-1.5-flash, gpt-4o-mini"
                  className="w-full rounded-xl border border-lv-border bg-lv-surface px-3 py-2 text-xs font-mono text-lv-text focus:border-lv-cyan focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-lv-border-soft">
                {apiKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="text-xs text-lv-error hover:underline"
                  >
                    Disconnect Key
                  </button>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(false)}
                    className="rounded-xl border border-lv-border bg-lv-surface px-3 py-1.5 text-xs text-lv-muted hover:text-lv-text"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-lv-cyan px-4 py-1.5 text-xs font-semibold text-lv-bg hover:opacity-90 transition-opacity"
                  >
                    {saveSuccess ? <Check className="h-3.5 w-3.5" /> : null}
                    {saveSuccess ? "Saved!" : "Save & Activate"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
