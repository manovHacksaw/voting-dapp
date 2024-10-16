// EventCard.jsx
import React from 'react';

const EventCard = ({ event }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 m-2">
            <h3 className="text-lg text-purple-950 font-bold">{event.name}</h3>
            <p className="text-gray-700">Purpose: {event.purpose}</p>
            <p className="text-gray-600">Organizer: {event.organizer}</p>
            <p className="text-gray-600">  Start Time: {new Date(Number(event.startTime) * 1000).toLocaleString()}</p>
            <p className="text-gray-600">End Time: {new Date(Number(event.endTime) * 1000).toLocaleString()}</p>
            <p className={`text-sm ${event.active ? 'text-green-600' : 'text-red-600'}`}>
                Status: {event.active ? 'Active' : 'Inactive'}
            </p>
        </div>
    );
};

export default EventCard;
