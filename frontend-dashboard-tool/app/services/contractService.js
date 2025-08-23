'use client';

import { ethers } from 'ethers';

// Dynamic import for contract artifact with fallback
let CreationsArtifact = null;
try {
  // Try to import the compiled artifact
  CreationsArtifact = require('../../../bc-backend/artifacts/contracts/Creations.sol/Creations.json');
} catch (error) {
  console.warn('Contract artifact not found. Please compile the smart contracts first.');
  // Fallback to a minimal ABI for development
  CreationsArtifact = {
    abi: [
      // Basic ERC721 functions
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function tokenURI(uint256 tokenId) view returns (string)",
      "function ownerOf(uint256 tokenId) view returns (address)",
      "function balanceOf(address owner) view returns (uint256)",
      "function totalSupply() view returns (uint256)",
      // Custom contract functions
      "function mintNFT(string memory metadataURI, string memory license, uint256 price) external returns (uint256)",
      "function purchaseNFT(uint256 tokenId) external payable",
      "function getTokenPrice(uint256 tokenId) view returns (uint256)",
      "function getTokenLicense(uint256 tokenId) view returns (string)",
      "function getTokenOwner(uint256 tokenId) view returns (address)",
      "function getAllTokens() view returns (uint256[])",
      "function getTokensByOwner(address owner) view returns (uint256[])"
    ]
  };
}

const DEFAULT_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CREATIONS_ADDRESS || '';

function getBrowserProvider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum, 'any');
  }
  return null;
}

function getJsonRpcProvider() {
  return new ethers.providers.JsonRpcProvider(DEFAULT_RPC_URL);
}

export function getReadOnlyContract() {
  if (!CONTRACT_ADDRESS) {
    console.warn('⚠️  Contract address not configured:');
    console.warn('   - Set NEXT_PUBLIC_CREATIONS_ADDRESS in your environment');
    console.warn('   - Deploy the contract first: npx hardhat deploy');
    throw new Error('Missing NEXT_PUBLIC_CREATIONS_ADDRESS - Please configure contract address');
  }
  const provider = getJsonRpcProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CreationsArtifact.abi, provider);
}

export async function getSignerContract() {
  if (!CONTRACT_ADDRESS) {
    console.warn('⚠️  Contract address not configured:');
    console.warn('   - Set NEXT_PUBLIC_CREATIONS_ADDRESS in your environment');
    console.warn('   - Deploy the contract first: npx hardhat deploy');
    throw new Error('Missing NEXT_PUBLIC_CREATIONS_ADDRESS - Please configure contract address');
  }
  const web3 = getBrowserProvider();
  if (!web3) throw new Error('No injected provider found');
  await web3.send('eth_requestAccounts', []);
  const signer = web3.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CreationsArtifact.abi, signer);
}

export async function mintCreation(metadataIpfsHash, license = 'free') {
  const contract = await getSignerContract();
  const metadataURI = metadataIpfsHash.startsWith('ipfs://')
    ? metadataIpfsHash
    : `ipfs://${metadataIpfsHash}`;
  
  const tx = await contract.mintNFT(metadataURI, license);
  const receipt = await tx.wait();
  return { txHash: tx.hash, receipt };
}



export async function fetchMyCreations(ownerAddress) {
  try {
    console.log('=== CONTRACT SERVICE: fetchMyCreations ===');
    console.log('Owner address:', ownerAddress);
    console.log('Contract address:', CONTRACT_ADDRESS);
    
    const contract = getReadOnlyContract();
    console.log('Contract instance created');
    
    console.log('Calling contract.fetchNFTsByOwner()...');
    const [ids, uris, creators, timestamps, licenses] = await contract.fetchNFTsByOwner(ownerAddress);
    
    console.log('Raw contract response:');
    console.log('IDs:', ids);
    console.log('URIs:', uris);
    console.log('Creators:', creators);
    console.log('Timestamps:', timestamps);
    console.log('Licenses:', licenses);
    
    const mappedCreations = ids.map((id, idx) => ({
      tokenId: id.toString(),
      tokenURI: uris[idx],
      creator: creators[idx],
      createdAt: timestamps[idx].toNumber(),
      license: licenses[idx],
    }));
    
    console.log('Mapped creations:', mappedCreations);
    return mappedCreations;
  } catch (error) {
    console.error('Error in fetchMyCreations:', error);
    throw error;
  }
}

export async function fetchAllCreations() {
  try {
    console.log('=== CONTRACT SERVICE: fetchAllCreations ===');
    console.log('Contract address:', CONTRACT_ADDRESS);
    console.log('RPC URL:', DEFAULT_RPC_URL);
    
    const contract = getReadOnlyContract();
    console.log('Contract instance created');
    
    console.log('Calling contract.fetchAllCreations()...');
    const [ids, uris, owners, creators, timestamps, licenses] = await contract.fetchAllCreations();
    
    console.log('Raw contract response:');
    console.log('IDs:', ids);
    console.log('URIs:', uris);
    console.log('Owners:', owners);
    console.log('Creators:', creators);
    console.log('Timestamps:', timestamps);
    console.log('Licenses:', licenses);
    
    const mappedCreations = ids.map((id, idx) => ({
      tokenId: id.toString(),
      tokenURI: uris[idx],
      owner: owners[idx],
      creator: creators[idx],
      createdAt: timestamps[idx].toNumber(),
      license: licenses[idx],
    }));
    
    console.log('Mapped creations:', mappedCreations);
    return mappedCreations;
  } catch (error) {
    console.error('Error in fetchAllCreations:', error);
    throw error;
  }
}
