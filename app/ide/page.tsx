import { CommandCenterShell, ShellActionLink } from "@/components/tn-command-center/command-center-shell";
import { SolidityIDE } from "@/components/ide/SolidityIDE";
import { AcademicHeader } from "@/components/education/AcademicHeader";

export default function IDEPage() {
  return (
    <CommandCenterShell 
      activeAreaId="ledger"
      eventStream={[]}
      utilityActions={<ShellActionLink href="/tutorials" label="Missions" />}
    >
      <div className="flex h-full flex-col p-4 xl:p-6 gap-4">
        <AcademicHeader topic="smart_contract_governance" />
        <div className="flex flex-col gap-1 mb-2">
          <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            Smart Contract Policy Editor
          </h2>
          <p className="text-sm text-slate-400">
            Write, compile, and deploy governance policies directly to the XRPL EVM Sidechain Testnet.
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <SolidityIDE />
        </div>
      </div>
    </CommandCenterShell>
  );
}
