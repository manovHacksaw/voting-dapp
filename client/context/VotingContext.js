"use client"

import { ethers } from "ethers";
import { createContext, useState, useEffect, useContext } from "react";

const VotingContext = createContext();

export const VotingProvider = ({ children }) => {
     const [account, setAccount] = useState(null);
     const [balance, setBalance] = useState(null)
     const [provider, setProvider] = useState(null);
     const [isConnected, setIsConnected] = useState(false);



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
                              // Try to switch to Polygon Cardano Testnet
                              await window.ethereum.request({
                                   method: 'wallet_switchEthereumChain',
                                   params: [{ chainId: polygonCardanoTestnetChainId }]
                              });
                         } catch (switchError) {
                              // If the network hasn't been added to MetaMask, we add it
                              if (switchError.code === 4902) {
                                   try {
                                        await window.ethereum.request({
                                             method: 'wallet_addEthereumChain',
                                             params: [
                                                  {
                                                       chainId: polygonCardanoTestnetChainId,
                                                       chainName: 'Polygon zkEVM Cardano Testnet',
                                                       rpcUrls: ['https://rpc.cardona.zkevm-rpc.com'], // Replace with the actual RPC URL
                                                       nativeCurrency: {
                                                            name: 'Cardano Testnet Coin',
                                                            symbol: 'ETH',
                                                            decimals: 18
                                                       },
                                                       blockExplorerUrls: ['https://cardona-zkevm.polygonscan.com/'] // Replace with the actual block explorer URL
                                                  }
                                             ]
                                        });
                                   } catch (addError) {
                                        console.error('Error adding Polygon Cardano Testnet:', addError);
                                   }
                              } else {
                                   console.error('Error switching to Polygon Cardano Testnet:', switchError);
                              }
                         }
                    }

                    // Request account access
                    const accounts = await providerInstance.send('eth_requestAccounts', []);
                    setAccount(accounts[0]);




                    const balance = await providerInstance.getBalance(accounts[0]);
                    const formattedBalance = await ethers.formatEther(balance);
                    setBalance(formattedBalance); // Convert balance to ETH format

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
          setBalance("0.000"); // Reset balance or handle as needed
        };


     useEffect(() => {
          // If the user has already connected their wallet, we could automatically reconnect
          if (account) {
               connectWallet();
          }
     }, []);

     return <VotingContext.Provider value={{ account, balance, isConnected, connectWallet, disconnectWallet }} >
          {children}
     </VotingContext.Provider>

}

export const useVoting = () => useContext(VotingContext);