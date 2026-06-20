"use server";

import { createClient } from "@/lib/supabase/server";
import { proofLedger, EvidencePacket } from "@/lib/proof";

export async function processIoTAction(formData: FormData) {
  const supabase = await createClient();

  // Parse form data or simulated incoming action
  const event_id = crypto.randomUUID();
  const run_id = formData.get("run_id")?.toString() || crypto.randomUUID();
  const scenario_id = formData.get("scenario_id")?.toString() || "default_scenario";
  const actor = formData.get("actor")?.toString() || "Operator Gate";
  const action_type = formData.get("action_type")?.toString() || "MACHINE_CALIBRATION";
  const parameter = formData.get("parameter")?.toString() || "0";

  const evidence: EvidencePacket = {
    run_id,
    scenario_id,
    event_id,
    timestamp: new Date().toISOString(),
    actor,
    action_type,
    payload: { parameter: Number(parameter) },
    approval_status: "approved",
  };

  // 1. Anchor to Blockchain
  const anchorResult = await proofLedger.anchorEvent(evidence);

  // 2. Store in Supabase
  const { data, error } = await supabase
    .schema("proof")
    .from("anchors")
    .insert({
      run_id: evidence.run_id,
      scenario_id: evidence.scenario_id,
      event_id: evidence.event_id,
      proof_mode: getProofMode(),
      network: getProofMode(),
      evidence_hash: anchorResult.evidence_hash,
      evidence_bytes32: anchorResult.evidence_bytes32,
      anchor_type: "IoT_Action",
      transaction_hash: anchorResult.transaction_hash,
      ledger_index: anchorResult.ledger_index,
      block_number: anchorResult.block_number,
      contract_address: anchorResult.contract_address,
      wallet_address: anchorResult.wallet_address,
      explorer_url: anchorResult.explorer_url,
      status: anchorResult.success ? "confirmed" : "failed",
      error_message: anchorResult.error,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to insert proof record:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data: { evidence, anchorResult, dbRecord: data } };
}

function getProofMode() {
  return process.env.NEXT_PUBLIC_PROOF_MODE || "mock";
}
