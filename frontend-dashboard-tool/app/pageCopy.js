'use client';

import Navbar from './components/Navbar';
import CreationCard from './components/CreationCard';
import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';

// Mock data for creations
const mockCreations = [
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
    prompt: "A serene mountain landscape at sunset",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    creator: "0x8765...4321",
    date: "2024-01-14",
    tags: ["nature", "mountains", "sunset"],
    license: "paid",
    price: "0.05"
  },
  {
    id: 3,
    prompt: "Abstract digital art with geometric patterns",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    creator: "0xabcd...efgh",
    date: "2024-01-13",
    tags: ["abstract", "geometric", "digital"],
    license: "free",
    price: null
  },
  {
    id: 4,
    prompt: "A magical forest with glowing mushrooms",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop",
    creator: "0x9876...5432",
    date: "2024-01-12",
    tags: ["magical", "forest", "fantasy"],
    license: "paid",
    price: "0.1"
  },
  {
    id: 5,
    prompt: "Cyberpunk street scene with rain",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop",
    creator: "0x5678...1234",
    date: "2024-01-11",
    tags: ["cyberpunk", "street", "rain"],
    license: "free",
    price: null
  },
  {
    id: 6,
    prompt: "Underwater coral reef with tropical fish",
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop",
    creator: "0xefgh...abcd",
    date: "2024-01-10",
    tags: ["underwater", "coral", "tropical"],
    license: "paid",
    price: "0.03"
  }
];

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
  // State management
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [creations, setCreations] = useState(mockCreations);
  const router = useRouter();

  // Memoized filtered creations
  const filteredCreations = useFilteredCreations(creations, activeFilter);

  // Memoized search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return filteredCreations;
    
    const query = searchQuery.toLowerCase();
    return filteredCreations.filter(creation => 
      creation.prompt.toLowerCase().includes(query) ||
      creation.creator.toLowerCase().includes(query) ||
      creation.tags.some(tag => tag.toLowerCase().includes(query))
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
                >
                  {config.label}
                </FilterButton>
              ))}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {searchQuery && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Search results for "{searchQuery}": {searchResults.length} items found
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
          {searchResults.map((creation) => (
            <CreationCard key={creation.id} creation={creation} />
          ))}
        </div>

        {/* Empty State */}
        {searchResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No results found for your search.' : 'No items to display.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}