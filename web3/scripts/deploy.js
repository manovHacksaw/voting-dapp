const { ethers } = require('hardhat');

async function main() {
     console.log("Initializing contract deployment...");

     // Get the deployer's signer
     const [deployer] = await ethers.getSigners();
     console.log("Deployer address:", deployer.address);

     // Get the contract factory
     const Voting = await ethers.getContractFactory("Voting");
     console.log("Contract factory for 'Voting' retrieved.");

     console.log("Deploying the contract...");
     const voting = await Voting.deploy();

     console.log("Waiting for the deployment to be confirmed...");
     await voting.waitForDeployment();

     // Get the deployed contract address
     const contractAddress = await voting.getAddress();
     console.log("Voting contract deployed successfully!");
     console.log("Contract Address:", contractAddress);

     // Fetch the deployer's balance
     const deployerBalance = await ethers.provider.getBalance(deployer.address);
     // Format the balance to Ether
     const formattedBalance = ethers.formatEther(deployerBalance);

     console.log(`Deployer's balance: ${formattedBalance} ETH`);
}

main()
     .then(() => {
          console.log("Deployment script executed successfully.");
          process.exit(0);
     })
     .catch(error => {
          console.error("Error during deployment:", error);
          process.exit(1);
     });
