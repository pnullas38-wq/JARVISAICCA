export interface DocumentItem {
  id: string;
  title: string;
  category: "pdf" | "paper" | "textbook" | "note" | "documentation" | "meeting";
  content: string;
  uploadedAt: string;
  size: string;
  readTime: string;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  category: "study" | "project" | "general" | "milestone";
  priority: "high" | "medium" | "low";
}

export interface AlarmItem {
  id: string;
  title: string;
  timeString: string; // duration or simple time string
  triggerTime: number; // EPOCH timestamp when it rings
  active: boolean;
  triggered: boolean;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface RecItem {
  id: string;
  title: string;
  description: string;
  category: "study" | "career" | "code" | "reading";
  urgency: "now" | "today" | "scheduled";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "jarvis";
  text: string;
  timestamp: string;
  agentMode: "rag" | "tutor" | "planner" | "career" | "project" | "meeting" | "general";
}

export interface MeetingItem {
  id: string;
  title: string;
  date: string;
  duration: string;
  transcript: string;
  summary?: string;
  actionItems?: string[];
  decisions?: string[];
}

export interface StudySessionLog {
  day: string;
  hours: number;
  completedTasks: number;
  focusScore: number;
}
