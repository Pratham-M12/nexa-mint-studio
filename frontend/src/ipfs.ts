/**
 * IPFS & Pinata Service Integration
 * NEXA MINT STUDIO
 * 
 * Interacts with Pinata Cloud V3 Files API to pin NFT artwork files and ERC-721 metadata JSON.
 * Compatible with modern scoped API keys (Files: Write, Admin: OFF).
 * No fake fallback CIDs are generated: errors are surfaced directly to the user.
 */

import { PINATA_JWT_STORAGE_KEY } from './contractConfig';
import { NFTMetadata } from './types/nft';

export function getPinataJWT(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem(PINATA_JWT_STORAGE_KEY);
    if (custom && custom.trim().length > 10) {
      return custom.trim();
    }
  }
  return (import.meta.env.VITE_PINATA_JWT as string) || '';
}

export function setPinataJWT(jwt: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PINATA_JWT_STORAGE_KEY, jwt.trim());
  }
}

export function clearPinataJWT(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PINATA_JWT_STORAGE_KEY);
  }
}

export function hasPinataJWT(): boolean {
  const token = getPinataJWT();
  return Boolean(token && token.trim().length > 10);
}

/**
 * IPFS Gateways in order of preference for fast and reliable resolution.
 */
export const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://dweb.link/ipfs/',
];

/**
 * Extracts the clean CID (and any subpath) from an IPFS URI or gateway URL.
 * Accurately handles:
 * - ipfs://CID
 * - ipfs://CID/path
 * - ipfs:///CID
 * - ipfs://ipfs/CID
 * - CIDv0 Qm...
 * - CIDv1 baf...
 * - Full gateway URLs (e.g. https://gateway.pinata.cloud/ipfs/CID)
 * - Accidental malformed nested URLs (e.g. https://gateway.pinata.cloud/ipfs/ipfs://CID)
 */
export function extractIPFSPath(uri: string): string {
  if (!uri) return '';
  let clean = uri.trim();

  // If already an HTTP gateway URL, extract the CID/path portion
  const ipfsIndex = clean.indexOf('/ipfs/');
  if (ipfsIndex !== -1) {
    clean = clean.substring(ipfsIndex + 6);
  }

  // Remove any nested ipfs:// or ipfs/ prefixes
  clean = clean.replace(/^ipfs:\/{1,3}/i, '');
  clean = clean.replace(/^ipfs\//i, '');

  return clean.trim();
}

/**
 * Resolves an ipfs:// URI or raw CID to a viewable HTTP gateway URL.
 * Guarantees NO malformed URLs such as .../ipfs/ipfs:// or .../ipfs/https://.
 */
export function resolveIPFS(uri: string, gatewayIndex = 0): string {
  if (!uri) return '';
  const clean = uri.trim();

  // If already a standard HTTP(S) URL that does NOT point to an IPFS gateway, return directly
  if ((clean.startsWith('http://') || clean.startsWith('https://')) && !clean.includes('/ipfs/')) {
    return clean;
  }

  const path = extractIPFSPath(clean);
  if (!path) return clean;

  const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
  return `${gateway}${path}`;
}

/**
 * Returns candidate gateway URLs for a given IPFS URI or CID,
 * enabling automatic client-side fallback when a gateway is cold, slow, or rate-limited.
 */
export function getIPFSGatewayUrls(uri: string): string[] {
  if (!uri) return [];
  const clean = uri.trim();

  if ((clean.startsWith('http://') || clean.startsWith('https://')) && !clean.includes('/ipfs/')) {
    return [clean];
  }

  const path = extractIPFSPath(clean);
  if (!path) return [clean];

  return IPFS_GATEWAYS.map(gw => `${gw}${path}`);
}

/**
 * Formats a raw CID or URI for display
 */
export function shortenCID(cid: string, length = 6): string {
  if (!cid) return '';
  const clean = extractIPFSPath(cid);
  if (clean.length <= length * 2) return clean;
  return `${clean.substring(0, length)}...${clean.substring(clean.length - length)}`;
}

/**
 * Tests the provided Pinata JWT with Pinata's testAuthentication endpoint
 */
export async function testPinataAuthentication(jwt?: string): Promise<{ valid: boolean; message: string }> {
  const token = jwt || getPinataJWT();
  if (!token) {
    return { valid: false, message: 'No Pinata JWT found. Please configure VITE_PINATA_JWT.' };
  }

  try {
    const res = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      return { valid: true, message: data.message || 'Authenticated successfully with Pinata IPFS.' };
    } else {
      const err = await res.json().catch(() => ({}));
      return { valid: false, message: err.error?.details || `Pinata authentication error (${res.status}).` };
    }
  } catch (error: any) {
    return { valid: false, message: error?.message || 'Network error connecting to Pinata.' };
  }
}

