# 🔑 BNB Greenfield Credentials Setup Guide

## Quick Start (5 Steps)

### Step 1: Get Test BNB Tokens
1. **Visit Testnet Faucet**: https://testnet.bnbchain.org/faucet-smart
2. **Connect MetaMask** to the testnet
3. **Request 0.1 BNB** for testing
4. **Wait for confirmation** (usually 1-2 minutes)

### Step 2: Get Your Private Key
**Option A: Use MetaMask Key**
1. Open MetaMask
2. Click Account Details (three dots)
3. Select "Export Private Key"
4. Enter your password
5. Copy the private key (starts with `0x`)

**Option B: Generate New Key**
```javascript
// Run in browser console or Node.js
const crypto = require('crypto');
const privateKey = '0x' + crypto.randomBytes(32).toString('hex');
console.log('Generated Private Key:', privateKey);
```

### Step 3: Create Environment File
```bash
# Copy the template
cp env.local.template .env.local

# Edit the file and replace:
NEXT_PUBLIC_GREENFIELD_PRIVATE_KEY=your_actual_private_key_here
```

### Step 4: Install SDK
```bash
npm install @bnb-chain/greenfield-js-sdk
```

### Step 5: Test Connection
```javascript
// Add this to your create page temporarily
import { greenfieldService } from '../services/greenfieldService';

// Test the connection
const testResult = await greenfieldService.testConnection();
console.log('Connection test:', testResult);
```

## Detailed Instructions

### 🔗 Network Configuration

#### Testnet (Recommended)
```env
NEXT_PUBLIC_GREENFIELD_RPC_URL=https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org
NEXT_PUBLIC_GREENFIELD_CHAIN_ID=5600
```

#### Mainnet (Production)
```env
NEXT_PUBLIC_GREENFIELD_RPC_URL=https://gnfd-mainnet-fullnode-tendermint-us.bnbchain.org
NEXT_PUBLIC_GREENFIELD_CHAIN_ID=1017
```

### 💰 Getting Test BNB

1. **Add BNB Testnet to MetaMask**:
   - Network Name: `BNB Smart Chain Testnet`
   - RPC URL: `https://data-seed-prebsc-1-s1.binance.org:8545`
   - Chain ID: `97`
   - Currency Symbol: `tBNB`
   - Block Explorer: `https://testnet.bscscan.com`

2. **Get Test Tokens**:
   - Visit: https://testnet.bnbchain.org/faucet-smart
   - Connect your wallet
   - Request 0.1 BNB
   - Wait for confirmation

### 🔐 Private Key Security

**⚠️ IMPORTANT SECURITY NOTES:**

1. **Never share your private key**
2. **Never commit it to version control**
3. **Use different keys for testnet and mainnet**
4. **For production, use server-side environment variables**

**Safe Private Key Format:**
```
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### 🛠️ Environment File Setup

1. **Copy the template**:
   ```bash
   cp env.local.template .env.local
   ```

2. **Edit `.env.local`**:
   ```env
   # Replace this line with your actual private key
   NEXT_PUBLIC_GREENFIELD_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
   
   # Optional: Change bucket name
   NEXT_PUBLIC_GREENFIELD_BUCKET_NAME=my-ai-creations-bucket
   ```

3. **Verify the file**:
   ```bash
   # Check that .env.local is in .gitignore
   cat .gitignore | grep env.local
   ```

### 🧪 Testing Your Setup

Create a test file to verify your credentials:

```javascript
// test-greenfield.js
import { greenfieldService } from './app/services/greenfieldService.js';

async function testSetup() {
  try {
    console.log('Testing Greenfield connection...');
    
    // Test connection
    const connectionTest = await greenfieldService.testConnection();
    console.log('Connection test:', connectionTest);
    
    // Test bucket creation
    const bucketTest = await greenfieldService.ensureBucketExists();
    console.log('Bucket test:', bucketTest);
    
    console.log('✅ Setup successful!');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

testSetup();
```

### 🔄 Switching from IPFS to Greenfield

1. **Update imports** in your create page:
   ```javascript
   // Replace this:
   import { ipfsService } from '../services/ipfsService';
   
   // With this:
   import { greenfieldService } from '../services/greenfieldService';
   ```

2. **Update upload calls**:
   ```javascript
   // Replace this:
   const result = await ipfsService.uploadDualImagesToIPFS(generatedImage, metadata);
   
   // With this:
   const result = await greenfieldService.uploadDualImagesToGreenfield(generatedImage, metadata);
   ```

### 🚨 Troubleshooting

#### "Missing Greenfield credentials"
- Check that `.env.local` exists
- Verify `NEXT_PUBLIC_GREENFIELD_PRIVATE_KEY` is set
- Ensure the private key starts with `0x`

#### "Insufficient BNB for gas fees"
- Get more test BNB from the faucet
- Check your wallet balance on testnet

#### "Bucket not found"
- The service will create the bucket automatically
- Ensure you have sufficient BNB for gas fees

#### "Upload failed"
- Check network connectivity
- Verify RPC URL is correct
- Ensure file size is within limits

### 📞 Support Resources

- **BNB Greenfield Docs**: https://docs.bnbchain.org/greenfield-docs/
- **Testnet Faucet**: https://testnet.bnbchain.org/faucet-smart
- **Discord Community**: https://discord.gg/bnbchain
- **GitHub Repository**: https://github.com/bnb-chain/greenfield

### ✅ Checklist

- [ ] Got test BNB tokens
- [ ] Generated/exported private key
- [ ] Created `.env.local` file
- [ ] Installed `@bnb-chain/greenfield-js-sdk`
- [ ] Tested connection
- [ ] Updated imports in code
- [ ] Tested upload functionality

Once you complete this checklist, you'll be ready to use BNB Greenfield storage! 🎉
