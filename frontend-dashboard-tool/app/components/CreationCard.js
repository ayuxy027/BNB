import { useState, useEffect, useRef } from 'react';

export default function CreationCard({ creation, userAddress }) {
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const timeoutRef = useRef(null);
  const imgRef = useRef(null);

  const shortenAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Multiple IPFS gateways to handle rate limiting
  const getIpfsGateways = (imageUrl) => {
    if (!imageUrl) return [];
    
    // Extract the IPFS hash from the URL
    let hash;
    
    if (imageUrl.includes('ipfs/')) {
      // URL already contains gateway prefix, extract the hash
      const match = imageUrl.match(/ipfs\/([a-zA-Z0-9]+)/);
      hash = match ? match[1] : null;
    } else if (imageUrl.startsWith('ipfs://')) {
      // IPFS URI format
      hash = imageUrl.replace('ipfs://', '');
    } else {
      // Assume it's already a hash
      hash = imageUrl;
    }
    
    if (!hash) {
      console.error('Could not extract IPFS hash from:', imageUrl);
      return [];
    }
    
    console.log('Extracted IPFS hash:', hash);
    
    return [
      `https://gateway.pinata.cloud/ipfs/${hash}`,
      `https://ipfs.io/ipfs/${hash}`,
      `https://cloudflare-ipfs.com/ipfs/${hash}`,
      `https://dweb.link/ipfs/${hash}`,
      `https://gateway.ipfs.io/ipfs/${hash}`,
      `https://ipfs.fleek.co/ipfs/${hash}`,
      `https://cf-ipfs.com/ipfs/${hash}`,
      `https://4everland.io/ipfs/${hash}`
    ];
  };

  // Determine which image to display based on license
  const getDisplayImageUrl = () => {
    if (creation.license === 'free') {
      return creation.imageUrl; // Original for everyone
    } else if (creation.license === 'paid') {
      if (creation.owner === userAddress || creation.creator === userAddress) {
        return creation.imageUrl; // Original for owner/creator
      } else {
        return creation.watermarkedImageUrl; // Watermarked for others
      }
    }
    return creation.imageUrl; // Default fallback
  };

  const displayImageUrl = getDisplayImageUrl();
  const gateways = getIpfsGateways(displayImageUrl);
  const currentImageUrl = gateways[currentGatewayIndex];

  const clearTimeout = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const setLoadingTimeout = () => {
    clearTimeout();
    // Set a 10-second timeout for image loading
    timeoutRef.current = window.setTimeout(() => {
      console.log(`Loading timeout for token ${creation.tokenId} on gateway ${currentGatewayIndex}`);
      handleImageError();
    }, 10000);
  };

  const handleImageError = () => {
    clearTimeout();
    console.log(`Gateway ${currentGatewayIndex} failed for token ${creation.tokenId}, trying next...`);
    
    if (currentGatewayIndex < gateways.length - 1) {
      // Try next gateway
      setCurrentGatewayIndex(prev => prev + 1);
      setIsLoading(true);
      setImageError(false);
      setImageLoaded(false);
    } else {
      // All gateways failed
      console.error(`All gateways failed for token ${creation.tokenId}`);
      setImageError(true);
      setIsLoading(false);
      setImageLoaded(false);
    }
  };

  const handleImageLoad = () => {
    clearTimeout();
    console.log(`Image loaded successfully for token ${creation.tokenId} from gateway ${currentGatewayIndex}`);
    setIsLoading(false);
    setImageError(false);
    setImageLoaded(true);
  };

  // Reset when imageUrl changes
  useEffect(() => {
    console.log(`Resetting state for token ${creation.tokenId} with new imageUrl:`, creation.imageUrl);
    setCurrentGatewayIndex(0);
    setImageError(false);
    setIsLoading(true);
    setImageLoaded(false);
    clearTimeout();
  }, [creation.imageUrl, creation.tokenId]);

  // Set up loading timeout when gateway changes
  useEffect(() => {
    if (creation.imageUrl && !imageError && isLoading) {
      setLoadingTimeout();
    }
    return clearTimeout;
  }, [currentGatewayIndex, creation.imageUrl, imageError, isLoading, creation.tokenId]);

  // Check if image is already loaded (for cached images)
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && !imageLoaded) {
      console.log(`Image already complete for token ${creation.tokenId} from gateway ${currentGatewayIndex}`);
      handleImageLoad();
    }
  }, [currentImageUrl, imageLoaded, creation.tokenId, currentGatewayIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return clearTimeout;
  }, []);

  // Debug logging
  console.log('CreationCard rendering for:', {
    id: creation.id,
    tokenId: creation.tokenId,
    imageUrl: creation.imageUrl,
    currentGatewayUrl: currentImageUrl,
    prompt: creation.prompt,
    hasImageUrl: !!creation.imageUrl,
    currentGatewayIndex,
    totalGateways: gateways.length,
    isLoading,
    imageLoaded,
    imageError
  });

  return (
    <div className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:border-gray-300/70 hover:transform hover:scale-[1.02]">
      {/* Image Container */}
      <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {creation.imageUrl && !imageError ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            <img
              ref={imgRef}
              src={currentImageUrl}
              alt={creation.prompt}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: isLoading ? 'none' : 'block' }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">
                {imageError ? 'Image unavailable' : 'Image not available'}
              </p>
              {imageError && (
                <button 
                  onClick={() => {
                    setCurrentGatewayIndex(0);
                    setImageError(false);
                    setIsLoading(true);
                    setImageLoaded(false);
                    clearTimeout();
                  }}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-600"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Top left action buttons */}
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
          <div className="flex flex-col gap-3">
            {/* Like Button */}
            <button className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg border border-gray-200/50 hover:border-gray-300/70 hover:scale-110 group/btn">
              <svg className="w-6 h-6 text-gray-700 group-hover/btn:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            
            {/* Share Button */}
            <button className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg border border-gray-200/50 hover:border-gray-300/70 hover:scale-110 group/btn">
              <svg className="w-6 h-6 text-gray-700 group-hover/btn:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Top right - Token ID and License indicators */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {creation.tokenId && (
            <div className="bg-black/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg border border-gray-700/50">
              #{creation.tokenId}
            </div>
          )}
          {creation.license === 'free' && (
            <div className="bg-green-500/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg border border-green-600/50">
              Free
            </div>
          )}
          {creation.license === 'paid' && creation.owner === userAddress && (
            <div className="bg-blue-500/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg border border-blue-600/50">
              Owned
            </div>
          )}
        </div>
        
        {/* Hover overlay with details */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
          <div className="text-white space-y-4">
            {/* Creator and Date Row */}
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-sm text-gray-200 font-medium mb-1">
                  By {shortenAddress(creation.creator)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300">
                  {creation.date}
                </div>
              </div>
            </div>
            
            {/* Tags and Price Row */}
            <div className="flex items-end justify-between">
              {/* Tags */}
              <div className="flex-1 mr-4">
                <div className="flex flex-wrap gap-2">
                  {(creation.tags || []).slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/20 text-white text-xs rounded-full backdrop-blur-sm font-medium border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Price Display */}
              <div className="text-right">
                {creation.license === 'free' ? (
                  <div className="text-lg font-semibold text-green-400">
                    Free
                  </div>
                ) : creation.price ? (
                  <div className="text-lg font-semibold text-green-400">
                    {creation.owner === userAddress ? 'Owned' : `${creation.price} ETH`}
                  </div>
                ) : null}
              </div>
            </div>
            
          </div>
        </div>
      </div>
      

    </div>
  );
}
