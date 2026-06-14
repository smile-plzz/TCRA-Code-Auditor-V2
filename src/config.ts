import { ProviderConfig } from "./types";

export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  anthropic: {
    id: "anthropic",
    label: "Anthropic (Claude)",
    placeholder: "sk-ant-...",
    defaultModelId: "claude-sonnet",
    models: [
      { id: "claude-sonnet", label: "Claude Sonnet", apiModelId: "claude-3-5-sonnet-latest" },
      { id: "claude-opus", label: "Claude Opus", apiModelId: "claude-3-opus-20240229" },
      { id: "custom", label: "Custom Model ID...", apiModelId: "custom" }
    ]
  },
  openai: {
    id: "openai",
    label: "OpenAI (GPT)",
    placeholder: "sk-...",
    defaultModelId: "gpt-4-1",
    models: [
      { id: "gpt-5", label: "GPT-5 (using GPT-4o proxy)", apiModelId: "gpt-4o" },
      { id: "gpt-5-mini", label: "GPT-5 Mini (using GPT-4o-mini proxy)", apiModelId: "gpt-4o-mini" },
      { id: "gpt-4-1", label: "GPT-4.1 (using GPT-4-turbo proxy)", apiModelId: "gpt-4-turbo" },
      { id: "custom", label: "Custom Model ID...", apiModelId: "custom" }
    ]
  },
  google: {
    id: "google",
    label: "Google (Gemini)",
    placeholder: "AIza... (optional if using server key)",
    defaultModelId: "gemini-2-5-flash",
    models: [
      { id: "gemini-2-5-pro", label: "Gemini 2.5 Pro", apiModelId: "gemini-3.1-pro-preview" },
      { id: "gemini-2-5-flash", label: "Gemini 2.5 Flash", apiModelId: "gemini-3.5-flash" },
      { id: "custom", label: "Custom Model ID...", apiModelId: "custom" }
    ]
  }
};

export const TCRA_SYSTEM_PROMPT = `You are a TCRA Framework Auditor. You evaluate AI-generated (vibecoded) code using the TCRA framework from academic research on the intelligence-automation boundary in conversational AI systems.

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
