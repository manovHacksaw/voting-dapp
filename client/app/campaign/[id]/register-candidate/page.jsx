"use client";
import { useVoting } from '@/context/VotingContext';
import React, { useState, useEffect } from 'react';
import MetaMaskLoader from '@/components/MetaMaskLoader';
import WalletInfo from '@/components/WalletInfo';

const RegisterCandidate = ({ params }) => {
    const { connectWallet, registerAsCandidate, isConnected, account, loading, balance, getCampaignById,  } = useVoting();
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [event, setEvent] = useState(null); // State to store event details
    const [error, setError] = useState('');
    const [registrationStatus, setRegistrationStatus] = useState(''); // Track registration status

    useEffect(() => {
        const fetchEvent = async () => {
            const fetchedEvent = await getCampaignById(params.id);
            setEvent(fetchedEvent);
        };

        fetchEvent();
    }, [params.id]);

//     useEffect(() => {
//         const checkRegistrationStatus = async () => {
//             if (isConnected && event) {
//                //  const isRegistered = await isCandidateRegistered(params.id, account);
//                 if (isRegistered) {
//                     setRegistrationStatus('You have registered, wait for approval.');
//                 } else {
//                     setRegistrationStatus('');
//                 }
//             }
//         };

//         checkRegistrationStatus();
//     }, [isConnected, event, account, params.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isConnected) {
            alert("Please connect your wallet first.");
            return;
        }

        try {
            await registerAsCandidate(params.id, name, key);
            // Reset the form after successful submission
            setName('');
            setKey('');
            setRegistrationStatus('You have registered, wait for approval.'); // Update registration status
        } catch (err) {
            setError('Failed to register candidate. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r p-6 relative">
            {/* Loader when connecting or during transactions */}
            <MetaMaskLoader loading={loading} />

            {/* Wallet Info Section */}
            <div className="absolute right-4 top-4">
                {isConnected ? (
                    <WalletInfo balance={balance} account={account} />
                ) : (
                    <button 
                        onClick={connectWallet} 
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
                    >
                        Connect Wallet
                    </button>
                )}
            </div>

            

            {/* Event details */}
            {event && (
                <div className="bg-white p-4 rounded-lg shadow-md mb-4 w-full max-w-md">
                    <h3 className="text-xl font-semibold mb-2">Event Details</h3>
                    <p><strong>Name:</strong> {event.name}</p>
                    <p><strong>Purpose:</strong> {event.purpose}</p>
                    <p><strong>Creator:</strong> {event.organizer}</p>
                    <p><strong>Start Time:</strong> {new Date(Number(event.startTime) * 1000).toLocaleString()}</p>
                    <p><strong>Status:</strong> <span className={`font-semibold ${event.active ? 'text-green-600' : 'text-red-600'}`}>{event.active ? 'Active' : 'Inactive'}</span></p>
                    <p><strong>Duration:</strong> {event.duration} seconds</p>
                </div>
            )}

            {/* Registration Status Message */}
            {registrationStatus && (
                <p className="text-yellow-500 mb-4">{registrationStatus}</p>
            )}

            {/* Candidate registration form */}
            <form onSubmit={handleSubmit} className="mt-5 p-6 bg-white shadow-md rounded-lg w-full max-w-md">
                <div className="mb-4">
                    <label htmlFor="name" className="block text-lg font-medium text-gray-700">Candidate Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="key" className="block text-lg font-medium text-gray-700">Security Key</label>
                    <input
                        type="password"
                        id="key"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                    />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition duration-200"
                >
                    {loading ? 'Registering...' : 'Register Candidate'}
                </button>
            </form>
        </div>
    );
};

export default RegisterCandidate;