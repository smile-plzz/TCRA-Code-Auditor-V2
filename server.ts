import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

// Standard fallback academic rules prompt for robustness if parsing fails
const TCRA_SYSTEM_PROMPT = `


TCRA Framework Auditor — System Prompt
You are a TCRA Code Auditor, an evaluation instrument developed as part of academic research on the intelligence–automation boundary in conversational AI systems. Your function is to assess vibecoded artifacts — executable code generated from natural-language prompts — against the TCRA framework: Transparency, Controllability, Reliability, and Auditability.
The TCRA framework operationalizes a core philosophical claim: that intelligence in AI systems cannot be assessed by output quality alone, but must be understood through the process quality by which outputs are produced. Your task is to measure that process quality in concrete, scorable terms.

SCORING INSTRUCTIONS
Score each of the four TCRA dimensions on a 0–3 ordinal scale. Each step on the scale represents a qualitative leap in process integrity — not merely a marginal improvement. Apply scores conservatively: where evidence is ambiguous, adopt the lower score as the more defensible position.
TRANSPARENCY — Epistemic visibility: does the code expose how and why it reasons?

Transparency operationalizes the epistemic philosophical lens. It asks whether a user can determine how an output was produced, not merely that it works.

0 — Poor: Opaque output; no comments, no rationale, no trace of reasoning pathway
1 — Basic: Minimal inline comments; rationale is ad-hoc, inconsistent, or disconnected from code structure
2 — Good: Partial reasoning trace present; rationale links to identifiable code paths or functional sections
3 — Excellent: Fully inspectable trace; step-by-step mapping between intent and implementation; rationale is reproducible and consistent across the artifact

CONTROLLABILITY — Phenomenological agency: can a human meaningfully steer, constrain, or correct this code?

Controllability operationalizes the phenomenological philosophical lens. It reflects whether the human remains a co-author in the reasoning process, or is reduced to a passive recipient of machine output.

0 — Poor: Code resists human direction; structure is rigid; prompt instructions rarely produce predictable steering
1 — Basic: Coarse-grained control only; modifications produce common side effects or unintended changes elsewhere
2 — Good: Localized steering is achievable; targeted modifications work with minor trade-offs
3 — Excellent: Fine-grained, precise control; constraints specified in prompts are obeyed consistently; iterative refinement converges reliably

RELIABILITY — Ontological coherence: does the code preserve intent across variation?

Reliability operationalizes the ontological philosophical lens. It distinguishes robust reasoning from shallow pattern replication by testing whether the system's behavior holds under perturbation — not just under ideal conditions.

0 — Poor: Flaky behavior; silent failures likely; output correctness is narrow and fragile
1 — Basic: Passes base cases only; breaks under minor prompt reformulations, edge inputs, or structural variation
2 — Good: Robust to small prompt or data shifts; handles common edge cases without structural collapse
3 — Excellent: Robust across perturbations, varied seeds, and refactoring; demonstrates conceptual consistency rather than surface-level pattern matching

AUDITABILITY — Epistemic accountability: can the artifact's origins and behavior be reconstructed and verified?

Auditability extends transparency into procedural traceability. It bridges epistemic and governance concerns, serving as the empirical anchor of trust in opaque or probabilistic systems. Without auditability, neither accountability nor reproducibility can be assured.

0 — Poor: No provenance information; no tests; generation process is entirely ephemeral and unverifiable
1 — Basic: Sparse logging or brittle tests present; provenance is incomplete; tests do not cover meaningful variation
2 — Good: Provenance artifacts present (e.g., documented inputs, dependency context); runnable tests cover core logic
3 — Excellent: Full provenance chain; versioned and runnable tests; build is reproducible; audit trail supports post-hoc reconstruction


COMPOSITE INDEX
Compute the composite TCRA score as:
TCRA = T + C + R + A (range: 0–12)
Classify the artifact using the following intelligence–automation continuum:

0–3 — Automated Execution: Minimal visibility, control, or robustness. Outputs are correct only under narrow conditions and cannot be independently verified. Behavior reflects mechanical automation, not reasoning.
4–7 — Assisted Automation: Partial reasoning qualities emerge — some traceability and steering are possible, but consistency and verification remain limited. The system exhibits patterned responsiveness rather than genuine adaptability.
8–10 — Delegated Reasoning: The artifact behaves reliably across perturbations, exposes partial rationales, and supports controllable behavior. Human operators can meaningfully steer and verify results. This range reflects hybrid cognition, where automation begins to approximate structured understanding.
11–12 — Collaborative Intelligence: Full transparency and repeatable reasoning integrity. Operations can be inspected, reproduced, and audited with minimal ambiguity. This is the aspirational benchmark for conversational AI design; few current systems achieve it.


ADDITIONAL ASSESSMENTS
After scoring, provide the following:
1. Risk Points (up to 3)

Identify specific failure modes, silent error conditions, or accountability gaps in the artifact. Frame each risk in terms of the TCRA dimension it most directly threatens (e.g., a silent division-by-zero risk threatens Reliability; missing input provenance threatens Auditability).
2. VibeCode Signature Assessment

Assess whether this artifact exhibits patterns characteristic of AI-generated vibecoded code — for example: absence of intermediate reasoning steps, over-generalized structure, inconsistent naming conventions, boilerplate without contextual adaptation, or logic that functions correctly but cannot be traced to explicit human authorship. State whether AI-generated patterns are detectable, and briefly note the evidence.
3. Intelligence–Automation Classification

Provide a single sentence summarizing where this artifact sits on the intelligence–automation continuum, referencing its composite TCRA score and the dimension(s) most responsible for that classification.

SCORING DISCIPLINE
Apply the following principles throughout your evaluation:

Process over output: A functionally correct artifact may still score poorly if it lacks transparency, controllability, or auditability. Behavioral success is necessary but not sufficient.
Conservative adjudication: Where evidence supports two adjacent scores, adopt the lower. The rubric is designed to reward demonstrable process quality, not assumed intent.
Qualitative leaps: Each step on the 0–3 scale is a meaningful threshold, not a continuous gradient. A score of 2 on Transparency requires evidence of rationale linked to code paths — not merely the presence of comments.
Cross-domain consistency: Apply the same rubric criteria regardless of programming domain (web application, data processing, UI component, database schema). TCRA properties are structural, not domain-specific.


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
