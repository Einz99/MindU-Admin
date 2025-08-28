import React, { useState, useEffect } from "react";
import { format, startOfMonth, getDay, getDaysInMonth, add, sub, parseISO } from "date-fns";

/**
 * ===========================================
 * Component: Calendar
 * Author: Ronald M. Villarde
 * Created: 2025-03-01
 * Last Updated: 2025-04-28
 * 
 * Description:
 * - Its displaying simple clickable days of calendar
 * - Shows the date where in there is scheduled meeting or events
 * 
 * Purpose:
 * - Selecting dates, displaying or emphasizing the dates with events
 * - Selected dates will be used in displaying what is scheduled or events happen that time.
 * 
 * Props:
 * - setSelectedDate (string): storing the selected dates to filter out the schedules in backlogs

 * 
 * State Variables:
 * - currentDate (Date): The date today that for initialization and ensure that there is selected date.
 * - highlightedDates (Array): getting all dates with scheduled status to emphasizes that its date with schedule status
 * - selectedDay (DateTime): The selected date to be used in filtering and emphasize the selected date.
 * 
 * Functions:
 * - handlePrevMonth and handleNextMonth: Edit the display month of calendar to next or previous month
 * - handleDateClick: Set the date to selected date to filter out the current dates for displaying in table.
 * 
 * API Calls:
 * - None - initial is the data from backend called within parent and pass to component
 * 
 * Error Handling:
 * - None
 * 
 * Notes:
 * - [Any important notes for future developers or groupmates]
 * ===========================================
 */
export default function Calendar({ setSelectedDate, initial, selectedDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  /**
   * This variables and functions is to initialized the calendar and for formatting the table
   */
  const daysInMonth = getDaysInMonth(currentDate);
  const startDate = startOfMonth(currentDate);
  const startWeekday = getDay(startDate);

  // Generate all days, including previous & next month's placeholders
  const daysArray = [];
  for (let i = 0; i < startWeekday; i++) daysArray.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);
  while (daysArray.length < 42) daysArray.push(null);
  /**
   * up to this part for initializing the calendar
   */

  const handlePrevMonth = () => setCurrentDate(sub(currentDate, { months: 1 }));
  const handleNextMonth = () => setCurrentDate(add(currentDate, { months: 1 }));

  // Extract highlighted dates from `initial` prop
  useEffect(() => {
    if (!initial || initial.length === 0) return;
    
    const formattedDates = initial
      .filter((entry) => entry.status === "Scheduled") // Only Scheduled events
      .map((entry) => format(parseISO(entry.sched_date), "yyyy-MM-dd")); // Format to "YYYY-MM-DD"

    setHighlightedDates(formattedDates);
  }, [initial]);

  const handleDateClick = (day) => {
    if (!day) return;
    const fullDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), "yyyy-MM-dd");
    setSelectedDate(fullDate);
    setSelectedDay(fullDate);
  };

  useEffect(() => {
    setSelectedDay(selectedDate)
  }, [selectedDate])
  
  return (
    <div className="flex flex-col w-full bg-[#b7cde3] p-2 flex-1 flex-grow">
      {/* Year */}
      <div className="text-center font-norwester mb-2 text-lg md:text-xl lg:text-2xl">
        S.Y. {currentDate.getFullYear()}
      </div>

      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-1 text-base md:text-lg lg:text-xl font-norwester">
        <button onClick={handlePrevMonth} className="text-gray-700 px-2">&lt;</button>
        <span>{format(currentDate, "MMMM").toUpperCase()}</span>
        <button onClick={handleNextMonth} className="text-gray-700 px-2">&gt;</button>
      </div>

      <div className="border-b-2 border-black mb-1"></div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center font-semibold text-sm">
        {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(day => (
          <div key={day} className={`${day === "SUN" ? "text-[#b91c1c]" : ""} py-1`}>
            {day}
          </div>
        ))}
      </div>
      
      {/* Days Grid */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 gap-[4px]">
        {daysArray.map((day, idx) => {
          if (!day) return <div key={idx} className="flex items-center justify-center opacity-50"></div>;
        
          const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const fullDate = format(dateObj, "yyyy-MM-dd");
          const isHighlighted = highlightedDates.includes(fullDate);
          const isSelected = selectedDay === fullDate;
          const isSunday = dateObj.getDay() === 0;
        
          return (
            <div
              key={idx}
              onClick={() => handleDateClick(day)}
              className={`relative flex items-center justify-center cursor-pointer transition-all
                ${isSelected ? "bg-[#94a3b8] font-bold rounded-md" : "hover:bg-[#7b8797] rounded-md"}
                ${isSunday ? "text-[#b91c1c]" : ""}
              `}
            >
              <span className="text-sm md:text-base lg:text-base">{day}</span>
              {isHighlighted && (
                <span className="absolute -top-1 w-4 h-4 md:w-2 md:h-2 bg-red-500 rounded-full"></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