/**
 * Uploads an image file to IPFS via Pinata V3 Files API.
 * Uses https://uploads.pinata.cloud/v3/files with network='public'
 * Compatible with scoped V3 API keys (Files: Write, Admin: OFF).
 * Strictly performs real upload. Throws an error if unsuccessful.
 */
export async function uploadImageToIPFS(
  file: File | Blob,
  fileName: string
): Promise<{ cid: string; ipfsUri: string; gatewayUrl: string }> {
  const jwt = getPinataJWT();

  if (!jwt || jwt.trim().length === 0) {
    throw new Error('Pinata JWT is missing. Please set VITE_PINATA_JWT in your .env file or Studio Settings.');
  }

  const cleanFileName = fileName || 'artwork.png';
  const formData = new FormData();
  formData.append('file', file, cleanFileName);
  formData.append('name', `NEXA-IMAGE-${cleanFileName}`);
  formData.append('network', 'public');
  formData.append(
    'keyvalues',
    JSON.stringify({
      platform: 'NEXA-MINT-STUDIO',
      type: 'artwork',
    })
  );

  const response = await fetch('https://uploads.pinata.cloud/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt.trim()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let details = errorText;
    try {
      const parsed = JSON.parse(errorText);
      details = parsed.error?.details || parsed.error || parsed.message || errorText;
    } catch {
      // keep raw error text
    }
    throw new Error(`Pinata image upload failed (${response.status}): ${details}`);
  }

  const result = await response.json();
  const cid = result.data?.cid || result.cid || result.IpfsHash;

  if (!cid) {
    throw new Error('Pinata upload succeeded but returned no IPFS CID.');
  }

  return {
    cid,
    ipfsUri: `ipfs://${cid}`,
    gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
  };
}

/**
 * Uploads NFT Metadata JSON to IPFS via Pinata V3 Files API.
 * Encapsulates the metadata payload as a JSON file upload to https://uploads.pinata.cloud/v3/files
 * with network='public', returning the public IPFS CID for ERC-721 tokenURI minting.
 * Compatible with scoped V3 API keys (Files: Write, Admin: OFF).
 * Strictly performs real upload. Throws an error if unsuccessful.
 */
export async function uploadMetadataToIPFS(
  metadata: NFTMetadata
): Promise<{ cid: string; ipfsUri: string; gatewayUrl: string }> {
  const jwt = getPinataJWT();

  if (!jwt || jwt.trim().length === 0) {
    throw new Error('Pinata JWT is missing. Please set VITE_PINATA_JWT in your .env file or Studio Settings.');
  }

  const safeName = metadata.name ? metadata.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'nft';
  const metaFileName = `NEXA-METADATA-${safeName}.json`;
  const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });

  const formData = new FormData();
  formData.append('file', jsonBlob, metaFileName);
  formData.append('name', metaFileName);
  formData.append('network', 'public');
  formData.append(
    'keyvalues',
    JSON.stringify({
      standard: 'ERC-721',
      studio: 'NEXA-MINT-STUDIO',
    })
  );

  const response = await fetch('https://uploads.pinata.cloud/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt.trim()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let details = errorText;
    try {
      const parsed = JSON.parse(errorText);
      details = parsed.error?.details || parsed.error || parsed.message || errorText;
    } catch {
      // keep raw error text
    }
    throw new Error(`Pinata metadata upload failed (${response.status}): ${details}`);
  }

  const result = await response.json();
  const cid = result.data?.cid || result.cid || result.IpfsHash;

  if (!cid) {
    throw new Error('Pinata metadata upload succeeded but returned no IPFS CID.');
  }

  return {
    cid,
    ipfsUri: `ipfs://${cid}`,
    gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
  };
}
