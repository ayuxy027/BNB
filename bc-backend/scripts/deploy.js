async function main() {
    // Get the ContractFactory
    const ContractFactory = await ethers.getContractFactory("Creations");
    
    // Deploy the contract
    console.log("Deploying contract...");
    const contract = await ContractFactory.deploy();
    
    // Wait for deployment to finish
    await contract.waitForDeployment();
    
    // Get contract address
    const contractAddress = await contract.getAddress();
    
    console.log("Contract deployed to:", contractAddress);
    
    // Get deployment transaction (safer way)
    const deploymentTx = contract.deploymentTransaction();
    if (deploymentTx) {
      console.log("Transaction hash:", deploymentTx.hash);
    }
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress: contractAddress,
      network: network.name
    };
    
    console.log("Deployment Info:", deploymentInfo);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });