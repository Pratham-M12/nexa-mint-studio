# Nexa Mint Studio — NFT Minting DApp

> A full-stack ERC-721 NFT minting application built with Solidity, React, ethers.js, MetaMask, Ethereum Sepolia, and Pinata/IPFS.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-3.13.0-yellow?logo=ethereum)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2.0-646cff?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![ethers.js](https://img.shields.io/badge/ethers.js-6.17.0-blue)](https://docs.ethers.org/v6/)
[![Network](https://img.shields.io/badge/Network-Ethereum_Sepolia-blueviolet)](https://sepolia.etherscan.io/)
[![Storage](https://img.shields.io/badge/Storage-Pinata_IPFS_V3-teal)](https://pinata.cloud/)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Screenshots](#screenshots)
4. [Technology Stack](#technology-stack)
5. [Architecture](#architecture)
6. [NFT Minting Workflow](#nft-minting-workflow)
7. [NFT Transfer Workflow](#nft-transfer-workflow)
8. [Repository Structure](#repository-structure)
9. [Prerequisites](#prerequisites)
10. [Installation and Setup](#installation-and-setup)
11. [Environment Variables](#environment-variables)
12. [Existing Sepolia Deployment](#existing-sepolia-deployment)
13. [Testing and Verification](#testing-and-verification)
14. [Troubleshooting](#troubleshooting)
15. [Security Considerations](#security-considerations)
16. [Limitations and Future Scope](#limitations-and-future-scope)
17. [License and Credits](#license-and-credits)

---

## Project Overview

**Nexa Mint Studio** is an educational, full-stack Web3 application designed to demonstrate the complete lifecycle of Non-Fungible Tokens (NFTs) conforming to the Ethereum **ERC-721** standard.

The application allows users to:
1. Connect their non-custodial **MetaMask** wallet and interact with the **Ethereum Sepolia Testnet**.
2. Upload original artwork directly to the decentralized **IPFS** network via **Pinata's V3 Files API**.
3. Generate standard **ERC-721 JSON metadata** and pin it to IPFS.
4. Execute on-chain minting transactions by interacting with the deployed `MyNFT.sol` smart contract.
5. Browse their personal NFT collection with live IPFS gateway resolution.
6. Transfer NFT ownership securely to another Ethereum address on-chain.

### Understanding On-Chain vs. Off-Chain Data

A critical concept demonstrated by Nexa Mint Studio is the separation of on-chain and off-chain data:

* **On-Chain Data (Ethereum Sepolia):**
  * Token identifiers (`tokenId`: `0`, `1`, `2`, ...).
  * Ownership registry (`ownerOf(tokenId)` mapping an ID to an Ethereum `address`).
  * Token balances (`balanceOf(address)`).
  * Immutable Token URI pointers (`tokenURI(tokenId)` pointing to an `ipfs://<CID>` address).
  * Transfer and approval event logs (`Transfer(from, to, tokenId)`).
* **Off-Chain Data (Decentralized IPFS):**
  * Binary artwork files (PNG, JPG, SVG, GIF, WebP).
  * Rich ERC-721 metadata JSON schemas (title, description, attributes/traits, timestamp, and artwork IPFS URI).

Because storing raw image binaries directly on the Ethereum blockchain is cost-prohibitive, only cryptographic content hashes (CIDs) and state pointers are stored on-chain, while the actual artwork and metadata files remain tamper-proof and permanently available on IPFS.

---

## Features

- **MetaMask Wallet Integration:** Seamless connection via EIP-1193 browser provider with live Sepolia ETH balance display and formatted address badges.
- **Network Detection & Switching:** Automatic detection of the connected network; prompts and executes one-click network switching to Ethereum Sepolia (`chainId: 11155111` / `0xaa36a7`).
- **Decentralized Storage via Pinata V3:** Direct integration with Pinata's modern V3 Files API (`https://uploads.pinata.cloud/v3/files`) supporting scoped API keys (`Files: Write`) without requiring broad Admin access.
- **ERC-721 Metadata Generation:** Complies with OpenSea and ERC-721 metadata standards, creating JSON payloads with attributes, creators, and IPFS image URIs.
- **On-Chain Minting Execution:** Calls `mintNFT(string tokenURI)` using ethers.js contract signers, handling MetaMask approval prompts and gas estimation.
- **Live Transaction Pipeline:** Visual multi-stage status tracker reflecting artwork pinning, metadata pinning, wallet signature, network broadcast, and block confirmation.
- **Token ID & Ownership Verification:** Extracts the minted `tokenId` directly from the transaction's emitted `Transfer` event and validates ownership on-chain via `ownerOf(tokenId)`.
- **My Collection Gallery:** Displays all NFTs minted and owned by the connected wallet, with dedicated IPFS gateway resolution and multi-gateway fallbacks.
- **NFT Detail Inspector:** Deep inspection modal displaying metadata traits, contract address, token ID, raw IPFS URIs, gateway URLs, and Sepolia Etherscan explorer links.
- **ERC-721 Token Transfers:** Built-in transfer modal enabling users to transfer owned tokens using `transferFrom` with rigorous recipient address validation.
- **Live Activity Telemetry:** Real-time log tracking mints and transfers with direct links to the Sepolia block explorer.
- **In-App Studio Settings:** Dedicated settings modal allowing runtime override of contract addresses or Pinata API tokens via browser local storage.

---

## Screenshots

The repository provides a structured screenshot directory at [`docs/screenshots/`](docs/screenshots/). 

| Feature View | Suggested Filename | Description |
| :--- | :--- | :--- |
| **Main Dashboard** | `docs/screenshots/dashboard.png` | Overview metrics, connected wallet, contract summary, and quick links. |
| **Mint Studio** | `docs/screenshots/mint-studio.png` | Artwork drag-and-drop uploader, metadata inputs, and live transaction pipeline. |
| **My Collection** | `docs/screenshots/my-collection.png` | Responsive gallery of NFTs owned by the user with artwork previews. |
| **NFT Details Modal** | `docs/screenshots/nft-details.png` | Detailed view of token metadata, traits, IPFS CIDs, and Etherscan links. |
| **Mint Success Modal** | `docs/screenshots/mint-success.png` | Confirmation modal showing transaction hash, block confirmation, and Token ID. |
| **Transfer Modal** | `docs/screenshots/transfer.png` | ERC-721 token transfer dialogue with recipient address validation. |

> *To capture and add screenshots to your clone of this repository, follow the guidelines in [`docs/screenshots/README.md`](docs/screenshots/README.md).*

---

## Technology Stack

### Smart Contract & Blockchain
* **Solidity:** `^0.8.20`
* **OpenZeppelin Contracts:** `v5.0.2` (`ERC721.sol`, `Ownable.sol`)
* **Hardhat Development Environment:** `v3.13.0`
* **Hardhat Ethers Plugin:** `@nomicfoundation/hardhat-ethers` `v4.0.15`
* **Network:** Ethereum Sepolia Testnet (`chainId: 11155111`)

### Frontend
* **UI Library:** React `v19.0.0`
* **Build Tool:** Vite `v8.2.0`
* **Language:** TypeScript `v5.7.0`
* **Styling:** Tailwind CSS `v4.0.0` (`@tailwindcss/vite` plugin)
* **Design Aesthetic:** Dark neon glassmorphism with high-contrast typography

### Web3 & Storage Integrations
* **Web3 Library:** `ethers.js` `v6.17.0`
* **Wallet Provider:** MetaMask Browser Extension (EIP-1193)
* **IPFS Pinning Service:** Pinata Cloud V3 Files API (`https://uploads.pinata.cloud/v3/files`)
* **IPFS Gateways:** Multi-gateway resolution (`gateway.pinata.cloud`, `cloudflare-ipfs.com`, `ipfs.io`, `dweb.link`)

---

## Architecture

The diagram below details the data flow between the user, the Nexa Mint Studio frontend, Pinata IPFS, MetaMask, and the deployed Ethereum Sepolia contract.

```mermaid
flowchart TD
    subgraph Client["User & Browser Environment"]
        User(["User"])
        UI["Nexa Mint Studio (React 19 + Vite)"]
        MM["MetaMask Wallet (EIP-1193 Provider)"]
    end

    subgraph Storage["Decentralized Storage (Pinata Cloud)"]
        PinataAPI["Pinata V3 Files API (uploads.pinata.cloud)"]
        IPFSArtwork[("IPFS Artwork Binary (CID)")]
        IPFSMetadata[("IPFS Metadata JSON (CID)")]
    end

    subgraph Blockchain["Ethereum Sepolia Testnet"]
        SepoliaRPC["Sepolia JSON-RPC Endpoint"]
        Contract["MyNFT Contract (0xD4466aBA...95A8EdeCf)"]
        Etherscan["Sepolia Etherscan Explorer"]
    end

    %% Interactions
    User -->|"1. Connects wallet & enters NFT details"| UI
    UI <-->|"2. Requests accounts & signature"| MM
    UI -->|"3. POST /v3/files (Artwork)"| PinataAPI
    PinataAPI -->|"Stores binary"| IPFSArtwork
    PinataAPI -->>|"Returns Image CID"| UI
    
    UI -->|"4. Generates JSON & POST /v3/files (Metadata)"| PinataAPI
    PinataAPI -->|"Stores JSON with Image CID"| IPFSMetadata
    PinataAPI -->>|"Returns Metadata CID"| UI

    UI -->|"5. ethers.Contract.mintNFT(ipfs://CID)"| MM
    MM -->|"6. Signs & broadcasts transaction"| SepoliaRPC
    SepoliaRPC -->|"7. Executes mintNFT()"| Contract
    Contract -->|"8. Emits Transfer(0x0, user, tokenId)"| SepoliaRPC
    SepoliaRPC -->>|"9. Transaction Receipt + Logs"| UI
    
    UI -.->|"10. View on Etherscan"| Etherscan
    UI -->|"11. Resolves tokenURI via HTTP Gateways"| IPFSArtwork
```

---

## NFT Minting Workflow

The minting process executes a 13-step pipeline ensuring complete cryptographic verification:

```
[Connect Wallet] ➔ [Select Artwork] ➔ [Pin Image to IPFS] ➔ [Obtain Image CID] 
➔ [Build ERC-721 Metadata] ➔ [Pin Metadata to IPFS] ➔ [Obtain Metadata CID] 
➔ [Format ipfs:// URI] ➔ [Invoke mintNFT()] ➔ [MetaMask Signature] 
➔ [Sepolia Confirmation] ➔ [Parse Transfer Event] ➔ [Verify ownerOf()]
```

1. **Connect MetaMask:** The user initiates wallet connection; the application validates network ID `11155111` and queries the signer's balance.
2. **Select Artwork & Input Metadata:** User selects a graphic asset (PNG, JPG, SVG, WebP) and enters a Title, Description, and custom Attributes.
3. **Upload Artwork to IPFS:** The frontend posts the raw binary via `multipart/form-data` to `https://uploads.pinata.cloud/v3/files` with `network='public'`.
4. **Obtain Artwork CID:** Pinata returns the unique Content Identifier (e.g., `bafy...`).
5. **Generate ERC-721 Metadata:** The frontend compiles standard JSON metadata:
   ```json
   {
     "name": "Cybernetic Horizon #01",
     "description": "Minted on Nexa Mint Studio",
     "image": "ipfs://bafybeic7...",
     "attributes": [{ "trait_type": "Tier", "value": "Legendary" }]
   }
   ```
6. **Upload Metadata to IPFS:** The metadata JSON is posted to `https://uploads.pinata.cloud/v3/files`.
7. **Obtain Metadata CID:** Pinata returns the metadata CID.
8. **Construct Token URI:** The URI is formatted as `ipfs://<METADATA_CID>`.
9. **Call Smart Contract:** The frontend calls `contract.mintNFT(tokenURI)` via the MetaMask signer.
10. **Approve Transaction:** MetaMask prompts the user to review gas fees and sign the transaction.
11. **Wait for Sepolia Confirmation:** The app monitors the transaction receipt via `tx.wait(1)`.
12. **Extract Token ID:** The receipt logs are parsed to locate the ERC-721 `Transfer(address indexed from, address indexed to, uint256 indexed tokenId)` event, extracting the real `tokenId`.
13. **Verify On-Chain Ownership:** The application calls `ownerOf(tokenId)` to confirm the connected address is registered as the owner on-chain before refreshing the UI.

---

## NFT Transfer Workflow

Users can transfer their minted NFTs directly from the interface:

1. **Select NFT:** The user opens the detail view or transfer dialog for a specific token in *My Collection*.
2. **Validate Recipient:** The recipient address is validated using `ethers.isAddress(recipient)` to prevent accidental burns to invalid addresses.
3. **Execution via Signer:** The application invokes `contract.transferFrom(currentOwner, recipient, tokenId)` using the connected wallet's signer.
4. **Authorization Enforcement:** In accordance with OpenZeppelin's ERC-721 implementation, the transaction will revert if the caller is neither the token owner nor an authorized operator approved via `approve` or `setApprovalForAll`.
5. **On-Chain Confirmation:** The application waits for 1 block confirmation on Sepolia.
6. **State Synchronization:** The UI updates local telemetry, records the transfer activity, and verifies the new owner on-chain via `ownerOf(tokenId)`.

---

## Repository Structure

```
nft-minting-dapp/
├── contracts-project/               # Smart contract development environment (Hardhat)
│   ├── contracts/
│   │   └── MyNFT.sol                # ERC-721 Solidity smart contract
│   ├── scripts/
│   │   └── deploy.js                # Contract deployment script
│   ├── test/
│   │   └── MyNFT.test.js            # Hardhat ERC-721 unit tests
│   ├── hardhat.config.ts            # Hardhat 3 configuration
│   ├── package.json                 # Contracts project dependencies
│   ├── tsconfig.json                # TypeScript configuration
│   └── .env.example                 # Template for Hardhat environment variables
│
├── frontend/                        # Nexa Mint Studio web application
│   ├── public/                      # Static web assets
│   │   ├── favicon.svg              # Studio favicon
│   │   └── icons.svg                # Application SVG symbols
│   ├── src/
│   │   ├── components/              # Modular React UI components
│   │   │   ├── AboutView.tsx        # Application background and guide
│   │   │   ├── ArchitectureView.tsx # Interactive architecture display
│   │   │   ├── Dashboard.tsx        # Overview dashboard with network telemetry
│   │   │   ├── IPFSImage.tsx        # IPFS image loader with multi-gateway fallback
│   │   │   ├── LiveActivity.tsx     # On-chain activity stream
│   │   │   ├── MintStudio.tsx       # Core NFT minting interface
│   │   │   ├── MintSuccessModal.tsx # Post-mint confirmation modal
│   │   │   ├── MyNFTs.tsx           # Collection gallery view
│   │   │   ├── NFTDetailModal.tsx   # Detailed token inspector modal
│   │   │   ├── SettingsModal.tsx    # Runtime contract & Pinata configuration
│   │   │   ├── Sidebar.tsx          # Responsive navigation sidebar
│   │   │   ├── Toast.tsx            # Toast notification system
│   │   │   ├── TopBar.tsx           # Wallet status and network switcher bar
│   │   │   ├── TransactionPipeline.tsx # Live minting stage visualizer
│   │   │   └── TransferModal.tsx    # Token transfer dialog
│   │   ├── context/
│   │   │   └── Web3Context.tsx      # Global Web3 state provider (MetaMask + ethers)
│   │   ├── types/
│   │   │   └── nft.ts               # TypeScript interfaces for NFTs and metadata
│   │   ├── App.tsx                  # Primary workspace layout
│   │   ├── contractConfig.ts        # Contract ABI, Sepolia params, address helpers
│   │   ├── index.css                # Styling with Tailwind CSS v4
│   │   ├── ipfs.ts                  # Pinata V3 Files API service & gateway resolver
│   │   └── main.tsx                 # Application entry point
│   ├── index.html                   # HTML template
│   ├── package.json                 # Frontend dependencies and scripts
│   ├── tsconfig.json                # Frontend TypeScript configuration
│   ├── vite.config.ts               # Vite configuration with Tailwind CSS v4 plugin
│   └── .env.example                 # Template for frontend environment variables
│
├── docs/
│   └── screenshots/                 # Application screenshots directory
│       └── README.md                # Screenshot capture guide and specifications
│
├── .gitignore                       # Repository root Git ignore rules
└── README.md                        # Master project documentation
```

---

## Prerequisites

Before running the project locally, verify that you have:

* **Node.js:** `v20.0.0` or higher (tested with `v22.13.1`).
* **npm:** `v10.0.0` or higher (tested with `v10.9.2`).
* **Git:** Installed and available on your system path.
* **MetaMask Browser Extension:** Installed on Chrome, Brave, Firefox, or Edge.
* **Ethereum Sepolia Network:** Configured in MetaMask (`Chain ID: 11155111`).
* **Sepolia Testnet ETH:** Required to pay for gas when minting or transferring. Obtain test ETH from:
  * [Google Cloud Web3 Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
  * [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
  * [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/)
* **Pinata Cloud Account:** Free account on [Pinata](https://pinata.cloud/) with an API Key generated with `Files: Write` permissions.

---

## Installation and Setup

### 1. Clone the Repository

Open Windows PowerShell and clone the project:

```powershell
git clone https://github.com/<your-username>/nft-minting-dapp.git
cd nft-minting-dapp
```

---

### 2. Frontend Configuration & Execution (Primary)

> **Important:** The `MyNFT.sol` smart contract is **already deployed** on Ethereum Sepolia. You do **not** need to redeploy the contract to run the application.

1. Navigate to the `frontend/` directory and install dependencies:
   ```powershell
   cd frontend
   npm install
   ```

2. Create your local `.env` file from the example template:
   ```powershell
   Copy-Item .env.example .env
   ```

3. Open `frontend/.env` in your editor and configure your variables:
   ```env
   VITE_CONTRACT_ADDRESS=0xD4466aBA8C67dD16Af671FAC0aA3B0895A8EdeCf
   VITE_PINATA_JWT=your_pinata_jwt_here
   ```
   * Replace `your_pinata_jwt_here` with your Pinata JWT token.

4. Start the Vite development server:
   ```powershell
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

### 3. Smart Contract Project (Optional / Reference)

If you wish to compile the Solidity smart contracts locally:

1. Navigate to `contracts-project/`:
   ```powershell
   cd contracts-project
   npm install
   ```

2. (Optional) Create a `.env` file if you plan to interact with Hardhat on Sepolia:
   ```powershell
   Copy-Item .env.example .env
   ```
   * Populate `SEPOLIA_RPC_URL` and `PRIVATE_KEY` (use a dedicated test wallet only).

3. Compile the contracts:
   ```powershell
   npx hardhat compile
   ```

> **Warning:** `PRIVATE_KEY` belongs exclusively in `contracts-project/.env` for deployment operations. **Never** place private keys inside the `frontend` folder or commit them to Git.

---

## Environment Variables

| Variable | Target Environment | Purpose | Secret? | How to Obtain |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_CONTRACT_ADDRESS` | `frontend/.env` | Address of deployed `MyNFT` contract on Sepolia. | No (Public) | Use pre-deployed `0xD4466aBA8C67dD16Af671FAC0aA3B0895A8EdeCf`. |
| `VITE_PINATA_JWT` | `frontend/.env` | Pinata API bearer token for uploading image and metadata to IPFS. | **Yes** (Client-Exposed) | [Pinata API Keys](https://app.pinata.cloud/developers/api-keys) (Enable `Files: Write`). |
| `SEPOLIA_RPC_URL` | `contracts-project/.env` | HTTPS RPC endpoint for the Sepolia testnet. | **Yes** | [Alchemy](https://alchemy.com) or [Infura](https://infura.io) dashboard. |
| `PRIVATE_KEY` | `contracts-project/.env` | Deployer wallet private key for Hardhat script signing. | **CRITICAL** | MetaMask: Account Details ➔ Show Private Key (Test wallet only). |

### Security Note on `VITE_*` Variables
In client-side Vite applications, all environment variables prefixed with `VITE_` are statically embedded into the compiled JavaScript bundle. In this educational architecture, `VITE_PINATA_JWT` is accessible in browser memory. In production applications, all uploads should be routed through a backend server (e.g., Express or Next.js API route) to keep API credentials secure.

---

## Existing Sepolia Deployment

The `MyNFT.sol` contract is already deployed on the **Ethereum Sepolia Testnet**:

* **Contract Name:** `MyCollegeNFT`
* **Token Symbol:** `MCNFT`
* **Contract Address:** [`0xD4466aBA8C67dD16Af671FAC0aA3B0895A8EdeCf`](https://sepolia.etherscan.io/address/0xD4466aBA8C67dD16Af671FAC0aA3B0895A8EdeCf)
* **Block Explorer:** [Sepolia Etherscan (0xD4466aBA...95A8EdeCf)](https://sepolia.etherscan.io/address/0xD4466aBA8C67dD16Af671FAC0aA3B0895A8EdeCf)
* **Contract Verification Status:** Unverified on Etherscan (standard for local test deployments).
* **Target Network:** Ethereum Sepolia (`Chain ID: 11155111` / `0xaa36a7`).

> **Note:** This is a testnet deployment using test ETH with no financial value.

---

## Testing and Verification

### 1. Frontend TypeScript Compilation
Run the TypeScript compiler without emitting files:
```powershell
cd frontend
npx tsc --noEmit
```
* **Status:** Passed with 0 errors.

### 2. Frontend Production Build
Validate the production asset compilation:
```powershell
cd frontend
npm run build
```
* **Status:** Successfully compiled in 1.23s (`dist/index.html`, `dist/assets/index-*.css`, `dist/assets/index-*.js`).

### 3. Smart Contract Compilation
Compile the Solidity contract with Hardhat 3:
```powershell
cd contracts-project
npx hardhat compile
```
* **Status:** Compiled cleanly with Solidity `0.8.20`.

### 4. Smart Contract Unit Tests
The project contains an automated test suite in [`contracts-project/test/MyNFT.test.js`](contracts-project/test/MyNFT.test.js) exercising:
* Correct initialization of ERC-721 name and symbol.
* Minting tokens and verifying caller ownership.
* Reading and verifying stored `tokenURI`.
* Incremental token ID assignments.
* Token transfers between addresses.
* Reversion upon querying non-existent tokens.
* Reversion upon unauthorized transfer attempts.

### 5. Manual End-to-End Verification
The complete workflow was tested and verified live on Ethereum Sepolia:
* MetaMask connection and network validation passed.
* Real artwork upload to Pinata via V3 Files API succeeded.
* ERC-721 metadata upload to IPFS succeeded.
* `mintNFT(tokenURI)` execution and transaction confirmation succeeded.
* Token ID retrieval from the on-chain `Transfer` event verified.
* Artwork rendered in *My Collection* via IPFS gateway resolution.
* `transferFrom` executed and ownership verified on-chain.

---

## Troubleshooting

### 1. MetaMask is not detected
* Ensure the MetaMask extension is installed and enabled in your browser.
* Refresh the application page (`F5` or `Ctrl+F5`).
* Check that MetaMask is unlocked.

### 2. "Wrong Network" Warning
* Nexa Mint Studio requires the **Ethereum Sepolia Testnet** (`Chain ID: 11155111`).
* Click the network switcher in the top navigation bar to trigger automatic network switching in MetaMask.
* If Sepolia is not configured, add it with RPC URL `https://ethereum-sepolia-rpc.publicnode.com` and Chain ID `11155111`.

### 3. Insufficient Funds for Gas
* Minting and transferring require Sepolia test ETH for gas.
* Claim free test ETH from the [Google Cloud Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) or [Alchemy Faucet](https://sepoliafaucet.com/).

### 4. Pinata Upload / Scope Errors
* Nexa Mint Studio uses the modern Pinata V3 Files API:
  ```
  https://uploads.pinata.cloud/v3/files
  ```
* When creating an API key on Pinata, ensure the **Files -> Write** permission is enabled.
* **Do NOT** enable Admin permissions as a default workaround; scoped write permissions are sufficient and recommended.

### 5. IPFS Image Not Loading
* Public IPFS gateways can occasionally experience rate-limiting or latency.
* The frontend includes multi-gateway fallback resolution (`gateway.pinata.cloud`, `cloudflare-ipfs.com`, `ipfs.io`, `dweb.link`).
* Allow a few moments for newly pinned content to propagate across the IPFS swarm.

### 6. Transaction Reverted or Rejected
* Ensure you approve the transaction in MetaMask when prompted.
* Verify that your wallet has enough Sepolia ETH to cover gas.
* For transfers, ensure the connected wallet is the current owner of the token.

### 7. Port 5173 Already in Use
* If another process is using port 5173, specify a custom port:
  ```powershell
  npm run dev -- --port 5174
  ```

---

## Security Considerations

1. **Never Commit Secrets:** The `.gitignore` is configured to exclude all `.env` files, private keys, and credential stores. Never remove these protections.
2. **Dedicated Test Wallets:** Always use a separate MetaMask account for development. Never import or use private keys from accounts containing real mainnet assets.
3. **Client-Side API Keys:** In this educational architecture, `VITE_PINATA_JWT` is exposed in the browser bundle. In production, file uploads must be routed through a backend server with rate limiting and authentication.
4. **Smart Contract Auditing:** `MyNFT.sol` is designed for demonstration and educational purposes. While built using audited OpenZeppelin primitives, it has not undergone an independent third-party audit and should not be used in financial production environments.
5. **Testnet Assets:** Sepolia ETH is test currency with zero real-world economic value.

---

## Limitations and Future Scope

* **Backend-Mediated Uploads:** Move Pinata uploads and secret keys behind a secure Node.js / Next.js API proxy to eliminate client credential exposure.
* **Decentralized Indexing:** Integrate [The Graph](https://thegraph.com/) or Subsquid subgraph indexing to query token ownership and collection history instantly instead of polling on-chain RPC logs.
* **Expanded Metadata Standards:** Add support for animation URLs (GLB/MP4 for 3D/video NFTs), royalty standards ([EIP-2981](https://eips.ethereum.org/EIPS/eip-2981)), and batch minting.
* **Secondary Marketplace Integration:** Add listing, bidding, and escrow trading features.
* **Layer 2 / Mainnet Deployment:** Deploy to Arbitrum, Optimism, or Polygon after completing professional security audits.

---

## License and Credits

### License
This project is open-source and intended for educational purposes. See the [LICENSE](LICENSE) file for terms (e.g., MIT License).

### Credits & Acknowledgments
* [OpenZeppelin](https://www.openzeppelin.com/) for audited ERC-721 smart contract implementations.
* [Hardhat](https://hardhat.org/) for Ethereum smart contract compilation and tooling.
* [ethers.js](https://docs.ethers.org/) for Web3 blockchain abstractions.
* [Pinata](https://pinata.cloud/) for decentralized IPFS pinning infrastructure.
* [Tailwind CSS](https://tailwindcss.com/) & [Vite](https://vitejs.dev/) for modern frontend tooling.
