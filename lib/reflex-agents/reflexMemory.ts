import type {
  ReflexMemoryRecord,
  ReflexMemoryType,
  ReflexRun,
  ReflexMemoryDecision
} from "@/lib/reflex-agents/types";

const STORAGE_KEY = "tn-reflex-memory-v1";

const MEMORY_TYPES: ReflexMemoryType[] = [
  "run_memory",
  "decision_memory",
  "failure_memory",
  "improvement_memory",
  "source_memory",
  "safety_memory",
];

function isValidMemoryType(value: unknown): value is ReflexMemoryType {
  return typeof value === "string" && MEMORY_TYPES.includes(value as ReflexMemoryType);
}

type PersistedPayload = {
  version: number;
  records: ReflexMemoryRecord[];
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isRecord(value: unknown): value is ReflexMemoryRecord {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ReflexMemoryRecord>;
  return (
    typeof candidate.id === "string" &&
    isValidMemoryType(candidate.type) &&
    typeof candidate.title === "string" &&
    typeof candidate.summary === "string" &&
    Array.isArray(candidate.evidence) &&
    typeof candidate.confidence === "number" &&
    typeof candidate.sourceRunId === "string" &&
    typeof candidate.createdAt === "string" &&
    (candidate.status === "pending" || candidate.status === "stored" || candidate.status === "archived")
  );
}

function readPayload(): PersistedPayload {
  if (!isBrowser()) return { version: 1, records: [] };
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { version: 1, records: [] };

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return { version: 1, records: [] };
    const payload = parsed as Partial<PersistedPayload>;
    if (!Array.isArray(payload.records)) return { version: 1, records: [] };
    const records = payload.records.filter(isRecord);
    return {
      version: typeof payload.version === "number" ? payload.version : 1,
      records,
    };
  } catch {
    return { version: 1, records: [] };
  }
}

function writePayload(payload: PersistedPayload) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: payload.version,
    records: payload.records.slice(0, 200),
  }));
}

function createRecordId(runId: string, type: ReflexMemoryType): string {
  return `${type}-${runId}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
}

export function loadReflexMemoryRecords(): ReflexMemoryRecord[] {
  return readPayload().records;
}

export function storeReflexMemoryRecord(record: ReflexMemoryRecord): void {
  const payload = readPayload();
  const exists = payload.records.find((item) => item.id === record.id);
  if (exists) {
    payload.records = payload.records.map((item) => (item.id === record.id ? record : item));
  } else {
    payload.records = [record, ...payload.records];
  }
  writePayload(payload);
}

export function setReflexMemoryStatus(recordId: string, status: ReflexMemoryRecord["status"]) {
  const payload = readPayload();
  let changed = false;
  payload.records = payload.records.map((item) => {
    if (item.id === recordId && item.status !== status) {
      changed = true;
      return { ...item, status };
    }
    return item;
  });
  if (changed) writePayload(payload);
}

export function purgeReflexMemory() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function blockedReasons(run: ReflexRun): string[] {
  const reasons: string[] = [];
  if (!run.evidencePacket) reasons.push("No evidence packet in run summary.");
  if (!run.evals || run.evals.length === 0) reasons.push("No eval results recorded.");
  if (run.evals.some((entry) => entry.blocking && entry.status === "fail")) {
    reasons.push("Blocking eval failed.");
  }
  if (run.operatorDecision?.status !== "approved") {
    reasons.push("Operator did not approve this run.");
  }
  return reasons;
}

export type MemoryCandidate = {
  type: ReflexMemoryType;
  title: string;
  summary: string;
  evidence: string[];
  confidence: number;
  status: ReflexMemoryRecord["status"];
};

export function buildCandidateMemories(run: ReflexRun): MemoryCandidate[] {
  const baseEvidence = [
    `run=${run.id}`,
    `scenario=${run.scenarioId}`,
    `phase=${run.phase}`,
    `tool-calls=${run.toolCalls.length}`,
  ];

  const memoryRecords: MemoryCandidate[] = [
    {
      type: "run_memory",
      title: `Run outcome memory for ${run.id}`,
      summary:
        run.phase === "complete" ? "Reflex run completed with observed telemetry-to-improvement loop." : "Run did not fully complete.",
      evidence: baseEvidence,
      confidence: 0.86,
      status: "pending",
    },
    {
      type: "decision_memory",
      title: `Decision memory for ${run.id}`,
      summary:
        run.operatorDecision?.status
          ? `Operator decision: ${run.operatorDecision.status} at ${run.operatorDecision.decidedAt}`
          : "No operator decision yet.",
      evidence: run.operatorDecision ? [run.operatorDecision.note, `By ${run.operatorDecision.by}`] : ["Decision pending."],
      confidence: run.operatorDecision?.status === "approved" ? 0.92 : 0.4,
      status: "pending",
    },
  ];

  if (run.phase === "rejected") {
    memoryRecords.push({
      type: "failure_memory",
      title: `Failure mode memory for ${run.id}`,
      summary: "Run was blocked by safety or approval boundary.",
      evidence: baseEvidence,
      confidence: 0.75,
      status: "pending",
    });
  }

  if (run.improvementProposal) {
    memoryRecords.push({
      type: "improvement_memory",
      title: run.improvementProposal.title,
      summary: run.improvementProposal.proposedChange,
      evidence: [
        `Problem: ${run.improvementProposal.problemObserved}`,
        `Benefit: ${run.improvementProposal.expectedBenefit}`,
      ],
      confidence: 0.73,
      status: "pending",
    });
  }

  return memoryRecords;
}

export function verifiedMemoryAllowed(run: ReflexRun, decision: ReflexMemoryDecision): boolean {
  const reasons = blockedReasons(run);
  if (reasons.length > 0 && !decision.actor.includes("system")) {
    return false;
  }
  if (!decision.approved) return false;
  return true;
}

export function materializeVerifiedMemory(run: ReflexRun, decision: ReflexMemoryDecision): ReflexMemoryRecord | null {
  if (!decision.approved) return null;
  if (run.phase !== "complete" && run.phase !== "memory_update_ready") return null;

  const blockers = blockedReasons(run);
  if (blockers.length > 0) {
    return null;
  }

  const evidence = [
    `run=${run.id}`,
    `scenario=${run.scenarioId}`,
    `evidence=${Boolean(run.evidencePacket)}`,
    `evals=${run.evals.length}`,
    `tools=${run.toolCalls.length}`,
  ];

  return {
    id: createRecordId(run.id, "run_memory"),
    type: "run_memory",
    title: `Verified run memory ${run.id}`,
    summary: `Verified evidence from telemetry, eval, and operator decision for scenario ${run.scenarioId}.`,
    evidence,
    confidence: Math.max(0.6, Math.min(1, run.evals.filter((item) => item.status === "pass").length / Math.max(1, run.evals.length))),
    sourceRunId: run.id,
    createdAt: new Date().toISOString(),
    status: "stored",
  };
}

export function ensureRunMemoryFromDecision(
  run: ReflexRun,
  decision: ReflexMemoryDecision
): ReflexMemoryRecord | null {
  const record = materializeVerifiedMemory(run, decision);
  if (!record) return null;
  storeReflexMemoryRecord(record);
  return record;
}

export function getReflexMemoryByRun(runId: string): ReflexMemoryRecord | undefined {
  return loadReflexMemoryRecords().find((item) => item.sourceRunId === runId);
}

export function isMemoryRecordReady(record: ReflexMemoryRecord): record is ReflexMemoryRecord {
  return record.status !== "archived";
}
