import { SimulatorState, SignalState } from "./types";

/**
 * A highly deterministic pseudo-random number generator.
 * Necessary so replays and shadow executions always yield the exact same timeline 
 * for a given seed and scenario.
 */
export function createSeededRng(seed: string) {
  let h = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function computeSignalState(
  value: number,
  watch: number,
  warning: number,
  critical: number
): SignalState {
  if (value >= critical) return "critical";
  if (value >= warning) return "warning";
  if (value >= watch) return "watch";
  return "normal";
}

/**
 * Deterministic formula to simulate industrial physics based on scenario parameters.
 */
export function generateSignalTrace(
  timeSeconds: number,
  baseline: number,
  incidentStart: number,
  incidentMagnitude: number,
  rampRate: number,
  noiseAmplitude: number,
  rng: () => number
) {
  // Base deterministic noise
  const noise = (rng() - 0.5) * 2 * noiseAmplitude;
  
  if (timeSeconds < incidentStart) {
    return baseline + noise;
  }

  // Sigmoid-like drift for industrial physics (thermal, wear, vibration)
  const dt = timeSeconds - incidentStart;
  const drift = incidentMagnitude * (1 - Math.exp(-dt / rampRate));
  
  return baseline + drift + noise;
}

export function generateDeterministicHash(inputs: string[]): string {
  const seed = inputs.join("|");
  const rng = createSeededRng(seed);
  return "0x" + Math.floor(rng() * 1e16).toString(16).padStart(14, "0");
}
