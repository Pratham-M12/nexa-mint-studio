import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { shortenAddress, getEtherscanTxUrl } from '../contractConfig';
import { resolveIPFS } from '../ipfs';

export const LiveActivity: React.FC = () => {
  const { activities, isMiningTx, miningTxHash } = useWeb3();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full flex flex-col gap-6 custom-scroll">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#4a4455]">
        <div>
          <div className="text-xs font-mono text-[#4cd7f6] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">monitoring</span>
            Consensus Ledger Feed
          </div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-white tracking-tight">
            Live Activity Timeline
          </h1>
          <p className="text-xs text-[#ccc3d8] mt-1">
            Real-time feed of NFT minting transactions and ownership transfers on Ethereum Sepolia
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111318] border border-[#4a4455] text-xs font-mono text-[#4edea3]">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
          <span>Web3 Telemetry Syncing</span>
        </div>
      </div>

      {/* Active Pending Mining Banner */}
      {isMiningTx && (
        <div className="p-4 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/40 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-[#d2bbff] animate-spin">
              progress_activity
            </span>
            <div>
              <div className="text-sm font-semibold text-white font-headline">
                Mining Transaction on Sepolia
              </div>
              <div className="text-xs font-mono text-[#ccc3d8]">
                {miningTxHash ? `Tx: ${shortenAddress(miningTxHash, 8)}` : 'Broadcasting bytecode to validators...'}
              </div>
            </div>
          </div>
          {miningTxHash && (
            <a
              href={getEtherscanTxUrl(miningTxHash)}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-[#4cd7f6] hover:underline flex items-center gap-1"
            >
              <span>View Etherscan</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          )}
        </div>
      )}

      {/* Timeline List or Empty State */}
      {activities.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#111318] border border-dashed border-[#4a4455] flex flex-col items-center justify-center text-center gap-3 my-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1e2025] flex items-center justify-center text-[#958da1]">
            <span className="material-symbols-outlined text-3xl">history_toggle_off</span>
          </div>
          <h3 className="text-base font-bold font-headline text-white">No Activity Recorded Yet</h3>
          <p className="text-xs text-[#ccc3d8] max-w-sm">
            Mint or transfer an NFT on Ethereum Sepolia to observe real on-chain transaction events streamed here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activities.map((act) => {
            const isMint = act.type === 'mint';
            return (
              <div
                key={act.id}
                className="p-4 rounded-xl bg-[#111318] border border-[#4a4455] hover:border-[#7c3aed]/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 inset-highlight shadow-md"
              >
                {/* Left: Thumbnail & Event Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {act.image ? (
                    <img
                      src={resolveIPFS(act.image)}
                      alt={act.nftName}
                      className="w-14 h-14 rounded-lg object-cover border border-[#4a4455] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-[#1e2025] border border-[#4a4455] flex items-center justify-center text-[#958da1] shrink-0">
                      <span className="material-symbols-outlined text-xl">token</span>
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          isMint
                            ? 'bg-[#7c3aed]/20 text-[#d2bbff] border border-[#7c3aed]/40'
                            : 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40'
                        }`}
                      >
                        {isMint ? 'NFT Minted' : 'NFT Transferred'}
                      </span>
                      <span className="text-xs font-mono text-[#ccc3d8]">
                        #{act.tokenId.padStart(3, '0')}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold font-headline text-white truncate mt-1">
                      {act.nftName}
                    </h3>

                    <div className="text-xs font-mono text-[#958da1] mt-0.5 truncate">
                      {isMint ? (
                        <span>Minted to: <strong className="text-[#ccc3d8]">{shortenAddress(act.to, 4)}</strong></span>
                      ) : (
                        <span>
                          From: <strong className="text-[#ccc3d8]">{shortenAddress(act.from || '', 4)}</strong> &rarr; To:{' '}
                          <strong className="text-[#4cd7f6]">{shortenAddress(act.to, 4)}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Timestamp & Etherscan Tx Link */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-[#282a2f] pt-2 sm:pt-0 font-mono text-xs text-[#ccc3d8]">
                  <span className="text-[11px] text-[#958da1]">
                    {new Date(act.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  {act.txHash && (
                    <a
                      href={getEtherscanTxUrl(act.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#4cd7f6] hover:underline flex items-center gap-1 mt-1"
                    >
                      <span>Tx: {shortenAddress(act.txHash, 4)}</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
