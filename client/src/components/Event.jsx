"use client"
import { useState } from 'react';
import { useVoting } from "@/context/VotingContext";

const Event = ({ eventDetails, candidates, votes, eventId }) => {
    const { account, connectWallet, registerVoter, registerCandidate, castVote } = useVoting(); // assuming castVote is defined in the VotingContext
    const [userKey, setUserKey] = useState(""); // For registering with a key
  

    console.log(eventDetails.name)
    console.log(candidates)

    const handleRegisterVoter = async () => {
        let success;
        try {
            success = await registerVoter(eventId, userKey); // Pass event ID and key
        } catch (error) {
            console.error(error);
            alert('Failed to register as a voter: ' + error.message);
        }

        if (success) {
            alert('Registered as a voter successfully!');
        } else {
            alert('Some error occurred!');
        }
    };

    const handleRegisterCandidate = async () => {
        try {
            await registerCandidate(eventId, userKey); // Pass event ID and key
            alert('Registered as a candidate successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to register as a candidate: ' + error.message);
        }
    };

    const handleCastVote = async (candidate) => {
        try {
            await castVote(eventId, candidate, userKey); // Pass event ID and candidate
            alert(`Successfully voted for ${candidate}!`);
        } catch (error) {
            console.error('Error casting vote:', error);
            alert('Failed to cast vote: ' + error.message);
        }
    };

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
                            {candidate} - Votes : {(votes[index]).toString()}
                            <button 
                                onClick={() => handleCastVote(candidate)} 
                                style={{ marginLeft: '10px' }}
                            >
                                Vote for {candidate}
                            </button>
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
