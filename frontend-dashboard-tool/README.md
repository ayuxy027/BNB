# Web3 AI Creator

A Next.js application for AI-powered text-to-image generation and NFT minting.

## Features

- **Home Page**: Browse all AI-generated creations from the community
- **Create Page**: Generate AI images with customizable prompts and settings
- **Profile Page**: View user profile, creations, and analytics
- **Wallet Integration**: MetaMask wallet connection for Web3 functionality
- **NFT Minting**: Mint generated images as NFTs with licensing options
- **IPFS Storage**: Decentralized storage via Pinata for images and metadata

## Pages

### Home Page (`/`)
- Displays all community creations in a grid layout
- Shows creation metadata (prompt, creator, date, tags, license)
- Responsive design for different screen sizes

### Create Page (`/create`)
- AI image generation form with prompt input
- Style and mood selection options
- Licensing options (free/paid)
- Real-time image preview
- IPFS upload via Pinata
- NFT minting functionality with metadata storage

### Profile Page (`/profile`)
- User profile information and statistics
- Tabbed interface for creations, analytics, and settings
- User's creation gallery
- Profile customization options

## Technology Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **Web3**: Ethers.js (for wallet integration)
- **IPFS**: Pinata (for decentralized storage)
- **UI**: Custom components with responsive design

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install additional dependencies:
   ```bash
   npm install ethers@5.7.2
   ```

3. Set up Pinata IPFS:
   - Sign up at [Pinata](https://app.pinata.cloud/)
   - Get your API keys from the dashboard
   - Copy `env.example` to `.env.local` and add your keys:
   ```bash
   cp env.example .env.local
   ```

4. Configure environment variables in `.env.local`:
   ```env
   # Option 1: Using JWT (Recommended)
   NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token_here

   # Option 2: Using API Keys (Alternative)
   NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here
   NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_api_key_here
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## IPFS Integration

The application uses Pinata for IPFS storage:

- **Image Upload**: Generated images are uploaded to IPFS via Pinata
- **Metadata Storage**: NFT metadata (including traits, creator info, etc.) is stored as JSON on IPFS
- **Dual Hash System**: Both image and metadata get unique IPFS hashes
- **Gateway Access**: Files are accessible via Pinata's IPFS gateway

### IPFS Upload Process:
1. User generates an image
2. Clicks "Mint as NFT"
3. Image is uploaded to IPFS via Pinata
4. Metadata JSON is created and uploaded to IPFS
5. Both hashes are returned for smart contract integration

## Current Status

This is a frontend-only implementation with:
- ✅ Complete UI/UX design
- ✅ Wallet connection functionality
- ✅ IPFS integration via Pinata
- ✅ Mock data for demonstrations
- ✅ Responsive design
- ⏳ Smart contract integration (planned)
- ⏳ AI image generation API (planned)

## Design Theme

- **Primary**: White background
- **Secondary**: Black text and elements
- **Accent**: Blue for interactive elements
- **Minimalist**: Clean, simple UI design

## Testing IPFS Upload

After setting up Pinata credentials:
1. Connect your wallet
2. Generate an image
3. Click "Mint as NFT"
4. View the test results showing:
   - User wallet address
   - IPFS image hash
   - IPFS metadata hash
   - Complete metadata JSON
   - Direct links to view files on IPFS
