import React, { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { fetchBookingsForCalendar, updateBookingStatus, fetchResources } from "../services/bookingService";


export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("Week");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showBuffers, setShowBuffers] = useState(false);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch bookings and resources from backend
  const fetchData = useCallback(async (isRefresh = false) => {
    if (!user?.id) {
      console.log('No user ID available for calendar:', user);
      return;
    }
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch both bookings and resources in parallel
      const [calendarEvents, resourcesData] = await Promise.all([
        fetchBookingsForCalendar(user.id, token),
        fetchResources(token)
      ]);
      
      setEvents(calendarEvents);
      
      setResources(resourcesData);
      
    } catch (err) {
      console.error('Error fetching data for calendar:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Fetch data on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id, fetchData]);

  const handleDateChange = (direction) => {
    const newDate = new Date(currentDate);
    const amount = view === "Month" ? 30 : 7;
    newDate.setDate(newDate.getDate() + direction * amount);
    setCurrentDate(newDate);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "PENDING":
      case "pending":
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case "TENTATIVE":
      case "tentative":
        return <Badge className="bg-yellow-100 text-yellow-800">Tentative</Badge>;
      case "CANCELLED":
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case "COMPLETED":
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "BLOCKOUT":
      case "blockout":
        return <Badge className="bg-gray-100 text-gray-800">Block-out</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
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
          <Button 
            variant="outline" 
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
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
                    {['Day', 'Week', 'Month', 'Resource'].map((viewOption) => (
                      <Button
                        key={viewOption}
                        role="tab"
                        aria-selected={view === viewOption}
                        variant={view === viewOption ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setView(viewOption)}
                        className={view === viewOption ? "bg-gray-200 text-primary font-semibold" : ""}
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
              <Select value={selectedResource} onValueChange={setSelectedResource}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.name} ({resource.type})
                    </SelectItem>
                  ))}
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
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-600">Loading bookings...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => fetchData()} variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
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
                        // Get all events for this day
                        const dayEvents = events.filter((event) => {
                          // Filter by resource if selected
                          if (selectedResource !== "all" && event.selectedHall !== selectedResource) {
                            return false;
                          }
                          
                          // Filter by date
                          const eventDate = new Date(event.bookingDate);
                          const dayDate = new Date(day);
                          const eventDateStr = eventDate.toISOString().split('T')[0];
                          const dayDateStr = dayDate.toISOString().split('T')[0];
                          const isSameDate = eventDateStr === dayDateStr;
                          
                          return isSameDate;
                        });

                        // Filter events that should appear in this hour slot
                        const hourEvents = dayEvents.filter((event) => {
                          const startHour = parseInt(event.startTime.split(":")[0]);
                          const startMinute = parseInt(event.startTime.split(":")[1]);
                          const endHour = parseInt(event.endTime.split(":")[0]);
                          const endMinute = parseInt(event.endTime.split(":")[1]);
                          
                          // Event starts in this hour OR event is ongoing through this hour
                          const startsInThisHour = startHour === hour;
                          const ongoingThroughThisHour = startHour < hour && endHour > hour;
                          const startsEarlierAndEndsInThisHour = startHour < hour && endHour === hour;
                          
                          return startsInThisHour || ongoingThroughThisHour || startsEarlierAndEndsInThisHour;
                        });


                        return (
                          <div
                            key={dayIndex}
                            className="min-h-[60px] border-l border-gray-100 px-1 relative"
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
                            {hourEvents.map((event) => {
                              const startHour = parseInt(event.startTime.split(":")[0]);
                              const startMinute = parseInt(event.startTime.split(":")[1]);
                              const endHour = parseInt(event.endTime.split(":")[0]);
                              const endMinute = parseInt(event.endTime.split(":")[1]);
                              
                              // Calculate if this is the starting hour for the event
                              const isStartingHour = startHour === hour;
                              
                              // Calculate height based on duration (minimum 1 hour slot)
                              const durationHours = endHour - startHour + (endMinute - startMinute) / 60;
                              const height = Math.max(1, Math.ceil(durationHours)) * 60; // 60px per hour
                              
                              // Calculate top offset if event doesn't start at the top of the hour
                              const topOffset = isStartingHour ? (startMinute / 60) * 60 : 0;
                              
                              return (
                                <button
                                  key={event.id}
                                  className={`absolute left-1 right-1 p-2 rounded text-xs cursor-pointer text-left z-10 ${
                                    event.status === "CONFIRMED" || event.status === "confirmed"
                                      ? "bg-blue-100 border-l-2 border-blue-500 text-blue-800"
                                      : event.status === "PENDING" || event.status === "pending"
                                      ? "bg-orange-100 border-l-2 border-orange-500 text-orange-800"
                                      : event.status === "TENTATIVE" || event.status === "tentative"
                                      ? "bg-yellow-100 border-l-2 border-yellow-500 text-yellow-800 border-dashed"
                                      : event.status === "CANCELLED" || event.status === "cancelled"
                                      ? "bg-red-100 border-l-2 border-red-500 text-red-800"
                                      : event.status === "COMPLETED" || event.status === "completed"
                                      ? "bg-green-100 border-l-2 border-green-500 text-green-800"
                                      : "bg-gray-100 border-l-2 border-gray-500 text-gray-800"
                                  }`}
                                  style={{
                                    top: `${topOffset}px`,
                                    height: `${height}px`,
                                    minHeight: '60px'
                                  }}
                                  onClick={() => setSelectedEvent(event)}
                                  aria-label={`${event.title}, ${event.status}, ${event.startTime} to ${event.endTime}`}
                                >
                                  <div className="font-bold truncate">
                                    {event.title}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {event.startTime} - {event.endTime}
                                  </div>
                                  {event.guestCount && (
                                    <div className="text-xs opacity-60">
                                      {event.guestCount} guests
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              )}
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
                        {format(new Date(selectedEvent.bookingDate), "eeee, d MMMM yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {selectedEvent.startTime} - {selectedEvent.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{selectedEvent.customer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {selectedEvent.calculatedPrice ? `$${selectedEvent.calculatedPrice.toFixed(2)}` : 'Price TBD'}
                      </span>
                    </div>
                    {selectedEvent.guestCount && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedEvent.guestCount} guests</span>
                      </div>
                    )}
                    {selectedEvent.eventType && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedEvent.eventType}</span>
                      </div>
                    )}
                    {selectedEvent.resource && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedEvent.resource}</span>
                      </div>
                    )}
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
