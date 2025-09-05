import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const CalendarToolbar = ({ view, setView, currentDate, onDateChange }) => {
  const [showBuffers, setShowBuffers] = React.useState(false);

  const viewButtons = ['Day', 'Week', 'Month', 'Resource'];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
      {/* Left: View & Date Nav */}
      <div className="flex flex-wrap items-center gap-4">
        {/* View Toggle */}
        <div className="flex rounded-lg border p-1">
          {viewButtons.map((viewOption) => (
            <Button
              key={viewOption}
              variant={view === viewOption ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView(viewOption)}
              className={view === viewOption ? 'bg-primary text-primary-foreground' : ''}
            >
              {viewOption}
            </Button>
          ))}
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onDateChange(-1)} aria-label="Previous period">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => onDateChange(0)}>Today</Button>
          <Button variant="outline" size="icon" onClick={() => onDateChange(1)} aria-label="Next period">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <span className="font-semibold text-lg text-gray-800">
          {format(currentDate, "MMMM yyyy")}
        </span>
      </div>

      {/* Right: Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Resources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            <SelectItem value="hall_a">Hall A</SelectItem>
            <SelectItem value="hall_b">Hall B</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter Chips */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700">
            Confirmed
          </Button>
          <Button variant="outline" size="sm">
            Tentative
          </Button>
          <Button variant="outline" size="sm">
            Block-out
          </Button>
        </div>

        {/* Show Buffers Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBuffers(!showBuffers)}
            className={showBuffers ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
          >
            {showBuffers ? '✓' : ''} Show buffers
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarToolbar;