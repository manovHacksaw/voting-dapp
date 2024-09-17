# Web3.0 Voting Application

This project demonstrates a decentralized voting application built using Next.js and Solidity. It allows users to participate in voting events by registering as voters or candidates and supports wallet connectivity.

## Commit Message - "Deployed the Voting Contract and Started the Frontend"

### Event Details Page:
- Created a dynamic route to display details of a specific voting event.
- Used `params` to extract the event ID from the URL.
- Fetched and displayed event details such as the event name, purpose, and organizer.
- Implemented conditional rendering based on whether the user has connected their wallet or not.

### Conditional Rendering:
- Added checks to display a message prompting users to connect their wallet if no account is detected.
- Displayed a loading message while fetching the event details from the contract.
- Ensured that after the data is fetched, event details and candidates are displayed.

### Wallet Connection:
- Updated logic to ensure the wallet is connected before participating in the voting event.

### Bug Fixes:
- Resolved issues where the event details page was not loading correctly when the page was refreshed.
- Fixed the `useEffect` dependency array to correctly wait for the voting events to load before attempting to fetch the event details.

### Learning:
- Learned how to test smart contracts using Hardhat, improving the reliability and functionality of the contract code.

## Features

- **Wallet Connection**: Users can connect their wallets to participate in voting.
- **Voting Events**: Users can view ongoing voting events and their details.
- **Registration**: Users can register as voters or candidates for specific voting events.
- **Real-time Updates**: The application updates the UI based on the voting event details and user interactions.

## Technologies Used

- **Next.js**: Framework for building the frontend.
- **Solidity**: Smart contract language for the voting logic.
- **Ethers.js**: Library for interacting with the Ethereum blockchain.
- **React Context API**: For state management across components.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/voting-dapp.git
   cd voting-dapp

2. Install the dependencies:
   ```bash
   npm install

3. Start the development server: 
   ```bash
   npm run dev

4. Open your browser and navigate to http://localhost:3000.

## Running Tests
- To run tests for the smart contracts, use:
  ```bash
  npx hardhat test
   

## Deployement
- You can deploy the smart contracts to a local Ethereum node or a testnet. Use the following command for local deployment:
  ```bash
 npx hardhat node

 ## Acknowledgements
- **OpenAI:** For assistance in developing and refining this project.
- **Ethereum Community:** For resources and documentation.
