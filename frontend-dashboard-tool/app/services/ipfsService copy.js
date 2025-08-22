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
      console.log('Starting IPFS upload...');
      console.log('Image URL:', imageUrl);
      console.log('Metadata:', metadata);

      // Check if we have Pinata credentials
      if (!this.pinataJWT && (!this.pinataApiKey || !this.pinataSecretApiKey)) {
        throw new Error('Missing Pinata credentials. Please set NEXT_PUBLIC_PINATA_JWT or both NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_API_KEY');
      }

      // First, fetch the image from the URL
      console.log('Fetching image from URL...');
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const imageBlob = await response.blob();
      console.log('Image blob size:', imageBlob.size, 'bytes');
      
      // Create form data for Pinata
      const formData = new FormData();
      formData.append('file', imageBlob, 'image1.png');

      // Upload image to Pinata
      console.log('Uploading image to Pinata...');
      const imageUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`,
        },
        body: formData,
      });

      if (!imageUploadResponse.ok) {
        const errorText = await imageUploadResponse.text();
        console.error('Image upload failed:', errorText);
        throw new Error(`Failed to upload image to IPFS: ${imageUploadResponse.status} ${imageUploadResponse.statusText}`);
      }

      const imageResult = await imageUploadResponse.json();
      console.log('Image upload result:', imageResult);
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

      console.log('Uploading metadata to Pinata...');
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
        const errorText = await metadataUploadResponse.text();
        console.error('Metadata upload failed:', errorText);
        throw new Error(`Failed to upload metadata to IPFS: ${metadataUploadResponse.status} ${metadataUploadResponse.statusText}`);
      }

      const metadataResult = await metadataUploadResponse.json();
      console.log('Metadata upload result:', metadataResult);
      const metadataHash = metadataResult.IpfsHash;

      const result = {
        success: true,
        imageHash: imageHash,
        metadataHash: metadataHash,
        imageUrl: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
        metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
        metadata: metadataJSON
      };

      console.log('IPFS upload completed successfully:', result);
      return result;

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
      console.log('Starting IPFS upload with API key...');
      
      if (!this.pinataApiKey || !this.pinataSecretApiKey) {
        throw new Error('Missing Pinata API credentials');
      }

      // First, fetch the image from the URL
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const imageBlob = await response.blob();
      console.log('Image blob size:', imageBlob.size, 'bytes');
      
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
        const errorText = await imageUploadResponse.text();
        console.error('Image upload failed:', errorText);
        throw new Error(`Failed to upload image to IPFS: ${imageUploadResponse.status} ${imageUploadResponse.statusText}`);
      }

      const imageResult = await imageUploadResponse.json();
      console.log('Image upload result:', imageResult);
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
        const errorText = await metadataUploadResponse.text();
        console.error('Metadata upload failed:', errorText);
        throw new Error(`Failed to upload metadata to IPFS: ${metadataUploadResponse.status} ${metadataUploadResponse.statusText}`);
      }

      const metadataResult = await metadataUploadResponse.json();
      console.log('Metadata upload result:', metadataResult);
      const metadataHash = metadataResult.IpfsHash;

      const result = {
        success: true,
        imageHash: imageHash,
        metadataHash: metadataHash,
        imageUrl: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
        metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
        metadata: metadataJSON
      };

      console.log('IPFS upload completed successfully:', result);
      return result;

    } catch (error) {
      console.error('IPFS upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test method to check Pinata credentials
  async testConnection() {
    try {
      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Pinata connection test successful:', result);
        return { success: true, message: 'Pinata connection successful' };
      } else {
        const errorText = await response.text();
        console.error('Pinata connection test failed:', errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error('Pinata connection test error:', error);
      return { success: false, error: error.message };
    }
  }
}

export const ipfsService = new IPFSService();
