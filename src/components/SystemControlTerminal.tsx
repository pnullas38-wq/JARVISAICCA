import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Volume2, Send, AlertTriangle, Power, CornerDownLeft, MessageSquare, Terminal, Eye, Sparkles } from "lucide-react";

interface SystemControlTerminalProps {
  onShutdown: () => void;
  onRestart: () => void;
  langStrings: any;
  showYoutubeModal?: boolean;
  setShowYoutubeModal?: (val: boolean) => void;
  showWhatsappModal?: boolean;
  setShowWhatsappModal?: (val: boolean) => void;
  whatsappText?: string;
  setWhatsappText?: (val: string) => void;
  whatsappPhone?: string;
  setWhatsappPhone?: (val: string) => void;
  consoleLogs?: string[];
  setConsoleLogs?: React.Dispatch<React.SetStateAction<string[]>>;
  onCommandTriggered?: (val: string) => void;
}

export const SystemControlTerminal: React.FC<SystemControlTerminalProps> = ({ 
  onShutdown, 
  onRestart, 
  langStrings,
  showYoutubeModal,
  setShowYoutubeModal,
  showWhatsappModal,
  setShowWhatsappModal,
  whatsappText,
  setWhatsappText,
  whatsappPhone,
  setWhatsappPhone,
  consoleLogs,
  setConsoleLogs,
  onCommandTriggered
}) => {
  const [commandInput, setCommandInput] = useState("");
  
  // Resilient fallback state machines
  const [localConsoleLogs, setLocalConsoleLogs] = useState<string[]>(["SYSTEM: Automation control terminal open.", "Ready for command dispatch..."]);
  const activeConsoleLogs = consoleLogs !== undefined ? consoleLogs : localConsoleLogs;
  const activeSetConsoleLogs = setConsoleLogs !== undefined ? setConsoleLogs : setLocalConsoleLogs;

  const [localShowYoutubeModal, setLocalShowYoutubeModal] = useState(false);
  const activeShowYoutubeModal = showYoutubeModal !== undefined ? showYoutubeModal : localShowYoutubeModal;
  const activeSetShowYoutubeModal = setShowYoutubeModal !== undefined ? setShowYoutubeModal : setLocalShowYoutubeModal;

  const [localShowWhatsappModal, setLocalShowWhatsappModal] = useState(false);
  const activeShowWhatsappModal = showWhatsappModal !== undefined ? showWhatsappModal : localShowWhatsappModal;
  const activeSetShowWhatsappModal = setShowWhatsappModal !== undefined ? setShowWhatsappModal : setLocalShowWhatsappModal;

  const [localWhatsappText, setLocalWhatsappText] = useState("Hello Ullas! JARVIS X core systems are fully online and synced.");
  const activeWhatsappText = whatsappText !== undefined ? whatsappText : localWhatsappText;
  const activeSetWhatsappText = setWhatsappText !== undefined ? setWhatsappText : setLocalWhatsappText;

  const [localWhatsappPhone, setLocalWhatsappPhone] = useState("");
  const activeWhatsappPhone = whatsappPhone !== undefined ? whatsappPhone : localWhatsappPhone;
  const activeSetWhatsappPhone = setWhatsappPhone !== undefined ? setWhatsappPhone : setLocalWhatsappPhone;
  
  // Audio oscillator response helper
  const playSiren = (freq1: number, freq2: number, duration = 0.5) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq1, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(freq2, audioCtx.currentTime + duration);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.toLowerCase();
    activeSetConsoleLogs(prev => [...prev, `> ${commandInput}`]);
    
    if (cmd.includes("youtube") || cmd.includes("song") || cmd.includes("play")) {
      activeSetConsoleLogs(prev => [...prev, "SUCCESS: MATCHED AUTOMATION RULE 'OPEN_YOUTUBE'", "Delegating to centralized media automator..."]);
      if (onCommandTriggered) {
        onCommandTriggered(commandInput);
      } else {
        activeSetShowYoutubeModal(true);
      }
      playSiren(500, 1000, 0.4);
    } else if (cmd.includes("whatsapp") || cmd.includes("whatsapp message") || cmd.includes("message")) {
      activeSetConsoleLogs(prev => [...prev, "SUCCESS: MATCHED AUTOMATION RULE 'WHATSAPP_DISPATCH'", "Opening WhatsApp dispatch context..."]);
      activeSetShowWhatsappModal(true);
      playSiren(300, 600, 0.3);
    } else if (cmd.includes("shutdown") || cmd.includes("off")) {
      activeSetConsoleLogs(prev => [...prev, "CRITICAL WARNING: INITIALIZING SHUTDOWN PARADIGMS."]);
      playSiren(800, 200, 0.8);
      setTimeout(() => {
        onShutdown();
      }, 800);
    } else if (cmd.includes("restart") || cmd.includes("boot")) {
      activeSetConsoleLogs(prev => [...prev, "WARNING: INITIALIZING RESTART FLIGHT PARAMETERS."]);
      playSiren(600, 900, 0.8);
      setTimeout(() => {
        onRestart();
      }, 800);
    } else {
      activeSetConsoleLogs(prev => [...prev, `ERROR: Command '${commandInput}' not matching native hardware protocols. Try 'play song', 'whatsapp Ullas', or 'shutdown'.`]);
      playSiren(200, 100, 0.2);
    }
    
    setCommandInput("");
  };

  const triggerRealWhatsAppRedirect = () => {
    // Encodes parameters into wa.me schema. Fully compliant real-world workspace link!
    const waUrl = `https://wa.me/${activeWhatsappPhone ? activeWhatsappPhone.replace(/\D/g, '') : ""}?text=${encodeURIComponent(activeWhatsappText)}`;
    window.open(waUrl, "_blank");
    activeSetConsoleLogs(prev => [...prev, `SUCCESS: Dispatched packet containing Wa.me redirects.`]);
    activeSetShowWhatsappModal(false);
  };

  return (
    <div className="bg-[#0b1022] border border-cyan-500/25 rounded-2xl p-5 shadow-lg flex flex-col justify-between" id="automation_control_dock">
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-pink-400 animate-pulse" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">{langStrings.terminalTitle}</h3>
          </div>
          <span className="text-[10px] text-pink-400 font-mono tracking-widest uppercase bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
            AUTO CONTROL ON
          </span>
        </div>

        {/* Hot Actions Quick Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-4 font-mono text-[11px]">
          <button
            onClick={() => {
              activeSetShowYoutubeModal(true);
              activeSetConsoleLogs(prev => [...prev, "TRIGGER: Quick dispatch -> play Youtube song"]);
              playSiren(500, 800, 0.3);
            }}
            className="p-3 bg-slate-900 border border-white/5 hover:border-red-500/40 rounded-xl text-left cursor-pointer transition-all group flex flex-col gap-1 text-[11px] font-mono hover:bg-slate-800"
            id="term_btn_youtube"
          >
            <span className="text-red-400 font-bold">🤖 PLAY SONG DECK</span>
            <span className="text-slate-400 text-[10px] leading-tight">Simulates YouTube streaming</span>
          </button>

          <button
            onClick={() => {
              activeSetShowWhatsappModal(true);
              activeSetConsoleLogs(prev => [...prev, "TRIGGER: Quick dispatch -> message client WhatsApp"]);
              playSiren(400, 700, 0.3);
            }}
            className="p-3 bg-slate-900 border border-white/5 hover:border-emerald-500/40 rounded-xl text-left cursor-pointer transition-all group flex flex-col gap-1 text-[11px] font-mono hover:bg-slate-800"
            id="term_btn_whatsapp"
          >
            <span className="text-emerald-400 font-bold">💬 WHATSAPP DISPATCH</span>
            <span className="text-slate-400 text-[10px] leading-tight font-sans">Dispatch message via WA Link</span>
          </button>

          <button
            onClick={() => {
              playSiren(800, 200, 0.8);
              activeSetConsoleLogs(prev => [...prev, "TRIGGER: Quick dispatch -> Shutdown laptop"]);
              setTimeout(() => onShutdown(), 1000);
            }}
            className="p-3 bg-slate-900 border border-white/5 hover:border-pink-500/40 rounded-xl text-left cursor-pointer transition-all group flex flex-col gap-1 text-[11px] font-mono hover:bg-slate-800"
            id="term_btn_shutdown"
          >
            <span className="text-pink-400 font-bold">⚡ SHUTDOWN LAPTOP</span>
            <span className="text-slate-400 text-[10px] leading-tight">Emergency secure OS override</span>
          </button>

          <button
            onClick={() => {
              playSiren(600, 900, 0.8);
              activeSetConsoleLogs(prev => [...prev, "TRIGGER: Quick dispatch -> Restart laptop"]);
              setTimeout(() => onRestart(), 1000);
            }}
            className="p-3 bg-slate-900 border border-white/5 hover:border-blue-500/40 rounded-xl text-left cursor-pointer transition-all group flex flex-col gap-1 text-[11px] font-mono hover:bg-slate-800"
            id="term_btn_restart"
          >
            <span className="text-blue-400 font-bold">🌀 RESTART SYS OS</span>
            <span className="text-slate-400 text-[10px] leading-tight font-sans">Cold-reboot kernel caches</span>
          </button>
        </div>

        {/* Console display */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-white/5 space-y-1 font-mono text-[10.5px] text-slate-400 max-h-32 overflow-y-auto mb-4 scrollbar-thin">
          {activeConsoleLogs.map((log, index) => (
            <p key={index} className={log.startsWith(">") ? "text-cyan-400 font-semibold" : log.startsWith("ERROR") ? "text-red-400" : log.startsWith("SUCCESS") ? "text-emerald-400" : ""}>
              {log}
            </p>
          ))}
        </div>
      </div>

      {/* Manual command submit form */}
      <form onSubmit={handleCommandSubmit} className="flex gap-2" id="cmd_bar_form">
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Type 'shutdown', 'play song', or 'whatsapp'..."
          className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-hidden focus:border-pink-500/40 font-mono"
          id="cmd_bar_input"
        />
        <button
          type="submit"
          className="bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-500/40 rounded-xl text-xs font-mono font-bold flex items-center justify-center p-2 cursor-pointer"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </form>

      {/* MODAL: YOUTUBE MUSIC MODAL DECK */}
      <AnimatePresence>
        {activeShowYoutubeModal && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0e1628] border border-red-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 font-mono">
                  <Play className="w-5 h-5 text-red-500 animate-pulse fill-current" />
                  <span className="text-sm font-bold text-white text-uppercase">JARVIS AUTOMATION: YOUTUBE MEDIA PLAYER</span>
                </div>
                <button
                  onClick={() => activeSetShowYoutubeModal(false)}
                  className="text-slate-400 hover:text-white font-bold font-mono text-xs cursor-pointer"
                >
                  ✕ CLOSE
                </button>
              </div>

              {/* Procedural Visualizer wave animation */}
              <div className="bg-slate-950 h-52 rounded-xl flex items-center justify-center relative overflow-hidden mb-4 border border-white/5">
                <div className="absolute inset-0 bg-radial-gradient opacity-10"></div>
                
                {/* Simulated equalizer sound bar columns */}
                <div className="flex items-end gap-1.5 h-32 relative z-10 p-5">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ["15px", "85px", "20px", "110px", "15px"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1 + Math.random() * 0.8,
                        ease: "easeInOut",
                        delay: i * 0.1
                      }}
                      className="w-2.5 rounded-full bg-gradient-to-t from-red-600 via-pink-500 to-indigo-500"
                    ></motion.div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/85 p-3 rounded-lg border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Lofi Cyber-Atmosphere Theme</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Stream decoded • Playing song live inside workspace sandbox</p>
                  </div>
                  <Volume2 className="w-5 h-5 text-red-400 animate-bounce" />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>Decrypted Youtube Stream Proxy</span>
                <button 
                  onClick={() => {
                    window.open("https://youtube.com", "_blank");
                    activeSetShowYoutubeModal(false);
                  }}
                  className="text-red-400 hover:text-red-300 font-bold active:scale-95 text-xs cursor-pointer"
                >
                  OPEN NATIVE YOUTUBE 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: WHATSAPP DISPATCH MODAL */}
      <AnimatePresence>
        {activeShowWhatsappModal && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0e1628] border border-emerald-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative font-mono"
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <span className="text-sm font-bold text-white uppercase">WhatsApp Integration Hub</span>
                </div>
                <button
                  onClick={() => activeSetShowWhatsappModal(false)}
                  className="text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
                >
                  ✕ CANCEL
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase text-slate-400 mb-1.5 font-semibold">Recipient Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="e.g., +919876543210 (Country code included, no spaces)"
                    value={activeWhatsappPhone}
                    onChange={(e) => activeSetWhatsappPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 focus:border-emerald-500/50 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                    id="wa_phone_input"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Leave empty to select contact natively on WhatsApp Web.</span>
                </div>

                <div>
                  <label className="block text-[11px] uppercase text-slate-400 mb-1.5 font-semibold">Message Body Payload</label>
                  <textarea
                    rows={4}
                    value={activeWhatsappText}
                    onChange={(e) => activeSetWhatsappText(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-100"
                    id="wa_text_input"
                  />
                </div>

                <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-[10.5px] text-emerald-400 leading-normal">
                  💡 This action launches a genuine external API communication pathway to synchronize messages directly over official WhatsApp routes.
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => activeSetShowWhatsappModal(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                  >
                    ABORT
                  </button>
                  <button
                    onClick={triggerRealWhatsAppRedirect}
                    className="px-5 py-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    id="wa_submit_btn"
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
    </div>
  );
};
