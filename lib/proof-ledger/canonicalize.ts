// lib/proof-ledger/canonicalize.ts
// Deterministic JSON canonicalization: stable-sort keys recursively.

export function canonicalize(obj: unknown): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalize).join(",") + "]";
  }
  const sorted = Object.keys(obj as Record<string, unknown>)
    .sort()
    .map((k) => {
      const v = (obj as Record<string, unknown>)[k];
      return JSON.stringify(k) + ":" + canonicalize(v);
    });
  return "{" + sorted.join(",") + "}";
}
