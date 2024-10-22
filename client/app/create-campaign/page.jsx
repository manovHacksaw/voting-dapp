"use client"; 
import MetaMaskLoader from '@/components/MetaMaskLoader';
import { Toaster } from '@/components/ui/toaster';
import WalletButton from '@/components/WalletButton';
import { useVoting } from '@/context/VotingContext';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const CreateCampaign = () => {
  const router = useRouter();
  const { createCampaign, account, connectWallet, disconnectWallet, loading } = useVoting();
  
  // State management for each field
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [key, setKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxCandidates, setMaxCandidates] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // For loading state

  const validateForm = () => {
    const currentTime = new Date();
    const selectedStartTime = new Date(startTime);
    const selectedEndTime = new Date(endTime);
    const diffInMilliseconds = selectedStartTime - currentTime;
    const diffInHours = diffInMilliseconds / (1000 * 60 * 60);
    const timeDifferenceInMinutes = (selectedEndTime - selectedStartTime) / (1000 * 60);
    
    const validationErrors = {};
    
    if (key !== confirmKey) {
      validationErrors.keyError = "Access key and confirm key do not match!";
    }

    if (maxCandidates < 2) {
      validationErrors.candidatesError = "Maximum candidates must be at least 2.";
    }

    if (diffInHours < 2.5) {
      validationErrors.startTimeError = "Start time must be at least 2.5 hours from now.";
    }

    if (timeDifferenceInMinutes < 30) {
      validationErrors.endTimeError = "End time must be at least 30 minutes after the start time.";
    }

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    console.log({
      name,
      purpose,
      key,
      startTime,
      endTime,
      maxCandidates,
    });

    const startTimeUnix = Math.floor(new Date(startTime).getTime() / 1000); // Convert to seconds
    const endTimeUnix = Math.floor(new Date(endTime).getTime() / 1000); // Convert to seconds
    const duration = endTimeUnix - startTimeUnix;

    setIsSubmitting(true); // Start loading state

    try {
      const success = await createCampaign(name, purpose, key, startTimeUnix, duration, maxCandidates);
      if (success) {
        router.push("/");
      } else {
        setErrors({ submitError: "Failed to create campaign. Please try again." });
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      setErrors({ submitError: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false); // End loading state
    }
  };

  const showToast = () =>{
    toast({
      title: "Campaign Created",
      description: `Share the campaign link to let others participate.`,
      status: "success",
    });
    router.push("/");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center  px-4 py-6">
      <MetaMaskLoader loading={loading} />
      <Toaster />

      {/* Wallet Button positioned in the top-right */}
      <div className="absolute top-6 right-6">
        <WalletButton 
          isConnected={!!account} 
          onConnect={connectWallet} 
          onDisconnect={disconnectWallet} 
        />
      </div>

      <div className="max-w-2xl w-full bg-gray-800 p-10 rounded-2xl shadow-xl border border-gray-700">
        <h1 className="text-center text-3xl font-bold text-white mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Create Campaign
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Campaign Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 px-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter campaign name"
              required
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Purpose</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full mt-2 px-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter campaign purpose"
              required
            />
          </div>

          {/* Access Key and Confirm Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">Access Key</label>
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full mt-2 px-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Set a campaign access key"
                required
              />
              {errors.keyError && (
                <p className="text-red-500 text-sm mt-2">{errors.keyError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Confirm Access Key</label>
              <input
                type="password"
                value={confirmKey}
                onChange={(e) => setConfirmKey(e.target.value)}
                className="w-full mt-2 px-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Confirm your access key"
                required
              />
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full mt-2 px-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {errors.startTimeError && (
              <p className="text-red-500 text-sm mt-2">{errors.startTimeError}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full mt-2 px-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {errors.endTimeError && (
              <p className="text-red-500 text-sm mt-2">{errors.endTimeError}</p>
            )}
          </div>

          {/* Maximum Candidates */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Maximum Candidates</label>
            <input
              type="number"
              value={maxCandidates}
              onChange={(e) => setMaxCandidates(e.target.value)}
              className="w-full mt-2 px-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter maximum number of candidates"
              required
            />
            {errors.candidatesError && (
              <p className="text-red-500 text-sm mt-2">{errors.candidatesError}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 text-white font-semibold rounded-lg focus:outline-none ${isSubmitting ? 'bg-indigo-600 opacity-50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
          </button>
          {errors.submitError && (
            <p className="text-red-500 text-sm text-center mt-4">{errors.submitError}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;