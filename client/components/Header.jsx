import React, { useState, useEffect } from 'react';
import WalletInfo from './WalletInfo';
import Image from 'next/image';
import { useVoting } from '@/context/VotingContext'; // Assuming you're using this context for wallet management
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

const Header = () => {
  const { account, balance, connectWallet } = useVoting(); // Get account and balance from context
  const [showWalletInfo, setShowWalletInfo] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Show wallet info when account is connected
    if (account) {
     connectWallet();
      setShowWalletInfo(true);
    }
  }, [account]);

  return (
    <div className="flex flex-col items-center  justify-center min-h-screen text-white p-6 relative">
      <div className="absolute left-4 top-24 animate-float-2">
        <Image src={"/polygon_icon.png"} height={100} width={100} alt="Polygon Icon" />
      </div>

      <div className="absolute right-4 bottom-50 animate-float">
        <Image src={"/ethereum_icon.png"} height={100} width={100} alt="Ethereum Icon" />
      </div>

      <Image src={"/header.png"} height={500} width={450} alt="Header Image" className="mb-6 w-[500px]" />
      
      <h1 className="text-4xl font-bold mb-4 text-center">
        Empower Collective Intelligence
      </h1>
     
      <p className="text-lg mb-6 text-center typing-animation">
        Decentralize Your Decisions by Valuing All Opinions!
      </p>
      
      <Button onClick = {()=>{router.push("/create-campaign")}} className="px-10 py-8 font-bold text-lg tracking-[0.1em] bg-blue-800 text-white rounded-md shadow-lg hover:bg-blue-700 hover:tracking-[0.25em] transition-all duration-300 ease-in-out">
        Get Started
      </Button>

      {/* Wallet Info Section */}
      {account && (
        <div className={`absolute right-4 top-1 transition-transform transform duration-1000 ${showWalletInfo ? 'translate-y-0 opacity-80' : 'translate-y-12 opacity-0'}`}>
          <WalletInfo address={account} balance={balance} />
        </div>
      )}
    </div>
  );
}

export default Header;
