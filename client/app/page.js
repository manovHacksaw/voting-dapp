"use client";
import Campaigns from '@/components/Campaigns';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import WalletButton from '@/components/WalletButton';
import WalletInfo from '@/components/WalletInfo';
import { useVoting } from '@/context/VotingContext';
import React, { useEffect } from 'react';

const Page = () => {
  const { account, balance, connectWallet, disconnectWallet } = useVoting();
  console.log(account, balance);

  useEffect(() => {

    connectWallet();

  }, [])


  return (
    <div>
     <Navbar/>
     <Header/>

     <Campaigns/>

      
    </div>
  );
};

export default Page;
