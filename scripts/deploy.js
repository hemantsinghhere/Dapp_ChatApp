// scripts/deploy.js
async function main() {
    // Get the contract factory
    const Chat = await ethers.getContractFactory("DecentralizedChat");
  
    // Deploy the contract
    const chat = await Chat.deploy();
  
    // Wait for deployment to be mined (ethers v6 syntax)
    await chat.waitForDeployment();
  
    // Log the deployed contract address (using `target` in ethers v6)
    console.log("DecentralizedChat deployed to:", chat.target);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  