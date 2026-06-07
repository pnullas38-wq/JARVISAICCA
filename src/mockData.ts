import { DocumentItem, TaskItem, RecItem, MeetingItem, StudySessionLog } from "./types";

export const initialDocuments: DocumentItem[] = [
  {
    id: "doc-os",
    title: "Operating Systems Lecture Notes: Process Scheduling & Deadlocks",
    category: "note",
    content: `OPERATING SYSTEMS: PROCESS SCHEDULING & MUTUAL EXCLUSION
1. CPU SCHEDULING ALGORITHMS:
   - First-Come, First-Served (FCFS): Non-preemptive, suffers from Convoy Effect.
   - Shortest Job First (SJF): Optimal average waiting time. Preemptive version is Shortest Remaining Time First (SRTF).
   - Round Robin (RR): Uses time slices/quanta (q). Designed for time-sharing. High context switch overhead if q is too small.
   
2. PROCESS SYNCHRONIZATION & DEADLOCKS:
   - Race Condition: Multiple processes access and manipulate same data concurrently.
   - Critical Section: Segment of code where shared resources are accessed. Required properties for solution: Mutual Exclusion, Progress, Bounded Waiting.
   - Semaphore: Integer variable accessed via wait() and signal(). Binary Semaphore behaves like a Mutex.
   - Deadlock Characterization (All 4 conditions must hold simultaneously):
     1. Mutual Exclusion: At least one resource must be non-shareable.
     2. Hold and Wait: Process holding resources can request additional resources.
     3. No Preemption: Resources cannot be forcibly taken from a process.
     4. Circular Wait: A closed chain of processes exists where each process holds resources requested by the next.
   - Banker's Algorithm: Used for deadlock avoidance in resource allocation systems. Determines safe/unsafe states.`,
    uploadedAt: "2026-06-01T14:30:00Z",
    size: "4.5 KB",
    readTime: "3 min"
  },
  {
    id: "doc-dbms",
    title: "DBMS Chapter 5 PDF: Functional Dependencies & Normalization",
    category: "textbook",
    content: `DATABASE MANAGEMENT SYSTEMS (DBMS) - CHAPTER 5: NORMALIZATION
Normalization is the systematic process of organizing relation schemas to minimize redundancy and prevent Insertion, Update, and Deletion anomalies.

1. FUNCTIONAL DEPENDENCIES (FDs):
   An FD X -> Y holds on relation R if for any transactional state, any two tuples with the same X value must also have the exact same Y value.

2. NORMAL FORMS:
   - First Normal Form (1NF): All attributes must hold only atomic (indivisible) values. No repeating groups.
   - Second Normal Form (2NF): Relation must be in 1NF and every non-prime attribute must be FULLY functionally dependent on the primary key (no partial dependencies on a composite key).
   - Third Normal Form (3NF): Relation must be in 2NF and no non-prime attribute is transitively dependent on the primary key. (X -> Y is a 3NF relation if X is a superkey, or Y is a prime attribute).
   - Boyce-Codd Normal Form (BCNF): A stricter version of 3NF. For every non-trivial FD X -> Y, X must be a superkey. No dependencies of prime attributes on non-prime attributes are tolerated. BCNF is always dependency-preserving or lossless, but in rare cases both cannot be achieved.`,
    uploadedAt: "2026-06-02T10:15:00Z",
    size: "6.2 KB",
    readTime: "4 min"
  },
  {
    id: "doc-ai",
    title: "Research Paper: LangGraph Multi-Agent Workflows & Cognitive Architectures",
    category: "paper",
    content: `RESEARCH PAPER ANALYTICAL HIGHLIGHTS: LANGGRAPH & COGNITIVE MODEL AGENTS
Abstract: Traditional linear chain LLM agents encounter limits with complex, cyclic workflows. We present LangGraph, a framework modeling agent state as a directed graph that permits cycles, state restoration, and multi-agent systems.

KEY ARCHITECTURAL ELEMENTS:
1. STATE GRAPH CONSTRUCT:
   Nodes represent execution states or tool-calling agents. Edges represent routing logic. Graphs can handle cyclical routes where agents evaluate their own outputs and refine them iteratively before finalizing responses (the Actor-Critic loop).
2. MULTI-AGENT DESIGN PATTERNS:
   - Router: A single supervisor routes tasks dynamically to specialized workers based on user requests.
   - Orchestrator-Workers: An orchestrator delegates subtasks to parallel workers and synthesizes results.
   - Actor-Critic (Supervisor-Reviewer): Multi-agent discussion where Agent A designs architecture, Agent B reviews against a security policy, and Agent A adjusts until Agent B accepts.
3. CONCURRENCY:
   LangGraph natively supports parallel node execution, allowing asynchronous, multi-agent debates or parallel retrieval augmentation.`,
    uploadedAt: "2026-06-05T09:00:00Z",
    size: "8.8 KB",
    readTime: "6 min"
  },
  {
    id: "doc-proj-rec",
    title: "E-Commerce Real-time Recommendation Strategy Blueprint",
    category: "documentation",
    content: `PROJECT ARCHITECTURE BLUEPRINT: REAL-TIME SECURE RECOMMANDATION SYSTEM
1. SYSTEM OVERVIEW:
   A multi-tiered e-commerce personalization engine that processes user clicking telemetry in real time to generate contextual product recommendations.
   
2. ARCHITECTURAL LAYOUT:
   - Frontend: SPA in React 19 + Tailwind CSS, streaming user interactions.
   - API Gateway: Express Gateway handling rate-limiting and JWT validating.
   - Core Processing: FastStream Python workers processing Kafka clickstreams.
   - Cache: Redis cluster caching hot catalog products (5ms response time budget).
   - Storage: PostgreSQL with pgvector for vector search matching item embeddings generated using text-embedding-ada-002.
   
3. DATA MODELS:
   - User Vector (User clicking tags): FLOAT[1536]
   - Product Embedding: FLOAT[1536]
   - Recommendation Formula: CosineSimilarity = (A · B) / (||A|| ||B||)`,
    uploadedAt: "2026-06-06T18:00:00Z",
    size: "5.1 KB",
    readTime: "3 min"
  }
];

