'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const WalletContext = createContext(null);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export default function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    if (typeof window === 'undefined') return;
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0] || '');
        setIsConnected(Boolean(accounts[0]));
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setIsConnected(false);
    
    // Clear any stored wallet data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) {
        setWalletAddress('');
        setIsConnected(false);
        // Clear stored data when accounts change to empty
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
      } else {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        // Store connection state
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', accounts[0]);
      }
    };

    const handleDisconnect = () => {
      setWalletAddress('');
      setIsConnected(false);
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
    };

    // Check for existing connection on mount
    const checkExistingConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          localStorage.setItem('walletConnected', 'true');
          localStorage.setItem('walletAddress', accounts[0]);
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    };

    checkExistingConnection();

    // Listen for account changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    // Listen for disconnect events
    window.ethereum.on('disconnect', handleDisconnect);
    window.ethereum.on('chainChanged', () => {
      // Optionally handle chain changes
      window.location.reload();
    });

    return () => {
      try { 
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
        window.ethereum.removeListener('chainChanged', () => {});
      } catch {}
    };
  }, []);

  const value = { walletAddress, isConnected, connectWallet, disconnectWallet };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
