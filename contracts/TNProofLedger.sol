// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TNProofLedger {
    event EvidenceAnchored(
        bytes32 indexed runId,
        bytes32 indexed evidenceHash,
        bytes32 indexed eventType,
        address anchorer,
        uint256 timestamp,
        string uri
    );

    mapping(bytes32 => bool) public anchored;

    function anchorEvidence(
        bytes32 runId,
        bytes32 evidenceHash,
        bytes32 eventType,
        string calldata uri
    ) external {
        require(!anchored[evidenceHash], "Already anchored");
        anchored[evidenceHash] = true;

        emit EvidenceAnchored(
            runId,
            evidenceHash,
            eventType,
            msg.sender,
            block.timestamp,
            uri
        );
    }

    function isAnchored(bytes32 evidenceHash) external view returns (bool) {
        return anchored[evidenceHash];
    }
}
