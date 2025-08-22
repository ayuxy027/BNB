import { useState, useEffect, useRef } from 'react';
import { purchaseNFT } from '../services/contractService';

export default function CreationCard({ creation, userAddress, onPurchaseSuccess }) {
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [localOwner, setLocalOwner] = useState(creation.owner);
  const timeoutRef = useRef(null);
  const imgRef = useRef(null);

  // Update local owner when creation prop changes
  useEffect(() => {
    setLocalOwner(creation.owner);
    console.log(`CreationCard ${creation.tokenId}: Owner updated to ${creation.owner}, localOwner: ${localOwner}, userAddress: ${userAddress}`);
  }, [creation.owner]);

  const shortenAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handlePurchase = async () => {
    if (!userAddress) {
      alert('Please connect your wallet to purchase this NFT');
      return;
    }

    if (localOwner === userAddress) {
      alert('You already own this NFT');
      return;
    }

    if (creation.license !== 'paid' || !creation.price) {
      alert('This NFT is not for sale');
      return;
    }

    setIsPurchasing(true);
    try {
      console.log(`Purchasing NFT ${creation.tokenId} for ${creation.price} ETH`);
      const result = await purchaseNFT(creation.tokenId, creation.price);
      console.log('Purchase successful:', result);
      alert('Purchase successful! You now own this NFT.');
      
      // Immediately update local owner state to reflect the purchase
      setLocalOwner(userAddress);
      
      // Call the callback to refresh the data
      if (onPurchaseSuccess) {
        onPurchaseSuccess();
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert(`Purchase failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsPurchasing(false);
    }
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

  // Determine which image to display based on license and ownership
  const getDisplayImageUrl = () => {
    if (creation.license === 'free') {
      return creation.imageUrl; // Original for everyone
    } else if (creation.license === 'paid') {
      if (localOwner === userAddress || creation.creator === userAddress) {
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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 relative">
        {creation.imageUrl && !imageError ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            <img
              ref={imgRef}
              src={currentImageUrl}
              alt={creation.prompt}
              className="w-full h-full object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: isLoading ? 'none' : 'block' }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
        {creation.tokenId && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            #{creation.tokenId}
          </div>
        )}
        {creation.license === 'free' && (
          <div className="absolute top-2 left-2 bg-green-500 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            Free
          </div>
        )}
        {creation.license === 'paid' && localOwner === userAddress && (
          <div className="absolute top-2 left-2 bg-blue-500 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            Owned
          </div>
        )}
        {creation.creationId && creation.creationId !== `unknown-${creation.tokenId}` && (
          <div className="absolute bottom-2 left-2 bg-blue-500 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {creation.creationId.split('-')[0]}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-black text-lg mb-2 line-clamp-2">
          {creation.prompt}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span className="truncate max-w-[120px]" title={creation.creator}>
            By {shortenAddress(creation.creator)}
          </span>
          <span className="flex-shrink-0">{creation.date}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {(creation.tags || []).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            {creation.license === 'free' ? (
              <span className="text-sm text-gray-600">Free</span>
            ) : creation.price ? (
              <div className="flex flex-col items-end space-y-1">
                {localOwner === userAddress ? (
                  <span className="text-sm font-medium text-blue-600">Owned</span>
                ) : (
                  <>
                    <span className="text-sm font-medium text-green-600">
                      {creation.price} ETH
                    </span>
                    {userAddress && (
                      <button
                        onClick={handlePurchase}
                        disabled={isPurchasing}
                        className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {isPurchasing ? 'Purchasing...' : 'Purchase'}
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
        {creation.style && creation.style !== 'unknown' && (
          <div className="mt-2 text-xs text-gray-500">
            Style: {creation.style} • Mood: {creation.mood}
          </div>
        )}
      </div>
    </div>
  );
}
