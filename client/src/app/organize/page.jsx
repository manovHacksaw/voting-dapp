"use client"
import React, { useState } from 'react';
import { useVoting } from "@/context/VotingContext";

const OrganizeVoting = () => {
     // Get createVotingEvent from the Voting context
     const { account, connectWallet, createVotingEvent } = useVoting();

     const [name, setName] = useState('');
     const [purpose, setPurpose] = useState('');
     const [key, setKey] = useState('');
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');

     const handleSubmit = async (e) => {
          e.preventDefault();
          setLoading(true);
          setError('');

          try {
               const success = await createVotingEvent(name, purpose, key);
               if (success) {
                    alert('Voting event created successfully!');
                    setName('');
                    setPurpose('');
                    setKey('');
               } else {
                    setError('Failed to create voting event. Please try again.');
               }
          } catch (err) {
               console.error(err);
               setError('Failed to create voting event. Please try again.');
          } finally {
               setLoading(false);
          }
     };

     return (
          <div>
                <h1>Organize a Voting Event</h1>
            {!account ? (
                <div>
                    <p>Please connect your wallet to organize a voting event.</p>
                    <button onClick={connectWallet}>Connect Wallet</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name">Event Name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="purpose">Event Purpose:</label>
                        <input
                            type="text"
                            id="purpose"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="key">Access Key:</label>
                        <input
                            type="text"
                            id="key"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Voting Event'}
                    </button>
                </form>
            )}
          </div>
     );
};

export default OrganizeVoting;
