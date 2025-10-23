import { useState, useEffect, useMemo } from "react";
import { FileDownload, NotificationsActive  } from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
  Pie,
  PieChart,
  Line,
  LineChart,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { Badge, Button } from "@mui/material";
import axios from "axios";
import { API } from "../../../api";

export function UsageUtilization() {
  const [usageDate, setUsageDate] = useState('Today');
  const [dateUsageValue, setDateUsageValue] = useState('');
  const [chartData, setChartData] = useState([]);

  const handleChangeUsageDate = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();

    // Zero out time
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today - selectedDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      setUsageDate('Today');
    } else if (diffDays === 1) {
      setUsageDate('Yesterday');
    } else {
      setUsageDate(`${diffDays} days ago`);
    }

    setDateUsageValue(e.target.value);
  };

  // 🔥 Fetch data from backend whenever `dateUsageValue` changes
  useEffect(() => {
    if (!dateUsageValue) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/student-activities`, {
          params: { date: dateUsageValue }, // yyyy-mm-dd
        });

        // Define all expected modules with default 0 value
        const modules = [
          "Resource", "Wellness", "Chatbot", "Mood", "Scheduler", "Pet"
        ];

        // If no data is returned, show the modules with 0 visits
        const transformed = modules.map((module) => {
          const activity = res.data.activities.find((row) => row.module === module);
          return {
            label: module,
            value: activity ? activity.visits : 0,  // Set value to 0 if no data for the module
            color:
              module === "Resource"
                ? "#6ce5e8"
                : module === "Wellness"
                ? "#41b8d5"
                : module === "Chatbot"
                ? "#2d8bba"
                : module === "Mood"
                ? "#2f5f98"
                : module === "Scheduler"
                ? "#86469c"
                : module === "Pet"
                ? "#bc3f8d"
                : "#999999", // fallback (neutral gray)
          };
        });

        setChartData(transformed);
      } catch (err) {
        console.error("Error fetching usage data:", err);
        setChartData([]); // Set empty data in case of error
      }
    };

    // Initial fetch
    fetchData();

    // ⏳ Repeat every 10 minutes
    const interval = setInterval(fetchData, 10 * 60 * 1000);

    // Cleanup
    return () => clearInterval(interval);
  }, [dateUsageValue]);

  useEffect(() => {
    const today = new Date();
    const isoDate = today.toLocaleDateString('en-CA'); // yyyy-mm-dd
    setDateUsageValue(isoDate); // set input value to today
  }, []);

  return (
    <div className="flex flex-col p-5">
      <div className="flex w-full flex-row justify-between">
        <p className="font-roboto font-bold text-[#1e3a8a] text-2xl">Usage Utilization</p>
        <FileDownload
          sx={{
            fontSize: 25,
            justifyItems: 'center',
            color: '#64748b',
          }}
        />
      </div>

      <div className="flex w-full flex-row justify-between mb-4">
        <p className="font-bold text-lg">{usageDate}</p>
        <input
          type="date"
          className="bg-[#b7cde3] rounded-lg px-1 py-0.5"
          onChange={handleChangeUsageDate}
          value={dateUsageValue}
          max={new Date().toLocaleDateString('en-CA')}
        />
      </div>

      {/* Chart */}
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              interval={0} // force all labels to show
              tick={({ x, y, payload }) => {
                const words = payload.value.split(" ");
                return (
                  <text x={x} y={y + 20} textAnchor="middle" fill="#666">
                    {words.map((word, index) => (
                      <tspan key={index} x={x} dy={index === 0 ? 0 : 12}>
                        {word}
                      </tspan>
                    ))}
                  </text>
                );
              }}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value">
              <LabelList dataKey="value" position="top" fill="#000" />
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CompSchedules({ backlog, isAdviser }) {
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // Sunday=0, Monday=1...
    const diff = (day === 0 ? -6 : 1 - day); // Monday as start
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const Scheduledata = useMemo(() => {
    const today = new Date();
    const result = [];

    // Loop to get the past 4 weeks
    for (let i = 0; i < 4; i++) {
      const currentMonday = getStartOfWeek(new Date(today.getFullYear(), today.getMonth(), today.getDate() - i * 7));
      
      // Set the end of the week (Friday)
      const weekEnd = new Date(currentMonday);
      weekEnd.setDate(weekEnd.getDate() + 4); // Friday
      weekEnd.setHours(23, 59, 59, 999);

      // Count completed backlogs within the week range
      const count = backlog.filter(
        (b) =>
          b.status === "Completed" &&
          b.completed_at &&
          new Date(b.completed_at) >= currentMonday &&
          new Date(b.completed_at) <= weekEnd
      ).length;

      // Push data with formatted week ending date and count (0 if no completed backlogs)
      result.push({
        date: weekEnd.toLocaleDateString(), // format to get the date of the Friday
        value: count || 0 // Ensure value is 0 if no "Completed" backlogs
      });
    }

    return result.reverse();
  }, [backlog]);

  return (
    <div className="flex flex-col p-5">
      <div className="flex w-full flex-row justify-between">
        <p className="font-roboto font-bold text-black text-2xl">
          Schedules Completed Overtime
        </p>
        <FileDownload
          sx={{
            fontSize: 25,
            justifyItems: "center",
            color: "#64748b",
          }}
        />
      </div>
      
      <div className="w-full h-[100%] px-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={Scheduledata}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              domain={['auto', 'auto']}  // Automatically scale the X-axis but with padding
              padding={{ left: 20, right: 20 }}  // Add space at the start and end of the X-axis
            />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2d8bba" strokeWidth={3} dot={true} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

 export function PendingStudentRequests({ filterBacklog, width, padding }){
  const navigation = useNavigate();

  return (
    <div className={`flex flex-col w-[${width}%] ${padding && "p-5"} h-full`}>
      <div className="flex flex-row justify-between">
        <p className="font-roboto font-bold text-[#f57c00] text-2xl">Pending Student Requests</p>
        <Badge badgeContent={filterBacklog.length} color="error">
          <NotificationsActive
            sx={{
              fontSize: 25,
              justifyItems: "center",
              color: "#f57c00",
            }}
          />
        </Badge>
      </div>
      
      <div className="w-full h-[90%] border-4 border-[#f57c00] rounded-xl p-2 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filterBacklog.slice(-5).map((item, index) => (
            <div
              key={index}
              className="w-full flex flex-row items-center justify-between border-b-2 border-[#94a3b8]"
            >
              <p className="font-roboto text-lg whitespace-nowrap overflow-hidden text-ellipsis">
                New appointment request from {item.name}
              </p>
              <p className="text-[#f57c00]">{'\u25CF'}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-2 flex justify-end">
          <Button onClick={() => navigation("/scheduler")}>
            <p className="bg-[#1e3a8a] py-1 px-3 text-white rounded-lg">View Request</p>
          </Button>
        </div>
      </div>
    </div>
  );
};

export function ActiveStudentsPieChart({width, padding, marginTop}) {
  const [studentActiveDate, setStudentActiveDate] = useState('');
  const [SAText, setSAText] = useState('Today');
  const [studentCounts, setStudentCounts] = useState({
    totalStudents: 0,
    today: 0,
    yesterday: 0,
    selectedDay: 0,
  });

  const fetchStudentCounts = async (selectedDate) => {
    try {
      const res = await axios.get(`${API}/student-login-percentages`, {
        params: { date: selectedDate },
      });
      setStudentCounts(res.data);
    } catch (err) {
      console.error("Error fetching student counts:", err);
    }
  };

  const handleChangeASDate = (e) => {
    const selectedDate = e.target.value;
    const today = new Date();
    const selDate = new Date(selectedDate);

    // Zero out time
    selDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today - selDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      setSAText("Today");
    } else {
      setSAText(`${diffDays} days ago`);
    }

    setStudentActiveDate(selectedDate);
    fetchStudentCounts(selectedDate);
  };

  useEffect(() => {
    const today = new Date();
    const isoDate = today.toISOString().slice(0, 10);
    setStudentActiveDate(isoDate);
    fetchStudentCounts(isoDate);
  }, []);

  const { piePct, progressPct, progressLabel } = useMemo(() => {
    const { totalStudents, today, yesterday, selectedDay } = studentCounts;

    // Determine if selected date is today
    const todayISO = new Date().toISOString().slice(0, 10);
    const isToday = !studentActiveDate || studentActiveDate === todayISO;

    // Pie chart → selected date (or today if default)
    const pieCount = isToday ? today : selectedDay;

    // Progress bar → today (or yesterday if default)
    const progressCount = isToday ? yesterday : today;

    return {
      piePct: totalStudents ? Math.round((pieCount / totalStudents) * 100) : 0,
      progressPct: totalStudents ? Math.round((progressCount / totalStudents) * 100) : 0,
      progressLabel: isToday ? "Yesterday" : "Today",
    };
  }, [studentCounts, studentActiveDate]);

  return (
    <div className={`flex flex-col w-[${width}%]  h-full p-${padding}`}>
      <div className="flex w-full flex-row justify-between items-center">
        <p className="text-[#10b981] font-bold font-roboto">In app Student Login</p>
        
        <div className="relative flex items-center bg-[#b7cde3] rounded-lg px-2 py-1">
          <span className="text-black text-sm mr-1">{SAText} |</span>
          <input
            type="date"
            className="bg-transparent outline-none text-black text-sm"
            onChange={handleChangeASDate}
            value={studentActiveDate}
            max={new Date().toLocaleDateString("en-CA")}
          />
        </div>
      </div>

      <div className="w-full h-full flex items-center justify-center relative">
        <div className="w-[60%] max-w-xs aspect-square relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[{ name: "active", value: piePct }, { name: "inactive", value: 100 - piePct }]}
                innerRadius="60%"
                outerRadius="80%"
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#d1fae5" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xl font-bold text-green-600">{piePct}%</p>
          </div>
        </div>
      </div>

      <div className={`flex flex-col w-full ${marginTop ? "-mt-[20%]" : "-mt-[10%]"}  px-4`}>
        <div className="flex flex-col mb-1">
          <p className="font-bold text-lg text-black">{progressPct}%</p>
          <p className="text-sm text-gray-600">{progressLabel}</p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-[#10b981] h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export function LowerRight({ filterBacklog }){
  return (
    <div className="flex w-full h-full flex-row p-5 gap-10 justify-between">
      <PendingStudentRequests filterBacklog={filterBacklog} width={60} padding={false}/>
      <ActiveStudentsPieChart width={40} padding={2} marginTop={true}/>
    </div>
  );
};

