import React, { useState, useEffect } from "react";
import { format, startOfMonth, getDay, getDaysInMonth, add, sub, parseISO } from "date-fns";

export default function Calendar({ setSelectedDate, initial }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const daysInMonth = getDaysInMonth(currentDate);
  const startDate = startOfMonth(currentDate);
  const startWeekday = getDay(startDate);

  // Generate all days, including previous & next month's placeholders
  const daysArray = [];
  for (let i = 0; i < startWeekday; i++) daysArray.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);
  while (daysArray.length < 42) daysArray.push(null);

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

  return (
    <div className="p-4 flex-grow w-[100%] bg-[#b7e3cc] shadow-lg rounded-2xl">
      {/* Year */}
      <div className="text-center text-2xl font-bold">S.Y. {currentDate.getFullYear()}</div>

      {/* Month Navigation */}
      <div className="flex justify-between items-center text-5xl font-bold mt-2 mb-1">
        <button onClick={handlePrevMonth} className="text-gray-700 px-4">&lt;</button>
        <span>{format(currentDate, "MMMM").toUpperCase()}</span>
        <button onClick={handleNextMonth} className="text-gray-700 px-4">&gt;</button>
      </div>

      <div className="border-b-2 border-black my-2"></div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 text-center font-semibold text-xl">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7">
        {daysArray.map((day, index) => {
          if (!day) return <div key={index} className="opacity-50 text-gray-400 h-12 flex items-center justify-center"></div>;

          const fullDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), "yyyy-MM-dd");
          const isHighlighted = highlightedDates.includes(fullDate);
          const isSelected = selectedDay === fullDate;

          return (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              className={`relative h-12 flex items-center justify-center text-xl font-medium cursor-pointer rounded-full transition-all
                ${isSelected ? "bg-blue-500 text-white" : "hover:bg-blue-300"}
              `}
            >
              <span>{day}</span>
              {isHighlighted && (
                <span className="absolute -top-0.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
