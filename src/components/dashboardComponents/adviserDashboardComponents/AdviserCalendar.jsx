import { useState } from "react";
import { format, getDay, startOfMonth, getDaysInMonth, add, sub } from "date-fns";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [input, setInput] = useState('');

  // Initialize month days
  const daysInMonth = getDaysInMonth(currentDate);
  const startDate = startOfMonth(currentDate);
  const startWeekday = getDay(startDate);

  const daysArray = [];
  for (let i = 0; i < startWeekday; i++) daysArray.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);
  while (daysArray.length < 42) daysArray.push(null);

  const handlePrevMonth = () => setCurrentDate(sub(currentDate, { months: 1 }));
  const handleNextMonth = () => setCurrentDate(add(currentDate, { months: 1 }));

  const handleDateClick = (day) => {
    if (!day) return;
    const fullDate = format(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
      "yyyy-MM-dd"
    );
    setSelectedDay(fullDate);
  };

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  return (
    <div className="flex flex-col w-full bg-[#b7cde3] p-2 flex-1 h-[65%] overflow-y-auto">
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
            </div>
          );
        })}
      </div>

      {/* Input below calendar */}
      <div className="mt-3">
        <textarea
          value={input}
          onChange={handleInput}
          rows={2} // minimum 2 lines
          className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
        />
      </div>
    </div>
  );
}
