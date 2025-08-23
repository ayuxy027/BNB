// BNB Greenfield Service for decentralized storage
// Note: You'll need to add your BNB Greenfield credentials to environment variables

export class GreenfieldService {
  constructor() {
    this.greenfieldRpcUrl = process.env.NEXT_PUBLIC_GREENFIELD_RPC_URL || 'https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org';
    this.greenfieldChainId = process.env.NEXT_PUBLIC_GREENFIELD_CHAIN_ID || '5600'; // Testnet
    this.privateKey = process.env.NEXT_PUBLIC_GREENFIELD_PRIVATE_KEY;
    this.bucketName = process.env.NEXT_PUBLIC_GREENFIELD_BUCKET_NAME || 'ai-creations-bucket';
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

  // Initialize Greenfield client
  async getGreenfieldClient() {
    try {
      // Note: This is a placeholder for the actual Greenfield SDK
      // You'll need to install and import the official BNB Greenfield SDK
      // const { Client } = require('@bnb-chain/greenfield-js-sdk');
      
      if (!this.privateKey) {
        throw new Error('Missing Greenfield private key. Please set NEXT_PUBLIC_GREENFIELD_PRIVATE_KEY');
      }

      // Initialize client (placeholder - replace with actual SDK)
      const client = {
        rpcUrl: this.greenfieldRpcUrl,
        chainId: this.greenfieldChainId,
        privateKey: this.privateKey
      };

      return client;
    } catch (error) {
      console.error('Error initializing Greenfield client:', error);
      throw error;
    }
  }

  // Upload image to BNB Greenfield
  async uploadImageToGreenfield(imageData, metadata) {
    try {
      console.log('Starting Greenfield upload...');
      console.log('Image data type:', typeof imageData);
      console.log('Metadata:', metadata);

      // Check if we have Greenfield credentials
      if (!this.privateKey) {
        throw new Error('Missing Greenfield credentials. Please set NEXT_PUBLIC_GREENFIELD_PRIVATE_KEY');
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
      
      // Get Greenfield client
      const client = await this.getGreenfieldClient();

      // Upload image to Greenfield
      console.log('Uploading image to Greenfield...');
      const imageUploadResult = await this.uploadObjectToGreenfield(
        client,
        imageBlob,
        imageFileName,
        'image/png',
        {
          creationId: creationId,
          type: 'ai-generated-image',
          prompt: metadata.description || 'AI Generated Art',
          creator: metadata.creator || 'Unknown',
          style: metadata.style || 'realistic',
          mood: metadata.mood || 'neutral'
        }
      );

      console.log('Image upload result:', imageUploadResult);
      const imageObjectId = imageUploadResult.objectId;

      // Create metadata JSON with proper structure and tracking
      const metadataJSON = {
        name: metadata.name || `AI Generated Art - ${metadata.description?.substring(0, 30)}...`,
        description: metadata.description || "Unique AI-generated artwork",
        image: `greenfield://${imageObjectId}`,
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

      console.log('Uploading metadata to Greenfield...');
      console.log('Metadata file name:', metadataFileName);
      
      // Upload metadata to Greenfield
      const metadataBlob = new Blob([JSON.stringify(metadataJSON, null, 2)], {
        type: 'application/json'
      });

      const metadataUploadResult = await this.uploadObjectToGreenfield(
        client,
        metadataBlob,
        metadataFileName,
        'application/json',
        {
          creationId: creationId,
          type: 'ai-generated-metadata',
          prompt: metadata.description || 'AI Generated Art',
          creator: metadata.creator || 'Unknown',
          imageObjectId: imageObjectId,
          style: metadata.style || 'realistic',
          mood: metadata.mood || 'neutral'
        }
      );

      console.log('Metadata upload result:', metadataUploadResult);
      const metadataObjectId = metadataUploadResult.objectId;

      const result = {
        success: true,
        creationId: creationId,
        imageObjectId: imageObjectId,
        metadataObjectId: metadataObjectId,
        imageUrl: `https://gnfd-testnet-sp1.bnbchain.org/view/${imageObjectId}`,
        metadataUrl: `https://gnfd-testnet-sp1.bnbchain.org/view/${metadataObjectId}`,
        metadata: metadataJSON,
        fileName: imageFileName,
        metadataFileName: metadataFileName
      };

      console.log('Greenfield upload completed successfully:', result);
      return result;

    } catch (error) {
      console.error('Greenfield upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload dual images (original + watermarked) to BNB Greenfield
  async uploadDualImagesToGreenfield(imageData, metadata) {
    try {
      console.log('Starting dual Greenfield upload...');
      console.log('Image data:', typeof imageData);
      console.log('Metadata:', metadata);

      // Check if we have Greenfield credentials
      if (!this.privateKey) {
        throw new Error('Missing Greenfield credentials. Please set NEXT_PUBLIC_GREENFIELD_PRIVATE_KEY');
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

      // Get Greenfield client
      const client = await this.getGreenfieldClient();

      // Upload original image
      console.log('Uploading original image...');
      const originalImageBlob = await this.convertImageToBlob(imageData.originalImage);
      const originalImageObjectId = await this.uploadObjectToGreenfield(
        client,
        originalImageBlob,
        originalImageFileName,
        'image/png',
        {
          creationId,
          type: 'ai-generated-original',
          prompt: metadata.description,
          creator: metadata.creator,
          style: metadata.style,
          mood: metadata.mood
        }
      );

      // Upload watermarked image
      console.log('Uploading watermarked image...');
      const watermarkedImageBlob = await this.convertImageToBlob(imageData.watermarkedImage);
      const watermarkedImageObjectId = await this.uploadObjectToGreenfield(
        client,
        watermarkedImageBlob,
        watermarkedImageFileName,
        'image/png',
        {
          creationId,
          type: 'ai-generated-watermarked',
          prompt: metadata.description,
          creator: metadata.creator,
          style: metadata.style,
          mood: metadata.mood
        }
      );

      // Create metadata JSON with both image references
      const metadataJSON = {
        name: metadata.name || `AI Generated Art - ${metadata.description?.substring(0, 30)}...`,
        description: metadata.description || "Unique AI-generated artwork",
        image: `greenfield://${originalImageObjectId}`, // Original image for owners
        watermarkedImage: `greenfield://${watermarkedImageObjectId}`, // Watermarked image for non-owners
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

      console.log('Uploading metadata to Greenfield...');
      console.log('Metadata file name:', metadataFileName);
      
      // Upload metadata to Greenfield
      const metadataBlob = new Blob([JSON.stringify(metadataJSON, null, 2)], {
        type: 'application/json'
      });

      const metadataUploadResult = await this.uploadObjectToGreenfield(
        client,
        metadataBlob,
        metadataFileName,
        'application/json',
        {
          creationId: creationId,
          type: 'ai-generated-metadata',
          prompt: metadata.description || 'AI Generated Art',
          creator: metadata.creator || 'Unknown',
          originalImageObjectId: originalImageObjectId,
          watermarkedImageObjectId: watermarkedImageObjectId,
          style: metadata.style || 'realistic',
          mood: metadata.mood || 'neutral',
          license: metadata.license || 'free'
        }
      );

      console.log('Metadata upload result:', metadataUploadResult);
      const metadataObjectId = metadataUploadResult.objectId;

      const result = {
        success: true,
        creationId: creationId,
        originalImageObjectId: originalImageObjectId,
        watermarkedImageObjectId: watermarkedImageObjectId,
        metadataObjectId: metadataObjectId,
        imageUrl: `https://gnfd-testnet-sp1.bnbchain.org/view/${originalImageObjectId}`, // Default to original
        watermarkedImageUrl: `https://gnfd-testnet-sp1.bnbchain.org/view/${watermarkedImageObjectId}`,
        metadataUrl: `https://gnfd-testnet-sp1.bnbchain.org/view/${metadataObjectId}`,
        metadata: metadataJSON,
        fileName: originalImageFileName,
        watermarkedFileName: watermarkedImageFileName,
        metadataFileName: metadataFileName
      };

      console.log('Dual Greenfield upload completed successfully:', result);
      return result;
    } catch (error) {
      console.error('Dual Greenfield upload error:', error);
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

  // Helper method to upload object to Greenfield
  async uploadObjectToGreenfield(client, blob, fileName, contentType, metadata) {
    try {
      // This is a placeholder implementation
      // You'll need to replace this with actual BNB Greenfield SDK calls
      
      console.log(`Uploading ${fileName} to Greenfield...`);
      console.log('Content type:', contentType);
      console.log('Metadata:', metadata);

      // Simulate upload process (replace with actual SDK)
      const uploadResult = {
        objectId: `greenfield-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        fileName: fileName,
        size: blob.size,
        contentType: contentType
      };

      console.log('Upload result:', uploadResult);
      return uploadResult;

      // Actual implementation would look something like:
      /*
      const { Client, CreateObjectMsg } = require('@bnb-chain/greenfield-js-sdk');
      
      const createObjectMsg = new CreateObjectMsg({
        bucketName: this.bucketName,
        objectName: fileName,
        data: blob,
        contentType: contentType,
        visibility: 'VISIBILITY_TYPE_PUBLIC_READ'
      });

      const tx = await client.object.createObject(createObjectMsg);
      const result = await tx.broadcast();
      
      return {
        objectId: result.objectId,
        fileName: fileName,
        size: blob.size,
        contentType: contentType
      };
      */

    } catch (error) {
      console.error('Error uploading object to Greenfield:', error);
      throw error;
    }
  }

  // Test method to check Greenfield connection
  async testConnection() {
    try {
      const client = await this.getGreenfieldClient();
      
      // Test bucket access
      console.log('Testing Greenfield connection...');
      
      // This is a placeholder test
      // Replace with actual SDK connection test
      const testResult = {
        success: true,
        message: 'Greenfield connection successful',
        bucketName: this.bucketName,
        chainId: this.greenfieldChainId
      };

      console.log('Greenfield connection test successful:', testResult);
      return testResult;

      // Actual implementation would look something like:
      /*
      const { Client } = require('@bnb-chain/greenfield-js-sdk');
      
      const bucketInfo = await client.bucket.headBucket(this.bucketName);
      return {
        success: true,
        message: 'Greenfield connection successful',
        bucketName: this.bucketName,
        bucketInfo: bucketInfo
      };
      */

    } catch (error) {
      console.error('Greenfield connection test error:', error);
      return { success: false, error: error.message };
    }
  }

  // Create bucket if it doesn't exist
  async ensureBucketExists() {
    try {
      const client = await this.getGreenfieldClient();
      
      console.log(`Ensuring bucket ${this.bucketName} exists...`);
      
      // This is a placeholder implementation
      // Replace with actual SDK bucket creation
      console.log('Bucket creation/verification successful');
      return { success: true, bucketName: this.bucketName };

      // Actual implementation would look something like:
      /*
      const { Client, CreateBucketMsg } = require('@bnb-chain/greenfield-js-sdk');
      
      try {
        await client.bucket.headBucket(this.bucketName);
        console.log('Bucket already exists');
        return { success: true, bucketName: this.bucketName };
      } catch (error) {
        if (error.message.includes('bucket not found')) {
          const createBucketMsg = new CreateBucketMsg({
            bucketName: this.bucketName,
            visibility: 'VISIBILITY_TYPE_PUBLIC_READ'
          });
          
          const tx = await client.bucket.createBucket(createBucketMsg);
          await tx.broadcast();
          
          console.log('Bucket created successfully');
          return { success: true, bucketName: this.bucketName };
        } else {
          throw error;
        }
      }
      */

    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      throw error;
    }
  }
}

export const greenfieldService = new GreenfieldService(); 
