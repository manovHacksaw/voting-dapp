import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ startTime, endTime }) => {
  const [timeState, setTimeState] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    type: 'upcoming' // 'upcoming', 'ongoing', or 'ended'
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const start = Number(startTime);
      const end = Number(endTime);
      let remainingTime;
      let countdownType;

      // If current time is before start time, countdown to start
      if (now < start) {
        remainingTime = start - now;
        countdownType = 'upcoming';
      }
      // If current time is between start and end, countdown to end
      else if (now >= start && now < end) {
        remainingTime = end - now;
        countdownType = 'ongoing';
      }
      // If current time is after end time
      else {
        remainingTime = 0;
        countdownType = 'ended';
      }

      if (remainingTime <= 0) {
        setTimeState({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
          type: 'ended'
        });
        return true; // Return true to indicate countdown has finished
      }

      // Calculate time units
      const days = String(Math.floor(remainingTime / 86400)).padStart(2, '0');
      const hours = String(Math.floor((remainingTime % 86400) / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((remainingTime % 3600) / 60)).padStart(2, '0');
      const seconds = String(remainingTime % 60).padStart(2, '0');

      setTimeState({
        days,
        hours,
        minutes,
        seconds,
        type: countdownType
      });

      return false; // Return false to indicate countdown is still running
    };

    // Initial calculation
    const isFinished = calculateTimeRemaining();
    if (isFinished) return;

    // Set up interval for updates
    const interval = setInterval(() => {
      const isFinished = calculateTimeRemaining();
      if (isFinished) {
        clearInterval(interval);
      }
    }, 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, [startTime, endTime]);

  const getStatusColor = () => {
    switch (timeState.type) {
      case 'upcoming':
        return 'text-yellow-500';
      case 'ongoing':
        return 'text-green-500';
      case 'ended':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusMessage = () => {
    switch (timeState.type) {
      case 'upcoming':
        return 'Voting Starts In:';
      case 'ongoing':
        return 'Voting Ends In:';
      case 'ended':
        return 'Voting Has Ended';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className={`w-5 h-5 ${getStatusColor()}`} />
            <span className={`font-semibold ${getStatusColor()}`}>
              {getStatusMessage()}
            </span>
          </div>
        </div>
        
        {timeState.type !== 'ended' && (
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{timeState.days}</span>
              <span className="text-sm text-gray-500">Days</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{timeState.hours}</span>
              <span className="text-sm text-gray-500">Hours</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{timeState.minutes}</span>
              <span className="text-sm text-gray-500">Minutes</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{timeState.seconds}</span>
              <span className="text-sm text-gray-500">Seconds</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CountdownTimer;