import { useState, useEffect } from "react";
import {
  format,
  getDay,
  startOfMonth,
  getDaysInMonth,
  add,
  sub,
} from "date-fns";
import axios from "axios";
import { API } from "../../../api";

export default function AdviserCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [studentRequests, setStudentRequests] = useState([]);
  const [staffRequests, setStaffRequests] = useState([]);
  const staff = JSON.parse(localStorage.getItem("staff"));

  // Auto-select today when component mounts
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    setSelectedDay(today);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res1 = await axios.get(`${API}/backlogs/student-requests/${staff.id}`);
        setStudentRequests(res1.data);
        const res2 = await axios.get(`${API}/backlogs/staff-requests/${staff.id}`);
        setStaffRequests(res2.data);
      } catch (err) {
        console.error("Error fetching scheduled requests:", err);
        setStudentRequests([]);
        setStaffRequests([]);
      }
    };

    if (staff.position === "Adviser" && staff.id) {
      fetchData();
    }
  }, [staff.id, staff.position]);

  // Generate days grid
  const daysInMonth = getDaysInMonth(currentDate);
  const startDate = startOfMonth(currentDate);
  const startWeekday = getDay(startDate);

  const daysArray = [];
  for (let i = 0; i < startWeekday; i++) daysArray.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);
  while (daysArray.length < 42) daysArray.push(null);

  // Normalize dates
  const studentDates = new Set(
    studentRequests
      .filter((r) => r.status === "Scheduled")
      .map((r) => format(new Date(r.sched_date), "yyyy-MM-dd"))
  );

  const staffDates = new Set(
    staffRequests
      .filter((r) => r.status === "Scheduled")
      .map((r) => format(new Date(r.sched_date), "yyyy-MM-dd"))
  );

  // Handle selecting a date
  const handleDateClick = (day) => {
    if (!day) return;
    const fullDate = format(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
      "yyyy-MM-dd"
    );
    setSelectedDay(fullDate);
  };

  // Build appointments list when selectedDay changes
  useEffect(() => {
    if (!selectedDay) return;

    const appointmentsList = [];

    studentRequests.forEach((r) => {
      if (
        r.status === "Scheduled" &&
        format(new Date(r.sched_date), "yyyy-MM-dd") === selectedDay
      ) {
        appointmentsList.push({
          name: r.student_name,
          time: format(new Date(r.sched_date), "hh:mm a"),
          type: "student", // Red dot
        });
      }
    });

    staffRequests.forEach((r) => {
      if (
        r.status === "Scheduled" &&
        format(new Date(r.sched_date), "yyyy-MM-dd") === selectedDay
      ) {
        appointmentsList.push({
          name: r.student_name,
          time: format(new Date(r.sched_date), "hh:mm a"),
          type: "staff", // Blue dot
        });
      }
    });

    // Sort by time
    appointmentsList.sort((a, b) => {
      const timeA = new Date(`2000/01/01 ${a.time}`);
      const timeB = new Date(`2000/01/01 ${b.time}`);
      return timeA - timeB;
    });

    setAppointments(appointmentsList);
  }, [selectedDay, studentRequests, staffRequests]);

  const formattedDate = selectedDay ? format(new Date(selectedDay), "MM/dd/yyyy") : "";

  return (
    <div className="flex flex-row w-full bg-[#b7cde3] py-5 pl-5 pr-3 flex-1 h-full overflow-y-auto">
      {/* Year */}
      <div className="flex flex-col w-[55%] h-full pl-2">
        <div className="text-center font-norwester mb-2 text-lg md:text-xl lg:text-2xl">
          S.Y. {currentDate.getFullYear()}
        </div>

        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-1 text-base md:text-lg lg:text-xl font-norwester">
          <button
            onClick={() => setCurrentDate(sub(currentDate, { months: 1 }))}
            className="text-gray-700 px-2"
          >
            &lt;
          </button>
          <span>{format(currentDate, "MMMM").toUpperCase()}</span>
          <button
            onClick={() => setCurrentDate(add(currentDate, { months: 1 }))}
            className="text-gray-700 px-2"
          >
            &gt;
          </button>
        </div>

        <div className="border-b-2 border-black mb-1"></div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 text-center font-semibold text-sm">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
            <div
              key={day}
              className={`${day === "SUN" ? "text-[#b91c1c]" : ""} py-1`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 grid-rows-6 flex-1 gap-[4px]">
          {daysArray.map((day, idx) => {
            if (!day)
              return (
                <div
                  key={idx}
                  className="flex items-center justify-center opacity-50"
                />
              );

            const dateObj = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            const fullDate = format(dateObj, "yyyy-MM-dd");
            const isSelected = selectedDay === fullDate;
            const isSunday = dateObj.getDay() === 0;

            const hasStudent = studentDates.has(fullDate);
            const hasStaff = staffDates.has(fullDate);

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(day)}
                className={`relative flex flex-col items-center justify-center cursor-pointer transition-all
                  ${
                    isSelected
                      ? "bg-[#94a3b8] font-bold rounded-md"
                      : "hover:bg-[#7b8797] rounded-md"
                  }
                  ${isSunday ? "text-[#b91c1c]" : ""}
                `}
              >
                {/* Dot indicators */}
                <div className="absolute top-1 flex space-x-1">
                  {hasStudent && (
                    <span className="w-2 h-2 rounded-full bg-[#ff9059]"></span>
                  )}
                  {hasStaff && (
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  )}
                </div>
                <span className="text-sm md:text-base lg:text-base">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointments box */}
      <div className="mt-3 w-[45%] py-2 px-4">
        <div className="w-full h-full px-3 py-2 border border-gray-400 rounded-md bg-white overflow-y-auto">
          <div className="font-semibold text-lg mb-3 text-center">
            Appointments for {formattedDate}
          </div>
          
          {appointments.length === 0 ? (
            <div className="text-gray-500 text-center mt-8">
              No appointments scheduled for this date.
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.map((apt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {apt.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {apt.time}
                    </div>
                  </div>
                  
                  {/* Colored dot indicator */}
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ml-3 ${
                      apt.type === "student" ? "bg-[#ff9059]" : "bg-blue-600"
                    }`}
                    title={apt.type === "student" ? "Student Request" : "Staff Request"}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}