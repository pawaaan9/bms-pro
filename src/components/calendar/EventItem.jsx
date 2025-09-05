import React from 'react';

const EventItem = ({ event, onClick }) => {
  const statusClasses = {
    CONFIRMED: 'bg-blue-100 border-l-4 border-blue-500 text-blue-800',
    TENTATIVE: 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800',
    BLOCKOUT: 'bg-gray-100 border-l-4 border-gray-400 text-gray-600',
  };

  const bufferHeight = '10px';

  return (
    <button 
      onClick={() => onClick(event)}
      className={`h-full w-full rounded-md p-2 text-left text-xs transition-all hover:ring-2 hover:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-20 ${statusClasses[event.status]}`}
      aria-label={`${event.title} from ${event.start.toLocaleTimeString()} to ${event.end.toLocaleTimeString()}`}
    >
      {event.hasBuffer && <div style={{ height: bufferHeight }} className="bg-blue-200 opacity-50 rounded-t-md -m-2 mb-1" />}
      <div className="font-bold truncate">{event.title}</div>
      <div className="truncate">{event.customer}</div>
      {event.hasBuffer && <div style={{ height: bufferHeight }} className="bg-blue-200 opacity-50 rounded-b-md -m-2 mt-1" />}
    </button>
  );
};

export default EventItem;