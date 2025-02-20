const { ethers } = require("hardhat");

async function main() {
  const [deployer, user] = await ethers.getSigners();

  // Attach to deployed contracts
  const galacticGuardians = await ethers.getContractAt(
    "GalacticGuardians",
    "0x68B1D87F95878fE05B998F19b66F4baba5De1aed"
  );

  // Example interactions
  console.log("Minting NFT...");
  const mintTx = await galacticGuardians.connect(user).mintGuardian(
    "Galaxy Hero",          // title
    "Rare space warrior",   // description
    "ipfs://Qm.../1.json",  // metadataURI
    ethers.parseEther("0.1"), // salesPrice
    { value: ethers.parseEther("0.08") } // Mint price
  );

  await mintTx.wait();
  console.log("NFT minted successfully");

  const totalSupply = await galacticGuardians.totalSupply();
  console.log("Total Supply:", totalSupply.toString());

  // Check VRF fulfillment status instead
  const tokenId = totalSupply - 1n
  const rarity = await galacticGuardians.tokenRarity(tokenId);
  console.log("Token Rarity:", Rarity[Number(rarity)]);
}

// Helper for rarity enum
const Rarity = ["Common", "Rare", "Epic", "Legendary"];

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
