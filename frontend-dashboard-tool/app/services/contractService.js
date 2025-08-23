'use client';

import { ethers } from 'ethers';
// Import compiled artifact directly from backend (dev-only). Adjust path if needed.
import CreationsArtifact from '../../../bc-backend/artifacts/contracts/Creations.sol/Creations.json';

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
  if (!CONTRACT_ADDRESS) throw new Error('Missing NEXT_PUBLIC_CREATIONS_ADDRESS');
  const provider = getJsonRpcProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CreationsArtifact.abi, provider);
}

export async function getSignerContract() {
  if (!CONTRACT_ADDRESS) throw new Error('Missing NEXT_PUBLIC_CREATIONS_ADDRESS');
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
