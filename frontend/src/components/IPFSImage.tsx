import React, { useState, useEffect } from 'react';
import { getIPFSGatewayUrls, shortenCID, extractIPFSPath } from '../ipfs';

interface IPFSImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  onClick?: () => void;
}

export const IPFSImage: React.FC<IPFSImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full relative overflow-hidden bg-[#0c0e13] flex items-center justify-center',
  referrerPolicy = 'no-referrer',
  onClick,
}) => {
  const gatewayUrls = getIPFSGatewayUrls(src);
  const [gatewayIndex, setGatewayIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset state when source URI changes
  useEffect(() => {
    setGatewayIndex(0);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const currentUrl = gatewayUrls[gatewayIndex] || '';

  const handleError = () => {
    if (gatewayIndex < gatewayUrls.length - 1) {
      // Automatically attempt the next fallback gateway
      setGatewayIndex(prev => prev + 1);
    } else {
      // All candidate gateways failed
      setIsLoading(false);
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGatewayIndex(0);
    setIsLoading(true);
    setHasError(false);
  };

  const cid = extractIPFSPath(src);

  return (
    <div className={containerClassName} onClick={onClick}>
      {/* Loading Skeleton */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c0e13] text-[#958da1] p-3 text-center z-10 animate-pulse">
          <span className="material-symbols-outlined text-2xl animate-spin text-[#7c3aed]">progress_activity</span>
          <span className="text-[10px] font-mono text-[#ccc3d8] mt-2">Retrieving IPFS Asset...</span>
        </div>
      )}

      {/* Error Fallback State */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#15171e] text-[#958da1] p-3 text-center z-20 border border-[#4a4455]/40">
          <span className="material-symbols-outlined text-3xl text-amber-400 mb-1">image_not_supported</span>
          <span className="text-xs font-semibold text-white font-headline">Artwork Unavailable</span>
          {cid ? (
            <span className="text-[10px] font-mono text-[#ccc3d8] mt-1 truncate max-w-[90%]">
              ipfs://{shortenCID(cid, 6)}
            </span>
          ) : (
            <span className="text-[10px] font-mono text-[#958da1] mt-1">No IPFS URI</span>
          )}
          <button
            onClick={handleRetry}
            className="mt-3 px-3 py-1 rounded-md bg-[#7c3aed]/20 hover:bg-[#7c3aed]/30 border border-[#7c3aed]/50 text-xs font-mono text-[#d2bbff] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">refresh</span>
            <span>Retry Gateway</span>
          </button>
        </div>
      ) : (
        /* Render Image */
        currentUrl && (
          <img
            src={currentUrl}
            alt={alt}
            className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            referrerPolicy={referrerPolicy}
            onLoad={handleLoad}
            onError={handleError}
          />
        )
      )}
    </div>
  );
};
