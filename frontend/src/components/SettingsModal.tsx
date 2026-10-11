import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import {
  getContractAddress,
  setContractAddress,
} from '../contractConfig';
import {
  hasPinataJWT,
  setPinataJWT,
  clearPinataJWT,
  testPinataAuthentication,
} from '../ipfs';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { updateContractAddress, addToast } = useWeb3();
  const defaultEnvAddress = (import.meta.env.VITE_CONTRACT_ADDRESS as string) || '';
  const [contractInput, setContractInput] = useState<string>(getContractAddress());
  const [isConfigured, setIsConfigured] = useState<boolean>(() => hasPinataJWT());
  const [newPinataJwt, setNewPinataJwt] = useState<string>('');
  const [testResult, setTestResult] = useState<{ testing: boolean; message?: string; success?: boolean }>({
    testing: false,
  });

  if (!isOpen) return null;

  const handleSave = () => {
    const cleanedContract = contractInput.trim() || defaultEnvAddress;
    setContractAddress(cleanedContract);
    updateContractAddress(cleanedContract);

    if (newPinataJwt.trim()) {
      setPinataJWT(newPinataJwt.trim());
      setIsConfigured(true);
      setNewPinataJwt('');
    }

    addToast({
      title: 'Settings Saved',
      message: 'Contract address and IPFS configuration updated successfully.',
      type: 'success',
    });
    onClose();
  };

  const handleTestPinata = async () => {
    setTestResult({ testing: true });
    const tokenToTest = newPinataJwt.trim() || undefined;
    const res = await testPinataAuthentication(tokenToTest);
    setTestResult({
      testing: false,
      message: res.message,
      success: res.valid,
    });
    if (res.valid) {
      setIsConfigured(true);
    }
  };

  const handleClearPinata = () => {
    clearPinataJWT();
    setNewPinataJwt('');
    setIsConfigured(hasPinataJWT());
    setTestResult({ testing: false });
    addToast({
      title: 'Token Cleared',
      message: 'Custom Pinata JWT removed from local browser session.',
      type: 'info',
    });
  };

  const handleResetContract = () => {
    setContractInput(defaultEnvAddress);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#111318] border border-[#4a4455] rounded-2xl p-6 md:p-8 shadow-2xl inset-highlight flex flex-col gap-6 max-h-[90vh] overflow-y-auto custom-scroll">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#ccc3d8] hover:text-white transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/40 flex items-center justify-center text-[#d2bbff]">
            <span className="material-symbols-outlined text-xl">tune</span>
          </div>
          <div>
            <h2 className="text-xl font-bold font-headline text-white">Studio Environment Settings</h2>
            <p className="text-xs text-[#ccc3d8]">Configure Sepolia contract address &amp; Pinata IPFS credentials</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-5">
          {/* Contract Address */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-[#ccc3d8]">
                Ethereum Sepolia ERC-721 Contract Address
              </label>
              <button
                type="button"
                onClick={handleResetContract}
                className="text-[11px] font-mono text-[#4cd7f6] hover:underline cursor-pointer"
              >
                Reset to .env Default
              </button>
            </div>
            <input
              type="text"
              value={contractInput}
              onChange={(e) => setContractInput(e.target.value)}
              placeholder="0x..."
              className="w-full bg-[#0c0e13] border border-[#4a4455] rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#7c3aed] transition-colors"
            />
            <span className="text-[11px] text-[#958da1]">
              Default deployed contract address on Sepolia: <code className="text-[#ccc3d8]">{defaultEnvAddress || 'Not set in .env'}</code>
            </span>
          </div>

          {/* Pinata JWT Configuration Status */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-[#ccc3d8]">
                Pinata IPFS Authentication
              </label>
              {isConfigured ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Configured
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/15 border border-amber-500/40 text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Not configured
                </span>
              )}
            </div>

            {/* Input to update token (never renders the existing JWT value) */}
            <div className="relative">
              <input
                type="password"
                value={newPinataJwt}
                onChange={(e) => setNewPinataJwt(e.target.value)}
                placeholder={isConfigured ? "Update token (leave blank to keep current)" : "Paste Pinata JWT..."}
                autoComplete="off"
                className="w-full bg-[#0c0e13] border border-[#4a4455] rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#7c3aed] transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestPinata}
                  disabled={testResult.testing || (!isConfigured && !newPinataJwt.trim())}
                  className="px-3 py-1.5 rounded-lg bg-[#1e2025] hover:bg-[#282a2f] border border-[#4a4455] text-xs font-mono text-[#4cd7f6] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testResult.testing ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">wifi_tethering</span>
                      <span>Test Connection</span>
                    </>
                  )}
                </button>

                {isConfigured && (
                  <button
                    type="button"
                    onClick={handleClearPinata}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-[#958da1] hover:text-red-400 transition-colors cursor-pointer"
                    title="Remove custom token from browser session"
                  >
                    Clear Token
                  </button>
                )}
              </div>

              {testResult.message && (
                <span
                  className={`text-xs font-mono truncate max-w-xs ${
                    testResult.success ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {testResult.message}
                </span>
              )}
            </div>

            <span className="text-[11px] text-[#958da1]">
              Status reflects whether a valid JWT is loaded from <code className="text-[#ccc3d8]">VITE_PINATA_JWT</code> or updated in session. Tokens are never exposed in the interface.
            </span>
          </div>

          {/* Sepolia Faucet Links */}
          <div className="p-4 rounded-xl bg-[#1a1b21] border border-[#282a2f] flex flex-col gap-2">
            <span className="text-xs font-semibold text-white font-headline flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#4edea3]">water_drop</span>
              Need Sepolia Testnet ETH?
            </span>
            <p className="text-xs text-[#ccc3d8]">
              Free testnet ETH is required to pay for Ethereum gas fees when minting.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#111318] hover:bg-[#282a2f] border border-[#4a4455] text-xs font-mono text-[#4cd7f6] flex items-center gap-1 transition-colors"
              >
                <span>Google Web3 Faucet</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
              <a
                href="https://sepoliafaucet.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#111318] hover:bg-[#282a2f] border border-[#4a4455] text-xs font-mono text-[#d2bbff] flex items-center gap-1 transition-colors"
              >
                <span>Alchemy Faucet</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
              <a
                href="https://www.infura.io/faucet/sepolia"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#111318] hover:bg-[#282a2f] border border-[#4a4455] text-xs font-mono text-[#ccc3d8] flex items-center gap-1 transition-colors"
              >
                <span>Infura Faucet</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2 border-t border-[#4a4455]">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-[#1e2025] hover:bg-[#282a2f] border border-[#4a4455] text-xs font-mono text-[#ccc3d8] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-2.5 px-5 rounded-xl bg-[#7c3aed] text-white text-xs font-headline font-semibold hover:bg-opacity-90 glow-violet transition-all cursor-pointer"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
