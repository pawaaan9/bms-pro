import React from 'react';
import { format, startOfWeek, addDays, getHours, getMinutes } from 'date-fns';
import EventItem from './EventItem';

const hours = Array.from({ length: 19 }, (_, i) => i + 6); // 6 AM to Midnight

const WeeklyCalendarGrid = ({ currentDate, events, onEventClick }) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getEventPosition = (event) => {
    const startHour = getHours(event.start);
    const startMinute = getMinutes(event.start);
    const endHour = getHours(event.end);
    const endMinute = getMinutes(event.end);

    const startTotalMinutes = (startHour * 60) + startMinute;
    const endTotalMinutes = (endHour * 60) + endMinute;

    const startRow = Math.floor((startTotalMinutes - (6 * 60)) / 15) + 1;
    const rowSpan = Math.floor((endTotalMinutes - startTotalMinutes) / 15);

    if (startRow < 1 || rowSpan <= 0) return null;

    return {
      gridRow: `${startRow} / span ${rowSpan}`,
    };
  };

  const eventsByDay = days.map(day => 
    events.filter(event => format(event.start, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
  );

  return (
    <div className="grid grid-cols-[auto_repeat(7,1fr)] min-w-[800px] h-full">
      {/* Time column */}
      <div className="row-start-2 col-start-1 grid">
        {hours.map(hour => (
          <div key={hour} className="row-span-4 h-24 -mt-3 pr-2 text-right text-sm text-gray-400">
            {format(new Date(0, 0, 0, hour), 'ha')}
          </div>
        ))}
      </div>

      {/* Header row */}
      <div className="col-start-1 row-start-1 sticky top-0 bg-white z-10 p-2 text-transparent">Time</div>
      {days.map((day, index) => (
        <div key={index} className="col-start-[-1] row-start-1 sticky top-0 bg-white z-10 border-b border-l p-2 text-center font-medium">
          <div className="text-gray-500 text-sm">{format(day, 'EEE')}</div>
          <div className="text-2xl">{format(day, 'd')}</div>
        </div>
      ))}
      
      {/* Grid columns */}
      {days.map((day, dayIndex) => (
        <div 
          key={dayIndex} 
          className="col-start-[-1] row-start-2 grid grid-rows-[repeat(72,1fr)] border-l relative"
          style={{ gridTemplateRows: 'repeat(72, minmax(0, 1fr))' }}
        >
          {/* Hour lines */}
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="row-start-[-1] col-start-1 border-b" style={{ gridRowStart: i * 4 + 1 }} />
          ))}
          
          {/* Events */}
          {eventsByDay[dayIndex].map(event => {
            const position = getEventPosition(event);
            if (!position) return null;
            
            const eventsInSameResource = eventsByDay[dayIndex].filter(e => e.resourceId === event.resourceId);
            const overlappingEvents = eventsInSameResource.filter(e => 
              (event.start < e.end && event.end > e.start)
            );
            
            const width = 100 / overlappingEvents.length;
            const left = overlappingEvents.findIndex(e => e.id === event.id) * width;

            return (
              <div key={event.id} style={{...position, width: `${width-1}%`, left: `${left}%`}} className="absolute px-1 z-10">
                <EventItem event={event} onClick={onEventClick} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default WeeklyCalendarGrid;