"use client";
import MetaMaskLoader from '@/components/MetaMaskLoader';
import WalletButton from '@/components/WalletButton';
import { useVoting } from '@/context/VotingContext';
import React, { useState } from 'react';

const CreateCampaign = () => {

  const {createCampaign, account, connectWallet, disconnectWallet, loading} = useVoting();
  // State management for each field
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [key, setKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxCandidates, setMaxCandidates] = useState('');

  // Error state for validation messages
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    const currentTime = new Date();
    const selectedStartTime = new Date(startTime);
    const selectedEndTime = new Date(endTime);
    const diffInMilliseconds = selectedStartTime - currentTime;
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
    const timeDifferenceInMinutes = (selectedEndTime - selectedStartTime) / (1000 * 60);

    const validationErrors = {};

    // Validate access keys match
    if (key !== confirmKey) {
      validationErrors.keyError = "Access key and confirm key do not match!";
    }

    // Validate max candidates is at least 2
    if (maxCandidates < 2) {
      validationErrors.candidatesError = "Maximum candidates must be at least 2.";
    }

    // Validate start time is at least 2.5 hours from the current time
    if (diffInHours < 2.5) {
      validationErrors.startTimeError = "Start time must be at least 2.5 hours from now.";
    }

    // Validate end time is at least 30 minutes after the start time
    if (timeDifferenceInMinutes < 30) {
      validationErrors.endTimeError = "End time must be at least 30 minutes after the start time.";
    }

    // If there are errors, set them in the state
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // If no errors, reset errors and proceed with form submission
    setErrors({});
    console.log({
      name,
      purpose,
      key,
      startTime,
      endTime,
      maxCandidates,
    });

    // Convert values to the required formats
    const startTimeUnix = Math.floor(selectedStartTime.getTime() / 1000); // Convert to seconds
    const endTimeUnix = Math.floor(selectedEndTime.getTime() / 1000); // Convert to seconds
    const duration = endTimeUnix - startTimeUnix;

    // Call the createCampaign function with required parameters
    createCampaign(name, purpose, key, startTimeUnix, duration, maxCandidates);
  };

  return (

    

    <div className="flex items-center min-h-screen w-full ">
      <MetaMaskLoader loading={loading}/>
<WalletButton  isConnected={!!account} 
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}/> 
      <div className="container mx-auto px-8">
        <div className="max-w-full my-10 bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
          <div className="text-center">
            <h1 className="my-3 text-4xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Create Campaign
            </h1>
            <p className="text-gray-400" style={{ fontFamily: 'Roboto Mono, monospace' }}>
              Fill in the details below to create a campaign.
            </p>
          </div>
          <div className="m-7">
            <form onSubmit={handleSubmit}>
              {/* Campaign Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 mt-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              {/* Purpose */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Purpose
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 mt-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter campaign purpose"
                  required
                />
              </div>

              {/* Access Key */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Access Key
                </label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full px-3 py-2 mt-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Set a campaign access key"
                  required
                />
                {errors.keyError && (
                  <p className="text-red-500 text-sm mt-2">{errors.keyError}</p>
                )}
              </div>

              {/* Confirm Access Key */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Confirm Access Key
                </label>
                <input
                  type="password"
                  value={confirmKey}
                  onChange={(e) => setConfirmKey(e.target.value)}
                  className="w-full px-3 py-2 mt-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Confirm your access key"
                  required
                />
              </div>

              {/* Start Time */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 mt-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {errors.startTimeError && (
                  <p className="text-red-500 text-sm mt-2">{errors.startTimeError}</p>
                )}
              </div>

              {/* End Time */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 mt-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {errors.endTimeError && (
                  <p className="text-red-500 text-sm mt-2">{errors.endTimeError}</p>
                )}
              </div>

              {/* Maximum Candidates */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Max Candidates
                </label>
                <input
                  type="number"
                  value={maxCandidates}
                  onChange={(e) => setMaxCandidates(e.target.value)}
                  className="w-full px-3 py-2 mt-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter maximum number of candidates"
                  required
                />
                {errors.candidatesError && (
                  <p className="text-red-500 text-sm mt-2">{errors.candidatesError}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="mb-6">
                <button
                  type="submit"
                  className="w-full px-3 py-4 text-white bg-indigo-600 rounded-md focus:bg-indigo-700 hover:bg-indigo-500 transition-all duration-300 ease-in-out"
                  style={{ fontFamily: 'Roboto Mono, monospace' }}
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
