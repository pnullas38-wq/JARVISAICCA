import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Volume2, VolumeX, Shield, ArrowLeft, Play, Power, MessageSquare, Compass, Radio, Cpu, RefreshCw, Activity } from "lucide-react";
import { Language } from "./LanguageHelper";

interface Fullscreen3DRobotProps {
  language: Language;
  onCommandTriggered: (command: string) => void;
  userName: string;
  onClose: () => void;
  currentUser: { name: string; song: string };
  registeredUsers: { name: string; song: string }[];
}

export const Fullscreen3DRobot: React.FC<Fullscreen3DRobotProps> = ({
  language,
  onCommandTriggered,
  userName,
  onClose,
  currentUser,
  registeredUsers
}) => {
  const [robotState, setRobotState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [speechText, setSpeechText] = useState("");
  const [typedCommand, setTypedCommand] = useState("");
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mouthWaves, setMouthWaves] = useState<number[]>(Array(24).fill(12));
  
  const containerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Parallax / Look-at mouse coordinator
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      
      // Calculate look angles limited to 20 degrees
      const rotY = (distanceX / (window.innerWidth / 2)) * 22;
      const rotX = -(distanceY / (window.innerHeight / 2)) * 16;
      
      setMousePosition({ x: rotY, y: rotX });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Set up local Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      const langMap: Record<Language, string> = {
        en: "en-US", es: "es-ES", fr: "fr-FR", hi: "hi-IN", kn: "kn-IN", ja: "ja-JP"
      };
      rec.lang = langMap[language] || "en-US";

      rec.onstart = () => {
        setRobotState("listening");
        setSpokenTranscript("");
        playSynthBeep(440, "sine");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpokenTranscript(transcript);
        setSpeechText(transcript);
        setRobotState("thinking");

        // Artificial delay for synaptic thinking feel
        setTimeout(() => {
          handleExecuteBotAction(transcript);
        }, 1000);
      };

      rec.onerror = () => {
        setRobotState("idle");
      };

      rec.onend = () => {
        if (robotState === "listening") {
          setRobotState("idle");
        }
      };

      recognitionRef.current = rec;
    }
  }, [language, robotState]);

  // Speaking state voice waveform visualizer loop
  useEffect(() => {
    let animationFrame: number;
    const generateWaves = () => {
      if (robotState === "speaking") {
        setMouthWaves(Array.from({ length: 24 }, () => Math.floor(Math.random() * 85) + 15));
      } else if (robotState === "listening") {
        setMouthWaves(Array.from({ length: 24 }, () => Math.floor(Math.random() * 30) + 10));
      } else {
        // Subtle ambient pilot breath
        const time = Date.now() * 0.003;
        setMouthWaves(Array.from({ length: 24 }, (_, i) => {
          const breath = Math.sin(time + i * 0.4) * 8 + 14;
          return Math.max(8, breath);
        }));
      }
      animationFrame = requestAnimationFrame(generateWaves);
    };
    generateWaves();
    return () => cancelAnimationFrame(animationFrame);
  }, [robotState]);

  // Internal voice sound effects generator
  const playSynthBeep = (freq: number, type: OscillatorType, duration = 0.1) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const speakSynthesizerText = (text: string) => {
    if (!voiceEnabled) return;
    try {
      if (window.speechSynthesis) {
        const synth = window.speechSynthesis;
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.onstart = () => setRobotState("speaking");
        utterance.onend = () => setRobotState("idle");
        utterance.onerror = () => setRobotState("idle");

        // Select a suitable voice if available
        const voices = synth.getVoices();
        const correctVoice = voices.find(v => v.lang.startsWith("en"));
        if (correctVoice) {
          utterance.voice = correctVoice;
        }
        utterance.rate = 1.02;
        utterance.pitch = 0.9;
        synth.speak(utterance);
      }
    } catch (e) {
      setRobotState("idle");
    }
  };

  // Perform cognitive match action
  const handleExecuteBotAction = (commandStr: string) => {
    if (!commandStr.trim()) return;
    const cleanCmd = commandStr.toLowerCase();

    // Trigger parent hook
    onCommandTriggered(commandStr);

    if (cleanCmd.includes("play") || cleanCmd.includes("song") || cleanCmd.includes("youtube") || cleanCmd.includes("music")) {
      // Extract target playlist title
      const extractedSong = commandStr
        .replace(/play/i, "")
        .replace(/song/i, "")
        .replace(/youtube/i, "")
        .replace(/music/i, "")
        .trim();

      const finalSong = extractedSong || currentUser.song;
      
      // Automatic Speech Feedback Response
      speakSynthesizerText(`Affirmative Agent ${userName}. Directing YouTube protocols to locate and play: "${finalSong}". Synchronizing media terminal.`);
      
      // Auto launch in browser new window context! Completely automated!
      setTimeout(() => {
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(finalSong)}`, "_blank");
      }, 2000);

    } else if (cleanCmd.includes("shutdown") || cleanCmd.includes("turn off")) {
      speakSynthesizerText("Deauthorizing main access keys. Dismantling core synapses. Goodbye, Agent.");
    } else if (cleanCmd.includes("hello") || cleanCmd.includes("hi ") || cleanCmd.includes("who are you")) {
      speakSynthesizerText(`Greetings Agent ${userName}. I am the cybernetic mainframe of JARVIS X-OS. System status is fully operational. How may I assist your engineering parameters today?`);
    } else {
      speakSynthesizerText(`Command parsed. Running synaptic simulation for: "${commandStr}". Output registered in standard console pipeline.`);
    }

    setTypedCommand("");
  };

  const toggleMic = () => {
    if (robotState === "listening") {
      if (recognitionRef.current) recognitionRef.current.stop();
      setRobotState("idle");
    } else {
      setRobotState("listening");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // ignore
        }
      } else {
        // Fallback simulation
        setTimeout(() => {
          setRobotState("thinking");
          setTimeout(() => {
            handleExecuteBotAction("Play Lofi Ambient Beats");
          }, 1500);
        }, 2000);
      }
    }
  };

  // Say hi on initial load
  useEffect(() => {
    const greetingDelay = setTimeout(() => {
      speakSynthesizerText(`Agent ${userName} connected. High fidelity 3D cockpit loaded. Microphone and dynamic speaker grids ready.`);
    }, 1000);
    return () => clearTimeout(greetingDelay);
  }, [userName]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-110 flex flex-col justify-between bg-slate-950 text-slate-300 font-mono overflow-auto p-6 select-none"
      id="fullscreen_robot_arena"
    >
      {/* Intense Glowing Sci-fi Space Horizon Grid Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-transform"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00f0ff 1.5px, transparent 1.5px),
            linear-gradient(to bottom, #00f0ff 1.5px, transparent 1.5px)
          `,
          backgroundSize: '50px 50px',
          transform: `perspective(1000px) rotateX(60deg) translateY(-250px) translateZ(-40px) rotateY(${mousePosition.x / 4}deg)`
        }}
      ></div>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none"></div>

      {/* Futuristic top control bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 hover:bg-white/5 border border-white/10 hover:border-white/20 active:scale-95 text-xs text-slate-300 font-bold uppercase rounded-xl cursor-pointer transition-all"
            id="exit_3d_robot_btn"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Close Cockpit Matrix</span>
          </button>
          
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 rounded-lg text-[9px] font-bold tracking-widest uppercase animate-pulse">
            <Radio className="w-3 h-3 text-cyan-400" />
            <span>INTELLIGENT VIRTUAL HUMAN MODEL ONLINE</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right text-[10px] hidden md:block">
            <p className="text-slate-400">SESSION: <strong className="text-cyan-400 uppercase">{userName}</strong></p>
            <p className="text-slate-600 text-[8px] tracking-wider font-bold">CORE SYNAPSE ADAPTERS ACTIVE</p>
          </div>
          
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-xl border cursor-pointer active:scale-95 transition-all ${
              voiceEnabled 
                ? "bg-teal-500/10 border-teal-500/40 text-teal-400" 
                : "bg-slate-950 border-white/10 text-slate-500"
            }`}
            title="Toggle Voice Feedback Output"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main core: 3D Robot visualization viewport */}
      <div className="relative z-10 my-4 flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 justify-items-center max-w-7xl mx-auto w-full">
        
        {/* LEFT PANEL: Diagnostic monitors */}
        <div className="w-full lg:w-72 bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-2xl p-4 text-[10px] space-y-4 self-stretch flex flex-col justify-between max-h-[460px] lg:max-h-none order-2 lg:order-1">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> ROBOT INTELLIGENCE DIARY</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            
            <p className="text-slate-400 mb-2 leading-relaxed">
              Synthesizing custom cyber-atmosphere templates. Direct access is mapped to active account owner.
            </p>

            <div className="p-2 bg-slate-950 border border-white/5 rounded-xl text-slate-400 space-y-1 my-3">
              <p className="font-bold text-[9px] text-pink-400 uppercase tracking-wider">Matched User Identity Keys:</p>
              <p>📍 Name Tag: <strong className="text-slate-200">{currentUser.name}</strong></p>
              <p>🎵 Preferred Anthem: <strong className="text-slate-200 truncate block">{currentUser.song}</strong></p>
            </div>
          </div>

          <div>
            <span className="text-[9px] text-slate-500 block uppercase mb-1 font-bold tracking-widest">Active System Accounts</span>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {registeredUsers.map((user) => (
                <div key={user.name} className="flex items-center justify-between bg-white/[0.01] border border-white/5 rounded-lg p-2 text-[9px]">
                  <span className="font-bold text-slate-300">Agent {user.name}</span>
                  <span className="text-slate-500 italic block truncate max-w-[120px]">{user.song}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 bg-cyan-950/20 border border-cyan-500/10 rounded-xl leading-relaxed text-slate-400 text-[10px]">
            💡 <strong className="text-cyan-300 uppercase font-bold text-[9px]">Voice Actions Rulebook:</strong><br />
            Speak and say <strong className="text-pink-300">&ldquo;play [song title]&rdquo;</strong>. The 3D Mainframe parses the exact string and launches play streams instantly!
          </div>
        </div>

        {/* CENTER INTERACTIVE 3D ROBOT CHASSIS */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px] lg:min-h-[480px] order-1 lg:order-2">
          
          {/* Parallax look container wrapper */}
          <div 
            className="relative cursor-pointer transition-transform duration-300 ease-out flex flex-col items-center justify-center"
            style={{
              transform: `rotateY(${mousePosition.x}deg) rotateX(${mousePosition.y}deg)`,
              transformStyle: "preserve-3d"
            }}
          >
            
            {/* Ambient visual background radar rings */}
            <div className="absolute w-[360px] h-[360px] rounded-full border border-pink-500/5 animate-pulse pointer-events-none flex items-center justify-center">
              <div className="w-[280px] h-[280px] rounded-full border border-cyan-500/5 animate-spin duration-10000"></div>
            </div>

            {/* ROBOT MODEL (Layered SVG + CSS elements forming 3D depth) */}
            <div className="relative w-72 h-80 flex flex-col items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
              <svg 
                viewBox="0 0 200 200" 
                className="w-48 h-48 drop-shadow-[0_0_25px_rgba(6,182,212,0.3)] filter"
                style={{ transform: "translateZ(30px)" }}
              >
                {/* 3D Head chassis frame */}
                <path 
                  d="M 40,65 C 40,30 160,30 160,65 L 155,130 C 155,150 45,150 45,130 Z" 
                  fill="#030712" 
                  stroke="#22d3ee" 
                  strokeWidth="3.5"
                />

                {/* Cyber ear receivers */}
                <rect x="23" y="75" width="14" height="30" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                <rect x="163" y="75" width="14" height="30" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                
                {/* Internal wiring detail */}
                <path d="M 60,140 Q 100,165 140,140" fill="none" stroke="#db2777" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* Futuristic Visor Goggles */}
                <path 
                  d="M 46,65 Q 100,55 154,65 L 150,95 Q 100,105 50,95 Z" 
                  fill="#000000" 
                  stroke="#db2777" 
                  strokeWidth="2.5" 
                />

                {/* Laser Scanning Eye Track */}
                <line x1="55" y1="80" x2="145" y2="80" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 4" />
                
                {/* Dynamic looking pupil eyes */}
                <circle 
                  cx={100 + mousePosition.x * 0.9} 
                  cy={80 - mousePosition.y * 0.5} 
                  r="6" 
                  fill="#00f0ff"
                  className={robotState === "thinking" ? "animate-ping" : ""}
                />
                
                <circle 
                  cx={75 + mousePosition.x * 0.6} 
                  cy={80 - mousePosition.y * 0.5} 
                  r="12" 
                  fill="#00f0ff" 
                  fillOpacity="0.22" 
                />
                <circle 
                  cx={125 + mousePosition.x * 0.6} 
                  cy={80 - mousePosition.y * 0.5} 
                  r="12" 
                  fill="#00f0ff" 
                  fillOpacity="0.22" 
                />

                {/* Robot Vocalizer Mouth lines */}
                <rect x="65" y="112" width="70" height="12" rx="6" fill="#020617" stroke="#334155" strokeWidth="1.5" />
                
                {/* Glowing status line within visor */}
                <motion.line 
                  x1="52" 
                  y1="78" 
                  x2="148" 
                  y2="78" 
                  stroke="#22d3ee" 
                  strokeWidth="2.5"
                  animate={{
                    opacity: robotState === "speaking" ? [0.4, 1, 0.4] : [0.8, 0.8]
                  }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                />
              </svg>

              {/* Dynamic speaking mouth bars */}
              <div 
                className="absolute flex items-center justify-center gap-[2.5px] h-8 top-32 z-20 pointer-events-none" 
                style={{ transform: "translateZ(45px)" }}
              >
                {mouthWaves.slice(0, 14).map((h, idx) => (
                  <div
                    key={idx}
                    className={`w-[3px] rounded-full transition-all duration-75 ${
                      robotState === "speaking" 
                        ? "bg-gradient-to-t from-pink-500 to-cyan-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]" 
                        : robotState === "listening"
                          ? "bg-emerald-400"
                          : "bg-cyan-500/45"
                    }`}
                    style={{ height: `${h * 0.22}px` }}
                  ></div>
                ))}
              </div>

              {/* Robot mechanical neck joint */}
              <div className="w-10 h-8 bg-slate-900 border-x border-cyan-500/30 shadow-inner flex flex-col justify-between p-1 select-none">
                <div className="w-full h-1 bg-cyan-500/20 rounded"></div>
                <div className="w-full h-1 bg-cyan-500/20 rounded"></div>
              </div>

              {/* Robot mechanical shoulders & heart chassis core */}
              <div 
                className="w-48 h-20 bg-slate-950 border-2 border-cyan-400/40 rounded-t-3xl relative flex flex-col items-center justify-center p-3 shadow-2xl"
                style={{ transform: "translateZ(10px)" }}
              >
                {/* Glowing reactor heart */}
                <motion.button 
                  onClick={toggleMic}
                  animate={{ 
                    scale: robotState === "speaking" ? [1, 1.05, 1] : robotState === "listening" ? [1, 1.12, 1] : [1, 1.02, 1],
                    boxShadow: robotState === "listening" ? "0 0 20px #10b981" : "0 0 12px rgba(6,182,212,0.3)"
                  }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center cursor-pointer transition-all ${
                    robotState === "listening" 
                      ? "bg-emerald-950 border-emerald-400 text-emerald-400" 
                      : robotState === "speaking"
                        ? "bg-pink-950 border-pink-400 text-pink-400"
                        : "bg-cyan-950/80 border-cyan-400 text-cyan-400 hover:bg-cyan-900/50"
                  }`}
                  id="robot_heart_trigger"
                  title="Click Robot Core to Converse"
                >
                  {robotState === "listening" ? (
                    <Mic className="w-5 h-5 animate-bounce" />
                  ) : (
                    <Power className={`w-5 h-5 ${robotState === "speaking" ? "animate-pulse" : ""}`} />
                  )}
                </motion.button>

                <div className="absolute bottom-1 text-[7.5px] text-slate-500 uppercase tracking-widest text-center font-bold">
                  {robotState.toUpperCase()} PROTOCOL
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic state label overlay */}
          <div className="mt-4 text-center">
            <h3 className="text-sm font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 tracking-widest">
              {robotState === "idle" && "🤖 MAIN CORE STANDBY"}
              {robotState === "listening" && "🎤 RECORDING SYNAPSE AUDIO FEED"}
              {robotState === "thinking" && "⚡ PARSING DYNAMIC SYNAPSE NODES"}
              {robotState === "speaking" && "🔊 AUDIO REVERBERATION OUTFLOW"}
            </h3>
            {spokenTranscript && (
              <p className="mt-2 text-[11px] text-indigo-300 italic max-w-sm mx-auto p-2 bg-[#0c1328] border border-cyan-500/10 rounded-xl">
                &ldquo;{spokenTranscript}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Voice response controller & prompt interface */}
        <div className="w-full lg:w-80 bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-2xl p-5 self-stretch flex flex-col justify-between max-h-[460px] lg:max-h-none order-3">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-pink-400 uppercase tracking-widest flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> COGNITIVE PROMPTER</span>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              If speaking input is unavailable, transmit keyboard control vectors safely via this direct injection command slot.
            </p>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteBotAction(typedCommand);
              }}
              className="space-y-2.5 pt-2"
            >
              <div>
                <label className="block text-[8px] uppercase tracking-widest text-[#93c5fd] font-extrabold mb-1">Injected Command Packet</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Play bad liar / Hello"
                    value={typedCommand}
                    onChange={(e) => setTypedCommand(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 focus:border-cyan-400/50 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-hidden"
                    maxLength={100}
                    id="inject_text_field"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-2 text-cyan-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-1 pt-2">
              <span className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold">Automation Presets</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  "Play study lo-fi",
                  "Play soft acoustic",
                  "Play cyberpunk",
                  "Hello JARVIS"
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setTypedCommand(preset);
                      playSynthBeep(600, "sine", 0.05);
                    }}
                    className="bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 border border-white/5 rounded-lg py-1.5 text-[10px] text-slate-400 hover:text-white cursor-pointer select-none text-center"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <span className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold">Speech Transduction Feed</span>
            
            <div className="bg-slate-950 border border-white/5 rounded-xl p-3 h-28 overflow-y-auto text-[9.5px] text-slate-400 leading-normal font-mono relative">
              {speechText ? (
                <div className="flex items-start gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 flex-shrink-0 animate-ping"></div>
                  <p className="text-slate-200">{speechText}</p>
                </div>
              ) : (
                <span className="text-slate-600 italic block text-center mt-6">Awaiting vocal inputs or command presets parsing...</span>
              )}
            </div>
            
            <div className="flex justify-between items-center text-[8px] text-slate-600">
              <span>Hologram Decryption Feed</span>
              <span>SYNAPSES: ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cybernetic bottom bar stats */}
      <div className="relative z-10 border-t border-white/10 pt-4 flex flex-col md:flex-row justify-between text-[9px] text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <span>MAIN CORE ENGINE: JARVIS-X92</span>
          <span>VOICE DECODER: compliant v4.2.3</span>
          <span>MATRIX GRID: 512x512 RES</span>
        </div>
        <div>
          <span>PROVECTUS AUTO-PLAY: COMPLIANT WITH DIRECT YOUTUBE LINK CHUNKS</span>
        </div>
      </div>
    </div>
  );
};