export const initialTasks: TaskItem[] = [
  {
    id: "task-1",
    title: "Revise Banker's Algorithm safety check exercises",
    completed: false,
    dueDate: "2026-06-08",
    category: "study",
    priority: "high"
  },
  {
    id: "task-2",
    title: "Draft portfolio cover letter for AI Internship application",
    completed: true,
    dueDate: "2026-06-06",
    category: "general",
    priority: "medium"
  },
  {
    id: "task-3",
    title: "Understand 3NF vs BCNF normalization constraints",
    completed: false,
    dueDate: "2026-06-10",
    category: "study",
    priority: "high"
  },
  {
    id: "task-4",
    title: "Create folder wireframe for E-Commerce Recommendation project",
    completed: false,
    dueDate: "2026-06-12",
    category: "project",
    priority: "low"
  }
];

export const initialRecommendations: RecItem[] = [
  {
    id: "rec-1",
    title: "Review BCNF Normalization Formula",
    description: "Your DBMS logs indicate partial confusion in composite key dependencies. Try the AI Tutor Mode normalization quiz.",
    category: "study",
    urgency: "now"
  },
  {
    id: "rec-2",
    title: "Simulate Mock Interview for ML Engineer",
    description: "A machine-learning design interview prepares you for upcoming internships. Let's start a mock review in Career Agent.",
    category: "career",
    urgency: "today"
  },
  {
    id: "rec-3",
    title: "Build Drizzle SQL Schema",
    description: "Use the Project Builder module to generate a fully typed relational database schema for your new app idea.",
    category: "code",
    urgency: "scheduled"
  }
];

export const initialMeetings: MeetingItem[] = [
  {
    id: "meet-1",
    title: "Project Builder Sync & System Control Session",
    date: "2026-06-07",
    duration: "10 mins",
    transcript: `Manager: Hey team, we need to design the microservice for our vector search by Friday.
Lead Dev: I've researched pgvector on PostgreSQL. We can create a table 'item_embeddings' and run cosine queries.
Manager: Great, but let's make sure our API gateway has rate limiting to avoid server overload. Let's set a maximum of 100 requests per minute per user.
Lead Dev: Sounds perfect, I'll draft the TypeScript types and index models today.
Manager: Okay, and please write a clean follow-up email outlining these steps. Keep the launch date as June 30th. Let's do this!`,
    summary: "System design sync for the e-commerce recommendation vector backend. PostgreSQL pgvector selected, API rate limiting configured at 100 req/min.",
    actionItems: [
      "Implement pgvector schema structure - Assigned to Lead Dev by June 12th",
      "Setup Express API Gateway rate limit rule - Assigned to Lead Dev",
      "Draft launching roadmap - Due June 15th"
    ],
    decisions: [
      "Use pgvector extension for recommendation similarity query rather than an external vector DB",
      "API gateway limit set at 100 request/min"
    ]
  }
];

export const initialStudyLogs: StudySessionLog[] = [
  { day: "Mon", hours: 4.5, completedTasks: 2, focusScore: 88 },
  { day: "Tue", hours: 6.2, completedTasks: 4, focusScore: 92 },
  { day: "Wed", hours: 3.8, completedTasks: 1, focusScore: 81 },
  { day: "Thu", hours: 7.5, completedTasks: 5, focusScore: 95 },
  { day: "Fri", hours: 5.0, completedTasks: 3, focusScore: 89 },
  { day: "Sat", hours: 8.4, completedTasks: 6, focusScore: 97 },
  { day: "Sun", hours: 5.6, completedTasks: 3, focusScore: 90 }
];
