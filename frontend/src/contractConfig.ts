/**
 * Ethereum Sepolia Network and ERC-721 Contract Configuration
 * NEXA MINT STUDIO - Single Source of Truth
 */

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';

export const SEPOLIA_NETWORK_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: 'Ethereum Sepolia Testnet',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://rpc.sepolia.org',
    'https://rpc2.sepolia.org',
  ],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

export const CONTRACT_STORAGE_KEY = 'nexa_mint_contract_address';
export const PINATA_JWT_STORAGE_KEY = 'nexa_mint_pinata_jwt';

export function getContractAddress(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(CONTRACT_STORAGE_KEY);
    if (custom && custom.trim().length === 42) {
      return custom.trim();
    }
  }
  return (import.meta.env.VITE_CONTRACT_ADDRESS as string) || '';
}

export function setContractAddress(address: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONTRACT_STORAGE_KEY, address.trim());
  }
}

/**
 * ABI matching deployed MyNFT.sol exactly:
 * - mintNFT(string memory tokenURI_) public returns (uint256)
 * - tokenURI(uint256 tokenId) public view returns (string memory)
 * - totalMinted() public view returns (uint256)
 * - ERC-721 methods & Transfer event
 */
export const ERC721_ABI = [
  // Read operations
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  'function totalMinted() view returns (uint256)',

  // Minting function (matches MyNFT.sol)
  'function mintNFT(string memory tokenURI_) public returns (uint256)',

  // Transfer & Approvals
  'function transferFrom(address from, address to, uint256 tokenId) public',
  'function safeTransferFrom(address from, address to, uint256 tokenId) public',
  'function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public',
  'function approve(address to, uint256 tokenId) public',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function setApprovalForAll(address operator, bool approved) public',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',

  // Standard Events
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)'
];

export function getEtherscanTxUrl(txHash: string): string {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}

export function getEtherscanAddressUrl(address: string): string {
  return `https://sepolia.etherscan.io/address/${address}`;
}

export function getEtherscanTokenUrl(contractAddress: string, tokenId: string): string {
  return `https://sepolia.etherscan.io/token/${contractAddress}?a=${tokenId}`;
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}
