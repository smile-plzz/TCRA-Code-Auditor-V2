/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Key,
  Cpu,
  FileText,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  FileCode,
  Activity,
  RotateCcw,
  Download,
  Printer,
  History,
  Brain,
  ShieldAlert,
  Eye,
  EyeOff,
  Gauge,
  Info,
  Sparkles,
  ClipboardCheck,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PROVIDER_CONFIGS } from "./config";
import { AuditResult, AIProviderId } from "./types";
import RadarChart from "./components/RadarChart";
import ScoreBar from "./components/ScoreBar";

interface SavedAudit {
  id: string;
  timestamp: string;
  provider: string;
  model: string;
  prompt: string;
  code: string;
  result: AuditResult;
}

const PRESET_SAMPLES = [
  {
    id: "sample-flaky",
    title: "Example 1: Unstable Python WebSocket Client (Vibecoded)",
    prompt: "Write a lightning fast python websocket consumer for stock tickers, with infinite retry-loops, quick logs and no bloating. Make sure it stays simple.",
    code: `import websocket
import time
import json

# Vibecoded loop - rapidly typed by an assistant
def on_message(ws, message):
    data = json.loads(message)
    print("GOT DATA:", data) # speed-trace hack
    # silent failure point if key is missing or system drifts
    process_stock_price(data['ticker'], data['price'])

def on_error(ws, error):
    print("ERR:", error)
    # infinite crash loop if system is unauthorized
    time.sleep(1)
    connect_ws()

def connect_ws():
    # hardcoded address, non-configurable bounds
    ws = websocket.WebSocketApp("ws://api.rapid-ticks-stream.xyz:8080/live",
                              on_message = on_message,
                              on_error = on_error)
    ws.run_forever()

def process_stock_price(ticker, price):
    print(f"Updating db for {ticker}")
    # Raw execution side-effect
    open("/tmp/db.log", "a").write(f"{ticker}:{price}\\n")

if __name__ == "__main__":
    connect_ws()`
  },
  {
    id: "sample-robust",
    title: "Example 2: Audit-Ready TS Transaction Handler (Collaborative)",
    prompt: "Write a production-grade TypeScript transaction processor. Include structured exceptions, parameter schema validation, telemetry trace integration, configuration steering hooks, and runnable unit test suites.",
    code: `/**
 * @file TransactionProcessor.ts
 * @provenance TCRA-P-v4.1.0-TS
 * @description Secure transaction entry router with step traceability & explicit limits.
 */

import { z } from "zod";

// 1. Explicit Schema Constraints for Steering & Safety (Controllability)
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive().max(10000000),
  senderId: z.string().min(3),
  recipientId: z.string().min(3),
  timestamp: z.number()
});

export type Transaction = z.infer<typeof TransactionSchema>;

export class TransactionProcessor {
  private allowedLimits: number;
  private readonly auditTrace: Array<{ step: string; timestamp: number; meta?: any }> = [];

  constructor(maxLimit = 1000000) {
    this.allowedLimits = maxLimit;
  }

  /**
   * Safe transaction router.
   * @traceability Linkable code paths with full diagnostic state-mapping (Transparency)
   */
  public async process(rawTx: unknown): Promise<{ success: boolean; traceId: string }> {
    const traceId = Math.random().toString(36).substring(2, 15);
    this.recordTrace("INIT_TRANSACTION", { traceId, input: typeof rawTx });

    try {
      // 2. Strict Input validation (Reliability)
      const tx = TransactionSchema.parse(rawTx);

      if (tx.amount > this.allowedLimits) {
        throw new Error(\`Transaction amount exceeded allowed limit boundary: \${this.allowedLimits}\`);
      }

      this.recordTrace("VALIDATION_SUCCESS", { amount: tx.amount });
      
      // Simulate processed ledger route
      const success = await this.commitToLedger(tx);
      this.recordTrace("COMMIT_SUCCESS", { ledgerStatus: success });

      return { success, traceId };
    } catch (error: any) {
      this.recordTrace("EXCEPTION_FATAL", { msg: error.message || String(error) });
      return { success: false, traceId };
    }
  }

  public getTraceLogs() {
    return [...this.auditTrace];
  }

  private recordTrace(step: string, meta?: any) {
    this.auditTrace.push({ step, timestamp: Date.now(), meta });
  }

  private async commitToLedger(tx: Transaction): Promise<boolean> {
    // Highly deterministic output
    return tx.amount > 0;
  }
}

// 3. Complete Traceable Unit Test Suite (Auditability)
export function runProcessorTests() {
  const processor = new TransactionProcessor();
  const mockTx = {
    id: "f37d6a54-7f13-43ef-ba4c-de86a7ff8ce2",
    amount: 5500.50,
    senderId: "USR-A9",
    recipientId: "USR-B12",
    timestamp: Date.now()
  };

  processor.process(mockTx).then(res => {
    console.assert(res.success === true, "✓ TCRA Base case processing test passed");
    console.assert(processor.getTraceLogs().length === 3, "✓ Step-by-step diagnostic trace verify passed");
    console.log("TS transaction test pipeline trace completed successfully.");
  });
}
`
  }
];

