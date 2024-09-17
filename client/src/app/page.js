"use client"
import React from 'react';
import { useVoting, VotingProvider } from '../context/VotingContext';
import { useRouter } from 'next/navigation';
import EventList from '@/components/EventList';

const Home = () => {
    const { account, votingEvents, connectWallet } = useVoting();
    const router = useRouter();
    console.log(votingEvents[0])

    const handleRedirectToOrganizePage = () => {
      router.push("/organize");
    }

    return (
        <div>
            <h1>Voting Application</h1>
            <button onClick={handleRedirectToOrganizePage}>Organize a Voting Event</button>
            {account ? (
                <EventList/>
            ) : (
                <button onClick={connectWallet}>Connect Wallet</button>
            )}
        </div>
    );
};

export default Home;
