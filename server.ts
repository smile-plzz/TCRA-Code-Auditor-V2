import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

// Standard fallback academic rules prompt for robustness if parsing fails
const TCRA_SYSTEM_PROMPT = `You are a TCRA Framework Auditor. You evaluate AI-generated (vibecoded) code using the TCRA framework from academic research on the intelligence-automation boundary in conversational AI systems.

TCRA stands for: Transparency, Controllability, Reliability, Auditability.

Score each dimension from 0 to 3:

TRANSPARENCY (How visible is the reasoning behind the code?)
0 - Opaque output, no comments or rationale
1 - Minimal comments; ad-hoc rationale
2 - Partial trace; rationale links to code paths
3 - Inspectable trace; step mapping; reproducible rationale

CONTROLLABILITY (How well can a human steer or modify this code?)
0 - Prompts rarely steer behavior; rigid structure
1 - Coarse control; side effects common
2 - Localized steering with minor trade-offs
3 - Fine-grained control; constraints obeyed consistently

RELIABILITY (How robust is this code across variations?)
0 - Flaky; silent failures likely
1 - Passes base cases only
2 - Robust to small prompt/data shifts
3 - Robust across perturbations, seeds, and refactors

AUDITABILITY (How traceable and testable is this code?)
0 - No provenance or tests
1 - Sparse logs; brittle tests
2 - Provenance + runnable tests present
3 - Full provenance; versioned tests; reproducible builds

Also identify:
- Up to 3 specific risks or silent failure points
- Whether this code appears to be vibecoded (AI-generated) based on its patterns
- One sentence on the overall intelligence-automation classification (Automated Execution 0-3, Assisted Automation 4-7, Delegated Reasoning 8-10, Collaborative Intelligence 11-12)

Respond ONLY with a JSON object. No markdown fences, no preamble. Format:
{
  "transparency": { "score": 0, "explanation": "..." },
  "controllability": { "score": 0, "explanation": "..." },
  "reliability": { "score": 0, "explanation": "..." },
  "auditability": { "score": 0, "explanation": "..." },
  "composite": 0,
  "classification": "Automated Execution | Assisted Automation | Delegated Reasoning | Collaborative Intelligence",
  "classificationSummary": "One sentence summary",
  "risks": ["risk1", "risk2", "risk3"],
  "isVibecoded": true,
  "vibecodeEvidence": "Brief explanation of why this appears (or doesn't appear) to be AI-generated"
}`;

function cleanAndParseJSON(rawText: string) {
  let cleaned = rawText.trim();
  // Strip markdown wraps if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n/, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3).trim();
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt block recovery
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      const JSONSub = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(JSONSub);
      } catch (subErr) {
        throw new Error("Could not parse JSON even with block recovery: " + (subErr as Error).message);
      }
    }
    throw err;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/audit", async (req, res): Promise<any> => {
    const { provider, apiKey, model, prompt, code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: "Code content cannot be empty." });
    }

    // Determine target API Key securely
    let selectedApiKey = apiKey ? apiKey.trim() : "";
    if (!selectedApiKey && provider === "google") {
      selectedApiKey = process.env.GEMINI_API_KEY || "";
    } else if (!selectedApiKey && provider === "groq") {
      selectedApiKey = process.env.GROQ_API_KEY || "";
    }

    if (!selectedApiKey) {
      return res.status(400).json({
        error: `Please provide an API Key for ${provider}. For Google Gemini or Groq, you can also set it up in Settings > Secrets.`,
      });
    }

    const userMessageContent = prompt && prompt.trim()
      ? `Original prompt used to generate this code:\n"${prompt}"\n\nAI-generated code to evaluate:\n\`\`\`\n${code}\n\`\`\``
      : `AI-generated code to evaluate:\n\`\`\`\n${code}\n\`\`\``;

    try {
      let rawResponseText = "";

      if (provider === "google") {
        const ai = new GoogleGenAI({
          apiKey: selectedApiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        const response = await ai.models.generateContent({
          model: model || "gemini-3.5-flash",
          contents: userMessageContent,
          config: {
            systemInstruction: TCRA_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });

        rawResponseText = response.text || "";
      } else if (provider === "openai") {
        // OpenAI Fetch execution
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${selectedApiKey}`,
          },
          body: JSON.stringify({
            model: model || "gpt-4o",
            temperature: 0.1,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: TCRA_SYSTEM_PROMPT },
              { role: "user", content: userMessageContent },
            ],
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `OpenAI returned HTTP ${response.status}`);
        }

        const data: any = await response.json();
        rawResponseText = data.choices?.[0]?.message?.content || "";
      } else if (provider === "anthropic") {
        // Anthropic Fetch execution
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": selectedApiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: model || "claude-3-5-sonnet-latest",
            max_tokens: 4000,
            temperature: 0.1,
            system: TCRA_SYSTEM_PROMPT,
            messages: [
              { role: "user", content: userMessageContent },
            ],
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Anthropic returned HTTP ${response.status}`);
        }

        const data: any = await response.json();
        rawResponseText = data.content?.map((b: any) => b.text || "").join("") || "";
      } else if (provider === "groq") {
        // Groq Chat Completions endpoint
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${selectedApiKey}`,
          },
          body: JSON.stringify({
            model: model || "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: TCRA_SYSTEM_PROMPT },
              { role: "user", content: userMessageContent },
            ],
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Groq returned HTTP ${response.status}`);
        }

        const data: any = await response.json();
        rawResponseText = data.choices?.[0]?.message?.content || "";
      } else {
        throw new Error("Unsupported or unrecognized AI provider: " + provider);
      }

      if (!rawResponseText) {
        throw new Error("Empty response received from the chosen AI provider model.");
      }

      // Safe JSON Parse and Validation
      const parsedAudit = cleanAndParseJSON(rawResponseText);

      // Sanitize fields to match our type constraints safely
      const finalResult = {
        transparency: {
          score: Math.min(3, Math.max(0, Number(parsedAudit.transparency?.score ?? 0))),
          explanation: String(parsedAudit.transparency?.explanation || "No explanation provided."),
        },
        controllability: {
          score: Math.min(3, Math.max(0, Number(parsedAudit.controllability?.score ?? 0))),
          explanation: String(parsedAudit.controllability?.explanation || "No explanation provided."),
        },
        reliability: {
          score: Math.min(3, Math.max(0, Number(parsedAudit.reliability?.score ?? 0))),
          explanation: String(parsedAudit.reliability?.explanation || "No explanation provided."),
        },
        auditability: {
          score: Math.min(3, Math.max(0, Number(parsedAudit.auditability?.score ?? 0))),
          explanation: String(parsedAudit.auditability?.explanation || "No explanation provided."),
        },
        composite: Math.min(12, Math.max(0, Number(parsedAudit.composite ?? 0))),
        classification: String(parsedAudit.classification || "Automated Execution"),
        classificationSummary: String(parsedAudit.classificationSummary || "No summary provided."),
        risks: Array.isArray(parsedAudit.risks) ? parsedAudit.risks.map(String) : [],
        isVibecoded: Boolean(parsedAudit.isVibecoded ?? true),
        vibecodeEvidence: String(parsedAudit.vibecodeEvidence || ""),
      };

      // Recalculate composite for high mathematical accuracy if needed
      const sumScores = finalResult.transparency.score + finalResult.controllability.score + finalResult.reliability.score + finalResult.auditability.score;
      finalResult.composite = sumScores;

      res.json(finalResult);
    } catch (err: any) {
      console.error("Audit Execution Error:", err);
      res.status(500).json({ error: err.message || "An error occurred during secure routing." });
    }
  });

  // Vite host configuration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
