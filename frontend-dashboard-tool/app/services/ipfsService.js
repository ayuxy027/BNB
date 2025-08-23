// IPFS Service for Pinata integration
// Note: You'll need to add your Pinata API key to environment variables

export class IPFSService {
  constructor() {
    this.pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    this.pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;
    this.pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
    
    // Validate configuration
    this.validateConfiguration();
  }

  validateConfiguration() {
    const hasJWT = !!this.pinataJWT;
    const hasApiKeys = !!(this.pinataApiKey && this.pinataSecretApiKey);
    
    if (!hasJWT && !hasApiKeys) {
      console.warn('⚠️  IPFS Configuration Missing:');
      console.warn('   - Set NEXT_PUBLIC_PINATA_JWT for JWT authentication (recommended)');
      console.warn('   - Or set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_API_KEY');
      console.warn('   - IPFS uploads will fail without proper configuration');
      console.warn('   - Get credentials from: https://app.pinata.cloud/');
    } else if (hasJWT) {
      console.log('✅ IPFS configured with JWT token');
    } else if (hasApiKeys) {
      console.log('✅ IPFS configured with API keys');
    }
  }

  // Generate a unique identifier for this creation
  generateCreationId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `creation-${timestamp}-${random}`;
  }

  // Create a clean filename from prompt
  sanitizeFilename(prompt) {
    return prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .substring(0, 50); // Limit length
  }

  // Upload image to IPFS via Pinata
  async uploadImageToIPFS(imageData, metadata) {
    try {
      console.log('Starting IPFS upload...');
      console.log('Image data type:', typeof imageData);
      console.log('Metadata:', metadata);

      // Check if we have Pinata credentials
      if (!this.pinataJWT && (!this.pinataApiKey || !this.pinataSecretApiKey)) {
        throw new Error('Missing Pinata credentials. Please set NEXT_PUBLIC_PINATA_JWT or both NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_API_KEY');
      }

      // Generate unique creation ID and filenames
      const creationId = this.generateCreationId();
      const sanitizedPrompt = this.sanitizeFilename(metadata.description || 'ai-generated');
      const imageFileName = `${creationId}-image-${sanitizedPrompt}.png`;
      const metadataFileName = `${creationId}-metadata-${sanitizedPrompt}.json`;

      console.log('Creation ID:', creationId);
      console.log('Image filename:', imageFileName);
      console.log('Metadata filename:', metadataFileName);

      let imageBlob;

      // Handle different image data types
      if (typeof imageData === 'string') {
        if (imageData.startsWith('data:image/')) {
          // Base64 data URL
          console.log('Processing base64 data URL...');
          const response = await fetch(imageData);
          imageBlob = await response.blob();
        } else if (imageData.startsWith('http')) {
          // URL
          console.log('Fetching image from URL...');
          const response = await fetch(imageData);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }
          
          imageBlob = await response.blob();
        } else {
          throw new Error('Invalid image data format');
        }
      } else if (imageData instanceof Blob) {
        // Blob object
        imageBlob = imageData;
      } else {
        throw new Error('Unsupported image data type');
      }

      console.log('Image blob size:', imageBlob.size, 'bytes');
      
      // Create form data for Pinata with proper filename
      const formData = new FormData();
      formData.append('file', imageBlob, imageFileName);

      // Add metadata to the file upload for better tracking
      const pinataMetadata = {
        name: imageFileName,
        keyvalues: {
          creationId: creationId,
          type: 'ai-generated-image',
          prompt: metadata.description || 'AI Generated Art',
          creator: metadata.creator || 'Unknown',
          style: metadata.style || 'realistic',
          mood: metadata.mood || 'neutral'
        }
      };
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

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

      // Create metadata JSON with proper structure and tracking
      const metadataJSON = {
        name: metadata.name || `AI Generated Art - ${metadata.description?.substring(0, 30)}...`,
        description: metadata.description || "Unique AI-generated artwork",
        image: `ipfs://${imageHash}`,
        creationId: creationId,
        imageFileName: imageFileName,
        metadataFileName: metadataFileName,
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
          },
          {
            trait_type: "Creation ID",
            value: creationId
          }
        ],
        external_url: "https://web3-ai-creator.vercel.app",
        ...metadata
      };

      console.log('Uploading metadata to Pinata...');
      console.log('Metadata file name:', metadataFileName);
      
      // Upload metadata to IPFS with proper metadata
      const metadataUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pinataJWT}`,
        },
        body: JSON.stringify({
          pinataMetadata: {
            name: metadataFileName,
            keyvalues: {
              creationId: creationId,
              type: 'ai-generated-metadata',
              prompt: metadata.description || 'AI Generated Art',
              creator: metadata.creator || 'Unknown',
              imageHash: imageHash,
              style: metadata.style || 'realistic',
              mood: metadata.mood || 'neutral'
            }
          },
          pinataContent: metadataJSON
        }),
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
        creationId: creationId,
        imageHash: imageHash,
        metadataHash: metadataHash,
        imageUrl: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
        metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
        metadata: metadataJSON,
        fileName: imageFileName,
        metadataFileName: metadataFileName
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
  async uploadImageToIPFSWithAPIKey(imageData, metadata) {
    try {
      console.log('Starting IPFS upload with API key...');
      
      if (!this.pinataApiKey || !this.pinataSecretApiKey) {
        throw new Error('Missing Pinata API credentials');
      }

      // Generate unique creation ID and filenames
      const creationId = this.generateCreationId();
      const sanitizedPrompt = this.sanitizeFilename(metadata.description || 'ai-generated');
      const imageFileName = `${creationId}-image-${sanitizedPrompt}.png`;
      const metadataFileName = `${creationId}-metadata-${sanitizedPrompt}.json`;

      console.log('Creation ID:', creationId);
      console.log('Image filename:', imageFileName);
      console.log('Metadata filename:', metadataFileName);

      let imageBlob;

      // Handle different image data types
      if (typeof imageData === 'string') {
        if (imageData.startsWith('data:image/')) {
          // Base64 data URL
          console.log('Processing base64 data URL...');
          const response = await fetch(imageData);
          imageBlob = await response.blob();
        } else if (imageData.startsWith('http')) {
          // URL
          console.log('Fetching image from URL...');
          const response = await fetch(imageData);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }
          
          imageBlob = await response.blob();
        } else {
          throw new Error('Invalid image data format');
        }
      } else if (imageData instanceof Blob) {
        // Blob object
        imageBlob = imageData;
      } else {
        throw new Error('Unsupported image data type');
      }

      console.log('Image blob size:', imageBlob.size, 'bytes');
      
      // Create form data for Pinata with proper filename
      const formData = new FormData();
      formData.append('file', imageBlob, imageFileName);

      // Add metadata to the file upload for better tracking
      const pinataMetadata = {
        name: imageFileName,
        keyvalues: {
          creationId: creationId,
          type: 'ai-generated-image',
          prompt: metadata.description || 'AI Generated Art',
          creator: metadata.creator || 'Unknown',
          style: metadata.style || 'realistic',
          mood: metadata.mood || 'neutral'
        }
      };
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

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

      // Create metadata JSON with proper structure and tracking
      const metadataJSON = {
        name: metadata.name || `AI Generated Art - ${metadata.description?.substring(0, 30)}...`,
        description: metadata.description || "Unique AI-generated artwork",
        image: `ipfs://${imageHash}`,
        creationId: creationId,
        imageFileName: imageFileName,
        metadataFileName: metadataFileName,
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
          },
          {
            trait_type: "Creation ID",
            value: creationId
          }
        ],
        external_url: "https://web3-ai-creator.vercel.app",
        ...metadata
      };

      // Upload metadata to IPFS with proper metadata
      const metadataUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretApiKey,
        },
        body: JSON.stringify({
          pinataMetadata: {
            name: metadataFileName,
            keyvalues: {
              creationId: creationId,
              type: 'ai-generated-metadata',
              prompt: metadata.description || 'AI Generated Art',
              creator: metadata.creator || 'Unknown',
              imageHash: imageHash,
              style: metadata.style || 'realistic',
              mood: metadata.mood || 'neutral'
            }
          },
          pinataContent: metadataJSON
        }),
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
        creationId: creationId,
        imageHash: imageHash,
        metadataHash: metadataHash,
        imageUrl: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
        metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
        metadata: metadataJSON,
        fileName: imageFileName,
        metadataFileName: metadataFileName
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

  // Upload dual images (original + watermarked) to IPFS via Pinata
  async uploadDualImagesToIPFS(imageData, metadata) {
    try {
      console.log('Starting dual IPFS upload...');
      console.log('Image data:', typeof imageData);
      console.log('Metadata:', metadata);

      // Check if we have Pinata credentials
      if (!this.pinataJWT && (!this.pinataApiKey || !this.pinataSecretApiKey)) {
        throw new Error('Missing Pinata credentials. Please set NEXT_PUBLIC_PINATA_JWT or both NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_API_KEY');
      }

      // Generate unique creation ID and filenames
      const creationId = this.generateCreationId();
      const sanitizedPrompt = this.sanitizeFilename(metadata.description || 'ai-generated');
      const originalImageFileName = `${creationId}-original-${sanitizedPrompt}.png`;
      const watermarkedImageFileName = `${creationId}-watermarked-${sanitizedPrompt}.png`;
      const metadataFileName = `${creationId}-metadata-${sanitizedPrompt}.json`;

      console.log('Creation ID:', creationId);
      console.log('Original image filename:', originalImageFileName);
      console.log('Watermarked image filename:', watermarkedImageFileName);
      console.log('Metadata filename:', metadataFileName);

      // Upload original image
      console.log('Uploading original image...');
      const originalImageBlob = await this.convertImageToBlob(imageData.originalImage);
      const originalImageHash = await this.uploadImageBlob(originalImageBlob, originalImageFileName, {
        creationId,
        type: 'ai-generated-original',
        prompt: metadata.description,
        creator: metadata.creator,
        style: metadata.style,
        mood: metadata.mood
      });

      // Upload watermarked image
      console.log('Uploading watermarked image...');
      const watermarkedImageBlob = await this.convertImageToBlob(imageData.watermarkedImage);
      const watermarkedImageHash = await this.uploadImageBlob(watermarkedImageBlob, watermarkedImageFileName, {
        creationId,
        type: 'ai-generated-watermarked',
        prompt: metadata.description,
        creator: metadata.creator,
        style: metadata.style,
        mood: metadata.mood
      });

      // Create metadata JSON with both image references
      const metadataJSON = {
        name: metadata.name || `AI Generated Art - ${metadata.description?.substring(0, 30)}...`,
        description: metadata.description || "Unique AI-generated artwork",
        image: `ipfs://${originalImageHash}`, // Original image for owners
        watermarkedImage: `ipfs://${watermarkedImageHash}`, // Watermarked image for non-owners
        creationId: creationId,
        originalImageFileName: originalImageFileName,
        watermarkedImageFileName: watermarkedImageFileName,
        metadataFileName: metadataFileName,
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
            trait_type: "Price",
            value: metadata.price || "0"
          },
          {
            trait_type: "Creator",
            value: metadata.creator || "Unknown"
          },
          {
            trait_type: "Creation Date",
            value: new Date().toISOString()
          },
          {
            trait_type: "Creation ID",
            value: creationId
          }
        ],
        external_url: "https://web3-ai-creator.vercel.app",
        ...metadata
      };

      console.log('Uploading metadata to Pinata...');
      console.log('Metadata file name:', metadataFileName);
      
      // Upload metadata to IPFS
      const metadataUploadResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.pinataJWT}`,
        },
        body: JSON.stringify({
          pinataMetadata: {
            name: metadataFileName,
            keyvalues: {
              creationId: creationId,
              type: 'ai-generated-metadata',
              prompt: metadata.description || 'AI Generated Art',
              creator: metadata.creator || 'Unknown',
              originalImageHash: originalImageHash,
              watermarkedImageHash: watermarkedImageHash,
              style: metadata.style || 'realistic',
              mood: metadata.mood || 'neutral',
              license: metadata.license || 'free'
            }
          },
          pinataContent: metadataJSON
        }),
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
        creationId: creationId,
        originalImageHash: originalImageHash,
        watermarkedImageHash: watermarkedImageHash,
        metadataHash: metadataHash,
        imageUrl: `https://gateway.pinata.cloud/ipfs/${originalImageHash}`, // Default to original
        watermarkedImageUrl: `https://gateway.pinata.cloud/ipfs/${watermarkedImageHash}`,
        metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
        metadata: metadataJSON,
        fileName: originalImageFileName,
        watermarkedFileName: watermarkedImageFileName,
        metadataFileName: metadataFileName
      };

      console.log('Dual IPFS upload completed successfully:', result);
      return result;
    } catch (error) {
      console.error('Dual IPFS upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper method to convert image data to blob
  async convertImageToBlob(imageData) {
    if (typeof imageData === 'string') {
      if (imageData.startsWith('data:image/')) {
        const response = await fetch(imageData);
        return await response.blob();
      } else if (imageData.startsWith('http')) {
        const response = await fetch(imageData);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        return await response.blob();
      } else {
        throw new Error('Invalid image data format');
      }
    } else if (imageData instanceof Blob) {
      return imageData;
    } else {
      throw new Error('Unsupported image data type');
    }
  }

  // Helper method to upload image blob to IPFS
  async uploadImageBlob(imageBlob, fileName, pinataMetadata) {
    const formData = new FormData();
    formData.append('file', imageBlob, fileName);
    formData.append('pinataMetadata', JSON.stringify({
      name: fileName,
      keyvalues: pinataMetadata
    }));

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.pinataJWT}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload image to IPFS: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.IpfsHash;
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
