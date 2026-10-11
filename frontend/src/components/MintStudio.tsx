import React, { useState, useRef } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { NFTAttribute, NFTItem, NFTMetadata } from '../types/nft';
import { uploadImageToIPFS, uploadMetadataToIPFS, resolveIPFS, shortenCID } from '../ipfs';
import { shortenAddress } from '../contractConfig';
import { TransactionPipeline } from './TransactionPipeline';
import { ActiveScreen } from './Sidebar';

interface MintStudioProps {
  onNavigate: (screen: ActiveScreen) => void;
  onNFTSelect: (nft: NFTItem) => void;
  onMintSuccess: (nft: NFTItem) => void;
}

export const MintStudio: React.FC<MintStudioProps> = ({
  onNavigate,
  onNFTSelect,
  onMintSuccess,
}) => {
  const { wallet, connectWallet, switchNetwork, mintNFTOnChain, nfts, contractAddress, addToast } = useWeb3();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states - clean initial states, no mock placeholders
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Artwork states
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string>('');
  const [artworkDimensions, setArtworkDimensions] = useState<string>('');
  const [imageCid, setImageCid] = useState<string>('');
  const [metadataCid, setMetadataCid] = useState<string>('');

  // Attributes states
  const [attributes, setAttributes] = useState<NFTAttribute[]>([]);

  // Modal / Add trait state
  const [isAddingTrait, setIsAddingTrait] = useState<boolean>(false);
  const [newTraitType, setNewTraitType] = useState<string>('');
  const [newTraitValue, setNewTraitValue] = useState<string>('');

  // Minting Pipeline State
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0); // 0 = idle, 1..6
  const [pipelineTxHash, setPipelineTxHash] = useState<string | undefined>(undefined);
  const [pipelineBlock, setPipelineBlock] = useState<number | undefined>(undefined);
  const [pipelineTokenId, setPipelineTokenId] = useState<string | undefined>(undefined);
  const [pipelineMetadata, setPipelineMetadata] = useState<any>(null);

  // Handle image upload from file picker
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArtworkFile(file);

      const objectUrl = URL.createObjectURL(file);
      setArtworkPreview(objectUrl);

      const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);
      const img = new Image();
      img.onload = () => {
        setArtworkDimensions(`${img.width} × ${img.height} px (${fileSizeMb} MB)`);
      };
      img.src = objectUrl;

      // Auto update name suggestion if empty
      if (!name.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }

      addToast({
        title: 'Artwork Selected',
        message: `${file.name} loaded into the studio preview.`,
        type: 'info',
      });
    }
  };

  const handleAddTrait = () => {
    if (!newTraitType.trim() || !newTraitValue.trim()) return;
    setAttributes((prev) => [
      ...prev,
      {
        trait_type: newTraitType.trim(),
        value: newTraitValue.trim(),
        rarity: 'Custom Trait',
      },
    ]);
    setNewTraitType('');
    setNewTraitValue('');
    setIsAddingTrait(false);
  };

  const handleRemoveTrait = (index: number) => {
    setAttributes((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCopyCID = () => {
    if (!imageCid) return;
    navigator.clipboard.writeText(imageCid);
    addToast({
      title: 'Copied to Clipboard',
      message: 'IPFS Content Identifier (CID) copied.',
      type: 'success',
    });
  };

  // Primary Action: Real Mint NFT on Sepolia
  const handleMint = async () => {
    if (!artworkFile || !artworkPreview) {
      addToast({
        title: 'Artwork Required',
        message: 'Please choose an image file for your NFT artwork.',
        type: 'warning',
      });
      fileInputRef.current?.click();
      return;
    }

    if (!name.trim()) {
      addToast({
        title: 'NFT Name Required',
        message: 'Please enter a name for your NFT before minting.',
        type: 'warning',
      });
      return;
    }

    if (!description.trim()) {
      addToast({
        title: 'Description Required',
        message: 'Please provide a short description for your NFT metadata.',
        type: 'warning',
      });
      return;
    }

    // Check wallet connection
    if (!wallet.isConnected) {
      addToast({
        title: 'Connect Wallet',
        message: 'Please connect your MetaMask wallet.',
        type: 'info',
      });
      await connectWallet();
      return;
    }

    // Check network
    if (!wallet.isCorrectNetwork) {
      const switched = await switchNetwork();
      if (!switched) {
        addToast({
          title: 'Switch Network Required',
          message: 'Please switch your wallet network to Ethereum Sepolia.',
          type: 'warning',
        });
        return;
      }
    }

    setIsMinting(true);
    setPipelineStep(1);

    try {
      // Step 1: Upload artwork image to IPFS via Pinata
      addToast({
        title: 'Step 1/6: IPFS Pinning',
        message: 'Uploading artwork to IPFS via Pinata gateway...',
        type: 'info',
      });

      const imageUploadResult = await uploadImageToIPFS(artworkFile, artworkFile.name);
      const currentImageCid = imageUploadResult.cid;
      const currentImageUri = imageUploadResult.ipfsUri;
      setImageCid(currentImageCid);

      setPipelineStep(2);

      // Step 2: Compile standard ERC-721 Metadata JSON schema
      const metadataPayload: NFTMetadata = {
        name: name.trim(),
        description: description.trim(),
        image: currentImageUri,
        attributes,
        compiler: 'NEXA MINT v2.4 (Sepolia Core)',
        standard: 'ERC-721 OpenZeppelin',
      };
      setPipelineMetadata(metadataPayload);

      setPipelineStep(3);

      // Step 3: Upload Metadata JSON to IPFS via Pinata
      addToast({
        title: 'Step 3/6: Metadata IPFS Injection',
        message: 'Pinning ERC-721 JSON metadata schema to IPFS...',
        type: 'info',
      });

      const metaUploadResult = await uploadMetadataToIPFS(metadataPayload);
      const currentMetaCid = metaUploadResult.cid;
      const currentMetaUri = metaUploadResult.ipfsUri;
      setMetadataCid(currentMetaCid);

      setPipelineStep(4);

      // Step 4 & 5 & 6: Real Smart Contract Interaction via ethers.js and MetaMask
      const mintResult = await mintNFTOnChain({
        tokenURI: currentMetaUri,
        metadata: metadataPayload,
        imagePreviewUrl: resolveIPFS(currentImageUri),
        onStatusChange: (statusText, stepNum) => {
          setPipelineStep(stepNum);
          if (stepNum === 5) {
            addToast({
              title: 'Mining Transaction',
              message: statusText,
              type: 'info',
            });
          }
        },
      });

      if (!mintResult.success) {
        setPipelineStep(0);
        setIsMinting(false);
        addToast({
          title: 'Minting Failed',
          message: mintResult.error || 'Contract execution failed.',
          type: 'error',
        });
        return;
      }

      setPipelineTxHash(mintResult.txHash);
      setPipelineBlock(mintResult.blockNumber);
      setPipelineTokenId(mintResult.tokenId);
      setPipelineStep(6);
      setIsMinting(false);

      const mintedItem: NFTItem = {
        id: mintResult.tokenId || '0',
        name: metadataPayload.name,
        description: metadataPayload.description,
        image: resolveIPFS(currentImageUri),
        imageUri: currentImageUri,
        metadataUri: currentMetaUri,
        owner: mintResult.owner || wallet.account || '',
        contractAddress: contractAddress,
        network: 'Ethereum Sepolia',
        txHash: mintResult.txHash,
        blockNumber: mintResult.blockNumber,
        mintedAt: new Date().toISOString(),
        attributes,
      };

      addToast({
        title: 'NFT Minted Successfully!',
        message: `${name} minted on Sepolia with Token ID #${mintResult.tokenId}`,
        type: 'success',
      });

      onMintSuccess(mintedItem);
    } catch (err: any) {
      console.error('Mint flow error:', err);
      setIsMinting(false);
      setPipelineStep(0);
      addToast({
        title: 'Minting Error',
        message: err.message || 'An error occurred during minting.',
        type: 'error',
      });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 custom-scroll">
      {/* Hidden File Input for Real Artwork Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Studio Hero Header & Workflow Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#4a4455]">
        <div>
          <div className="flex items-center gap-2 text-[#4cd7f6] text-xs font-mono mb-1.5 uppercase tracking-wider">
            <span className="material-symbols-outlined text-base">layers</span>
            ERC-721 Smart Contract Studio
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-headline font-bold text-[#e2e2e9] tracking-tight">
            Create &amp; Mint NFT
          </h1>
          <p className="text-xs md:text-sm text-[#ccc3d8] mt-1 max-w-2xl leading-relaxed">
            Upload your digital artwork, compile decentralized IPFS metadata, and mint an immutable
            ERC-721 token directly to your wallet on Ethereum Sepolia.
          </p>
        </div>

        {/* Workflow Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-[#1a1b21] border border-[#4a4455] overflow-x-auto">
          <button className="px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-xs font-mono font-semibold glow-violet transition-all whitespace-nowrap cursor-pointer">
            Minting Studio
          </button>
          <button
            onClick={() => onNavigate('my-nfts')}
            className="px-4 py-2 rounded-lg text-[#ccc3d8] hover:text-[#e2e2e9] text-xs font-mono transition-colors whitespace-nowrap cursor-pointer"
          >
            My Collection ({nfts.length})
          </button>
          <button
            onClick={() => onNavigate('architecture')}
            className="px-4 py-2 rounded-lg text-[#ccc3d8] hover:text-[#e2e2e9] text-xs font-mono transition-colors whitespace-nowrap cursor-pointer"
          >
            Architecture &amp; Specs
          </button>
          <button
            onClick={() => onNavigate('activity')}
            className="px-4 py-2 rounded-lg text-[#ccc3d8] hover:text-[#e2e2e9] text-xs font-mono transition-colors whitespace-nowrap cursor-pointer"
          >
            Live Activity Log
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2-COLUMN STUDIO WORKSPACE (7/5 Split Grid)                            */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================== */}
        {/* LEFT COLUMN: ARTWORK & IPFS STORAGE STAGE  */}
        {/* ========================================== */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-6">
          {/* NFT Canvas Preview Container */}
          <div className="bg-[#111318] rounded-2xl border border-[#4a4455] p-5 inset-highlight flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-mono text-[#ccc3d8] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#4cd7f6]">image</span>
                Artwork &amp; Node Preview
              </span>
              <span className="text-xs font-mono text-[#4edea3] flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
                {artworkFile ? 'Ready to Pin' : 'Select File'}
              </span>
            </div>

            {/* Artwork Display Stage */}
            <div className="relative group rounded-xl overflow-hidden border border-[#4a4455] bg-[#0c0e13] aspect-square flex items-center justify-center">
              {artworkPreview ? (
                <>
                  {/* NFT Preview Image */}
                  <img
                    src={artworkPreview}
                    alt="NFT artwork preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Floating Blockchain Pill Tags */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-[#0c0e13]/80 backdrop-blur-md border border-[#4a4455] text-[11px] font-mono text-[#d2bbff]">
                      ERC-721
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#0c0e13]/80 backdrop-blur-md border border-[#4cd7f6]/40 text-[11px] font-mono text-[#4cd7f6] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]"></span>
                      {imageCid ? 'IPFS Pinned' : 'Pending IPFS'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#0c0e13]/80 backdrop-blur-md border border-[#4a4455] text-[11px] font-mono text-[#e2e2e9]">
                      Sepolia
                    </span>
                  </div>

                  {/* Top Right Resolution Badge */}
                  {artworkDimensions && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-[#0c0e13]/85 backdrop-blur-sm border border-[#4a4455] text-[11px] font-mono text-[#ccc3d8]">
                      {artworkDimensions}
                    </div>
                  )}

                  {/* Bottom Overlay Quick Details */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[#0c0e13] via-[#0c0e13]/80 to-transparent flex items-end justify-between">
                    <div className="min-w-0 pr-2">
                      <div className="text-base font-headline font-bold text-white tracking-tight truncate">
                        {name || 'Untitled NFT'}
                      </div>
                      <div className="text-xs font-mono text-[#ccc3d8]">
                        Token Standard: ERC-721 Non-Fungible Original
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty Upload Dropzone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-[#1a1b21]/50 transition-colors group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#1e2025] border border-[#4a4455] flex items-center justify-center text-[#d2bbff] group-hover:scale-110 group-hover:border-[#7c3aed] transition-all mb-4">
                    <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                  </div>
                  <h4 className="text-base font-bold font-headline text-white mb-1">
                    Select Artwork Image
                  </h4>
                  <p className="text-xs text-[#ccc3d8] max-w-xs mb-4">
                    Supports PNG, JPG, GIF, WEBP or SVG. The file will be pinned directly to IPFS swarm nodes via Pinata.
                  </p>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-headline font-semibold glow-violet hover:bg-opacity-90 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                    <span>Browse Files</span>
                  </button>
                </div>
              )}
            </div>

            {/* Decentralized Storage CID Pill & Gateway Link */}
            <div className="p-3 rounded-xl bg-[#1a1b21] border border-[#4a4455] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#ccc3d8] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#4edea3] text-base">cloud_done</span>
                  InterPlanetary File System (IPFS)
                </span>
                <span className="text-xs text-[#4edea3] font-mono">
                  {imageCid ? 'Status: Pinned' : 'Awaiting Pin'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-[#1e2025] px-3 py-2 rounded-lg border border-[#4a4455] text-xs font-mono">
                <span className="text-[#ccc3d8] truncate font-mono select-all">
                  {imageCid ? imageCid : 'CID will be generated via Pinata upon minting'}
                </span>
                {imageCid && (
                  <button
                    type="button"
                    onClick={handleCopyCID}
                    className="text-[#d2bbff] hover:text-white ml-2 flex items-center cursor-pointer"
                    title="Copy CID"
                  >
                    <span className="material-symbols-outlined text-base">content_copy</span>
                  </button>
                )}
              </div>
            </div>

            {/* Artwork Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#1e2025] hover:bg-[#282a2f] border border-[#4a4455] text-[#e2e2e9] text-xs font-mono transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">upload_file</span>
                <span>{artworkFile ? 'Replace Artwork' : 'Upload Artwork'}</span>
              </button>

              {imageCid ? (
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${imageCid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#1e2025] hover:bg-[#282a2f] border border-[#4a4455] text-[#4cd7f6] text-xs font-mono transition-colors"
                >
                  <span className="material-symbols-outlined text-base">open_in_browser</span>
                  <span>Inspect Gateway</span>
                </a>
              ) : (
                <button
                  disabled
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#1e2025]/50 border border-[#4a4455]/40 text-[#958da1] text-xs font-mono cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-base">lock</span>
                  <span>Inspect Gateway</span>
                </button>
              )}
            </div>
          </div>

          {/* Educational Callout Module */}
          <div className="p-4 rounded-xl bg-[#1e2025] border border-[#4a4455] flex items-start gap-3 inset-highlight">
            <span className="material-symbols-outlined text-[#d2bbff] text-xl mt-0.5">school</span>
            <div>
              <h4 className="text-xs md:text-sm font-mono text-[#e2e2e9] font-semibold">
                Decentralized Storage Architecture
              </h4>
              <p className="text-xs text-[#ccc3d8] mt-1 leading-relaxed">
                Your artwork binary is cryptographically hashed and pinned across IPFS swarm
                nodes using Pinata. The generated Content Identifier (CID) guarantees data immutability on Ethereum.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: METADATA & CONTRACT PARAMS   */}
        {/* ========================================== */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6">
          <div className="bg-[#111318] rounded-2xl border border-[#4a4455] p-6 inset-highlight flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#4a4455] pb-4">
              <div>
                <h3 className="text-lg md:text-xl font-headline font-bold text-[#e2e2e9]">
                  Token Metadata &amp; Parameters
                </h3>
                <p className="text-xs text-[#ccc3d8] mt-0.5">
                  Conforms to standard OpenZeppelin ERC-721 URI specification
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#33353a] text-xs font-mono text-[#d2bbff] border border-[#4a4455]">
                ERC-721
              </span>
            </div>

            {/* Form Field 1: NFT Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-[#e2e2e9] flex items-center justify-between">
                <span>
                  NFT Name <span className="text-[#d2bbff]">*</span>
                </span>
                <span className="text-[11px] text-[#ccc3d8]">Required</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cyber Genesis #001"
                  className="w-full bg-[#0c0e13] border border-[#4a4455] rounded-xl px-4 py-3 text-sm text-[#e2e2e9] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all"
                />
                <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-[#958da1]">
                  edit
                </span>
              </div>
            </div>

            {/* Form Field 2: Description */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-[#e2e2e9] flex items-center justify-between">
                <span>Description <span className="text-[#d2bbff]">*</span></span>
                <span className="text-[11px] text-[#ccc3d8]">Saved in IPFS metadata</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your non-fungible asset and provenance..."
                className="w-full bg-[#0c0e13] border border-[#4a4455] rounded-xl p-4 text-xs md:text-sm text-[#e2e2e9] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all custom-scroll leading-relaxed"
              />
            </div>

            {/* Form Field 3: NFT Attributes / Traits Manager */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-[#e2e2e9] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#4cd7f6]">tune</span>
                  NFT Attributes &amp; On-Chain Traits
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingTrait(true)}
                  className="text-xs text-[#d2bbff] hover:text-white font-mono flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add Attribute
                </button>
              </div>

              {/* Inline Add Attribute Input Bar */}
              {isAddingTrait && (
                <div className="p-3 rounded-xl bg-[#1a1b21] border border-[#7c3aed] flex flex-col sm:flex-row gap-2 items-center animate-in fade-in duration-150">
                  <input
                    type="text"
                    placeholder="Trait Type (e.g. Rarity, Artist)"
                    value={newTraitType}
                    onChange={(e) => setNewTraitType(e.target.value)}
                    className="flex-1 w-full bg-[#0c0e13] border border-[#4a4455] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#7c3aed]"
                  />
                  <input
                    type="text"
                    placeholder="Trait Value (e.g. Legendary, Alice)"
                    value={newTraitValue}
                    onChange={(e) => setNewTraitValue(e.target.value)}
                    className="flex-1 w-full bg-[#0c0e13] border border-[#4a4455] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#7c3aed]"
                  />
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleAddTrait}
                      className="px-3 py-1.5 rounded-lg bg-[#7c3aed] text-white text-xs font-mono font-medium hover:bg-opacity-90 cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingTrait(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#282a2f] text-[#ccc3d8] text-xs font-mono hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Trait Pills Grid */}
              {attributes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {attributes.map((attr, index) => (
                    <div
                      key={index}
                      className="p-2.5 rounded-lg bg-[#1a1b21] border border-[#4a4455] flex flex-col relative group"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveTrait(index)}
                        className="absolute top-1.5 right-1.5 text-[#958da1] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove Trait"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                      <span className="text-[10px] uppercase font-mono text-[#ccc3d8]">
                        {attr.trait_type}
                      </span>
                      <span className="text-xs font-semibold text-[#e2e2e9] truncate mt-0.5">
                        {attr.value}
                      </span>
                      <span className="text-[10px] text-[#4cd7f6] font-mono mt-0.5">
                        {attr.rarity || 'Trait'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#1a1b21]/50 border border-dashed border-[#4a4455] text-center text-xs font-mono text-[#958da1]">
                  Optional: click &quot;Add Attribute&quot; to attach custom metadata traits.
                </div>
              )}
            </div>

            {/* Network & Contract Telemetry Card */}
            <div className="rounded-xl bg-[#0c0e13] border border-[#4a4455] p-4.5 flex flex-col gap-3 inset-highlight">
              <div className="text-xs font-mono text-[#ccc3d8] uppercase tracking-wider flex items-center justify-between border-b border-[#4a4455] pb-2">
                <span>Contract Execution Telemetry</span>
                <span className="text-xs text-[#4cd7f6] font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
                  Sepolia Connected
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[#ccc3d8] block text-[11px]">Target Network:</span>
                  <span className="text-[#e2e2e9] font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#4cd7f6]"></span>
                    Ethereum Sepolia (ID: 11155111)
                  </span>
                </div>
                <div>
                  <span className="text-[#ccc3d8] block text-[11px]">Token Standard:</span>
                  <span className="text-[#e2e2e9] font-medium mt-0.5 block">
                    ERC-721 (MyNFT.sol)
                  </span>
                </div>
                <div>
                  <span className="text-[#ccc3d8] block text-[11px]">Deployed Contract:</span>
                  <span className="text-[#d2bbff] font-semibold mt-0.5 block truncate" title={contractAddress}>
                    {shortenAddress(contractAddress, 6) || 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-[#ccc3d8] block text-[11px]">Method:</span>
                  <span className="text-[#4edea3] font-medium mt-0.5 block">
                    mintNFT(tokenURI)
                  </span>
                </div>
              </div>
            </div>

            {/* Mint Action Button CTA */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleMint}
                disabled={isMinting}
                className="w-full py-4 px-6 rounded-xl bg-[#7c3aed] text-white font-headline font-bold text-base hover:bg-opacity-95 glow-violet active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isMinting ? (
                  <>
                    <span className="material-symbols-outlined text-2xl animate-spin">
                      progress_activity
                    </span>
                    <span>Processing Pipeline Step {pipelineStep} of 6...</span>
                  </>
                ) : (
                  <>
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      bolt
                    </span>
                    <span>Mint NFT on Sepolia</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 text-xs text-[#ccc3d8] font-mono pt-1 text-center">
                <span className="material-symbols-outlined text-sm text-[#4cd7f6]">security</span>
                <span>Requires MetaMask signature · Real Ethereum Sepolia on-chain consensus</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. INTERACTIVE TRANSACTION PIPELINE CARD                              */}
      {/* ===================================================================== */}
      <TransactionPipeline
        currentStepIndex={pipelineStep}
        isMinting={isMinting}
        imageCid={imageCid}
        metadataCid={metadataCid}
        txHash={pipelineTxHash}
        blockNumber={pipelineBlock}
        tokenId={pipelineTokenId}
        rawMetadata={pipelineMetadata}
      />

      {/* ===================================================================== */}
      {/* 5. RECENTLY MINTED ITEMS IN STUDIO COLLECTION                         */}
      {/* ===================================================================== */}
      <section className="flex flex-col gap-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-headline font-bold text-[#e2e2e9]">
              Recently Minted Tokens
            </h3>
            <p className="text-xs text-[#ccc3d8] mt-0.5">
              Live ERC-721 smart assets on the Ethereum Sepolia ledger
            </p>
          </div>
          <button
            onClick={() => onNavigate('my-nfts')}
            className="flex items-center gap-1 text-xs font-mono text-[#d2bbff] hover:text-white transition-colors cursor-pointer"
          >
            <span>View All {nfts.length} Items</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {nfts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#111318] border border-dashed border-[#4a4455] flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1e2025] flex items-center justify-center text-[#958da1]">
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            </div>
            <div>
              <h4 className="text-sm font-headline font-bold text-white">No NFTs Minted Yet</h4>
              <p className="text-xs text-[#ccc3d8] mt-1 max-w-md">
                Upload an image above and click &quot;Mint NFT on Sepolia&quot; to write your first immutable token to the blockchain.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {nfts.slice(0, 3).map((nft) => (
              <div
                key={nft.id}
                onClick={() => onNFTSelect(nft)}
                className="bg-[#111318] rounded-xl border border-[#4a4455] overflow-hidden flex flex-col group hover:border-[#7c3aed] transition-all duration-200 inset-highlight cursor-pointer"
              >
                <div className="aspect-square w-full overflow-hidden bg-[#0c0e13] relative">
                  <img
                    src={resolveIPFS(nft.image)}
                    alt={nft.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#0c0e13]/80 backdrop-blur-sm border border-[#4a4455] text-[11px] font-mono text-[#d2bbff]">
                    #{nft.id.padStart(3, '0')}
                  </span>
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#4edea3]/20 backdrop-blur-sm border border-[#4edea3]/40 text-[10px] font-mono text-[#4edea3]">
                    Confirmed
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <h4 className="text-sm font-headline font-bold text-[#e2e2e9] truncate">
                      {nft.name}
                    </h4>
                    <p className="text-xs font-mono text-[#ccc3d8] mt-0.5 truncate">
                      Owner: {shortenAddress(nft.owner, 4)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#4a4455]">
                    <span className="text-xs font-mono text-[#4cd7f6]">Sepolia ERC-721</span>
                    <span className="text-xs text-[#d2bbff] group-hover:text-white font-mono flex items-center gap-0.5 transition-colors">
                      Details <span className="material-symbols-outlined text-xs">north_east</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Collection Stats Bento */}
            <div className="rounded-xl bg-[#1a1b21] border border-[#4a4455] p-5 flex flex-col justify-between inset-highlight">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#ccc3d8]">Collection Total</span>
                <span className="material-symbols-outlined text-base text-[#4cd7f6]">analytics</span>
              </div>
              <div className="flex flex-col gap-2 my-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#ccc3d8]">Total Minted:</span>
                  <span className="text-2xl font-bold text-white font-headline">
                    {nfts.length} Tokens
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#4cd7f6]">
                  Real ERC-721 Provenance
                </div>
              </div>
              <div className="text-[11px] font-mono text-[#4edea3] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                Sepolia Contract Verified
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
