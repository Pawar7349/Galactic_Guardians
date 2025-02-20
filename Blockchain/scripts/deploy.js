const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy mock VRF Coordinator first
  const VRFCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
  const vrfCoordinator = await VRFCoordinatorV2Mock.deploy(
    ethers.parseEther("0.1"), // Base fee
    1e9 // Gas price per link
  );
  await vrfCoordinator.waitForDeployment();
  const vrfCoordinatorAddress = await vrfCoordinator.getAddress();
  console.log("VRFCoordinatorV2Mock deployed to:", vrfCoordinatorAddress);

  // Create a subscription for VRF
  const tx = await vrfCoordinator.createSubscription();
  const receipt = await tx.wait();

  if (!receipt.logs || receipt.logs.length === 0) {
    throw new Error("No logs found in transaction receipt. Check VRFCoordinatorV2Mock contract.");
  }

  // Decode the event manually
  const event = receipt.logs[0];
  const decodedEvent = vrfCoordinator.interface.decodeEventLog(
    "SubscriptionCreated",
    event.data,
    event.topics
  );
  const subId = decodedEvent.subId.toString();
  console.log("Created subscription ID:", subId.toString());

  // Deploy Stardust Token
  const StardustToken = await ethers.getContractFactory("StardustToken");
  console.log("Deploying StardustToken...");
  const stardustToken = await StardustToken.deploy();
  await stardustToken.waitForDeployment();
  const stardustTokenAddress = await stardustToken.getAddress();
  console.log("StardustToken deployed to:", stardustTokenAddress);

  // Deploy GalacticGuardians
  const GalacticGuardians = await ethers.getContractFactory("GalacticGuardians");
  console.log("Deploying GalacticGuardians...");

  console.log("Deploying GalacticGuardians with the following arguments:");
  console.log("VRF Coordinator Address:", vrfCoordinatorAddress);
  console.log("Key Hash:", "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc");
  console.log("Subscription ID:", subId);
  console.log("Stardust Token Address:", stardustTokenAddress);
  console.log("Royalty Fee:", 10);
  console.log("Deployer Address:", deployer.address);

  const galacticGuardians = await GalacticGuardians.deploy(
    10000,
    vrfCoordinatorAddress,
    "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    subId,
    stardustTokenAddress,
    10, // Royalty fee
    deployer.address
  );
  await galacticGuardians.waitForDeployment();
  console.log("GalacticGuardians deployed to:", await galacticGuardians.getAddress());

 
  // Configure VRF Subscription
  console.log("\n5. Configuring VRF Subscription...");
  await vrfCoordinator.addConsumer(subId, galacticGuardians.getAddress());
  console.log("Added consumer to subscription");


  // Fund the subscription
  await vrfCoordinator.fundSubscription(subId, ethers.parseEther("1"));
  console.log("Funded subscription with 1 LINK");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


