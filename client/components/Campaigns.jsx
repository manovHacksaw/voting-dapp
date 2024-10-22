"use client";
import React, { useEffect } from 'react';
import EventCard from './EventCard';
import { useVoting } from '@/context/VotingContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Campaigns = () => {
    const { campaigns, getCampaigns, loading, contract } = useVoting();

    const router = useRouter();

 

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Image 
                    src={"/loader.gif"} 
                    width={80} 
                    height={80} 
                    
                    alt="Loading..."
                />
            </div>
        );
    }

    return (
        <div className="flex flex-wrap justify-center text-white">
            {campaigns.length === 0 ? (
                <div className="text-center">No campaigns available.</div>
            ) : (
                campaigns.map((event, index) => (
                    
                    <EventCard  key={index} event={event} index={index} />
                ))
            )}
        </div>
    );
};

export default Campaigns;