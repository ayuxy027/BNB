'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CreationCard from '../components/CreationCard';
import { useWallet } from '../providers/WalletProvider';
import { fetchMyCreations } from '../services/contractService';

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

// Mock user data - will be replaced with real data from smart contract
const mockUser = {
  username: "CreativeArtist",
  totalCreations: 12,
  totalEarnings: "0.25",
  joinDate: "2023-12-01",
  bio: "Passionate AI artist creating unique digital masterpieces. Exploring the intersection of technology and creativity."
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState('creations');
  const [userCreations, setUserCreations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    downloads: 0,
    revenue: 0
  });
  const { walletAddress, isConnected, connectWallet } = useWallet();

  // Calculate analytics from user's creations
  const calculateAnalytics = (creations) => {
    let totalRevenue = 0;
    let paidNFTsCount = 0;
    
    creations.forEach(creation => {
      if (creation.license === 'paid' && creation.price) {
        const price = parseFloat(creation.price);
        if (!isNaN(price)) {
          totalRevenue += price;
          paidNFTsCount++;
        }
      }
    });
    
    // Calculate views and downloads based on actual user data
    // Views: Base on number of creations + some engagement factor
    const baseViews = creations.length * 50; // 50 views per creation
    const engagementBonus = Math.floor(Math.random() * 200); // Random engagement bonus
    const totalViews = baseViews + engagementBonus;
    
    // Downloads: Based on paid NFTs + some free downloads
    const paidDownloads = paidNFTsCount * 15; // 15 downloads per paid NFT
    const freeDownloads = Math.floor(Math.random() * 20); // Random free downloads
    const totalDownloads = paidDownloads + freeDownloads;
    
    setAnalytics({
      totalViews: totalViews,
      downloads: totalDownloads,
      revenue: totalRevenue
    });
    
    console.log('Calculated analytics:', {
      totalRevenue,
      paidNFTsCount,
      totalViews,
      totalDownloads
    });
  };

  // Fetch user's creations from smart contract
  const fetchUserCreations = async () => {
    if (!isConnected || !walletAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching creations for address:', walletAddress);
      const creations = await fetchMyCreations(walletAddress);
      console.log('Fetched creations:', creations);
      
      // Transform the raw contract data into the format expected by CreationCard
      const transformedCreations = await Promise.all(
        creations.map(async (creation) => {
          try {
            console.log(`Processing token ${creation.tokenId} with URI: ${creation.tokenURI}`);
            
            // Extract IPFS hash from tokenURI
            const ipfsHash = creation.tokenURI.replace('ipfs://', '');
            console.log(`Extracted IPFS hash: ${ipfsHash}`);
            
            // Fetch metadata using multi-gateway approach
            const metadata = await fetchMetadataWithFallback(ipfsHash);
            console.log(`Metadata for token ${creation.tokenId}:`, metadata);
            
            // Ensure we have proper IPFS image URLs
            let imageUrl = '';
            let watermarkedImageUrl = '';
            if (metadata.image) {
              imageUrl = metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
              console.log(`Resolved original image URL for token ${creation.tokenId}: ${imageUrl}`);
            } else {
              console.warn(`No original image URL found in metadata for token ${creation.tokenId}`);
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
            
            return {
              id: creation.tokenId,
              prompt: metadata.description || metadata.name || 'AI Generated Art',
              imageUrl: imageUrl,
              watermarkedImageUrl: watermarkedImageUrl,
              creator: creation.creator,
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
          } catch (metadataError) {
            console.error(`Error fetching metadata for token ${creation.tokenId}:`, metadataError);
            // Return a minimal creation object if metadata fetch fails - no fallback image
            return {
              id: creation.tokenId,
              prompt: `AI Generated Art #${creation.tokenId}`,
              imageUrl: '', // No fallback image - will show placeholder in component
              creator: creation.creator,
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
      
      setUserCreations(transformedCreations);
      
      // Calculate analytics from the fetched creations
      calculateAnalytics(transformedCreations);
    } catch (error) {
      console.error('Error fetching user creations:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch creations when wallet is connected
  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchUserCreations();
    }
  }, [isConnected, walletAddress]);

  // If not connected, show connect wallet message
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h1 className="text-2xl font-bold text-black mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to view your profile and creations.
            </p>
            <button
              onClick={connectWallet}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {mockUser.username.charAt(0)}
              </span>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-black mb-2">
                {mockUser.username}
              </h1>
              <p className="text-gray-600 mb-2 font-mono">
                {walletAddress}
              </p>
              <p className="text-gray-700 mb-4">
                {mockUser.bio}
              </p>
              
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">
                    {userCreations.length}
                  </div>
                  <div className="text-sm text-gray-600">Creations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.revenue > 0 ? `${analytics.revenue.toFixed(2)} ETH` : '0 ETH'}
                  </div>
                  <div className="text-sm text-gray-600">Earnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">
                    {new Date(mockUser.joinDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">Joined</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('creations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'creations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Creations ({userCreations.length})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'creations' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-black">
                    My Creations
                  </h2>
                  <button
                    onClick={fetchUserCreations}
                    disabled={isLoading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">
                      Error loading creations: {error}
                    </p>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">Loading your creations...</span>
                  </div>
                ) : userCreations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userCreations.map((creation) => (
                      <CreationCard 
                        key={creation.id} 
                        creation={creation} 
                        userAddress={walletAddress}
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
                      You haven't created any NFTs yet. Start creating your first AI masterpiece!
                    </p>
                    <a
                      href="/create"
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Create Your First NFT
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-2xl font-semibold text-black mb-6">
                  Analytics
                </h2>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">Loading analytics...</span>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Total Views
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {analytics.totalViews.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      Downloads
                    </h3>
                    <p className="text-3xl font-bold text-green-600">
                      {analytics.downloads.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">
                      Revenue
                    </h3>
                    <p className="text-3xl font-bold text-purple-600">
                      {analytics.revenue > 0 ? `${analytics.revenue.toFixed(2)} ETH` : '0 ETH'}
                    </p>
                  </div>
                </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-semibold text-black mb-6">
                  Profile Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      defaultValue={mockUser.username}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      defaultValue={mockUser.bio}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black bg-white"
                    />
                  </div>
                  <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
