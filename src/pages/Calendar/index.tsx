import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  Users,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

const Calendar: React.FC = () => {
  const [currentDate] = useState(new Date());
  
  const events = [
    {
      id: 1,
      title: 'Team Meeting',
      time: '10:00 AM - 11:00 AM',
      location: 'Conference Room A',
      attendees: ['Sarah Johnson', 'Mike Chen', 'Emma Wilson'],
      type: 'meeting',
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Project Review',
      time: '2:00 PM - 3:30 PM',
      location: 'Virtual',
      attendees: ['John Doe', 'Alex Rodriguez'],
      type: 'review',
      date: '2024-01-15'
    },
    {
      id: 3,
      title: 'Client Presentation',
      time: '4:00 PM - 5:00 PM',
      location: 'Client Office',
      attendees: ['John Doe', 'Sarah Johnson'],
      type: 'presentation',
      date: '2024-01-16'
    },
    {
      id: 4,
      title: 'Lunch with Team',
      time: '12:00 PM - 1:00 PM',
      location: 'Local Restaurant',
      attendees: ['John Doe', 'Sarah Johnson', 'Mike Chen', 'Emma Wilson'],
      type: 'social',
      date: '2024-01-17'
    },
  ];

  const upcomingEvents = events.filter(event => 
    new Date(event.date) >= new Date()
  ).slice(0, 5);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'review': return 'bg-green-500';
      case 'presentation': return 'bg-purple-500';
      case 'social': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'meeting': return 'Meeting';
      case 'review': return 'Review';
      case 'presentation': return 'Presentation';
      case 'social': return 'Social';
      default: return 'Event';
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Calendar
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {currentDate.toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 3; // Start from previous month
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const dayEvents = events.filter(event => 
                    new Date(event.date).toDateString() === date.toDateString()
                  );
                  
                  return (
                    <div
                      key={i}
                      className={`p-2 min-h-[80px] border border-border hover:bg-muted transition-colors cursor-pointer ${
                        date.toDateString() === new Date().toDateString() 
                          ? 'bg-primary/10 border-primary' 
                          : ''
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.type)} text-white`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Today's Events */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.filter(event => 
                  new Date(event.date).toDateString() === new Date().toDateString()
                ).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getEventTypeColor(event.type)}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{event.title}</h3>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <div className="flex -space-x-2">
                          {event.attendees.slice(0, 3).map((attendee, index) => (
                            <Avatar key={index} className="h-6 w-6 border-2 border-background">
                              <AvatarFallback className="text-xs">
                                {attendee.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {event.attendees.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                              +{event.attendees.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted transition-colors cursor-pointer">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getEventTypeColor(event.type)}`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                      <p className="text-xs text-muted-foreground truncate">{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Event Types */}
          <Card>
            <CardHeader>
              <CardTitle>Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { type: 'meeting', label: 'Meeting', color: 'bg-blue-500' },
                  { type: 'review', label: 'Review', color: 'bg-green-500' },
                  { type: 'presentation', label: 'Presentation', color: 'bg-purple-500' },
                  { type: 'social', label: 'Social', color: 'bg-orange-500' },
                ].map((eventType) => (
                  <div key={eventType.type} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${eventType.color}`}></div>
                    <span className="text-sm">{eventType.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
