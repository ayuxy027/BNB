const hre = require("hardhat");

async function main() {
  // Get signers (test accounts)
  const [owner, user1, user2] = await hre.ethers.getSigners();
  
  console.log("🚀 Testing Creations NFT Contract");
  console.log("==================================");
  console.log(`Owner: ${owner.address}`);
  console.log(`User1: ${user1.address}`);
  console.log(`User2: ${user2.address}`);
  console.log("");

  // Get the deployed contract (you'll need to replace with your deployed address)
  // Or deploy a new one for testing
  const Creations = await hre.ethers.getContractFactory("Creations");
  const creations = await Creations.deploy();
  await creations.waitForDeployment();
  
  const contractAddress = await creations.getAddress();
  console.log(`📄 Contract deployed at: ${contractAddress}`);
  console.log("");

  // Test 1: Mint NFT as owner
  console.log("🎨 Test 1: Minting NFT as owner");
  const metadata1 = "ipfs://QmTest1234567890abcdef";
  const tx1 = await creations.connect(owner).mintNFT(metadata1);
  const receipt1 = await tx1.wait();
  console.log(`✅ NFT #1 minted by owner`);
  console.log(`   Metadata: ${metadata1}`);
  console.log(`   Gas used: ${receipt1.gasUsed.toString()}`);
  console.log("");

  // Test 2: Mint NFT as user1
  console.log("🎨 Test 2: Minting NFT as user1");
  const metadata2 = "ipfs://QmTest0987654321fedcba";
  const tx2 = await creations.connect(user1).mintNFT(metadata2);
  const receipt2 = await tx2.wait();
  console.log(`✅ NFT #2 minted by user1`);
  console.log(`   Metadata: ${metadata2}`);
  console.log(`   Gas used: ${receipt2.gasUsed.toString()}`);
  console.log("");

  // Test 3: Mint another NFT as user1
  console.log("🎨 Test 3: Minting another NFT as user1");
  const metadata3 = "ipfs://QmTest1111222233334444";
  const tx3 = await creations.connect(user1).mintNFT(metadata3);
  await tx3.wait();
  console.log(`✅ NFT #3 minted by user1`);
  console.log("");

  // Test 4: Check total supply
  const totalSupply = await creations.totalSupply();
  console.log(`📊 Total NFTs minted: ${totalSupply}`);
  console.log("");

  // Test 5: Fetch NFTs by owner
  console.log("👤 Test 5: Fetching owner's NFTs");
  const [ownerIds, ownerUris] = await creations.fetchNFTsByOwner(owner.address);
  console.log(`Owner has ${ownerIds.length} NFTs:`);
  for (let i = 0; i < ownerIds.length; i++) {
    console.log(`   Token #${ownerIds[i]}: ${ownerUris[i]}`);
  }
  console.log("");

  console.log("👤 Test 6: Fetching user1's NFTs");
  const [user1Ids, user1Uris] = await creations.fetchNFTsByOwner(user1.address);
  console.log(`User1 has ${user1Ids.length} NFTs:`);
  for (let i = 0; i < user1Ids.length; i++) {
    console.log(`   Token #${user1Ids[i]}: ${user1Uris[i]}`);
  }
  console.log("");

  // Test 7: Fetch all creations
  console.log("🌍 Test 7: Fetching all creations");
  const [allIds, allUris, allOwners] = await creations.fetchAllCreations();
  console.log(`All ${allIds.length} NFTs in the collection:`);
  for (let i = 0; i < allIds.length; i++) {
    console.log(`   Token #${allIds[i]}:`);
    console.log(`     Owner: ${allOwners[i]}`);
    console.log(`     URI: ${allUris[i]}`);
  }
  console.log("");

  // Test 8: Check token URI directly
  console.log("🔗 Test 8: Checking token URI directly");
  const tokenUri1 = await creations.tokenURI(1);
  console.log(`Token #1 URI: ${tokenUri1}`);
  console.log("");

  // Test 9: Check ownership
  console.log("👑 Test 9: Checking ownership");
  const owner1 = await creations.ownerOf(1);
  const owner2 = await creations.ownerOf(2);
  console.log(`Token #1 owner: ${owner1}`);
  console.log(`Token #2 owner: ${owner2}`);
  console.log("");

  // Test 10: Check balances
  console.log("💰 Test 10: Checking balances");
  const ownerBalance = await creations.balanceOf(owner.address);
  const user1Balance = await creations.balanceOf(user1.address);
  const user2Balance = await creations.balanceOf(user2.address);
  console.log(`Owner balance: ${ownerBalance} NFTs`);
  console.log(`User1 balance: ${user1Balance} NFTs`);
  console.log(`User2 balance: ${user2Balance} NFTs`);
  console.log("");

  console.log("🎉 All tests completed successfully!");
  console.log(`📄 Contract Address: ${contractAddress}`);
  console.log("🔗 You can interact with this contract using the Hardhat console:");
  console.log(`npx hardhat console --network localhost`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });