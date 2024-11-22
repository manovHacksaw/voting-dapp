# PolyTix - Decentralized Voting Platform  

PolyTix is a blockchain-based decentralized voting application designed for transparency, security, and ease of use. Built using **Next.js** and **Polygon zkEVM**, PolyTix ensures seamless participation and management of voting events in a trustless environment.

---

## Features  
- **Decentralized Voting**: Create and manage voting events directly on the blockchain.  
- **Wallet Integration**: Supports wallet connections for identity verification and participation.  
- **Light/Dark Mode**: Toggle between light and dark themes for a personalized experience.  
- **Real-Time Voting Data**: See live updates of voting statuses.  
- **Secure and Transparent**: Powered by Polygon zkEVM for secure transactions and transparent results.  
- **Customizable Themes**: Designed with a purple-themed homepage, styled using Tailwind CSS.  

---

## Tech Stack  
- **Frontend**: Next.js with Tailwind CSS  
- **Blockchain**: Polygon zkEVM  
- **Wallet Management**: Ethers.js  
- **Smart Contracts**: Solidity  

---

## Folder Structure  

```plaintext
client/
│
├── .gitignore
├── jsconfig.json
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.js
│
├── app/
│   ├── components/    # Reusable React components
│   ├── pages/         # Application pages (e.g., Home, RegisterVoter, CreateCampaign)
│   ├── hooks/         # Custom hooks (e.g., useVoting)
│   ├── context/       # Context providers (e.g., VotingProvider)
│   ├── styles/        # Global styles
│
├── node_modules/      # Dependencies
```

---

## Installation  

1. Clone the repository:  
   ```bash
   git clone https://github.com/manovHacksaw/polytix.git
   cd polytix
   ```

2. Install dependencies:  
   ```bash
   npm install
   ```

3. Set up the environment variables:  
   - Create a `.env.local` file in the root directory.
   - Add the required blockchain network and wallet configuration details.

4. Run the application:  
   ```bash
   npm run dev
   ```

---

## Usage  

### Creating a Voting Event  
1. Navigate to the "Create Campaign" page.  
2. Provide event details such as name, purpose, and timeline.  
3. Deploy the event to the blockchain.  

### Registering Voters  
1. Go to the "Register Voter" page.  
2. Input wallet addresses of voters and confirm the registration.  

### Participating in a Vote  
1. Connect your wallet.  
2. Join the active voting event.  
3. Cast your vote securely and transparently.  

---

## Contributing  
We welcome contributions!  
1. Fork the repository.  
2. Create a new branch:  
   ```bash
   git checkout -b feature-name
   ```  
3. Commit your changes:  
   ```bash
   git commit -m "Add feature-name"
   ```  
4. Push to the branch:  
   ```bash
   git push origin feature-name
   ```  
5. Open a Pull Request.  

---

## License  
PolyTix is licensed under the [MIT License](LICENSE).  

---

## Acknowledgments  
PolyTix is a project created to demonstrate the potential of blockchain technology in enhancing transparency and security in voting processes. Special thanks to contributors and the blockchain community for their support and inspiration.  

--- 

Start voting the decentralized way with **PolyTix**! 🚀
