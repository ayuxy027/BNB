import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

// Mock user data
const mockUser = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  joinDate: "March 2024",
  totalCreations: 12,
  followers: 156,
  following: 89
};

// Mock creations data
const mockCreations = [
  {
    id: 1,
    title: "Cosmic Dreamer",
    image: "https://images.unsplash.com/photo-1562619371-b67725b6fde2?q=80&w=400&h=400&auto=format&fit=crop",
    createdAt: "2024-03-15",
    likes: 24,
    views: 156
  },
  {
    id: 2,
    title: "Neon Cityscape",
    image: "https://images.unsplash.com/photo-1633983482450-bfb7b566fe6a?q=80&w=400&h=400&auto=format&fit=crop",
    createdAt: "2024-03-10",
    likes: 18,
    views: 89
  },
  {
    id: 3,
    title: "Abstract Harmony",
    image: "https://plus.unsplash.com/premium_photo-1671209879721-3082e78307e3?q=80&w=400&h=400&auto=format&fit=crop",
    createdAt: "2024-03-05",
    likes: 31,
    views: 203
  },
  {
    id: 4,
    title: "Digital Forest",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=400&h=400&auto=format&fit=crop",
    createdAt: "2024-02-28",
    likes: 15,
    views: 67
  }
];

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('creations');

  useEffect(() => {
    // Add Poppins font
    const id = 'poppins-font-link';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
      document.head.appendChild(link);
    }
    document.body.style.fontFamily = "'Poppins', sans-serif";
    return () => {
      document.body.style.fontFamily = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8 md:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {mockUser.name.charAt(0)}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">{mockUser.name}</h1>
              <p className="text-gray-600 mb-3">{mockUser.email}</p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>Joined {mockUser.joinDate}</span>
                <span>•</span>
                <span>{mockUser.totalCreations} creations</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">{mockUser.followers}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">{mockUser.following}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
            </div>
          </div>
          
          {/* Wallet Address */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Wallet:</span>
              <code className="bg-white px-2 py-1 rounded text-gray-700 font-mono">
                {mockUser.walletAddress.slice(0, 6)}...{mockUser.walletAddress.slice(-4)}
              </code>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('creations')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'creations'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                My Creations ({mockCreations.length})
              </button>
              <button
                onClick={() => setActiveTab('liked')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'liked'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Liked Creations
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'creations' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockCreations.map((creation) => (
                  <div key={creation.id} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src={creation.image}
                        alt={creation.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                    </div>
                    <div className="mt-3">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {creation.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{creation.createdAt}</span>
                        <span>•</span>
                        <span>{creation.likes} likes</span>
                        <span>•</span>
                        <span>{creation.views} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'liked' && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No liked creations yet</h3>
                <p className="text-gray-500">Start exploring and liking other creators' work!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
