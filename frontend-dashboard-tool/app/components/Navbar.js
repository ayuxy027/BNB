'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '../providers/WalletProvider';

export default function Navbar() {
  const { walletAddress, isConnected, connectWallet, disconnectWallet } = useWallet();
  const router = useRouter();

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDisconnect = () => {
    disconnectWallet();
    // Optionally redirect to home page after disconnect
    router.push('/');
  };

  useEffect(() => {}, []);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-black">
          Web3 AI Creator
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-black hover:text-gray-600 transition-colors">
            Home
          </Link>
          <Link href="/create" className="text-black hover:text-gray-600 transition-colors">
            Create
          </Link>
          <Link href="/profile" className="text-black hover:text-gray-600 transition-colors">
            Profile
          </Link>
          
          <div className="ml-4">
            {isConnected && walletAddress ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {shortenAddress(walletAddress)}
                </span>
                <button
                  onClick={handleDisconnect}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
