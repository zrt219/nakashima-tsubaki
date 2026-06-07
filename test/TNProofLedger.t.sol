// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { TNProofLedger } from "../contracts/TNProofLedger.sol";

contract TNProofLedgerTest {
    TNProofLedger private ledger;
    bytes32 private constant EVENT_TYPE = keccak256("iot_maker");

    function setUp() public {
        ledger = new TNProofLedger();
    }

    function testAnchorEvidenceStoresState() public {
        bytes32 runId = bytes32(uint256(0xA1));
        bytes32 evidenceHash = keccak256("evidence-hash");

        ledger.anchorEvidence(runId, evidenceHash, EVENT_TYPE, "uri://proof/test");
        bool anchored = ledger.isAnchored(evidenceHash);

        require(anchored == true, "Evidence hash was not anchored.");
    }

    function testDuplicateAnchorIsRejected() public {
        bytes32 runId = bytes32(uint256(0xB2));
        bytes32 evidenceHash = keccak256("duplicate-evidence");

        ledger.anchorEvidence(runId, evidenceHash, EVENT_TYPE, "uri://proof/dup");

        bool reverted = false;
        try ledger.anchorEvidence(runId, evidenceHash, EVENT_TYPE, "uri://proof/dup2") {
            // no-op
        } catch {
            reverted = true;
        }

        require(reverted, "Duplicate evidence hash should be rejected.");
    }

    function testIsAnchoredReturnsTrue() public {
        bytes32 runId = bytes32(uint256(0xC3));
        bytes32 evidenceHash = keccak256("anchored-state");

        ledger.anchorEvidence(runId, evidenceHash, EVENT_TYPE, "uri://proof/state");
        require(ledger.isAnchored(evidenceHash), "isAnchored must return true for anchored packet.");
    }

    function testNoMachineControlFunctionExists() public {
        (bool hasRun, ) = address(ledger).call(abi.encodeWithSignature("writeDirectPLC(bytes)"));
        require(!hasRun, "Unexpected machine-control function found.");

        (bool hasDispatch, ) = address(ledger).call(abi.encodeWithSignature("dispatchCommand(bytes)"));
        require(!hasDispatch, "Unexpected command dispatch function found.");
    }

    function testNoCommandDispatchFunctionExists() public {
        (bool hasRun, ) = address(ledger).call(abi.encodeWithSignature("dispatchCommandToMachine(bytes)"));
        require(!hasRun, "Unexpected machine dispatch function found.");
    }
}
