const { ethers } = require('hardhat');


async function main() {
     console.log("Initializing contract deployment...");

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

     // Fetch the balance
     const balance = await ethers.provider.getBalance(contractAddress);
     // Format the balance to Ether
     const formattedBalance = ethers.formatEther(balance);

     console.log(`Balance of ${contractAddress}: ${formattedBalance} ETH`);
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