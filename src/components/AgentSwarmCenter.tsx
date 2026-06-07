import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Layers, MessageSquare, Terminal, Play, Cpu, Sparkles, Check, Server, ArrowRight } from "lucide-react";

interface AgentSwarmCenterProps {
  onPlanGenerated: (planText: string) => void;
}

interface SwarmLogLine {
  sender: "router" | "researcher" | "architect" | "compiler" | "system";
  text: string;
  delay: number;
}

export const AgentSwarmCenter: React.FC<AgentSwarmCenterProps> = ({ onPlanGenerated }) => {
  const [swarmGoal, setSwarmGoal] = useState("Build a high-performance vector search engine using pgvector and Express rate-limiters.");
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState<{ sender: string; agentName: string; text: string; color: string }[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  const presets = [
    "Design 3NF DBMS for a multi-tenant SaaS workspace.",
    "Draft multi-agent LangGraph supervisor flow for a customer helper desk.",
    "Formulate an automated webhook worker linking Stripe to Discord notifications."
  ];

  const playBeep = (freq: number, type: OscillatorType = "sine", duration = 0.08) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  };

  const swarmDialogues: SwarmLogLine[] = [
    { sender: "system", text: "Establishing multi-agent socket mesh boundaries... [CONNECT: OK]", delay: 200 },
    { sender: "router", text: "Goal captured. Dismantling research vectors and assigning task-weights to specialists.", delay: 800 },
    { sender: "researcher", text: "Analyzing target indices. Source docs state pgvector is 1536-dim standard. Recommending HNSW index trees over IVFFlat for higher recall rates at high scale.", delay: 1500 },
    { sender: "architect", text: "Drafting schema. table: item_embeddings { id: uuid, embedding: vector(1536), name: varchar(255) }. We should set a Drizzle index for Cosine similarity operations.", delay: 2200 },
    { sender: "compiler", text: "Reviewing code layout. Writing rate-limiter: express-rate-limit configured with MemoryStore. 100 requests per minute ceiling prevents API congestion.", delay: 3000 },
    { sender: "compiler", text: "Drafting Express action endpoint logic. Handling float vector conversions safely to prevent parser exceptions on invalid arrays.", delay: 3800 },
    { sender: "researcher", text: "Performing safety audit. Critical: Ensure CORS settings are fully restricted. Do not expose private DB credentials in the browser.", delay: 4500 },
    { sender: "router", text: "Task finalized. Consolidating all micro-service layouts into single executable pipeline.", delay: 5200 },
    { sender: "system", text: "Swarm completed successfully. Compiling executive summary & exporting parameters.", delay: 5800 }
  ];

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const runSwarmSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    setActiveStep(0);
    playBeep(440, "square", 0.15);

    swarmDialogues.forEach((step, idx) => {
      setTimeout(() => {
        let agentName = "SYSTEM_NODE";
        let color = "text-slate-400";
        
        if (step.sender === "router") {
          agentName = "ROUTERNODE";
          color = "text-cyan-400";
          setActiveStep(1);
          playBeep(523, "sine");
        } else if (step.sender === "researcher") {
          agentName = "RESEARCH_GPM3";
          color = "text-amber-400";
          setActiveStep(2);
          playBeep(587, "sine");
        } else if (step.sender === "architect") {
          agentName = "TECHSCHE_V1";
          color = "text-indigo-400";
          setActiveStep(3);
          playBeep(659, "sine");
        } else if (step.sender === "compiler") {
          agentName = "V_COMPILER";
          color = "text-pink-400";
          setActiveStep(4);
          playBeep(698, "sine");
        } else {
          playBeep(261, "sine");
        }

        setLogs(prev => [...prev, {
          sender: step.sender,
          agentName,
          text: step.text,
          color
        }]);

        if (idx === swarmDialogues.length - 1) {
          setIsRunning(false);
          playBeep(880, "sine", 0.3);
          onPlanGenerated(`### SWARM AGENT EXECUTION RECORD: COGNITIVE SYSTEM
Goal: ${swarmGoal}

1. INDEX METHOD (RESEARCH_GPM3):
   - HNSW index tree requested over IVFFlat for enhanced query retrieval.
   - Vector dimensions locked to 1536 floats.

2. RELATIONAL DATABASE (TECHSCHE_V1):
   - SQL schema initialized matching pgvector structure.
   - High-throughput indexing deployed over system catalog.

3. SECURITY DEPLOYMENT (V_COMPILER):
   - express-rate-limit set with 100req/min buffer.
   - Credentials secured server-side to satisfy constraints.`);
        }
      }, step.delay);
    });
  };

  return (
    <div className="bg-[#0b1022] border border-cyan-500/25 rounded-2xl p-5 shadow-lg relative overflow-hidden" id="agent_swarm_laboratory">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">Agent Swarm Intelligence Laboratory</h3>
            <p className="text-[11px] text-slate-400">Simulate autonomous multi-agent task-forces solving complex full-stack requests.</p>
          </div>
        </div>
        <span className="text-[9px] font-mono px-2 py-0.5 bg-[#1e1b4b] text-purple-400 rounded-md border border-purple-500/20 uppercase">
          Agent-Network: Active
        </span>
      </div>

      {/* Goal input */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-[9.5px] font-mono text-slate-500 uppercase tracking-wider mb-1">Target Laboratory Objective</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={swarmGoal}
              onChange={(e) => setSwarmGoal(e.target.value)}
              disabled={isRunning}
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500/40 font-mono"
              id="swarm_goal_input"
            />
            <button
              onClick={runSwarmSimulation}
              disabled={isRunning || !swarmGoal.trim()}
              className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold font-mono transition-all transform active:scale-95 cursor-pointer ${
                isRunning 
                  ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/30"
              }`}
              id="initiate_swarm_btn"
            >
              <span>RUN</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Preset rows */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p, i) => (
            <button
              key={i}
              disabled={isRunning}
              onClick={() => setSwarmGoal(p)}
              className="text-[10px] font-mono px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              {p.substring(0, 35)}...
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Visual Network Diagram */}
      <div className="grid grid-cols-4 gap-3 bg-slate-950/40 p-3 rounded-xl border border-white/5 mb-4 relative overflow-hidden" id="interactive_swarm_diagram">
        
        {/* Connection line guides */}
        <div className="absolute top-[38px] inset-x-12 h-[2px] bg-white/5 pointer-events-none z-0"></div>

        <div className={`p-2 rounded-lg border text-center z-15 relative ${
          activeStep === 1 ? "bg-cyan-950/40 border-cyan-400/50 text-cyan-300" : "bg-white/[0.02] border-white/5 text-slate-500"
        }`}>
          <div className="font-bold text-[10px] font-mono">ROUTER</div>
          <div className="text-[9px] font-mono text-slate-500 mt-0.5">ROUTERNODE</div>
        </div>

        <div className={`p-2 rounded-lg border text-center z-15 relative ${
          activeStep === 2 ? "bg-amber-950/40 border-amber-400/50 text-amber-300" : "bg-white/[0.02] border-white/5 text-slate-500"
        }`}>
          <div className="font-bold text-[10px] font-mono">RESEARCH</div>
          <div className="text-[9px] font-mono text-slate-500 mt-0.5">RESEARCH_GPM3</div>
        </div>

        <div className={`p-2 rounded-lg border text-center z-15 relative ${
          activeStep === 3 ? "bg-indigo-950/40 border-indigo-400/50 text-indigo-300" : "bg-white/[0.02] border-white/5 text-slate-500"
        }`}>
          <div className="font-bold text-[10px] font-mono">ARCHITECT</div>
          <div className="text-[9px] font-mono text-slate-500 mt-0.5">TECHSCHE_V1</div>
        </div>

        <div className={`p-2 rounded-lg border text-center z-15 relative ${
          activeStep === 4 ? "bg-pink-950/40 border-pink-400/50 text-pink-300" : "bg-white/[0.02] border-white/5 text-slate-500"
        }`}>
          <div className="font-bold text-[10px] font-mono">OPTIMIZER</div>
          <div className="text-[9px] font-mono text-slate-500 mt-0.5">V_COMPILER</div>
        </div>
      </div>

      {/* Terminal Real-Time logs output */}
      <div 
        ref={terminalRef}
        className="bg-slate-950 border border-white/10 rounded-xl p-3 h-44 overflow-y-auto space-y-1.5 font-mono text-xs text-slate-300 scrollbar-thin"
        id="swarm_terminal_logs_window"
      >
        {logs.length === 0 ? (
          <p className="text-slate-600 text-center py-10">[Awaiting swarm laboratory session initialization...]</p>
        ) : (
          logs.map((log, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -5 }} 
              animate={{ opacity: 1, x: 0 }} 
              key={idx} 
              className="flex items-start gap-1.5"
            >
              <span className={`font-bold shrink-0 ${log.color}`}>[{log.agentName}]:</span>
              <span className="leading-snug">{log.text}</span>
            </motion.div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500 font-mono px-1">
        <span>Socket Connection: Secure SSL-V3</span>
        <span>Agents Synchronized: 4 / 4 Online</span>
      </div>
    </div>
  );
};
