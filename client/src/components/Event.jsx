import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useVoting } from "@/context/VotingContext";

const Event = () => {
    const router = useRouter();
    const { id } = router.query; // Get the event ID from the URL
    const { votingEvents, registerVoter, registerCandidate, getResults, account, connectWallet } = useVoting();
    const [eventDetails, setEventDetails] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [votes, setVotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userKey, setUserKey] = useState(""); // For registering with a key

    useEffect(() => {
        if (id !== undefined) {
            const event = votingEvents[id];
            
            if (event) {
                setEventDetails(event);
                fetchEventResults(id); // Fetch candidates and votes
            }
            setLoading(false);
        }
    }, [id, votingEvents]);

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

    if (loading) return <div>Loading...</div>;

    if (!eventDetails) return <div>Event not found.</div>;

    return (
        <div>
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
            
            {!account ? (
                <div>
                    <p>Please connect your wallet to participate in this voting event.</p>
                    <button onClick={connectWallet}>Connect Wallet</button>
                </div>
            ) : (
                <div>
                    <input
                        type="text"
                        placeholder="Enter your key to participate"
                        value={userKey}
                        onChange={(e) => setUserKey(e.target.value)}
                    />
                    <button onClick={handleRegisterVoter}>Register as Voter</button>
                    <button onClick={handleRegisterCandidate}>Register as Candidate</button>
                </div>
            )}
        </div>
    );
};

export default Event;
