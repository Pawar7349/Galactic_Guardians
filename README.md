# Galactic Guardians

![Galactic Guardians Logo](./assets/BG_IMG/logo.png)

Galactic Guardians is a decentralized NFT platform that brings together a diverse collection of unique digital guardians—each with its own story, rarity, and special traits. Built as a DApp on the Ethereum blockchain, Galactic Guardians empowers users to explore, buy, and stake NFTs while participating in a vibrant community of collectors and digital art enthusiasts.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Smart Contracts](#smart-contracts)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

**Galactic Guardians** is not just another NFT collection—it's an immersive experience that blends digital art, storytelling, and blockchain technology. Users can:
- **Explore** a dynamic marketplace of NFTs
- **Collect** exclusive digital guardians that hold unique traits and histories
- **Stake** NFTs to earn rewards or unlock exclusive features
- **Engage** with the community through decentralized interactions

---

## Features

- **NFT Marketplace:** Browse, buy, and sell unique NFTs directly from your wallet.
- **Collection Management:** View your personal NFT collection, including staked and unstaked tokens.
- **Staking Mechanism:** Stake your NFTs to participate in special rewards or events.
- **Wallet Integration:** Seamless connection with MetaMask and other Ethereum wallets.
- **Decentralized Contact:** Send messages directly on-chain without relying on centralized servers.
- **Responsive UI:** A modern, responsive interface built with Material UI and enhanced with Framer Motion animations.

---

## Technology Stack

- **Frontend:**  
  - [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
  - [Material UI](https://mui.com/) for UI components and styling
  - [Framer Motion](https://www.framer.com/motion/) for smooth animations

- **Blockchain Integration:**  
  - [ethers.js](https://docs.ethers.io/v5/) for interacting with smart contracts
  - MetaMask for wallet integration

- **Tooling:**  
  - [Vite](https://vitejs.dev/) for fast development builds (or create-react-app if preferred)
  - [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/) for code quality

---

## Installation & Setup

### Prerequisites

- **Node.js** (v14 or later)
- **Yarn** or **npm**
- **MetaMask** installed in your browser

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Pawar7349/Galactic_Guardians
   cd galactic-guardians

2. **Install dependencies:**

  ```bash
   npm install
    # or
   yarn install
  ```
3. **Configure Environment Variables:**

 ```bash
  VITE_PINATA_JWT=your_pinata_jwt_here
  REACT_APP_CONTRACT_ADDRESS=your_contract_address_here
  REACT_APP_NETWORK=mainnet # or rinkeby, etc.
  ```

4. **Start the Development Server:**

 ```bash
  npm run dev
    # or
  yarn dev

  ```

5. **Open your browser:**

Navigate to http://localhost:3000 (or the port specified by your development server) and connect your MetaMask wallet to begin exploring.

 ## Usage
**Marketplace:**
Browse all available NFTs in the marketplace. Click on any NFT card to view detailed information and purchase options. The integrated "Buy" and "Cart" buttons ensure seamless transactions.

**Collection:**
Manage your personal NFT collection, view staked tokens, and easily stake or unstake NFTs with real-time feedback from your smart contract interactions.

**Contact:**
Use the on-chain contact form to send messages directly via blockchain transactions. Your message is recorded on-chain, ensuring transparency and decentralization.

**About:**
Learn more about the story behind Galactic Guardians and our vision for a decentralized digital art future.


## Smart Contracts

This DApp interacts with a set of smart contracts deployed on the Ethereum blockchain. Key functionalities include:

**NFT Minting & Marketplace:**
Functions like mintNFT, buyGuardian, and reveal manage the creation and trading of NFTs.

**Staking:**
The stake and unstake functions allow users to lock their NFTs for rewards or special privileges.

**On-Chain Messaging:**
A dedicated function, such as sendMessage, records contact form submissions on-chain.

**Note: Ensure your wallet is connected and configured for the correct network (e.g., Mainnet, Rinkeby) to interact with these contracts.**


## Contributing
Contributions are welcome! If you'd like to help improve Galactic Guardians:

1. Fork the repository.
2. Create a new branch: ```git checkout -b feature/your-feature-name```
3. Commit your changes: ```git commit -m 'Add new feature```
4. Push to the branch: ```git push origin feature/your-feature-name```
5. Open a pull request.
6. Please ensure your code follows our coding standards and      includes tests where applicable.



## License
This project is licensed under the MIT License.

## Contact
For any questions, suggestions, or issues, please feel free to reach out:

Email: pawarpratik7349@gmail.com

Twitter: https://x.com/PratikP43786754

Discord: https://discord.com/users/1238565845312082005
