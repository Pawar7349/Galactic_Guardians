// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

interface IStardustToken {
    function mint(address to, uint256 amount) external;
}

contract GalacticGuardians is ERC721, ERC721Enumerable, Ownable, VRFConsumerBaseV2, ReentrancyGuard {
    using Strings for uint256;

    IStardustToken public STARDUST_TOKEN;
    VRFCoordinatorV2Interface public COORDINATOR;

    // MAX_SUPPLY is now an immutable variable set via the constructor
    uint256 public immutable MAX_SUPPLY;
    uint256 public MINT_PRICE = 0.08 ether;
    string public UNREVEALED_URI = "ipfs://bafkreicqkcoekg2bpekbquh2yqptc44clpe36qbufkprj6v7cofwgsjx5e";
    bool public IS_REVEALED = false;

    enum Rarity { Common, Rare, Epic, Legendary }
    mapping(uint256 => Rarity) public tokenRarity;

    struct StakingInfo {
        uint256 stakedSince;
        address owner;
    }
    mapping(uint256 => StakingInfo) public stakedTokens;

    // Chainlink VRF variables
    uint64 public s_subscriptionId;
    bytes32 public s_keyHash;
    uint32 public callbackGasLimit = 200000;
    mapping(uint256 => uint256) public requestIdToTokenId;

    address public artist;
    uint256 public royalityFee;

    struct TransactionStruct {
        address owner;
        uint256 cost;
        string title;
        string description;
        string metadataURI;
        uint256 timestamp;
    }
    mapping(uint256 => TransactionStruct) public mintedNFTs;

    // Events
    event NFTMinted(address indexed owner, uint256 indexed tokenId);
    event Staked(address indexed owner, uint256 indexed tokenId);
    event Unstaked(address indexed owner, uint256 indexed tokenId, uint256 rewards);
    event GuardianPurchased(address indexed buyer, uint256 indexed tokenId, uint256 price);
    event RarityAssigned(uint256 indexed tokenId, Rarity rarity);

    constructor(
        uint256 maxSupply,
        address vrfCoordinator,
        bytes32 keyHash,
        uint64 subscriptionId,
        address stardustTokenAddress,
        uint256 _royalityFee,
        address _artist
    )
        ERC721("Galactic Guardians", "GGNFT")
        VRFConsumerBaseV2(vrfCoordinator)
    {
        MAX_SUPPLY = maxSupply;
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_keyHash = keyHash;
        s_subscriptionId = subscriptionId;
        STARDUST_TOKEN = IStardustToken(stardustTokenAddress);
        royalityFee = _royalityFee;
        artist = _artist;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // Update mintedNFTs on transfers (reset sale price on non-mint transfers)
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._afterTokenTransfer(from, to, tokenId, batchSize);
        if (_exists(tokenId)) {
            mintedNFTs[tokenId].owner = to;
            if (from != address(0)) {
                mintedNFTs[tokenId].cost = 0;
            }
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function totalSupply() public view override returns (uint256) {
        return super.totalSupply();
    }

    function mintGuardian(
        string memory title,
        string memory description,
        string memory metadataURI,
        uint256 salesPrice
    ) public payable nonReentrant {
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");
        require(msg.value >= MINT_PRICE, "Insufficient ETH");

        uint256 tokenId = totalSupply();
        _safeMint(msg.sender, tokenId);

        uint256 royality = (msg.value * royalityFee) / 100;
        (bool success, ) = artist.call{value: royality}("");
        require(success, "Transfer to artist failed");

        (success, ) = owner().call{value: msg.value - royality}("");
        require(success, "Transfer to owner failed");

        uint256 requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            3,
            callbackGasLimit,
            1
        );
        requestIdToTokenId[requestId] = tokenId;

        mintedNFTs[tokenId] = TransactionStruct(
            msg.sender,
            salesPrice,
            title,
            description,
            metadataURI,
            block.timestamp
        );
        emit NFTMinted(msg.sender, tokenId);
    }

    function updateSalePrice(uint256 tokenId, uint256 newSalePrice) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        mintedNFTs[tokenId].cost = newSalePrice;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return IS_REVEALED 
            ? mintedNFTs[tokenId].metadataURI 
            : UNREVEALED_URI;
    }

    // Modified stake: first check if already staked, then ownership.
    function stake(uint256 tokenId) external nonReentrant {
        require(stakedTokens[tokenId].stakedSince == 0, "Already staked");
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        _transfer(msg.sender, address(this), tokenId);
        stakedTokens[tokenId] = StakingInfo(block.timestamp, msg.sender);
        emit Staked(msg.sender, tokenId);
    }

    function unstake(uint256 tokenId) external nonReentrant {
        StakingInfo memory info = stakedTokens[tokenId];
        require(info.owner == msg.sender, "Not staker");
        
        uint256 stakedTime = block.timestamp - info.stakedSince;
        uint256 rewards = calculateRewards(stakedTime, tokenRarity[tokenId]);
        
        STARDUST_TOKEN.mint(msg.sender, rewards);
        _transfer(address(this), msg.sender, tokenId);
        
        delete stakedTokens[tokenId];
        emit Unstaked(msg.sender, tokenId, rewards);
    }

    // Modified buyGuardian: uses _transfer to bypass approval checks.
    function buyGuardian(uint256 tokenId) external payable nonReentrant {
        require(stakedTokens[tokenId].stakedSince == 0, "NFT is staked");

        TransactionStruct storage nft = mintedNFTs[tokenId];
        require(msg.value >= nft.cost, "Insufficient ETH");
        require(msg.sender != nft.owner, "Invalid buyer");

        address seller = nft.owner;
        _transfer(seller, msg.sender, tokenId);

        uint256 royalty = (msg.value * royalityFee) / 100;
        (bool success, ) = artist.call{value: royalty}("");
        require(success, "Transfer to artist failed");

        (success, ) = seller.call{value: msg.value - royalty}("");
        require(success, "Transfer to seller failed");

        emit GuardianPurchased(msg.sender, tokenId, msg.value);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 tokenId = requestIdToTokenId[requestId];
        uint256 rand = randomWords[0] % 100;

        if (rand < 2) tokenRarity[tokenId] = Rarity.Legendary;
        else if (rand < 10) tokenRarity[tokenId] = Rarity.Epic;
        else if (rand < 30) tokenRarity[tokenId] = Rarity.Rare;
        else tokenRarity[tokenId] = Rarity.Common;

        emit RarityAssigned(tokenId, tokenRarity[tokenId]);
    }

    function reveal() external onlyOwner {
        require(!IS_REVEALED, "Already revealed");
        IS_REVEALED = true;
    }

    function calculateRewards(uint256 stakedTime, Rarity rarity) public pure returns (uint256) {
        uint256 baseReward = stakedTime * 1 ether / 1 days;
        if (rarity == Rarity.Legendary) return baseReward * 5;
        if (rarity == Rarity.Epic) return baseReward * 3;
        if (rarity == Rarity.Rare) return baseReward * 2;
        return baseReward;
    }

    function withdraw() external onlyOwner nonReentrant {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    // Allow the contract to receive ETH directly
    receive() external payable {}
}
