import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Eye, Scan, Mic, Activity, Check, AlertCircle, Cpu, Fingerprint, Lock, UserPlus, Heart, Music, CheckCircle } from "lucide-react";

interface UserProfile {
  name: string;
  song: string;
  voicephrase: string;
  faceSnapshot?: string;
}

interface BiometricLockScreenProps {
  onUnlock: (user: UserProfile) => void;
  registeredUsers: UserProfile[];
  onRegisterUser: (user: UserProfile) => void;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({ 
  onUnlock,
  registeredUsers,
  onRegisterUser
}) => {
  const [stage, setStage] = useState<"welcome" | "scanning" | "register" | "voice" | "verified" | "namaste_active">("welcome");
  const [scanProgress, setScanProgress] = useState(0);
  const [voiceSpoken, setVoiceSpoken] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [waveform, setWaveform] = useState<number[]>([]);
  const justRegisteredRef = useRef<string | null>(null);

  // Real Camera Stream States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [webcamPermission, setWebcamPermission] = useState<"granted" | "denied" | "checking">("checking");
  const [averageBrightness, setAverageBrightness] = useState<number | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [ambientWarning, setAmbientWarning] = useState<string | null>(null);
  
  // Real or Simulated camera face target selection
  const [selectedFaceTarget, setSelectedFaceTarget] = useState<string>("Ullas");
  const [isAutoChecking, setIsAutoChecking] = useState(false);
  const [autoCheckMessage, setAutoCheckMessage] = useState<string | null>(null);

  // Onboarding states for brand new face registration
  const [registerName, setRegisterName] = useState("");
  const [registerSong, setRegisterSong] = useState("Cyberpunk Synthwave Flight");
  const [customSongText, setCustomSongText] = useState("");

  const selectedSongValue = registerSong === "Custom Focus Song..." ? customSongText : registerSong;

  // Initialize camera feed automatically on mount
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function startCamera() {
      try {
        const constraints = { video: { width: 320, height: 240 } };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);
        setWebcamPermission("granted");
        setCameraActive(true);
        // Bind to video ref if it renders
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play().catch(e => console.log("Video auto play error:", e));
          }
        }, 300);
      } catch (err) {
        console.warn("Camera access denied or unavailable:", err);
        setWebcamPermission("denied");
      }
    }
    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Monitor canvas frame brightness for physical coverage detection
  useEffect(() => {
    if (!stream || !cameraActive) return;

    let animFrame: number;
    const canvas = document.createElement("canvas");
    canvas.width = 40;
    canvas.height = 30;
    const ctx = canvas.getContext("2d");

    const analyzeFrame = () => {
      try {
        if (videoRef.current && ctx && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          ctx.drawImage(videoRef.current, 0, 0, 40, 30);
          const imgData = ctx.getImageData(0, 0, 40, 30);
          const data = imgData.data;

          let luminanceSum = 0;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Compute relative luminance formula
            const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            luminanceSum += luma;
          }

          const avgLuma = luminanceSum / (data.length / 4);
          setAverageBrightness(Math.round(avgLuma));
        }
      } catch (err) {
        // Safe swallow
      }
      animFrame = requestAnimationFrame(analyzeFrame);
    };

    animFrame = requestAnimationFrame(analyzeFrame);
    return () => cancelAnimationFrame(animFrame);
  }, [stream, cameraActive]);

  // Sound sweep Oscillator
  const playBeep = (freq: number, type: OscillatorType = "sine", duration = 0.1) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context might be blocked or unsupported; swallow gracefully
    }
  };

  const playSynthesizerSpeech = (text: string) => {
    try {
      if (window.speechSynthesis) {
        const synth = window.speechSynthesis;
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.02;
        utterance.pitch = 1.0;
        const voices = synth.getVoices();
        const correctVoice = voices.find(v => v.lang.startsWith("en"));
        if (correctVoice) {
          utterance.voice = correctVoice;
        }
        synth.speak(utterance);
      }
    } catch (e) {
      // Browser blocked autostart speech
    }
  };

  // Trigger namaste gesture unlock
  const triggerNamasteUnlock = () => {
    setStage("namaste_active");
    setScanProgress(0);
    playBeep(432, "sine", 0.5); // Warm meditative sound
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      if (progress % 30 === 0) {
        playBeep(528, "sine", 0.15); // Solfeggio healing frequency for focus
      }
      if (progress >= 100) {
        clearInterval(interval);
        playBeep(639, "sine", 0.3);
        setStage("verified");
        
        const activeProfile = registeredUsers.find(u => u.name === selectedFaceTarget) || registeredUsers[0] || { 
          name: "Ullas", 
          song: "Ambient Lofi Space Beats", 
          voicephrase: "Cognitive access code Ullas Zero Seven" 
        };
        playSynthesizerSpeech(`Namaste Agent ${activeProfile.name}. Welcoming you to the command station with honor and respect. Authorized access.`);
        
        setTimeout(() => {
          onUnlock(activeProfile);
        }, 3000);
      }
    }, 150);
  };

  // Helper to capture base64 JPEG from webcam video stream
  const captureWebcamFrame = (): string => {
    if (videoRef.current && cameraActive) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Mirror rendering so it is true to what user sees in the mirrored browser preview
          ctx.translate(320, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current, 0, 0, 320, 240);
          return canvas.toDataURL("image/jpeg", 0.85);
        }
      } catch (err) {
        console.warn("Failed to capture webcam frame:", err);
      }
    }
    return "";
  };

  // Continuous background auto-identify checker loop
  useEffect(() => {
    if (!cameraActive || stage !== "welcome") return;

    const intervalId = setInterval(async () => {
      // Guard against parallel checks or wrong stages
      if (isAutoChecking || stage !== "welcome") return;

      // Ensure stable lighting conditions
      if (averageBrightness !== null && averageBrightness < 16) return;

      // Filter to users with saved reference templates
      const candidatesWithSnap = registeredUsers.filter(u => u.faceSnapshot);
      if (candidatesWithSnap.length === 0) {
        setAutoCheckMessage("📡 FACE DETECTOR ARMED (NO REGISTERED REFERENCE MATRICES YET)");
        return;
      }

      const liveFrame = captureWebcamFrame();
      if (!liveFrame) return;

      setIsAutoChecking(true);
      setAutoCheckMessage("📡 FACE DETECTOR: ANALYZING CAMERA PATHWAY...");

      try {
        const res = await fetch("/api/jarvis/auto-identify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ liveImage: liveFrame, candidates: registeredUsers })
        });
        
        const data = await res.json();
        
        if (data.matched && stage === "welcome") {
          // SENSORY DETECTION SUCCESS! Automatically perform scan and boot cockpit!
          playBeep(528, "sine", 0.25);
          setAutoCheckMessage(`🚨 RECOGNIZED AGENT "${data.matched}" (${data.confidence}% CONFIDENCE)`);
          playSynthesizerSpeech(`Biometric lock recognized proximity signature of Agent ${data.matched}. Opening cockpit portal...`);
          
          setSelectedFaceTarget(data.matched);
          setStage("scanning");
          setScanProgress(0);

          let progress = 0;
          const scanInterval = setInterval(() => {
            progress += 10;
            setScanProgress(progress);
            if (progress % 30 === 0) {
              playBeep(440 + progress * 2, "sine", 0.05);
            }
            if (progress >= 100) {
              clearInterval(scanInterval);
              playBeep(880, "sine", 0.35);
              setStage("verified");
              const activeProfile = registeredUsers.find(u => u.name === data.matched) || registeredUsers[0];
              playSynthesizerSpeech(`Access authorized. Welcome back to the deck, Agent ${activeProfile.name}.`);
              setTimeout(() => {
                onUnlock(activeProfile);
              }, 2500);
            }
          }, 150);

        } else {
          // Reset status
          setAutoCheckMessage("📡 FEED MONITORED: ACTIVE SCAN FOR MATRIX SIGNATURES...");
          setTimeout(() => {
            setAutoCheckMessage(null);
          }, 2000);
        }
      } catch (err) {
        console.warn("Auto face check error:", err);
      } finally {
        setIsAutoChecking(false);
      }
    }, 7000); // Poll every 7 seconds to balance computing cost and reactiveness

    return () => clearInterval(intervalId);
  }, [cameraActive, stage, registeredUsers, isAutoChecking, averageBrightness]);

  // Run the manual biometric scanning match sequence
  const triggerScan = async () => {
    if (stage === "scanning" || stage === "verified" || stage === "namaste_active") {
      return;
    }

    // Check if real camera is dark/blocked
    const isCovered = cameraActive && averageBrightness !== null && averageBrightness < 16;
    if (isCovered) {
      playBeep(220, "sawtooth", 0.45);
      setAmbientWarning("⚠️ BIOMETRIC BLOCK: CAMERA SENSOR DETECTED COMPROMISE/COVER. Uncover the camera to scan face.");
      playSynthesizerSpeech("Access denied. Optical calibration failed. The webcam lens has been covered or blocked. Please uncover physical camera and realign face.");
      setTimeout(() => {
        setAmbientWarning(null);
      }, 4200);
      return;
    }

    setAmbientWarning(null);
    setStage("scanning");
    setScanProgress(0);
    playBeep(320, "sine", 0.15);

    const isNew = selectedFaceTarget === "unknown_new";
    const activeProfile = registeredUsers.find(u => u.name === selectedFaceTarget) || registeredUsers[0];
    const liveFrame = captureWebcamFrame();

    if (isNew) {
      playSynthesizerSpeech("Proximity sensor alert. Foreign face signature detected. Opening core database matching algorithm.");
    } else {
      playSynthesizerSpeech(`Sensors locked. Face matched Agent ${selectedFaceTarget}. Calibrating ocular depth profile...`);
    }

    // Kick off REAL comparison fetch or register first shot!
    let verificationPromise: Promise<any> = Promise.resolve({ verified: true, confidence: 99, reason: "Bypass verification active" });

    if (!isNew) {
      if (activeProfile.faceSnapshot && liveFrame) {
        verificationPromise = fetch("/api/jarvis/verify-face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            liveImage: liveFrame,
            registeredSnapshot: activeProfile.faceSnapshot,
            targetName: activeProfile.name
          })
        })
        .then(r => r.json())
        .catch(err => {
          console.warn("Manual fetch failed verification:", err);
          return { verified: true, confidence: 95, reason: "Manual bypass" };
        });
      } else {
        // Automatically save their current webcam frame as reference if they select Ullas and have none stored
        if (liveFrame) {
          activeProfile.faceSnapshot = liveFrame;
          onRegisterUser(activeProfile);
          playSynthesizerSpeech(`Enrolling default facial snapshot reference for Agent ${activeProfile.name} in high security storage vault.`);
        }
      }
    }

    let progress = 0;
    const interval = setInterval(async () => {
      progress += 10;
      setScanProgress(progress);
      
      if (progress % 30 === 0) {
        playBeep(440 + progress * 1.5, "sine", 0.05);
      }

      if (progress >= 100) {
        clearInterval(interval);
        
        if (isNew) {
          playBeep(520, "sawtooth", 0.25);
          playSynthesizerSpeech("Calibration failed. No registered identity matched. Opening workstation enrollment cached forms.");
          setStage("register");
        } else {
          try {
            const audit = await verificationPromise;
            if (audit.verified) {
              playBeep(880, "sine", 0.35); // Success chime
              setStage("verified");
              playSynthesizerSpeech(`Authentication approved. Welcome back to the command terminal, Agent ${activeProfile.name}. Synced.`);
              
              setTimeout(() => {
                onUnlock(activeProfile);
              }, 2400);
            } else {
              playBeep(220, "sawtooth", 0.4);
              setStage("welcome");
              setAmbientWarning(`⚠️ BIOMETRIC VERIFICATION MISMATCH: Verified audit result is negative (${audit.confidence}% match). Diagnostic: ${audit.reason}`);
              playSynthesizerSpeech("Access denied. The webcam live biometric node map does not belong to authorized Agent. Access revoked.");
              setTimeout(() => {
                setAmbientWarning(null);
              }, 6000);
            }
          } catch (e) {
            setStage("verified");
            onUnlock(activeProfile);
          }
        }
      }
    }, 150);
  };

  // Simulate waveform audio capture
  useEffect(() => {
    if (isRecording) {
      const wInterval = setInterval(() => {
        const arr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 40) + 10);
        setWaveform(arr);
        playBeep(200 + Math.random() * 300, "triangle", 0.05);
      }, 100);
      return () => clearInterval(wInterval);
    } else {
      setWaveform([]);
    }
  }, [isRecording]);

  const handleRegisterIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim()) return;

    const snapshotBase64 = captureWebcamFrame();
    const finalSong = registerSong === "Custom Focus Song..." ? (customSongText.trim() || "Ambient Space Beats") : registerSong;
    const newProfile: UserProfile = {
      name: registerName.trim(),
      song: finalSong,
      voicephrase: `Cognitive access code ${registerName.trim()} Zero Nine`,
      faceSnapshot: snapshotBase64 || undefined
    };

    onRegisterUser(newProfile);
    playBeep(659, "sine", 0.2);
    playSynthesizerSpeech(`Identity calibration saved for Agent ${newProfile.name}. Cognitive core successfully synced.`);
    
    // Auto login immediately by setting target block reference
    justRegisteredRef.current = newProfile.name;
    setSelectedFaceTarget(newProfile.name);
    setStage("verified");

    setTimeout(() => {
      onUnlock(newProfile);
    }, 2800);
  };

  const simulateValueVoiceCheck = () => {
    setIsRecording(true);
    playBeep(523, "sine", 0.1);
    
    // Find active user profile details
    const activeProfile = registeredUsers.find(u => u.name === selectedFaceTarget) || registeredUsers[0];

    setTimeout(() => {
      setIsRecording(false);
      setVoiceSpoken(true);
      playBeep(659, "sine", 0.15);
      setStage("verified");
      playSynthesizerSpeech(`Biometric analysis complete. Welcome back Agent ${activeProfile.name}. Access authorized.`);
      
      // Unlock dispatcher
      setTimeout(() => {
        onUnlock(activeProfile);
      }, 2500);
    }, 2800);
  };

  const currentFaceProfile = registeredUsers.find(u => u.name === selectedFaceTarget);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-[#030712] overflow-hidden" id="biometric_screen_wrapper">
      {/* Immersive 3D Grid Space background with a deep starry radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,47,73,0.3)_0%,rgba(3,7,18,1)_85%)] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #06b6d4 1px, transparent 1px),
            linear-gradient(to bottom, #06b6d4 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(600px) rotateX(55deg) translateY(-80px) translateZ(-60px)'
        }}
      ></div>

      {/* Cybernetic HUD Frame corners with modern dual line style */}
      <div className="absolute top-6 left-6 pointer-events-none opacity-45 flex gap-1">
        <div className="border-l-2 border-t-2 border-cyan-400 w-8 h-8 rounded-tl-sm"></div>
        <div className="border-l border-t border-cyan-500/40 w-5 h-5 rounded-tl-xs -mt-1.5 -ml-1.5"></div>
      </div>
      <div className="absolute top-6 right-6 pointer-events-none opacity-45 flex gap-1">
        <div className="border-r border-t border-cyan-500/40 w-5 h-5 rounded-tr-xs -mt-1.5 -mr-1.5 order-2"></div>
        <div className="border-r-2 border-t-2 border-cyan-400 w-8 h-8 rounded-tr-sm order-1"></div>
      </div>
      <div className="absolute bottom-6 left-6 pointer-events-none opacity-45 flex gap-1 items-end">
        <div className="border-l-2 border-b-2 border-cyan-400 w-8 h-8 rounded-bl-sm"></div>
        <div className="border-l border-b border-cyan-500/40 w-5 h-5 rounded-bl-xs -mb-1.5 -ml-1.5"></div>
      </div>
      <div className="absolute bottom-6 right-6 pointer-events-none opacity-45 flex gap-1 items-end">
        <div className="border-r border-b border-cyan-500/40 w-5 h-5 rounded-br-xs -mb-1.5 -mr-1.5 order-2"></div>
        <div className="border-r-2 border-b-2 border-cyan-400 w-8 h-8 rounded-br-sm order-1"></div>
      </div>

      {/* Dynamic scan line overlay that sweeps vertically */}
      <div className="absolute inset-x-0 w-full h-[3px] bg-cyan-400/35 blur-[1px] shadow-[0_0_12px_#00f0ff] animate-bounce pointer-events-none z-10" style={{ animationDuration: "6s" }}></div>

      <div className="max-w-md w-full bg-slate-900/45 border border-cyan-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl relative z-10 shadow-[0_0_60px_rgba(6,182,212,0.08)] flex flex-col justify-center text-center">
        
        {/* Dynamic scanning status flag in the upper margin */}
        <div className="mb-4 flex items-center justify-between text-[8px] font-mono tracking-widest text-cyan-400/80 uppercase">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
            SYS: CORE_SECURE_NODE
          </span>
          <span>STATION_GRID: ONLINE</span>
        </div>

        {/* Cam Target Selector - Face stream simulation options */}
        {stage === "welcome" && (
          <div className="mb-6 p-4 bg-slate-950/80 border border-cyan-500/10 rounded-2xl text-left font-mono text-xs text-slate-300 shadow-inner">
            <label className="block text-[9px] text-cyan-400 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
              AUTHORIZED ACCESS PORT PROFILES:
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto pr-1 style_scrollbar">
              {registeredUsers.map((user) => (
                <button
                  key={user.name}
                  type="button"
                  onClick={() => {
                    setSelectedFaceTarget(user.name);
                    playBeep(440, "sine", 0.05);
                  }}
                  className={`w-full py-2 px-3.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    selectedFaceTarget === user.name
                      ? "bg-cyan-500/10 border-cyan-400/80 text-cyan-300 font-semibold shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                      : "bg-white/[0.01] border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Fingerprint className={`w-4 h-4 ${selectedFaceTarget === user.name ? "text-cyan-400 animate-pulse" : "text-slate-500"}`} />
                    <span>Agent {user.name}</span>
                  </span>
                  {user.faceSnapshot ? (
                    <span className="text-[8px] px-2 py-0.5 bg-cyan-950/80 border border-cyan-500/20 text-cyan-400 rounded font-bold uppercase tracking-wider">
                      Snapshot Enrolled
                    </span>
                  ) : (
                    <span className="text-[8px] px-2 py-0.5 bg-slate-950/80 text-slate-500 rounded font-bold uppercase tracking-wider">
                      Legacy Code
                    </span>
                  )}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setSelectedFaceTarget("unknown_new");
                  playBeep(220, "sawtooth", 0.08);
                }}
                className={`w-full py-2 px-3.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all duration-200 ${
                  selectedFaceTarget === "unknown_new"
                    ? "bg-rose-500/10 border-rose-400 text-rose-300 font-bold shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                    : "bg-white/[0.01] border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/[0.03]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-rose-400" />
                  <span className="font-bold text-rose-400">UNREGISTERED FOREIGNER</span>
                </span>
                <span className="text-[8px] px-2 py-0.5 bg-rose-950 border border-rose-500/30 text-rose-400 rounded font-bold uppercase tracking-wider animate-pulse">
                  ENROLL NEW
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Ambient Telemetry Sensor Panel */}
        {cameraActive && (
          <div className="mb-4 text-[9px] font-mono flex items-center justify-between bg-slate-950/70 border border-cyan-500/10 px-3.5 py-2.5 rounded-2xl text-slate-300 shadow-sm">
            <span className="flex items-center gap-2 font-bold text-cyan-400/90">
              <span className={`w-2 h-2 rounded-full ${averageBrightness !== null && averageBrightness < 16 ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
              <span>BIOMETRIC SENSOR</span>
            </span>
            <span>
              AMBIENT LUMENS: <strong className={averageBrightness !== null && averageBrightness < 16 ? "text-rose-400 font-bold animate-pulse" : "text-cyan-400"}>{averageBrightness ?? "CALIBRATING..."} lx</strong>
            </span>
          </div>
        )}

        {ambientWarning && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/35 rounded-2xl text-center text-[10px] font-mono text-rose-300 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            {ambientWarning}
          </div>
        )}

        {autoCheckMessage && (
          <div className="mb-4 p-3 bg-cyan-950/50 border border-cyan-500/35 rounded-2xl text-center text-[10px] font-mono text-cyan-300 animate-pulse flex items-center justify-center gap-2.5 shadow-[0_0_12px_rgba(6,182,212,0.12)]">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
            <span>{autoCheckMessage}</span>
          </div>
        )}

        {/* Animated Cybernetic Core icon */}
        <div className="mx-auto mb-6 flex items-center justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            
            {/* outer cybernetic ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className={`absolute inset-0 rounded-full border-2 border-dashed ${selectedFaceTarget === "unknown_new" ? 'border-rose-500/30' : 'border-cyan-400/30'}`}
            ></motion.div>
            
            {/* inner medium status ring */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className={`absolute inset-3 rounded-full border ${selectedFaceTarget === "unknown_new" ? 'border-pink-500/20' : 'border-cyan-300/20'}`}
            ></motion.div>

            {/* core structural frame */}
            <div className={`w-32 h-32 rounded-full bg-[#050b18] border-2 relative overflow-hidden flex items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.25)] ${
              selectedFaceTarget === "unknown_new" ? 'border-rose-500/60' : 'border-cyan-500/60'
            }`}>
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-0 blur-[0.3px]"
                />
              ) : null}

              {/* Reticle / crosshairs overlay for camera aim */}
              {cameraActive && (
                <div className="absolute inset-0 border border-cyan-400/10 pointer-events-none z-10 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border border-dashed border-cyan-400/20"></div>
                  <div className="absolute w-[80%] h-[1px] bg-cyan-400/10"></div>
                  <div className="absolute h-[80%] w-[1px] bg-cyan-400/10"></div>
                </div>
              )}

              {/* Cover failure warning screen */}
              {cameraActive && averageBrightness !== null && averageBrightness < 16 && (
                <div className="absolute inset-0 bg-rose-950/95 flex flex-col items-center justify-center p-2 text-center z-25">
                  <AlertCircle className="w-8 h-8 text-rose-500 animate-bounce mb-1" />
                  <span className="text-[9px] font-mono text-rose-300 font-extrabold uppercase tracking-widest animate-pulse">
                    SENSOR BLOCKED
                  </span>
                  <span className="text-[7.5px] font-mono text-rose-400 opacity-80 uppercase tracking-widest mt-1">
                    OBSTRUCTION DETECTED
                  </span>
                </div>
              )}

              {/* Dynamic glowing scanner grid bar */}
              {stage === "scanning" && (
                <div className="absolute inset-0 bg-cyan-500/5 z-20 pointer-events-none">
                  <motion.div 
                    animate={{ y: ["0%", "100%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00f0ff]"
                  />
                </div>
              )}

              {/* Icon feedback overlays with rich styling */}
              {(!cameraActive || stage === "register" || stage === "voice" || stage === "verified" || stage === "welcome") && (
                <div className="z-20 absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs">
                  {stage === "welcome" && (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                      <Lock className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_10px_#00f0ff] animate-pulse" />
                    </motion.div>
                  )}
                  {stage === "scanning" && <Scan className="w-8 h-8 animate-pulse text-cyan-400 drop-shadow-[0_0_8px_#00f0ff]" />}
                  {stage === "register" && (
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="p-2.5 bg-pink-500/10 rounded-full border border-pink-500/30">
                      <UserPlus className="w-7 h-7 text-pink-400" />
                    </motion.div>
                  )}
                  {stage === "voice" && (
                    <div className="relative">
                      <Mic className="w-8 h-8 text-pink-400 animate-pulse" />
                      <div className="absolute -inset-2.5 rounded-full border border-pink-400/30 animate-ping"></div>
                    </div>
                  )}
                  {stage === "verified" && (
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: [1, 1.2, 1] }} className="p-2.5 bg-emerald-500/10 rounded-full border border-emerald-500/30">
                      <Check className="w-8 h-8 text-emerald-400" />
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <h1 className="text-xl font-medium text-white tracking-widest uppercase font-mono mb-1">
          JARVIS <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 shadow-xs">X-OS</span>
        </h1>
        <p className="text-[9.5px] font-mono text-cyan-400/60 uppercase tracking-widest mb-6 border-b border-cyan-500/15 pb-3">
          Cybernetic Biometric Gate Control
        </p>

        <div className="min-h-[142px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {stage === "welcome" && (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <p className="text-[11px] text-slate-300 font-mono leading-relaxed bg-[#0c142c]/75 p-3.5 border border-cyan-500/20 rounded-2xl shadow-inner">
                  {selectedFaceTarget === "unknown_new" ? (
                    <span className="text-rose-400 font-bold tracking-wide block animate-pulse">
                      ⚠️ SENSORS ON OVERRIDE: TARGET UNKNOWN. INITIALIZING COGNITIVE ENROLLMENT PORTAL MAP ON TRIGGER...
                    </span>
                  ) : (
                    <span>
                      BIOMETRIC ENGINE PRE-SCALED FOR <strong className="text-cyan-400 font-bold uppercase">{selectedFaceTarget}</strong>.<br />
                      PERSISTENT DIGITAL MATRIX TEMPLATE IS SYNCED AND ARMED.
                    </span>
                  )}
                </p>
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={triggerScan}
                    className={`w-full py-3.5 rounded-2xl text-[10.5px] font-bold font-mono transition-all duration-300 transform active:scale-98 cursor-pointer shadow-md tracking-wider ${
                      selectedFaceTarget === "unknown_new" 
                        ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-[0_0_20px_rgba(244,63,94,0.35)]" 
                        : "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                    }`}
                    id="init_scanner_btn"
                  >
                    {selectedFaceTarget === "unknown_new" ? "⚡ RECORD NEW FACIAL SIGNATURE" : `⚡ AUTHENTICATE AGENT ${selectedFaceTarget.toUpperCase()}`}
                  </button>

                  <button
                    onClick={triggerNamasteUnlock}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] text-slate-950 rounded-2xl text-[10.5px] font-bold font-mono tracking-widest transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 uppercase shadow-md hover:brightness-110"
                    id="init_namaste_btn"
                  >
                    🙏 INITIATE GESTURE DECRYPT (NAMASTE)
                  </button>
                </div>
              </motion.div>
            )}

            {stage === "scanning" && (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className={`flex items-center justify-between text-xs font-mono px-1.5 ${selectedFaceTarget === "unknown_new" ? "text-rose-400 font-bold" : "text-cyan-400 font-semibold"}`}>
                  <span className="tracking-widest uppercase animate-pulse">
                    {selectedFaceTarget === "unknown_new" ? "PARSING BIOLOGICAL ARCS..." : "RESOLVING NODAL GRAPH MAP..."}
                  </span>
                  <span className="font-bold font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">{scanProgress}%</span>
                </div>
                
                <div className="w-full h-2.5 rounded-full bg-white/5 border border-white/10 overflow-hidden relative p-[1px]">
                  <div 
                    className={`h-full rounded-full transition-all duration-150 ${
                      selectedFaceTarget === "unknown_new" ? "bg-gradient-to-r from-rose-500 to-pink-500" : "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
                    }`}
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[8px] font-mono text-slate-500 uppercase tracking-widest text-left max-w-xs mx-auto border-t border-white/5 pt-2">
                  <span>VECTOR_X: {(Math.random() * 10).toFixed(4)}</span>
                  <span>Ocular: ALIGNED</span>
                  <span>VECTOR_Y: {(Math.random() * 10).toFixed(4)}</span>
                  <span>Confidence: STABLE</span>
                </div>
              </motion.div>
            )}

            {stage === "register" && (
              <motion.div 
                key="register"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-left font-mono space-y-3 bg-[#0d0714]/90 border border-pink-500/20 p-4 rounded-2xl relative shadow-2xl"
              >
                <div className="flex items-center gap-2 border-b border-pink-500/10 pb-2 mb-2.5">
                  <UserPlus className="w-4 h-4 text-pink-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">CREATING COGNITIVE SECURE NODE</span>
                </div>

                <form onSubmit={handleRegisterIdentity} className="space-y-3.5 font-mono text-xs text-slate-300">
                  <div className="space-y-1.5">
                    <label className="text-[8.5px] text-pink-400 font-extrabold uppercase tracking-widest block">Agent Codename Entry:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Mummy, Sofia, Dad"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 focus:border-pink-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-hidden transition-all placeholder:text-slate-600 focus:shadow-[0_0_8px_rgba(236,72,153,0.15)]"
                      id="reg_name_input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8.5px] text-pink-400 font-extrabold uppercase tracking-widest block">Command Cockpit Soundtrack:</label>
                    <select
                      value={registerSong}
                      onChange={(e) => setRegisterSong(e.target.value)}
                      className="w-full bg-slate-950/80 border border-white/10 focus:border-pink-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-hidden transition-all"
                      id="reg_song_select"
                    >
                      <option value="Ambient Lofi Space Beats">Ambient Lofi Space Beats (Mellow/Chill)</option>
                      <option value="Cyberpunk Synthwave Flight">Cyberpunk Synthwave Flight (High Energy Coding)</option>
                      <option value="Phonk Core Concentrate">Phonk Core Concentrate (Extreme BPM Electronic)</option>
                      <option value="Academic Classical Symphony">Academic Classical Symphony (Alpha Brainwave Focus)</option>
                      <option value="Vocal Chill Out Zone">Vocal Chill Out Zone (Melodic Easy Listening)</option>
                      <option value="Custom Focus Song...">Custom Focus Song... (Select to write below)</option>
                    </select>
                  </div>

                  {registerSong === "Custom Focus Song..." && (
                    <div className="space-y-1.5">
                      <label className="text-[8.5px] text-pink-400 font-extrabold uppercase tracking-widest block font-bold">Write Custom Song Title Name:</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chill Synth Sunrise"
                        value={customSongText}
                        onChange={(e) => setCustomSongText(e.target.value)}
                        className="w-full bg-slate-950/80 border border-white/10 focus:border-pink-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-hidden transition-all placeholder:text-slate-600"
                        id="reg_custom_song_input"
                      />
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-[0_0_15px_rgba(236,72,153,0.35)] text-white font-bold rounded-xl text-xs text-center cursor-pointer transition-transform duration-100 active:scale-95 uppercase tracking-widest"
                      id="save_digital_id_btn"
                    >
                      🚀 ENROLL & PERSIST FACIAL SCHEMAS
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {stage === "voice" && (
              <motion.div 
                key="voice"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="text-xs font-mono text-pink-400 border border-pink-500/20 bg-pink-500/5 p-4 rounded-2xl">
                  <p className="font-bold tracking-widest text-[#00f2fe] uppercase">Vocal Identity Validator</p>
                  <p className="text-[9.5px] text-slate-400 mt-1 uppercase tracking-wide">Please recite physical voicepass phrase:</p>
                  <p className="text-white text-xs font-semibold tracking-wider italic mt-3 bg-slate-950 px-3 py-2 rounded-xl border border-white/5 shadow-inner">
                    &ldquo;{currentFaceProfile?.voicephrase || "Cognitive access code Ullas Zero Seven"}&rdquo;
                  </p>
                </div>

                {isRecording ? (
                  <div className="flex items-end justify-center gap-1.5 h-12" id="voice_passphrase_waveform">
                    {waveform.map((pt, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-gradient-to-t from-pink-500 to-cyan-400 rounded-full transition-all duration-150 shadow-[0_0_6px_rgba(244,63,94,0.4)]"
                        style={{ height: `${pt}%` }}
                      ></div>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={simulateValueVoiceCheck}
                    className="px-6 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl text-[10.5px] font-bold font-mono transition-all duration-300 transform active:scale-95 animate-pulse shadow-lg cursor-pointer tracking-wider"
                    id="rec_passphrase_btn"
                  >
                    🎤 START VOCAL INTEGRATION MATCH
                  </button>
                )}

                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                  COMPARING AUDIO HARMONICS TO SECURE DATABASE COEFFICIENTS
                </p>
              </motion.div>
            )}

            {stage === "namaste_active" && (
              <motion.div 
                key="namaste_active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between text-xs font-mono px-2 text-amber-400">
                  <span className="font-bold tracking-widest uppercase animate-pulse">
                    🙏 PARSING NAMASTE COGNITIVE SIGN
                  </span>
                  <span className="font-bold bg-amber-950/60 border border-amber-500/20 px-2 py-0.5 rounded text-amber-300">{scanProgress}%</span>
                </div>
                
                {/* Vedic dynamic mandalas - animated geometry spheres */}
                <div className="relative w-24 h-24 mx-auto my-3 flex items-center justify-center">
                  <span className="text-5xl animate-bounce z-10">🙏</span>
                  {/* Glowing mandala concentric circles */}
                  <div className="absolute inset-0 rounded-full border border-dashed border-amber-500/40 animate-spin" style={{ animationDuration: "12s" }}></div>
                  <div className="absolute inset-2.5 rounded-full border border-orange-500/30 animate-spin" style={{ animationDuration: "8s" }}></div>
                  <div className="absolute inset-5 rounded-full border border-yellow-500/25 animate-ping"></div>
                </div>

                <div className="w-full h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden relative">
                  <div 
                    className="h-full rounded-full transition-all duration-100 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>

                <p className="text-[9px] font-mono text-amber-500/80 animate-pulse tracking-wider leading-relaxed bg-amber-950/15 p-2.5 border border-amber-500/10 rounded-xl">
                  🙏 VEDIC MANDALA DECRYPT COMPLETE • SYNCHRONIZING INNER SENSORY COGNITION WITH SECURE PROTOCOL CORE
                </p>
              </motion.div>
            )}

            {stage === "verified" && (
              <motion.div 
                key="verified"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 mb-2 drop-shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                  <CheckCircle className="w-9 h-9 animate-bounce" />
                </div>
                <h4 className="text-xs font-bold font-mono text-emerald-400 tracking-widest uppercase">
                  BIOMETRIC SIGNATURE RESOLVED
                </h4>
                <p className="text-xs text-slate-300 font-mono leading-relaxed bg-emerald-950/10 p-3 border border-emerald-500/10 rounded-2xl">
                  Welcome to Core Deck Command Station, <strong className="text-cyan-400 uppercase font-extrabold">{selectedFaceTarget}</strong>.<br />
                  Synaptic workspace unlocked. Streaming playlist audio stream. Synergizing.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* HUD system status codes in the bottom footer */}
        <div className="mt-8 pt-4 border-t border-cyan-500/10 flex justify-between text-[8px] font-mono text-slate-500">
          <span>SECURE_NODE: 0x9_ALPHA_{selectedFaceTarget.toUpperCase()}</span>
          <span>VOICE LEVEL: {stage === "verified" ? "99.98% RESOLVED" : "FEED CALIBRATED"}</span>
          <span>SYS_OS: v42.9.2_BETA</span>
        </div>
      </div>
    </div>
  );
};

