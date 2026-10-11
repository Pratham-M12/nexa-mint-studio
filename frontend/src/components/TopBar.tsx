import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { shortenAddress, getEtherscanTxUrl } from '../contractConfig';
import { ActiveScreen } from './Sidebar';

interface TopBarProps {
  currentScreen: ActiveScreen;
  onOpenMobileMenu: () => void;
  onScrollToPipeline?: () => void;
  onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentScreen,
  onOpenMobileMenu,
  onScrollToPipeline,
  onOpenSettings,
}) => {
  const { wallet, connectWallet, switchNetwork, contractAddress, isMiningTx, miningTxHash, addToast } = useWeb3();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      title: 'Copied to Clipboard',
      message: `${label} copied successfully.`,
      type: 'success',
    });
  };

  const getBreadcrumbTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'Dashboard';
      case 'mint-studio':
        return 'Studio';
      case 'my-nfts':
        return 'My Collection';
      case 'activity':
        return 'Live Activity';
      case 'architecture':
        return 'Architecture';
      case 'about':
        return 'About';
      default:
        return 'Studio';
    }
  };

  return (
    <header className="h-16 px-4 md:px-6 border-b border-[#4a4455] bg-[#111318] flex justify-between items-center sticky top-0 z-30 inset-highlight">
      {/* Left: Mobile hamburger & Breadcrumb & Contract Pill */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-lg text-[#ccc3d8] hover:text-white lg:hidden cursor-pointer"
          aria-label="Open navigation"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div className="flex items-center gap-2 text-xs md:text-sm font-mono">
          <span className="text-[#ccc3d8]">Dashboard</span>
          <span className="text-[#4a4455]">/</span>
          <span className="text-[#d2bbff] font-medium">{getBreadcrumbTitle()}</span>
        </div>

        {/* Contract Address Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a1b21] border border-[#4a4455] text-xs text-[#ccc3d8] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
          <span>
            Contract: <strong className="text-[#e2e2e9] font-medium">{shortenAddress(contractAddress)}</strong>
          </span>
          <button
            onClick={() => handleCopy(contractAddress, 'Contract Address')}
            className="hover:text-white ml-1 cursor-pointer"
            title="Copy Contract Address"
          >
            <span className="material-symbols-outlined text-xs">content_copy</span>
          </button>
        </div>
      </div>

      {/* Right Actions: Mining Status, Network, Wallet */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mining Tx Status Pill */}
        {isMiningTx ? (
          <button
            onClick={onScrollToPipeline}
            className="flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded-lg bg-[#1e2025] border border-[#7c3aed] text-[#4cd7f6] text-xs font-mono glow-cyan animate-pulse cursor-pointer"
            title={miningTxHash ? `Mining Tx: ${miningTxHash}` : 'Mining Transaction in progress'}
          >
            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
            <span className="hidden sm:inline">1 Mining Tx</span>
            <span className="sm:hidden">Mining</span>
          </button>
        ) : (
          <button
            onClick={onScrollToPipeline}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e2025] hover:bg-[#282a2f] border border-[#4a4455] text-[#4cd7f6] text-xs font-mono transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">bolt</span>
            <span>Sepolia Active</span>
          </button>
        )}

        {/* Wrong network alert badge */}
        {wallet.isConnected && !wallet.isCorrectNetwork && (
          <button
            onClick={switchNetwork}
            className="px-2.5 py-1.5 rounded-lg bg-red-900/40 border border-red-500/60 text-red-300 text-xs font-mono flex items-center gap-1.5 hover:bg-red-900/60 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">warning</span>
            <span className="hidden sm:inline">Switch to Sepolia</span>
            <span className="sm:hidden">Wrong Net</span>
          </button>
        )}

        <div className="h-4 w-px bg-[#4a4455] hidden sm:block"></div>

        {/* Wallet Address Pill / Connect Button */}
        {wallet.isConnected && wallet.account ? (
          <div
            onClick={() => handleCopy(wallet.account!, 'Wallet Address')}
            className="flex items-center gap-2 bg-[#1e2025] hover:bg-[#282a2f] px-3 py-1.5 rounded-lg border border-[#4a4455] text-xs font-mono text-[#e2e2e9] cursor-pointer transition-colors"
            title="Click to copy wallet address"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span>{shortenAddress(wallet.account)}</span>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7c3aed] hover:bg-opacity-90 text-white text-xs font-headline font-semibold glow-violet transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
            <span>Connect</span>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-[#1e2025] hover:bg-[#282a2f] text-[#ccc3d8] hover:text-white transition-colors cursor-pointer"
          title="Studio Settings"
        >
          <span className="material-symbols-outlined text-lg">tune</span>
        </button>
      </div>
    </header>
  );
};
