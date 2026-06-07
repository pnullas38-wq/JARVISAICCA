export type Language = "en" | "es" | "fr" | "hi" | "kn" | "ja";

export interface LocaleStrings {
  brand: string;
  knowledgeCore: string;
  addDoc: string;
  filterFiles: string;
  systemAgents: string;
  objective: string;
  milestonesMet: string;
  codingHours: string;
  nodesIndexed: string;
  voiceSync: string;
  quickInsights: string;
  runQuiz: string;
  ingestPlan: string;
  chatPlaceholder: string;
  memoryTitle: string;
  addMemory: string;
  memoryPlaceholder: string;
  terminalTitle: string;
  biometricScanner: string;
  swarmLab: string;
  runSwarm: string;
  shutdownAlert: string;
  restarting: string;
}

export const translationMap: Record<Language, LocaleStrings> = {
  en: {
    brand: "JARVIS X-OS Workplace",
    knowledgeCore: "Knowledge Core",
    addDoc: "+ ADD FILE",
    filterFiles: "Filter context files...",
    systemAgents: "Active System Agents",
    objective: "Active Core Objective",
    milestonesMet: "Milestones Met",
    codingHours: "Total Coding Hours",
    nodesIndexed: "Knowledge Nodes",
    voiceSync: "Voice Analytics Sync",
    quickInsights: "Coupled Document Insights",
    runQuiz: "📝 GENERATE EVALUATION QUIZ",
    ingestPlan: "🗺️ INGEST ROADMAP PLANNER",
    chatPlaceholder: "Enter cognitive query prompt terminal...",
    memoryTitle: "Long-Term Memory Bank",
    addMemory: "+ RECORD MEMORY",
    memoryPlaceholder: "Enter unique facts to persist...",
    terminalTitle: "Automation Node Terminal",
    biometricScanner: "Biometric ID Scanner",
    swarmLab: "Multi-Agent Swarm Laboratory",
    runSwarm: "✦ INITIATE AGENT WORKSHOPS",
    shutdownAlert: "OVERRIDE CRITICAL: POWER DE-CONFLATION PROCESS TRIGGERED",
    restarting: "REBOOTING FLIGHT LOGS... RESTORING ALL MEMORY CACHES"
  },
  es: {
    brand: "Espacio JARVIS X-OS",
    knowledgeCore: "Núcleo de Conocimiento",
    addDoc: "+ AÑADIR ARCHIVO",
    filterFiles: "Filtrar archivos de contexto...",
    systemAgents: "Agentes de Sistema Activos",
    objective: "Objetivo Central Activo",
    milestonesMet: "Hitos Logrados",
    codingHours: "Horas de Programación",
    nodesIndexed: "Nodos de Conocimiento",
    voiceSync: "Sincronización por Voz",
    quickInsights: "Perspectivas del Documento",
    runQuiz: "📝 GENERAR CUESTIONARIO",
    ingestPlan: "🗺️ AGREGAR PLANIFICADOR",
    chatPlaceholder: "Ingrese terminal de consulta cognitiva...",
    memoryTitle: "Banco de Memoria a Largo Plazo",
    addMemory: "+ REGISTRAR MEMORIA",
    memoryPlaceholder: "Ingrese datos para guardar...",
    terminalTitle: "Terminal de Automatización",
    biometricScanner: "Escáner Biométrico de ID",
    swarmLab: "Laboratorio de Enjambre Multi-Agente",
    runSwarm: "✦ INICIAR TALLER DE AGENTES",
    shutdownAlert: "ANULACIÓN CRÍTICA: PROCESO DE APAGADO INICIADO",
    restarting: "REINICIANDO LOGS... RESTAURANDO CACHÉ DE MEMORIA"
  },
  fr: {
    brand: "Espace JARVIS X-OS",
    knowledgeCore: "Base de Connaissances",
    addDoc: "+ AJOUTER FICHIER",
    filterFiles: "Filtrer les fichiers...",
    systemAgents: "Agents Systèmes Actifs",
    objective: "Objectif Principal Actif",
    milestonesMet: "Jalons Atteints",
    codingHours: "Heures de Code",
    nodesIndexed: "Nœuds de Connaissances",
    voiceSync: "Analyses de Voix",
    quickInsights: "Analyse des Documents",
    runQuiz: "📝 GÉNÉRER UN QUIZ",
    ingestPlan: "🗺️ CHARGER LE PLANIFICATEUR",
    chatPlaceholder: "Entrer la commande cognitive...",
    memoryTitle: "Mémoire à Long Terme",
    addMemory: "+ ENREGISTRER MEMOIRE",
    memoryPlaceholder: "Entrez des faits pour persister...",
    terminalTitle: "Terminal d'Automatisation",
    biometricScanner: "Scanner ID Biométrique",
    swarmLab: "Laboratoire Multi-Agents Swarm",
    runSwarm: "✦ LANCER L'ATELIER DES AGENTS",
    shutdownAlert: "ALERTE INTEMPÉRIES : EXTINCTION DU SYSTÈME ACTIVÉE",
    restarting: "REDÉMARRAGE... RESTAURATION DES CACHES MÉMOIRE"
  },
  hi: {
    brand: "जार्विस X-OS कार्यक्षेत्र",
    knowledgeCore: "ज्ञान केंद्र (नॉलेज कोर)",
    addDoc: "+ फ़ाइल जोड़ें",
    filterFiles: "फ़िल्टर करें...",
    systemAgents: "सक्रिय प्रणाली एजेंट",
    objective: "सक्रिय मुख्य उद्देश्य",
    milestonesMet: "पूरे किए गए लक्ष्य",
    codingHours: "कुल कोडिंग घंटे",
    nodesIndexed: "ज्ञान नोड्स अनुक्रमित",
    voiceSync: "ध्वनि सिंक विश्लेषण",
    quickInsights: "दस्तावेज़ अंतर्दृष्टि",
    runQuiz: "📝 मूल्यांकन प्रश्नोत्तरी बनाएं",
    ingestPlan: "🗺️ अध्ययन योजना लोड करें",
    chatPlaceholder: "संज्ञानात्मक प्रश्न दर्ज करें...",
    memoryTitle: "दीर्घकालिक स्मृति बैंक",
    addMemory: "+ स्मृति दर्ज करें",
    memoryPlaceholder: "सहेजने के लिए तथ्य लिखें...",
    terminalTitle: "स्वचालन कमांड टर्मिनल",
    biometricScanner: "बायोमेट्रिक पहचान स्कैनर",
    swarmLab: "मल्टी-एजेंट झुंड प्रयोगशाला",
    runSwarm: "✦ एजेंट कार्यशाला शुरू करें",
    shutdownAlert: "गंभीर चेतावनी: लैपटॉप शटडाउन प्रक्रिया शुरू की",
    restarting: "सिस्टम रीबूट: सभी मेमोरी कैश पुनर्स्थापित हो रही है"
  },
  kn: {
    brand: "ಜಾರ್ವಿಸ್ X-OS ಕಾರ್ಯಕ್ಷೇತ್ರ",
    knowledgeCore: "ಜ್ಞಾನ ಕ್ಷೇತ್ರ",
    addDoc: "+ ಫೈಲ್ ಸೇರಿಸಿ",
    filterFiles: "ಫೈಲ್ ಹುಡುಕಿ...",
    systemAgents: "ಸಕ್ರಿಯ ಸಿಸ್ಟಮ್ ಏಜೆಂಟ್ಸ್",
    objective: "ಸಕ್ರಿಯ ಪ್ರಮುಖ ಉದ್ದೇಶ",
    milestonesMet: "ಮೈಲಿಗಲ್ಲುಗಳು",
    codingHours: "ಒಟ್ಟು ಕೋಡಿಂಗ್ ಗಂಟೆಗಳು",
    nodesIndexed: "ಸೂಚ್ಯಂಕ ಜ್ಞಾನ ನೋಡ್ಗಳು",
    voiceSync: "ಧ್ವನಿ ಸಿಂಕ್ ವಿಶ್ಲೇಷಣೆ",
    quickInsights: "ದಾಖಲೆ ಒಳನೋಟಗಳು",
    runQuiz: "📝 ಮೌಲ್ಯಮಾಪನ ರಸಪ್ರಶ್ನೆ",
    ingestPlan: "🗺️ ಯೋಜನಾ ಪಟ್ಟಿ ನಡೆಸಿ",
    chatPlaceholder: "ಕಮಾಂಡ್ ನಮೂದಿಸಿ...",
    memoryTitle: "ದೀರ್ಘಕಾಲಿಕ ಮೆಮೊರಿ ಬ್ಯಾಂಕ್",
    addMemory: "+ ನೆನಪು ಸೇರಿಸಿ",
    memoryPlaceholder: "ಉಳಿಸಲು ಮಾಹಿತಿ ಬರೆಯಿರಿ...",
    terminalTitle: "ಸ್ವಯಂಚಾಲಿತ ನಿಯಂತ್ರಣ ಕನ್ಸೋಲ್",
    biometricScanner: "ಬಯೋಮೆಟ್ರಿಕ್ ಐಡಿ ಸ್ಕ್ಯಾನರ್",
    swarmLab: "ಮಲ್ಟಿ-ಏಜೆಂಟ್ ಲ್ಯಾಬೋರೇಟರಿ",
    runSwarm: "✦ ಏಜೆಂಟ್ಸ್ ಚರ್ಚೆ ಪ್ರಾರಂಭಿಸಿ",
    shutdownAlert: "ಎಚ್ಚರಿಕೆ: ಲ್ಯಾಪ್‌ಟಾಪ್ ಸ್ಥಗಿತಗೊಳಿಸುವ ಪ್ರಕ್ರಿಯೆ ಚಾಲಿತಗೊಂಡಿದೆ",
    restarting: "ರೀಬೂಟ್ ಆಗುತ್ತಿದೆ: ಎಲ್ಲಾ ಮೆಮೊರಿ ಮರುಸ್ಥಾಪಿಸಲಾಗುತ್ತಿದೆ"
  },
  ja: {
    brand: "JARVIS X-OS ワークプレイス",
    knowledgeCore: "ナレッジ・コア",
    addDoc: "+ ファイル追加",
    filterFiles: "関連ファイルを抽出...",
    systemAgents: "アクティブエージェント",
    objective: "稼働コア目標値",
    milestonesMet: "達成されたマイルストーン",
    codingHours: "総コード開発時間",
    nodesIndexed: "インデックス済情報群",
    voiceSync: "音声同期アナリティクス",
    quickInsights: "ドキュメント統合インサイト",
    runQuiz: "📝 評価クイズを生成",
    ingestPlan: "🗺️ ロードマップ統合",
    chatPlaceholder: "認知的クエリを入力してください...",
    memoryTitle: "長期メモリー・バンク",
    addMemory: "+ メモリー記録",
    memoryPlaceholder: "保存する事実を入力...",
    terminalTitle: "自動システム・ターミナル",
    biometricScanner: "バイオメトリック認証スキャン",
    swarmLab: "マルチ・エージェント分析研究所",
    runSwarm: "✦ 議論フォーラムを開始",
    shutdownAlert: "重大なオーバーライド：システムのシャットダウンを開始します",
    restarting: "システム再起動中：すべてのメモリーを修復中"
  }
};
