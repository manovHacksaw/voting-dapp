"use client";
import React, { useEffect } from 'react';
import EventCard from './EventCard';
import { useVoting } from '@/context/VotingContext';

const Campaigns = () => {
    const { campaigns, getCampaigns, loading, contract } = useVoting();

//     useEffect(() => {
//         const fetchCampaigns = async () => {
//             try {
//                 await getCampaigns(); // Fetch campaigns
//                 console.log(campaigns)
//             } catch (error) {
//                 console.error("Failed to load campaigns:", error);
//             }
//         };

//         fetchCampaigns();
//     }, [contract]); 

    if (loading) {
        return <div className="text-center">Loading campaigns...</div>;
    }

    return (
        <div className="flex flex-wrap justify-center text-white">
            {campaigns.length === 0 ? (
                <div className="text-center">No campaigns available.</div>
            ) : (
                campaigns.map((event, index) => (
                    <EventCard key={index} event={event} />
                ))
            )}
        </div>
    );
};

export default Campaigns;
