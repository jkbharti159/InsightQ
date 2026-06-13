export type FileType = "excel" | "csv" | "pdf" | "image";

export interface MetricCard {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

export interface ChartDefinition {
  id: string;
  title: string;
  type: "bar" | "line" | "area" | "pie";
  xAxisKey: string;
  yAxisKeys: string[];
  data: Array<Record<string, any>>;
}

export interface DocumentInsight {
  category: "Growth" | "Risk" | "Efficiency" | "Financial" | string;
  title: string;
  description: string;
  impact: "High" | "Medium" | "Low";
}

export interface AnalysisReport {
  title: string;
  documentType: string;
  summary: string;
  metrics: MetricCard[];
  charts: ChartDefinition[];
  insights: DocumentInsight[];
  markdownReport: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AgentStep {
  name: string;
  status: "pending" | "processing" | "success" | "error";
  description: string;
}

export interface SpreadsheetTable {
  sheetName: string;
  headers: string[];
  rows: Array<Record<string, any>>;
}
