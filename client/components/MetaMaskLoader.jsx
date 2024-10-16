"use client";

import Image from 'next/image';
import React from 'react';

const MetaMaskLoader = ({ loading }) => {
  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 font-poppins ">
          <div className="flex flex-col items-center p-10 bg-gray-950 rounded-lg shadow-lg relative ">
            {/* Spinning loader container */}
          
            <div className="mb-4 w-[125px] h-[125px] flex items-center justify-center">
              {/* Spinning border */}
              <div className="w-full h-full border-4 border-t-4 border-t-indigo-600 border-gray-600 rounded-full animate-spin"></div>
              {/* MetaMask Logo - stationary */}
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                width={70}
                height={70}
                alt="MetaMask Logo"
                className="absolute" // Keep logo centered a7d stationary
              />
            </div>
            <h2 className="text-xl text-white mb-2">Waiting for MetaMask Confirmation</h2>
            <p className="text-sm text-gray-400">Please accept the connection request in your wallet.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default MetaMaskLoader;
