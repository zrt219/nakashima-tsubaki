const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying TNProofLedger with account:", deployer.address);

  const TNProofLedger = await hre.ethers.getContractFactory("TNProofLedger");
  const proofLedger = await TNProofLedger.deploy();

  await proofLedger.waitForDeployment();
  const address = await proofLedger.getAddress();

  console.log("TNProofLedger deployed to:", address);
  console.log("Update your .env.local TN_PROOF_CONTRACT_ADDRESS with this address.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
