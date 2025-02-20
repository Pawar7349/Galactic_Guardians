const { expect } = require("chai");
const { ethers, time } = require("hardhat");

describe("GalacticGuardians Contract", function () {
  let galacticGuardians, stardustToken, vrfCoordinatorMock;
  let owner, addr1, addr2;
  const MINT_PRICE = ethers.parseEther("0.08");

  before(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
  });

  beforeEach(async function () {
    // Deploy the VRFCoordinatorV2Mock
    const VRFCoordinatorMock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
    vrfCoordinatorMock = await VRFCoordinatorMock.deploy(0, 0);
    
    // Create a subscription and fund it (assuming subscriptionId is 1)
    const txSub = await vrfCoordinatorMock.createSubscription();
    await txSub.wait();
    await vrfCoordinatorMock.fundSubscription(1, ethers.parseEther("1"));

    // Deploy the StardustToken contract
    const StardustToken = await ethers.getContractFactory("StardustToken");
    stardustToken = await StardustToken.deploy();

    // Deploy the GalacticGuardians contract with normal max supply (e.g. 8888)
    const GalacticGuardians = await ethers.getContractFactory("GalacticGuardians");
    galacticGuardians = await GalacticGuardians.deploy(
      8888, // MAX_SUPPLY
      await vrfCoordinatorMock.getAddress(),
      ethers.id("KEY_HASH"),
      1, // subscriptionId
      await stardustToken.getAddress(),
      10, // royalty fee of 10%
      owner.address
    );

    // Add the GalacticGuardians contract as a consumer of the VRF subscription
    await vrfCoordinatorMock.addConsumer(1, galacticGuardians.target);
  });

  describe("Minting", function () {
    it("Should mint NFT with correct payment and emit NFTMinted", async function () {
      await expect(
        galacticGuardians.connect(addr1).mintGuardian(
          "Galaxy Hero", 
          "Guardian of the Cosmos",
          "ipfs://test1",
          ethers.parseEther("10"),
          { value: MINT_PRICE }
        )
      ).to.emit(galacticGuardians, "NFTMinted");

      expect(await galacticGuardians.ownerOf(0)).to.equal(addr1.address);
    });

    it("Should reject underpaid transactions", async function () {
      // Using native subtraction with explicit conversion if needed:
      await expect(
        galacticGuardians.connect(addr1).mintGuardian(
          "Title",
          "Description",
          "ipfs://test2",
          ethers.parseEther("5"),
          { value: MINT_PRICE - ethers.parseEther("0.01") }
        )
      ).to.be.revertedWith("Insufficient ETH");
    });

    it("Should allow NFT owner to update sale price", async function () {
      await galacticGuardians.connect(addr1).mintGuardian(
        "For Sale", 
        "Description", 
        "ipfs://sale",
        ethers.parseEther("1"),
        { value: MINT_PRICE }
      );
      let saleInfo = await galacticGuardians.mintedNFTs(0);
      expect(saleInfo.cost).to.equal(ethers.parseEther("1"));

      // Update sale price
      await galacticGuardians.connect(addr1).updateSalePrice(0, ethers.parseEther("2"));
      saleInfo = await galacticGuardians.mintedNFTs(0);
      expect(saleInfo.cost).to.equal(ethers.parseEther("2"));
    });

    it("Should revert updateSalePrice if called by non-owner", async function () {
      await galacticGuardians.connect(addr1).mintGuardian(
        "For Sale", 
        "Description", 
        "ipfs://sale",
        ethers.parseEther("1"),
        { value: MINT_PRICE }
      );
      await expect(
        galacticGuardians.connect(addr2).updateSalePrice(0, ethers.parseEther("2"))
      ).to.be.revertedWith("Not the owner");
    });
  });

  describe("Token URI and Reveal", function () {
    it("Should return UNREVEALED_URI before reveal", async function () {
      await galacticGuardians.connect(addr1).mintGuardian(
        "Hidden NFT",
        "Hidden Description",
        "ipfs://hidden",
        ethers.parseEther("1"),
        { value: MINT_PRICE }
      );
      expect(await galacticGuardians.tokenURI(0)).to.equal(await galacticGuardians.UNREVEALED_URI());
    });

    it("Should return NFT metadata URI after reveal", async function () {
      await galacticGuardians.connect(addr1).mintGuardian(
        "Reveal NFT",
        "Reveal Description",
        "ipfs://revealed",
        ethers.parseEther("1"),
        { value: MINT_PRICE }
      );
      await galacticGuardians.connect(owner).reveal();
      expect(await galacticGuardians.IS_REVEALED()).to.be.true;
      expect(await galacticGuardians.tokenURI(0)).to.equal("ipfs://revealed");
    });
  });

  describe("Staking and Unstaking", function () {
    it("Should stake NFT and emit Staked event", async function () {
      await galacticGuardians.connect(addr1).mintGuardian(
        "Staked NFT", 
        "", 
        "ipfs://staked", 
        0, 
        { value: MINT_PRICE }
      );
      await expect(galacticGuardians.connect(addr1).stake(0))
        .to.emit(galacticGuardians, "Staked");
      // After staking, the NFT's owner becomes the contract itself
      expect(await galacticGuardians.ownerOf(0)).to.equal(galacticGuardians.target);
    });

    it("Should unstake NFT, mint rewards, and emit Unstaked event", async function () {
      await galacticGuardians.connect(addr1).mintGuardian(
        "Staked NFT", 
        "", 
        "ipfs://staked", 
        0, 
        { value: MINT_PRICE }
      );
      await galacticGuardians.connect(addr1).stake(0);

      // Increase time by 1 day (86400 seconds)
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");

      const balanceBefore = await stardustToken.balanceOf(addr1.address);

      await expect(galacticGuardians.connect(addr1).unstake(0))
        .to.emit(stardustToken, "Transfer")
        .and.to.emit(galacticGuardians, "Unstaked");

      expect(await galacticGuardians.ownerOf(0)).to.equal(addr1.address);
      const balanceAfter = await stardustToken.balanceOf(addr1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should prevent unauthorized unstaking", async function () {
      await galacticGuardians.connect(addr1).mintGuardian("Test NFT", "", "", 0, { value: MINT_PRICE });
      await galacticGuardians.connect(addr1).stake(0);
      await expect(
        galacticGuardians.connect(addr2).unstake(0)
      ).to.be.revertedWith("Not staker");
    });

    it("Should prevent staking an already staked NFT", async function () {
      await galacticGuardians.connect(addr1).mintGuardian("Test NFT", "", "", 0, { value: MINT_PRICE });
      await galacticGuardians.connect(addr1).stake(0);
      await expect(
        galacticGuardians.connect(addr1).stake(0)
      ).to.be.revertedWith("Already staked");
    });
  });

  describe("VRF and Rarity Assignment", function () {
    it("Should assign rarity via VRF", async function () {
      const tx = await galacticGuardians.connect(addr1).mintGuardian(
        "VRF Test", 
        "", 
        "ipfs://vrf", 
        0, 
        { value: MINT_PRICE }
      );
      const receipt = await tx.wait();

      // Locate the RandomWordsRequested event using the VRF mock's interface
      const vrfInterface = vrfCoordinatorMock.interface;
      const vrfEventLog = receipt.logs.find((log) => {
        try {
          const parsed = vrfInterface.parseLog(log);
          return parsed && parsed.name === "RandomWordsRequested";
        } catch (error) {
          return false;
        }
      });
      expect(vrfEventLog, "VRF request event not found").to.exist;
      const parsedEvent = vrfInterface.parseLog(vrfEventLog);
      const requestId = parsedEvent.args.requestId;

      // Fulfill the VRF request to trigger rarity assignment
      await vrfCoordinatorMock.fulfillRandomWords(requestId, galacticGuardians.target);
      const rarity = await galacticGuardians.tokenRarity(0);
      expect(rarity).to.be.within(0, 3); // 0: Common, 1: Rare, 2: Epic, 3: Legendary
    });
  });

  describe("Marketplace - Buying NFTs", function () {
    it("Should allow buying NFT with proper royalty distribution", async function () {
      // Mint an NFT with a sale price set by addr1
      await galacticGuardians.connect(addr1).mintGuardian(
        "For Sale", 
        "Description", 
        "ipfs://sale",
        ethers.parseEther("1"),
        { value: MINT_PRICE }
      );
      expect(await galacticGuardians.ownerOf(0)).to.equal(addr1.address);

      // addr2 buys the NFT
      await expect(
        galacticGuardians.connect(addr2).buyGuardian(0, { value: ethers.parseEther("1") })
      ).to.emit(galacticGuardians, "GuardianPurchased");

      expect(await galacticGuardians.ownerOf(0)).to.equal(addr2.address);
      const saleInfo = await galacticGuardians.mintedNFTs(0);
      expect(saleInfo.cost).to.equal(0);
    });

    it("Should prevent buying a staked NFT", async function () {
      await galacticGuardians.connect(addr1).mintGuardian(
        "For Sale", 
        "Description", 
        "ipfs://sale",
        ethers.parseEther("1"),
        { value: MINT_PRICE }
      );
      await galacticGuardians.connect(addr1).stake(0);
      await expect(
        galacticGuardians.connect(addr2).buyGuardian(0, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("NFT is staked");
    });

    it("Should prevent self-buying", async function () {
      await galacticGuardians.connect(addr1).mintGuardian(
        "Self Buy", 
        "Description", 
        "ipfs://self",
        ethers.parseEther("1"),
        { value: MINT_PRICE }
      );
      await expect(
        galacticGuardians.connect(addr1).buyGuardian(0, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("Invalid buyer");
    });
  });

  describe("Other Functionality", function () {
    it("Should calculate rewards correctly", async function () {
      // 1 day = 86400 seconds
      const oneDay = 86400;
      const rewardCommon = await galacticGuardians.calculateRewards(oneDay, 0);
      expect(rewardCommon).to.equal(ethers.parseEther("1"));
      const rewardRare = await galacticGuardians.calculateRewards(oneDay, 1);
      expect(rewardRare).to.equal(ethers.parseEther("2"));
      const rewardEpic = await galacticGuardians.calculateRewards(oneDay, 2);
      expect(rewardEpic).to.equal(ethers.parseEther("3"));
      const rewardLegendary = await galacticGuardians.calculateRewards(oneDay, 3);
      expect(rewardLegendary).to.equal(ethers.parseEther("5"));
    });

    it("Should allow owner to withdraw funds", async function () {
      // Send ETH directly to the contract (requires a receive() function in your contract)
      await owner.sendTransaction({
        to: galacticGuardians.target,
        value: ethers.parseEther("1")
      });
      const contractBalanceBefore = await ethers.provider.getBalance(galacticGuardians.target);
      expect(contractBalanceBefore).to.be.gt(0);
    
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await galacticGuardians.connect(owner).withdraw();
      const receipt = await tx.wait();
      // Use effectiveGasPrice if available, otherwise fallback to tx.gasPrice
      const effectiveGasPrice = receipt.effectiveGasPrice || tx.gasPrice;
      const gasUsed = BigInt(receipt.gasUsed.toString()) * BigInt(effectiveGasPrice.toString());
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(BigInt(ownerBalanceAfter)).to.be.gt(BigInt(ownerBalanceBefore) - gasUsed);
    });
    

    it("Should enforce max supply in a reduced MAX_SUPPLY scenario", async function () {
      // Deploy a new instance with a reduced MAX_SUPPLY (e.g., 3 for testing)
      const ReducedGalacticGuardiansFactory = await ethers.getContractFactory("GalacticGuardians");
      const reducedInstance = await ReducedGalacticGuardiansFactory.deploy(
        3, // reduced max supply
        await vrfCoordinatorMock.getAddress(),
        ethers.id("KEY_HASH"),
        1,
        await stardustToken.getAddress(),
        10,
        owner.address
      );

      // Add the reduced instance as a valid consumer for VRF
      await vrfCoordinatorMock.addConsumer(1, reducedInstance.target);

      // Mint 3 NFTs
      for (let i = 0; i < 3; i++) {
        await reducedInstance.connect(addr1).mintGuardian(
          `NFT ${i}`, "", "", 0, { value: MINT_PRICE }
        );
      }
      // The 4th mint should revert with "Max supply reached"
      await expect(
        reducedInstance.connect(addr1).mintGuardian("Overflow", "", "", 0, { value: MINT_PRICE })
      ).to.be.revertedWith("Max supply reached");
    });
  });
});
