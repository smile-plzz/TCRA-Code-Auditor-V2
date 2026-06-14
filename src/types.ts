export interface AuditResultDetail {
  score: number;
  explanation: string;
}

export interface AuditResult {
  transparency: AuditResultDetail;
  controllability: AuditResultDetail;
  reliability: AuditResultDetail;
  auditability: AuditResultDetail;
  composite: number;
  classification: string;
  classificationSummary: string;
  risks: string[];
  isVibecoded: boolean;
  vibecodeEvidence: string;
}

export interface ModelOption {
  id: string; // The UI display id or mapping
  label: string;
  apiModelId: string; // The real backend model id used in API calls
}

export interface ProviderConfig {
  id: string;
  label: string;
  placeholder: string;
  models: ModelOption[];
  defaultModelId: string;
}

export type AIProviderId = "anthropic" | "openai" | "google" | "groq";
