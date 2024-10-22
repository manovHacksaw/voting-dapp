"use client";
import { useEffect, useState } from "react";
import { useVoting } from "@/context/VotingContext";
import MetaMaskLoader from "@/components/MetaMaskLoader";
import WalletInfo from "@/components/WalletInfo";

const RegisterVoter = ({ params }) => {
    const { connectWallet, registerAsVoter, isConnected, account, loading, balance, getCampaignById } = useVoting();
    const [key, setKey] = useState("");
    const [event, setEvent] = useState(null); // State to store event details

    useEffect(() => {
        const fetchEvent = async () => {
            const fetchedEvent = await getCampaignById(params.id);
            setEvent(fetchedEvent);
        };

        fetchEvent();
    }, [params.id]);

    const handleRegister = async () => {
        if (!isConnected) {
            alert("Please connect your wallet first.");
            return;
        }

        if (key) {
            await registerAsVoter(params.id, key);
        } else {
            alert("Please enter a valid key");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r  p-6 relative">
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

            {/* Title with Event Name */}
            {event && <h2 className="text-2xl font-bold text-white mb-6">Register as a Voter for {event.name}</h2>}

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

            {/* Voter registration form */}
            <input
                type="text"
                placeholder="Enter event key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="text-black mb-4 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 w-full max-w-md"
            />
            <button 
                onClick={handleRegister} 
                disabled={loading}
                className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                {loading ? "Registering..." : "Register"}
            </button>
        </div>
    );
};

export default RegisterVoter;