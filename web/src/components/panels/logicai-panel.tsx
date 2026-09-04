"use client";

import { useState } from "react";
import { Bot, Send, Sparkles, Lightbulb, Wand2, BookOpen, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";
import {
  answerDiscreteMathQuestion,
  generateExplanation,
  generateExample,
  generateHint,
  type AiResponse,
} from "@/lib/algorithms/logic-ai-engine";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  suggestedAction?: AiResponse["suggestedAction"];
  keyTakeaways?: string[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hello! I am **LogicAI**, your context-aware Discrete Mathematics & Set Theory tutor. I can see your live canvas, analyze your operations, explain steps, and generate examples.",
  },
];

const QUICK_ACTIONS = [
  { icon: Lightbulb, label: "Explain this step", query: "Explain this step" },
  { icon: Wand2, label: "Generate example", query: "Generate example" },
  { icon: BookOpen, label: "Give me a hint", query: "Give me a hint" },
  { icon: ShieldCheck, label: "Check validity", query: "Check validity" },
];

export function LogicAiPanel() {
  const graphEvaluation = useWorkspaceStore((s) => s.graphEvaluation);
  const loadTemplate = useWorkspaceStore((s) => s.loadTemplate);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");

  function processQuery(text: string) {
    let response: AiResponse;

    if (text === "Explain this step") {
      response = generateExplanation(graphEvaluation);
    } else if (text === "Generate example") {
      response = generateExample();
    } else if (text === "Give me a hint") {
      response = generateHint(graphEvaluation);
    } else {
      response = answerDiscreteMathQuestion(text, graphEvaluation);
    }

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.message,
        suggestedAction: response.suggestedAction,
        keyTakeaways: response.keyTakeaways,
      },
    ]);
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
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
          content: `Loaded the **${action.label}** template onto your canvas! Check out the updated sets and Venn diagram.`,
        },
      ]);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-lv-border-soft px-4 py-3 shrink-0">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-lv-purple/15">
          <Bot className="h-3.5 w-3.5 text-lv-purple" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-lv-faint">
          LogicAI Tutor
        </span>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-lv-cyan/10 border border-lv-cyan/20 px-2 py-0.5 text-[10px] text-lv-cyan font-mono">
          <Sparkles className="h-2.5 w-2.5" />
          Live Context
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="lv-scrollbar flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[94%] rounded-xl px-3.5 py-3 text-[13px] leading-relaxed shadow-sm",
              msg.role === "user"
                ? "ml-auto rounded-tr-sm bg-lv-blue/20 border border-lv-blue/30 text-lv-text font-medium"
                : "rounded-tl-sm border border-lv-border bg-lv-surface/80 text-lv-text"
            )}
          >
            <div className="whitespace-pre-wrap">{msg.content}</div>

            {/* Key takeaways pills if provided */}
            {msg.keyTakeaways && msg.keyTakeaways.length > 0 && (
              <div className="mt-3 border-t border-lv-border-soft pt-2 space-y-1">
                <div className="text-[10px] uppercase font-mono tracking-wider text-lv-faint">Properties</div>
                {msg.keyTakeaways.map((k, i) => (
                  <div key={i} className="text-[11px] font-mono text-lv-cyan flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-lv-cyan" />
                    {k}
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
      </div>

      {/* Quick Action Chips & Input Field */}
      <div className="border-t border-lv-border-soft px-3 py-3 shrink-0 bg-lv-panel/70">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => processQuery(action.query)}
              className="inline-flex items-center gap-1 rounded-full border border-lv-border bg-lv-surface/60 px-2.5 py-1 text-[11px] text-lv-muted transition-colors hover:border-lv-purple/40 hover:text-lv-text active:scale-95"
            >
              <action.icon className="h-3 w-3 text-lv-purple" />
              {action.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-lv-border bg-lv-surface px-3 py-2 focus-within:border-lv-cyan/60 transition-colors">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your model, De Morgan, Venn…"
            className="flex-1 bg-transparent text-[13px] text-lv-text placeholder:text-lv-faint focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            aria-label="Send message"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-lv-blue text-white hover:bg-blue-600 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
