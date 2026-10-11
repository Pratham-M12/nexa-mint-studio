import React from 'react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full flex flex-col gap-10 custom-scroll">
      {/* Header */}
      <div className="flex flex-col gap-2 pb-4 border-b border-[#4a4455]">
        <div className="text-xs font-mono text-[#4cd7f6] uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">schema</span>
          College Blockchain Architecture &amp; System Design
        </div>
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-white tracking-tight">
          How Nexa Mint Studio Works
        </h1>
        <p className="text-xs md:text-sm text-[#ccc3d8] leading-relaxed max-w-3xl">
          An in-depth technical explanation of decentralized storage, asymmetric cryptography,
          OpenZeppelin ERC-721 smart contract execution, and the Ethereum Sepolia consensus workflow.
        </p>
      </div>

      {/* Visual Flow Diagrams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* On-Chain Consensus Pipeline */}
        <div className="p-6 rounded-2xl bg-[#111318] border border-[#4a4455] flex flex-col gap-4 inset-highlight shadow-lg">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#282a2f]">
            <span className="material-symbols-outlined text-[#d2bbff] text-xl">account_tree</span>
            <h2 className="text-base font-bold font-headline text-white">
              On-Chain Transaction Architecture
            </h2>
          </div>

          <div className="flex flex-col items-center gap-2 py-2 font-mono text-xs">
            <div className="w-full py-2.5 px-4 rounded-xl bg-[#1a1b21] border border-[#4a4455] text-center text-white font-semibold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#4cd7f6]">person</span>
              USER (Creator / Collector)
            </div>
            <span className="material-symbols-outlined text-[#7c3aed]">arrow_downward</span>

            <div className="w-full py-2.5 px-4 rounded-xl bg-[#1a1b21] border border-[#4a4455] text-center text-[#d2bbff] font-semibold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#4edea3]">devices</span>
              REACT FRONTEND (Vite / Tailwind / State)
            </div>
            <span className="material-symbols-outlined text-[#7c3aed]">arrow_downward</span>

            <div className="w-full py-2.5 px-4 rounded-xl bg-[#1a1b21] border border-[#4a4455] text-center text-amber-300 font-semibold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">key</span>
              METAMASK (ECDSA Signer / Secp256k1)
            </div>
            <span className="material-symbols-outlined text-[#7c3aed]">arrow_downward</span>

            <div className="w-full py-2.5 px-4 rounded-xl bg-[#1a1b21] border border-[#4a4455] text-center text-[#4cd7f6] font-semibold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">integration_instructions</span>
              ETHERS.JS (v6 JSON-RPC Provider &amp; Contract Bridge)
            </div>
            <span className="material-symbols-outlined text-[#7c3aed]">arrow_downward</span>

            <div className="w-full py-2.5 px-4 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed] text-center text-[#d2bbff] font-semibold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">smart_toy</span>
              SMART CONTRACT (OpenZeppelin ERC721URIStorage)
            </div>
            <span className="material-symbols-outlined text-[#7c3aed]">arrow_downward</span>

            <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center text-emerald-300 font-semibold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">lan</span>
              ETHEREUM SEPOLIA TESTNET (PoS Proof of Stake)
            </div>
          </div>
        </div>

        {/* IPFS Decentralized Storage Pipeline */}
        <div className="p-6 rounded-2xl bg-[#111318] border border-[#4a4455] flex flex-col gap-4 inset-highlight shadow-lg">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#282a2f]">
            <span className="material-symbols-outlined text-[#4cd7f6] text-xl">cloud_queue</span>
            <h2 className="text-base font-bold font-headline text-white">
              IPFS Decentralized Storage Pipeline
            </h2>
          </div>

          <div className="flex flex-col gap-5 py-2 font-mono text-xs">
            {/* Image Pipeline */}
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#1a1b21] border border-[#282a2f]">
              <div className="text-[11px] uppercase text-[#4cd7f6] font-bold">1. Digital Artwork Binary</div>
              <div className="w-full py-2 rounded-lg bg-[#0c0e13] text-center text-white">
                RAW IMAGE FILE (PNG/JPG/SVG)
              </div>
              <span className="material-symbols-outlined text-xs text-[#4cd7f6]">arrow_downward</span>
              <div className="w-full py-2 rounded-lg bg-[#0c0e13] text-center text-[#d2bbff]">
                PINATA PINNING API (JWT Auth)
              </div>
              <span className="material-symbols-outlined text-xs text-[#4cd7f6]">arrow_downward</span>
              <div className="w-full py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center text-[#4edea3]">
                IPFS CONTENT IDENTIFIER (CID: Qm...)
              </div>
            </div>

            {/* Metadata Pipeline */}
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#1a1b21] border border-[#282a2f]">
              <div className="text-[11px] uppercase text-[#d2bbff] font-bold">2. Token Metadata JSON</div>
              <div className="w-full py-2 rounded-lg bg-[#0c0e13] text-center text-white">
                ERC-721 SCHEMA ({`name, description, image, attributes`})
              </div>
              <span className="material-symbols-outlined text-xs text-[#d2bbff]">arrow_downward</span>
              <div className="w-full py-2 rounded-lg bg-[#0c0e13] text-center text-[#d2bbff]">
                PINATA JSON PINNING
              </div>
              <span className="material-symbols-outlined text-xs text-[#d2bbff]">arrow_downward</span>
              <div className="w-full py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center text-[#4edea3]">
                METADATA URI: <code className="text-xs">ipfs://bafy...</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Walkthrough Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-[#1a1b21] border border-[#4a4455] flex flex-col gap-3 inset-highlight">
          <div className="w-9 h-9 rounded-lg bg-[#7c3aed]/20 text-[#d2bbff] flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">fingerprint</span>
          </div>
          <h3 className="text-base font-bold font-headline text-white">
            1. Content Addressing vs Location Addressing
          </h3>
          <p className="text-xs text-[#ccc3d8] leading-relaxed">
            Unlike traditional URLs (e.g. <code>https://example.com/art.jpg</code>) which rely on a centralized server that can be shut down, IPFS uses cryptographic hashes. If the image changes by even a single bit, the hash completely changes. This guarantees that your NFT's artwork cannot be altered or deleted.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#1a1b21] border border-[#4a4455] flex flex-col gap-3 inset-highlight">
          <div className="w-9 h-9 rounded-lg bg-[#4cd7f6]/20 text-[#4cd7f6] flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">token</span>
          </div>
          <h3 className="text-base font-bold font-headline text-white">
            2. The ERC-721 Standard
          </h3>
          <p className="text-xs text-[#ccc3d8] leading-relaxed">
            ERC-721 defines a standard interface for non-fungible tokens. Every token has a unique <code>tokenId</code>, an owner address mapped through <code>_owners[tokenId]</code>, and a metadata locator stored in <code>_tokenURIs[tokenId]</code>. Our contract extends OpenZeppelin's audited <code>ERC721URIStorage</code>.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-[#1a1b21] border border-[#4a4455] flex flex-col gap-3 inset-highlight">
          <div className="w-9 h-9 rounded-lg bg-[#4edea3]/20 text-[#4edea3] flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">gavel</span>
          </div>
          <h3 className="text-base font-bold font-headline text-white">
            3. Consensus &amp; Gas Fees
          </h3>
          <p className="text-xs text-[#ccc3d8] leading-relaxed">
            When you click "Mint NFT", MetaMask prompts you to sign a transaction with your private key. The transaction is broadcast to the Sepolia mempool, picked up by validators, executed inside the Ethereum Virtual Machine (EVM), and recorded inside an immutable block.
          </p>
        </div>
      </div>

      {/* Smart Contract Interface Blueprint */}
      <div className="rounded-2xl bg-[#111318] border border-[#4a4455] p-6 flex flex-col gap-3 inset-highlight font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#282a2f] pb-3 text-[#ccc3d8]">
          <span className="font-bold uppercase tracking-wider text-[#4cd7f6]">
            Solidity Contract Interface Blueprint
          </span>
          <span>Solidity ^0.8.20 · OpenZeppelin v4.9</span>
        </div>
        <pre className="overflow-x-auto text-[11px] text-[#e2e2e9] custom-scroll leading-relaxed p-3 rounded-xl bg-[#0c0e13] border border-[#282a2f]">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NexaNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("Nexa Mint Studio", "NEXA") {}

    function mintNFT(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}`}
        </pre>
      </div>
    </div>
  );
};
