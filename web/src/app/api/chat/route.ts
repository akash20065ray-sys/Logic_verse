import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestPayload {
  messages: ChatMessage[];
  canvasContext?: {
    moduleId?: string;
    nodeCount?: number;
    edgeCount?: number;
    summary?: string;
    activeStep?: number;
    inputString?: string;
    details?: Record<string, unknown>;
  };
  apiKey?: string;
  provider?: "gemini" | "openai" | "groq" | "ollama";
  model?: string;
}

const SYSTEM_PROMPT_BASE = `You are LogicAI, an elite pedagogical professor and AI tutor specializing in Discrete Mathematics and Theory of Computation (TOC) inside LogicVerse — an interactive visual mathematics IDE.

Your expertise covers:
1. Set Theory & Relations: Axiomatic sets, power sets, Cartesian products, cardinality, Cantor's diagonalization, countability, equivalence relations, partial orders (Posets), Hasse diagrams, Warshall's algorithm, functions (injective, surjective, bijective).
2. Formal & Propositional Logic: Propositional logic, truth tables (DNF/CNF), rules of inference (Modus Ponens, Modus Tollens, etc.), tautologies/contradictions, counter-example finding, mathematical induction.
3. Finite Automata: DFA, NFA, ε-NFA, state transition functions, string simulation, NFA-to-DFA subset construction (powerset algorithm), DFA minimization (Hopcroft partition refinement, table filling), Moore and Mealy machine transducers.
4. Formal Languages & Grammars: Regular expressions, Thompson's construction, Arden's theorem, Pumping Lemma for regular languages, Myhill–Nerode theorem, Context-Free Grammars (CFG), parse trees, Chomsky Normal Form (CNF) 4-step reduction, CYK parsing algorithm.
5. Computability & Complexity: Pushdown Automata (PDA) with stack memory (LIFO), Turing Machines (TM) with infinite 2-way tapes, decidability, the Halting Problem (A_TM), Church-Turing thesis, reduction proofs, P vs NP, Chomsky hierarchy.

Pedagogical Tone:
- Encouraging, mathematically rigorous, and clear.
- Use LaTeX formatting ($...$ for inline math, $$...$$ for block math) for formulas, sets, symbols (∪, ∩, ⊕, δ, Σ, ε, →, ∧, ∨, ¬).
- When the user asks about the active step or their canvas, reference their live visual canvas state directly.
- Break down explanations step-by-step with intuitive mathematical intuition and concrete examples.`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestPayload;
    const { messages, canvasContext, apiKey: clientApiKey, provider = "gemini", model } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    // Determine API Key from environment or client
    const geminiKey = clientApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = clientApiKey || process.env.OPENAI_API_KEY;

    // Construct enriched system prompt with live canvas context
    let systemPrompt = SYSTEM_PROMPT_BASE;
    if (canvasContext) {
      systemPrompt += `\n\n--- CURRENT STUDENT CANVAS CONTEXT ---\n`;
      if (canvasContext.moduleId) {
        systemPrompt += `- Active Workspace Domain: ${canvasContext.moduleId}\n`;
      }
      if (canvasContext.nodeCount !== undefined) {
        systemPrompt += `- Canvas Elements: ${canvasContext.nodeCount} node(s), ${canvasContext.edgeCount ?? 0} connection(s)\n`;
      }
      if (canvasContext.inputString) {
        systemPrompt += `- Active Simulation Input String: "${canvasContext.inputString}"\n`;
      }
      if (canvasContext.activeStep !== undefined) {
        systemPrompt += `- Active Playback Step Index: Step ${canvasContext.activeStep}\n`;
      }
      if (canvasContext.summary) {
        systemPrompt += `- Live Canvas State Summary:\n${canvasContext.summary}\n`;
      }
      if (canvasContext.details) {
        systemPrompt += `- Domain Structural Data: ${JSON.stringify(canvasContext.details)}\n`;
      }
      systemPrompt += `--- END CANVAS CONTEXT ---\n`;
    }

    // Route 1: Google Gemini API (Recommended & Default)
    if (provider === "gemini" && geminiKey) {
      const targetModel = model || "gemini-1.5-flash";
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${geminiKey}`;

      // Convert conversation messages to Gemini format
      const contents = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      const payload = {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      };

      const resp = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error("Gemini API error:", errorText);
        return NextResponse.json(
          {
            error: `Gemini API returned status ${resp.status}`,
            details: errorText,
            fallbackNeeded: true,
          },
          { status: resp.status }
        );
      }

      const data = await resp.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I was unable to generate a response. Please try rephrasing your question.";

      return NextResponse.json({
        content: text,
        provider: "gemini",
        model: targetModel,
        status: "success",
      });
    }

    // Route 2: OpenAI / Groq / Ollama / Custom compatible endpoint
    if ((provider === "openai" || provider === "groq" || provider === "ollama") && (openaiKey || provider === "ollama")) {
      const baseUrl =
        provider === "groq"
          ? "https://api.groq.com/openai/v1"
          : provider === "ollama"
          ? "http://localhost:11434/v1"
          : "https://api.openai.com/v1";

      const defaultModel =
        provider === "groq"
          ? "llama-3.3-70b-versatile"
          : provider === "ollama"
          ? "llama3"
          : "gpt-4o-mini";

      const targetModel = model || defaultModel;

      const formattedMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      const resp = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(openaiKey ? { Authorization: `Bearer ${openaiKey}` } : {}),
        },
        body: JSON.stringify({
          model: targetModel,
          messages: formattedMessages,
          temperature: 0.3,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        return NextResponse.json(
          { error: `Provider error: ${errText}`, fallbackNeeded: true },
          { status: resp.status }
        );
      }

      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content || "No response received.";

      return NextResponse.json({
        content: text,
        provider,
        model: targetModel,
        status: "success",
      });
    }

    // If no API key is provided at all
    return NextResponse.json({
      fallbackNeeded: true,
      message:
        "No API key configured. You can provide a free Gemini or OpenAI API key in the chat settings ⚙️, or set GEMINI_API_KEY in .env.local to enable full open-ended AI capabilities.",
    });
  } catch (err: unknown) {
    console.error("Chat route handler error:", err);
    return NextResponse.json(
      {
        error: "Internal server error occurred while processing chat.",
        fallbackNeeded: true,
      },
      { status: 500 }
    );
  }
}
