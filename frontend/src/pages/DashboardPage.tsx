import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

// Mock data for all users' creations (in real app, this would be fetched from IPFS)
const mockAllCreations = [
    {
        id: 1,
        title: "Cosmic Dreamer",
        creator: "Alex Johnson",
        creatorAvatar: "AJ",
        image: "https://images.unsplash.com/photo-1562619371-b67725b6fde2?q=80&w=400&h=400&auto=format&fit=crop",
        createdAt: "2024-03-15",
        likes: 24,
        views: 156,
        price: "0.05 ETH"
    },
    {
        id: 2,
        title: "Neon Cityscape",
        creator: "Sarah Chen",
        creatorAvatar: "SC",
        image: "https://images.unsplash.com/photo-1633983482450-bfb7b566fe6a?q=80&w=400&h=400&auto=format&fit=crop",
        createdAt: "2024-03-14",
        likes: 18,
        views: 89,
        price: "0.03 ETH"
    },
    {
        id: 3,
        title: "Abstract Harmony",
        creator: "Mike Rodriguez",
        creatorAvatar: "MR",
        image: "https://plus.unsplash.com/premium_photo-1671209879721-3082e78307e3?q=80&w=400&h=400&auto=format&fit=crop",
        createdAt: "2024-03-13",
        likes: 31,
        views: 203,
        price: "0.08 ETH"
    },
    {
        id: 4,
        title: "Digital Forest",
        creator: "Emma Wilson",
        creatorAvatar: "EW",
        image: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=400&h=400&auto=format&fit=crop",
        createdAt: "2024-03-12",
        likes: 15,
        views: 67,
        price: "0.04 ETH"
    },
    {
        id: 5,
        title: "Ocean Depths",
        creator: "David Kim",
        creatorAvatar: "DK",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400&h=400&auto=format&fit=crop",
        createdAt: "2024-03-11",
        likes: 42,
        views: 289,
        price: "0.12 ETH"
    },
    {
        id: 6,
        title: "Mountain Peak",
        creator: "Lisa Thompson",
        creatorAvatar: "LT",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400&h=400&auto=format&fit=crop",
        createdAt: "2024-03-10",
        likes: 28,
        views: 145,
        price: "0.06 ETH"
    }
];

const DashboardPage: React.FC = () => {
    const [creations, setCreations] = useState(mockAllCreations);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('latest');

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

    const handleLike = (id: number) => {
        setCreations(prev => prev.map(creation =>
            creation.id === id
                ? { ...creation, likes: creation.likes + 1 }
                : creation
        ));
    };

    const handleBuy = (id: number) => {
        console.log(`Buying creation ${id}`);
        // In real implementation, this would trigger a transaction
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-semibold text-gray-900 mb-4">Discover Amazing Creations</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Explore unique AI-generated artworks from creators around the world, all stored securely on IPFS.
                    </p>
                </div>

                {/* Filters and Stats */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">Filter:</span>
                            <div className="flex gap-2">
                                {['all', 'trending', 'recent', 'popular'].map((filterOption) => (
                                    <button
                                        key={filterOption}
                                        onClick={() => setFilter(filterOption)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === filterOption
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="latest">Latest</option>
                                <option value="popular">Most Popular</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Creations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creations.map((creation) => (
                        <div key={creation.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            {/* Image */}
                            <div className="relative overflow-hidden bg-gray-100">
                                <img
                                    src={creation.image}
                                    alt={creation.title}
                                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-4 right-4">
                                    <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        {creation.price}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                        {creation.title}
                                    </h3>
                                </div>

                                {/* Creator Info */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {creation.creatorAvatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{creation.creator}</p>
                                        <p className="text-xs text-gray-500">{creation.createdAt}</p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>{creation.views} views</span>
                                        <span>•</span>
                                        <span>{creation.likes} likes</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleLike(creation.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 006.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        Like
                                    </button>
                                    <button
                                        onClick={() => handleBuy(creation.id)}
                                        className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Buy NFT
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More Button */}
                <div className="text-center mt-12">
                    <button className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-lg font-medium border border-gray-300 transition-colors">
                        Load More Creations
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
