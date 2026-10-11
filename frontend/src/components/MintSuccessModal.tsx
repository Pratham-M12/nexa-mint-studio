import React from 'react';
import { NFTItem } from '../types/nft';
import { getEtherscanTxUrl, shortenAddress } from '../contractConfig';
import { resolveIPFS, shortenCID } from '../ipfs';
import { IPFSImage } from './IPFSImage';

interface MintSuccessModalProps {
  nft: NFTItem | null;
  isOpen: boolean;
  onClose: () => void;
  onViewNFT: (nft: NFTItem) => void;
  onViewCollection: () => void;
  onMintAnother: () => void;
}

export const MintSuccessModal: React.FC<MintSuccessModalProps> = ({
  nft,
  isOpen,
  onClose,
  onViewNFT,
  onViewCollection,
  onMintAnother,
}) => {
  if (!isOpen || !nft) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#111318] border border-[#7c3aed]/50 rounded-2xl p-6 md:p-8 shadow-2xl inset-highlight glow-violet flex flex-col gap-6 max-h-[90vh] overflow-y-auto custom-scroll">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#ccc3d8] hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
          </div>
          <div>
            <div className="text-xs font-mono text-[#4edea3] uppercase tracking-wider">
              Sepolia Consensus Reached
            </div>
            <h2 className="text-2xl font-bold font-headline text-white">
              NFT Successfully Minted
            </h2>
          </div>
        </div>

        {/* Main Content: Artwork + Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Artwork Preview */}
          <div className="relative rounded-xl overflow-hidden border border-[#4a4455] bg-[#0c0e13] aspect-square flex items-center justify-center group">
            <IPFSImage
              src={nft.image || nft.imageUri}
              alt={nft.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-[#4a4455] text-xs font-mono text-[#d2bbff] z-10 pointer-events-none">
              #{nft.id.padStart(3, '0')}
            </div>
            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-emerald-500/40 text-[11px] font-mono text-emerald-400 flex items-center gap-1 z-10 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              On-Chain Sepolia
            </div>
          </div>

          {/* Details Column */}
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#1a1b21] border border-[#282a2f]">
              <span className="text-[#ccc3d8] text-[11px] block">NFT Name</span>
              <span className="text-base font-semibold text-white font-headline">
                {nft.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-[#1a1b21] border border-[#282a2f]">
                <span className="text-[#ccc3d8] text-[10px] block">Token ID</span>
                <span className="text-sm font-semibold text-[#4cd7f6]">
                  #{nft.id.padStart(3, '0')}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1a1b21] border border-[#282a2f]">
                <span className="text-[#ccc3d8] text-[10px] block">Standard</span>
                <span className="text-sm font-semibold text-[#d2bbff]">ERC-721</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#1a1b21] border border-[#282a2f]">
              <span className="text-[#ccc3d8] text-[10px] block">Owner Address</span>
              <span className="text-xs font-medium text-white truncate block">
                {nft.owner}
              </span>
            </div>

            {nft.txHash && (
              <div className="p-2.5 rounded-lg bg-[#1a1b21] border border-[#282a2f]">
                <span className="text-[#ccc3d8] text-[10px] block">Transaction Hash</span>
                <a
                  href={getEtherscanTxUrl(nft.txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#4cd7f6] hover:underline truncate flex items-center gap-1 mt-0.5"
                >
                  <span className="truncate">{nft.txHash}</span>
                  <span className="material-symbols-outlined text-xs shrink-0">open_in_new</span>
                </a>
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-[#1a1b21] border border-[#282a2f]">
              <span className="text-[#ccc3d8] text-[10px] block">IPFS Metadata URI</span>
              <a
                href={resolveIPFS(nft.metadataUri)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#4edea3] hover:underline truncate flex items-center gap-1 mt-0.5"
              >
                <span className="truncate">{shortenCID(nft.metadataUri, 12)}</span>
                <span className="material-symbols-outlined text-xs shrink-0">open_in_new</span>
              </a>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#4a4455]">
          <button
            onClick={() => {
              onClose();
              onViewNFT(nft);
            }}
            className="py-2.5 px-3 rounded-lg bg-[#1e2025] hover:bg-[#282a2f] border border-[#4a4455] text-white text-xs font-mono font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            <span>View NFT</span>
          </button>

          {nft.txHash ? (
            <a
              href={getEtherscanTxUrl(nft.txHash)}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 rounded-lg bg-[#1e2025] hover:bg-[#282a2f] border border-[#4a4455] text-[#4cd7f6] text-xs font-mono font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">open_in_browser</span>
              <span>Explorer</span>
            </a>
          ) : (
            <button
              disabled
              className="py-2.5 px-3 rounded-lg bg-[#1e2025]/50 border border-[#4a4455]/50 text-[#958da1] text-xs font-mono font-medium"
            >
              Explorer
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onViewCollection();
            }}
            className="py-2.5 px-3 rounded-lg bg-[#1e2025] hover:bg-[#282a2f] border border-[#4a4455] text-white text-xs font-mono font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">grid_view</span>
            <span>My NFTs</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onMintAnother();
            }}
            className="py-2.5 px-3 rounded-lg bg-[#7c3aed] text-white text-xs font-headline font-semibold hover:bg-opacity-90 glow-violet transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Mint Another</span>
          </button>
        </div>
      </div>
    </div>
  );
};
