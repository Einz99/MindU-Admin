import { useState, useEffect, useMemo } from "react";
import { FileDownload, NotificationsActive, FilterAlt, Sort } from '@mui/icons-material';
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
import { Badge, Button, Select, MenuItem, TableContainer, TableBody, TableCell, TableRow, Table, TableHead } from "@mui/material";
import axios from "axios";
import { API } from "../../../api";
import * as XLSX from 'xlsx';

export function UsageUtilization({ filteringDateType, filteringSection }) {
  const [dateRange, setDateRange] = useState(filteringDateType || 'today');
  const [section, setSection] = useState(filteringSection || 'All');
  const [rawData, setRawData] = useState([]); // Cache all data from backend
  const [chartData, setChartData] = useState([]);

  // Fetch all data from backend once and cache it
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data for the last year (maximum range)
        const today = new Date();
        const lastYear = new Date();
        lastYear.setFullYear(today.getFullYear() - 1);
        
        const res = await axios.get(`${API}/student-activities`, {
          params: { 
            startDate: lastYear.toLocaleDateString('en-CA'),
            endDate: today.toLocaleDateString('en-CA')
          }
        });

        setRawData(res.data.activities);
      } catch (err) {
        console.error("Error fetching usage data:", err);
        setRawData([]);
      }
    };

    fetchData();

    // Repeat every 10 minutes to refresh cache
    const interval = setInterval(fetchData, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Filter and process cached data on the frontend
  useEffect(() => {
    if (rawData.length === 0) {
      // Initialize with zeros if no data
      const modules = ["Resource", "Wellness", "Chatbot", "Mood", "Scheduler", "Pet"];
      const emptyData = modules.map((module) => ({
        label: module,
        value: 0,
        color: getModuleColor(module),
      }));
      setChartData(emptyData);
      return;
    }

    // Calculate date range for filtering
    const { start } = getDateRange(dateRange);
    const startDate = new Date(start);
    const endDate = new Date();

    // Filter data based on date range and section
    const filtered = rawData.filter((row) => {
      const rowDate = new Date(row.date);
      const dateMatch = rowDate >= startDate && rowDate <= endDate;
      
      // Section filter - use includes() to match anywhere in the string
      let sectionMatch = true;
      if (section !== 'All') {
        sectionMatch = row.section && row.section.toUpperCase().includes(section.toUpperCase());
      }
      
      return dateMatch && sectionMatch;
    });

    // Aggregate by module
    const modules = ["Resource", "Wellness", "Chatbot", "Mood", "Scheduler", "Pet"];
    const moduleMap = {};
    
    filtered.forEach((row) => {
      if (!moduleMap[row.module]) {
        moduleMap[row.module] = 0;
      }
      moduleMap[row.module] += row.visits;
    });

    // Transform to chart format
    const transformed = modules.map((module) => ({
      label: module,
      value: moduleMap[module] || 0,
      color: getModuleColor(module),
    }));

    setChartData(transformed);
  }, [rawData, dateRange, section]);

  // Sync with parent component props
  useEffect(() => {
    if (filteringDateType) setDateRange(filteringDateType);
  }, [filteringDateType]);

  useEffect(() => {
    if (filteringSection) setSection(filteringSection);
  }, [filteringSection]);

  // Helper: Get color for module
  const getModuleColor = (module) => {
    switch (module) {
      case "Resource": return "#6ce5e8";
      case "Wellness": return "#41b8d5";
      case "Chatbot": return "#2d8bba";
      case "Mood": return "#2f5f98";
      case "Scheduler": return "#86469c";
      case "Pet": return "#bc3f8d";
      default: return "#999999";
    }
  };

  // Helper: Calculate date range
  const getDateRange = (range) => {
    const today = new Date();
    let startDate = new Date();
    
    switch(range) {
      case 'today':
        startDate = new Date(today);
        break;
      case 'last7days':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'lastMonth':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'last3Months':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'last6Months':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case 'lastYear':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate = new Date(today);
    }
    
    return {
      start: startDate.toLocaleDateString('en-CA'),
      end: today.toLocaleDateString('en-CA')
    };
  };

  // Helper: Get display text
  const getDisplayText = (range) => {
    switch(range) {
      case 'today': return 'Today';
      case 'last7days': return 'Last 7 Days';
      case 'lastMonth': return 'Last Month';
      case 'last3Months': return 'Last 3 Months';
      case 'last6Months': return 'Last 6 Months';
      case 'lastYear': return 'Last Year';
      default: return 'Today';
    }
  };

  const handleExportToExcel = () => {
    const formattedData = chartData.map((data) => ({
      Module: data.label,
      Visits: data.value,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Usage Data");

    const sectionLabel = section === 'All' ? 'All_Sections' : section;
    const dateLabel = getDisplayText(dateRange).replace(/\s+/g, '_');
    XLSX.writeFile(wb, `Usage_${sectionLabel}_${dateLabel}.xlsx`);
  };

  return (
    <div className="flex flex-col p-5">
      <div className="flex w-full flex-row justify-between items-center">
        <p className="font-roboto font-bold text-[#1e3a8a] text-2xl">Usage Utilization</p>
        <FileDownload
          sx={{
            fontSize: 25,
            justifyItems: 'center',
            color: '#64748b',
            marginRight: 2,
          }}
          onClick={handleExportToExcel}
        />
      </div>

      <div className="flex w-full flex-col mb-2">
        <div className="flex flex-row justify-between  items-center  mr-2">
          <p className="font-bold text-lg">{getDisplayText(dateRange)}</p>
          <p className="text-sm text-gray-600">Strand: {section}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              interval={0}
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

export function AlertsOvertime({ alerts }) {
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // Sunday=0, Monday=1...
    const diff = (day === 0 ? -6 : 1 - day); // Monday as start
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const AlertData = useMemo(() => {
    const today = new Date();
    const result = [];

    // Loop to get the past 4 weeks
    for (let i = 0; i < 4; i++) {
      const currentMonday = getStartOfWeek(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - i * 7)
      );
      
      // Set the end of the week (Friday)
      const weekEnd = new Date(currentMonday);
      weekEnd.setDate(weekEnd.getDate() + 4); // Friday
      weekEnd.setHours(23, 59, 59, 999);

      // Count all alerts within the week range (resolved or not)
      const count = alerts.filter(
        (alert) =>
          alert.date &&
          new Date(alert.date) >= currentMonday &&
          new Date(alert.date) <= weekEnd
      ).length;

      // Push data with formatted week ending date and count
      result.push({
        date: weekEnd.toLocaleDateString(), // format to get the date of the Friday
        value: count || 0 // Ensure value is 0 if no alerts
      });
    }

    return result.reverse();
  }, [alerts]);

  const generateDateRangeString = () => {
    const firstDate = new Date(AlertData[0]?.date);
    const lastDate = new Date(AlertData[AlertData.length - 1]?.date);

    const startMonth = firstDate.getMonth() + 1; // Month is 0-based
    const startYear = firstDate.getFullYear();
    const endMonth = lastDate.getMonth() + 1;

    return `${startMonth}-${endMonth} (${startYear})`;
  };

  const handleExportToExcel = () => {
    const formattedData = AlertData.map((data) => ({
      Date: data.date,
      Alerts: data.value,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alert Data");

    const dateRange = generateDateRangeString();
    XLSX.writeFile(wb, `alerts_${dateRange}.xlsx`);
  };

  return (
    <div className="flex flex-col p-5">
      <div className="flex w-full flex-row justify-between">
        <p className="font-roboto font-bold text-[#1e3a8a] text-2xl">
          Alerts Recorded Overtime
        </p>
        <FileDownload
          sx={{
            fontSize: 25,
            justifyItems: 'center',
            color: '#64748b',
          }}
          onClick={handleExportToExcel} // Export when clicked
        />
      </div>
      
      <div className="w-full h-[100%] px-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={AlertData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              domain={['auto', 'auto']}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#2d8bba" 
              strokeWidth={3} 
              dot={true} 
            />
          </LineChart>
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

  // Generate Date Range for File Name (e.g., 6-31 for 4 months)
  const generateDateRangeString = () => {
    const firstDate = new Date(Scheduledata[0]?.date);
    const lastDate = new Date(Scheduledata[Scheduledata.length - 1]?.date);

    const startMonth = firstDate.getMonth() + 1; // Month is 0-based
    const startYear = firstDate.getFullYear();
    const endMonth = lastDate.getMonth() + 1;

    return `${startMonth}-${endMonth} (${startYear})`;
  };

  const handleExportToExcel = () => {
    const formattedData = Scheduledata.map((data) => ({
      Date: data.date,
      CompletedSchedules: data.value,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schedule Data");

    const dateRange = generateDateRangeString();
    XLSX.writeFile(wb, `schedules_${dateRange}.xlsx`);
  };

  return (
    <div className="flex flex-col p-5">
      <div className="flex w-full flex-row justify-between">
        <p className="font-roboto font-bold text-[#1e3a8a] text-2xl">
          Schedules Completed Overtime
        </p>
        <FileDownload
          sx={{
            fontSize: 25,
            justifyItems: 'center',
            color: '#64748b',
          }}
          onClick={handleExportToExcel} // Export when clicked
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
  const staff = JSON.parse(localStorage.getItem("staff"));

  return (
    <div className={`flex flex-col w-[${width}%] ${padding && "p-5"} h-full`}>
      <div className="flex flex-row justify-between">
        <p className="font-roboto font-bold text-[#f57c00] text-2xl mb-2">Pending Student Requests</p>
        <Badge badgeContent={filterBacklog.length} color="error">
          <NotificationsActive
            sx={{
              fontSize: 30,
              justifyItems: "center",
              color: "#f57c00",
            }}
          />
        </Badge>
      </div>
      
      <div className="w-full h-[90%] border-4 border-[#f57c00] rounded-xl p-2 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filterBacklog.slice(-6).map((item, index) => (
            <div
              key={index}
              className="w-full flex flex-row items-center justify-between border-b-2 border-[#94a3b8]"
            >
              <p className="font-roboto text-lg whitespace-nowrap overflow-hidden text-ellipsis">
                {staff.position !== 'Admin' ? (
                  `New appointment request from ${item.name}.`
                ) : (
                  item.proposal ? (
                    `New Event Proposal about ${item.name}.`
                  ) : (
                    `New appointment request from ${item.name}.`
                  )
                )}
              </p>
              <p className="text-[#f57c00]">{'\u25CF'}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-2 flex justify-end">
          <Button onClick={() => navigation("/scheduler")}>
            <p className="bg-[#1e3a8a] py-1 px-3 text-white text-lg rounded-lg">View Request</p>
          </Button>
        </div>
      </div>
    </div>
  );
};

export function CalmiTriggerAlert({ alerts, padding, filterBacklog, filterBacklogs, handleViewingRequest }) {
  const navigation = useNavigate();
  const staff = JSON.parse(localStorage.getItem("staff"));
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [tab, setTab] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Step 1: Filter out resolved alerts
    const unresolvedAlerts = alerts.filter(alert => alert.is_resolved === 0);
    // Step 2: Group alerts by student_id
    const groupedAlerts = unresolvedAlerts.reduce((acc, alert) => {
      if (!acc[alert.student_id]) {
        acc[alert.student_id] = [];
      }
      acc[alert.student_id].push(alert);
      return acc;
    }, {});

    // Step 3: For each student, select the oldest alert
    const oldestAlerts = Object.values(groupedAlerts).map(studentAlerts => {
    // Sorting the alerts by date (oldest first)
    const sortedAlerts = studentAlerts.sort((a, b) => new Date(a.date) - new Date(b.date));
    // Return the oldest (first) alert
    return sortedAlerts[0]; 
  });

    // Step 4: Set the filtered alerts to state
    setFilteredAlerts(oldestAlerts);
  }, [alerts]);

  const handleViewAlert = (studentId) => {
    // Store the student ID in localStorage so LiveAgent can auto-select it
    localStorage.setItem('selectedStudentId', studentId);
    
    // Navigate to the chat page
    navigation("/Chat");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const data = tab === 0 ? filteredAlerts : tab === 1 ? filterBacklog : staff.position === "Admin" ? filterBacklogs : [];

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1);
  };

  return (
    <div className={`flex flex-col w-[100%] ${padding && "p-5"} h-full`}>
      <div className="flex flex-row justify-between mb-2">
        {tab === 0 ? (
          <>
            <p className="font-roboto font-bold text-[#b91c1c] text-2xl mb-1">Notification and Alert</p>
            <Badge badgeContent={filteredAlerts.length} color="error">
              <NotificationsActive
                sx={{
                  fontSize: 30,
                  justifyItems: "center",
                  color: "#b91c1c",
                }}
              />
            </Badge>
          </>) : tab === 1 ?
          (<>
            <p className="font-roboto font-bold text-[#f57c00] text-2xl mb-1">Notification and Alert</p>
            <Badge badgeContent={filterBacklog.length} color="error">
              <NotificationsActive
                sx={{
                  fontSize: 30,
                  justifyItems: "center",
                  color: "#f57c00",
                }}
              />
            </Badge>
          </>) :
          (<>
            <p className="font-roboto font-bold text-[#bc3f8d] text-2xl mb-1">Notification and Alert</p>
            <Badge badgeContent={filterBacklogs.length} color="error">
              <NotificationsActive
                sx={{
                  fontSize: 30,
                  justifyItems: "center",
                  color: "#bc3f8d",
                }}
              />
            </Badge>
          </>)
        }
      </div>
      
      <div className={`w-full h-[90%] border-4 ${tab === 0 ? "border-[#b91c1c]" : tab === 1 ? "border-[#f57c00]" : "border-[#bc3f8d]"} rounded-xl px-2 flex flex-col`}>
        <div className={`${tab === 0 ? "border-[#b91c1c]" : tab === 1 ? "border-[#f57c00]" : "border-[#bc3f8d]"} border-b-4 flex flex-row gap-5 justify-center mt-2 `}>
            <div 
              className="flex flex-row mb-2 gap-2"
              onClick={() => setTab(0)}
            >
              <p className={`${tab === 0 && "bg-[#b91c1c] text-white font-bold"} font-roboto text-lg py-1 px-2 rounded-2xl`}>Calmi Trigger</p>
              <p className="bg-[#b91c1c] px-2 rounded-full my-auto text-white font-roboto font-bold">{filteredAlerts.length}</p>
            </div>
            <div 
              className="flex flex-row mb-2 gap-2"
              onClick={() => setTab(1)}
            >
              <p className={`${tab === 1 && "bg-[#f57c00] text-white font-bold"} font-roboto text-lg py-1 px-2 rounded-2xl`}>Student Request</p>
              <p className="bg-[#b91c1c] px-2 rounded-full my-auto text-white font-roboto font-bold">{filterBacklog.length}</p>
            </div>
            {staff.position === "Admin" && (
              <div 
                className="flex flex-row mb-2 gap-2"
                onClick={() => setTab(2)}
              >
                <p className={`${tab === 2 && "bg-[#bc3f8d] text-white font-bold"} font-roboto text-lg py-1 px-2 rounded-2xl`}>Event Proposal</p>
                <p className="bg-[#b91c1c] px-2 rounded-full my-auto text-white font-roboto font-bold">{filterBacklogs.length}</p>
              </div>
            )}
        </div>
        <div className={`flex-1 overflow-y-auto space-y-2 px-2 ${tab === 0 ? "border-[#b91c1c]" : tab === 1 ? "border-[#f57c00]" : "border-[#bc3f8d]"} ${data.length > 5 && "border-b-4"}`}>
          {tab === 0 ?
            filteredAlerts.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-3xl">No Alerts Reported Today From Calmi</p>
              </div>
            ) : (
              filteredAlerts.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((item, index) => (
                <div
                  key={index}
                  className="w-full flex flex-row items-center justify-between border-b-2 border-[#94a3b8]"
                >
                  <div className="flex flex-col items-start justify-between">
                    <p className="font-roboto text-lg whitespace-nowrap overflow-hidden text-ellipsis">
                      A trigger was detected from {item.firstName} {item.lastName}
                    </p>
                    <p className="font-roboto text-lg whitespace-nowrap italic text-gray-500 -mt-2">
                      {formatDate(item.date)}
                    </p>
                  </div>
                  <button 
                    className="bg-[#1e3a8a] text-white px-3 mr-3 py-0.5 rounded-lg hover:bg-[#2563eb] transition-colors"
                    onClick={() => handleViewAlert(item.student_id)}
                  >
                    View
                  </button>
                </div>
              ))
            )
          : tab === 1 ?
          (<>
            {filterBacklog.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((item, index) => (
              <div
                key={index}
                className="w-full flex flex-row items-center justify-between border-b-2 border-[#94a3b8]"
              >
                <p className="font-roboto text-lg whitespace-nowrap overflow-hidden text-ellipsis">
                  {staff.position !== 'Admin' ? (
                    `New appointment request from ${item.name}.`
                  ) : (
                    item.proposal ? (
                      `New Event Proposal about ${item.name}.`
                    ) : (
                      `New appointment request from ${item.name}.`
                    )
                  )}
                </p>
                <p className="text-[#f57c00]">{'\u25CF'}</p>
              </div>
            ))}
            <div className="mt-2 flex justify-end">
              <Button onClick={() => navigation("/scheduler")}>
                <p className="bg-[#1e3a8a] py-1 px-3 text-white text-lg rounded-lg">View Request</p>
              </Button>
            </div>
          </>)
          : 
          (<div className="flex flex-col gap-3 overflow-y-auto">
            {filterBacklogs.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((item) => (
              <div key={item.id} className="flex flex-row justify-between border-b-2 border-[#94a3b8] items-center">
                <p>
                  {item.name} Proposal
                </p>
                <Button className="mr-5" onClick={() => handleViewingRequest(item)}>
                    <p className="bg-[#1e3a8a] text-white px-3 py-0.5 rounded-lg mb-0.5">View</p>
                </Button>
              </div>
            ))}
          </div>)
          }
        </div>
        {data.length > 5 && (
        <div className="flex items-center justify-end px-2 py-0.5">
          <span className="pr-5">Show: </span>
          <Select value={rowsPerPage} onChange={handleRowsPerPageChange} size="small">
            {[5, 10, 15, 20, 25, 30].map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
            <div className="flex justify-center items-center p-2">
              <Button onClick={handlePreviousPage} disabled={page === 1}><p className={`${page === 1 ? "text-gray-500" : "text-black"} text-2xl font-extrabold`}>{"<"}</p></Button>
              <span className="mx-2">Page {page} of {totalPages}</span>
              <Button onClick={handleNextPage} disabled={page === totalPages}><p className={`${page === totalPages ? "text-gray-500" : "text-black"} text-2xl font-extrabold`}>{">"}</p></Button>
            </div>
        </div>
      )}
      </div>
    </div>
  );
}

export function ActiveStudentsPieChart({width, padding, marginTop, circleWidth, filteringDateType, filteringSection }) {
  const [dateRange, setDateRange] = useState(filteringDateType || 'today');
  const [section, setSection] = useState(filteringSection || 'All');
  const [rawData, setRawData] = useState(null); // Cache all login data
  const [totalStudents, setTotalStudents] = useState(0);
  const [piePercentage, setPiePercentage] = useState(0);
  const [barPercentage, setBarPercentage] = useState(0);

  // Sync with parent component props
  useEffect(() => {
    if (filteringDateType) setDateRange(filteringDateType);
  }, [filteringDateType]);

  useEffect(() => {
    if (filteringSection) setSection(filteringSection);
  }, [filteringSection]);

  // Helper: Calculate date range
  const getDateRange = (range) => {
    const today = new Date();
    let startDate = new Date();
    
    switch(range) {
      case 'today':
        startDate = new Date(today);
        break;
      case 'last7days':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'lastMonth':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'last3Months':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'last6Months':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case 'lastYear':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate = new Date(today);
    }
    
    return {
      start: startDate.toISOString().slice(0, 10),
      end: today.toISOString().slice(0, 10)
    };
  };

  // Helper: Get display text
  const getDisplayText = (range) => {
    switch(range) {
      case 'today': return 'Today';
      case 'last7days': return 'Last 7 Days';
      case 'lastMonth': return 'Last Month';
      case 'last3Months': return 'Last 3 Months';
      case 'last6Months': return 'Last 6 Months';
      case 'lastYear': return 'Last Year';
      default: return 'Today';
    }
  };

  // Fetch all data once and cache it
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch login data for the last year
        const today = new Date();
        const lastYear = new Date();
        lastYear.setFullYear(today.getFullYear() - 1);
        
        const res = await axios.get(`${API}/student-logins`, {
          params: { 
            startDate: lastYear.toISOString().slice(0, 10),
            endDate: today.toISOString().slice(0, 10)
          }
        });

        setRawData(res.data.logins);
        setTotalStudents(res.data.totalStudents);
      } catch (err) {
        console.error("Error fetching login data:", err);
        setRawData([]);
      }
    };

    fetchData();

    // Refresh every 10 minutes
    const interval = setInterval(fetchData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter and calculate percentages on frontend
  useEffect(() => {
    if (!rawData || totalStudents === 0) {
      setPiePercentage(0);
      setBarPercentage(0);
      return;
    }

    const { start } = getDateRange(dateRange);
    const startDate = new Date(start);
    const todayDate = new Date();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(todayDate.getDate() - 1);

    // Filter data based on section
    const filteredData = rawData.filter((row) => {
      if (section === 'All') return true;
      return row.section && row.section.toUpperCase().includes(section.toUpperCase());
    });

    // Get unique students count based on section filter
    const sectionStudentsCount = section === 'All' 
      ? totalStudents 
      : new Set(filteredData.map(row => row.student_id)).size;

    // PIE CHART CALCULATION
    let pieCount = 0;
    
    if (dateRange === 'today') {
      // Show today's logins for pie
      pieCount = new Set(
        filteredData
          .filter(row => {
            const loginDate = new Date(row.login_date);
            return loginDate.toDateString() === todayDate.toDateString();
          })
          .map(row => row.student_id)
      ).size;
    } else {
      // For date ranges (last 7 days, last month, etc.)
      // Show unique students who logged in within that range
      pieCount = new Set(
        filteredData
          .filter(row => {
            const loginDate = new Date(row.login_date);
            return loginDate >= startDate && loginDate <= todayDate;
          })
          .map(row => row.student_id)
      ).size;
    }

    // BAR CHART CALCULATION (always shows yesterday for 'today', today for other ranges)
    let barCount = 0;
    
    if (dateRange === 'today') {
      // Show yesterday's logins for bar
      barCount = new Set(
        filteredData
          .filter(row => {
            const loginDate = new Date(row.login_date);
            return loginDate.toDateString() === yesterdayDate.toDateString();
          })
          .map(row => row.student_id)
      ).size;
    } else {
      // Show today's logins for bar
      barCount = new Set(
        filteredData
          .filter(row => {
            const loginDate = new Date(row.login_date);
            return loginDate.toDateString() === todayDate.toDateString();
          })
          .map(row => row.student_id)
      ).size;
    }

    // Calculate percentages
    const piePct = sectionStudentsCount ? Math.round((pieCount / sectionStudentsCount) * 100) : 0;
    const barPct = sectionStudentsCount ? Math.round((barCount / sectionStudentsCount) * 100) : 0;

    setPiePercentage(piePct);
    setBarPercentage(barPct);
  }, [rawData, dateRange, section, totalStudents]);

  const barLabel = dateRange === 'today' ? 'Yesterday' : 'Today';

  return (
    <div className={`flex flex-col w-[${width}%] h-full p-${padding}`}>
      <div className="flex w-full flex-row justify-between items-center">
        <p className="text-[#1e3a8a] font-bold font-roboto text-2xl">In-app Student Login</p>
        <p className="text-gray-400 text-sm">Strand: {filteringSection}</p>
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center relative">
        <p className="-mb-7 text-[#10b981] text-lg font-bold">{getDisplayText(dateRange)}</p>
        <div className={`${circleWidth ? `w-[${circleWidth}%]` : 'w-[60%]'} max-w-xs aspect-square relative`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "active", value: piePercentage }, 
                  { name: "inactive", value: 100 - piePercentage }
                ]}
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
            <p className="text-xl font-bold text-green-600">{piePercentage}%</p>
          </div>
        </div>
      </div>

      <div className={`flex flex-col w-full ${marginTop ? "-mt-[20%]" : "-mt-[10%]"} px-4`}>
        <div className="flex flex-col mb-1">
          <p className="font-bold text-lg text-black">{barPercentage}%</p>
          <p className="text-sm text-gray-600">{barLabel}</p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-[#10b981] h-3 rounded-full transition-all duration-500"
            style={{ width: `${barPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function LowerRight({ filterBacklog }){
  return (
    <div className="flex w-full h-full flex-row p-5 gap-10 justify-between">
      <PendingStudentRequests filterBacklog={filterBacklog} width={50} padding={false}/>
      <ActiveStudentsPieChart width={50} padding={2} marginTop={true}/>
    </div>
  );
};

export function Resource({ exportResourcesToExcel, topResources }) {
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterType, setFilterType] = useState(0);
  const [sortType, setSortType] = useState(0);

  const categoryMap = {
    0: 'All',
    1: 'Emotional/Mental',
    2: 'Social',
    3: 'Financial/Ocupation',
    4: 'Physical',
    5: 'Spiritual',
    6: 'Intellectual',
    7: 'Environment'
  };

  const filteredAndSortedResources = useMemo(() => {
    let result = [...topResources];

    // Apply filter
    if (filterType !== 0) {
      const categoryName = categoryMap[filterType];
      result = result.filter(resource => resource.category === categoryName);
    }

    // Apply sort
    switch (sortType) {
      case 0: // A - Z
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 1: // Z - A
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 2: // Most Views
        result.sort((a, b) => b.views - a.views);
        break;
      case 3: // Least Views
        result.sort((a, b) => a.views - b.views);
        break;
      case 4: // Date Posted (newest first)
        result.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));
        break;
      default:
        break;
    }

    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topResources, filterType, sortType]);

  const handleFilter = (type) => {
    setFilterOpen(prev => !prev);
    setFilterType(type);
    setPage(1);
  }

  const handleSort = (type) => {
    setSortOpen(prev => !prev);
    setSortType(type);
    setPage(1);
  }

  const totalPages = Math.ceil(topResources.length / rowsPerPage);

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1);
  };

  return (
    <>
      <div className="flex w-full flex-row justify-between p-4">
        <p className="font-roboto font-bold text-[#41b8d5] text-2xl">Resource Library</p>
      </div>
      <div className="w-full h-full border-4 border-[#41b8d5] rounded-xl flex flex-col overflow-y-auto px-2 mb-4">
        <div className="flex w-full flex-row justify-end p-4 gap-4">
          <FileDownload 
            sx={{
              fontSize: 25,
              justifyItems: 'center',
              color: '#64748b',
            }}
            onClick={exportResourcesToExcel}
          />
          <div className="relative">
            <FilterAlt 
              sx={{
                fontSize: 25,
                justifyItems: 'center',
                color: '#64748b',
              }}
              onClick={() => {setFilterOpen(prev => !prev); setSortOpen(false)}}
            />
            {filterOpen && (
              <div className="z-50">
                <div className="absolute right-1 w-fit bg-[#b7cde3] rounded-s-xl shadow-lg border-4 border-[#1e3a8a] mt-2 z-40">
                  <ul className="text-right">
                    <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer rounded-tl-xl ${filterType === 0 && "text-black"}`} onClick={() => handleFilter(0)}>All</li>
                    <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer ${filterType === 1 && "text-black"}`} onClick={() => handleFilter(1)}>Emotional/Mental</li>
                    <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer ${filterType === 2 && "text-black"}`} onClick={() => handleFilter(2)}>Social</li>
                    <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${filterType === 3 && "text-black"}`} onClick={() => handleFilter(3)}>Financial/Ocupation</li>
                    <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${filterType === 4 && "text-black"}`} onClick={() => handleFilter(4)}>Physical</li>
                    <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${filterType === 5 && "text-black"}`} onClick={() => handleFilter(5)}>Spiritual</li>
                    <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${filterType === 6 && "text-black"}`} onClick={() => handleFilter(6)}>Intellectual</li>
                    <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${filterType === 7 && "text-black"}`} onClick={() => handleFilter(7)}>Environment</li>
                  </ul>
                </div>
                <div className="absolute right-2 top-[-2px] w-4 h-10  border-x-8 border-b-8 border-b-[#1e3a8a] border-x-transparent z-50" />
                <div className="absolute right-2 top-[12px] w-4 h-8  border-x-8 border-b-8 border-b-[#b7cde3] border-x-transparent z-50" />
              </div>
            )}
          </div>
          <div className="relative">
            <Sort 
              sx={{
                fontSize: 25,
                justifyItems: 'center',
                color: '#64748b',
              }}
              onClick={() => {setSortOpen(prev => !prev); setFilterOpen(false)}}
            />
            {sortOpen && (
              <div className="z-50">
                <div className="absolute right-1 w-[7.85rem] bg-[#b7cde3] rounded-s-xl shadow-lg border-4 border-[#1e3a8a] mt-2 z-40">
                  <ul className="text-right">
                    <li className={`px-4 py-0.5  text-[#64748b] hover:text-[#334155] cursor-pointer rounded-tl-xl ${sortType === 0 && "text-black"}`} onClick={() => handleSort(0)}>A - Z</li>
                    <li className={`px-4 py-0.5  text-[#64748b] hover:text-[#334155] cursor-pointer ${sortType === 1 && "text-black"}`} onClick={() => handleSort(1)}>Z - A</li>
                    <li className={`px-4 py-0.5  text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${sortType === 2 && "text-black"}`} onClick={() => handleSort(2)}>Most View</li>
                    <li className={`px-4 py-0.5  text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${sortType === 3 && "text-black"}`} onClick={() => handleSort(3)}>Least View</li>
                    <li className={`px-4 py-0.5  text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${sortType === 4 && "text-black"}`} onClick={() => handleSort(4)}>Date Posted</li>
                  </ul>
                </div>
                <div className="absolute right-2 top-[-0.5px] w-4 h-10  border-x-8 border-b-8 border-b-[#1e3a8a] border-x-transparent z-50" />
                <div className="absolute right-2 top-[12px] w-4 h-8  border-x-8 border-b-8 border-b-[#b7cde3] border-x-transparent z-50" />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <TableContainer className="border-b-2 border-[#41b8d5] h-[90%]">
            <Table>
              <TableHead>
                <TableRow className="border-y-2 border-[#41b8d5] h-8">
                  <TableCell className="py-0.5 px-2 text-sm w-[75%]" sx={{paddingY: '8px'}}>
                    <p className="leading-none font-bold">Title</p>
                  </TableCell>
                  <TableCell className="py-0.5 px-2 text-sm w-[15%] text-center" sx={{paddingY: '8px'}}>
                    <p className="leading-none text-center font-bold">Category</p>
                  </TableCell>
                  <TableCell className="py-0.5 px-2 text-sm w-[10%] text-center" sx={{paddingY: '8px'}}>
                    <p className="leading-none text-center font-bold">Views</p>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedResources.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((row, index) => (
                  <TableRow key={index} className="h-4">
                    <TableCell 
                      className="px-2 text-sm w-[65%]"
                      sx={{paddingY: 1}}
                    >
                      <p className="leading-none">{row.title}</p>
                    </TableCell>
                    <TableCell 
                      className="px-2 text-sm w-[25%] text-center"
                      sx={{paddingY: 1}}
                    >
                      <p className="text-center">{row.category}</p>
                    </TableCell>
                    <TableCell 
                      className="px-2 text-sm w-[10%] text-center"
                      sx={{paddingY: 1}}
                    >
                      <p className="text-center">{row.views}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <div className="flex items-center justify-end px-2 py-0.5">
            <span className="pr-5">Show: </span>
            <Select value={rowsPerPage} onChange={handleRowsPerPageChange} size="small">
              {[5, 10, 15, 20, 25, 30].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
              <div className="flex justify-center items-center p-2">
                <Button onClick={handlePreviousPage} disabled={page === 1}><p className={`${page === 1 ? "text-gray-500" : "text-black"} text-2xl font-extrabold`}>{"<"}</p></Button>
                <span className="mx-2">Page {page} of {totalPages}</span>
                <Button onClick={handleNextPage} disabled={page === totalPages}><p className={`${page === totalPages ? "text-gray-500" : "text-black"} text-2xl font-extrabold`}>{">"}</p></Button>
              </div>
          </div>

        </div>
      </div>
    </>
  );
};

export function Wellness({ exportWellnessToExcel, topWellness }) {
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterType, setFilterType] = useState(0);
  const [sortType, setSortType] = useState(0);

  const categoryMap = {
    0: 'All',
    1: 'Breathing Exercises',
    2: 'Meditation Guide',
  };

  const filteredAndSortedWellness = useMemo(() => {
    let result = [...topWellness];

    // Apply filter
    if (filterType !== 0) {
      const categoryName = categoryMap[filterType];
      result = result.filter(resource => resource.category === categoryName);
    }

    // Apply sort
    switch (sortType) {
      case 0: // A - Z
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 1: // Z - A
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 2: // Most Views
        result.sort((a, b) => b.views - a.views);
        break;
      case 3: // Least Views
        result.sort((a, b) => a.views - b.views);
        break;
      case 4: // Date Posted (newest first)
        result.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));
        break;
      default:
        break;
    }

    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topWellness, filterType, sortType]);

  const handleFilter = (type) => {
    setFilterOpen(prev => !prev);
    setFilterType(type);
    setPage(1);
  }

  const handleSort = (type) => {
    setSortOpen(prev => !prev);
    setSortType(type);
    setPage(1);
  }

  const totalPages = Math.ceil(topWellness.length / rowsPerPage);

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1);
  };

  return (
    <>
      <div className="flex w-full flex-row justify-between p-4">
        <p className="font-roboto font-bold text-[#41b8d5] text-2xl">Wellness Tools</p>
      </div>
      <div className="w-full h-full border-4 border-[#41b8d5] rounded-xl flex flex-col overflow-y-auto px-2">
        <div className="flex w-full flex-row justify-end p-4 gap-4">
          <FileDownload 
            sx={{
              fontSize: 25,
              justifyItems: 'center',
              color: '#64748b',
            }}
            onClick={exportWellnessToExcel}
          />
          <div className="relative">
            <FilterAlt 
              sx={{
                fontSize: 25,
                justifyItems: 'center',
                color: '#64748b',
              }}
              onClick={() => {setFilterOpen(prev => !prev); setSortOpen(false)}}
            />
            {filterOpen && (
              <div className="z-50">
                <div className="absolute right-1 w-fit bg-[#b7cde3] rounded-s-xl shadow-lg border-4 border-[#1e3a8a] mt-2 z-40">
                  <ul className="text-right">
                    <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer rounded-tl-xl ${filterType === 0 && "text-black"}`} onClick={() => handleFilter(0)}>All</li>
                    <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer ${filterType === 1 && "text-black"}`} onClick={() => handleFilter(1)}>Breathing Exercises</li>
                    <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer ${filterType === 2 && "text-black"}`} onClick={() => handleFilter(2)}>Meditation Guide</li>
                  </ul>
                </div>
                <div className="absolute right-2 top-[-2px] w-4 h-10  border-x-8 border-b-8 border-b-[#1e3a8a] border-x-transparent z-50" />
                <div className="absolute right-2 top-[12px] w-4 h-8  border-x-8 border-b-8 border-b-[#b7cde3] border-x-transparent z-50" />
              </div>
            )}
          </div>
          <div className="relative">
            <Sort 
              sx={{
                fontSize: 25,
                justifyItems: 'center',
                color: '#64748b',
              }}
              onClick={() => {setSortOpen(prev => !prev); setFilterOpen(false)}}
            />
            {sortOpen && (
              <div className="z-50">
                <div className="absolute right-1 w-[7.85rem] bg-[#b7cde3] rounded-s-xl shadow-lg border-4 border-[#1e3a8a] mt-2 z-40">
                  <ul className="text-right">
                    <li className={`px-4 py-0.5  text-[#64748b] hover:text-[#334155] cursor-pointer rounded-tl-xl ${sortType === 0 && "text-black"}`} onClick={() => handleSort(0)}>A - Z</li>
                    <li className={`px-4 py-0.5  text-[#64748b] hover:text-[#334155] cursor-pointer ${sortType === 1 && "text-black"}`} onClick={() => handleSort(1)}>Z - A</li>
                    <li className={`px-4 py-0.5  text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${sortType === 2 && "text-black"}`} onClick={() => handleSort(2)}>Most View</li>
                    <li className={`px-4 py-0.5  text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${sortType === 3 && "text-black"}`} onClick={() => handleSort(3)}>Least View</li>
                    <li className={`px-4 py-0.5  text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${sortType === 4 && "text-black"}`} onClick={() => handleSort(4)}>Date Posted</li>
                  </ul>
                </div>
                <div className="absolute right-2 top-[-0.5px] w-4 h-10  border-x-8 border-b-8 border-b-[#1e3a8a] border-x-transparent z-50" />
                <div className="absolute right-2 top-[12px] w-4 h-8  border-x-8 border-b-8 border-b-[#b7cde3] border-x-transparent z-50" />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <TableContainer className="border-b-2 border-[#41b8d5] h-[90%]">
            <Table>
              <TableHead>
                <TableRow className="border-t-2 border-b-2 border-[#41b8d5] h-8">
                  <TableCell className="py-0.5 px-2 text-sm w-[65%]" sx={{paddingY: '8px'}}>
                    <p className="leading-none font-bold">Title</p>
                  </TableCell>
                  <TableCell className="py-0.5 px-2 text-sm w-[25%] text-center" sx={{paddingY: '8px'}}>
                    <p className="leading-none text-center font-bold">Category</p>
                  </TableCell>
                  <TableCell className="py-0.5 px-2 text-sm w-[10%] text-center" sx={{paddingY: '8px'}}>
                    <p className="leading-none text-center font-bold">Views</p>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedWellness.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((row, index) => (
                  <TableRow key={index} className="h-4">
                    <TableCell
                      className="py-0 px-2 text-sm w-[75%]"
                      sx={{paddingY: 1}}
                    >
                      <p className="leading-none">{row.title}</p>
                    </TableCell>
                    <TableCell
                      className="py-0 px-2 text-sm w-[15%] text-center"
                      sx={{paddingY: 1}}
                    >
                      <p className="text-center">{row.category}</p>
                    </TableCell>
                    <TableCell
                      className="py-0 px-2 text-sm w-[10%] text-center"
                      sx={{paddingY: 1}}
                    >
                      <p className="text-center">{row.views}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <div className="flex items-center justify-end px-2 py-0.5">
            <span className="pr-5">Show: </span>
            <Select value={rowsPerPage} onChange={handleRowsPerPageChange} size="small">
              {[5, 10, 15, 20, 25, 30].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
              <div className="flex justify-center items-center p-2">
                <Button onClick={handlePreviousPage} disabled={page === 1}><p className={`${page === 1 ? "text-gray-500" : "text-black"} text-2xl font-extrabold`}>{"<"}</p></Button>
                <span className="mx-2">Page {page} of {totalPages}</span>
                <Button onClick={handleNextPage} disabled={page === totalPages}><p className={`${page === totalPages ? "text-gray-500" : "text-black"} text-2xl font-extrabold`}>{">"}</p></Button>
              </div>
          </div>
        </div>
      </div>    
    </>
  );
};
