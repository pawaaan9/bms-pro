import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Printer,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  User,
  Clock,
  DollarSign,
} from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";

const sampleEvents = [
  {
    id: "BKG-310",
    title: "Smith — Community Yoga",
    status: "CONFIRMED",
    resource: "Hall A",
    start: "09:00",
    end: "12:00",
    customer: "Jane Smith",
    depositPaid: true,
    day: 1, // Monday
  },
  {
    id: "BKG-312",
    title: "Pereira — Birthday",
    status: "CONFIRMED",
    resource: "Hall A",
    start: "18:00",
    end: "22:00",
    customer: "Carlos Pereira",
    depositPaid: true,
    day: 1, // Monday
  },
  {
    id: "BKG-311",
    title: "Nguyen — Rehearsal",
    status: "TENTATIVE",
    resource: "Hall B",
    start: "13:00",
    end: "16:00",
    customer: "Linh Nguyen",
    depositPaid: false,
    day: 3, // Wednesday
  },
  {
    id: "BLK-05",
    title: "Maintenance",
    status: "BLOCKOUT",
    resource: "Hall A",
    start: "08:00",
    end: "10:00",
    customer: "Internal",
    depositPaid: true,
    day: 5, // Friday
  },
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date("2025-08-25"));
  const [view, setView] = useState("Week");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showBuffers, setShowBuffers] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleDateChange = (direction) => {
    const newDate = new Date(currentDate);
    const amount = view === "Month" ? 30 : 7;
    newDate.setDate(newDate.getDate() + direction * amount);
    setCurrentDate(newDate);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "TENTATIVE":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Tentative</Badge>
        );
      case "BLOCKOUT":
        return <Badge className="bg-gray-100 text-gray-800">Block-out</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="mt-1 text-gray-500">
            Plan and manage bookings, buffers, and block-outs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Block-out
          </Button>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </header>

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* View Toggle */}
            <div
              className="flex gap-1 rounded-lg border p-1"
              role="tablist"
              aria-label="Calendar view options"
            >
              {["Day", "Week", "Month", "Resource"].map((viewOption) => (
                <Button
                  key={viewOption}
                  role="tab"
                  aria-selected={view === viewOption}
                  variant={view === viewOption ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setView(viewOption)}
                >
                  {viewOption}
                </Button>
              ))}
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDateChange(-1)}
                aria-label="Previous period"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => handleDateChange(0)}>
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDateChange(1)}
                aria-label="Next period"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-lg">
                {format(currentDate, "MMMM yyyy")}
              </span>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="hall_a">Hall A</SelectItem>
                  <SelectItem value="hall_b">Hall B</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBuffers(!showBuffers)}
                className={
                  showBuffers ? "bg-blue-50 border-blue-200 text-blue-700" : ""
                }
                aria-pressed={showBuffers}
              >
                {showBuffers ? "✓ " : ""}Show buffers
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Week View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Day Headers */}
                <div className="grid grid-cols-8 gap-2">
                  <div className="font-medium text-sm text-gray-500">Time</div>
                  {days.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-sm text-gray-500">
                        {format(day, "EEE")}
                      </div>
                      <div className="text-lg font-bold">
                        {format(day, "d")}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Slots with Events */}
                <div
                  className="space-y-1 max-h-96 overflow-y-auto"
                  role="grid"
                  aria-label="Weekly calendar grid"
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="grid grid-cols-8 gap-2 border-b border-gray-100 pb-2"
                      role="row"
                    >
                      <div
                        className="text-sm text-gray-500 py-2"
                        role="rowheader"
                      >
                        {format(new Date(0, 0, 0, hour), "ha")}
                      </div>
                      {days.map((day, dayIndex) => {
                        const dayEvents = sampleEvents.filter(
                          (event) =>
                            event.day === dayIndex + 1 &&
                            parseInt(event.start.split(":")[0]) === hour
                        );
                        return (
                          <div
                            key={dayIndex}
                            className="min-h-[60px] border-l border-gray-100 px-1"
                            role="gridcell"
                            tabIndex={0}
                            aria-label={`${format(
                              day,
                              "EEEE d MMMM"
                            )}, ${format(new Date(0, 0, 0, hour), "ha")}`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                // Handle event creation
                              }
                            }}
                          >
                            {dayEvents.map((event) => (
                              <button
                                key={event.id}
                                className={`p-2 rounded text-xs cursor-pointer mb-1 block w-full text-left ${
                                  event.status === "CONFIRMED"
                                    ? "bg-blue-100 border-l-2 border-blue-500 text-blue-800"
                                    : event.status === "TENTATIVE"
                                    ? "bg-yellow-100 border-l-2 border-yellow-500 text-yellow-800 border-dashed"
                                    : "bg-gray-100 border-l-2 border-gray-500 text-gray-800"
                                }`}
                                onClick={() => setSelectedEvent(event)}
                                aria-label={`${event.title}, ${event.status}, ${event.start} to ${event.end}`}
                              >
                                <div className="font-bold truncate">
                                  {event.title}
                                </div>
                                <div className="text-xs opacity-75">
                                  {event.start} - {event.end}
                                </div>
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Details Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEvent ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
                    {getStatusBadge(selectedEvent.status)}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {format(currentDate, "eeee, d MMMM yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {selectedEvent.start} - {selectedEvent.end}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedEvent.customer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        Deposit {selectedEvent.depositPaid ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Button className="w-full" size="sm">
                      Open Full Details
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      Edit Booking
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      Send Pay Link
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Click on an event to view details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
