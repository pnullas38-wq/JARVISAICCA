import React, { useState, useEffect, useRef } from "react";
import { 
  Send, Sparkles, AlertCircle, FileText, Cpu, Compass, BookOpen, 
  Calendar, Briefcase, Zap, FileJson, Loader2, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage, DocumentItem } from "../types";
import Markdown from "react-markdown";

interface ChatWorkspaceProps {
  documents: DocumentItem[];
  activeMode: "rag" | "tutor" | "planner" | "career" | "project" | "meeting" | "general";
  setActiveMode: (mode: "rag" | "tutor" | "planner" | "career" | "project" | "meeting" | "general") => void;
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  onPlanGenerated?: (planText: string) => void;
  onQuizGenerated?: (quizText: string) => void;
  language?: string;
  memories?: string[];
  onAlarmCreated?: (title: string, seconds?: number, time?: string) => void;
  currentUser?: { name: string; song: string; voicephrase: string };
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  documents,
  activeMode,
  setActiveMode,
  selectedDocId,
  setSelectedDocId,
  onPlanGenerated,
  onQuizGenerated,
  language = "en",
  memories = [],
  onAlarmCreated,
  currentUser
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Set greeting depending on active agent mode
  useEffect(() => {
    let msg = "";
    const name = currentUser?.name || "Agent";
    
    switch (activeMode) {
      case "rag":
        msg = `📖 **Retrieval-Augmented Intelligent Search ready.** Hello Agent **${name}**! Select one of your loaded study documents from the sidebar to start running semantic search and diagnostic queries with the core engine. Ready to assist!`;
        break;
      case "tutor":
        msg = `🎓 **AI Academic Tutor Core online.** Hello Professor **${name}**! Ready to master Data Structures, Operating Systems, Machine Learning, or DBMS. Simply select or drop a study file to generate custom lessons and interactive test evaluations.`;
        break;
      case "planner":
        msg = `📅 **Chrono Task Planner active.** Greetings Agent **${name}**! Tell me what milestone roadmap or study schedule you'd like to construct, and I will instantly compile a visual timeline layout with checklist items to monitor progress.`;
        break;
      case "career":
        msg = `💼 **Elite Career Dashboard synchronized.** Hello Agent **${name}**! Paste job postings or bio text to draft optimized cover letters, run CV analysis, or initiate mock interview evaluation loops.`;
        break;
      case "project":
        msg = `💻 **Project Architecture Core ready.** Welcome Agent **${name}**! State your software architecture concept, and I will generate complete folder layouts, relational database schemas, and structured API directories.`;
        break;
      case "meeting":
        msg = `📝 **Meeting Analyst online.** Hello Agent **${name}**! Send transcript text to compile action plans, decisions, risks, or draft professional follow-up templates ready to copy.`;
        break;
      default:
        msg = `🚀 **Authentication Approved. Core Command Station Synced.** Welcome back, Agent **${name}**! I am your JARVIS X intelligent general companion. Your custom soundtrack is set to **${currentUser?.song || "Ambient Lofi Space Beats"}**. Chat with me about study topics, code errors, or workstation operations!`;
    }

    setMessages([
      {
        id: "g-0",
        sender: "jarvis",
        text: msg,
        timestamp: new Date().toLocaleTimeString(),
        agentMode: activeMode
      }
    ]);
  }, [activeMode, currentUser]);

  // Quick Preset prompts
  const presets: { label: string; prompt: string; mode: typeof activeMode }[] = [
    { label: "Summarize OS notes", prompt: "Please summarize my Operating Systems notes highlights, focus on process block states and deadlocks.", mode: "rag" },
    { label: "Explain Chapter 5 DBMS", prompt: "Explain Chapter 5 Normalization from my DBMS notes, specifically the difference between 3NF and BCNF.", mode: "rag" },
    { label: "LangGraph 15-day Roadmap", prompt: "Create a detailed 15-day study plan to learn LangGraph from scratch, including practice micro-projects.", mode: "planner" },
    { label: "DBMS Normalization Quiz", prompt: "Tutor me on DBMS Normalization rules and then provide a 3-question multiple choice evaluations quiz.", mode: "tutor" },
    { label: "ML Interview Prep", prompt: "I am preparing for an ML Engineer internship. Provide 3 mock technical interview questions and break down key pitfalls.", mode: "career" },
    { label: "E-Commerce System Design", prompt: "Generate the database and folder architecture design plan for an AI-powered e-commerce recommendation system.", mode: "project" }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setErrorStatus(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
      agentMode: activeMode
    };

    setMessages(prev => [...prev, userMsg]);
    setUserInput("");
    setLoading(true);

    // Get referenced document context
    let activeContext = "";
    if (selectedDocId) {
      const doc = documents.find(d => d.id === selectedDocId);
      if (doc) {
        activeContext = `Focused Document title: ${doc.title}\nCategory: ${doc.category}\nContent:\n${doc.content}`;
      }
    } else if (activeMode === "rag" && documents.length > 0) {
      // If RAG mode but no specific file chosen, search or append key parts of all
      activeContext = documents.map(d => `[File: ${d.title}] - ${d.content.slice(0, 1000)}`).join("\n\n");
    }

    try {
      // Map history to server payload
      const historyPayload = messages.map(m => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text
      }));

