/**
 * Web3 Provider Context
 * Manages REAL MetaMask connection, Ethereum Sepolia network state,
 * contract transactions, IPFS metadata, and live NFT states.
 * 
 * NO MOCK DATA. NO FAKE TRANSACTIONS. NO SIMULATED MINTS.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import {
  SEPOLIA_CHAIN_ID,
  SEPOLIA_CHAIN_ID_HEX,
  SEPOLIA_NETWORK_PARAMS,
  ERC721_ABI,
  getContractAddress,
  shortenAddress,
} from '../contractConfig';
import { NFTItem, ActivityEvent, Web3WalletState, NFTMetadata } from '../types/nft';
import { INITIAL_NFTS, INITIAL_ACTIVITIES } from '../data/initialNFTs';
import { resolveIPFS, getIPFSGatewayUrls } from '../ipfs';

const NFTS_STORAGE_KEY = 'nexa_mint_user_nfts_v2';
const ACTIVITIES_STORAGE_KEY = 'nexa_mint_activities_v2';

interface Web3ContextValue {
  wallet: Web3WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<boolean>;
  nfts: NFTItem[];
  activities: ActivityEvent[];
  contractAddress: string;
  updateContractAddress: (newAddr: string) => void;
  refreshOnChainNFTs: () => Promise<void>;
  isLoadingNFTs: boolean;
  mintNFTOnChain: (params: {
    tokenURI: string;
    metadata: NFTMetadata;
    imagePreviewUrl: string;
    onStatusChange?: (statusText: string, stepNumber: number) => void;
  }) => Promise<{
    success: boolean;
    tokenId?: string;
    txHash?: string;
    blockNumber?: number;
    owner?: string;
    error?: string;
  }>;
  transferNFTOnChain: (params: {
    tokenId: string;
    toAddress: string;
  }) => Promise<{
    success: boolean;
    txHash?: string;
    newOwner?: string;
    error?: string;
  }>;
  isMiningTx: boolean;
  miningTxHash: string | null;
  addToast: (toast: { title: string; message: string; type?: 'info' | 'success' | 'error' | 'warning' }) => void;
}

const Web3Context = createContext<Web3ContextValue | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<Web3WalletState>({
    account: null,
    chainId: null,
    balance: null,
    isConnected: false,
    isConnecting: false,
    isCorrectNetwork: false,
    error: null,
  });

  const [contractAddress, setContractAddressState] = useState<string>(getContractAddress());
  const [isLoadingNFTs, setIsLoadingNFTs] = useState<boolean>(false);

  // Stored NFTs initialized from local storage or empty, purging any stale blob: object URLs
  const [nfts, setNfts] = useState<NFTItem[]>(() => {
    try {
      const saved = localStorage.getItem(NFTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: NFTItem) => ({
            ...item,
            image: item.image && item.image.startsWith('blob:')
              ? resolveIPFS(item.imageUri || '')
              : resolveIPFS(item.image || item.imageUri || ''),
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load stored NFTs', e);
    }
    return INITIAL_NFTS;
  });

  // Stored activities initialized from local storage or empty
  const [activities, setActivities] = useState<ActivityEvent[]>(() => {
    try {
      const saved = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load activities', e);
    }
    return INITIAL_ACTIVITIES;
  });

  const [isMiningTx, setIsMiningTx] = useState<boolean>(false);
  const [miningTxHash, setMiningTxHash] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NFTS_STORAGE_KEY, JSON.stringify(nfts));
    } catch (e) {
      console.error('Failed to save NFTs to storage', e);
    }
  }, [nfts]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
    } catch (e) {
      console.error('Failed to save activities to storage', e);
    }
  }, [activities]);

  const updateContractAddress = (newAddr: string) => {
    setContractAddressState(newAddr);
  };

  const addToast = (toast: { title: string; message: string; type?: 'info' | 'success' | 'error' | 'warning' }) => {
    const event = new CustomEvent('nexa-toast', { detail: toast });
    window.dispatchEvent(event);
  };

  // Fetch real ETH balance on Sepolia
  const fetchBalance = useCallback(async (account: string, provider: ethers.BrowserProvider) => {
    try {
      const rawBalance = await provider.getBalance(account);
      const formatted = ethers.formatEther(rawBalance);
      const rounded = parseFloat(formatted).toFixed(4);
      setWallet(prev => ({ ...prev, balance: rounded }));
    } catch (err) {
      console.warn('Could not fetch balance:', err);
      setWallet(prev => ({ ...prev, balance: '0.0000' }));
    }
  }, []);

  // Check connection status without forcing prompt
  const checkConnection = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return;
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        const account = accounts[0].address;
        const network = await provider.getNetwork();
        const chainIdNum = Number(network.chainId);
        const isSepolia = chainIdNum === SEPOLIA_CHAIN_ID;

        setWallet(prev => ({
          ...prev,
          account,
          chainId: chainIdNum,
          isConnected: true,
          isCorrectNetwork: isSepolia,
          error: isSepolia ? null : 'Wrong network. Please switch to Ethereum Sepolia.',
        }));

        await fetchBalance(account, provider);
      }
    } catch (err: any) {
      console.warn('Auto connection check error:', err);
    }
  }, [fetchBalance]);

  // Read real on-chain minted NFTs from deployed MyNFT contract
  const refreshOnChainNFTs = useCallback(async () => {
    if (!contractAddress || contractAddress.trim().length !== 42) return;

    try {
      setIsLoadingNFTs(true);
      let provider: ethers.ContractRunner;

      if (typeof window !== 'undefined' && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum);
      } else {
        provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
      }

      const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);

      let total = 0n;
      try {
        total = await contract.totalMinted();
      } catch (err) {
        console.warn('Contract totalMinted query failed:', err);
        return;
      }

      const totalCount = Number(total);
      if (totalCount === 0) {
        // Nothing minted on chain yet
        return;
      }

      const fetchedNFTs: NFTItem[] = [];

      // Query each token up to totalCount
      for (let i = 0; i < totalCount; i++) {
        const tokenId = i.toString();
        try {
          const owner = await contract.ownerOf(tokenId);
          let tokenUri = '';
          try {
            tokenUri = await contract.tokenURI(tokenId);
          } catch {
            tokenUri = '';
          }

          let metadata: any = {
            name: `NFT #${tokenId}`,
            description: '',
            image: '',
            attributes: [],
          };

          if (tokenUri) {
            // Check session cache first to eliminate unnecessary duplicate gateway queries
            const cacheKey = `nexa_meta_${tokenUri}`;
            let cached = null;
            try {
              const cachedRaw = sessionStorage.getItem(cacheKey);
              if (cachedRaw) cached = JSON.parse(cachedRaw);
            } catch {}

            if (cached) {
              metadata = { ...metadata, ...cached };
            } else {
              try {
                const metaUrls = getIPFSGatewayUrls(tokenUri);
                for (const url of metaUrls) {
                  try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 6000);
                    const res = await fetch(url, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    if (res.ok) {
                      const json = await res.json();
                      metadata = { ...metadata, ...json };
                      try {
                        sessionStorage.setItem(cacheKey, JSON.stringify(json));
                      } catch {}
                      break;
                    }
                  } catch {
                    // Try next fallback gateway
                  }
                }
              } catch (metaErr) {
                console.warn(`Could not fetch metadata for token #${tokenId}`, metaErr);
              }
            }
          }

          fetchedNFTs.push({
            id: tokenId,
            name: metadata.name || `Token #${tokenId}`,
            description: metadata.description || '',
            image: resolveIPFS(metadata.image || ''),
            imageUri: metadata.image || '',
            metadataUri: tokenUri,
            owner,
            contractAddress,
            network: 'Ethereum Sepolia',
            mintedAt: new Date().toISOString(),
            attributes: metadata.attributes || [],
          });
        } catch (tokenErr) {
          console.warn(`Error querying token #${tokenId}:`, tokenErr);
        }
      }

      if (fetchedNFTs.length > 0) {
        setNfts(prev => {
          const map = new Map<string, NFTItem>();
          // Put previous session items first
          prev.forEach(item => map.set(item.id, item));
          // Overlay real on-chain items: on-chain metadata & IPFS URLs ALWAYS take precedence
          fetchedNFTs.forEach(fetched => {
            const existing = map.get(fetched.id);
            if (existing) {
              map.set(fetched.id, {
                ...existing,
                ...fetched, // On-chain item is the source of truth!
                txHash: fetched.txHash || existing.txHash,
                blockNumber: fetched.blockNumber || existing.blockNumber,
              });
            } else {
              map.set(fetched.id, fetched);
            }
          });
          return Array.from(map.values()).sort((a, b) => Number(b.id) - Number(a.id));
        });
      }
    } catch (e) {
      console.warn('Error refreshing on-chain NFTs:', e);
    } finally {
      setIsLoadingNFTs(false);
    }
  }, [contractAddress]);

  useEffect(() => {
    checkConnection();
    refreshOnChainNFTs();

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWallet({
            account: null,
            chainId: null,
            balance: null,
            isConnected: false,
            isConnecting: false,
            isCorrectNetwork: false,
            error: null,
          });
        } else {
          setWallet(prev => ({
            ...prev,
            account: accounts[0],
            isConnected: true,
          }));
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          fetchBalance(accounts[0], provider);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const chainIdNum = parseInt(chainIdHex, 16);
        const isSepolia = chainIdNum === SEPOLIA_CHAIN_ID;
        setWallet(prev => ({
          ...prev,
          chainId: chainIdNum,
          isCorrectNetwork: isSepolia,
          error: isSepolia ? null : 'Wrong network. Please switch to Ethereum Sepolia.',
        }));
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if ((window as any).ethereum?.removeListener) {
          (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
          (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [checkConnection, fetchBalance, refreshOnChainNFTs]);

  // Connect MetaMask Wallet
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      const errorMsg = 'MetaMask is not detected. Please install the MetaMask browser extension.';
      setWallet(prev => ({
        ...prev,
        isConnected: false,
        error: errorMsg,
      }));
      addToast({
        title: 'MetaMask Not Detected',
        message: 'Please install the MetaMask browser extension to use Nexa Mint Studio.',
        type: 'error',
      });
      return;
    }

    try {
      setWallet(prev => ({ ...prev, isConnecting: true, error: null }));
      const provider = new ethers.BrowserProvider((window as any).ethereum);

      const accounts = await provider.send('eth_requestAccounts', []);
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts selected in MetaMask.');
      }

      const account = accounts[0];
      const network = await provider.getNetwork();
      const chainIdNum = Number(network.chainId);
      const isSepolia = chainIdNum === SEPOLIA_CHAIN_ID;

      setWallet({
        account,
        chainId: chainIdNum,
        balance: null,
        isConnected: true,
        isConnecting: false,
        isCorrectNetwork: isSepolia,
        error: isSepolia ? null : 'Wrong Network. Please switch to Ethereum Sepolia.',
      });

      await fetchBalance(account, provider);

      if (!isSepolia) {
        await switchNetwork();
      }

      addToast({
        title: 'Wallet Connected',
        message: `Connected to ${shortenAddress(account)}`,
        type: 'success',
      });
    } catch (err: any) {
      console.error('Wallet connect error:', err);
      let errorMsg = 'Failed to connect wallet.';
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        errorMsg = 'Connection request was rejected in MetaMask.';
      } else if (err.message) {
        errorMsg = err.message;
      }

      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMsg,
      }));

      addToast({
        title: 'Connection Failed',
        message: errorMsg,
        type: 'error',
      });
    }
  };

  // Switch to Sepolia Testnet
  const switchNetwork = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      addToast({
        title: 'MetaMask Required',
        message: 'Install MetaMask to switch networks.',
        type: 'warning',
      });
      return false;
    }

    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
      setWallet(prev => ({ ...prev, chainId: SEPOLIA_CHAIN_ID, isCorrectNetwork: true, error: null }));
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_NETWORK_PARAMS],
          });
          setWallet(prev => ({ ...prev, chainId: SEPOLIA_CHAIN_ID, isCorrectNetwork: true, error: null }));
          return true;
        } catch (addError) {
          console.error('Failed to add Sepolia network to MetaMask:', addError);
        }
      }
      console.error('Failed to switch network to Sepolia:', switchError);
      return false;
    }
  };

  // Disconnect frontend wallet state
  const disconnectWallet = () => {
    setWallet({
      account: null,
      chainId: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      isCorrectNetwork: false,
      error: null,
    });
    addToast({
      title: 'Wallet Disconnected',
      message: 'Wallet session disconnected from Nexa Mint Studio.',
      type: 'info',
    });
  };

  // REAL Smart Contract Mint on Ethereum Sepolia
  const mintNFTOnChain = async ({
    tokenURI,
    metadata,
    imagePreviewUrl,
    onStatusChange,
  }: {
    tokenURI: string;
    metadata: NFTMetadata;
    imagePreviewUrl: string;
    onStatusChange?: (statusText: string, stepNumber: number) => void;
  }): Promise<{
    success: boolean;
    tokenId?: string;
    txHash?: string;
    blockNumber?: number;
    owner?: string;
    error?: string;
  }> => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return { success: false, error: 'MetaMask is not installed. Please install MetaMask to mint on Sepolia.' };
    }

    if (!wallet.isConnected || !wallet.account) {
      return { success: false, error: 'Please connect your MetaMask wallet before minting.' };
    }

    if (!wallet.isCorrectNetwork) {
      const switched = await switchNetwork();
      if (!switched) {
        return { success: false, error: 'Please switch your wallet network to Ethereum Sepolia to proceed.' };
      }
    }

    if (!contractAddress || contractAddress.trim().length !== 42) {
      return { success: false, error: 'Contract address is invalid or not set. Please check VITE_CONTRACT_ADDRESS in .env.' };
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const activeAddress = await signer.getAddress();

      // Step 4: Awaiting Wallet Approval
      onStatusChange?.('Waiting for MetaMask transaction signature...', 4);

      const contract = new ethers.Contract(contractAddress, ERC721_ABI, signer);

      // Call real smart contract method: mintNFT(tokenURI)
      let tx: ethers.ContractTransactionResponse;
      try {
        tx = await contract.mintNFT(tokenURI);
      } catch (txErr: any) {
        if (txErr.code === 4001 || txErr.code === 'ACTION_REJECTED') {
          throw new Error('Transaction was rejected in MetaMask.');
        }
        if (txErr.message && txErr.message.includes('insufficient funds')) {
          throw new Error('Insufficient Sepolia ETH in your wallet to cover gas fees.');
        }
        throw txErr;
      }

      // Step 5: Submitted to Mempool / Mining on Sepolia
      setIsMiningTx(true);
      setMiningTxHash(tx.hash);
      onStatusChange?.(`Broadcasting transaction ${shortenAddress(tx.hash, 6)} to Sepolia validators...`, 5);

      // Wait for real on-chain confirmation
      const receipt = await tx.wait(1);
      if (!receipt) {
        throw new Error('Transaction failed to confirm on Sepolia.');
      }

      // Step 6: Parse Transfer event to extract actual minted token ID
      onStatusChange?.('Confirming token ownership on Sepolia consensus ledger...', 6);

      let parsedTokenId: string | null = null;
      if (receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog(log);
            if (parsed && parsed.name === 'Transfer') {
              // Transfer(address from, address to, uint256 tokenId)
              parsedTokenId = parsed.args[2].toString();
              break;
            }
          } catch {
            // log might belong to another event
          }
        }
      }

      if (!parsedTokenId) {
        // Fallback: query totalMinted() - 1
        try {
          const total = await contract.totalMinted();
          parsedTokenId = (Number(total) - 1).toString();
        } catch {
          parsedTokenId = '0';
        }
      }

      // Read real verified owner from contract
      let verifiedOwner = activeAddress;
      try {
        verifiedOwner = await contract.ownerOf(parsedTokenId);
      } catch (ownerErr) {
        console.warn('Could not read ownerOf directly after mint:', ownerErr);
      }

      const realImageUrl = resolveIPFS(metadata.image || imagePreviewUrl);

      const newNFT: NFTItem = {
        id: parsedTokenId,
        name: metadata.name,
        description: metadata.description,
        image: realImageUrl,
        imageUri: metadata.image,
        metadataUri: tokenURI,
        owner: verifiedOwner,
        contractAddress,
        network: 'Ethereum Sepolia',
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        mintedAt: new Date().toISOString(),
        attributes: metadata.attributes || [],
      };

      const newActivity: ActivityEvent = {
        id: `act-${tx.hash}-${parsedTokenId}`,
        type: 'mint',
        tokenId: parsedTokenId,
        nftName: metadata.name,
        image: realImageUrl,
        from: '0x0000000000000000000000000000000000000000',
        to: verifiedOwner,
        txHash: tx.hash,
        timestamp: new Date().toISOString(),
        blockNumber: receipt.blockNumber,
      };

      setNfts(prev => [newNFT, ...prev.filter(x => x.id !== parsedTokenId)]);
      setActivities(prev => [newActivity, ...prev]);
      setIsMiningTx(false);
      setMiningTxHash(null);

      // Refresh wallet balance
      fetchBalance(activeAddress, provider);

      return {
        success: true,
        tokenId: parsedTokenId,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        owner: verifiedOwner,
      };
    } catch (err: any) {
      setIsMiningTx(false);
      setMiningTxHash(null);
      console.error('Real mintNFTOnChain error:', err);

      let errMessage = 'Minting transaction failed.';
      if (err.message) {
        if (err.message.includes('rejected') || err.code === 4001 || err.code === 'ACTION_REJECTED') {
          errMessage = 'Transaction rejected in MetaMask.';
        } else if (err.message.includes('insufficient funds')) {
          errMessage = 'Insufficient Sepolia ETH for gas fees. Use a Sepolia faucet to get testnet ETH.';
        } else {
          errMessage = err.message;
        }
      }

      return {
        success: false,
        error: errMessage,
      };
    }
  };

  // REAL ERC-721 Transfer on Ethereum Sepolia
  const transferNFTOnChain = async ({
    tokenId,
    toAddress,
  }: {
    tokenId: string;
    toAddress: string;
  }): Promise<{
    success: boolean;
    txHash?: string;
    newOwner?: string;
    error?: string;
  }> => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return { success: false, error: 'MetaMask is not installed.' };
    }

    if (!wallet.isConnected || !wallet.account) {
      return { success: false, error: 'Connect your MetaMask wallet before transferring.' };
    }

    if (!wallet.isCorrectNetwork) {
      const switched = await switchNetwork();
      if (!switched) {
        return { success: false, error: 'Switch to Ethereum Sepolia to transfer.' };
      }
    }

    if (!ethers.isAddress(toAddress)) {
      return { success: false, error: 'Enter a valid Ethereum recipient wallet address.' };
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const activeAddress = await signer.getAddress();

      const contract = new ethers.Contract(contractAddress, ERC721_ABI, signer);

      // Verify current owner from contract
      const currentOwner = await contract.ownerOf(tokenId);

      setIsMiningTx(true);

      // Execute real ERC-721 transferFrom
      let tx: ethers.ContractTransactionResponse;
      try {
        tx = await contract.transferFrom(activeAddress, toAddress, tokenId);
      } catch (firstErr: any) {
        try {
          tx = await contract['safeTransferFrom(address,address,uint256)'](activeAddress, toAddress, tokenId);
        } catch {
          throw firstErr;
        }
      }

      setMiningTxHash(tx.hash);
      const receipt = await tx.wait(1);

      setIsMiningTx(false);
      setMiningTxHash(null);

      // Verify updated owner on-chain
      let verifiedOwner = toAddress;
      try {
        verifiedOwner = await contract.ownerOf(tokenId);
      } catch (e) {
        console.warn('Could not read owner after transfer:', e);
      }

      // Update state
      setNfts(prev =>
        prev.map(item => (item.id === tokenId ? { ...item, owner: verifiedOwner } : item))
      );

      const targetNft = nfts.find(x => x.id === tokenId);
      const transferActivity: ActivityEvent = {
        id: `act-${tx.hash}-${tokenId}`,
        type: 'transfer',
        tokenId,
        nftName: targetNft?.name || `Token #${tokenId}`,
        image: targetNft?.image || '',
        from: currentOwner,
        to: verifiedOwner,
        txHash: tx.hash,
        timestamp: new Date().toISOString(),
        blockNumber: receipt?.blockNumber,
      };
      setActivities(prev => [transferActivity, ...prev]);

      fetchBalance(activeAddress, provider);

      return {
        success: true,
        txHash: tx.hash,
        newOwner: verifiedOwner,
      };
    } catch (err: any) {
      setIsMiningTx(false);
      setMiningTxHash(null);
      console.error('Transfer error:', err);

      let errMessage = 'Transfer transaction failed.';
      if (err.message) {
        if (err.message.includes('rejected') || err.code === 4001 || err.code === 'ACTION_REJECTED') {
          errMessage = 'Transfer signature was rejected in MetaMask.';
        } else if (err.message.includes('insufficient funds')) {
          errMessage = 'Insufficient Sepolia ETH for gas fees.';
        } else {
          errMessage = err.message;
        }
      }

      return { success: false, error: errMessage };
    }
  };

  return (
    <Web3Context.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        nfts,
        activities,
        contractAddress,
        updateContractAddress,
        refreshOnChainNFTs,
        isLoadingNFTs,
        mintNFTOnChain,
        transferNFTOnChain,
        isMiningTx,
        miningTxHash,
        addToast,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
