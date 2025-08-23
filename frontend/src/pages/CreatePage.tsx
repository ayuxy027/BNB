import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const CreatePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);

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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock generated image - in real implementation this would come from your AI service
    const mockImages = [
      "https://images.unsplash.com/photo-1562619371-b67725b6fde2?q=80&w=600&h=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1633983482450-bfb7b566fe6a?q=80&w=600&h=600&auto=format&fit=crop",
      "https://plus.unsplash.com/premium_photo-1671209879721-3082e78307e3?q=80&w=600&h=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&h=600&auto=format&fit=crop"
    ];
    
    const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
    setGeneratedImage(randomImage);
    setIsGenerating(false);
  };

  const handleMint = async () => {
    if (!generatedImage) return;
    
    setIsMinting(true);
    
    // Simulate IPFS upload and smart contract interaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock IPFS upload
    console.log('Uploading to IPFS...');
    const ipfsHash = 'QmX' + Math.random().toString(36).substring(2, 15);
    console.log('IPFS Hash:', ipfsHash);
    
    // Mock smart contract mint
    console.log('Minting NFT...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsMinting(false);
    setMintSuccess(true);
    
    // Reset after showing success
    setTimeout(() => {
      setMintSuccess(false);
      setGeneratedImage(null);
      setPrompt('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Create Your Masterpiece</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your ideas into stunning AI-generated images and mint them as unique NFTs on the blockchain.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generate Image</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your creation
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A futuristic cityscape with neon lights and flying cars..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isGenerating}
                />
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  !prompt.trim() || isGenerating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </div>
                ) : (
                  'Generate Image'
                )}
              </button>
            </div>
          </div>

          {/* Generated Image */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Creation</h2>
            
            {!generatedImage ? (
              <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">No image generated yet</p>
                  <p className="text-sm">Enter a prompt and click generate to create your masterpiece</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={generatedImage}
                    alt="Generated creation"
                    className="w-full h-80 object-cover"
                  />
                </div>
                
                <button
                  onClick={handleMint}
                  disabled={isMinting}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    isMinting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isMinting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Minting NFT...
                    </div>
                  ) : (
                    'Mint as NFT'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {mintSuccess && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">NFT Minted Successfully!</h3>
              <p className="text-gray-600 mb-4">
                Your creation has been uploaded to IPFS and minted as an NFT on the blockchain.
              </p>
              <button
                onClick={() => setMintSuccess(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Continue Creating
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePage;
