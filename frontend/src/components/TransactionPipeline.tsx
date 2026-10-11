import React, { useState } from 'react';
import { shortenCID } from '../ipfs';

interface TransactionPipelineProps {
  currentStepIndex: number; // 0 to 6
  isMinting: boolean;
  imageCid?: string;
  metadataCid?: string;
  txHash?: string;
  blockNumber?: number;
  tokenId?: string;
  rawMetadata?: any;
}

export const TransactionPipeline: React.FC<TransactionPipelineProps> = ({
  currentStepIndex,
  isMinting,
  imageCid,
  metadataCid,
  txHash,
  blockNumber,
  tokenId,
  rawMetadata,
}) => {
  const [showTechDetails, setShowTechDetails] = useState<boolean>(false);

  const getStepStatus = (index: number): 'completed' | 'processing' | 'pending' | 'failed' => {
    if (currentStepIndex > index) return 'completed';
    if (currentStepIndex === index && isMinting) return 'processing';
    return 'pending';
  };

  const steps = [
    {
      id: 1,
      num: '01',
      title: 'IPFS Pin',
      subtitle: 'Upload Artwork',
      detail: imageCid ? `CID: ${shortenCID(imageCid, 5)}` : 'Awaiting Upload',
      status: getStepStatus(1),
    },
    {
      id: 2,
      num: '02',
      title: 'Schema',
      subtitle: 'ERC-721 JSON',
      detail: currentStepIndex >= 2 ? 'Metadata Compiled' : 'Pending Compiler',
      status: getStepStatus(2),
    },
    {
      id: 3,
      num: '03',
      title: 'Metadata URI',
      subtitle: 'URI Injected',
      detail: metadataCid ? `ipfs://${shortenCID(metadataCid, 5)}` : 'Awaiting Pin',
      status: getStepStatus(3),
    },
    {
      id: 4,
      num: '04',
      title: 'Signature',
      subtitle: 'MetaMask Gas',
      detail: currentStepIndex >= 4 ? 'Approved (Signed)' : 'Awaiting Wallet',
      status: getStepStatus(4),
    },
    {
      id: 5,
      num: '05',
      title: 'Mining',
      subtitle: 'Sepolia Execution',
      detail: blockNumber ? `Block #${blockNumber.toLocaleString()}` : txHash ? 'Mining on Sepolia...' : 'Pending Tx...',
      status: getStepStatus(5),
    },
    {
      id: 6,
      num: '06',
      title: 'Finalize',
      subtitle: 'Token Transfer',
      detail: tokenId ? `Token #${tokenId}` : 'Pending Confirmation',
      status: getStepStatus(6),
    },
  ];

  const getActiveStepLabel = () => {
    if (!isMinting && currentStepIndex === 0) return 'Ready for Pipeline Execution';
    if (!isMinting && currentStepIndex >= 6) return 'Pipeline Committed on Sepolia';
    return `Step ${Math.min(currentStepIndex, 6)} of 6 Processing`;
  };

  return (
    <section className="rounded-2xl bg-[#111318] border border-[#4a4455] p-5 md:p-6 inset-highlight">
      {/* Pipeline Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#4a4455]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/40 flex items-center justify-center text-[#d2bbff]">
            <span className="material-symbols-outlined text-xl">account_tree</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-headline text-white">
                Decentralized Minting Pipeline
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#1a1b21] border border-[#4a4455] text-[#4edea3]">
                Sepolia Consensus
              </span>
            </div>
            <p className="text-xs text-[#ccc3d8] mt-0.5">
              Atomic multi-stage transition: Browser IPFS pin &rarr; Ethers.js JSON-RPC &rarr; ERC-721 ledger write
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1a1b21] border border-[#4a4455] text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isMinting
                  ? 'bg-amber-400 animate-pulse'
                  : currentStepIndex >= 6
                  ? 'bg-emerald-400'
                  : 'bg-[#958da1]'
              }`}
            ></span>
            <span className="text-[#ccc3d8]">{getActiveStepLabel()}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowTechDetails(!showTechDetails)}
            className="text-xs font-mono text-[#d2bbff] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{showTechDetails ? 'Hide' : 'Inspect'} Payload</span>
            <span className="material-symbols-outlined text-sm">
              {showTechDetails ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {/* 6-Step Visual Horizontal Pipeline Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-5">
        {steps.map((st) => {
          const isDone = st.status === 'completed';
          const isCurrent = st.status === 'processing';

          return (
            <div
              key={st.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-300 min-h-[110px] ${
                isDone
                  ? 'bg-[#1a1b21] border-emerald-500/40 text-emerald-300'
                  : isCurrent
                  ? 'bg-[#7c3aed]/15 border-[#7c3aed] text-white glow-violet ring-1 ring-[#7c3aed]/50'
                  : 'bg-[#1a1b21]/60 border-[#4a4455] text-[#ccc3d8]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-mono font-bold ${
                    isDone ? 'text-emerald-400' : isCurrent ? 'text-[#d2bbff]' : 'text-[#958da1]'
                  }`}
                >
                  {st.num}
                </span>

                {isDone ? (
                  <span
                    className="material-symbols-outlined text-emerald-400 text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                ) : isCurrent ? (
                  <span className="material-symbols-outlined text-[#d2bbff] text-base animate-spin">
                    progress_activity
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#4a4455]"></span>
                )}
              </div>

              <div className="my-1.5">
                <div
                  className={`text-xs font-bold font-headline truncate ${
                    isCurrent ? 'text-white' : isDone ? 'text-emerald-100' : 'text-[#e2e2e9]'
                  }`}
                >
                  {st.title}
                </div>
                <div className="text-[10px] text-[#ccc3d8] truncate">{st.subtitle}</div>
              </div>

              <div
                className={`text-[10px] font-mono truncate px-1.5 py-0.5 rounded ${
                  isDone
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                    : isCurrent
                    ? 'bg-[#7c3aed]/30 text-[#d2bbff] border border-[#7c3aed]/40'
                    : 'bg-[#111318] text-[#958da1]'
                }`}
                title={st.detail}
              >
                {st.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Technical Inspection Drawer */}
      {showTechDetails && (
        <div className="mt-5 p-4 rounded-xl bg-[#0c0e13] border border-[#4a4455] flex flex-col gap-3 font-mono text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[#ccc3d8] border-b border-[#282a2f] pb-2">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#4cd7f6]">code</span>
              On-Chain Transaction &amp; IPFS Inspection Payload
            </span>
            <span className="text-[11px] text-[#4edea3]">Realtime Execution State</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[#ccc3d8] text-[11px]">IPFS Content Identifiers:</span>
              <div className="p-2.5 rounded-lg bg-[#111318] border border-[#282a2f] flex flex-col gap-1 text-[11px]">
                <div className="truncate">
                  <span className="text-[#ccc3d8]">Artwork CID:</span>{' '}
                  <span className="text-[#4cd7f6]">{imageCid || 'Not pinned yet'}</span>
                </div>
                <div className="truncate">
                  <span className="text-[#ccc3d8]">Metadata CID:</span>{' '}
                  <span className="text-[#4edea3]">{metadataCid || 'Not pinned yet'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[#ccc3d8] text-[11px]">Sepolia Transaction State:</span>
              <div className="p-2.5 rounded-lg bg-[#111318] border border-[#282a2f] flex flex-col gap-1 text-[11px]">
                <div className="truncate">
                  <span className="text-[#ccc3d8]">Transaction Hash:</span>{' '}
                  <span className="text-[#d2bbff]">{txHash || 'Awaiting broadcast'}</span>
                </div>
                <div className="truncate">
                  <span className="text-[#ccc3d8]">Block Number:</span>{' '}
                  <span className="text-white">{blockNumber ? `#${blockNumber}` : 'Pending validator inclusion'}</span>
                </div>
              </div>
            </div>
          </div>

          {rawMetadata && (
            <div className="flex flex-col gap-1 pt-1">
              <span className="text-[#ccc3d8] text-[11px]">Compiled ERC-721 JSON Metadata:</span>
              <pre className="p-3 rounded-lg bg-[#111318] border border-[#282a2f] text-[11px] text-[#4edea3] overflow-x-auto custom-scroll max-h-36">
                {JSON.stringify(rawMetadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
