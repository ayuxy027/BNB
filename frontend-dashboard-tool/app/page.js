import Navbar from './components/Navbar';
import CreationCard from './components/CreationCard';

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

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">
            Discover Amazing AI Creations
          </h1>
          <p className="text-gray-600 text-lg">
            Explore unique AI-generated images created by the community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCreations.map((creation) => (
            <CreationCard key={creation.id} creation={creation} />
          ))}
        </div>
      </main>
    </div>
  );
}
