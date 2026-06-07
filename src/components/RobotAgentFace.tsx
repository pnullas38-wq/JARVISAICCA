import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Navigation, CheckCircle, Activity, Play, Send } from "lucide-react";
import { Language, translationMap } from "./LanguageHelper";

interface RobotAgentFaceProps {
  language: Language;
  onCommandTriggered: (command: string) => void;
  userName?: string;
  isUnlocked: boolean;
}

export const RobotAgentFace: React.FC<RobotAgentFaceProps> = ({
  language,
  onCommandTriggered,
  userName = "Ullas",
  isUnlocked
}) => {
  const [faceState, setFaceState] = useState<"idle" | "listening" | "speaking" | "thinking">("idle");
  const [speechText, setSpeechText] = useState("");
  const [voiceActive, setVoiceActive] = useState(true);
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mouthWaves, setMouthWaves] = useState<number[]>([15, 15, 15, 15, 15, 15, 15]);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const faceContainerRef = useRef<HTMLDivElement>(null);

  // Recognition reference
  const recognitionRef = useRef<any>(null);

  // Check language strings
  const localizedGreets: Record<Language, string> = {
    en: `Hello Agent ${userName}. Biometric scan validated. Cognitive core functions are ready for command parameters.`,
    es: `Hola Agente ${userName}. Escaneo biométrico validado. Las funciones del núcleo están listas.`,
    fr: `Bonjour Agent ${userName}. Scan biométrique validé. Le noyau cognitif est prêt.`,
    hi: `नमस्कार एजेंट ${userName}। बायोमेट्रिक स्कैन मान्य किया गया है। जार्विस कोर कमांड के लिए तैयार है।`,
    kn: `ನಮಸ್ಕಾರ ಏಜೆಂಟ್ ${userName}. ಬಯೋಮೆಟ್ರಿಕ್ ಸ್ಕ್ಯಾನ್ ಯಶಸ್ವಿಯಾಗಿದೆ. ಜಾರ್ವಿಸ್ ಕಮಾಂಡ್ ಸ್ವೀಕರಿಸಲು ಸಿದ್ಧರಿದ್ದಾರೆ.`,
    ja: `エージェント ${userName}、こんにちは。バイオメトリック認証が完了しました。システム準備完了。`
  };

  const localizedListening: Record<Language, string> = {
    en: "Listening for cognitive voice protocols...",
    es: "Escuchando protocolos de voz cognitivos...",
    fr: "Écoute des protocoles de voix cognitifs...",
    hi: "ध्वनि अनुकूलन कमांड सुन रहा हूँ...",
    kn: "ಧ್ವನಿ ಆದೇಶಕ್ಕಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ...",
    ja: "音声コマンド待機中..."
  };

  // 3D parallax tracking effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!faceContainerRef.current) return;
      const rect = faceContainerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = rect.left + width / 2;
      const centerY = rect.top + height / 2;
      
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      // Pivot up to 15 degrees
      const rotY = (mouseX / (window.innerWidth / 2)) * 18;
      const rotX = -(mouseY / (window.innerHeight / 2)) * 18;
      
      setRotation({ x: rotX, y: rotY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Set up Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsRecognitionSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Map localization language
      const langMap: Record<Language, string> = {
        en: "en-US",
        es: "es-ES",
        fr: "fr-FR",
        hi: "hi-IN",
        kn: "kn-IN",
        ja: "ja-JP"
      };
      rec.lang = langMap[language] || "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setFaceState("listening");
        setSpeechText("");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpeechText(transcript);
        setFaceState("thinking");

        setTimeout(() => {
          onCommandTriggered(transcript);
          setFaceState("idle");
        }, 1200);
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition Error:", err);
        setIsListening(false);
        setFaceState("idle");
      };

      rec.onend = () => {
        setIsListening(false);
        if (faceState === "listening") {
          setFaceState("idle");
        }
      };

      recognitionRef.current = rec;
    }
  }, [language, faceState, onCommandTriggered]);

  // Speech response synthesizer
  const speakText = (text: string) => {
    if (!voiceActive) return;
    try {
      if (window.speechSynthesis) {
        const synth = window.speechSynthesis;
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Select matching language voice
        const langCodeMap: Record<Language, string> = {
          en: "en",
          es: "es",
          fr: "fr",
          hi: "hi",
          kn: "kn",
          ja: "ja"
        };
        const targetLang = langCodeMap[language] || "en";
        
        utterance.lang = targetLang;
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        // Visual talking animation loop
        utterance.onstart = () => {
          setFaceState("speaking");
        };

        utterance.onend = () => {
          setFaceState("idle");
        };

        utterance.onerror = () => {
          setFaceState("idle");
        };

        const voices = synth.getVoices();
        const correctVoice = voices.find(v => v.lang.startsWith(targetLang));
        if (correctVoice) {
          utterance.voice = correctVoice;
        }

        synth.speak(utterance);
      }
    } catch (e) {
      console.warn("Speech Synthesis synthesis failed or blocked:", e);
      setFaceState("idle");
    }
  };

  // Speak greeting when unlocked or when language changes
  useEffect(() => {
    if (isUnlocked) {
      const greeting = localizedGreets[language] || localizedGreets.en;
      speakText(greeting);
    }
  }, [isUnlocked, language, userName]);

  // Animate vocal mouth waves when speaking or acting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (faceState === "speaking") {
      interval = setInterval(() => {
        setMouthWaves(Array.from({ length: 7 }, () => Math.floor(Math.random() * 45) + 10));
      }, 90);
    } else if (faceState === "listening") {
      interval = setInterval(() => {
        setMouthWaves(Array.from({ length: 7 }, () => Math.floor(Math.random() * 15) + 5));
      }, 150);
    } else if (faceState === "thinking") {
      interval = setInterval(() => {
        setMouthWaves([12, 28, 12, 28, 12, 28, 12]);
      }, 250);
    } else {
      setMouthWaves([12, 12, 12, 12, 12, 12, 12]);
    }
    return () => clearInterval(interval);
  }, [faceState]);

  const toggleVoiceQuietMode = () => {
    if (voiceActive) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setVoiceActive(false);
      setFaceState("idle");
    } else {
      setVoiceActive(true);
    }
  };

  const startVoiceCapture = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn("Unable to trigger mic sandbox record:", e);
      }
    }
  };

  // Colors based on state
  const getThemeColors = () => {
    switch (faceState) {
      case "listening":
        return {
          glow: "shadow-[0_0_40px_rgba(244,63,94,0.3)] border-rose-500/40 rgb",
          eye: "bg-rose-400 shadow-[0_0_15px_#f43f5e]",
          accent: "text-rose-400",
          mesh: "stroke-rose-500/20",
          core: "bg-rose-950/40 border-rose-400"
        };
      case "speaking":
        return {
          glow: "shadow-[0_0_40px_rgba(20,184,166,0.35)] border-teal-500/45",
          eye: "bg-teal-400 shadow-[0_0_15px_#14b8a6]",
          accent: "text-teal-400",
          mesh: "stroke-teal-500/25",
          core: "bg-teal-950/40 border-teal-400"
        };
      case "thinking":
        return {
          glow: "shadow-[0_0_40px_rgba(168,85,247,0.35)] border-purple-500/45 animate-pulse",
          eye: "bg-purple-400 shadow-[0_0_15px_#a855f7]",
          accent: "text-purple-400",
          mesh: "stroke-purple-500/20",
          core: "bg-purple-950/40 border-purple-400"
        };
      default:
        return {
          glow: "shadow-[0_0_45px_rgba(6,182,212,0.25)] border-cyan-500/30",
          eye: "bg-cyan-400 shadow-[0_0_15px_#06b6d4]",
          accent: "text-cyan-400",
          mesh: "stroke-cyan-500/15",
          core: "bg-slate-950 border-cyan-500/40"
        };
    }
  };

  const colors = getThemeColors();

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]" id="jarvis_cognition_face_terminal">
      {/* Dynamic 3D Matrix grid reflection inside the widget */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(6,182,212,0.15) 1px, transparent 1px)`,
          backgroundSize: '16px 16px'
        }}
      ></div>

      <div className="w-full flex items-center justify-between mb-4 border-b border-white/5 pb-2 relative z-10 font-mono">
        <div className="flex items-center gap-1.5">
          <Sparkles className={`w-4 h-4 text-cyan-400 ${faceState === 'thinking' ? 'animate-spin' : ''}`} />
          <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-widest">AGENT COGNITION GRAPH</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Output audio toggle */}
          <button
            onClick={toggleVoiceQuietMode}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              voiceActive ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-white/5 border-white/10 text-slate-500"
            }`}
            title={voiceActive ? "Mute Voice Engine" : "Unmute Voice Engine"}
          >
            {voiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          <span className={`text-[8.5px] px-1.5 py-0.5 rounded uppercase ${
            faceState === "speaking" ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" :
            faceState === "listening" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
            faceState === "thinking" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
            "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          }`}>
            {faceState}
          </span>
        </div>
      </div>

      {/* Futuristic 3D Floating Avatar Core Area */}
      <div 
        ref={faceContainerRef}
        className="w-full h-56 flex items-center justify-center relative cursor-cell z-10"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          animate={{
            rotateX: rotation.x,
            rotateY: rotation.y,
            y: [0, -6, 0]
          }}
          transition={{
            rotateX: { type: "spring", stiffness: 100, damping: 20 },
            rotateY: { type: "spring", stiffness: 100, damping: 20 },
            y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
          }}
          className={`w-44 h-44 rounded-full flex flex-col items-center justify-center relative border border-white/5 ${colors.glow} bg-slate-900/40 backdrop-blur-md transition-all duration-300 z-10`}
          id="perspective_robot_head"
        >
          {/* Cybernetic overlay geometry patterns */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
            {/* Circular radar mesh */}
            <circle cx="50" cy="50" r="46" className={`fill-none stroke-dashed ${colors.mesh}`} strokeWidth="0.5" />
            <circle cx="50" cy="50" r="41" className="fill-none stroke-cyan-500/5" strokeWidth="1" />
            <path d="M50 4 L50 96 M4 50 L96 50" className="stroke-cyan-500/5" strokeWidth="0.5" />

            {/* Angular corner ticks on robot face */}
            <path d="M 28 32 L 28 28 L 32 28" fill="none" className="stroke-white/10" strokeWidth="0.5" />
            <path d="M 72 32 L 72 28 L 68 28" fill="none" className="stroke-white/10" strokeWidth="0.5" />
            <path d="M 28 68 L 28 72 L 32 72" fill="none" className="stroke-white/10" strokeWidth="0.5" />
            <path d="M 72 68 L 72 72 L 68 72" fill="none" className="stroke-white/10" strokeWidth="0.5" />
          </svg>

          {/* Central Holographic Robotic Inner Core structure */}
          <div className="w-28 h-28 rounded-full border border-white/5 flex flex-col items-center justify-center relative bg-slate-950/80 shadow-inner">
            
            {/* Hologram rotating concentric ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="absolute inset-1.5 rounded-full border border-dashed border-cyan-500/10 pointer-events-none"
            ></motion.div>

            {/* Glowing Digital Eyes */}
            <div className="flex gap-8 mb-5 relative z-10">
              {/* Left Eye */}
              <div className="relative">
                <motion.div 
                  animate={faceState === "thinking" ? { scaleY: [1, 0.1, 1], scaleX: [1, 1.3, 1] } : { scaleY: [1, 0.1, 1] }}
                  transition={{ repeat: Infinity, duration: faceState === "thinking" ? 1.5 : 4, repeatDelay: 2 }}
                  className={`w-3.5 h-3.5 rounded-full ${colors.eye}`}
                />
                <div className="absolute inset-[-4px] rounded-full border border-cyan-400/20 animate-ping"></div>
              </div>

              {/* Right Eye */}
              <div className="relative">
                <motion.div 
                  animate={faceState === "thinking" ? { scaleY: [1, 0.1, 1], scaleX: [1, 1.3, 1] } : { scaleY: [1, 0.1, 1] }}
                  transition={{ repeat: Infinity, duration: faceState === "thinking" ? 1.5 : 4, repeatDelay: 2.3 }}
                  className={`w-3.5 h-3.5 rounded-full ${colors.eye}`}
                />
                <div className="absolute inset-[-4px] rounded-full border border-cyan-400/20 animate-ping"></div>
              </div>
            </div>

            {/* Audio waveform speaker mouth visualizer */}
            <div className="flex items-end justify-center gap-1 h-8 z-10" id="robotic_verbal_mouth">
              {mouthWaves.map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: `${h}px` }}
                  transition={{ type: "tween", duration: 0.1 }}
                  className={`w-[3px] rounded-full ${
                    faceState === "speaking" ? "bg-teal-400 shadow-[0_0_6px_#14b8a6]" : 
                    faceState === "listening" ? "bg-rose-400 shadow-[0_0_6px_#f43f5e]" :
                    faceState === "thinking" ? "bg-purple-400 shadow-[0_0_6px_#a855f7]" :
                    "bg-cyan-400/60"
                  }`}
                />
              ))}
            </div>

            {/* Nose structure indicator */}
            <div className="absolute top-[52px] w-1 h-2 bg-white/15 rounded-full pointer-events-none"></div>
          </div>
        </motion.div>
      </div>

      {/* Interaction Controls */}
      <div className="w-full flex flex-col items-center gap-3 mt-2 relative z-10 font-mono">
        
        {/* Active Command display text */}
        <div className="w-full bg-slate-950/80 rounded-xl px-3.5 py-2.5 border border-white/5 text-center min-h-[46px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {speechText ? (
              <motion.p 
                key="speech"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11px] text-teal-300 italic"
              >
                &ldquo;{speechText}&rdquo;
              </motion.p>
            ) : (
              <motion.p 
                key="idle-desc"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-slate-500 uppercase tracking-wider leading-relaxed"
              >
                {faceState === "listening" ? localizedListening[language] : "Voice automated pilot idle. Press record to speak."}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Real Mic dispatch activation btn */}
        {isRecognitionSupported ? (
          <button
            onClick={startVoiceCapture}
            className={`cursor-pointer px-5 py-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2 transition-all duration-300 active:scale-95 text-xs font-mono shadow-md ${
              isListening 
                ? "bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 animate-pulse" 
                : "bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40"
            }`}
            id="mic_activation_btn"
          >
            <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce' : ''}`} />
            <span>{isListening ? "RECORDING: SPEAK..." : "ACTIVATE VOICE CONTROLLER"}</span>
          </button>
        ) : (
          <div className="text-[10px] text-slate-500 text-center uppercase tracking-wide bg-white/5 px-2.5 py-1.5 border border-white/5 rounded-xl">
            Speech Recognition sandbox blocked or unsupported
          </div>
        )}

        {/* Manual Test Greeting Launcher to bypass mic queries easily */}
        <div className="w-full flex gap-2">
          <button
            onClick={() => speakText(localizedGreets[language])}
            className="flex-1 cursor-pointer py-1.5 rounded-lg border border-white/5 hover:border-cyan-500/20 text-[9.5px] text-slate-400 hover:text-cyan-400 transition-colors text-center uppercase"
          >
            🔊 GREET AGENT AGAIN
          </button>
          
          <button
            onClick={() => {
              speakText("Cognitive routing active. Initiating automatic setup. Dispatching WhatsApp package and playing track.");
              setTimeout(() => {
                onCommandTriggered("play soft song and send whatsapp");
              }, 3000);
            }}
            className="flex-1 cursor-pointer py-1.5 rounded-lg border border-pink-500/10 hover:border-pink-500/30 text-[9.5px] text-pink-400 hover:bg-pink-500/5 transition-colors text-center uppercase font-bold"
          >
            ⚡ AUTO TRIGGER SCENERIO
          </button>
        </div>

      </div>
    </div>
  );
};
