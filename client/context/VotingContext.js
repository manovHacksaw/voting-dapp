"use client";

import { ethers } from "ethers";
import { createContext, useState, useEffect, useContext } from "react";
import { Voting } from "@/lib/constants";

const VotingContext = createContext();

export const VotingProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [provider, setProvider] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const contractABI = Voting.abi;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    const loadContract = async () => {
        const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        

        // Create a provider even if wallet is not connected
        const providerInstance = new ethers.BrowserProvider(window.ethereum || new ethers.JsonRpcProvider('https://rpc.cardona.zkevm-rpc.com'));

        
        
        // Initialize contract instance
        const contractInstance = new ethers.Contract(contractAddress, contractABI, providerInstance);
        setContract(contractInstance);
    };

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const providerInstance = new ethers.BrowserProvider(window.ethereum);
                setProvider(providerInstance);

                // Chain ID for Polygon Cardano Testnet
                const polygonCardanoTestnetChainId = '0x98a'; // Hexadecimal for 2442

                // Check the current network and switch to Polygon Cardano Testnet if needed
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });

                if (chainId !== polygonCardanoTestnetChainId) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: polygonCardanoTestnetChainId }]
                        });
                    } catch (switchError) {
                        if (switchError.code === 4902) {
                            try {
                                await window.ethereum.request({
                                    method: 'wallet_addEthereumChain',
                                    params: [{
                                        chainId: polygonCardanoTestnetChainId,
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
                                console.error('Error adding Polygon Cardano Testnet:', addError);
                            }
                        } else {
                            console.error('Error switching to Polygon Cardano Testnet:', switchError);
                        }
                    }
                }

                const accounts = await providerInstance.send('eth_requestAccounts', []);
                setAccount(accounts[0]);

                const balance = await providerInstance.getBalance(accounts[0]);
                const formattedBalance = ethers.formatEther(balance);
                loadContract();
                setBalance(formattedBalance); 
                setIsConnected(true);
                getCampaigns(); // Fetch campaigns after connecting
            } catch (error) {
                console.error("Error connecting to wallet: ", error);
            }
        } else {
            alert("MetaMask is required to use this app.");
            window.open('https://metamask.io/download.html', '_blank');
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setIsConnected(false);
        setBalance("0.000");
        loadContract();
        
    };

    const createCampaign = async (name, purpose, key, startTime, duration, maxCandidates) => {

     const providerInstance = new ethers.BrowserProvider(window.ethereum || new ethers.JsonRpcProvider('https://rpc.cardona.zkevm-rpc.com'));

        
     const signer = providerInstance.getSigner();
     // Initialize contract instance
     const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
     
        if (!contract) {
            console.error("Provider is not set. Please connect your wallet.");
            return;
        }

        try {
            setLoading(true);
            const transaction = await contractInstance.createVotingEvent(name, purpose, key, startTime, duration, maxCandidates);
            await transaction.wait();
            console.log("Campaign created successfully:", transaction);
            getCampaigns(); // Refresh campaigns after creation
        } catch (error) {
            console.error("Error creating campaign:", error);
        } finally {
            setLoading(false);
        }
    };

    const getCampaigns = async () => {
     
        

        setLoading(true);
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const contractInstance = new ethers.Contract(contractAddress, contractABI, provider);
            const n = await contractInstance.eventCount(); // Get total number of events
            const campaignsArray = [];

            // Loop through each event ID
            for (let i = 0; i < n; i++) {
                const event = await contractInstance.getVotingEvent(i); // Fetch event details
                campaignsArray.push(event); // Add event details to the array
            }

            setCampaigns(campaignsArray);
            console.log(campaignsArray[0]); // Log all campaigns
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const getCampaignById = async(id) => {
     const provider = new ethers.BrowserProvider(window.ethereum)
     const contractInstance = new ethers.Contract(contractAddress, contractABI, provider);
          const event = await contractInstance.getVotingEvent(Number(id));
          console.log(event.name);

          return event;
    }

    useEffect(() => {
        loadContract();
    }, []);

    useEffect(() => {
        // If the user has already connected their wallet, we could automatically reconnect
        if (account) {
          loadContract();
            getCampaigns(); // Fetch campaigns after connecting
        }
    }, [account]);

    return (
        <VotingContext.Provider value={{ account, balance, contract, isConnected, loading, connectWallet, disconnectWallet, createCampaign, getCampaigns, campaigns, getCampaignById }}>
            {children}
        </VotingContext.Provider>
    );
};

export const useVoting = () => useContext(VotingContext);
