"use client";

import { ethers } from "ethers";
import { createContext, useState, useEffect, useContext, useMemo } from "react";
import { Voting } from "@/lib/constants";

const VotingContext = createContext();

export const VotingProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState("0.000");
    const [provider, setProvider] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const contractABI = Voting.abi;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    const loadContract = async (signer = null) => {
        const providerInstance = new ethers.BrowserProvider(window.ethereum || new ethers.JsonRpcProvider('https://rpc.cardona.zkevm-rpc.com'));
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer ? signer : providerInstance);
        setContract(contractInstance);
        return contractInstance;
    };

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const providerInstance = new ethers.BrowserProvider(window.ethereum);
                setProvider(providerInstance);

                const polygonCardanoTestnetChainId = '0x98a'; // Hexadecimal for 2442
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });

                // Switch to the correct network
                if (chainId !== polygonCardanoTestnetChainId) {
                    await switchNetwork(polygonCardanoTestnetChainId);
                }

                const accounts = await providerInstance.send('eth_requestAccounts', []);
                setAccount(accounts[0]);

                const balance = await providerInstance.getBalance(accounts[0]);
                setBalance(ethers.formatEther(balance));
                setIsConnected(true);

                await loadContract();
                await getCampaigns(); // Fetch campaigns after connecting
            } catch (error) {
                console.error("Error connecting to wallet: ", error);
            }
        } else {
            alert("MetaMask is required to use this app.");
            window.open('https://metamask.io/download.html', '_blank');
        }
    };

    const switchNetwork = async (chainId) => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId }]
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                await addNetwork(chainId);
            } else {
                console.error('Error switching networks:', switchError);
            }
        }
    };

    const addNetwork = async (chainId) => {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId,
                    chainName: 'Polygon zkEVM Cardano Testnet',
                    rpcUrls: ['https://rpc.cardona.zkevm-rpc.com'],
                    nativeCurrency: {
                        name: 'Cardano Testnet Coin',
                        symbol: 'ETH',
                        decimals: 18
                    },
                    blockExplorerUrls: ['https://cardona-zkevm.polygonscan.com/']
                }]
            });
        } catch (addError) {
            console.error('Error adding network:', addError);
        }
    };
    

    const disconnectWallet = () => {
        setAccount(null);
        setIsConnected(false);
        setBalance("0.000");
        loadContract();
    };

    const createCampaign = async (name, purpose, key, startTime, duration, maxCandidates) => {
        const signer = await provider.getSigner();
        const contract = await loadContract(signer);

        if (!contract) {
            console.error("Provider is not set. Please connect your wallet.");
            return false;
        }

        try {
            setLoading(true);
            const transaction = await contract.createVotingEvent(name, purpose, key, startTime, duration, maxCandidates);
            await transaction.wait(); // Wait for the transaction to be confirmed
            console.log("Campaign created successfully:", transaction);
            await getCampaigns(); // Refresh campaigns after creation
            return true; // Return true if the campaign creation is successful
        } catch (error) {
            console.error("Error creating campaign:", error);
            return false; // Return false if an error occurs
        } finally {
            setLoading(false); // Ensure loading state is reset
        }
    };

    const getCampaigns = async () => {
        setLoading(true);
        try {
            const contract = await loadContract();
            const n = await contract.eventCount(); // Get total number of events
            const campaignsArray = [];

            // Loop through each event ID
            for (let i = 0; i < n; i++) {
                const event = await contract.getVotingEvent(i); // Fetch event details
                campaignsArray.push(event); // Add event details to the array
            }

            setCampaigns(campaignsArray);
            console.log("Fetched campaigns:", campaignsArray);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const getCampaignById = async (id) => {
        const contract = await loadContract();
        const event = await contract.getVotingEvent(Number(id));
        console.log("Campaign details:", event);
        return event;
    }

    useEffect(() => {
        loadContract(); // Load contract on initial render
    }, []);

    useEffect(() => {
        // If the user has already connected their wallet, automatically reconnect and fetch campaigns
        if (account) {
            loadContract();
            getCampaigns(); // Fetch campaigns after connecting
        }
    }, [account]);

    return (
        <VotingContext.Provider value={{ 
            account, 
            balance, 
            contract, 
            isConnected, 
            loading, 
            connectWallet, 
            disconnectWallet, 
            createCampaign, 
            getCampaigns, 
            campaigns, 
            getCampaignById 
        }}>
            {children}
        </VotingContext.Provider>
    );
};

export const useVoting = () => useContext(VotingContext);
