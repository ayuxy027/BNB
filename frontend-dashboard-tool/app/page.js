'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Navbar from './components/Navbar';
import CreationCard from './components/CreationCard';
import { fetchAllCreations } from './services/contractService';
import { useWallet } from './providers/WalletProvider';
import { useRouter } from 'next/navigation';

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

// Filter configuration - easily extensible
const FILTER_CONFIG = {
  all: { 
    label: 'All', 
    filter: (items) => items,
    count: (items) => items.length
  },
  free: { 
    label: 'Free', 
    filter: (items) => items.filter(item => item.license === 'free'),
    count: (items) => items.filter(item => item.license === 'free').length
  },
  premium: { 
    label: 'Premium', 
    filter: (items) => items.filter(item => item.license === 'paid'),
    count: (items) => items.filter(item => item.license === 'paid').length
  },
  recent: { 
    label: 'Recent', 
    filter: (items) => [...items].sort((a, b) => new Date(b.date) - new Date(a.date)),
    count: (items) => items.length
  },
  popular: { 
    label: 'Popular', 
    filter: (items) => items, // Placeholder for future popularity logic
    count: (items) => items.length
  }
};

// Custom hook for filtered creations with memoization
const useFilteredCreations = (creations, activeFilter) => {
  return useMemo(() => {
    const filterFn = FILTER_CONFIG[activeFilter]?.filter;
    return filterFn ? filterFn(creations) : creations;
  }, [creations, activeFilter]);
};

// Memoized filter button component
const FilterButton = memo(({ filterType, isActive, onClick, children, count }) => {
  const handleClick = useCallback(() => {
    onClick(filterType);
  }, [filterType, onClick]);

  return (
    <button 
      onClick={handleClick}
      className={`px-4 py-2 font-medium transition-all duration-200 rounded-lg ${
        isActive 
          ? 'bg-gray-900 text-white shadow-lg' 
          : 'text-gray-700 hover:text-black hover:bg-gray-100'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
          isActive ? 'bg-white/20' : 'bg-gray-200'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
});

FilterButton.displayName = 'FilterButton';

// Memoized search input component
const SearchInput = memo(({ placeholder, onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSearch(query);
  }, [query, onSearch]);

  return (
    <form onSubmit={handleSubmit} className="relative max-w-sm">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-5 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-gray-400/80 focus:ring-2 focus:ring-gray-200/40 transition-all duration-300 shadow-md"
      />
      <button 
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-900 hover:bg-black rounded-lg flex items-center justify-center transition-colors duration-300"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
});

SearchInput.displayName = 'SearchInput';

const poppinsFontUrl =
  "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap";

export default function Home() {
  const [allCreations, setAllCreations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { walletAddress } = useWallet();
  const router = useRouter();

  // Memoized filtered creations
  const filteredCreations = useFilteredCreations(allCreations, activeFilter);

  // Memoized search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return filteredCreations;
    
    const query = searchQuery.toLowerCase();
    return filteredCreations.filter(creation => 
      creation.prompt.toLowerCase().includes(query) ||
      creation.creator.toLowerCase().includes(query) ||
      (creation.tags && creation.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }, [filteredCreations, searchQuery]);

  // Memoized filter handler
  const handleFilter = useCallback((filterType) => {
    if (FILTER_CONFIG[filterType]) {
      setActiveFilter(filterType);
      setSearchQuery(''); // Reset search when changing filters
    }
  }, []);

  // Memoized search handler
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Font management
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = 'poppins-font-link';
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = poppinsFontUrl;
        document.head.appendChild(link);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.style.fontFamily = "'Poppins', sans-serif";
    }
    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.fontFamily = '';
      }
    };
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.02)_1px,transparent_0)] bg-[length:32px_32px] pointer-events-none"></div>
      
      <Navbar />
      
      <main className="relative max-w-7xl mx-auto px-8 py-20">
        {/* Hero Section - Compact Design */}
        <div className="mb-8 relative h-[20vh] min-h-[300px] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center w-full">
            {/* Left Column - Text and Search (3/5 width) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Decorative line */}
              <div className="w-16 h-px bg-gradient-to-r from-gray-400 to-transparent opacity-60"></div>
              
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium max-w-2xl bg-gradient-to-r from-black to-[#748298] text-transparent bg-clip-text leading-tight">
                  Create. Present. Impress.
                </h1>
                
                <p className="text-slate-600 text-lg font-light leading-relaxed max-w-lg">
                  Discover premium AI-generated artwork from creators worldwide.
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => router.push('/create')}
                    className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl transition-colors duration-300 font-medium text-sm shadow-lg"
                  >
                    Start Creating
                  </button>
                  <button className="px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 hover:border-gray-300/70 text-gray-700 hover:text-black rounded-xl transition-all duration-300 font-medium text-sm shadow-md">
                    Browse Gallery
                  </button>
                </div>
                
                {/* Compact Quick Tags */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-gray-500 font-medium">Popular:</span>
                  {["Abstract", "Portraits", "Digital Art"].map((tag) => (
                    <button
                      key={tag}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors duration-200 font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Column - Sleek Rectangular Image (2/5 width) */}
            <div className="lg:col-span-2 relative">
              <div className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:border-gray-300/70 hover:scale-[1.02] cursor-pointer">
                <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop&crop=center"
                    alt="AI Generated Art Gallery"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Sleek hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end">
                    <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 text-center space-y-3 pb-6">
                      {/* Subtitle */}
                      <p className="text-gray-200 text-xs font-light">
                        Generate stunning artwork with AI
                      </p>
                    </div>
                  </div>
                  
                  {/* Sleek subtitle badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 shadow-sm">
                    AI Generated
                  </div>
                </div>
              </div>
              
              {/* Minimal decorative elements */}
              <div className="absolute -top-2 -right-2 w-4 h-4 border border-gray-300 rounded-full opacity-50"></div>
              <div className="absolute -bottom-3 -left-3 w-3 h-3 bg-gray-400 rounded-full opacity-30"></div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-2xl p-6 shadow-lg">
            <p className="text-red-800 font-medium">
              Error loading creations: {error}
            </p>
            <button
              onClick={fetchAllNFTs}
              className="mt-3 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Filter Section */}
        <div className="mb-12 flex justify-center">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl px-8 py-4 shadow-lg">
            <div className="flex gap-6 items-center">
              {Object.entries(FILTER_CONFIG).map(([key, config]) => (
                <FilterButton
                  key={key}
                  filterType={key}
                  isActive={activeFilter === key}
                  onClick={handleFilter}
                  count={config.count(allCreations)}
                >
                  {config.label}
                </FilterButton>
              ))}
            </div>
          </div>
        </div>

        {/* Search Results Summary */}
        {searchQuery && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Search results for "{searchQuery}": {searchResults.length} items found
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading community creations...</span>
          </div>
        ) : searchResults.length > 0 ? (
          /* Gallery Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
            {searchResults.map((creation) => (
              <CreationCard 
                key={creation.id} 
                creation={creation} 
                userAddress={walletAddress}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No results found for your search.' : 'No creations yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms or browse all creations.'
                : 'Be the first to create an AI masterpiece and share it with the community!'
              }
            </p>
            <a
              href="/create"
              className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition-colors font-medium"
            >
              Create Your First NFT
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
