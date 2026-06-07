// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { TNProofLedger } from "../contracts/TNProofLedger.sol";

contract DeployTNProofLedger {
  function run() external {
    // Runtime deployments can be performed by wrapping this contract with a standard
    // Forge broadcast command and a wallet configured in your environment.
    new TNProofLedger();
  }
}
