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
    const { ethereum } = window;
    if (!ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    try {
      // Force the permissions dialog so the user can pick an account every time
      await ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0] || '');
      setIsConnected(Boolean(accounts[0]));
      if (accounts[0]) {
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    // Revoke site permission so next connect triggers MetaMask popup
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
      }
    } catch (e) {
      // Some wallets may not support revoke; ignore
    }

    setWalletAddress('');
    setIsConnected(false);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const { ethereum } = window;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) {
        setWalletAddress('');
        setIsConnected(false);
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
      } else {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
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

    // Only reflect current permission without auto-connecting silently
    (async () => {
      try {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          localStorage.setItem('walletConnected', 'true');
          localStorage.setItem('walletAddress', accounts[0]);
        }
      } catch {}
    })();

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('disconnect', handleDisconnect);

    return () => {
      try {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('disconnect', handleDisconnect);
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
