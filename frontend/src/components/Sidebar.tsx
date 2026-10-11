import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { shortenAddress, getEtherscanAddressUrl } from '../contractConfig';

export type ActiveScreen =
  | 'dashboard'
  | 'mint-studio'
  | 'my-nfts'
  | 'activity'
  | 'architecture'
  | 'about';

interface SidebarProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenSettings: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  onOpenSettings,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { wallet, connectWallet, disconnectWallet, nfts, addToast } = useWeb3();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast({
      title: 'Copied to Clipboard',
      message: `${label} copied successfully.`,
      type: 'success',
    });
  };

  const navItems: { id: ActiveScreen; label: string; icon: string; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'mint-studio', label: 'Mint Studio', icon: 'palette', badge: 'IDE' },
    { id: 'my-nfts', label: 'My Collection', icon: 'grid_view', badge: nfts.length.toString() },
    { id: 'activity', label: 'Live Activity', icon: 'monitoring' },
    { id: 'architecture', label: 'Architecture', icon: 'schema' },
    { id: 'about', label: 'About', icon: 'info' },
  ];

  const handleNavClick = (screen: ActiveScreen) => {
    onNavigate(screen);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`h-screen w-64 flex flex-col justify-between p-4 bg-[#1a1b21] border-r border-[#4a4455] z-50 fixed left-0 top-0 select-none transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Section */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between px-1 pt-1">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleNavClick('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#4cd7f6] flex items-center justify-center glow-violet shadow-lg">
                <span
                  className="material-symbols-outlined text-white text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  token
                </span>
              </div>
              <div>
                <div className="text-base font-bold text-[#e2e2e9] tracking-tight font-headline">
                  NEXA MINT
                </div>
                <div className="text-xs text-[#4cd7f6] flex items-center gap-1.5 font-mono">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse"></span>
                  Sepolia Testnet IDE
                </div>
              </div>
            </div>

            {/* Mobile close icon */}
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-[#ccc3d8] hover:text-white lg:hidden"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Quick Action CTA */}
          <button
            onClick={() => handleNavClick('mint-studio')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#7c3aed] text-white font-headline text-sm font-semibold hover:bg-opacity-90 glow-violet transition-all duration-150 cursor-pointer active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>New Mint</span>
          </button>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1">
            {navItems.slice(0, 4).map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-150 text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#33353a] text-[#d2bbff] font-medium border-l-2 border-[#d2bbff]'
                      : 'text-[#ccc3d8] hover:text-[#e2e2e9] hover:bg-[#282a2f]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="material-symbols-outlined text-xl"
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium font-mono">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono ${
                        isActive
                          ? 'bg-[#7c3aed] text-[#ede0ff]'
                          : 'bg-[#1e2025] text-[#ccc3d8]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="h-px bg-[#4a4455] my-2 opacity-50"></div>

            {navItems.slice(4).map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#33353a] text-[#d2bbff] font-medium border-l-2 border-[#d2bbff]'
                      : 'text-[#ccc3d8] hover:text-[#e2e2e9] hover:bg-[#282a2f]'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium font-mono">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Meta & Wallet Status Card */}
        <div className="flex flex-col gap-3 pt-3 border-t border-[#4a4455]">
          {/* Gas Tracker */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#1e2025] text-xs font-mono border border-[#4a4455]">
            <span className="flex items-center gap-1.5 text-[#4cd7f6]">
              <span
                className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                fiber_manual_record
              </span>
              Sepolia (12 Gwei)
            </span>
            <span className="text-[#4edea3]">Fast ⚡</span>
          </div>

          {/* Wallet Module */}
          <div className="p-2.5 rounded-xl bg-[#111318] border border-[#4a4455] flex flex-col gap-2">
            {wallet.isConnected && wallet.account ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#d2bbff] text-base">
                      account_balance_wallet
                    </span>
                    <span className="text-xs font-mono text-[#e2e2e9] font-semibold">
                      {shortenAddress(wallet.account)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#ccc3d8]">
                    <button
                      onClick={() => handleCopy(wallet.account!, 'Wallet Address')}
                      className="p-1 hover:text-white transition-colors cursor-pointer"
                      title="Copy Address"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                    <a
                      href={getEtherscanAddressUrl(wallet.account)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 hover:text-white transition-colors"
                      title="View on Etherscan"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-mono pt-1 border-t border-[#4a4455]">
                  <span className="text-[#ccc3d8]">Balance:</span>
                  <span className="text-[#e2e2e9] font-semibold text-[#4cd7f6]">
                    {wallet.balance !== null ? `${wallet.balance} ETH` : '0.0000 ETH'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={disconnectWallet}
                  className="w-full mt-1 py-1 px-2 rounded-lg bg-[#1e2025] hover:bg-[#282a2f] border border-[#4a4455] text-xs font-mono text-[#ccc3d8] hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">logout</span>
                  <span>Disconnect</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-[#ccc3d8]">
                  <span>Wallet Status</span>
                  <span className="text-amber-400 font-mono">Disconnected</span>
                </div>
                <button
                  onClick={connectWallet}
                  className="w-full py-1.5 px-3 rounded-lg bg-[#7c3aed]/20 hover:bg-[#7c3aed]/30 border border-[#7c3aed]/50 text-[#d2bbff] text-xs font-mono font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">login</span>
                  <span>Connect MetaMask</span>
                </button>
              </div>
            )}
          </div>

          {/* Settings & Mode */}
          <div className="flex items-center justify-between px-1 text-[#ccc3d8] text-xs font-mono">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 hover:text-[#e2e2e9] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">settings</span>
              Settings
            </button>
            <span className="text-[#958da1]">v2.4-Sepolia</span>
          </div>
        </div>
      </aside>
    </>
  );
};
