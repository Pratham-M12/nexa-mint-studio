/**
 * NEXA MINT STUDIO
 * ERC-721 NFT Minting Studio on Ethereum Sepolia
 */

import React, { useState } from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import { Sidebar, ActiveScreen } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { MintStudio } from './components/MintStudio';
import { MyNFTs } from './components/MyNFTs';
import { LiveActivity } from './components/LiveActivity';
import { ArchitectureView } from './components/ArchitectureView';
import { AboutView } from './components/AboutView';
import { NFTDetailModal } from './components/NFTDetailModal';
import { TransferModal } from './components/TransferModal';
import { MintSuccessModal } from './components/MintSuccessModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/Toast';
import { NFTItem } from './types/nft';

const MainAppContent: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('mint-studio');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Modals state
  const [selectedNFTForDetail, setSelectedNFTForDetail] = useState<NFTItem | null>(null);
  const [selectedNFTForTransfer, setSelectedNFTForTransfer] = useState<NFTItem | null>(null);
  const [mintedNFTForSuccess, setMintedNFTForSuccess] = useState<NFTItem | null>(null);

  const { addToast } = useWeb3();

  const handleCopySuccess = (label: string) => {
    addToast({
      title: 'Copied to Clipboard',
      message: `${label} copied successfully.`,
      type: 'success',
    });
  };

  const handleScrollToPipeline = () => {
    if (currentScreen !== 'mint-studio') {
      setCurrentScreen('mint-studio');
    }
    setTimeout(() => {
      const section = document.querySelector('section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#0c0e13] text-[#e2e2e9] flex font-body antialiased selection:bg-[#7c3aed] selection:text-white">
      {/* Toast Notification Layer */}
      <ToastContainer />

      {/* Left Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Content Canvas */}
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0 bg-[#0c0e13] min-h-screen">
        {/* TopNavBar */}
        <TopBar
          currentScreen={currentScreen}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onScrollToPipeline={handleScrollToPipeline}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Screen Switcher */}
        <main className="flex-1 flex flex-col">
          {currentScreen === 'dashboard' && (
            <Dashboard
              onNavigate={(screen) => setCurrentScreen(screen)}
              onNFTSelect={(nft) => setSelectedNFTForDetail(nft)}
            />
          )}

          {currentScreen === 'mint-studio' && (
            <MintStudio
              onNavigate={(screen) => setCurrentScreen(screen)}
              onNFTSelect={(nft) => setSelectedNFTForDetail(nft)}
              onMintSuccess={(nft) => setMintedNFTForSuccess(nft)}
            />
          )}

          {currentScreen === 'my-nfts' && (
            <MyNFTs
              onNavigate={(screen) => setCurrentScreen(screen)}
              onNFTSelect={(nft) => setSelectedNFTForDetail(nft)}
              onTransferSelect={(nft) => setSelectedNFTForTransfer(nft)}
            />
          )}

          {currentScreen === 'activity' && <LiveActivity />}

          {currentScreen === 'architecture' && <ArchitectureView />}

          {currentScreen === 'about' && <AboutView />}
        </main>
      </div>

      {/* Detail Modal */}
      <NFTDetailModal
        nft={selectedNFTForDetail}
        isOpen={!!selectedNFTForDetail}
        onClose={() => setSelectedNFTForDetail(null)}
        onTransfer={(nft) => {
          setSelectedNFTForDetail(null);
          setSelectedNFTForTransfer(nft);
        }}
        onCopySuccess={handleCopySuccess}
      />

      {/* Transfer Modal */}
      <TransferModal
        nft={selectedNFTForTransfer}
        isOpen={!!selectedNFTForTransfer}
        onClose={() => setSelectedNFTForTransfer(null)}
        onTransferSuccess={() => {
          // Will auto update owner via Web3Context
        }}
      />

      {/* Mint Success Modal */}
      <MintSuccessModal
        nft={mintedNFTForSuccess}
        isOpen={!!mintedNFTForSuccess}
        onClose={() => setMintedNFTForSuccess(null)}
        onViewNFT={(nft) => setSelectedNFTForDetail(nft)}
        onViewCollection={() => setCurrentScreen('my-nfts')}
        onMintAnother={() => {
          setMintedNFTForSuccess(null);
          setCurrentScreen('mint-studio');
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <Web3Provider>
      <MainAppContent />
    </Web3Provider>
  );
}
