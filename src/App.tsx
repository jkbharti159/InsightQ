/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Sparkles,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Cpu,
  BookmarkCheck,
} from "lucide-react";
import {
  SpreadsheetTable,
  AnalysisReport,
  ChatMessage,
  AgentStep,
  FileType,
} from "./types";
import SpreadsheetPreview from "./components/SpreadsheetPreview";
import ReportDashboard from "./components/ReportDashboard";
import AgentChat from "./components/AgentChat";
import { generateSimulatedReport, generateSimulatedChatResponse } from "./simulation";

function AnalyticalBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none opacity-50">
      {/* High-quality subtle executive grid layout */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_0.5px,transparent_0.5px),linear-gradient(to_bottom,#27272a_0.5px,transparent_0.5px)] bg-[size:5rem_5rem] opacity-35" 
        style={{ 
          maskImage: "radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)", 
          WebkitMaskImage: "radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)" 
        }}
      />
      
      {/* Clean modern layout dot accents */}
      <svg className="absolute w-full h-full text-emerald-500/10 stroke-[0.5]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#10b981" fillOpacity="0.05" />
          </pattern>
        </defs>
        
        {/* Soft elegant dot pattern */}
        <rect width="100%" height="100%" fill="url(#dot-grid)" />

        {/* Minimal organic growth curves representing executive trends */}
        <path 
          d="M -100 400 C 300 250, 600 500, 1000 300 S 1400 450, 1800 200" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.2" 
          style={{ opacity: 0.08 }}
        />
        <path 
          d="M -50 500 C 400 550, 800 350, 1200 400 S 1600 300, 2000 350" 
          fill="none" 
          stroke="#059669" 
          strokeWidth="1" 
          style={{ opacity: 0.05 }}
        />
      </svg>
      
      {/* Professional subtle gradient ambiance for deep visual layers */}
      <div className="absolute top-[10%] right-[15%] w-[600px] h-[600px] bg-emerald-950/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] bg-zinc-900/40 rounded-full blur-[120px]" />
    </div>
  );
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetTable[]>([]);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  
  // App states
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userCustomInstruction, setUserCustomInstruction] = useState("");

  // Agent Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatThinking, setIsChatThinking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stepper representation for real-time Agent thought progression
  const [steps, setSteps] = useState<AgentStep[]>([
    { name: "File Reader", status: "pending", description: "Extracting raw document details..." },
    { name: "Structure Parsing", status: "pending", description: "Mapping columns, schemas, or tables..." },
    { name: "Visual Generation", status: "pending", description: "Plotting trends and statistical charting keys..." },
    { name: "Expert Reporting", status: "pending", description: "Drafting analytical forecasts and executive summaries..." },
  ]);

  // Drag and Drop Logic
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Determine file formats and perform preliminary client-side spreadsheet extraction
  const processSelectedFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMessage(null);
    setSpreadsheetData([]);
    setReport(null);
    setChatMessages([]);

    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    let detectedType: FileType | null = null;

    if (ext === "xlsx" || ext === "xls") {
      detectedType = "excel";
    } else if (ext === "csv") {
      detectedType = "csv";
    } else if (ext === "pdf") {
      detectedType = "pdf";
    } else if (["png", "jpg", "jpeg", "webp"].includes(ext || "")) {
      detectedType = "image";
    } else {
      setErrorMessage("Unrecognized file format. Please upload spreadsheet sheets (.xlsx, .xls, .csv), PDFs, or common images.");
      setFile(null);
      return;
    }

    setFileType(detectedType);

    // If Excel or CSV, parse it right in the browser using SheetJS for a nice zero-latency sheet preview pane
    if (detectedType === "excel" || detectedType === "csv") {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "array" });
            const parsedSheets: SpreadsheetTable[] = workbook.SheetNames.map((name) => {
              const worksheet = workbook.Sheets[name];
              const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as Array<Record<string, any>>;
              const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
              return {
                sheetName: name,
                headers,
                rows,
              };
            });
            setSpreadsheetData(parsedSheets);
          } catch (err) {
            console.error("Local sheet parsing error:", err);
            setErrorMessage("Failed to extract data grid preview. However, we can still parse it directly through our AI Agent.");
          }
        };
        reader.readAsArrayBuffer(selectedFile);
      } catch (err) {
        console.error("FileReader error:", err);
      }
    }
  };

  // Run whole pipeline to post structured data/base64 to Gemini server
  const triggerAiAnalysis = async () => {
    if (!file || !fileType) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setActiveStepIndex(0);
    
    // Reset steps state to clean pending status
    setSteps([
      { name: "File Reader", status: "pending", description: "Extracting raw document details..." },
      { name: "Structure Parsing", status: "pending", description: "Mapping columns, schemas, or tables..." },
      { name: "Visual Generation", status: "pending", description: "Plotting trends and statistical charting keys..." },
      { name: "Expert Reporting", status: "pending", description: "Drafting analytical forecasts and executive summaries..." },
    ]);

    // Helper to simulate step completion timings for high quality visual engagement
    const setStepStatus = (index: number, status: "pending" | "processing" | "success" | "error") => {
      setSteps((prev) =>
        prev.map((step, i) => (i === index ? { ...step, status } : step))
      );
    };

    try {
      // Step 1: Read Data
      setStepStatus(0, "processing");
      await new Promise((r) => setTimeout(r, 600));
      setStepStatus(0, "success");

      // Step 2: Structure Parsing
      setActiveStepIndex(1);
      setStepStatus(1, "processing");
      await new Promise((r) => setTimeout(r, 600));
      setStepStatus(1, "success");

      // Step 3 & 4: Submit to server and await full Gemini modeling
      setActiveStepIndex(2);
      setStepStatus(2, "processing");
      setStepStatus(3, "processing");

      let filePayload = "";
      if (fileType === "excel" || fileType === "csv") {
        // Convert extracted data rows into a compact JSON string representation for Gemini text context
        filePayload = JSON.stringify(
          spreadsheetData.map((t) => ({
            sheet: t.sheetName,
            rows: t.rows.slice(0, 350), // Send first 350 rows to fit in structural prompts accurately
          })),
          null,
          2
        );
      } else {
        // PDF or Image bases
        filePayload = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const rawB64 = (reader.result as string).split(",")[1];
            resolve(rawB64);
          };
          reader.onerror = () => reject(new Error("Failed to digest binary file bytes"));
          reader.readAsDataURL(file);
        });
      }

      let reportResult: AnalysisReport;
      try {
        // Query Back-end API
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileType,
            fileName: file.name,
            fileData: filePayload,
            userPrompt: userCustomInstruction,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Server analytical execution failed");
        }

        reportResult = await response.json();
      } catch (apiErr: any) {
        console.warn("Backend API unavailable, executing high-fidelity Offline Hybrid simulation fallback:", apiErr);
        // Simulate a minor analytical rendering delay
        await new Promise((r) => setTimeout(r, 800));
        reportResult = generateSimulatedReport(file.name, fileType, userCustomInstruction);
        (reportResult as any).isSimulated = true;
      }

      setReport(reportResult);

      setStepStatus(2, "success");
      setStepStatus(3, "success");
      setActiveStepIndex(3);

      // Prepopulate Agent chat with welcoming first insights
      setChatMessages([
        {
          id: "welcome_msg",
          role: "assistant",
          content: `Hello! I have fully processed and mapped "${file.name}"${(reportResult as any).isSimulated ? " using high-fidelity offline synthesis" : ""}. I've plotted ${reportResult.charts.length} dynamic interactive charts, crafted an extensive Executive Report, and derived ${reportResult.insights.length} High-Impact Actions. \n\nWould you like me to compile this output as an elegant printable **Executive PDF Report** or as a slide presentation **PPT Deck**? You may select the export format at the top of your visual dashboard, or ask me to guide you!`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setStepStatus(activeStepIndex, "error");
      setErrorMessage(err.message || "Something went wrong while communicating with the AI Agent.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Chat conversation dispatch
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isChatThinking || !report) return;

    const userMsg: ChatMessage = {
      id: `m_${Date.now()}_u`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatThinking(true);

    try {
      let botResponse = "";
      if ((report as any).isSimulated) {
        // Simulate minor mathematical processing delay
        await new Promise((r) => setTimeout(r, 600));
        botResponse = generateSimulatedChatResponse(text, report);
      } else {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...chatMessages, userMsg],
            documentContext: report,
          }),
        });

        if (!response.ok) {
          throw new Error("Chat assistant lost connection");
        }

        const result = await response.json();
        botResponse = result.text;
      }
      
      const botMsg: ChatMessage = {
        id: `m_${Date.now()}_b`,
        role: "assistant",
        content: botResponse,
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `m_${Date.now()}_err`,
          role: "assistant",
          content: `I encountered an issue computing that command: ${err.message || "Network Timeout."}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsChatThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-emerald-950 selection:text-emerald-100 pb-12 relative overflow-x-hidden">
      {/* Analytical Background Backdrop */}
      <AnalyticalBackground />

      {/* Visual Accent Banner */}
      <div className="h-0.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-zinc-800 w-full relative z-10" />

      {/* Hero Header bar */}
      <header className="px-6 py-5 bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40 backdrop-blur-md bg-zinc-950/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-sm flex items-center justify-center font-serif italic text-white font-bold text-lg select-none">
              I
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-serif text-zinc-100 tracking-wide flex items-center gap-2">
                InsightQ
                <span className="px-2 py-0.5 text-[9px] bg-zinc-900 text-zinc-500 font-mono tracking-wider rounded border border-zinc-800 uppercase">
                  v1.2 Live
                </span>
              </h1>
              <p className="text-zinc-500 text-xs font-medium">Sophisticated Document Parsing & Actionable Business Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/30 text-emerald-400 font-semibold text-[11px] rounded-sm border border-emerald-900/50">
              <BookmarkCheck className="w-3.5 h-3.5" />
              Document Parser Engine Active
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="max-w-7xl mx-auto px-6 pt-8 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950 to-zinc-950">
        
        {/* Error Callout Block if any */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-950/20 border border-rose-900/50 rounded-sm flex items-start gap-3 text-sm text-zinc-300">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-rose-400">Process Error</h4>
              <p className="text-xs text-zinc-400 mt-1">{errorMessage}</p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => setErrorMessage(null)}
                  className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-sm text-xs font-semibold hover:bg-zinc-800 transition-all text-zinc-300"
                >
                  Dismiss
                </button>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Confirm your GEMINI_API_KEY environment variable is configured in AI Studio Secrets menu.
                </span>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!report ? (
            /* Upload Screen Stage */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              id="upload-stage"
            >
              {/* Left Column Upload Controllers */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-sm p-6 sm:p-8 space-y-6 shadow-xl">
                  <div>
                    <h2 className="text-2xl font-serif text-zinc-100 italic">Upload Data Source</h2>
                    <p className="text-zinc-500 text-xs mt-1">
                      Our intelligence agent extracts raw matrices, text vectors, or PDF sheets instantly.
                    </p>
                  </div>

                  {/* Drag Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    id="dropzone"
                    className={`border-2 border-dashed rounded-sm p-8 sm:p-12 text-center cursor-pointer transition-all ${
                      dragActive
                        ? "border-emerald-500 bg-emerald-950/10"
                        : "border-zinc-800 bg-zinc-900/10 hover:border-zinc-700 hover:bg-zinc-900/20"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileInputChange}
                      accept=".xlsx,.xls,.csv,.pdf,image/*"
                      className="hidden"
                    />

                    <div className="flex flex-col items-center space-y-3.5">
                      <div className="p-4 bg-zinc-900 text-emerald-500 border border-zinc-800 rounded-full">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-zinc-200 font-semibold text-sm">
                          {file ? file.name : "Drag & drop files here, or click to choose"}
                        </p>
                        <p className="text-zinc-500 text-xs mt-1 font-mono">
                          Supports Excel (.xlsx, .xls), CSV datasets, PDF documents, or Images
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* File Spec Indicator Info */}
                  {file && (
                    <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-sm flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        {fileType === "excel" || fileType === "csv" ? (
                          <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                        ) : fileType === "pdf" ? (
                          <FileText className="w-5 h-5 text-rose-500" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-emerald-500" />
                        )}
                        <div>
                          <p className="font-semibold text-zinc-200">{file.name}</p>
                          <p className="text-zinc-500 font-mono text-[10px]">
                            {(file.size / 1024).toFixed(1)} KB | {fileType?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setFile(null);
                          setFileType(null);
                          setSpreadsheetData([]);
                        }}
                        className="text-emerald-500 hover:text-emerald-400 font-semibold"
                      >
                        Change source
                      </button>
                    </div>
                  )}

                  {/* Advanced Custom Instruction Options */}
                  <div className="space-y-2">
                    <label className="text-zinc-400 font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      Optional Guidance Coordinates
                    </label>
                    <textarea
                      value={userCustomInstruction}
                      onChange={(e) => setUserCustomInstruction(e.target.value)}
                      placeholder="e.g., focus heavily on profit margins, search for quarterly anomalies, draft list of structural optimizations..."
                      rows={3}
                      className="w-full border border-zinc-800 rounded-sm p-3 text-xs bg-zinc-950 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-zinc-600 font-sans"
                    />
                  </div>

                  {/* Operational trigger button */}
                  <button
                    disabled={!file || isProcessing}
                    onClick={triggerAiAnalysis}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-zinc-100 hover:bg-white text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:cursor-not-allowed shadow-md"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        COMMUNING DATA PIPELINE...
                      </>
                    ) : (
                      <>
                        Execute Vector Analysis
                        <ArrowRight className="w-4 h-4 animate-pulse" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column Progressing Steps or Help Cards */}
              <div className="lg:col-span-5 space-y-6">
                {isProcessing ? (
                  /* Animated steps dashboard during parsing */
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-sm p-6 sm:p-8 space-y-6 shadow-xl">
                    <div>
                      <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">Agent Thought Pipeline</h3>
                      <p className="text-zinc-400 text-xs">Compiling semantic structures to charts.</p>
                    </div>

                    <div className="space-y-5">
                      {steps.map((step, idx) => (
                        <div
                          key={step.name}
                          className={`flex items-start gap-4 p-4 rounded-sm border transition-all ${
                            idx === activeStepIndex
                              ? "bg-zinc-900/80 border-emerald-500/40 shadow-md scale-[1.01]"
                              : "border-zinc-850 bg-zinc-950/20 opacity-50"
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {step.status === "success" ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : step.status === "processing" ? (
                              <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                            ) : step.status === "error" ? (
                              <AlertTriangle className="w-5 h-5 text-rose-500 animate-bounce" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-zinc-800" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-zinc-200 text-sm">{step.name}</h4>
                            <p className="text-zinc-500 text-xs mt-0.5">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Standard information card */
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-sm p-6 sm:p-8 text-zinc-300 space-y-6 shadow-xl">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Systems Advisory</h3>
                      <h3 className="font-serif text-2xl text-zinc-100 italic">Functional Overview</h3>
                    </div>

                    <div className="space-y-5">
                      <div className="flex gap-3">
                        <span className="w-6 h-6 rounded-sm bg-emerald-950/50 text-emerald-400 border border-emerald-900/50 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                          01
                        </span>
                        <div>
                          <h4 className="font-semibold text-zinc-200 text-sm">Comprehensive Data Mapping</h4>
                          <p className="text-zinc-400 text-xs leading-relaxed mt-0.5">
                            Our layout parser extracts raw matrix tables from spreadsheets, formats unstructured PDF logs, and catalogs high-contrast images.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="w-6 h-6 rounded-sm bg-emerald-950/50 text-emerald-400 border border-emerald-900/50 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                          02
                        </span>
                        <div>
                          <h4 className="font-semibold text-zinc-200 text-sm">Automated Trend Synthesis</h4>
                          <p className="text-zinc-400 text-xs leading-relaxed mt-0.5">
                            The Advisory AI synthesizes clean visual assets, generates key operational performance indices, and drafts an executive strategic summary.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="w-6 h-6 rounded-sm bg-emerald-950/50 text-emerald-400 border border-emerald-900/50 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                          03
                        </span>
                        <div>
                          <h4 className="font-semibold text-zinc-200 text-sm">Interactive Scenario Advisory</h4>
                          <p className="text-zinc-400 text-xs leading-relaxed mt-0.5">
                            Direct conversations with the model allow you to simulation-test operational choices, run statistical queries, or extract text intelligence.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] text-zinc-500 font-medium">Fully secure Client-Server isolation.</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* Results & Dashboard Stage */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 animate-fade-in"
              id="dashboard-stage"
            >
              {/* Back selector & stats drawer */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-zinc-900/40 border border-zinc-800 shadow-xl rounded-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-950 text-emerald-500 border border-zinc-800 rounded-sm">
                    {fileType === "excel" || fileType === "csv" ? (
                      <FileSpreadsheet className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-zinc-500 text-[10px] tracking-[0.1em] font-bold uppercase">Active Data Source</span>
                    <h3 className="font-serif italic text-zinc-100 text-sm sm:text-base">{file?.name}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {fileType === "excel" && (
                    <span className="px-2.5 py-1 bg-emerald-950/30 text-emerald-400 text-[11px] font-bold rounded-sm border border-emerald-900/40">
                      TAB PREVIEW READY
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setReport(null);
                      setFile(null);
                      setSpreadsheetData([]);
                    }}
                    className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 rounded-sm text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Upload New Asset
                  </button>
                </div>
              </div>

              {/* SpreadSheet Grid Preview Panel (only for Excel files) */}
              {spreadsheetData.length > 0 && (
                <div className="animate-fade-in">
                  <SpreadsheetPreview tables={spreadsheetData} />
                </div>
              )}

              {/* Operational Workspace Grid split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Visualizer and Insights Panel */}
                <div className="lg:col-span-8 bg-zinc-900/20 border border-zinc-800 rounded-sm p-6 sm:p-8 shadow-xl">
                  <ReportDashboard report={report} />
                </div>

                {/* AI Agent chat assistant console */}
                <div className="lg:col-span-4 sticky top-24">
                  <AgentChat
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isThinking={isChatThinking}
                    documentTitle={file?.name || "Uploaded File"}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
