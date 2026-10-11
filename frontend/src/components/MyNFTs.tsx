import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { NFTItem } from '../types/nft';
import { shortenAddress } from '../contractConfig';
import { resolveIPFS } from '../ipfs';
import { IPFSImage } from './IPFSImage';
import { ActiveScreen } from './Sidebar';

interface MyNFTsProps {
  onNavigate: (screen: ActiveScreen) => void;
  onNFTSelect: (nft: NFTItem) => void;
  onTransferSelect: (nft: NFTItem) => void;
}

export const MyNFTs: React.FC<MyNFTsProps> = ({
  onNavigate,
  onNFTSelect,
  onTransferSelect,
}) => {
  const { wallet, nfts, refreshOnChainNFTs, isLoadingNFTs } = useWeb3();
  const [filterMode, setFilterMode] = useState<'all' | 'owned'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentAccount = wallet.account?.toLowerCase() || '';

  const filteredNFTs = nfts.filter((nft) => {
    // Check owned filter
    if (filterMode === 'owned') {
      if (!currentAccount) return false;
      if (nft.owner.toLowerCase() !== currentAccount) return false;
    }

    // Check search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = nft.name.toLowerCase().includes(q);
      const matchId = nft.id.includes(q);
      const matchOwner = nft.owner.toLowerCase().includes(q);
      return matchName || matchId || matchOwner;
    }

    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 custom-scroll">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#4a4455]">
        <div>
          <div className="text-xs font-mono text-[#4cd7f6] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">grid_view</span>
            ERC-721 Collection Repository
          </div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-white tracking-tight">
            My NFT Collection
          </h1>
          <p className="text-xs text-[#ccc3d8] mt-1">
            Browse, inspect metadata, and transfer ERC-721 tokens registered on Sepolia
          </p>
        </div>

        {/* Filter Segmented Control & Search Bar & Sync Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Refresh on-chain button */}
          <button
            type="button"
            onClick={refreshOnChainNFTs}
            disabled={isLoadingNFTs}
            className="p-2 rounded-xl bg-[#111318] hover:bg-[#1a1b21] border border-[#4a4455] text-[#ccc3d8] hover:text-white transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
            title="Sync with Ethereum Sepolia"
          >
            <span className={`material-symbols-outlined text-base ${isLoadingNFTs ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, ID, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-[#111318] border border-[#4a4455] rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#7c3aed] transition-colors"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#958da1] text-base">
              search
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#958da1] hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {/* Segmented Filter */}
          <div className="flex items-center p-1 rounded-xl bg-[#111318] border border-[#4a4455]">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-[#7c3aed] text-white font-semibold glow-violet'
                  : 'text-[#ccc3d8] hover:text-white'
              }`}
            >
              All Minted ({nfts.length})
            </button>
            <button
              onClick={() => setFilterMode('owned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                filterMode === 'owned'
                  ? 'bg-[#7c3aed] text-white font-semibold glow-violet'
                  : 'text-[#ccc3d8] hover:text-white'
              }`}
            >
              Owned by Me ({currentAccount ? nfts.filter(x => x.owner.toLowerCase() === currentAccount).length : 0})
            </button>
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredNFTs.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#111318] border border-dashed border-[#4a4455] flex flex-col items-center justify-center text-center gap-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-[#1e2025] flex items-center justify-center text-[#958da1]">
            <span className="material-symbols-outlined text-3xl">image_not_supported</span>
          </div>
          <div>
            <h3 className="text-lg font-bold font-headline text-white">No NFTs Yet</h3>
            <p className="text-xs text-[#ccc3d8] mt-1 max-w-sm">
              {searchQuery
                ? 'No NFTs match your search query. Try searching for a different token name or ID.'
                : filterMode === 'owned' && !currentAccount
                ? 'Please connect your MetaMask wallet to view your owned NFTs.'
                : 'No tokens found in this filter view. Mint your first digital artifact to get started.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('mint-studio')}
            className="mt-2 py-2.5 px-5 rounded-xl bg-[#7c3aed] text-white text-xs font-headline font-semibold hover:bg-opacity-90 glow-violet transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Mint Your First NFT</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNFTs.map((nft) => (
            <div
              key={nft.id}
              className="bg-[#111318] rounded-xl border border-[#4a4455] overflow-hidden flex flex-col group hover:border-[#7c3aed] transition-all duration-200 inset-highlight shadow-lg"
            >
              {/* Image Stage */}
              <div
                onClick={() => onNFTSelect(nft)}
                className="aspect-square w-full overflow-hidden bg-[#0c0e13] relative cursor-pointer"
              >
                <IPFSImage
                  src={nft.image || nft.imageUri}
                  alt={nft.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-sm border border-[#4a4455] text-xs font-mono text-[#d2bbff] z-10 pointer-events-none">
                  #{nft.id.padStart(3, '0')}
                </span>
                <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#4edea3]/20 backdrop-blur-sm border border-[#4edea3]/40 text-[10px] font-mono text-[#4edea3] z-10 pointer-events-none">
                  Sepolia
                </span>
              </div>

              {/* Content Panel */}
              <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                <div>
                  <h4
                    onClick={() => onNFTSelect(nft)}
                    className="text-base font-headline font-bold text-white truncate cursor-pointer hover:text-[#d2bbff] transition-colors"
                  >
                    {nft.name}
                  </h4>
                  <p className="text-xs font-mono text-[#ccc3d8] mt-1 truncate">
                    Owner: {shortenAddress(nft.owner, 4)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[#4a4455] gap-2">
                  <button
                    onClick={() => onTransferSelect(nft)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#1e2025] hover:bg-[#282a2f] border border-[#4a4455] text-xs font-mono text-[#4cd7f6] hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    <span>Transfer</span>
                  </button>

                  <button
                    onClick={() => onNFTSelect(nft)}
                    className="py-1.5 px-3 rounded-lg bg-[#7c3aed]/20 hover:bg-[#7c3aed]/30 border border-[#7c3aed]/40 text-[#d2bbff] text-xs font-mono transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Details</span>
                    <span className="material-symbols-outlined text-xs">north_east</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
