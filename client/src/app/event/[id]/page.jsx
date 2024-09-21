"use client";
import { useEffect, useState } from 'react';
import { useVoting } from "@/context/VotingContext";
import Event from '@/components/Event';

const EventDetails = ({ params }) => {
    const { id } = params; // Get the ID from params
    const { votingEvents, getResults, account, connectWallet, loading } = useVoting();
    const [eventDetails, setEventDetails] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [votes, setVotes] = useState([]);

    useEffect(() => {
        if (!loading && id !== undefined && votingEvents.length > 0) {
            const event = votingEvents[id];
            if (event) {
                setEventDetails(event);
                fetchEventResults(id); // Fetch results for the event
            } else {
                console.error('Event not found for the given ID');
            }
        }
    }, [id, votingEvents, loading]);

    const fetchEventResults = async (eventId) => {
        try {
            const { candidates, votes } = await getResults(eventId);
            setCandidates(candidates);
            setVotes(votes);
        } catch (error) {
            console.error("Error fetching results:", error);
        }
    };

    if (!account) {
        return (
            <div>
                <p>Please connect your wallet to participate in this voting event.</p>
                <button onClick={connectWallet}>Connect Wallet</button>
            </div>
        );
    }

    if (loading || !eventDetails) {
        return <div>{loading ? "Loading event details..." : "Event not found."}</div>;
    }

    return (
        <Event
            eventId={id}
            eventDetails={eventDetails}
            candidates={candidates}
            votes={votes}
        />
    );
};

export default EventDetails;
