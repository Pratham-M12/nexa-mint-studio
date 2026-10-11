export interface NFTAttribute {
  trait_type: string;
  value: string;
  rarity?: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  compiler?: string;
  standard?: string;
  external_url?: string;
}

export interface NFTItem {
  id: string; // Token ID string, e.g. "1", "2"
  name: string;
  description: string;
  image: string; // resolved image URL (http or data)
  imageUri: string; // ipfs://... or original URI
  metadataUri: string; // ipfs://...
  owner: string;
  contractAddress: string;
  network: string;
  txHash?: string;
  blockNumber?: number;
  mintedAt?: string;
  attributes: NFTAttribute[];
}

export type PipelineStepStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

export interface PipelineStep {
  id: number;
  label: string;
  title: string;
  detail: string;
  status: PipelineStepStatus;
}

export interface ActivityEvent {
  id: string;
  type: 'mint' | 'transfer';
  tokenId: string;
  nftName: string;
  image: string;
  from?: string;
  to: string;
  txHash: string;
  timestamp: string;
  blockNumber?: number;
}

export interface Web3WalletState {
  account: string | null;
  chainId: number | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  error: string | null;
}
