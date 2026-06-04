const fs = require('fs');
const path = require('path');

const routes = [
  { path: 'app/roadmap', name: 'AI Adoption Roadmap', id: 'roadmap' },
  { path: 'app/rag', name: 'RAG Knowledge Repository', id: 'rag' },
  { path: 'app/ledger', name: 'Provenance Ledger', id: 'ledger' },
  { path: 'app/advisory', name: 'Advisory Automation', id: 'advisory' },
  { path: 'app/governance', name: 'Risk & Governance', id: 'governance' },
  { path: 'app/architecture', name: 'Vendor Architecture', id: 'architecture' },
  { path: 'app/kpi', name: 'KPI Dashboard', id: 'kpi' },
  { path: 'app/qa', name: 'QA Evidence Report', id: 'qa' },
];

const template = (name, id) => `"use client";

import { CommandCenterShell } from "@/components/tn-command-center/command-center-shell";
import { tnDemoData } from "@/lib/tn-ai-data";

export default function ${id.charAt(0).toUpperCase() + id.slice(1)}Page() {
  return (
    <CommandCenterShell
      activeAreaId="${id}"
      rightRail={<div className="p-4">Right Rail Placeholder</div>}
      eventStream={tnDemoData.evidenceStream}
    >
      <div className="flex h-full flex-col gap-4 p-4 xl:p-6">
        <h2 className="text-3xl font-semibold gradient-text-hero">${name}</h2>
        <p className="text-command-muted">Scaffolding in progress...</p>
      </div>
    </CommandCenterShell>
  );
}
`;

routes.forEach(r => {
  const dir = path.join(__dirname, r.path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'page.tsx'), template(r.name, r.id));
});

console.log('Routes scaffolded.');
