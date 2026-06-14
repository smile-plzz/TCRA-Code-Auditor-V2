# TCRA Code Auditor V2

A framework-driven web application for evaluating AI-generated ("vibecoded") code against the **TCRA** framework — a structured methodology derived from academic research on the intelligence-automation boundary in conversational AI systems.

🌐 **Live Demo:** [tcra-code-auditor-v2.onrender.com](https://tcra-code-auditor-v2.onrender.com/)

---

## What is TCRA?

TCRA stands for **Transparency, Controllability, Reliability, Auditability** — four dimensions used to assess the trustworthiness and robustness of AI-generated code.

| Dimension | What it measures | Score Range |
|---|---|---|
| **Transparency** | How visible is the reasoning behind the code? Are comments and rationale inspectable? | 0–3 |
| **Controllability** | How well can a human steer or modify the code? Does it respond predictably to changes? | 0–3 |
| **Reliability** | How robust is the code across variations, edge cases, and prompt shifts? | 0–3 |
| **Auditability** | How traceable and testable is the code? Is provenance and versioning present? | 0–3 |

### Composite Score & Classification

Scores across the four dimensions are summed into a **composite score (0–12)**, which maps to an intelligence-automation classification:

| Composite Score | Classification |
|---|---|
| 0–3 | **Automated Execution** — rigid, opaque, minimal human oversight |
| 4–7 | **Assisted Automation** — coarse control with limited traceability |
| 8–10 | **Delegated Reasoning** — partial transparency and auditability |
| 11–12 | **Collaborative Intelligence** — fine-grained control, full provenance |

---

## Features

- **Multi-provider support** — runs audits via Google Gemini, OpenAI, Anthropic Claude, or Groq
- **Vibe-code detection** — identifies whether submitted code exhibits patterns typical of AI generation
- **Risk analysis** — surfaces up to 3 specific risks or silent failure points in the submitted code
- **Optional prompt context** — paste the original prompt used to generate the code for richer analysis
- **Structured JSON output** — all audit results are validated and sanitized before display
- **Bring your own key** — API keys are passed client-side or set via environment secrets; no keys are stored

---

## Tech Stack

- **Frontend:** React + TypeScript, Vite
- **Backend:** Express (TypeScript), Node.js
- **AI Providers:** Google GenAI SDK (`@google/genai`), OpenAI API, Anthropic API, Groq API
- **Deployment:** Render (via `server.ts` Express + Vite middleware in dev, static build in production)
- **Originally scaffolded with:** Google AI Studio app template

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- An API key from at least one supported provider

### Installation

```bash
git clone https://github.com/smile-plzz/TCRA-Code-Auditor-V2.git
cd TCRA-Code-Auditor-V2
npm install
```

### Configuration

Copy the example env file and add your key(s):

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
GEMINI_API_KEY=your_google_gemini_key_here
GROQ_API_KEY=your_groq_key_here        # optional
```

OpenAI and Anthropic keys can be entered directly in the UI at audit time.

### Run in Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

---

## How It Works

1. Paste your AI-generated code into the input field (optionally include the original prompt).
2. Select your preferred AI provider and model.
3. The backend routes the code to the chosen provider with the TCRA system prompt.
4. The provider returns a structured JSON audit result.
5. The app displays per-dimension scores, risks, vibe-code evidence, and overall classification.

The TCRA system prompt instructs the model to score strictly within each dimension and return a clean JSON object — no markdown, no preamble. The server sanitizes and validates all fields before sending results to the client.

---

## API Endpoint

### `POST /api/audit`

**Request body:**

```json
{
  "provider": "google | openai | anthropic | groq",
  "apiKey": "optional — falls back to server env vars for google/groq",
  "model": "optional — defaults to provider's recommended model",
  "prompt": "optional — the original prompt used to generate the code",
  "code": "the AI-generated code to evaluate"
}
```

**Response:**

```json
{
  "transparency": { "score": 2, "explanation": "..." },
  "controllability": { "score": 1, "explanation": "..." },
  "reliability": { "score": 2, "explanation": "..." },
  "auditability": { "score": 1, "explanation": "..." },
  "composite": 6,
  "classification": "Assisted Automation",
  "classificationSummary": "...",
  "risks": ["risk1", "risk2", "risk3"],
  "isVibecoded": true,
  "vibecodeEvidence": "..."
}
```

---

## Context

This project was built as a **portfolio differentiator** to support applications for AI Evaluation Engineer roles. It operationalizes the TCRA framework — applied across ChatGPT, Claude, and Gemini outputs — as a structured methodology for human-in-the-loop AI code assessment.

---

## Author

**Ismail** — [@smile-plzz](https://github.com/smile-plzz)

---

## License

MIT
