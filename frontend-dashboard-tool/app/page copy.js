'use client';

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CreationCard from './components/CreationCard';
import { fetchAllCreations } from './services/contractService';
import { useWallet } from './providers/WalletProvider';

// Multi-gateway metadata fetching utility
const fetchMetadataWithFallback = async (ipfsHash) => {
  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    `https://ipfs.io/ipfs/${ipfsHash}`,
    `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
    `https://dweb.link/ipfs/${ipfsHash}`,
    `https://gateway.ipfs.io/ipfs/${ipfsHash}`,
    `https://ipfs.fleek.co/ipfs/${ipfsHash}`,
    `https://cf-ipfs.com/ipfs/${ipfsHash}`,
    `https://4everland.io/ipfs/${ipfsHash}`
  ];

  for (let i = 0; i < gateways.length; i++) {
    try {
      console.log(`Trying metadata gateway ${i + 1}/${gateways.length}: ${gateways[i]}`);
      const response = await fetch(gateways[i], {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors'
      });
      
      if (response.ok) {
        const metadata = await response.json();
        console.log(`Metadata fetched successfully from gateway ${i + 1}`);
        return metadata;
      }
    } catch (error) {
      console.warn(`Gateway ${i + 1} failed:`, error.message);
      continue;
    }
  }
  
  throw new Error('All metadata gateways failed');
};

export default function Home() {
  const [allCreations, setAllCreations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { walletAddress } = useWallet();

  // Fetch all creations from smart contract
  const fetchAllNFTs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('=== STARTING FETCH ALL NFTS ===');
      console.log('Fetching all creations from smart contract...');
      const creations = await fetchAllCreations();
      console.log('Raw contract data:', creations);
      console.log('Number of creations found:', creations.length);
      
      if (creations.length === 0) {
        console.log('No creations found in smart contract');
        setAllCreations([]);
        return;
      }
      
      // Transform the raw contract data into the format expected by CreationCard
      const transformedCreations = await Promise.all(
        creations.map(async (creation, index) => {
          console.log(`\n--- Processing Creation ${index + 1}/${creations.length} ---`);
          console.log('Token ID:', creation.tokenId);
          console.log('Token URI:', creation.tokenURI);
          console.log('Creator:', creation.creator);
          console.log('Created At:', creation.createdAt);
          
          try {
            // Extract IPFS hash from tokenURI
            const ipfsHash = creation.tokenURI.replace('ipfs://', '');
            console.log(`Extracted IPFS hash: ${ipfsHash}`);
            
            // Fetch metadata using multi-gateway approach
            const metadata = await fetchMetadataWithFallback(ipfsHash);
            console.log(`Full metadata for token ${creation.tokenId}:`, metadata);
            
            // Ensure we have proper IPFS image URLs
            let imageUrl = '';
            let watermarkedImageUrl = '';
            if (metadata.image) {
              imageUrl = metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
              console.log(`Resolved original image URL for token ${creation.tokenId}: ${imageUrl}`);
            } else {
              console.warn(`No original image URL found in metadata for token ${creation.tokenId}`);
              console.log('Available metadata keys:', Object.keys(metadata));
            }
            
            if (metadata.watermarkedImage) {
              watermarkedImageUrl = metadata.watermarkedImage.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
              console.log(`Resolved watermarked image URL for token ${creation.tokenId}: ${watermarkedImageUrl}`);
            } else {
              console.log(`No watermarked image URL found in metadata for token ${creation.tokenId} - using original as fallback`);
              watermarkedImageUrl = imageUrl; // Fallback to original
            }
            
            // Extract attributes more robustly
            const attributes = metadata.attributes || [];
            console.log('Attributes found:', attributes);
            
            const style = attributes.find(attr => attr.trait_type === 'Style')?.value || 'unknown';
            const mood = attributes.find(attr => attr.trait_type === 'Mood')?.value || 'unknown';
            const license = attributes.find(attr => attr.trait_type === 'License')?.value || 'free';
            const price = attributes.find(attr => attr.trait_type === 'Price')?.value || null;
            const creationId = attributes.find(attr => attr.trait_type === 'Creation ID')?.value || metadata.creationId || 'unknown';
            
            // Create tags from attributes
            const tags = attributes
              .filter(attr => ['Style', 'Mood'].includes(attr.trait_type))
              .map(attr => attr.value)
              .filter(Boolean);
            
            const transformedCreation = {
              id: creation.tokenId,
              prompt: metadata.description || metadata.name || 'AI Generated Art',
              imageUrl: imageUrl,
              watermarkedImageUrl: watermarkedImageUrl,
              creator: creation.creator,
              owner: creation.owner,
              date: new Date(creation.createdAt * 1000).toLocaleDateString(),
              tags: tags,
              license: license,
              price: price,
              tokenId: creation.tokenId,
              creationId: creationId,
              style: style,
              mood: mood,
              metadata: metadata
            };
            
            console.log('Transformed creation object:', transformedCreation);
            return transformedCreation;
            
          } catch (metadataError) {
            console.error(`Error fetching metadata for token ${creation.tokenId}:`, metadataError);
            console.error('Error details:', {
              message: metadataError.message,
              stack: metadataError.stack
            });
            
            // Return a minimal creation object if metadata fetch fails - no fallback image
            return {
              id: creation.tokenId,
              prompt: `AI Generated Art #${creation.tokenId}`,
              imageUrl: '', // No fallback image - will show placeholder in component
              creator: creation.creator,
              owner: creation.owner,
              date: new Date(creation.createdAt * 1000).toLocaleDateString(),
              tags: ['ai-generated'],
              license: 'free',
              price: null,
              tokenId: creation.tokenId,
              creationId: `unknown-${creation.tokenId}`,
              style: 'unknown',
              mood: 'unknown',
              metadata: null
            };
          }
        })
      );
      
      console.log('\n=== TRANSFORMATION COMPLETE ===');
      console.log('Final transformed creations:', transformedCreations);
      console.log('Creations with images:', transformedCreations.filter(c => c.imageUrl).length);
      console.log('Creations without images:', transformedCreations.filter(c => !c.imageUrl).length);
      
      // Sort by creation date (newest first)
      const sortedCreations = transformedCreations.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
      
      console.log('Final sorted creations to be displayed:', sortedCreations);
      setAllCreations(sortedCreations);
      
    } catch (error) {
      console.error('=== FETCH ERROR ===');
      console.error('Error fetching all creations:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all creations on component mount
  useEffect(() => {
    fetchAllNFTs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-black mb-4">
                Discover Amazing AI Creations
              </h1>
              <p className="text-gray-600 text-lg">
                Explore unique AI-generated images created by the community
              </p>
            </div>
            <button
              onClick={fetchAllNFTs}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              Error loading creations: {error}
            </p>
            <button
              onClick={fetchAllNFTs}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading community creations...</span>
          </div>
        ) : allCreations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCreations.map((creation) => (
              <CreationCard 
                key={creation.id} 
                creation={creation} 
                userAddress={walletAddress}
                onPurchaseSuccess={fetchAllNFTs}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No creations yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to create an AI masterpiece and share it with the community!
            </p>
            <a
              href="/create"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Your First NFT
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
