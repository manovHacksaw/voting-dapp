"use client";
// NEXT_PUBLIC_CONTRACT_ADDRESS=0x1F181E2d3d224893ACa8740d3a76864D4C1a3FfA
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
    const providerInstance = new ethers.BrowserProvider(
      window.ethereum ||
        new ethers.JsonRpcProvider("https://rpc.cardona.zkevm-rpc.com")
    );
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractABI,
      signer ? signer : providerInstance
    );
    setContract(contractInstance);
    return contractInstance;
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const providerInstance = new ethers.BrowserProvider(window.ethereum);
        setProvider(providerInstance);

        const polygonCardanoTestnetChainId = "0x98a"; // Hexadecimal for 2442
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        if (chainId !== polygonCardanoTestnetChainId) {
          await switchNetwork(polygonCardanoTestnetChainId);
        }

        const accounts = await providerInstance.send("eth_requestAccounts", []);
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
      window.open("https://metamask.io/download.html", "_blank");
    }
  };

  const switchNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await addNetwork(chainId);
      } else {
        console.error("Error switching networks:", switchError);
      }
    }
  };

  const addNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId,
            chainName: "Polygon zkEVM Cardano Testnet",
            rpcUrls: ["https://rpc.cardona.zkevm-rpc.com"],
            nativeCurrency: {
              name: "Cardano Testnet Coin",
              symbol: "ETH",
              decimals: 18,
            },
            blockExplorerUrls: ["https://cardona-zkevm.polygonscan.com/"],
          },
        ],
      });
    } catch (addError) {
      console.error("Error adding network:", addError);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setBalance("0.000");
    loadContract();
  };

  const createCampaign = async (
    name,
    purpose,
    key,
    startTime,
    duration,
    maxCandidates
  ) => {
    const signer = await provider.getSigner();
    const contract = await loadContract(signer);

    if (!contract) {
      console.error("Provider is not set. Please connect your wallet.");
      return false;
    }

    try {
      setLoading(true);
      const transaction = await contract.createVotingEvent(
        name,
        purpose,
        key,
        startTime,
        duration,
        maxCandidates
      );
      await transaction.wait();
      console.log("Campaign created successfully:", transaction);
      await getCampaigns(); // Refresh campaigns after creation
      return true;
    } catch (error) {
      console.error("Error creating campaign:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCampaigns = async () => {
    setLoading(true);
    try {
      const contract = await loadContract();
      const n = await contract.eventCount();
      const campaignsArray = [];

      for (let i = 0; i < n; i++) {
        const event = await contract.getVotingEvent(i);
        campaignsArray.push(event);
      }

      setCampaigns(campaignsArray);
      console.log("Fetched campaigns:", campaignsArray);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add this function to fetch candidates for a specific voting event
  const getCandidates = async (eventId) => {
    setLoading(true);
    try {
      const contract = await loadContract();
      const candidatesArray = await contract.getCandidates(eventId); // Directly fetch candidates for the given eventId

      console.log(
        `Fetched candidates for event ID ${eventId}:`,
        candidatesArray
      );
      return candidatesArray;
    } catch (error) {
      console.error("Error fetching candidates:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const approveCandidate = async (eventId, candidateAddress) => {
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = await loadContract(signer);
      const tx = await contract.approveCandidate(eventId, candidateAddress);
      await tx.wait();
      console.log(
        `Candidate ${candidateAddress} approved for event ${eventId}`
      );
    } catch (error) {
      console.error("Error approving candidate:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCampaignById = async (id) => {
    const contract = await loadContract();
    const event = await contract.getVotingEvent(Number(id));
    console.log("Campaign details:", event);
    return event;
  };

  // Register as a candidate for a specific voting event
  const registerAsCandidate = async (eventId, name, key) => {
    const signer = await provider.getSigner();
    const contract = await loadContract(signer);

    try {
      setLoading(true);
      const transaction = await contract.registerCandidate(eventId, name, key);
      await transaction.wait();
      console.log(
        `Successfully registered as a candidate for event ID: ${eventId}`
      );
      return true;
    } catch (error) {
      console.error("Error registering as a candidate:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (eventId, candidateAddress) => {
    const signer = await provider.getSigner();
    const contract = await loadContract(signer);

    try {
      setLoading(true);
      const transaction = await contract.vote(eventId, candidateAddress);
      await transaction.wait();
      console.log(
        `Successfully voted for candidate ${candidateAddress} in event ${eventId}`
      );
      return true;
    } catch (error) {
      console.error("Error casting vote:", error.message);
      throw error; // Propagate error to handle in UI
    } finally {
      setLoading(false);
    }
  };

  const getVoteCount = async (eventId, candidateAddress) => {
    const contract = await loadContract();
    try {
      const voteCount = await contract.getVoteCount(eventId, candidateAddress);
      console.log(Number(voteCount));
      return Number(voteCount); // Convert BigNumber to a regular number
    } catch (error) {
      console.error("Error fetching vote count:", error);
      return null;
    }
  };

  const registerAsVoter = async (eventId, key) => {
    const signer = await provider.getSigner();
    const contract = await loadContract(signer);

    try {
      setLoading(true);
      const transaction = await contract.registerVoter(eventId, key); // Pass the key here
      await transaction.wait();
      console.log(
        `Successfully registered as a voter for event ID: ${eventId}`
      );
      return true;
    } catch (error) {
      console.error("Error registering as a voter:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContract();
  }, []);

  useEffect(() => {
    if (account) {
      loadContract();
      getCampaigns();
    }
  }, [account]);

  const getVotingResults = async (eventId) => {
    const signer = await provider.getSigner();
    const contract = await loadContract(signer);
    try {
      const winner = await contract.getVotingResults(eventId);
      console.log("Winning Candidate Address:", winner);
      return winner;
    } catch (error) {
      console.error("Error getting voting results:", error);
      return null;
    }
  };

  const endVotingEvent = async (eventId) => {
    const signer = await provider.getSigner();
    const contract = await loadContract(signer);

    try {
      const tx = await contract.endVotingEvent(eventId);
      await tx.wait(); // Wait for the transaction to be confirmed
      console.log("Voting event ended successfully");
    } catch (error) {
      console.error("Error ending voting event:", error);
    }
  };

  return (
    <VotingContext.Provider
      value={{
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
        getCampaignById,
        registerAsCandidate,
        getCandidates,
        registerAsVoter,
        approveCandidate,
        castVote,
        getVoteCount,
        getVotingResults,
        endVotingEvent,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};

export const useVoting = () => useContext(VotingContext);
