import { EvidencePacket } from "./types";
import { createHash } from "crypto";

export function canonicalize(evidence: EvidencePacket): string {
  // Sort keys deeply to ensure deterministic output
  const sortObject = (obj: any): any => {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(sortObject);
    }
    const sortedKeys = Object.keys(obj).sort();
    const result: any = {};
    for (const key of sortedKeys) {
      result[key] = sortObject(obj[key]);
    }
    return result;
  };

  const sortedEvidence = sortObject(evidence);
  return JSON.stringify(sortedEvidence);
}

export function hashEvidence(evidence: EvidencePacket): {
  hash: string;
  bytes32: string;
} {
  const canonicalString = canonicalize(evidence);
  const hash = createHash("sha256").update(canonicalString).digest("hex");
  const bytes32 = "0x" + hash;
  return { hash, bytes32 };
}
