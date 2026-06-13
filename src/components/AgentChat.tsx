import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, User, Bot, Sparkles, AlertCircle, ChevronDown, RefreshCw } from "lucide-react";

interface AgentChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isThinking: boolean;
  documentTitle: string;
}

const CHIPS = [
  "Forecast business risks from this data",
  "Simulate a 15% optimization plan",
  "Draft a step-by-step audit action plan",
  "Summarize key parameters and metrics",
];

export default function AgentChat({ messages, onSendMessage, isThinking, documentTitle }: AgentChatProps) {
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const formatMessageContent = (content: string): string => {
    if (!content) return "";
    let clean = content;
    
    // 1. Remove conversational filler introducing interpretations
    clean = clean.replace(/here['’]s a human[- ]friendly interpretation( of what['’]s happening)?:?/gi, "");
    clean = clean.replace(/here is a human[- ]friendly interpretation( of what['’]s happening)?:?/gi, "");
    
    // 2. Remove unnecessary double asterisks completely
    clean = clean.replace(/\*\*/g, "");
    
    // 3. Convert single asterisk bullet points to cleanly formatted standard text or dashes
    clean = clean.replace(/^\s*\*\s+/gm, "- ");

    return clean.trim();
  };

  return (
    <div className="bg-zinc-900/40 rounded-sm overflow-hidden shadow-xl border border-zinc-800 flex flex-col h-[520px]">
      {/* Console Top Title Bar */}
      <div className="px-5 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="font-serif italic text-zinc-100 text-xs sm:text-sm flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-emerald-400" />
              QueryX
            </h3>
            <p className="text-[10px] text-zinc-500 truncate max-w-[200px] font-mono">
              CHAT WITH DATA: <span className="text-emerald-400 font-medium">{documentTitle}</span>
            </p>
          </div>
        </div>
        <span className="text-[9px] font-mono font-bold py-0.5 px-2 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 uppercase rounded-sm">
          Active Session
        </span>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-950/40 scrollbar-none no-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-4">
            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-sm flex items-center justify-center text-emerald-500 animate-bounce">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif italic text-zinc-100 text-sm">QueryX AI Counsel</p>
              <p className="text-zinc-400 text-xs mt-1 max-w-xs mx-auto">
                Ask follow-up questions, run financial forecasts, or request specialized reports based on this dataset.
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 select-text ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                   m.role === "user"
                    ? "bg-emerald-600 text-zinc-950"
                    : "bg-zinc-950 text-emerald-400 border border-zinc-800"
                }`}
              >
                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
 
              {/* Msg Box */}
              <div
                className={`px-4 py-2.5 rounded-sm max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-emerald-950/80 text-zinc-150 border border-emerald-900/50 shadow-md"
                    : "bg-zinc-900 text-zinc-300 border border-zinc-850"
                }`}
              >
                {formatMessageContent(m.content)}
              </div>
            </div>
          ))
        )}
 
        {/* Thinking State */}
        {isThinking && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-sm bg-zinc-950 text-emerald-400 border border-zinc-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            </div>
            <div className="px-4 py-2.5 rounded-sm bg-zinc-900/80 text-zinc-400 border border-zinc-850 text-xs flex items-center gap-2 font-mono text-[11px]">
              <span>QueryX is calculating metrics...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      {messages.length < 8 && (
        <div className="px-5 py-2.5 bg-zinc-950 border-t border-zinc-850">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 font-mono">Suggested Actions</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar flex-wrap sm:flex-nowrap">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                disabled={isThinking}
                onClick={() => onSendMessage(chip)}
                className="text-left text-[10px] whitespace-nowrap px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-350 rounded-sm border border-zinc-800 hover:border-zinc-700 transition-all font-mono font-medium disabled:opacity-50 uppercase tracking-wider"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User Input Drawer block */}
      <form onSubmit={handleSubmit} className="p-4 bg-zinc-950 border-t border-zinc-850 flex gap-2">
        <input
          type="text"
          value={input}
          disabled={isThinking}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI agent (e.g., Forecast risk scenarios)..."
          className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded-sm px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder-zinc-650"
        />
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-950 disabled:text-zinc-600 text-zinc-950 rounded-sm transition-all self-center shadow-md handle-submit-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
