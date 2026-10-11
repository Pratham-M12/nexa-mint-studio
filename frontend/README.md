# NEXA MINT STUDIO — Production ERC-721 NFT Minting DApp

Nexa Mint Studio is a decentralized Web3 application for creating, uploading, minting, and transferring immutable ERC-721 NFTs on **Ethereum Sepolia Testnet** with decentralized **IPFS** artwork and metadata storage via Pinata.

---

## ⚡ Architecture & Tech Stack

- **Smart Contract Standard:** ERC-721 (`MyNFT.sol` deployed on Ethereum Sepolia)
- **Frontend Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + Space Grotesk / Plus Jakarta Sans / JetBrains Mono
- **Web3 Bridge:** ethers.js v6 + MetaMask Browser Provider
- **Decentralized Storage:** IPFS Swarm via Pinata Cloud API
- **Target Network:** Ethereum Sepolia (`chainId: 11155111` / `0xaa36a7`)

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create or update your `.env` file in the `frontend` root:

```env
VITE_CONTRACT_ADDRESS=0xD4466aBA8C67dD16Af671FAC0aA3B0895A8EdeCf
VITE_PINATA_JWT=your_pinata_jwt_token_here
```

- `VITE_CONTRACT_ADDRESS`: The deployed address of your `MyNFT` contract on Ethereum Sepolia.
- `VITE_PINATA_JWT`: Your Pinata API JWT token with permissions to pin files and JSON to IPFS.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production

```bash
npm run build
```

---

## 🔑 Key Features

1. **MetaMask Wallet Integration:**
   - Real wallet connection, address display, and balance inquiry in Sepolia ETH.
   - Network validation (Ethereum Sepolia, `11155111`) with automatic one-click network switching.
   - Session disconnect & reset controls.

2. **Real IPFS Storage via Pinata:**
   - Real image file uploads to Pinata's `/pinning/pinFileToIPFS`.
   - ERC-721 metadata JSON schema uploads to Pinata's `/pinning/pinJSONToIPFS`.
   - Dedicated gateway resolution for high-fidelity artwork and metadata display.

3. **Real Smart Contract Execution:**
   - Calls `mintNFT(tokenURI)` with MetaMask signer.
   - Live transaction broadcast and confirmation pipeline.
   - Extracts real `tokenId` from on-chain `Transfer` events.
   - Verifies on-chain ownership via `ownerOf(tokenId)`.

4. **Real ERC-721 Transfers:**
   - Supports transferring tokens via `transferFrom`.
   - Validates recipient address using `ethers.isAddress`.
   - Updates ownership and logs transfer activity on confirmation.

5. **Live Activity Telemetry:**
   - Streams live mint and transfer events with Etherscan block explorer links.
