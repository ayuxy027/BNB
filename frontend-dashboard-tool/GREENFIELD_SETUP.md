# BNB Greenfield Storage Integration

This document explains how to set up and use BNB Greenfield storage as an alternative to IPFS for storing AI-generated images and metadata.

## What is BNB Greenfield?

BNB Greenfield is a decentralized storage solution that's part of the BNB Chain ecosystem. It provides:
- Decentralized storage with high availability
- Native integration with BNB Chain
- Cost-effective storage solutions
- Built-in access control and permissions

## Setup Instructions

### 1. Install Dependencies

First, install the BNB Greenfield JavaScript SDK:

```bash
npm install @bnb-chain/greenfield-js-sdk
```

### 2. Environment Configuration

Copy the environment variables template:

```bash
cp greenfield.env.example .env.local
```

Fill in your BNB Greenfield credentials in `.env.local`:

```env
# BNB Greenfield RPC URL (Testnet)
NEXT_PUBLIC_GREENFIELD_RPC_URL=https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org

# BNB Greenfield Chain ID (Testnet: 5600, Mainnet: 1017)
NEXT_PUBLIC_GREENFIELD_CHAIN_ID=5600

# Your BNB Greenfield Private Key
NEXT_PUBLIC_GREENFIELD_PRIVATE_KEY=your_private_key_here

# BNB Greenfield Bucket Name
NEXT_PUBLIC_GREENFIELD_BUCKET_NAME=ai-creations-bucket
```

### 3. Get BNB Greenfield Credentials

#### Option A: Testnet Setup
1. Visit the [BNB Greenfield Testnet Faucet](https://testnet.bnbchain.org/faucet-smart)
2. Get test BNB tokens for gas fees
3. Generate a private key for your Greenfield account

#### Option B: Mainnet Setup
1. Ensure you have BNB tokens for gas fees
2. Use your existing BNB Chain private key or generate a new one

### 4. Update the Service Implementation

The current `greenfieldService.js` contains placeholder implementations. You'll need to replace the placeholder code with actual SDK calls:

#### Replace Placeholder Client Initialization:
```javascript
// Replace this placeholder:
const client = {
  rpcUrl: this.greenfieldRpcUrl,
  chainId: this.greenfieldChainId,
  privateKey: this.privateKey
};

// With actual SDK initialization:
const { Client } = require('@bnb-chain/greenfield-js-sdk');
const client = new Client(this.greenfieldRpcUrl, this.greenfieldChainId);
await client.account.initFromPrivateKey(this.privateKey);
```

#### Replace Placeholder Upload Method:
```javascript
// Replace the placeholder uploadObjectToGreenfield method with:
const { CreateObjectMsg } = require('@bnb-chain/greenfield-js-sdk');

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
```

### 5. Integration with Existing Code

To use Greenfield instead of IPFS, update your create page:

```javascript
// In create/page.js, replace:
import { ipfsService } from '../services/ipfsService';

// With:
import { greenfieldService } from '../services/greenfieldService';

// Then replace upload calls:
// const result = await ipfsService.uploadDualImagesToIPFS(generatedImage, metadata);
const result = await greenfieldService.uploadDualImagesToGreenfield(generatedImage, metadata);
```

## Service Features

### 1. Single Image Upload
```javascript
const result = await greenfieldService.uploadImageToGreenfield(imageData, metadata);
```

### 2. Dual Image Upload (Original + Watermarked)
```javascript
const result = await greenfieldService.uploadDualImagesToGreenfield(imageData, metadata);
```

### 3. Connection Testing
```javascript
const testResult = await greenfieldService.testConnection();
```

### 4. Bucket Management
```javascript
const bucketResult = await greenfieldService.ensureBucketExists();
```

## Response Format

The service returns the same response format as the IPFS service:

```javascript
{
  success: true,
  creationId: "creation-1234567890-abc123",
  imageObjectId: "greenfield-1234567890-xyz789",
  metadataObjectId: "greenfield-1234567890-def456",
  imageUrl: "https://gnfd-testnet-sp1.bnbchain.org/view/greenfield-1234567890-xyz789",
  metadataUrl: "https://gnfd-testnet-sp1.bnbchain.org/view/greenfield-1234567890-def456",
  metadata: { /* metadata object */ },
  fileName: "creation-1234567890-abc123-image-prompt.png",
  metadataFileName: "creation-1234567890-abc123-metadata-prompt.json"
}
```

## Error Handling

The service includes comprehensive error handling:

```javascript
try {
  const result = await greenfieldService.uploadImageToGreenfield(imageData, metadata);
  if (result.success) {
    console.log('Upload successful:', result);
  } else {
    console.error('Upload failed:', result.error);
  }
} catch (error) {
  console.error('Service error:', error);
}
```

## Cost Considerations

- **Testnet**: Free to use with test tokens
- **Mainnet**: Costs depend on storage size and duration
- **Gas Fees**: BNB tokens required for transactions

## Security Notes

1. **Private Key Security**: Never expose your private key in client-side code for production
2. **Environment Variables**: Use server-side environment variables for sensitive data
3. **Access Control**: Configure proper bucket permissions for your use case

## Troubleshooting

### Common Issues:

1. **"Missing Greenfield credentials"**
   - Ensure all environment variables are set correctly
   - Check that the private key is valid

2. **"Bucket not found"**
   - The service will automatically create the bucket if it doesn't exist
   - Ensure you have sufficient BNB for gas fees

3. **"Upload failed"**
   - Check network connectivity to Greenfield RPC
   - Verify you have sufficient BNB for gas fees
   - Ensure the file size is within limits

### Debug Mode:

Enable detailed logging by setting:
```javascript
console.log('Greenfield debug mode enabled');
```

## Migration from IPFS

To migrate from IPFS to Greenfield:

1. Update environment variables
2. Replace service imports
3. Update upload method calls
4. Test with small files first
5. Update any hardcoded IPFS URLs in your application

## Support

For BNB Greenfield support:
- [Official Documentation](https://docs.bnbchain.org/greenfield-docs/)
- [GitHub Repository](https://github.com/bnb-chain/greenfield)
- [Discord Community](https://discord.gg/bnbchain)
