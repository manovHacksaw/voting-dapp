"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Voting } from '../constants';

const VotingContext = createContext();

export const VotingProvider = ({ children }) => {
     const [account, setAccount] = useState(null);
     const [provider, setProvider] = useState(null);
     const [signer, setSigner] = useState(null);
     const [votingEvents, setVotingEvents] = useState([]);
     const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
     console.log(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);

     const connectWallet = async () => {
          if (window.ethereum) {
               try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    if (accounts.length > 0) setAccount(accounts[0]);
               } catch (error) {
                    console.error("Error connecting to wallet:", error);
               }
          } else {
               alert('Please install MetaMask!');
          }
     };

     // Set provider and signer when account changes
     useEffect(() => {
          const initializeProvider = async () => {
               const provider = new ethers.BrowserProvider(window.ethereum);
               const signer = await provider.getSigner();
               setProvider(provider);
               setSigner(signer);
          };

          if (account) {
               initializeProvider();
          }
     }, [account]);

     useEffect(() => {
          console.log("Fetching voting events...");
          const fetchVotingEvents = async () => {
               if (account && signer) {
                    const contractInstance = new ethers.Contract(contractAddress, Voting.abi, signer);
                    const count = await contractInstance.getEventCount();
                    const events = [];

                    for (let i = 0; i < count; i++) {
                         const event = await contractInstance.votingEvents(i);
                         events.push(event);
                    }

                    setVotingEvents(events);
                    console.log("Fetched events:", events); // Check if events are being fetched correctly
               }
          };

          fetchVotingEvents();
     }, [account, signer]);


     const createVotingEvent = async (name, purpose, key) => {
          if (!signer) {
               throw new Error('Wallet not connected');
          }

          const contractInstance = new ethers.Contract(contractAddress, Voting.abi, signer);
          try {
               const tx = await contractInstance.createVotingEvent(name, purpose, key);
               await tx.wait(); // Wait for the transaction to be mined
               console.log('Voting event created:', { name, purpose, key });
               return true; // Return true on success
          } catch (error) {
               console.error('Error creating voting event:', error);
               return false; // Return false on failure
          }
     };

     const registerVoter = async (eventId, key) => {
          if (!signer) {
               throw new Error('Wallet not connected');
          }

          const contractInstance = new ethers.Contract(contractAddress, Voting.abi, signer);
          try {
               const tx = await contractInstance.registerVoter(eventId, key); // Assuming registerVoter takes an eventId and key
               await tx.wait(); // Wait for the transaction to be mined
               console.log('Successfully registered as voter for event:', eventId);
               return true; // Return true on success
          } catch (error) {
               console.error('Error registering as voter:', error);
               return false; // Return false on failure
          }
     };


     const registerCandidate = async (eventId, key) => {
          if (!signer) {
               throw new Error('Wallet not connected');
          }

          const contractInstance = new ethers.Contract(contractAddress, Voting.abi, signer);
          try {
               const tx = await contractInstance.registerCandidate(eventId, key);
               await tx.wait(); // Wait for the transaction to be mined
               console.log('Successfully registered as candidate for event:', eventId);
               return true; // Return true on success
          } catch (error) {
               console.error('Error registering as candidate:', error);
               return false; // Return false on failure
          }
     };

     const getResults = async (eventId) => {
          if (!signer) {
               throw new Error('Wallet not connected');
          }

          const contractInstance = new ethers.Contract(contractAddress, Voting.abi, signer);
          try {
               const [candidates, votes] = await contractInstance.getResults(eventId);
               console.log('Results fetched for event:', eventId, 'Candidates:', candidates, 'Votes:', votes);
               return { candidates, votes }; // Return the candidates and their votes
          } catch (error) {
               console.error('Error fetching results:', error);
               return { candidates: [], votes: [] }; // Return empty arrays on failure
          }
     };

     const castVote = async (eventId, candidate, key) => {
          if (!signer) {
               throw new Error('Wallet not connected');
          }

          const contractInstance = new ethers.Contract(contractAddress, Voting.abi, signer);

          try {
               const tx = await contractInstance.vote(eventId, candidate, key);
               await tx.wait();
               console.log("Successfully voted for: ", candidate);
               return true;

          } catch (error) {
               console.error("Error casting vote: ", error);
               return false;
          }
     }


     return (
          <VotingContext.Provider value={{ account, votingEvents, connectWallet, signer, createVotingEvent, registerVoter, registerCandidate, getResults, castVote }}>
               {children}
          </VotingContext.Provider>
     );
};

export const useVoting = () => {
     return useContext(VotingContext);
};
