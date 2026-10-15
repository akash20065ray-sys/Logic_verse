import { describe, it, expect } from "vitest";
import { POST } from "../../../app/api/chat/route";
import { NextRequest } from "next/server";

describe("LogicAI /api/chat Route Handler", () => {
  it("returns 400 if messages array is missing or empty", async () => {
    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns fallbackNeeded if no API key is provided", async () => {
    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "What is a Turing Machine?" }],
        canvasContext: { moduleId: "pda-tm" },
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.fallbackNeeded).toBe(true);
  });
});
