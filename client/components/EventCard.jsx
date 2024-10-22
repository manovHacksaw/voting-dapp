// EventCard.jsx
import { useRouter } from 'next/navigation';
import React from 'react';

const EventCard = ({ event, index }) => {
    const router = useRouter();

    return (
        <div 
            onClick={() => { router.push(`campaign/${index}`) }} 
            className="bg-white shadow-md rounded-lg p-4 m-4 cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-lg "
        >
            <h3 className="text-lg text-purple-950 font-bold">{event.name}</h3>
            <p className="text-gray-700">Purpose: {event.purpose}</p>
            <p className="text-gray-600">Organizer: {event.organizer}</p>
            <p className="text-gray-600">Start Time: {new Date(Number(event.startTime) * 1000).toLocaleString()}</p>
            <p className="text-gray-600">End Time: {new Date(Number(event.endTime) * 1000).toLocaleString()}</p>
            <p className={`text-sm ${event.active ? 'text-green-600' : 'text-red-600'}`}>
                Status: {event.active ? 'Active' : 'Inactive'}
            </p>
        </div>
    );
};

export default EventCard;