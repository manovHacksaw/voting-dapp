"use client";
import { useEffect, useState } from 'react';
import { useVoting } from "@/context/VotingContext";

const EventDetails = ({ params }) => {
    const { id } = params; // Get the ID from params
    const { votingEvents, registerVoter, registerCandidate, getResults, account, connectWallet, loading } = useVoting();
    const [eventDetails, setEventDetails] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [votes, setVotes] = useState([]);
    const [userKey, setUserKey] = useState(''); // Store user-provided key/password

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
    }, [id, votingEvents, loading, account]);

    const fetchEventResults = async (eventId) => {
        try {
            const { candidates, votes } = await getResults(eventId); // Fetch results from contract
            setCandidates(candidates);
            setVotes(votes);
        } catch (error) {
            console.error("Error fetching results:", error);
        }
    };

    const handleRegisterVoter = async () => {
        try {
            await registerVoter(id, userKey); // Call registerVoter with event ID and key
            alert('Registered as a voter successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to register as a voter: ' + error.message);
        }
    };

    const handleRegisterCandidate = async () => {
        try {
            await registerCandidate(id, userKey); // Call registerCandidate with event ID and key
            alert('Registered as a candidate successfully!');
            fetchEventResults(id); // Refresh candidate list
        } catch (error) {
            console.error(error);
            alert('Failed to register as a candidate: ' + error.message);
        }
    };

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

                    <h2>Candidates</h2>
                    <ul>
                        {candidates.length > 0 ? (
                            candidates.map((candidate, index) => (
                                <li key={index}>
                                    {candidate} - Votes: {votes[index]}
                                </li>
                            ))
                        ) : (
                            <p>No candidates yet.</p>
                        )}
                    </ul>

                    {/* User key input for registering */}
                    <div>
                        <label htmlFor="userKey">Enter key/password to register:</label>
                        <input
                            type="text"
                            id="userKey"
                            value={userKey}
                            onChange={(e) => setUserKey(e.target.value)}
                            placeholder="Enter event key"
                        />
                    </div>

                    {/* Buttons to register as voter or candidate */}
                    <div>
                        <button onClick={handleRegisterVoter}>Register as Voter</button>
                        <button onClick={handleRegisterCandidate}>Register as Candidate</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default EventDetails;
