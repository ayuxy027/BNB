'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useWallet } from '../providers/WalletProvider';
import { ipfsService } from '../services/ipfsService';
import { mintCreation } from '../services/contractService';

export default function Create() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [mood, setMood] = useState('neutral');
  const [license, setLicense] = useState('free');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [ipfsResult, setIpfsResult] = useState(null);
  const [txResult, setTxResult] = useState(null);
  const [showTestResults, setShowTestResults] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const { isConnected, walletAddress } = useWallet();

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    
    if (!prompt.trim()) {
      alert('Please enter a prompt description!');
      return;
    }
    
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImage(null);
    
    try {
      // Prepare the API request
      const apiUrl = 'https://887mg17t-3000.inc1.devtunnels.ms/api/generate-image';
      const requestBody = {
        query: prompt,
        type: `${style}-${mood}`
      };

      console.log('Calling AI generation API:', apiUrl);
      console.log('Request body:', requestBody);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API response:', result);

      if (!result.originalImage || !result.watermarkedImage) {
        throw new Error('No image data received from API');
      }

      // Store both images from API response
      const imageData = {
        originalImage: `data:image/png;base64,${result.originalImage}`,
        watermarkedImage: `data:image/png;base64,${result.watermarkedImage}`,
        enhancedPrompt: result.enhancedPrompt,
        mimeType: result.mimeType
      };
      setGeneratedImage(imageData);
      
      console.log('Image generated successfully');
      
    } catch (error) {
      console.error('Image generation error:', error);
      setGenerationError(error.message);
      alert(`Failed to generate image: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMint = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    if (!generatedImage) {
      alert('Please generate an image first!');
      return;
    }
    
    setIsMinting(true);
    setIpfsResult(null);
    setTxResult(null);
    setShowTestResults(false);
    
    try {
      // Prepare metadata for IPFS upload
      const metadata = {
        name: `AI Generated Art - ${prompt.substring(0, 30)}...`,
        description: prompt,
        style: style,
        mood: mood,
        license: license,
        creator: walletAddress,
        prompt: prompt,
        creationDate: new Date().toISOString()
      };

      console.log('Uploading generated images to IPFS...');
      console.log('Image data type:', typeof generatedImage);
      console.log('Original image preview:', generatedImage.originalImage.substring(0, 50) + '...');
      console.log('Watermarked image preview:', generatedImage.watermarkedImage.substring(0, 50) + '...');
      console.log('Metadata:', metadata);

      // Upload to IPFS via Pinata - pass both images and metadata
      const result = await ipfsService.uploadDualImagesToIPFS(generatedImage, metadata);
      
      if (!result.success) {
        alert(`IPFS upload failed: ${result.error}`);
        return;
      }

      setIpfsResult(result);
      console.log('IPFS upload successful:', result);

      // Call smart contract mint with metadata hash and license
      console.log('Minting NFT with metadata hash:', result.metadataHash, 'license:', license);
      const mint = await mintCreation(result.metadataHash, license);
      setTxResult({
        txHash: mint.txHash,
        blockNumber: mint.receipt.blockNumber,
      });

      setShowTestResults(true);
      alert('NFT minted successfully!');
    } catch (error) {
      console.error('Minting error:', error);
      alert(error?.message || 'Failed to mint NFT. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">
            Create Your AI Masterpiece
          </h1>
          <p className="text-gray-600 text-lg">
            Generate unique images with AI and mint them as NFTs
          </p>
          {!isConnected && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                ⚠️ Please connect your wallet to create and mint NFTs.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Creation Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold text-black mb-6">Generation Settings</h2>
            
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black bg-white placeholder-gray-500"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                  >
                    <option value="realistic">Realistic</option>
                    <option value="artistic">Artistic</option>
                    <option value="cartoon">Cartoon</option>
                    <option value="abstract">Abstract</option>
                    <option value="cyberpunk">Cyberpunk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="happy">Happy</option>
                    <option value="mysterious">Mysterious</option>
                    <option value="dramatic">Dramatic</option>
                    <option value="peaceful">Peaceful</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Licensing
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="free"
                      checked={license === 'free'}
                      onChange={(e) => setLicense(e.target.value)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Free to use</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="paid"
                      checked={license === 'paid'}
                      onChange={(e) => setLicense(e.target.value)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Paid license</span>
                  </label>
                </div>
              </div>



              <button
                type="submit"
                disabled={isGenerating || !prompt.trim() || !isConnected}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </button>
            </form>

            {generationError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  Generation error: {generationError}
                </p>
              </div>
            )}
          </div>

          {/* Generated Image Preview */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold text-black mb-6">Generated Image</h2>
            
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              {isGenerating ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating your image...</p>
                </div>
              ) : generatedImage ? (
                <div className="w-full h-full">
                  <img
                    src={typeof generatedImage === 'string' ? generatedImage : generatedImage.originalImage}
                    alt="Generated image"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {typeof generatedImage === 'object' && (
                    <div className="mt-2 text-xs text-gray-500">
                      <p>License: <span className="font-medium">{license}</span></p>
                    </div>
                  )}
                  <div className="mt-4">
                    <button
                      onClick={handleMint}
                      disabled={isMinting || !isConnected}
                      className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isMinting ? 'Uploading & Minting...' : 'Mint as NFT'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p>Your generated image will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Results Container */}
        {showTestResults && (ipfsResult || txResult) && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold text-black mb-4">Mint Test Results</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">User Information</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Wallet Address:</span> {walletAddress}
                    </p>
                  </div>
                </div>
                {txResult && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Transaction</h3>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm text-green-800 break-all">
                        <span className="font-medium">Tx Hash:</span> {txResult.txHash}
                      </p>
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Block:</span> {txResult.blockNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {ipfsResult && (
                <>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">IPFS Hashes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Image Hash:</span> {ipfsResult.imageHash}
                        </p>
                        <a 
                          href={ipfsResult.imageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View Image on IPFS
                        </a>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <p className="text-sm text-purple-800">
                          <span className="font-medium">Metadata Hash:</span> {ipfsResult.metadataHash}
                        </p>
                        <a 
                          href={ipfsResult.metadataUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline text-xs"
                        >
                          View Metadata on IPFS
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Metadata Preview</h3>
                    <div className="bg-gray-50 p-3 rounded">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(ipfsResult.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setShowTestResults(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Hide Test Results
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