      const res = await fetch("/api/jarvis/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: activeMode,
          message: textToSend,
          context: activeContext,
          chatHistory: historyPayload,
          language,
          memories,
          currentTime: new Date().toString()
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      
      let finalResponseText = data.text || "Cognitive query completed.";
      
      // Extract alarm if present
      const alarmRegex = /\[ALARM:\s*title="([^"]+)"(?:\s*,\s*(?:seconds=(\d+)|time="([^"]+)"))?\]/i;
      const alarmMatch = finalResponseText.match(alarmRegex);
      if (alarmMatch) {
        const alarmTitle = alarmMatch[1];
        const alarmSecs = alarmMatch[2] ? parseInt(alarmMatch[2], 10) : undefined;
        const alarmTime = alarmMatch[3];
        
        // Remove the raw trigger tag from being displayed
        finalResponseText = finalResponseText.replace(alarmRegex, "").trim();
        
        // Display styled dynamic status badge in message
        const formattedTrigger = alarmSecs !== undefined
          ? `in ${alarmSecs} seconds` 
          : `at ${alarmTime}`;
        finalResponseText += `\n\n⏰ **[SYSTEM COMPANION REMINDER]: Registered automated alert countdown for "${alarmTitle}" (${formattedTrigger})!**`;
        
        if (onAlarmCreated) {
          onAlarmCreated(alarmTitle, alarmSecs, alarmTime);
        }
      }
      
      const jarvisMsg: ChatMessage = {
        id: `msg-${Date.now()}-jarvis`,
        sender: "jarvis",
        text: finalResponseText,
        timestamp: new Date().toLocaleTimeString(),
        agentMode: activeMode
      };

      setMessages(prev => [...prev, jarvisMsg]);

      // If a task planner roadmap was completed, share back to upper state
      if (activeMode === "planner" && onPlanGenerated && data.text) {
        onPlanGenerated(data.text);
      }
      // If a tutor session evaluation occurred, parse quiz
      if (activeMode === "tutor" && onQuizGenerated && data.text) {
        onQuizGenerated(data.text);
      }

    } catch (e: any) {
      setErrorStatus(e.message || "Failed to communicate with Core server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm" id="chat_workspace_container">
      {/* Header bar */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between" id="chat_header">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <div className="p-2 rounded-lg bg-cyan-100/50 text-cyan-600 border border-cyan-200">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-slate-800 tracking-wide text-sm uppercase">ChatGPT AI Assistant</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded">LIVE CHATBOT PORTAL</span>
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">
              Current Mode: <span className="text-cyan-600 capitalize font-bold">{activeMode === 'general' ? 'ChatGPT Chatbot' : activeMode}</span>
            </p>
          </div>
        </div>

        {/* Selected Document Indicator */}
        <div className="flex items-center gap-2">
          {selectedDocId ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-50 border border-cyan-200 rounded-lg text-xs font-mono text-cyan-700">
              <FileText className="w-3.5 h-3.5 animate-pulse text-cyan-500" />
              <span className="max-w-[150px] truncate">
                {documents.find(d => d.id === selectedDocId)?.title}
              </span>
              <button 
                className="hover:text-red-500 ml-1 font-bold text-[10px]" 
                onClick={() => setSelectedDocId(null)}
                title="Disconnect focus file"
                id="disconnect_doc_btn"
              >
                ✕
              </button>
            </div>
          ) : (
            <span className="text-[10px] font-mono text-slate-400">
              [No Focus File Coupled]
            </span>
          )}
        </div>
      </div>

      {/* Mode selectors */}
      <div className="flex items-center gap-1.5 p-2 bg-slate-50/50 overflow-x-auto border-b border-slate-200 scrollbar-none" id="agent_mode_chips">
        {(["general", "rag", "tutor", "planner", "project", "career", "meeting"] as const).map(mode => {
          const isActive = activeMode === mode;
          const label = {
            general: "ChatGPT Chatbot",
            rag: "Doc RAG",
            tutor: "Tutor Mode",
            planner: "Roadmap Plan",
            project: "Architect",
            career: "Career Coach",
            meeting: "Meeting Summary"
          }[mode];
          
          return (
            <button
              key={mode}
              onClick={() => {
                setActiveMode(mode);
                if (mode !== "rag") setSelectedDocId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all duration-300 uppercase shrink-0 ${
                isActive 
                  ? "bg-cyan-550/10 bg-cyan-50 text-cyan-700 border border-cyan-300 font-bold shadow-xs" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent"
              }`}
              id={`agent_mode_${mode}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 opacity-60"></span>
              {label}
            </button>
          );
        })}
      </div>

      {/* Quick Presets */}
      <div className="px-4 py-2.5 bg-slate-50/30 border-b border-slate-100 flex flex-wrap items-center gap-2" id="quick_presets_row">
        <span className="text-[10px] font-mono text-slate-450 uppercase tracking-widest mr-1">Suggested doubts & topics:</span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveMode(p.mode);
              // Locate matching OS/DBMS document context if possible
              if (p.mode === "rag") {
                if (p.label.includes("OS")) setSelectedDocId("doc-os");
                else if (p.label.includes("DBMS")) setSelectedDocId("doc-dbms");
              }
              handleSendMessage(p.prompt);
            }}
            className="text-[10.5px] font-mono px-2 py-1 bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 rounded-md text-slate-600 hover:text-cyan-700 transition-all cursor-pointer shadow-xs"
            id={`preset_prompt_${idx}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/20 scrollbar-thin" id="style_scroll_chat">
        {messages.map((msg, index) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
            }`}
            id={`chat_bubble_${index}`}
          >
            {/* Sender and Time */}
            <div className={`flex items-center gap-1.5 text-[9.5px] font-mono text-slate-400 mb-1 ${
              msg.sender === "user" ? "flex-row-reverse" : ""
            }`}>
              <span className={`font-semibold uppercase tracking-wider ${
                msg.sender === "user" ? "text-slate-600" : "text-cyan-600"
              }`}>
                {msg.sender === "user" ? "YOU" : `${msg.agentMode === 'general' ? 'CHATGPT' : msg.agentMode.toUpperCase()} BOT`}
              </span>
              <span className="opacity-60 text-slate-300">•</span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Content box */}
            <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed border font-sans ${
              msg.sender === "user"
                ? "bg-slate-100 border-slate-200 text-slate-800 rounded-tr-none shadow-xs"
                : "bg-white border-slate-200 text-slate-800 rounded-tl-none shadow-xs relative"
            }`}>
              {/* Markdown support added here */}
              <div className="markdown-body prose prose-slate max-w-none text-slate-800 text-xs leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:text-xs [&_h3]:font-bold [&_pre]:bg-slate-50 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-slate-200 [&_pre]:font-mono [&_pre]:text-2xs [&_pre]:overflow-x-auto [&_code]:bg-slate-100 [&_code]:text-cyan-700 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-2xs select-text">
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-start max-w-[80%] space-y-1.5"
            id="chat_loader_block"
          >
            <div className="flex items-center gap-1 text-[9.5px] font-mono text-cyan-600">
              <span className="font-semibold uppercase tracking-wider animate-pulse">ChatGPT is thinking</span>
              <span className="animate-ping">•</span>
            </div>
            <div className="rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
              <span className="font-mono text-xs text-slate-500">Formulating a helpful detailed summary...</span>
            </div>
          </motion.div>
        )}

        {errorStatus && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-mono flex items-center gap-2" id="chat_error_box">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>ERROR: {errorStatus}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2" id="chat_control_panel">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(userInput);
          }}
          className="flex gap-2.5"
          id="chat_form"
        >
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={loading}
            placeholder={
              activeMode === "rag" 
                ? "Ask anything about the referenced document..." 
                : activeMode === "tutor"
                ? "Ask technical questions or request an evaluation quiz..."
                : "Ask anything about doubts, coding, computers or general topics..."
            }
            className="flex-1 bg-white border border-slate-200 focus:border-cyan-400 rounded-xl px-4 py-3.5 text-[13.5px] font-sans text-slate-800 placeholder-slate-400 focus:outline-hidden transition-all duration-300 focus:shadow-[0_0_8px_rgba(6,182,212,0.1)]"
            id="chat_text_input"
          />
          <button
            type="submit"
            disabled={loading || !userInput.trim()}
            className={`px-5 py-3.5 rounded-xl border flex items-center gap-2 font-mono text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer ${
              userInput.trim()
                ? "bg-cyan-500 hover:bg-cyan-650/90 text-white border-cyan-500 hover:border-cyan-600 shadow-sm"
                : "bg-slate-100 border-slate-200 text-slate-400"
            }`}
            id="submit_chat_btn"
          >
            <span>SEND</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1" id="telemetry_footer">
          <div className="flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SECURE WEB CLIENT SYNCED</span>
          </div>
          <span>UTC CURRENT: {new Date().toISOString().replace("T", " ").substring(0, 19)}</span>
        </div>
      </div>
    </div>
  );
};
