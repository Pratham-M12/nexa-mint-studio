import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { shortenAddress, getEtherscanAddressUrl } from '../contractConfig';

export const AboutView: React.FC = () => {
  const { contractAddress } = useWeb3();

  const techStack = [
    { name: 'Solidity', role: 'Smart Contract Language', category: 'Blockchain' },
    { name: 'Ethereum Sepolia', role: 'Proof-of-Stake Testnet Ledger', category: 'Network' },
    { name: 'ERC-721', role: 'Non-Fungible Token Standard', category: 'Protocol' },
    { name: 'OpenZeppelin', role: 'Audited Smart Contract Libraries', category: 'Security' },
    { name: 'Hardhat', role: 'Ethereum Development Environment', category: 'Tooling' },
    { name: 'React 19', role: 'Reactive Component Architecture', category: 'Frontend' },
    { name: 'Vite', role: 'Next-Generation Frontend Bundler', category: 'Tooling' },
    { name: 'ethers.js v6', role: 'Client-Side Web3 Provider Bridge', category: 'Web3' },
    { name: 'MetaMask', role: 'Non-Custodial Asymmetric Key Signer', category: 'Wallet' },
    { name: 'IPFS', role: 'InterPlanetary File System Swarm', category: 'Storage' },
    { name: 'Pinata', role: 'Distributed IPFS Node Pinning Gateway', category: 'Infrastructure' },
    { name: 'Tailwind CSS', role: 'Design System & Micro-Luminescence', category: 'Styling' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full flex flex-col gap-10 custom-scroll">
      {/* Header */}
      <div className="flex flex-col gap-3 pb-4 border-b border-[#4a4455]">
        <div className="text-xs font-mono text-[#4cd7f6] uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">info</span>
          Academic Blockchain Project Reference
        </div>
        <h1 className="text-3xl sm:text-4xl font-headline font-bold text-white tracking-tight">
          About Nexa Mint Studio
        </h1>
        <p className="text-sm md:text-base text-[#ccc3d8] leading-relaxed max-w-2xl">
          An educational NFT minting DApp demonstrating decentralized ownership using Ethereum,
          ERC-721 and IPFS.
        </p>
      </div>

      {/* Core Protocol Specs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-[#1a1b21] border border-[#4a4455] flex flex-col gap-2 inset-highlight">
          <div className="flex items-center justify-between text-[#ccc3d8] text-xs font-mono">
            <span>NETWORK</span>
            <span className="w-2 h-2 rounded-full bg-[#4cd7f6]"></span>
          </div>
          <div className="text-xl font-bold font-headline text-white">Ethereum Sepolia</div>
          <div className="text-xs font-mono text-[#ccc3d8] mt-1">
            Chain ID: <code className="text-[#4cd7f6]">11155111 (0xaa36a7)</code>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1a1b21] border border-[#4a4455] flex flex-col gap-2 inset-highlight">
          <div className="flex items-center justify-between text-[#ccc3d8] text-xs font-mono">
            <span>NFT STANDARD</span>
            <span className="w-2 h-2 rounded-full bg-[#7c3aed]"></span>
          </div>
          <div className="text-xl font-bold font-headline text-white">ERC-721 URIStorage</div>
          <div className="text-xs font-mono text-[#ccc3d8] mt-1">
            Interface: <code className="text-[#d2bbff]">OpenZeppelin v4.9</code>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1a1b21] border border-[#4a4455] flex flex-col gap-2 inset-highlight">
          <div className="flex items-center justify-between text-[#ccc3d8] text-xs font-mono">
            <span>STORAGE LAYER</span>
            <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
          </div>
          <div className="text-xl font-bold font-headline text-white">IPFS &amp; Pinata</div>
          <div className="text-xs font-mono text-[#ccc3d8] mt-1">
            Addressing: <code className="text-[#4edea3]">Content Identifier (CID)</code>
          </div>
        </div>
      </div>

      {/* Deployed Contract Information */}
      <div className="p-6 rounded-2xl bg-[#111318] border border-[#4a4455] flex flex-col gap-4 inset-highlight">
        <div className="flex items-center justify-between pb-3 border-b border-[#282a2f]">
          <h2 className="text-base font-bold font-headline text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4cd7f6] text-xl">verified</span>
            Deployed Smart Contract On Sepolia
          </h2>
          <span className="text-xs font-mono text-[#4edea3] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
            Active
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <span className="text-[#ccc3d8]">Contract Address:</span>
          <div className="flex items-center gap-2">
            <code className="text-[#4cd7f6] select-all bg-[#1a1b21] px-3 py-1.5 rounded-lg border border-[#282a2f]">
              {contractAddress}
            </code>
            <a
              href={getEtherscanAddressUrl(contractAddress)}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-[#1e2025] hover:bg-[#282a2f] text-white transition-colors"
              title="View on Etherscan"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </div>
        </div>
      </div>

      {/* Comprehensive Tech Stack Grid */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold font-headline text-white">Full Technology Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {techStack.map((tech, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#1a1b21] border border-[#4a4455] flex items-center justify-between inset-highlight"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold font-headline text-white">{tech.name}</span>
                <span className="text-xs text-[#ccc3d8]">{tech.role}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111318] text-[#d2bbff] border border-[#282a2f]">
                {tech.category}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* College Project Credits */}
      <div className="p-6 rounded-2xl bg-[#111318] border border-[#4a4455] text-xs text-[#ccc3d8] leading-relaxed flex flex-col gap-2">
        <div className="font-bold text-white font-headline text-sm">
          Project Evaluation &amp; Demonstration Guide
        </div>
        <p>
          This decentralized application is designed as a university capstone / blockchain engineering project.
          Evaluators can test with MetaMask connected to the Ethereum Sepolia testnet, or use the integrated
          interactive sandbox pipeline. The contract enforces standard ERC-721 ownership transfer semantics,
          event logging, and immutable IPFS metadata linking.
        </p>
      </div>
    </div>
  );
};
