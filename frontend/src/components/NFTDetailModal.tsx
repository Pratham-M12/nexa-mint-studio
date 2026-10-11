import React from 'react';
import { NFTItem } from '../types/nft';
import {
  getEtherscanTxUrl,
  getEtherscanAddressUrl,
  getEtherscanTokenUrl,
  shortenAddress,
} from '../contractConfig';
import { resolveIPFS, shortenCID } from '../ipfs';
import { IPFSImage } from './IPFSImage';

interface NFTDetailModalProps {
  nft: NFTItem | null;
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (nft: NFTItem) => void;
  onCopySuccess: (label: string) => void;
}

export const NFTDetailModal: React.FC<NFTDetailModalProps> = ({
  nft,
  isOpen,
  onClose,
  onTransfer,
  onCopySuccess,
}) => {
  if (!isOpen || !nft) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onCopySuccess(label);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#111318] border border-[#4a4455] rounded-2xl p-6 md:p-8 shadow-2xl inset-highlight flex flex-col gap-6 max-h-[92vh] overflow-y-auto custom-scroll">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#ccc3d8] hover:text-white transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* Modal Title / Top Bar */}
        <div className="flex items-center gap-3 border-b border-[#4a4455] pb-4">
          <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/40 flex items-center justify-center text-[#d2bbff]">
            <span className="material-symbols-outlined text-xl">token</span>
          </div>
          <div>
            <div className="text-xs font-mono text-[#4cd7f6] uppercase tracking-wider flex items-center gap-2">
              <span>ERC-721 Digital Asset</span>
              <span>·</span>
              <span className="text-[#4edea3]">Sepolia Network</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-headline text-white">
              {nft.name} <span className="text-[#d2bbff]">#{nft.id.padStart(3, '0')}</span>
            </h2>
          </div>
        </div>

        {/* 2-Column Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Artwork */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden border border-[#4a4455] bg-[#0c0e13] aspect-square flex items-center justify-center group shadow-xl">
              <IPFSImage
                src={nft.image || nft.imageUri}
                alt={nft.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex gap-1.5 pointer-events-none z-10">
                <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#4a4455] text-xs font-mono text-[#d2bbff]">
                  ERC-721
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-cyan-500/30 text-xs font-mono text-[#4cd7f6]">
                  IPFS Pinned
                </span>
              </div>
              <div className="absolute bottom-3 right-3 z-10">
                <a
                  href={resolveIPFS(nft.image || nft.imageUri)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-black/80 hover:bg-black text-[#e2e2e9] border border-[#4a4455] backdrop-blur-md flex items-center gap-1 text-xs font-mono transition-colors"
                  title="View Full Resolution"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              </div>
            </div>

            {/* Quick Actions Under Artwork */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onTransfer(nft)}
                className="py-2.5 px-3 rounded-xl bg-[#7c3aed] text-white text-xs font-headline font-semibold hover:bg-opacity-90 glow-violet transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">send</span>
                <span>Transfer NFT</span>
              </button>

              <button
                onClick={() => copyToClipboard(nft.id, 'Token ID')}
                className="py-2.5 px-3 rounded-xl bg-[#1e2025] hover:bg-[#282a2f] border border-[#4a4455] text-[#e2e2e9] text-xs font-mono font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">content_copy</span>
                <span>Copy Token ID</span>
              </button>
            </div>
          </div>

          {/* Right Column: Parameters, Attributes, Technical Details */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-mono text-[#ccc3d8] uppercase tracking-wider">
                Description
              </span>
              <p className="text-sm text-[#e2e2e9] leading-relaxed bg-[#1a1b21] p-3.5 rounded-xl border border-[#282a2f]">
                {nft.description || 'No description provided for this token.'}
              </p>
            </div>

            {/* Attributes Grid */}
            {nft.attributes && nft.attributes.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono text-[#ccc3d8] uppercase tracking-wider">
                  On-Chain Attributes &amp; Traits
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {nft.attributes.map((attr, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#1a1b21] border border-[#282a2f] flex flex-col"
                    >
                      <span className="text-[10px] font-mono uppercase text-[#ccc3d8]">
                        {attr.trait_type}
                      </span>
                      <span className="text-xs font-semibold text-white truncate mt-0.5">
                        {attr.value}
                      </span>
                      {attr.rarity && (
                        <span className="text-[10px] font-mono text-[#4cd7f6] mt-1">
                          {attr.rarity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Metadata Table */}
            <div className="rounded-xl bg-[#0c0e13] border border-[#282a2f] p-4 flex flex-col gap-2.5 font-mono text-xs">
              <div className="text-[#ccc3d8] font-bold text-xs uppercase tracking-wider border-b border-[#282a2f] pb-2 flex justify-between">
                <span>Contract &amp; On-Chain Identifiers</span>
                <span className="text-[#4edea3]">Verified</span>
              </div>

              {/* Owner */}
              <div className="flex items-center justify-between py-1 border-b border-[#1e2025]">
                <span className="text-[#ccc3d8]">Current Owner:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-medium select-all">
                    {shortenAddress(nft.owner, 6)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(nft.owner, 'Owner Address')}
                    className="text-[#958da1] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                  <a
                    href={getEtherscanAddressUrl(nft.owner)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#958da1] hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              </div>

              {/* Contract Address */}
              <div className="flex items-center justify-between py-1 border-b border-[#1e2025]">
                <span className="text-[#ccc3d8]">Contract Address:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-medium select-all">
                    {shortenAddress(nft.contractAddress, 6)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(nft.contractAddress, 'Contract Address')}
                    className="text-[#958da1] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                  <a
                    href={getEtherscanTokenUrl(nft.contractAddress, nft.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#958da1] hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              </div>

              {/* Image CID */}
              <div className="flex items-center justify-between py-1 border-b border-[#1e2025]">
                <span className="text-[#ccc3d8]">Image IPFS URI:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#4cd7f6] truncate max-w-[180px] sm:max-w-[260px] select-all">
                    {shortenCID(nft.imageUri, 8)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(nft.imageUri, 'Image URI')}
                    className="text-[#958da1] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                  <a
                    href={resolveIPFS(nft.imageUri)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#958da1] hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              </div>

              {/* Metadata URI */}
              <div className="flex items-center justify-between py-1 border-b border-[#1e2025]">
                <span className="text-[#ccc3d8]">Token Metadata URI:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#4edea3] truncate max-w-[180px] sm:max-w-[260px] select-all">
                    {shortenCID(nft.metadataUri, 8)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(nft.metadataUri, 'Metadata URI')}
                    className="text-[#958da1] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                  <a
                    href={resolveIPFS(nft.metadataUri)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#958da1] hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              </div>

              {/* Tx Hash */}
              {nft.txHash && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#ccc3d8]">Mint Transaction:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white truncate max-w-[180px] sm:max-w-[260px] select-all">
                      {shortenAddress(nft.txHash, 6)}
                    </span>
                    <a
                      href={getEtherscanTxUrl(nft.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#4cd7f6] hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
