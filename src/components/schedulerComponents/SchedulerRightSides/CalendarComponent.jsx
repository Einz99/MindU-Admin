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
export default function Calendar({ initial }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateFlags, setDateFlags] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [filterBacklogs, setFilterBacklogs] = useState({});
  /**
   * This variables and functions is to initialized the calendar and for formatting the table
   */
  const daysInMonth = getDaysInMonth(currentDate);
  const startDate = startOfMonth(currentDate);
  const startWeekday = getDay(startDate);

  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    setSelectedDay(today);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
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
    if (!initial?.length) return;

    const filteredEvents = initial.filter((e) => {
      try {
        // Ensure sched_date is a valid ISO string
        const eventDate = parseISO(e.sched_date);
        if (isNaN(eventDate)) {
          return false; // Skip invalid dates
        }
        const formattedEventDate = format(eventDate, "yyyy-MM-dd");
        return formattedEventDate === selectedDay && e.status === "Scheduled";
      } catch (err) {
        console.error("Error parsing date:", e.sched_date, err);
        return false; // Skip invalid date
      }
    });

    setFilterBacklogs(filteredEvents);

    const map = {};
    initial
      .filter(e => e.status === "Scheduled" && e.sched_date)
      .forEach(entry => {
        const d = format(parseISO(String(entry.sched_date)), "yyyy-MM-dd");
        if (!map[d]) map[d] = { hasStudent: false, hasGeneral: false };
        if (entry.student_id != null) map[d].hasStudent = true;
        else map[d].hasGeneral = true;
      });

    setDateFlags(map);
  }, [initial, selectedDay, setDateFlags]);

  const handleDateClick = (day) => {
    if (!day) return;
    const fullDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), day), "yyyy-MM-dd");
    setSelectedDay(fullDate);
  };
  
  return (
    <div className="flex flex-col w-full bg-[#b7cde3] p-2 flex-1 flex-grow relative">
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
          <div key={day} className={`${day === "SUN" ? "text-[#b91c1c]" : ""} py-1`}>{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 gap-[4px]">
        {daysArray.map((day, idx) => {
          if (!day) return <div key={idx} className="flex items-center justify-center opacity-50"></div>;

          const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const fullDate = format(dateObj, "yyyy-MM-dd");
          const flags = dateFlags[fullDate];
          const isSelected = selectedDay === fullDate;
          const isSunday = dateObj.getDay() === 0;

          // Decide which dots to show
          const dots = [];
          if (flags?.hasStudent) dots.push("#ff9059"); // has student_id
          if (flags?.hasGeneral) dots.push("#60a5fa"); // no student_id

          return (
            <div
              key={idx}
              onClick={() => handleDateClick(day)}
              className={`relative flex items-center justify-center cursor-pointer transition-all
                ${isSelected ? "bg-[#94a3b8] font-bold rounded-md" : "hover:bg-[#7b8797] rounded-md"}
                ${isSunday ? "text-[#b91c1c]" : ""}`}
            >
              <span className="text-sm md:text-base lg:text-base">{day}</span>

              {/* Dot(s) — one or two */}
              {dots.length > 0 && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-1">
                  {dots.map((c, i) => (
                    <span
                      key={i}
                      className="w-2 h-2 md:w-2 md:h-2 rounded-full"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="w-[95%] bg-white h-[25%] rounded-xl mx-[2.5%] -mt-5 mb-3 px-4 overflow-auto">
        {selectedDay && filterBacklogs.length > 0 ? (
          filterBacklogs.map((event, index) => (
            <div key={index} className="my-2">
              <p
                className="font-roboto font-bold italic text-xl"
                style={{ color: event.student_id ? "#ff9059" : "#60a5fa" }}
              >
                {event.name}
              </p>
              <p className="font-roboto italic text-sm">{format(parseISO(event.sched_date), "hh:mm a")}</p>
            </div>
          ))
        ) : (
          <div className="font-roboto font-bold italic text-xl my-2">
            <p>There is no scheduled event for</p>
            <p>{format(new Date(selectedDay), 'EEEE - MMMM dd, yyyy')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
