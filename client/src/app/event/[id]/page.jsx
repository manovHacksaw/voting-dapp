"use client";
import { useEffect, useState } from 'react';
import { useVoting } from "@/context/VotingContext";

const EventDetails = ({ params }) => {
    const { id } = params; // Get the ID from params
    const { votingEvents, account, connectWallet, loading } = useVoting(); // Get loading from context
    const [eventDetails, setEventDetails] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [votes, setVotes] = useState([]);

    useEffect(() => {
        if (!loading && id !== undefined && votingEvents.length > 0) {
            const event = votingEvents[id];
            if (event) {
                setEventDetails(event);
                // Fetch candidates and votes here if required
            } else {
                console.error('Event not found for the given ID');
            }
        }
    }, [id, votingEvents, loading, account]); // Ensure useEffect runs after events are loaded

    // Conditional rendering based on loading and event data
    return (
        <div>
        {!account ? (
            <div>
                <p>Please connect your wallet to participate in this voting event.</p>
                <button onClick={connectWallet}>Connect Wallet</button>
            </div>
        ) : loading ? (
            <div>Loading event details...</div>
        ) : !eventDetails ? (
            <div>Event not found.</div>
        ) : (
            <>
                <h1>{eventDetails.name}</h1>
                <p>Purpose: {eventDetails.purpose}</p>
                <p>Organizer: {eventDetails.organizer}</p>
                {/* Display candidates and votes here */}
                {/* Example:
                <ul>
                    {candidates.map((candidate, index) => (
                        <li key={index}>{candidate} - Votes: {votes[index]}</li>
                    ))}
                </ul>
                */}
            </>
        )}
    </div>
    );
};

export default EventDetails;