const CLASSIFICATION_CHANNELS = {
  "Automated Execution": {
    badge: "Automated Execution",
    tier: "Tier 1: Basic Reactive",
    desc: "Autonomous reactive loops containing opaque flow logic, minimal feedback steering, and highly fragile operational thresholds.",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.08)",
    border: "rgba(239, 68, 68, 0.25)"
  },
  "Assisted Automation": {
    badge: "Assisted Automation",
    tier: "Tier 2: Controlled Loop",
    desc: "Structured workflows utilizing local boundaries, basic parameter steering, and basic structural documentation.",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.25)"
  },
  "Delegated Reasoning": {
    badge: "Delegated Reasoning",
    tier: "Tier 3: Modular Autonomous",
    desc: "High reliability system including robust validation rules, rich error structures, explicit trace logs, and localized context containment.",
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.08)",
    border: "rgba(59, 130, 246, 0.25)"
  },
  "Collaborative Intelligence": {
    badge: "Collaborative Intelligence",
    tier: "Tier 4: Transparent Partnership",
    desc: "Peerless engineering featuring rigorous schema invariants, observable step-by-step traces, self-describing code mapping, and full test suites.",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.08)",
    border: "rgba(16, 185, 129, 0.25)"
  }
};

export default function App() {
  const [step, setStep] = useState(0);
  const [provider, setProvider] = useState<AIProviderId>("google");
  const [customModel, setCustomModel] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("gemini-2-5-flash");
  const [apiKey, setApiKey] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  
  // Audits History
  const [history, setHistory] = useState<SavedAudit[]>([]);
  const [showHistoryPane, setShowHistoryPane] = useState(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Load audit history
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tcra_history_audits");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not read local audit history storage", e);
    }
  }, []);

  const saveToHistory = (newAudit: SavedAudit) => {
    try {
      const updated = [newAudit, ...history.filter(h => h.id !== newAudit.id)].slice(0, 15);
      setHistory(updated);
      localStorage.setItem("tcra_history_audits", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not write to local audit history storage", e);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("tcra_history_audits");
  };

  const loadPreset = (presetIndex: number) => {
    const preset = PRESET_SAMPLES[presetIndex];
    setAiPrompt(preset.prompt);
    setGeneratedCode(preset.code);
    setError(null);
  };

  const triggerAuditSubmit = async () => {
    if (!generatedCode.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Find exact API Model ID
      const config = PROVIDER_CONFIGS[provider];
      const modelDetail = config.models.find(m => m.id === selectedModelId);
      const isCustom = selectedModelId === "custom";
      const apiModel = isCustom ? customModel.trim() : (modelDetail?.apiModelId || config.defaultModelId);

      if (isCustom && !apiModel) {
        throw new Error("Please specify your custom model ID string.");
      }

      const res = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          provider,
          apiKey,
          model: apiModel,
          prompt: aiPrompt,
          code: generatedCode
        })
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || `Server responded with HTTP ${res.status}`);
      }

      setResult(responseData);

      // Save to History state securely
      const auditPayload: SavedAudit = {
        id: Math.random().toString(36).substring(2, 12),
        timestamp: new Date().toLocaleTimeString(),
        provider: PROVIDER_CONFIGS[provider].label,
        model: apiModel,
        prompt: aiPrompt,
        code: generatedCode,
        result: responseData
      };
      saveToHistory(auditPayload);

      setStep(3); // To Report Step
    } catch (err: any) {
      setError(err.message || "An unexpected network or model connection timeout occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Step access rules
  const canProceedStep0 = provider === "google" || provider === "groq" || apiKey.trim().length > 6;
  const canProceedStep1 = aiPrompt.trim().length > 0;
  const canProceedStep2 = generatedCode.trim().length > 0;

  // Render variables
  const currentProviderConfig = PROVIDER_CONFIGS[provider];

  const triggerHistoryActivation = (hist: SavedAudit) => {
    setAiPrompt(hist.prompt);
    setGeneratedCode(hist.code);
    setResult(hist.result);
    setStep(3);
    setShowHistoryPane(false);
  };

  // Safe theme properties
  const classificationId = result?.classification || "Automated Execution";
  const mappedTheme = CLASSIFICATION_CHANNELS[classificationId as keyof typeof CLASSIFICATION_CHANNELS] || CLASSIFICATION_CHANNELS["Automated Execution"];

  return (
    <div className="min-h-screen bg-[#020813] text-slate-200 antialiased font-sans">
      
      {/* Primary Top Header Area */}
      <header className="border-b border-slate-900/80 bg-gradient-to-r from-[#030916] to-[#051125] px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600/20 to-emerald-500/10 border border-blue-500/40 shadow-blue-950/40">
            <Gauge id="app-logo" className="h-5 w-5 text-blue-400 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">TCRA Code Auditor</h1>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#4a9eff] bg-[#071329] border border-blue-900/60 px-1.5 py-0.5 rounded">v2.1</span>
            </div>
            <p className="text-[11px] font-mono tracking-wider text-slate-500/90 mt-0.5">
              Transparency · Controllability · Reliability · Auditability Framework
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={() => setShowHistoryPane(!showHistoryPane)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#0a1428] hover:bg-[#11203b] border border-slate-800/80 rounded-lg text-xs font-mono font-medium text-slate-400 hover:text-slate-200 transition"
          >
            <History className="h-3.5 w-3.5 text-blue-400" />
            Audits History ({history.length})
          </button>
          <div className="text-right hidden lg:block border-l border-slate-800/80 pl-4">
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest leading-none">Security context</p>
            <span className="text-xs text-xs text-emerald-400 inline-flex items-center gap-1 mt-1 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Client Key Isolation
            </span>
          </div>
        </div>
      </header>

      {/* Audit History Drawer */}
      <AnimatePresence>
        {showHistoryPane && (
          <motion.div
            initial={{ opacity: 0, x: 280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 280 }}
            className="fixed right-0 top-18 bottom-0 w-80 bg-[#040c1a] border-l border-slate-900 shadow-2xl z-50 flex flex-col p-5 no-print"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-900/80 mb-4">
              <h3 className="text-sm font-bold font-mono text-slate-200 flex items-center gap-1.5">
                <History className="h-4 w-4 text-blue-500" /> Session Audits
              </h3>
              <button
                onClick={() => setShowHistoryPane(false)}
                className="text-xs font-mono text-slate-500 hover:text-slate-300"
              >
                Close ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-600">
                  <Activity className="h-8 w-8 mx-auto stroke-[1.2] opacity-40 mb-3" />
                  <p className="text-xs font-mono text-slate-500">No active audits yet. Completed audits will appear here.</p>
                </div>
              ) : (
                history.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => triggerHistoryActivation(h)}
                    className="p-3 bg-[#081222] hover:bg-[#0c1a32] border border-slate-800/60 hover:border-slate-700/80 rounded-lg cursor-pointer transition text-left"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">{h.provider}</span>
                      <span className="text-[9px] font-mono text-slate-500">{h.timestamp}</span>
                    </div>
                    <div className="text-xs text-slate-300 line-clamp-1 font-mono tracking-tight mb-2">
                      Prompt: "{h.prompt}"
                    </div>
                    <div className="flex justify-between items-center bg-[#050d1a] px-2 py-1.5 rounded-md">
                      <span className="text-[10px] font-mono text-slate-400">Composite Score</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{h.result.composite} / 12</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 hover:border-red-900/60 rounded-lg text-xs font-mono text-red-400 mt-4 transition"
              >
                Clear History Logs
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Framework Stepper Steer Control Panel */}
      <nav className="border-b border-slate-900/60 bg-[#010610] no-print">
        <div className="max-w-5xl mx-auto flex overflow-x-auto justify-between px-6">
          {[
            { label: "1. AI Engine Config", stepIdx: 0 },
            { label: "2. Prompt Specification", stepIdx: 1 },
            { label: "3. Raw Code Entry", stepIdx: 2 },
            { label: "4. Auditor Evaluation Report", stepIdx: 3 }
          ].map((item) => {
            const isCompleted = item.stepIdx < step;
            const isCurrent = item.stepIdx === step;
            const isSelectable = isCompleted || (item.stepIdx === 3 && result);
            return (
              <button
                key={item.stepIdx}
                onClick={() => {
                  if (isSelectable) setStep(item.stepIdx);
                }}
                disabled={!isSelectable && item.stepIdx !== step}
                className={`py-3.5 px-4 flex-1 text-center font-mono text-xs tracking-wider transition relative whitespace-nowrap ${
                  isCurrent
                    ? "text-blue-400 font-bold"
                    : isCompleted
                    ? "text-emerald-500 hover:text-emerald-400 cursor-pointer"
                    : "text-slate-600 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span className={`inline-flex items-center justify-center h-4 w-4 rounded-full text-[9px] font-bold ${
                    isCurrent 
                      ? "bg-blue-500/20 text-blue-400 border border-blue-400/40" 
                      : isCompleted 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/40" 
                      : "bg-slate-900 text-slate-700 border border-slate-800"
                  }`}>
                    {isCompleted ? "✓" : item.stepIdx + 1}
                  </span>
                  {item.label}
                </div>
                {isCurrent && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Core Container */}
      <main className="max-w-5xl mx-auto p-6 md:p-8">
        
        {/* Step 0: API Engine & Model Abstraction Setup */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#040c1a]/95 border border-slate-900/80 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-400" /> AI Provider & Model Abstraction
              </h2>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed max-w-3xl">
                The TCRA evaluation engine is client-customizable. Pair your secure API key with the provider of your choice, or use the pre-configured academic model templates.
              </p>
            </div>

            {/* Provider Grid Selection */}
            <div className="space-y-3">
              <label className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold block">
                Select Intelligent Router
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.keys(PROVIDER_CONFIGS) as Array<keyof typeof PROVIDER_CONFIGS>).map((pKey) => {
                  const provConfig = PROVIDER_CONFIGS[pKey];
                  const isSelected = provider === pKey;
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => {
                        setProvider(pKey as AIProviderId);
                        setSelectedModelId(provConfig.defaultModelId);
                      }}
                      className={`p-4 rounded-xl text-left border flex flex-col justify-between transition ${
                        isSelected
                          ? "bg-gradient-to-b from-[#0d1e38] to-[#0a1526] border-blue-500/60 ring-2 ring-blue-500/15"
                          : "bg-[#061020] border-slate-800/80 hover:border-slate-700 hover:bg-[#071328]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-mono font-bold tracking-wider ${isSelected ? "text-blue-400" : "text-slate-400"}`}>
                            {provConfig.label}
                          </span>
                          {isSelected && <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 lines-clamp-1">
                          {pKey === "google" || pKey === "groq" ? "Server or Client Grounded" : "Direct model evaluation interface"}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-[#a1beeb]/50 mt-4 bg-[#030914] px-2 py-1 rounded inline-block self-start border border-slate-900">
                        {pKey === "google" ? "Gemini Models" : pKey === "openai" ? "GPT Engine" : pKey === "anthropic" ? "Claude Engine" : "LLaMA/Mixtral"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* API Key Entry Box */}
            <div className="space-y-2 border-t border-slate-900 pt-5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold block">
                  Provider API Token / Authorization
                </label>
                {(provider === "google" || provider === "groq") && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 px-2 py-0.5 rounded font-mono">
                    💡 Optional / Server Pre-configured
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-500">
                  <Key className="h-4 w-4" />
                </span>
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={currentProviderConfig.placeholder}
                  className="w-full bg-[#051021] border border-slate-800/80 rounded-xl py-3 pl-10 pr-16 text-sm text-slate-300 font-mono focus:outline-none focus:border-blue-500/80 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800/60 rounded-md text-xs font-mono text-slate-400"
                >
                  {showKey ? <EyeOff className="h-3.5 w-3.5 inline" /> : <Eye className="h-3.5 w-3.5 inline" />}
                </button>
              </div>
              {(provider === "google" || provider === "groq") && !apiKey ? (
                <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                  Notice: Your application sandbox is hosted with persistent environment bindings. Leaving this blank routes your request through the workspace pre-configured key automatically (if available).
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 font-mono">
                  Your secure environment key is processed server-side only in dynamic requests and never stored.
                </p>
              )}
            </div>

            {/* Model Selector & Direct Extraction Mapping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-slate-900 pt-5">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold block">
                  Audit LLM Identifier
                </label>
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full bg-[#051021] border border-slate-800/80 rounded-xl py-3 px-3.5 text-sm text-slate-300 font-mono focus:outline-none focus:border-blue-500/80 transition"
                >
                  {currentProviderConfig.models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} ({m.apiModelId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                {selectedModelId === "custom" ? (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold block">
                      Custom String API ID
                    </label>
                    <input
                      type="text"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      placeholder="e.g. gpt-4o-2024-08-06 or claude-3-haiku-20240307"
                      className="w-full bg-[#051021] border border-slate-800/80 rounded-xl py-3 px-3.5 text-sm text-slate-300 font-mono focus:outline-none focus:border-blue-500/80 transition"
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-[#030914] rounded-xl border border-slate-900 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-600 font-mono block">Selected Engine Hook</span>
                    <span className="text-xs text-slate-400 font-mono font-semibold">
                      {currentProviderConfig.models.find(m => m.id === selectedModelId)?.apiModelId}
                    </span>
                    <p className="text-[11px] text-slate-500 leading-normal mt-1">
                      Highly optimized for structured JSON schemas and compliance evaluations.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Stepper Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-900/80">
              <span className="text-xs text-slate-600 font-mono">STEP 1 OF 4</span>
              <button
                type="button"
                disabled={!canProceedStep0}
                onClick={() => setStep(1)}
                className={`px-5 py-3 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition ${
                  canProceedStep0
                    ? "bg-blue-500 hover:bg-blue-600 text-[#020813] cursor-pointer"
                    : "bg-[#09152b] text-slate-600 cursor-not-allowed border border-slate-900"
                }`}
              >
                Configure Prompt Context <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 1: Original Prompt Description & Presets */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#040c1a]/95 border border-slate-900/80 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" /> Prompt Context Formulation
              </h2>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed max-w-3xl">
                The TCRA evaluation compares raw generated syntax with original human instruction metrics to determine steering compliance and scope discipline accurately.
              </p>
            </div>

            {/* Quick Demo Docks / Presets */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 block">
                Load Academic Test Presets (Instant Run demo)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {PRESET_SAMPLES.map((pres, idx) => (
                  <button
                    key={pres.id}
                    type="button"
                    onClick={() => loadPreset(idx)}
                    className="p-3 bg-[#030914] hover:bg-[#071329] border border-slate-800/80 rounded-lg text-left text-xs transition space-y-1.5"
                  >
                    <div className="font-semibold text-[#4a9eff] flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> {pres.title}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                      "{pres.prompt}"
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Prompt Feed textarea */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold block">
                Enter Original Conversational Promptext
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={6}
                placeholder="Paste the precise dialogue prompt that instructed the AI builder to construct the code artifact..."
                className="w-full bg-[#051021] border border-slate-800/80 rounded-xl p-4 text-sm text-slate-300 font-mono tracking-wide leading-relaxed focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/40 transition placeholder:text-slate-600"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>Avoid omitting core parameters for maximum accuracy.</span>
                <span>{aiPrompt.length} chars</span>
              </div>
            </div>

            {/* Navigation Block */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-900/80">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="px-4 py-2.5 border border-slate-800 hover:border-slate-700 bg-transparent rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 transition"
              >
                ← Back
              </button>
              <span className="text-xs text-slate-600 font-mono">STEP 2 OF 4</span>
              <button
                type="button"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                className={`px-5 py-3 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition ${
                  canProceedStep1
                    ? "bg-blue-500 hover:bg-blue-600 text-[#020813] cursor-pointer"
                    : "bg-[#09152b] text-slate-600 cursor-not-allowed border border-slate-900"
                }`}
              >
                Supply Code Base <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Code block editor paste area */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#040c1a]/95 border border-slate-900/80 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-blue-400" /> Source Sandbox Input
                </h2>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed max-w-3xl">
                  Provide the complete generated file syntax. The evaluator scans structure, exception routines, hardcoded dependencies, and testing capability footprints.
                </p>
              </div>

              {aiPrompt && (
                <div className="py-2 px-3 bg-[#030a17] border border-slate-800/80 rounded-lg text-xs flex items-center gap-2 max-w-md">
                  <span className="font-mono text-slate-500">PROMPT:</span>
                  <p className="text-slate-400 truncate italic">"{aiPrompt}"</p>
                </div>
              )}
            </div>

            {/* Code Textarea editor */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-widest text-[#4a9eff] font-bold block">
                Source Code Artifact (Vibecode Segment)
              </label>
              <textarea
                value={generatedCode}
                onChange={(e) => setGeneratedCode(e.target.value)}
                rows={16}
                placeholder="Paste the raw output or file codebase that was fully or partially synthesized by AI..."
                className="w-full bg-[#030914] border border-slate-800/85 rounded-xl p-4 text-xs text-blue-300 font-mono tracking-normal leading-relaxed focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 transition placeholder:text-slate-700 font-medium"
                style={{ tabSize: 2 }}
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>Ensure any markdown fences (e.g. ```) are parsed smoothly.</span>
                <span>{generatedCode.split("\n").length} Lines · {generatedCode.length} Characters</span>
              </div>
            </div>

            {/* Error Indicators */}
            {error && (
              <div className="p-4 bg-red-950/20 border border-red-900/60 rounded-xl flex items-center gap-3 text-sm text-red-300">
                <ShieldAlert className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="font-bold">Evaluation Pipeline Failed</p>
                  <p className="text-xs text-red-400/90 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Processing / Load States */}
            {loading && (
              <div className="p-6 bg-[#030914]/80 border border-blue-900/30 rounded-xl space-y-4">
                <div className="flex items-center gap-3 justify-center">
                  <div className="h-4.5 w-4.5 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin" />
                  <span className="text-xs font-mono text-blue-400 font-bold tracking-widest">RUNNING INTELLIGENCE BOUNDARY SCANS</span>
                </div>
                <p className="text-xs text-slate-500 font-mono text-center max-w-sm mx-auto leading-relaxed">
                  Executing structural risk analysis, computing Transparency, Controllability, Reliability, and Auditability ratios securely...
                </p>
              </div>
            )}

            {/* Stepper Navigation Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-900/80">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 border border-slate-800 hover:border-slate-700 bg-transparent rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 transition"
              >
                ← Back
              </button>
              <span className="text-xs text-slate-600 font-mono">STEP 3 OF 4</span>
              <button
                type="button"
                disabled={!canProceedStep2 || loading}
                onClick={triggerAuditSubmit}
                className={`px-6 py-3.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
                  canProceedStep2 && !loading
                    ? "bg-emerald-500 hover:bg-emerald-600 text-[#020813] shadow-emerald-950/40 shadow-lg"
                    : "bg-[#09152b] text-slate-600 cursor-not-allowed border border-slate-900"
                }`}
              >
                {loading ? "Computing Audit..." : "Execute TCRA Evaluation"} <ClipboardCheck className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Fully formatted Evaluation Report Visualizer */}
        {step === 3 && result && (
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="flex flex-wrap justify-between items-center gap-4 bg-[#040c1a]/95 border border-slate-900/80 p-4 rounded-xl no-print">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-mono font-bold text-slate-400">Compliance Report Available</span>
              </div>
              
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setStep(2);
                  }}
                  className="px-4 py-2 border border-slate-800 bg-[#050d1a] hover:bg-[#0c1a32] rounded-lg text-xs font-mono text-slate-300 hover:text-slate-100 transition"
                >
                  ← Adjust Code Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-mono font-bold text-slate-100 transition flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" /> Export PDF Report
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `tcra_audit_report_${Date.now()}.json`;
                    a.click();
                  }}
                  className="px-3.5 py-2 border border-slate-800 hover:bg-[#091428] rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 transition"
                  title="Download Raw JSON Payload"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Printable Evaluation Area */}
            <div ref={printAreaRef} className="bg-[#030914] rounded-2xl border border-slate-900 shadow-2xl p-6 md:p-10 space-y-8 relative overflow-hidden print:p-0 print:border-none print:shadow-none">
              
              {/* Report Header */}
              <div className="border-b border-slate-900 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block font-semibold">TCRA Compliance Core</span>
                  <h2 className="text-2xl font-black text-slate-100 tracking-tight mt-1">
                    AI-Vibecoded Compliance Evaluation Record
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-mono text-slate-500">
                    <span>EVAL TIME: {new Date().toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-[#4a9eff]">AUTO ROUTER ID: {currentProviderConfig.label}</span>
                  </div>
                </div>

                <div className="bg-[#050e1d] border border-slate-900 p-3 rounded-xl text-right">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Verification Signature</span>
                  <span className="text-xs text-blue-400 font-mono font-medium mt-1 inline-block">TCRA-VALIDATED-M3</span>
                </div>
              </div>

              {/* Big Metrics Grid (Speedometer/Composite + Classification) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Composite Index Score */}
                <div className="lg:col-span-4 bg-gradient-to-b from-[#061021] to-[#040c1a] border border-slate-900 rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-2">
                    Composite Index Ratio
                  </span>
                  <div className="relative inline-block mt-2">
                    <span 
                      style={{ color: mappedTheme.color }}
                      className="text-7xl font-black font-mono tracking-tighter"
                    >
                      {result.composite}
                    </span>
                    <span className="text-sm font-mono text-slate-600 block mt-1">out of 12 index</span>
                  </div>
                  
                  {/* Gauge indicator mapping */}
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mt-6 border border-slate-900">
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${(result.composite / 12) * 100}%`,
                        backgroundColor: mappedTheme.color
                      }} 
                    />
                  </div>
                </div>

                {/* Intelligence-Automation Boundary Tier Mapping */}
                <div 
                  className="lg:col-span-8 border rounded-xl p-6 relative flex flex-col justify-between"
                  style={{ 
                    backgroundColor: mappedTheme.bg,
                    borderColor: mappedTheme.border
                  }}
                >
                  <div>
                    <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        Boundary Classification
                      </span>
                      <span 
                        style={{ color: mappedTheme.color, borderColor: mappedTheme.border }}
                        className="text-xs font-bold font-mono px-2.5 py-0.5 rounded border uppercase tracking-wider"
                      >
                        {mappedTheme.tier}
                      </span>
                    </div>

                    <h3 
                      style={{ color: mappedTheme.color }}
                      className="text-xl font-bold font-mono tracking-tight"
                    >
                      {result.classification}
                    </h3>
                    <p className="text-sm text-slate-300 mt-2.5 leading-relaxed font-sans">
                      {mappedTheme.desc}
                    </p>
                  </div>

                  <div className="border-t border-slate-900/60 pt-4 mt-6">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block tracking-wider mb-1">Evaluating Auditor Context Rationale</span>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      "{result.classificationSummary}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Dimensional Ratios Plot (Radar on Left, Progress ratings on right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                <div className="lg:col-span-5 bg-[#050e1c] border border-slate-900 rounded-xl p-5 flex flex-col justify-center">
                  <RadarChart scores={result} />
                </div>

                <div className="lg:col-span-7 bg-[#050e1c] border border-slate-900 rounded-xl p-5 md:p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#4a9eff] block font-bold">Dimensions Checklist</span>
                    <h4 className="text-sm font-bold text-slate-300">Detailed Metric Execution Records</h4>
                  </div>

                  <div className="space-y-4">
                    <ScoreBar score={result.transparency.score} label="Transparency (T)" />
                    <ScoreBar score={result.controllability.score} label="Controllability (C)" />
                    <ScoreBar score={result.reliability.score} label="Reliability (R)" />
                    <ScoreBar score={result.auditability.score} label="Auditability (A)" />
                  </div>

                  {/* Vibecoding footprint analyzer */}
                  <div className="border-t border-slate-900 pt-4 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between bg-slate-950/40 p-3 rounded-lg border border-slate-900">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-mono font-bold ${result.isVibecoded ? "text-yellow-400" : "text-emerald-400"}`}>
                          {result.isVibecoded ? "⚠️ AI-VIBECODED FOOTPRINT DETECTED" : "✅ HUMAN-COMPLIANCE PROFILE MATCHED"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        {result.vibecodeEvidence || "Trace elements indicate systemic automated sequence matching."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rich breakdown list of explanatory descriptions for each category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "transparency" as const, label: "Transparency", info: "Visible Reasoning Trail", col: "#ef4444" },
                  { key: "controllability" as const, label: "Controllability", info: "Human Steering Ability", col: "#f59e0b" },
                  { key: "reliability" as const, label: "Reliability", info: "Determinism & Safety Invariants", col: "#3b82f6" },
                  { key: "auditability" as const, label: "Auditability", info: "Traceability & Test Coverage", col: "#10b981" }
                ].map((dim) => {
                  const dataDetail = result[dim.key];
                  return (
                    <div key={dim.key} className="bg-[#051020] border border-slate-900 p-5 rounded-xl flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div>
                          <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase block">{dim.info}</span>
                          <h5 className="font-bold text-slate-200 text-sm mt-0.5">{dim.label} Metrics</h5>
                        </div>
                        <span 
                          style={{ color: dim.col, borderColor: `${dim.col}33` }}
                          className="h-8 w-8 rounded-lg border flex items-center justify-center font-mono text-sm font-black bg-slate-950"
                        >
                          {dataDetail.score}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {dataDetail.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Specific Risks and Silent Failures Profile */}
              <div className="bg-red-950/10 border border-slate-900 rounded-xl p-5 md:p-6 space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#ef4444] font-bold block flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Identified Critical Security Risks & Failure Vectors
                </span>

                <div className="space-y-3">
                  {result.risks && result.risks.length > 0 ? (
                    result.risks.map((risk, index) => (
                      <div key={index} className="flex gap-3 text-xs leading-relaxed text-slate-300">
                        <span className="font-mono text-[#ef4444] font-bold select-none">[0{index + 1}]</span>
                        <p>{risk}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 font-mono italic">No significant functional regression risks or silent failure profiles detected.</p>
                  )}
                </div>
              </div>

              {/* Prompt recap */}
              {aiPrompt && (
                <div className="bg-[#040d1a] border border-slate-900 p-5 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Sourced Conversational Context</span>
                  <p className="text-xs font-mono text-slate-400 leading-relaxed italic bg-slate-950/40 p-3 rounded border border-slate-900/60">
                    "{aiPrompt}"
                  </p>
                </div>
              )}

              {/* Regulatory Footer */}
              <div className="border-t border-slate-900 pt-6 flex flex-col md:flex-row justify-between text-[11px] font-mono text-slate-500 leading-relaxed gap-4">
                <div>
                  <p>© Ishrak (2025) • VibeBench-Mini Verification Platform Execution</p>
                  <p className="mt-0.5">Academic Framework: Boundary Conditions in Conversational AI Generators</p>
                </div>
                <div className="md:text-right">
                  <p>IIT, Jahangirnagar University</p>
                  <p className="mt-0.5 text-blue-400 hover:underline cursor-pointer no-print inline-flex items-center gap-1">
                     Academic citation context
                  </p>
                </div>
              </div>

            </div>

            {/* Print Area Style Overwrite */}
            <div className="text-center pt-2 no-print">
              <button
                type="button"
                onClick={() => {
                  setStep(0);
                  setAiPrompt("");
                  setGeneratedCode("");
                  setResult(null);
                  setError(null);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#0a1428] hover:bg-[#11203b] border border-slate-800/80 rounded-lg text-xs font-mono font-bold text-slate-300 transition"
              >
                <RotateCcw className="h-4 w-4 text-blue-500" /> Start New Evaluation Cycle
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
