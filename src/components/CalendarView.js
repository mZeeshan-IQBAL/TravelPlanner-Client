import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const CalendarView = ({ trips = [], onDateSelect = null }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get current month/year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Month and day names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Calendar calculations
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Previous month's trailing days
    const prevMonth = new Date(currentYear, currentMonth - 1, 0);
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        fullDate: new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i)
      });
    }
    
    // Current month's days
    for (let date = 1; date <= daysInMonth; date++) {
      days.push({
        date,
        isCurrentMonth: true,
        isPrevMonth: false,
        fullDate: new Date(currentYear, currentMonth, date)
      });
    }
    
    // Next month's leading days
    const totalCells = 42; // 6 rows × 7 days
    const remainingCells = totalCells - days.length;
    for (let date = 1; date <= remainingCells; date++) {
      days.push({
        date,
        isCurrentMonth: false,
        isPrevMonth: false,
        fullDate: new Date(currentYear, currentMonth + 1, date)
      });
    }
    
    return days;
  }, [currentYear, currentMonth, firstDayWeekday, daysInMonth]);
  
  // Group trips by date
  const tripsByDate = useMemo(() => {
    const grouped = {};
    
    trips.forEach(trip => {
      const dates = [];
      
      // Add start and end dates if they exist
      if (trip.plannedDates?.startDate) {
        const startDate = new Date(trip.plannedDates.startDate);
        dates.push(startDate);
      }
      
      if (trip.plannedDates?.endDate) {
        const endDate = new Date(trip.plannedDates.endDate);
        dates.push(endDate);
        
        // Add all dates between start and end
        if (trip.plannedDates?.startDate) {
          const startDate = new Date(trip.plannedDates.startDate);
          const daysBetween = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          
          for (let i = 1; i < daysBetween; i++) {
            const betweenDate = new Date(startDate);
            betweenDate.setDate(betweenDate.getDate() + i);
            dates.push(betweenDate);
          }
        }
      }
      
      // Group by date string
      dates.forEach(date => {
        const dateKey = date.toISOString().split('T')[0];
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(trip);
      });
    });
    
    return grouped;
  }, [trips]);
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Get trips for a specific date
  const getTripsForDate = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    return tripsByDate[dateKey] || [];
  };
  
  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="btn-secondary p-2"
            title="Previous month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="btn-secondary px-3 py-2 text-sm"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="btn-secondary p-2"
            title="Next month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-secondary-50 dark:bg-secondary-800">
          {dayNames.map(day => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-secondary-600 dark:text-secondary-300"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayTrips = getTripsForDate(day.fullDate);
            const hasTrips = dayTrips.length > 0;
            const todayClass = isToday(day.fullDate) ? 'bg-primary-50 dark:bg-primary-900' : '';
            const currentMonthClass = day.isCurrentMonth 
              ? 'text-secondary-900 dark:text-secondary-100'
              : 'text-secondary-400 dark:text-secondary-600';
            
            return (
              <div
                key={index}
                className={`min-h-[80px] p-2 border-r border-b border-secondary-200 dark:border-secondary-700 ${
                  todayClass
                } ${
                  hasTrips ? 'cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800' : ''
                }`}
                onClick={() => {
                  if (hasTrips && onDateSelect) {
                    onDateSelect(day.fullDate, dayTrips);
                  }
                }}
              >
                <div className={`text-sm font-medium mb-1 ${currentMonthClass}`}>
                  {day.date}
                </div>
                
                {/* Trip indicators */}
                {hasTrips && (
                  <div className="space-y-1">
                    {dayTrips.slice(0, 2).map((trip, tripIndex) => (
                      <Link
                        key={`${trip._id}-${tripIndex}`}
                        to={`/trip/${trip._id}`}
                        className="block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-xs p-1 rounded bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-700 truncate">
                          {trip.isFavorite && '⭐ '}
                          {trip.title}
                        </div>
                      </Link>
                    ))}
                    
                    {dayTrips.length > 2 && (
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">
                        +{dayTrips.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Trip count summary */}
      <div className="flex items-center justify-between text-sm text-secondary-600 dark:text-secondary-300">
        <span>
          {trips.length} trip{trips.length !== 1 ? 's' : ''} total
        </span>
        <span>
          {Object.keys(tripsByDate).length} day{Object.keys(tripsByDate).length !== 1 ? 's' : ''} with trips
        </span>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-600 dark:text-secondary-300">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary-50 dark:bg-primary-900 rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary-100 dark:bg-primary-800 rounded"></div>
          <span>Has trips</span>
        </div>
        <div className="flex items-center gap-2">
          <span>⭐</span>
          <span>Favorite trip</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
