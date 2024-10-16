"use client";
import React, { useEffect, useState } from 'react';
import { useVoting } from '@/context/VotingContext';

const Campaign = ({ params }) => {
    const { loading, getCampaignById, createCandidate, createVoter } = useVoting();
    const [event, setEvent] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState("00:00:00");
    const id = Number(params.id);

    useEffect(() => {
        const fetchEvent = async () => {
            const fetchedEvent = await getCampaignById(id);
            setEvent(fetchedEvent);
            
            // Debugging: Log the fetched event details
            console.log("Fetched Event:", fetchedEvent);
            
            if (fetchedEvent.startTime && fetchedEvent.duration) {
                calculateTimeRemaining(fetchedEvent.startTime, fetchedEvent.duration);
            } else {
                console.error("Invalid startTime or duration:", fetchedEvent.startTime, fetchedEvent.duration);
            }
        };

        fetchEvent();
    }, [params.id]);

    // Countdown timer logic
    const calculateTimeRemaining = (startTime, duration) => {
        const parsedStartTime = Number(startTime);
        const parsedDuration = Number(duration);

        if (isNaN(parsedStartTime) || isNaN(parsedDuration)) {
            console.error("Invalid number values:", parsedStartTime, parsedDuration);
            return;
        }

        const endTime = parsedStartTime + parsedDuration; // Duration is in seconds

        const updateCountdown = () => {
            const now = Math.floor(Date.now() / 1000); // Current time in seconds
            const remainingTime = endTime - now;

            if (remainingTime <= 0) {
                setTimeRemaining("00:00:00");
                clearInterval(interval);
            } else {
                const hours = String(Math.floor((remainingTime % 86400) / 3600)).padStart(2, '0');
                const minutes = String(Math.floor((remainingTime % 3600) / 60)).padStart(2, '0');
                const seconds = String(remainingTime % 60).padStart(2, '0');
                setTimeRemaining(`${hours}:${minutes}:${seconds}`);
            }
        };

        const interval = setInterval(updateCountdown, 1000);
        updateCountdown(); // Initial call to set time immediately

        return () => clearInterval(interval); // Cleanup on unmount
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen text-center text-white bg-gray-800">Loading campaign...</div>;
    }

    if (!event) {
        return <div className="flex items-center justify-center h-screen text-center text-white bg-gray-800">Event not found.</div>;
    }

    // Destructure event details (adjust based on your contract's return structure)
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-r from-purple-700 to-blue-600 text-white">
            <div className="max-w-lg mx-auto p-6 rounded-lg shadow-lg bg-opacity-90 backdrop-filter backdrop-blur-lg mt-20">
                <h2 className="text-3xl font-bold mb-2">{event.name}</h2>
                <p className="mb-2">Purpose: <span className="font-semibold">{event.purpose}</span></p>
                <p className="mb-2">Creator: <span className="font-semibold">{event.organizer}</span></p>
                <p className="mb-2">Start Time: <span className="font-semibold">{new Date(Number(event.startTime) * 1000).toLocaleString()}</span></p>
                <p className="mb-4">Status: <span className={`font-semibold ${event.active ? 'text-green-300' : 'text-red-400'}`}>{event.active ? 'Active' : 'Inactive'}</span></p>
                <h3 className="text-xl mb-2">Time Remaining:</h3>
                <div className="text-2xl font-semibold mb-4">{timeRemaining}</div>
                <div className="flex space-x-4">
                    <button 
                        onClick={() => createCandidate(event.id)} 
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition duration-300 ease-in-out transform hover:-translate-y-1"
                    >
                        Register as Candidate
                    </button>
                    <button 
                        onClick={() => createVoter(event.id)} 
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition duration-300 ease-in-out transform hover:-translate-y-1"
                    >
                        Register as Voter
                    </button>
                </div>
            </div>
            <footer className="mt-auto text-center p-4 bg-gray-900">
                <p className="text-white">© 2024 Your Voting DApp. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default Campaign;
