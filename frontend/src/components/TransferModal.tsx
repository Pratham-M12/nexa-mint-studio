import React, { useState } from 'react';
import { ethers } from 'ethers';
import { NFTItem } from '../types/nft';
import { useWeb3 } from '../context/Web3Context';
import { getEtherscanTxUrl, shortenAddress } from '../contractConfig';
import { resolveIPFS } from '../ipfs';
import { IPFSImage } from './IPFSImage';

interface TransferModalProps {
  nft: NFTItem | null;
  isOpen: boolean;
  onClose: () => void;
  onTransferSuccess?: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  nft,
  isOpen,
  onClose,
  onTransferSuccess,
}) => {
  const { transferNFTOnChain, addToast } = useWeb3();
  const [recipient, setRecipient] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transferReceipt, setTransferReceipt] = useState<{
    txHash: string;
    newOwner: string;
  } | null>(null);

  if (!isOpen || !nft) return null;

  // Validation using ethers.isAddress
  const trimmed = recipient.trim();
  const isValidAddress = trimmed.length > 0 && ethers.isAddress(trimmed);
  const isInvalidAddress = trimmed.length > 0 && !isValidAddress;

  const handleTransfer = async () => {
    if (!isValidAddress) {
      setErrorMessage('Please enter a valid Ethereum recipient address.');
      return;
    }

    if (trimmed.toLowerCase() === nft.owner.toLowerCase()) {
      setErrorMessage('Recipient is already the current owner of this NFT.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await transferNFTOnChain({
        tokenId: nft.id,
        toAddress: trimmed,
      });

      if (result.success && result.txHash) {
        setTransferReceipt({
          txHash: result.txHash,
          newOwner: result.newOwner || trimmed,
        });
        addToast({
          title: 'Transfer Successful',
          message: `NFT #${nft.id} transferred to ${shortenAddress(trimmed)}`,
          type: 'success',
        });
        onTransferSuccess?.();
      } else {
        setErrorMessage(result.error || 'Transfer failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Transfer failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setRecipient('');
    setErrorMessage(null);
    setTransferReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111318] border border-[#4a4455] rounded-2xl p-6 md:p-8 shadow-2xl inset-highlight flex flex-col gap-6">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-[#ccc3d8] hover:text-white transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/40 flex items-center justify-center text-[#d2bbff]">
            <span className="material-symbols-outlined text-xl">send</span>
          </div>
          <div>
            <h2 className="text-xl font-bold font-headline text-white">Transfer NFT</h2>
            <p className="text-xs text-[#ccc3d8]">Transfer ERC-721 token ownership on Ethereum Sepolia</p>
          </div>
        </div>

        {transferReceipt ? (
          /* Success Receipt View */
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <span
                className="material-symbols-outlined text-emerald-400 text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <div>
                <div className="text-sm font-semibold text-white">Transfer Successful</div>
                <div className="text-xs text-emerald-300">
                  Ownership has been updated on the Sepolia ledger.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1b21] border border-[#282a2f] flex flex-col gap-2.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#ccc3d8]">Token:</span>
                <span className="text-white font-semibold">
                  {nft.name} (#{nft.id.padStart(3, '0')})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#ccc3d8]">New Owner:</span>
                <span className="text-[#4cd7f6]">{shortenAddress(transferReceipt.newOwner, 6)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#ccc3d8]">Tx Hash:</span>
                <a
                  href={getEtherscanTxUrl(transferReceipt.txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#4edea3] hover:underline flex items-center gap-1"
                >
                  <span>{shortenAddress(transferReceipt.txHash, 6)}</span>
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={getEtherscanTxUrl(transferReceipt.txHash)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#1e2025] hover:bg-[#282a2f] border border-[#4a4455] text-center text-xs font-mono text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                <span>View Transaction</span>
              </a>
              <button
                onClick={handleResetAndClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#7c3aed] text-white text-xs font-headline font-semibold hover:bg-opacity-90 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Transfer Form View */
          <div className="flex flex-col gap-5">
            {/* NFT Card Snippet */}
            <div className="p-3 rounded-xl bg-[#1a1b21] border border-[#282a2f] flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#4a4455] flex-shrink-0">
                <IPFSImage
                  src={nft.image || nft.imageUri}
                  alt={nft.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="text-sm font-bold text-white font-headline truncate">{nft.name}</div>
                <div className="text-xs text-[#ccc3d8] font-mono">Token ID: #{nft.id.padStart(3, '0')}</div>
                <div className="text-[11px] text-[#958da1] font-mono truncate mt-0.5">
                  Current Owner: {shortenAddress(nft.owner, 6)}
                </div>
              </div>
            </div>

            {/* Recipient Address Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-[#ccc3d8]">
                  Recipient Wallet Address <span className="text-[#d2bbff]">*</span>
                </label>
                {isValidAddress && (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Valid recipient address
                  </span>
                )}
                {isInvalidAddress && (
                  <span className="text-[11px] font-mono text-red-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">error</span>
                    Invalid Ethereum address
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={isSubmitting}
                  className={`w-full bg-[#0c0e13] border rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none transition-all ${
                    isValidAddress
                      ? 'border-emerald-500/60 focus:border-emerald-500'
                      : isInvalidAddress
                      ? 'border-red-500/60 focus:border-red-500'
                      : 'border-[#4a4455] focus:border-[#7c3aed]'
                  }`}
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setRecipient(text.trim());
                    } catch {
                      // ignore clipboard permission error
                    }
                  }}
                  className="absolute right-3 top-3 text-xs text-[#d2bbff] hover:text-white font-mono cursor-pointer"
                >
                  Paste
                </button>
              </div>
            </div>

            {/* Irreversible Warning Callout */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5">warning</span>
              <p className="leading-relaxed">
                Blockchain transfers cannot easily be reversed. Verify the recipient address carefully before signing the transaction.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-900/30 border border-red-500/40 text-red-300 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            {/* Submit Action */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleResetAndClose}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1e2025] hover:bg-[#282a2f] border border-[#4a4455] text-xs font-mono text-[#ccc3d8] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTransfer}
                disabled={!isValidAddress || isSubmitting}
                className={`flex-1 py-3 px-4 rounded-xl font-headline text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isValidAddress && !isSubmitting
                    ? 'bg-[#7c3aed] text-white hover:bg-opacity-90 glow-violet'
                    : 'bg-[#1e2025] text-[#958da1] cursor-not-allowed border border-[#282a2f]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">send</span>
                    <span>Transfer NFT</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
