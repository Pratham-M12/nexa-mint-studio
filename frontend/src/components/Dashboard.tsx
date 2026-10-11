import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { NFTItem } from '../types/nft';
import { shortenAddress } from '../contractConfig';
import { resolveIPFS } from '../ipfs';
import { ActiveScreen } from './Sidebar';

interface DashboardProps {
  onNavigate: (screen: ActiveScreen) => void;
  onNFTSelect: (nft: NFTItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onNFTSelect }) => {
  const { wallet, connectWallet, nfts } = useWeb3();

  const featuredNFT = nfts[0] || null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-10 custom-scroll">
      {/* Top Banner / Status Line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#1a1b21] border border-[#4a4455] inset-highlight">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/40 flex items-center justify-center text-[#d2bbff]">
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              token
            </span>
          </div>
          <div>
            <div className="text-xs font-mono text-[#4cd7f6] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
              Ethereum Sepolia Testnet Node
            </div>
            <div className="text-sm font-semibold text-white font-headline">
              NEXA MINT STUDIO · ERC-721 Production Engine
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {wallet.isConnected && wallet.account ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#111318] border border-[#4a4455] text-xs font-mono">
              <span className="text-[#ccc3d8]">Connected:</span>
              <span className="text-[#4edea3] font-semibold">{shortenAddress(wallet.account)}</span>
              <span className="text-[#958da1]">({wallet.balance ?? '0.0000'} ETH)</span>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-headline font-semibold hover:bg-opacity-90 glow-violet transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">account_balance_wallet</span>
              <span>Connect MetaMask</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero Text */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7c3aed]/15 border border-[#7c3aed]/30 text-xs font-mono text-[#d2bbff] w-fit">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>Decentralized Creator Infrastructure</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-bold text-white tracking-tight leading-tight">
            Create &amp; Mint <br />
            <span className="bg-gradient-to-r from-[#d2bbff] via-[#4cd7f6] to-[#4edea3] bg-clip-text text-transparent">
              Immutable NFTs
            </span>
          </h1>

          <p className="text-sm md:text-base text-[#ccc3d8] leading-relaxed max-w-xl">
            Nexa Mint Studio is a decentralized application bridging cryptographic artwork
            storage on IPFS with OpenZeppelin ERC-721 smart contracts on Ethereum Sepolia.
            Upload artwork, generate metadata, and mint on-chain with full provenance.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('mint-studio')}
              className="py-3.5 px-6 rounded-xl bg-[#7c3aed] text-white font-headline font-bold text-sm hover:bg-opacity-90 glow-violet active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer shadow-lg"
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
              <span>Mint NFT</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>

            <button
              onClick={() => onNavigate('my-nfts')}
              className="py-3.5 px-6 rounded-xl bg-[#1e2025] hover:bg-[#282a2f] border border-[#4a4455] text-white font-headline text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">grid_view</span>
              <span>Explore My NFTs ({nfts.length})</span>
            </button>
          </div>
        </div>

        {/* Right Hero Featured NFT Card */}
        <div className="lg:col-span-5 flex justify-center">
          {featuredNFT ? (
            <div
              onClick={() => onNFTSelect(featuredNFT)}
              className="w-full max-w-md bg-[#111318] rounded-2xl border border-[#4a4455] overflow-hidden group hover:border-[#7c3aed] transition-all duration-300 inset-highlight cursor-pointer shadow-2xl relative"
            >
              <div className="aspect-square w-full overflow-hidden bg-[#0c0e13] relative">
                <img
                  src={resolveIPFS(featuredNFT.image)}
                  alt={featuredNFT.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 flex gap-1.5 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#4a4455] text-[11px] font-mono text-[#d2bbff]">
                    #{featuredNFT.id.padStart(3, '0')}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-cyan-500/30 text-[11px] font-mono text-[#4cd7f6]">
                    Featured Token
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-emerald-500/40 text-[11px] font-mono text-[#4edea3] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Sepolia Verified
                </div>
              </div>

              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-headline font-bold text-white">{featuredNFT.name}</h3>
                  <span className="text-xs font-mono text-[#4cd7f6]">ERC-721</span>
                </div>
                <p className="text-xs text-[#ccc3d8] line-clamp-2 leading-relaxed">
                  {featuredNFT.description || 'Verified token on Ethereum Sepolia.'}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-[#4a4455] text-xs font-mono">
                  <span className="text-[#ccc3d8]">Owner: {shortenAddress(featuredNFT.owner, 4)}</span>
                  <span className="text-[#d2bbff] group-hover:text-white flex items-center gap-1 transition-colors">
                    View Details <span className="material-symbols-outlined text-xs">north_east</span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State Hero Card if no NFTs exist yet */
            <div
              onClick={() => onNavigate('mint-studio')}
              className="w-full max-w-md bg-[#111318] rounded-2xl border border-dashed border-[#4a4455] p-8 flex flex-col items-center justify-center text-center gap-5 hover:border-[#7c3aed] transition-colors cursor-pointer group inset-highlight shadow-2xl"
            >
              <div className="w-20 h-20 rounded-2xl bg-[#1e2025] border border-[#4a4455] flex items-center justify-center text-[#d2bbff] group-hover:scale-110 group-hover:border-[#7c3aed] transition-all">
                <span className="material-symbols-outlined text-4xl">palette</span>
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#d2bbff] text-xs font-mono border border-[#7c3aed]/40">
                  Ready to Mint
                </span>
                <h3 className="text-lg font-headline font-bold text-white mt-3">
                  No NFTs Minted Yet
                </h3>
                <p className="text-xs text-[#ccc3d8] mt-1 max-w-xs leading-relaxed">
                  Be the first to mint an NFT to the deployed Sepolia smart contract using IPFS pinning.
                </p>
              </div>
              <button
                type="button"
                className="py-2.5 px-5 rounded-xl bg-[#7c3aed] text-white text-xs font-headline font-semibold glow-violet group-hover:bg-opacity-90 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">bolt</span>
                <span>Launch Mint Studio</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Project Statistics Bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#1a1b21] border border-[#4a4455] flex flex-col gap-1.5 inset-highlight">
          <span className="text-xs font-mono uppercase text-[#ccc3d8]">NFTs Minted</span>
          <span className="text-2xl md:text-3xl font-bold font-headline text-white">
            {nfts.length} Tokens
          </span>
          <span className="text-[11px] font-mono text-[#4edea3] flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-xs">check_circle</span>
            On-Chain Provenance
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1a1b21] border border-[#4a4455] flex flex-col gap-1.5 inset-highlight">
          <span className="text-xs font-mono uppercase text-[#ccc3d8]">Active Collection</span>
          <span className="text-2xl md:text-3xl font-bold font-headline text-[#d2bbff]">
            ERC-721
          </span>
          <span className="text-[11px] font-mono text-[#4cd7f6] flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-xs">tune</span>
            OpenZeppelin Standard
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1a1b21] border border-[#4a4455] flex flex-col gap-1.5 inset-highlight">
          <span className="text-xs font-mono uppercase text-[#ccc3d8]">Network</span>
          <span className="text-xl md:text-2xl font-bold font-headline text-white truncate">
            Sepolia Testnet
          </span>
          <span className="text-[11px] font-mono text-[#ccc3d8] flex items-center gap-1 mt-1">
            Chain ID: 11155111
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1a1b21] border border-[#4a4455] flex flex-col gap-1.5 inset-highlight">
          <span className="text-xs font-mono uppercase text-[#ccc3d8]">Decentralized Storage</span>
          <span className="text-xl md:text-2xl font-bold font-headline text-[#4edea3]">
            IPFS &amp; Pinata
          </span>
          <span className="text-[11px] font-mono text-[#4cd7f6] flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-xs">cloud_done</span>
            Cryptographic CIDs
          </span>
        </div>
      </div>

      {/* "How It Works" 4-Step Flow */}
      <section className="flex flex-col gap-5 pt-4 border-t border-[#4a4455]">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-mono text-[#4cd7f6] uppercase tracking-wider">
            Architecture Walkthrough
          </div>
          <h2 className="text-2xl font-headline font-bold text-white">How It Works</h2>
          <p className="text-xs text-[#ccc3d8]">
            Complete decentralized minting lifecycle from client browser to Ethereum consensus
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#111318] border border-[#4a4455] flex flex-col gap-3 relative">
            <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/20 text-[#d2bbff] flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <h3 className="text-base font-bold font-headline text-white">Connect Wallet</h3>
            <p className="text-xs text-[#ccc3d8] leading-relaxed">
              Authenticate via MetaMask on Ethereum Sepolia. Your public address becomes the token
              creator and primary recipient.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#111318] border border-[#4a4455] flex flex-col gap-3 relative">
            <div className="w-8 h-8 rounded-lg bg-[#4cd7f6]/20 text-[#4cd7f6] flex items-center justify-center font-mono font-bold text-xs">
              02
            </div>
            <h3 className="text-base font-bold font-headline text-white">Upload Artwork</h3>
            <p className="text-xs text-[#ccc3d8] leading-relaxed">
              Artwork binary is hashed and pinned across the decentralized IPFS swarm
              via Pinata nodes.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#111318] border border-[#4a4455] flex flex-col gap-3 relative">
            <div className="w-8 h-8 rounded-lg bg-[#4edea3]/20 text-[#4edea3] flex items-center justify-center font-mono font-bold text-xs">
              03
            </div>
            <h3 className="text-base font-bold font-headline text-white">Add Metadata</h3>
            <p className="text-xs text-[#ccc3d8] leading-relaxed">
              Compile standard OpenZeppelin ERC-721 JSON with attributes, traits, and image CID, then
              pin the metadata to IPFS.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#111318] border border-[#4a4455] flex flex-col gap-3 relative">
            <div className="w-8 h-8 rounded-lg bg-[#d2bbff]/20 text-[#d2bbff] flex items-center justify-center font-mono font-bold text-xs">
              04
            </div>
            <h3 className="text-base font-bold font-headline text-white">Mint On-Chain</h3>
            <p className="text-xs text-[#ccc3d8] leading-relaxed">
              Execute <code className="text-[#4cd7f6]">mintNFT(tokenURI)</code> with MetaMask. The
              contract writes token ownership directly to the Sepolia ledger.
            </p>
          </div>
        </div>
      </section>

      {/* Recently Minted NFTs section */}
      <section className="flex flex-col gap-5 pt-4 border-t border-[#4a4455]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-headline font-bold text-white">Recently Minted NFTs</h2>
            <p className="text-xs text-[#ccc3d8] mt-0.5">
              Live tokens registered on the Sepolia smart contract
            </p>
          </div>
          <button
            onClick={() => onNavigate('my-nfts')}
            className="flex items-center gap-1 text-xs font-mono text-[#d2bbff] hover:text-white transition-colors cursor-pointer"
          >
            <span>View All ({nfts.length})</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {nfts.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#111318] border border-dashed border-[#4a4455] flex flex-col items-center justify-center text-center gap-2">
            <span className="material-symbols-outlined text-3xl text-[#958da1]">grid_view</span>
            <div className="text-sm font-semibold text-white">No Tokens in Active Ledger</div>
            <p className="text-xs text-[#ccc3d8]">Tokens minted on Ethereum Sepolia will be showcased here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.slice(0, 3).map((nft) => (
              <div
                key={nft.id}
                onClick={() => onNFTSelect(nft)}
                className="bg-[#111318] rounded-xl border border-[#4a4455] overflow-hidden flex flex-col group hover:border-[#7c3aed] transition-all duration-200 inset-highlight cursor-pointer"
              >
                <div className="aspect-square w-full overflow-hidden bg-[#0c0e13] relative">
                  <img
                    src={resolveIPFS(nft.image)}
                    alt={nft.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-[#4a4455] text-xs font-mono text-[#d2bbff]">
                    #{nft.id.padStart(3, '0')}
                  </span>
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#4edea3]/20 backdrop-blur-sm border border-[#4edea3]/40 text-[10px] font-mono text-[#4edea3]">
                    Confirmed
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <h4 className="text-sm font-headline font-bold text-white truncate">{nft.name}</h4>
                    <p className="text-xs font-mono text-[#ccc3d8] mt-0.5 truncate">
                      Owner: {shortenAddress(nft.owner, 4)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#4a4455] text-xs font-mono">
                    <span className="text-[#4cd7f6]">Sepolia ERC-721</span>
                    <span className="text-[#d2bbff] group-hover:text-white flex items-center gap-1 transition-colors">
                      Details <span className="material-symbols-outlined text-xs">north_east</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
