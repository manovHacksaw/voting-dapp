"use client";
import React from 'react';
import { useVoting } from '@/context/VotingContext';
import WalletButton from '@/components/WalletButton';

const Navbar = () => {
  const { account, connectWallet, disconnectWallet } = useVoting();

  return (
    <nav className="flex items-center justify-between py-12 shadow-md px-4 sm:px-6 md:px-12">
      <div className="text-white text-xl md:text-2xl font-bold">PolyTix</div>

      {/* Wallet Button */}
      <div className="flex justify-center items-center">
        <WalletButton
          isConnected={!!account} 
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
        />
      </div>
    </nav>
  );
};

export default Navbar;
