import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, Cpu, CheckSquare, Plus, Trash2, Calendar, 
  BarChart2, BookOpen, Clock, Activity, AlertCircle, Sparkles, 
  Settings, User, ChevronRight, FileUp, ListTodo, Copy, Check, 
  Users, Layers, Award, Play, Volume2, Search, Crosshair, Loader2,
  Languages, Video, Mic, Send, Share2, LogOut, RefreshCcw, FileCode,
  Terminal, Sliders, Eye, Trash, Power, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { initialDocuments, initialTasks, initialRecommendations, initialMeetings, initialStudyLogs } from "./mockData";
import { DocumentItem, TaskItem, MeetingItem, StudySessionLog, RecItem, AlarmItem } from "./types";
import { ChatWorkspace } from "./components/ChatWorkspace";

// Futuristic custom additions
import { Language, translationMap } from "./components/LanguageHelper";
import { BiometricLockScreen } from "./components/BiometricLockScreen";
import { AgentSwarmCenter } from "./components/AgentSwarmCenter";
import { SystemControlTerminal } from "./components/SystemControlTerminal";
import { RobotAgentFace } from "./components/RobotAgentFace";
import { Fullscreen3DRobot } from "./components/Fullscreen3DRobot";

export default function App() {
  // Localization state
  const [activeLanguage, setActiveLanguage] = useState<Language>("en");
  const strings = translationMap[activeLanguage];

  // Dynamic registered user profiles database matching
  const [registeredUsers, setRegisteredUsers] = useState<{name: string, song: string, voicephrase: string}[]>(() => {
    const saved = localStorage.getItem("jarvis_registered_users");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { name: "Ullas", song: "Ambient Lofi Space Beats", voicephrase: "Cognitive access code Ullas Zero Seven" }
    ];
  });

  const [currentUser, setCurrentUser] = useState<{name: string, song: string, voicephrase: string}>(() => {
    const saved = localStorage.getItem("jarvis_current_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return { name: "Ullas", song: "Ambient Lofi Space Beats", voicephrase: "Cognitive access code Ullas Zero Seven" };
  });

  // Lifted automation state machines
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [whatsappText, setWhatsappText] = useState("Hello Ullas! JARVIS X core systems are fully online and synced.");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<string[]>(["SYSTEM: Automation control terminal open.", "Ready for command dispatch..."]);

  // System Lock State (starts locked to trigger biometric auto-entry scan sequence)
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isFullScreenRobot, setIsFullScreenRobot] = useState(false);

  // Simulated power states
  const [powerState, setPowerState] = useState<"on" | "shutdown" | "restart">("on");
  const [isRestartingLog, setIsRestartingLog] = useState<string[]>([]);

  // Application database states
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [meetings, setMeetings] = useState<MeetingItem[]>(initialMeetings);
  const [studyLogs, setStudyLogs] = useState<StudySessionLog[]>(initialStudyLogs);
  const [recommendations, setRecommendations] = useState<RecItem[]>(initialRecommendations);

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<"chat" | "terminal" | "roundtable" | "sandbox" | "biometrics">("chat");
  const [activeAgentMode, setActiveAgentMode] = useState<"general" | "rag" | "tutor" | "planner" | "career" | "project" | "meeting">("general");
  
  // Component parameters
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Document Dialog
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [newDocCategory, setNewDocCategory] = useState<DocumentItem["category"]>("pdf");

  // Add Task parameters
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<TaskItem["category"]>("study");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem["priority"]>("medium");

  // Custom user memory state drawer
  const [memories, setMemories] = useState<string[]>([
    "User profile: Agent Ullas (ullaspn402@gmail.com)",
    "Target: Computer Science research / Machine Learning Specialist",
    "Preloaded Frameworks: React, LangGraph, pgvector, Node"
  ]);
  const [newMemory, setNewMemory] = useState("");

  // ==========================================
  // AUTONOMOUS ALARM & SCHEDULER REMINDER STATE
  // ==========================================
  const [ringingAlarm, setRingingAlarm] = useState<AlarmItem | null>(null);
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    try {
      const saved = localStorage.getItem("jarvis_alarms");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // manual alarm creation form parameters
  const [manualAlarmTitle, setManualAlarmTitle] = useState("");
  const [manualAlarmTimeValue, setManualAlarmTimeValue] = useState(""); // e.g. "10:30" or "45"

  const getCountdownText = (triggerTime: number) => {
    const diff = triggerTime - Date.now();
    if (diff <= 0) return "Triggering...";
    const totalSeconds = Math.floor(diff / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) {
      return `in ${minutes}m ${seconds.toString().padStart(2, "0")}s`;
    }
    return `in ${seconds}s`;
  };

  useEffect(() => {
    localStorage.setItem("jarvis_alarms", JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      let triggeredAny = false;
      
      setAlarms(prev => {
        let changed = false;
        const updated = prev.map(alarm => {
          if (alarm.active && !alarm.triggered && now >= alarm.triggerTime) {
            triggeredAny = true;
            changed = true;
            setRingingAlarm(alarm);
            
            // Speak the alarm title out loud
            try {
              if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const speech = new SpeechSynthesisUtterance(`Attention Agent. Your scheduled workstation alert for: ${alarm.title}, is now ringing.`);
                speech.rate = 1.0;
                window.speechSynthesis.speak(speech);
              }
            } catch (e) {
              // Ignore blocked audio contexts
            }

            return { ...alarm, triggered: true, active: false };
          }
          return alarm;
        });
        return changed ? updated : prev;
      });

      if (triggeredAny) {
        let count = 0;
        const beepTimer = setInterval(() => {
          playSirenBeep(1200, "sawtooth");
          count++;
          if (count >= 5) clearInterval(beepTimer);
        }, 200);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const registerAlarm = (title: string, seconds?: number, time?: string) => {
    let targetTime = 0;
    let computedTimeString = "";

    if (seconds !== undefined) {
      targetTime = Date.now() + seconds * 1000;
      computedTimeString = `${seconds}s timer`;
    } else if (time) {
      computedTimeString = time;
      const [hours, minutes] = time.split(":").map(Number);
      const now = new Date();
      const trigger = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
      if (trigger.getTime() <= now.getTime()) {
        trigger.setDate(trigger.getDate() + 1);
      }
      targetTime = trigger.getTime();
    } else {
      return;
    }

    const newAlarm: AlarmItem = {
      id: `alarm-${Date.now()}`,
      title: title || "Scheduled Task Alert",
      timeString: computedTimeString,
      triggerTime: targetTime,
      active: true,
      triggered: false,
      createdAt: new Date().toLocaleTimeString()
    };

    setAlarms(prev => [newAlarm, ...prev]);
    showNotification(`⏰ Registered: "${newAlarm.title}"!`);
    playSirenBeep(988, "sine");
  };

  const handleSnoozeAlarm = (id: string) => {
    setAlarms(prev => prev.map(alarm => {
      if (alarm.id === id) {
        return {
          ...alarm,
          triggered: false,
          active: true,
          triggerTime: Date.now() + 5 * 60 * 1000, // 5 minutes snooze
          timeString: "Snoozed 5m"
        };
      }
      return alarm;
    }));
    setRingingAlarm(null);
    showNotification("Alarm snoozed for 5 minutes.");
    playSirenBeep(700, "sine");
  };

  const handleDismissAlarm = (id: string) => {
    setAlarms(prev => prev.map(alarm => {
      if (alarm.id === id) {
        return { ...alarm, active: false };
      }
      return alarm;
    }));
    setRingingAlarm(null);
    showNotification("Alarm dismissed.");
    playSirenBeep(500, "triangle");
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
    playSirenBeep(400, "sawtooth");
  };

  // Extracted plan/quiz evaluation slots
  const [extractedPlan, setExtractedPlan] = useState<string | null>(null);
  const [activeTutorQuiz, setActiveTutorQuiz] = useState<{
    question: string;
    options: string[];
    correctIndex: number;
    userAnswerIndex: number | null;
    submitted: boolean;
  } | null>(null);

  // Code Sandbox playground state
  const [sandboxCode, setSandboxCode] = useState<string>(
    `// JARVIS X Sandbox compiler v1.1\nfunction evaluateWorkspaceStatus() {\n  const cores = ["Semantic", "RAG", "Swarm", "Automation"];\n  console.log("Analyzing local cluster nodes...");\n  return "WORKSPACE STATUS: NOMINAL";\n}\nevaluateWorkspaceStatus();`
  );
  const [sandboxOutput, setSandboxOutput] = useState<string>("// Console idle. Press execution to evaluate system script.");
  const [isCompilingSandbox, setIsCompilingSandbox] = useState(false);

  // Interactive logs/toasts feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Voice command matching engine
  const handleVoiceCommandTriggered = (command: string) => {
    const cmd = command.toLowerCase();
    setConsoleLogs(prev => [...prev, `[VOICE COMMAND]: "${command}"`]);
    showNotification(`Command recognized: "${command}"`);

    if (cmd.includes("play") || cmd.includes("song") || cmd.includes("youtube") || cmd.includes("music") || cmd.includes("lofi")) {
      // Clean command noise keywords to isolate song title
      const targetSong = command
        .replace(/play/i, "")
        .replace(/song/i, "")
        .replace(/youtube/i, "")
        .replace(/music/i, "")
        .replace(/lofi/i, "")
        .trim();

      const songName = targetSong || currentUser.song;

      setConsoleLogs(prev => [
        ...prev, 
        `VOICE SUCCESS: Detected active song parameter "${songName}". Instantiating automated YouTube launch sequence...`
      ]);

      // Save user state dynamically
      setCurrentUser(prev => ({ ...prev, song: songName }));

      // Core automation: Trigger real wa.me and youtube tab redirection
      const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songName)}`;
      window.open(ytUrl, "_blank");

      setShowYoutubeModal(true);
      playSirenBeep(880, "sine");
    } else if (cmd.includes("whatsapp") || cmd.includes("message") || cmd.includes("send")) {
      setConsoleLogs(prev => [...prev, "VOICE SUCCESS: Preparing WhatsApp template dispatch..."]);
      setWhatsappText("Hello Ullas! JARVIS X voice command automation triggered successfully.");
      setShowWhatsappModal(true);
      playSirenBeep(600, "sine");
    } else if (cmd.includes("shutdown") || cmd.includes("turn off")) {
      setConsoleLogs(prev => [...prev, "VOICE SUCCESS: Initiating shutdown protocol..."]);
      playSirenBeep(300, "sawtooth");
      setTimeout(() => {
        setPowerState("shutdown");
      }, 1000);
    } else if (cmd.includes("restart") || cmd.includes("reboot") || cmd.includes("restart laptop")) {
      setConsoleLogs(prev => [...prev, "VOICE SUCCESS: Initiating warm cache restart kernel..."]);
      playSirenBeep(500, "triangle");
      setTimeout(() => {
        setPowerState("restart");
      }, 1000);
    } else {
      setConsoleLogs(prev => [...prev, `VOICE LOG: Direct query -> "${command}"`]);
    }
  };

  const triggerRealWhatsAppRedirect = () => {
    const waUrl = `https://wa.me/${whatsappPhone ? whatsappPhone.replace(/\D/g, '') : ""}?text=${encodeURIComponent(whatsappText)}`;
    window.open(waUrl, "_blank");
    setConsoleLogs(prev => [...prev, `SUCCESS: Dispatched packet containing Wa.me redirects.`]);
    setShowWhatsappModal(false);
  };

  // Handle reboot sequencers
  useEffect(() => {
    if (powerState === "restart") {
      setIsRestartingLog([
        "INITIATING WARM OS REBOOT SEQUENCE...",
        "RETRIEVING MEMORY REFS... [OK]",
        "RE-INDEXING SEMANTIC KNOWLEDGE FILES... [OK]",
        "MOUNTING COGNITIVE SWARM DEBATE CHANNELS... [OK]",
        "ALL SYSTEMS INTEGRATED. BOOTING COCKPIT TERMINAL."
      ]);
      const timer = setTimeout(() => {
        setPowerState("on");
        setIsUnlocked(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [powerState]);

  // Audio trigger feedback beep
  const playSirenBeep = (freq = 600, type: OscillatorType = "sine") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.type = type;
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      // Ignored
    }
  };

  // Toast feedback drawer
  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Add customized memory
  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim()) return;
    setMemories(prev => [...prev, newMemory.trim()]);
    setNewMemory("");
    playSirenBeep(900, "sine");
    showNotification("New user preference recorded to memory.");
  };

  // Ingest custom resource
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocContent.trim()) return;

    const added: DocumentItem = {
      id: `doc-custom-${Date.now()}`,
      title: newDocTitle,
      category: newDocCategory,
      content: newDocContent,
      uploadedAt: new Date().toISOString().split("T")[0],
      size: `${Math.ceil(newDocContent.length / 100)} KB`,
      readTime: `${Math.ceil(newDocContent.split(/\s+/).length / 150)} min read`
    };

    setDocuments(prev => [added, ...prev]);
    setNewDocTitle("");
    setNewDocContent("");
    setIsAddDocOpen(false);
    playSirenBeep(900, "sine");
    showNotification(`Successfully ingested context file: "${added.title}"`);
  };

  // Add customized study milestone
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const added: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      completed: false,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split("T")[0],
      category: newTaskCategory,
      priority: newTaskPriority
    };

    setTasks(prev => [added, ...prev]);
    setNewTaskTitle("");
    playSirenBeep(750, "triangle");
    showNotification(`New active milestone registered.`);
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    playSirenBeep(1100, "sine");
  };

  const handleDocDelete = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (selectedDocId === id) setSelectedDocId(null);
    playSirenBeep(450, "sawtooth");
  };

  // Handle study plan roadmaps or tutor evaluation quizzes
  const handleOnPlanGenerated = (planText: string) => {
    setExtractedPlan(planText);
  };

  const handleOnQuizGenerated = (tutorText: string) => {
    setActiveTutorQuiz({
      question: "Which of the following database normal structures allows bypassing insertion anomalies for transitive dependency pathways?",
      options: [
        "First Normal Form (1NF) mapping primary arrays and composite objects.",
        "Boyce-Codd Normal Form (BCNF) ensuring non-trivial dependencies start from superkeys.",
        "Third Normal Form (3NF) eliminating transitive pathways natively.",
        "Second Normal Form (2NF) which targets partial dependencies solely."
      ],
      correctIndex: 2,
      userAnswerIndex: null,
      submitted: false
    });
  };

  // Sandbox compiler execution simulation
  const handleRunSandbox = () => {
    setIsCompilingSandbox(true);
    playSirenBeep(880, "sine");
    setSandboxOutput("// Allocating CPU registers... Running local JavaScript sandbox...");

    setTimeout(() => {
      setIsCompilingSandbox(false);
      setSandboxOutput(`[STDOUT - COGNITIVE WORKSPACE COMPILER v1.9]
Executing evaluable clusters...
Evaluating evaluateWorkspaceStatus()...

[HARDWARE ALLOCATION]:
CPU Nodes Bound  : 4 Active Threads
RAM heap bound   : 12.4 MB
Return exit key  : 0 (Execution successful)

RESULT OUTPUT    : "WORKSPACE STATUS: NOMINAL"`);
      showNotification("Script evaluated successfully in sandboxed stack.");
    }, 1500);
  };

  const activeLanguageStrings = strings;

  // Filter content
  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Quantitative telemetry values
  const totalHours = studyLogs.reduce((acc, curr) => acc + curr.hours, 0);
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const hqiAverage = (studyLogs.reduce((acc, curr) => acc + curr.focusScore, 0) / studyLogs.length).toFixed(1);

  // Biometric onboarding screen router
  if (!isUnlocked) {
    return (
      <BiometricLockScreen 
        registeredUsers={registeredUsers}
        onRegisterUser={(newUser) => {
          setRegisteredUsers(prev => {
            const exists = prev.some(u => u.name.toLowerCase() === newUser.name.toLowerCase());
            let updated;
            if (exists) {
              updated = prev.map(u => u.name.toLowerCase() === newUser.name.toLowerCase() ? { ...u, ...newUser } : u);
            } else {
              updated = [...prev, newUser];
            }
            localStorage.setItem("jarvis_registered_users", JSON.stringify(updated));
            return updated;
          });
        }}
        onUnlock={(user) => {
          setCurrentUser(user);
          localStorage.setItem("jarvis_current_user", JSON.stringify(user));
          setIsUnlocked(true);

          // Pop open the YouTube Music Cockpit with automated playlist triggering!
          setConsoleLogs(prev => [
            ...prev,
            `[BIOMETRICS SUCCESS]: Biometrics scanned for Agent ${user.name}.`,
            `[AUTO AUTOMATION WORKFLOW]: Playback instruction detected -> Open song: "${user.song}".`
          ]);

          // Automatically launch media player
          setShowYoutubeModal(true);

          // Add a custom memory indicating session registration
          setMemories(prev => {
            const base = prev.filter(m => !m.startsWith("Active profile:") && !m.startsWith("User profile:"));
            return [
              ...base,
              `User profile: Agent ${user.name} (${user.name.toLowerCase()}@jarvis.local)`,
              `Active profile: Loaded theme song parameter matching to "${user.song}"`
            ];
          });

          // Play quick chirp
          playSirenBeep(980, "sine");
        }}
      />
    );
  }

  // Simulated PC shutdown state
  if (powerState === "shutdown") {
    return (
      <div className="fixed inset-0 bg-[#02050e] flex flex-col items-center justify-center p-6 z-100 font-mono text-center relative overflow-hidden animate-fade-in" id="shutdown_overlay">
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #ef4444 1px, transparent 1px),
              linear-gradient(to bottom, #ef4444 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px"
          }}
        ></div>

        <div className="max-w-md w-full bg-red-950/20 border border-red-500/20 p-8 rounded-3xl backdrop-blur-xl shadow-[0_0_35px_rgba(239,68,68,0.15)] flex flex-col justify-center text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Power className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-lg font-bold text-red-400 tracking-widest uppercase mb-2">SYSTEM SHUTDOWN OVERRIDE</h2>
          <p className="text-xs text-slate-400 leading-normal mb-8 uppercase tracking-wider font-sans">
            JARVIS X-OS registers have been uncoupled. The analytical cockpit is offline.
          </p>

          <button
            onClick={() => {
              setPowerState("on");
              setIsUnlocked(true);
              playSirenBeep(1200, "sine");
            }}
            className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:shadow-[0_0_20px_#ef4444] text-white rounded-2xl text-xs font-bold font-mono transition-all duration-300 transform active:scale-95 cursor-pointer flex items-center gap-2.5 justify-center mx-auto"
            id="boot_os_btn"
          >
            <Cpu className="w-4 h-4" />
            <span>BOOT SECURE RUNTIME COMPONENT</span>
          </button>
        </div>
      </div>
    );
  }

  // Simulated PC reboot logs screen
  if (powerState === "restart") {
    return (
      <div className="fixed inset-0 bg-[#02050e] flex flex-col items-center justify-center p-6 z-100 font-mono text-cyan-400" id="restart_overlay">
        <div className="max-w-lg w-full bg-slate-950/80 border border-cyan-500/20 p-6 rounded-2xl relative shadow-2xl">
          <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3 mb-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-bold text-xs uppercase tracking-wider">SYSTEM RESTORE MANAGER</span>
          </div>

          <div className="space-y-2 text-[11px] leading-relaxed">
            {isRestartingLog.map((log, idx) => (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.4 }}
                key={idx}
                className="font-mono text-cyan-400"
              >
                &gt;&gt; {log}
              </motion.p>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 text-center animate-pulse mt-8 pb-1">
            Re-initializing active workspace modules • Please wait while logs compile
          </p>
        </div>
      </div>
    );
  }

  if (isFullScreenRobot) {
    return (
      <Fullscreen3DRobot 
        language={activeLanguage}
        onCommandTriggered={handleVoiceCommandTriggered}
        userName={currentUser.name}
        onClose={() => {
          setIsFullScreenRobot(false);
          playSirenBeep(600, "sine");
        }}
        currentUser={currentUser}
        registeredUsers={registeredUsers}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans relative overflow-x-hidden antialiased selection:bg-cyan-500/10 selection:text-cyan-800 cyber-grid transition-colors duration-300">
      
      {/* Decorative blurred backdrops suitable for a clean website header */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-blue-500/5 blur-[130px]"></div>
        <div className="absolute top-[35%] right-[-5%] w-[35%] h-[50%] rounded-full bg-indigo-500/5 blur-[110px]"></div>
        <div className="absolute bottom-[-10%] left-[25%] w-[55%] h-[35%] rounded-full bg-cyan-400/5 blur-[140px]"></div>
      </div>

      {/* Website Top-Level Navigation Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs" id="website_navigation_header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 via-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm relative group">
            <span className="font-extrabold text-white font-mono text-lg tracking-tighter">X</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <h1 className="text-md font-black font-display text-slate-900 uppercase tracking-widest leading-none">JARVIS X</h1>
            </div>
            <p className="text-[10.5px] text-slate-505 font-mono text-slate-500 mt-1 leading-none">
              Advanced Cognitive Workspace & ChatGPT Portal
            </p>
          </div>
        </div>

        {/* Website Tabs Navigation Row */}
        <nav className="flex items-center flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-250/50" id="website_tabs_navbar">
          <button
            onClick={() => { setActiveTab("chat"); playSirenBeep(700, "sine"); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "chat" 
                ? "bg-white text-slate-900 shadow-xs border border-slate-200" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
            id="tab_trigger_chat"
          >
            ChatGPT & Files
          </button>
          
          <button
            onClick={() => { setActiveTab("terminal"); playSirenBeep(700, "sine"); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "terminal" 
                ? "bg-white text-slate-900 shadow-xs border border-slate-200" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
            id="tab_trigger_terminal"
          >
            Voice Automator
          </button>

          <button
            onClick={() => { setActiveTab("roundtable"); playSirenBeep(700, "sine"); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "roundtable" 
                ? "bg-white text-slate-900 shadow-xs border border-slate-200" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
            id="tab_trigger_roundtable"
          >
            Swarm Debates
          </button>

          <button
            onClick={() => { setActiveTab("sandbox"); playSirenBeep(700, "sine"); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "sandbox" 
                ? "bg-white text-slate-900 shadow-xs border border-slate-200" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
            id="tab_trigger_sandbox"
          >
            JS Compiler
          </button>

          <button
            onClick={() => { setActiveTab("biometrics"); playSirenBeep(700, "sine"); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "biometrics" 
                ? "bg-white text-slate-900 shadow-xs border border-slate-200" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
            id="tab_trigger_biometrics"
          >
            System Info
          </button>
        </nav>

        {/* Top Header Actions (Language, 3D Core, Active User profile) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Profile ID tag */}
          <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-mono text-slate-600 font-bold uppercase">{currentUser.name} (ullaspn402@gmail.com)</span>
          </div>

          <button
            onClick={() => {
              setIsFullScreenRobot(true);
              playSirenBeep(920, "triangle");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 border border-cyan-200 text-cyan-700 hover:bg-cyan-100 font-bold font-mono text-[10.5px] uppercase rounded-lg cursor-pointer transition-all active:scale-95 text-center shadow-2xs"
            id="full_3d_robot_toggle"
            title="Launch Fullscreen 3D Conversational Robot"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
            <span>🤖 OPEN 3D ROBOT</span>
          </button>

          {/* Localization selective input row */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(["en", "es", "fr", "hi", "kn", "ja"] as Language[]).map(langCode => (
              <button
                key={langCode}
                onClick={() => {
                  setActiveLanguage(langCode);
                  playSirenBeep(850, "sine");
                }}
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md uppercase transition-all cursor-pointer ${
                  activeLanguage === langCode 
                    ? "bg-white text-slate-800 shadow-2xs border border-slate-200" 
                    : "text-slate-400 hover:bg-slate-200/50 hover:text-slate-700"
                }`}
                id={`lang_chip_${langCode}`}
              >
                {langCode}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setIsUnlocked(false);
              playSirenBeep(400, "sawtooth");
            }}
            className="p-1 px-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer rounded-lg border border-slate-200"
            title="Sign Out / Lock Client Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER: grid cockpit */}
      <main className="flex-1 min-w-0 flex flex-col p-6 z-10 relative">

        {/* Global Feedback Toast alerts */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="px-4 py-3 bg-cyan-950/90 border border-cyan-400/40 rounded-xl text-cyan-200 text-xs font-mono font-bold flex items-center gap-2 shadow-xl shadow-cyan-950/40 mb-4 self-start"
              id="global_feedback_toast"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DYNAMIC TAB INTERFACES */}
        <div className="flex-1 flex flex-col justify-stretch">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: INTUITIVE RAG & GENERAL CHAT ENVIRONMENT */}
            {activeTab === "chat" && (
              <motion.div 
                key="chat-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
                id="main_grid_layer"
              >
                
                {/* COLUMN 1: Knowledge Context files (3 columns) */}
                <div className="lg:col-span-3 flex flex-col gap-5">
                  <section className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col h-full shadow-xs" id="knowledge_core_panel">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-cyan-600" />
                        <h2 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-500">{activeLanguageStrings.knowledgeCore}</h2>
                      </div>
                      <button
                        onClick={() => {
                          setIsAddDocOpen(true);
                          playSirenBeep(900, "triangle");
                        }}
                        className="text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-1 rounded-md hover:bg-cyan-100 cursor-pointer active:scale-95 transition-all shadow-2xs"
                        id="add_source_modal_btn"
                      >
                        {activeLanguageStrings.addDoc}
                      </button>
                    </div>

                    {/* Filter query element */}
                    <div className="relative mb-3">
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder={activeLanguageStrings.filterFiles}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-cyan-400 font-mono"
                        id="search_documents_input"
                      />
                    </div>

                    {/* Files List ledger */}
                    <div className="flex-1 overflow-y-auto space-y-2 style_scrollbar pr-1 max-h-[350px]" id="documents_list_box">
                      {filteredDocs.map(doc => {
                        const isChosen = selectedDocId === doc.id;
                        return (
                          <div
                            key={doc.id}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 relative group ${
                              isChosen 
                                ? "bg-cyan-50 border-cyan-200 shadow-xs text-slate-800" 
                                : "bg-slate-50/50 border-slate-200 hover:border-slate-350 hover:bg-slate-100/50"
                            }`}
                            onClick={() => {
                              setSelectedDocId(isChosen ? null : doc.id);
                              playSirenBeep(800, "sine");
                            }}
                            id={`doc_card_${doc.id}`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className={`text-xs font-bold truncate pr-4 ${isChosen ? 'text-cyan-850' : 'text-slate-800'}`}>{doc.title}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDocDelete(doc.id);
                                }}
                                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                title="Purge source index"
                                id={`delete_doc_${doc.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            <p className="text-[10.5px] text-slate-500 line-clamp-2 leading-relaxed font-sans">{doc.content}</p>
                            
                            <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/50 text-[9px] font-mono text-slate-400 uppercase">
                              <span className="font-bold text-slate-500">{doc.category}</span>
                              <span>{doc.readTime}</span>
                            </div>
                          </div>
                        );
                      })}

                      {filteredDocs.length === 0 && (
                        <p className="text-center text-[11px] text-slate-400 font-mono py-8">identity scanner: no files index</p>
                      )}
                    </div>
                  </section>
                </div>

                {/* COLUMN 2: Chat Workspace (5 columns) */}
                <div className="lg:col-span-5 flex flex-col gap-5">
                  <div className="flex-1 min-h-[500px]">
                    <ChatWorkspace 
                      documents={documents}
                      activeMode={activeAgentMode}
                      setActiveMode={setActiveAgentMode}
                      selectedDocId={selectedDocId}
                      setSelectedDocId={setSelectedDocId}
                      onPlanGenerated={handleOnPlanGenerated}
                      onQuizGenerated={handleOnQuizGenerated}
                      language={activeLanguage}
                      memories={memories}
                      onAlarmCreated={registerAlarm}
                      currentUser={currentUser}
                    />
                  </div>
                </div>

                {/* COLUMN 3: Cockpit parameters widget panel (4 columns) */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                  {/* HIGH-FIDELITY ROBOTIC VISUAL FACE */}
                  <RobotAgentFace 
                    language={activeLanguage}
                    onCommandTriggered={handleVoiceCommandTriggered}
                    userName={currentUser.name}
                    isUnlocked={isUnlocked}
                  />

                  {/* ACTIVE QUIZ PORTLET */}
                  <AnimatePresence mode="wait">
                    {activeTutorQuiz && (
                      <motion.section 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
                        id="cognitive_quiz_widget"
                      >
                        <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100">
                          <h4 className="text-xs font-bold font-mono text-cyan-600 uppercase tracking-widest">Active Evaluation Quiz</h4>
                          <button 
                            onClick={() => setActiveTutorQuiz(null)}
                            className="text-[10px] font-mono text-slate-400 hover:text-slate-600 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 font-bold leading-relaxed mb-3">{activeTutorQuiz.question}</p>
                        <div className="space-y-1.5">
                          {activeTutorQuiz.options.map((opt, idx) => (
                            <button
                              key={idx}
                              disabled={activeTutorQuiz.submitted}
                              onClick={() => {
                                  setActiveTutorQuiz(prev => prev ? { ...prev, userAnswerIndex: idx } : null);
                                playSirenBeep(700, "sine");
                              }}
                              className={`w-full text-left p-2.5 rounded-lg border text-[11px] transition-all cursor-pointer ${
                                activeTutorQuiz.userAnswerIndex === idx
                                  ? "bg-cyan-50 border-cyan-200 text-cyan-700 font-bold"
                                  : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100/60"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3.5 flex items-center justify-between">
                          {!activeTutorQuiz.submitted ? (
                            <button
                              disabled={activeTutorQuiz.userAnswerIndex === null}
                              onClick={() => {
                                  setActiveTutorQuiz(prev => prev ? { ...prev, submitted: true } : null);
                                playSirenBeep(1000, "sine");
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black ${
                                activeTutorQuiz.userAnswerIndex !== null
                                  ? "bg-cyan-500 hover:bg-cyan-650/90 text-white cursor-pointer shadow-xs"
                                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                              }`}
                            >
                              SUBMIT EVALUATION ANSWER
                            </button>
                          ) : (
                            <div className="text-[10px] font-mono">
                              {activeTutorQuiz.userAnswerIndex === activeTutorQuiz.correctIndex ? (
                                <span className="text-emerald-600 font-bold">✓ CORRECT ANSWER MATCHED</span>
                              ) : (
                                <span className="text-red-600 font-bold">✗ INCORRECT OPTION. RETRY AGAIN</span>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.section>
                    )}
                  </AnimatePresence>

                  {/* ACTIVE STUDY ROADMAP */}
                  <AnimatePresence mode="wait">
                    {extractedPlan && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="bg-white border border-pink-200 rounded-2xl p-4 font-mono text-xs shadow-xs"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-pink-600 uppercase font-black text-[10px] tracking-widest flex items-center gap-1">
                            <Sliders className="w-3.5 h-3.5" /> Syllabus Study Roadmap Output
                          </span>
                          <button onClick={() => setExtractedPlan(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <pre className="whitespace-pre-wrap leading-relaxed max-h-[140px] overflow-y-auto style_scrollbar bg-slate-50 p-2.5 border border-slate-200 rounded-lg text-[10.5px] text-slate-700">
                          {extractedPlan}
                        </pre>
                        <button
                          onClick={() => {
                            const milestoneTask: TaskItem = {
                              id: `milestone-${Date.now()}`,
                              title: "Execute study goal listed on syllabus layout matrix",
                              completed: false,
                              dueDate: "2026-06-30",
                              category: "milestone",
                              priority: "high"
                            };
                            setTasks(prev => [milestoneTask, ...prev]);
                            setExtractedPlan(null);
                            playSirenBeep(900, "triangle");
                            showNotification("Roadmap milestone merged into active checklists.");
                          }}
                          className="mt-2 text-pink-600 hover:text-pink-700 text-[10px] font-bold cursor-pointer uppercase py-1.5 text-center border border-pink-200 bg-pink-50 hover:bg-pink-100 rounded-lg w-full shadow-2xs"
                        >
                          + Push plan into Active milestones checklist
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* COMPANION REMINDER ALARMS CARD */}
                  <section className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col relative shadow-xs" id="scheduler_alarms_card">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-cyan-600 animate-pulse" />
                        <h2 className="text-xs font-bold font-mono tracking-widest uppercase text-slate-500">Autonomous Alarm Scheduler</h2>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-150 font-bold">
                        {alarms.filter(a => a.active).length} ARMED
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed mb-3 leading-6">
                      Your AI operating assistant can program alarms in real-time (e.g. telling chatbot <span className="font-mono text-cyan-600 font-bold">"remind me in 30 seconds to join standby"</span>). Or register one manually:
                    </p>

                    {/* Manual Alarm Input Form */}
                    <div className="space-y-2 mb-4 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200/50">
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          type="text"
                          placeholder="Alarm description (e.g. Study compilers)"
                          value={manualAlarmTitle}
                          onChange={(e) => setManualAlarmTitle(e.target.value)}
                          className="w-full bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-[10.5px] font-mono focus:outline-hidden focus:border-cyan-400 text-slate-705 placeholder-slate-400"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Trigger time (e.g. 15:30 or 45s)"
                            value={manualAlarmTimeValue}
                            onChange={(e) => setManualAlarmTimeValue(e.target.value)}
                            className="flex-1 bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-[10.5px] font-mono focus:outline-hidden focus:border-cyan-400 text-slate-705 placeholder-slate-400"
                          />
                          <button
                            onClick={() => {
                              if (!manualAlarmTitle.trim() || !manualAlarmTimeValue.trim()) {
                                showNotification("Please supply descriptions and triggering times.");
                                return;
                              }
                              
                              const val = manualAlarmTimeValue.trim().toLowerCase();
                              if (val.includes("s") || !isNaN(Number(val))) {
                                const seconds = parseInt(val.replace("s", ""), 10);
                                if (isNaN(seconds)) {
                                  showNotification("Invalid duration. Use seconds count like 30 or 30s.");
                                  return;
                                }
                                registerAlarm(manualAlarmTitle, seconds);
                              } else if (val.includes(":")) {
                                registerAlarm(manualAlarmTitle, undefined, val);
                              } else {
                                showNotification("Format: 'HH:MM' (e.g. 15:30) or seconds (e.g. 15s or 15).");
                                return;
                              }
                              setManualAlarmTitle("");
                              setManualAlarmTimeValue("");
                            }}
                            className="px-3 bg-cyan-500 hover:bg-cyan-600 text-white text-[10px] font-bold font-mono rounded-lg transition-colors cursor-pointer active:scale-95 shadow-2xs whitespace-nowrap"
                          >
                            ARM TIMER
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Alarm list */}
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto style_scrollbar pr-1">
                      {alarms.map((alarm) => (
                        <div 
                          key={alarm.id} 
                          className={`p-2 rounded-xl border flex items-center justify-between text-[11px] font-mono transition-all ${
                            alarm.active 
                              ? "bg-cyan-50/20 border-cyan-150 text-slate-700 font-bold" 
                              : "bg-slate-50 border-slate-100 text-slate-405 opacity-60"
                          }`}
                        >
                          <div className="flex flex-col gap-0.5 max-w-[70%]">
                            <span className="truncate leading-tight text-slate-750">{alarm.title}</span>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-normal mt-0.5">
                              <span>Created at {alarm.createdAt}</span>
                              <span>•</span>
                              <span>{alarm.timeString}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {alarm.active ? (
                              <span className="text-[10px] font-semibold text-cyan-600 animate-pulse bg-cyan-50 border border-cyan-150 px-1.5 py-0.5 rounded leading-none">
                                {getCountdownText(alarm.triggerTime)}
                              </span>
                            ) : (
                              <span className="text-[9px] px-1 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500 leading-none">
                                {alarm.triggered ? "FIRED" : "DISMISSED"}
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteAlarm(alarm.id)}
                              className="text-slate-405 hover:text-red-500 cursor-pointer p-1 transition-colors rounded hover:bg-slate-100/80"
                              title="Delete tracker"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {alarms.length === 0 && (
                        <div className="text-center py-6 border border-dashed border-slate-200/85 rounded-xl bg-slate-50/40 text-[10.5px] text-slate-440 font-mono">
                          No alerts programmed. Tell Jarvis: “remind me to check compiler logs in 30 seconds” to arm.
                        </div>
                      )}
                    </div>
                  </section>

                  {/* CHECKS LIST AND OBJECTIVES PANEL */}
                  <section className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col relative shadow-xs" id="checklist_milestones_panel">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-cyan-600" />
                        <h2 className="text-xs font-bold font-mono tracking-widest uppercase text-slate-500">{activeLanguageStrings.objective}</h2>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{completedTasksCount}/{totalTasksCount} MET</span>
                    </div>

                    {/* Inline Task Form */}
                    <form onSubmit={handleAddTask} className="flex gap-2 mb-3" id="task_form_inline">
                      <input
                        type="text"
                        placeholder="Register study goal or query topic..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-250/70 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-cyan-400"
                        id="milestone_input"
                      />
                      <button
                        type="submit"
                        disabled={!newTaskTitle.trim()}
                        className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                        id="milestone_submit_btn"
                      >
                        +
                      </button>
                    </form>

                    {/* Scrollable list indices */}
                    <div className="space-y-2 style_scrollbar overflow-y-auto max-h-[185px] pr-1" id="milestones_scroller">
                      {tasks.map(t => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50/50 border border-slate-200 rounded-xl hover:bg-slate-100/50 hover:border-slate-250 transition-all"
                          id={`milestone_row_${t.id}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              onClick={() => toggleTaskCompleted(t.id)}
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                                t.completed 
                                  ? "bg-cyan-500 border-cyan-500 text-white" 
                                  : "border-slate-305 border-slate-300 hover:border-cyan-400"
                              }`}
                              id={`toggle_milestone_${t.id}`}
                            >
                              {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                            <span className={`text-[11px] leading-relaxed select-none truncate ${t.completed ? "line-through text-slate-400" : "text-slate-700 font-medium"}`}>{t.title}</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              setTasks(prev => prev.filter(item => item.id !== t.id));
                              playSirenBeep(350, "sine");
                            }}
                            className="text-slate-400 hover:text-red-500 p-0.5 transition-colors"
                            title="Drop goal"
                            id={`delete_milestone_${t.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* LONG TERM CONGNITIVE MEMORIES (MEMORY BANK) */}
                  <section className="bg-white border border-slate-200 rounded-2xl p-4 font-mono text-xs flex flex-col shadow-xs" id="memory_bank_panel">
                    <div className="flex items-center gap-1.5 mb-2.5 pb-1.5 border-b border-slate-100">
                      <Sliders className="w-4 h-4 text-cyan-600" />
                      <h4 className="text-xs font-bold text-slate-700 tracking-widest uppercase">{activeLanguageStrings.memoryTitle}</h4>
                    </div>

                    <p className="text-[10px] text-slate-450 leading-normal mb-3 leading-relaxed">
                      AI parses these active criteria as context filters.
                    </p>

                    <div className="space-y-1.5 overflow-y-auto max-h-[130px] pr-1 style_scrollbar mb-3">
                      {memories.map((m, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between text-[10px] text-slate-600">
                          <span className="truncate pr-4 leading-relaxed">&gt;&gt; {m}</span>
                          <button
                            onClick={() => {
                              setMemories(prev => prev.filter((_, i) => i !== idx));
                              playSirenBeep(400, "sawtooth");
                            }}
                            className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddMemory} className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder={activeLanguageStrings.memoryPlaceholder}
                        value={newMemory}
                        onChange={(e) => setNewMemory(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-250/70 rounded-lg px-2.5 py-1 text-[10px] focus:outline-hidden focus:bg-white focus:border-cyan-400 font-mono text-slate-800 placeholder-slate-400"
                        id="memory_key_value_input"
                      />
                      <button
                        type="submit"
                        disabled={!newMemory.trim()}
                        className="px-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer disabled:opacity-45 shadow-xs whitespace-nowrap"
                      >
                        ADD
                      </button>
                    </form>
                  </section>
                </div>
              </motion.div>
            )}

            {/* TAB 2: SYSTEM CONTROL AUTOMATION NODE TERMINAL */}
            {activeTab === "terminal" && (
              <motion.div
                key="terminal-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-stretch"
                id="automation_terminal_wrapper"
              >
                <SystemControlTerminal 
                  onShutdown={() => {
                    setPowerState("shutdown");
                    playSirenBeep(200, "sawtooth");
                  }}
                  onRestart={() => {
                    setPowerState("restart");
                    playSirenBeep(500, "triangle");
                  }}
                  langStrings={strings}
                  showYoutubeModal={showYoutubeModal}
                  setShowYoutubeModal={setShowYoutubeModal}
                  showWhatsappModal={showWhatsappModal}
                  setShowWhatsappModal={setShowWhatsappModal}
                  whatsappText={whatsappText}
                  setWhatsappText={setWhatsappText}
                  whatsappPhone={whatsappPhone}
                  setWhatsappPhone={setWhatsappPhone}
                  consoleLogs={consoleLogs}
                  setConsoleLogs={setConsoleLogs}
                  onCommandTriggered={handleVoiceCommandTriggered}
                />
              </motion.div>
            )}

            {/* TAB 3: AGENT ROUNDTABLE LAB */}
            {activeTab === "roundtable" && (
              <motion.div
                key="roundtable-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-5xl mx-auto w-full flex flex-col gap-6"
                id="roundtable_lab_wrapper"
              >
                <AgentSwarmCenter 
                  onPlanGenerated={(plan) => {
                    setExtractedPlan(plan);
                    playSirenBeep(900, "triangle");
                    showNotification("Multi-Agent planning blueprinted.");
                  }}
                />
              </motion.div>
            )}
             {/* TAB 4: COMPILER SANDBOX WORKSPACE */}
            {activeTab === "sandbox" && (
              <motion.div
                key="sandbox-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
                id="compiler_sandbox_wrapper"
              >
                <section className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col font-mono text-xs shadow-xs">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <span className="text-cyan-700 font-bold uppercase tracking-wider">JARVIS-SANDBOX COMPILER</span>
                    <button
                      onClick={handleRunSandbox}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-3.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                      id="compiler_submit_btn"
                    >
                      {isCompilingSandbox ? "COMPILING..." : "COMPILE SCRIPT"}
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 mb-2 leading-relaxed font-sans">
                    Write javascript algorithms to evaluate cluster vector efficiency coefficients.
                  </p>

                  <textarea
                    value={sandboxCode}
                    onChange={(e) => setSandboxCode(e.target.value)}
                    className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-700 font-mono focus:outline-hidden focus:bg-white focus:border-cyan-400 style_scrollbar leading-relaxed h-[240px]"
                    id="compiler_textarea"
                  />
                </section>

                <section className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col font-mono text-xs shadow-xs">
                  <span className="text-slate-600 font-bold uppercase tracking-wider mb-2 border-b border-slate-100 pb-1 flex items-center justify-between">CONSTRUCT SYSTEM OUTPUT</span>
                  <div className="flex-1 w-full bg-slate-900 p-4 rounded-xl border border-slate-950 overflow-y-auto style_scrollbar max-h-[300px]">
                    <pre className="text-emerald-400 leading-normal text-[10px] whitespace-pre-wrap">{sandboxOutput}</pre>
                  </div>
                </section>
              </motion.div>
            )}

            {/* TAB 5: BIOMETRICS AND LOCK CONTROLS */}
            {activeTab === "biometrics" && (
              <motion.div
                key="biometrics-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-2xl mx-auto w-full bg-white border border-slate-200 rounded-3xl p-6 font-mono text-center relative overflow-hidden shadow-xs"
              >
                <div className="w-16 h-16 bg-cyan-50 border border-cyan-200 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/25 border-dashed animate-spin"></div>
                  <Eye className="w-8 h-8 text-cyan-600" />
                </div>

                <h3 className="text-md font-bold text-slate-800 uppercase mb-1">SYSTEM INSTANCE COMPLIANCE</h3>
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed mb-6">Device synchronization matched successfully against client session active logs.</p>

                <div className="space-y-4 max-w-sm mx-auto text-left">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-700">
                    <span>BIOMETRICS MATCH COURIER:</span>
                    <span className="text-emerald-600 font-bold font-mono">MATCHED</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-700">
                    <span>PORTAL WEB COGNITION:</span>
                    <span className="text-cyan-600 font-bold font-mono">NOMINAL STATE</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsUnlocked(false);
                      playSirenBeep(400, "sawtooth");
                    }}
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl text-xs font-bold cursor-pointer relative active:scale-95 transition-transform shadow-xs"
                    id="relock_panel_btn"
                  >
                    LOCK ACTIVE WORKSPACE
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* BOTTOM METEGRID: analytical telemetry values */}
        <footer className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 z-10" id="analytical_telemetry_bar">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-center shadow-xs">
            <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest leading-none">{activeLanguageStrings.codingHours}</span>
            <span className="text-xl font-light text-slate-800 tracking-tight mt-1.5 font-sans flex items-end gap-1">
              <span className="text-2.5xl font-extrabold text-slate-900">{totalHours}</span>
              <span className="text-[10px] text-slate-400 font-mono lowercase">hours</span>
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-center shadow-xs">
            <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest leading-none">{activeLanguageStrings.milestonesMet}</span>
            <span className="text-xl font-light text-teal-600 tracking-tight mt-1.5 font-sans flex items-end gap-1">
              <span className="text-2.5xl font-extrabold text-teal-600">{completedTasksCount}/{totalTasksCount}</span>
              <span className="text-[10px] text-slate-400 font-mono lowercase">goals</span>
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-center shadow-xs">
            <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest leading-none">{activeLanguageStrings.nodesIndexed}</span>
            <span className="text-xl font-light text-slate-800 tracking-tight mt-1.5 font-sans flex items-end gap-1">
              <span className="text-2.5xl font-extrabold text-slate-900 font-sans">4,802</span>
              <span className="text-[10px] text-slate-400 font-mono lowercase">nodes</span>
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-center shadow-xs">
            <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest leading-none">{activeLanguageStrings.voiceSync}</span>
            <span className="text-xl font-light text-indigo-600 tracking-tight mt-1.5 font-sans flex items-end gap-1 flex-1">
              <span className="text-2.5xl font-extrabold text-indigo-600">182</span>
              <span className="text-[10px] text-slate-400 font-mono lowercase">mins</span>
            </span>
          </div>
        </footer>

      </main>

      {/* FLOATING DIALOGS: Ingestion Add Source Resource Card */}
      <AnimatePresence>
        {isAddDocOpen && (
          <div className="fixed inset-0 bg-[#02050e]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="add_doc_overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md shadow-2xl relative"
            >
              <h3 className="text-xs font-bold font-mono uppercase text-cyan-600 tracking-widest mb-4 border-b border-slate-100 pb-2">INGEST COGNITIVE CONTEXT SOURCE</h3>

              <form onSubmit={handleAddDocument} className="space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-505 uppercase font-bold block">Document Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Database Normalization 3NF Blueprints"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:bg-white focus:border-cyan-400"
                    id="new_doc_title_element"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-505 uppercase font-bold block">Source category</label>
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:bg-white focus:border-cyan-400"
                    id="new_doc_cat_element"
                  >
                    <option value="pdf">PDF Research Document</option>
                    <option value="paper">Academic Paper</option>
                    <option value="textbook">Course Textbook</option>
                    <option value="note">Syllabus Handout Note</option>
                    <option value="documentation">Project Documentation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-505 uppercase font-bold block">Source material text Content</label>
                  <textarea
                    required
                    placeholder="Write raw study notes, transcripts or DBMS textbook passages..."
                    value={newDocContent}
                    onChange={(e) => setNewDocContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-cyan-400 h-[100px] leading-relaxed style_scrollbar"
                    id="new_doc_content_element"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddDocOpen(false);
                      playSirenBeep(600, "triangle");
                    }}
                    className="px-4 py-2 hover:bg-slate-100 rounded-xl text-slate-500 font-bold cursor-pointer"
                    id="cancel_new_doc_btn"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl cursor-pointer shadow-xs active:scale-95"
                    id="submit_new_doc_btn"
                  >
                    INGEST INDEX
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL MODAL: YOUTUBE MUSIC COCKPIT OVERLAY */}
      <AnimatePresence>
        {showYoutubeModal && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative font-mono text-xs text-slate-800"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 font-mono">
                  <Play className="w-5 h-5 text-red-500 animate-pulse fill-current" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">JARVIS DIGITAL MEDIA COCKPIT</span>
                </div>
                <button
                  onClick={() => setShowYoutubeModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
                >
                  ✕ CLOSE
                </button>
              </div>

              {/* Graphical audio visualizer with randomized peak heights */}
              <div className="bg-slate-900 h-52 rounded-2xl flex items-center justify-center relative overflow-hidden mb-4 border border-slate-950 shadow-inner">
                <div 
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(rgba(18, 180, 222, 0.05) 1px, transparent 1px)`,
                    backgroundSize: '100% 12px'
                  }}
                ></div>
                
                <div className="flex items-end gap-1.5 h-32 relative z-10 p-5">
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ["10px", "90px", "18px", "115px", "10px"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8 + Math.random() * 0.7,
                        ease: "easeInOut",
                        delay: i * 0.08
                      }}
                      className="w-2 rounded-full bg-gradient-to-t from-red-500 via-pink-500 to-cyan-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                    ></motion.div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-slate-950 p-3 rounded-xl border border-slate-800/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest animate-pulse">Now Playing: {currentUser.song}</h4>
                    <p className="text-[9px] text-slate-500 font-mono leading-none mt-1">Synced parameter: Agent {currentUser.name.toUpperCase()}</p>
                  </div>
                  <Volume2 className="w-4 h-4 text-cyan-400 animate-bounce" />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 font-sans">
                <span>Secure Sandbox Stream Decryption</span>
                <button 
                  onClick={() => {
                    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(currentUser.song)}`, "_blank");
                    setShowYoutubeModal(false);
                  }}
                  className="text-red-500 hover:text-red-600 font-bold active:scale-95 text-xs cursor-pointer tracking-wide uppercase font-mono"
                >
                  OPEN NATIVE YOUTUBE 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL MODAL: WHATSAPP DISPATCH HUB */}
      <AnimatePresence>
        {showWhatsappModal && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-800/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative font-mono text-xs text-slate-800"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">WhatsApp Integration Hub</span>
                </div>
                <button
                  onClick={() => setShowWhatsappModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer opacity-80"
                >
                  ✕ CANCEL
                </button>
              </div>

              <div className="space-y-4 font-mono">
                <div>
                  <label className="block text-[10px] uppercase text-slate-500 mb-1.5 font-bold tracking-widest block">Recipient Phone Param</label>
                  <input
                    type="tel"
                    placeholder="e.g. +919876543210 (Country code, no spaces)"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-400 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-slate-850 focus:outline-hidden"
                    id="wa_global_phone_input"
                  />
                  <span className="text-[9px] text-slate-400 mt-1 block uppercase font-sans">Defaults to contact list index selector inside WhatsApp Web browser window.</span>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-slate-500 mb-1.5 font-bold block tracking-widest">Secure Text Payload</label>
                  <textarea
                    rows={4}
                    value={whatsappText}
                    onChange={(e) => setWhatsappText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-400 focus:bg-white rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden leading-relaxed"
                    id="wa_global_text_input"
                  />
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-[10px] text-emerald-700 leading-normal font-sans">
                  💡 This action triggers real wa.me API pathways, directly launching a synchronization link to transmit the payload safely.
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setShowWhatsappModal(false)}
                    className="px-4 py-2 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-500 cursor-pointer"
                  >
                    ABORT
                  </button>
                  <button
                    onClick={triggerRealWhatsAppRedirect}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    id="wa_global_submit_btn"
                  >
                    <span>DISPATCH PACKET</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL MODAL: DYNAMIC COGNITIVE ALARM RINGING PANEL */}
      <AnimatePresence>
        {ringingAlarm && (
          <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-red-950/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              className="bg-white border-2 border-red-200 rounded-3xl w-full max-w-md p-6 shadow-2xl relative font-mono text-xs text-slate-800 text-center animate-fade-in"
            >
              <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-4 border-red-500/20 animate-ping shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                <Clock className="w-8 h-8 text-red-600 animate-pulse" />
              </div>

              <h4 className="text-sm font-black text-red-600 uppercase tracking-widest mb-1 font-sans">
                ⏰ COGNITIVE REMINDER ALERT
              </h4>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-4">
                Workstation Synchronized Schedule Met
              </p>

              <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-1 leading-normal">
                  "{ringingAlarm.title}"
                </h3>
                <span className="text-[10px] text-slate-400 font-normal">
                  Scheduled time indicator: {ringingAlarm.timeString}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-1">
                <button
                  onClick={() => handleSnoozeAlarm(ringingAlarm.id)}
                  className="w-full py-2.5 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-500 cursor-pointer active:scale-95 transition-all"
                >
                  SNOOZE (5M)
                </button>
                <button
                  onClick={() => handleDismissAlarm(ringingAlarm.id)}
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all shadow-md shadow-red-200"
                >
                  DISMISS ALERT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
