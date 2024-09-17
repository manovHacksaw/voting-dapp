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


    useEffect(() => {
        if (id !== undefined) {
            const event = votingEvents[id];
            setEventDetails(event);
            if (event) {
                const { candidates, votes } = getResults(id);
                setCandidates(candidates);
                setVotes(votes);
            }
            setLoading(false);
        }
    }, [id, votingEvents]);

    const handleRegisterVoter = async () => {
        try {
            await registerVoter(id); // Call the registerVoter function with the event ID
            alert('Registered as a voter successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to register as a voter: ' + error.message);
        }
    };

    const handleRegisterCandidate = async () => {
        try {
            await registerCandidate(id); // Call the registerCandidate function with the event ID
            alert('Registered as a candidate successfully!');
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
                {candidates.map((candidate, index) => (
                    <li key={index}>
                        {candidate} - Votes: {votes[index]}
                    </li>
                ))}
            </ul>
            {!account ? (
                <div>
                    <p>Please connect your wallet to participate in this voting event.</p>
                    <button onClick={connectWallet}>Connect Wallet</button>
                </div>
            ) : (
                <div>
                    <button onClick={handleRegisterVoter}>Register as Voter</button>
                    <button onClick={handleRegisterCandidate}>Register as Candidate</button>
                </div>
            )}
        </div>
    );
};

export default Event;
