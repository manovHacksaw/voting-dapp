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

     const registerVoter = async () => {

     }

     const registerCandidate = async () => {

     }

     return (
          <VotingContext.Provider value={{ account, votingEvents, connectWallet, signer, createVotingEvent, registerVoter, registerCandidate }}>
               {children}
          </VotingContext.Provider>
     );
};

export const useVoting = () => {
     return useContext(VotingContext);
};
