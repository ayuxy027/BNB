// IPFS Service for Pinata integration
// Note: You'll need to add your Pinata API key to environment variables

export class IPFSService {
  constructor() {
    this.pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    this.pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;
    this.pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
  }

  // Upload image to IPFS via Pinata
  async uploadImageToIPFS(imageUrl, metadata) {
    try {
      // First, fetch the image from the URL
      const response = await fetch(imageUrl);
      const imageBlob = await response.blob();
      
      // Create form data for Pinata
      const formData = new FormData();
      formData.append('file', imageBlob, 'image.png');

      // Upload image to Pinata
      const imageUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`,
        },
        body: formData,
      });

      if (!imageUploadResponse.ok) {
        throw new Error('Failed to upload image to IPFS');
      }

      const imageResult = await imageUploadResponse.json();
      const imageHash = imageResult.IpfsHash;

      // Create metadata JSON
      const metadataJSON = {
        name: metadata.name || "AI Generated Art",
        description: metadata.description || "Unique AI-generated artwork",
        image: `ipfs://${imageHash}`,
        attributes: [
          {
            trait_type: "Style",
            value: metadata.style || "realistic"
          },
          {
            trait_type: "Mood",
            value: metadata.mood || "neutral"
          },
          {
            trait_type: "License",
            value: metadata.license || "free"
          },
          {
            trait_type: "Creator",
            value: metadata.creator || "Unknown"
          },
          {
            trait_type: "Creation Date",
            value: new Date().toISOString()
          }
        ],
        external_url: "https://web3-ai-creator.vercel.app",
        ...metadata
      };

      // Upload metadata to IPFS
      const metadataUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pinataJWT}`,
        },
        body: JSON.stringify(metadataJSON),
      });

      if (!metadataUploadResponse.ok) {
        throw new Error('Failed to upload metadata to IPFS');
      }

      const metadataResult = await metadataUploadResponse.json();
      const metadataHash = metadataResult.IpfsHash;

      return {
        success: true,
        imageHash: imageHash,
        metadataHash: metadataHash,
        imageUrl: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
        metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
        metadata: metadataJSON
      };

    } catch (error) {
      console.error('IPFS upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Alternative method using Pinata API key (if JWT is not available)
  async uploadImageToIPFSWithAPIKey(imageUrl, metadata) {
    try {
      // First, fetch the image from the URL
      const response = await fetch(imageUrl);
      const imageBlob = await response.blob();
      
      // Create form data for Pinata
      const formData = new FormData();
      formData.append('file', imageBlob, 'image.png');

      // Upload image to Pinata
      const imageUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretApiKey,
        },
        body: formData,
      });

      if (!imageUploadResponse.ok) {
        throw new Error('Failed to upload image to IPFS');
      }

      const imageResult = await imageUploadResponse.json();
      const imageHash = imageResult.IpfsHash;

      // Create metadata JSON
      const metadataJSON = {
        name: metadata.name || "AI Generated Art",
        description: metadata.description || "Unique AI-generated artwork",
        image: `ipfs://${imageHash}`,
        attributes: [
          {
            trait_type: "Style",
            value: metadata.style || "realistic"
          },
          {
            trait_type: "Mood",
            value: metadata.mood || "neutral"
          },
          {
            trait_type: "License",
            value: metadata.license || "free"
          },
          {
            trait_type: "Creator",
            value: metadata.creator || "Unknown"
          },
          {
            trait_type: "Creation Date",
            value: new Date().toISOString()
          }
        ],
        external_url: "https://web3-ai-creator.vercel.app",
        ...metadata
      };

      // Upload metadata to IPFS
      const metadataUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretApiKey,
        },
        body: JSON.stringify(metadataJSON),
      });

      if (!metadataUploadResponse.ok) {
        throw new Error('Failed to upload metadata to IPFS');
      }

      const metadataResult = await metadataUploadResponse.json();
      const metadataHash = metadataResult.IpfsHash;

      return {
        success: true,
        imageHash: imageHash,
        metadataHash: metadataHash,
        imageUrl: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
        metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
        metadata: metadataJSON
      };

    } catch (error) {
      console.error('IPFS upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const ipfsService = new IPFSService();
