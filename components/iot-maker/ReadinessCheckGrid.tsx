"use client";

import type { ReadinessCheck } from "@/lib/iot-maker/types";
import { ServiceReadinessCard } from "./ServiceReadinessCard";

export function ReadinessCheckGrid({ checks }: { checks: ReadinessCheck[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
      {checks.map((check) => (
        <ServiceReadinessCard key={check.id} check={check} />
      ))}
    </div>
  );
}
