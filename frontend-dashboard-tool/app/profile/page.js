'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import CreationCard from '../components/CreationCard';
import { useWallet } from '../providers/WalletProvider';

// Mock user data - will be replaced with real data from smart contract
const mockUser = {
  username: "CreativeArtist",
  totalCreations: 12,
  totalEarnings: "0.25",
  joinDate: "2023-12-01",
  bio: "Passionate AI artist creating unique digital masterpieces. Exploring the intersection of technology and creativity."
};

// Mock user creations - will be fetched from smart contract
const mockUserCreations = [
  {
    id: 1,
    prompt: "A futuristic cityscape with flying cars and neon lights",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop",
    creator: "0x1234...5678",
    date: "2024-01-15",
    tags: ["futuristic", "city", "neon"],
    license: "free",
    price: null
  },
  {
    id: 2,
    prompt: "Abstract digital art with geometric patterns",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    creator: "0x1234...5678",
    date: "2024-01-13",
    tags: ["abstract", "geometric", "digital"],
    license: "free",
    price: null
  },
  {
    id: 3,
    prompt: "A magical forest with glowing mushrooms",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop",
    creator: "0x1234...5678",
    date: "2024-01-12",
    tags: ["magical", "forest", "fantasy"],
    license: "paid",
    price: "0.1"
  },
  {
    id: 4,
    prompt: "Cyberpunk street scene with rain",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop",
    creator: "0x1234...5678",
    date: "2024-01-11",
    tags: ["cyberpunk", "street", "rain"],
    license: "free",
    price: null
  }
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('creations');
  const { walletAddress, isConnected, connectWallet } = useWallet();

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
                    {mockUser.totalCreations}
                  </div>
                  <div className="text-sm text-gray-600">Creations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {mockUser.totalEarnings} ETH
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
                My Creations ({mockUserCreations.length})
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
                <h2 className="text-2xl font-semibold text-black mb-6">
                  My Creations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockUserCreations.map((creation) => (
                    <CreationCard key={creation.id} creation={creation} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-2xl font-semibold text-black mb-6">
                  Analytics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Total Views
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">1,247</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      Downloads
                    </h3>
                    <p className="text-3xl font-bold text-green-600">89</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">
                      Revenue
                    </h3>
                    <p className="text-3xl font-bold text-purple-600">0.25 ETH</p>
                  </div>
                </div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      defaultValue={mockUser.bio}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
