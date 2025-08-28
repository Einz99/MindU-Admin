import React, { useState, useEffect } from "react";
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
} from "recharts";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

export function UsageUtilization() {
    const [usageDate, setUsageDate] = useState('Today');
    const [dateUsageValue, setDateUsageValue] = useState('');

    const Usagedata = [
      { label: 'Resource Library', value: 10, color: '#6ce5e8' },
      { label: 'Wellness Tools', value: 25, color: '#41b8d5' },
      { label: 'Chatbot', value: 45, color: '#2d8bba' },
      { label: 'Mood Tracker', value: 15, color: '#2f5f98' },
      { label: 'Scheduler', value: 30, color: '#86469c' },
      { label: 'Pet', value: 5, color: '#bc3f8d' },
    ];

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

    useEffect(() => {
      const today = new Date();
      const isoDate = today.toLocaleDateString('en-CA'); // yyyy-mm-dd
      setDateUsageValue(isoDate); // set input value to today
    }, []);

    return (
        <div className="flex flex-col p-5">
          <div className="flex w-full flex-row justify-between">
            <p className="font-roboto font-bold text-[#1e3a8a] text-2xl">Usage Utilization</p>
            <FileDownload sx={{
              fontSize: 25,
              justifyItems: 'center',
              color: '#64748b',
            }}/>
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
              <BarChart
                data={Usagedata}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }} // ⬅️ more bottom space
              >
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
                  {Usagedata.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
    );
}

export function CompSchedules() {
    const Scheduledata = [
      { label: 'Week 1', value: 8, color: '#67e8f9' },  // cyan-300
      { label: 'Week 2', value: 12, color: '#22d3ee' }, // cyan-500
      { label: 'Week 3', value: 16, color: '#0284c7' }, // sky-600
      { label: 'Week 4', value: 25, color: '#1e40af' }, // blue-800
    ];


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
          
        <div className="w-full h-full px-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={Scheduledata} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="label" type="category" />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 20, 20, 0]}>
                <LabelList dataKey="value" position="right" />
                {Scheduledata.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>  
    );
}

export function LowerRight({filterBacklog}) {
  const navigation = useNavigate();

  const [studentActiveDate, setStudentActiveDate] = useState('')
  const [SAText, setSAText] = useState('Today')
  const [SAYText, setSAYText] = useState('Yesterday')

  const studentActData = [
    {total: 512, today: 369, yesterday: 348}
  ];

  const { total, today, yesterday } = studentActData[0];
  

  const todayPct = Math.round((today / total) * 100);
  const yesterdayPct = Math.round((yesterday / total) * 100);

  const pieData = [
    { name: "active", value: todayPct },
    { name: "inactive", value: 100 - todayPct },
  ];

  const handleChangeASDate = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    
    // Zero out time
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today - selectedDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      setSAText('Today');
      setSAYText('Yesterday');
    } 
    else if (diffDays === 1) {
      setSAText('Yesterday');
      setSAYText(`${diffDays} days ago`);
    }
    else {
      setSAText(`${diffDays} days ago`);
      setSAYText(`${diffDays} days ago`);
    } 
    setStudentActiveDate(e.target.value);
  };

  useEffect(() => {
    const today = new Date();
    const isoDate = today.toLocaleDateString("en-CA"); // yyyy-mm-dd
    setStudentActiveDate(isoDate); // set input value to today
  }, []);

    return (
        <div className="flex w-full h-full flex-row p-5 gap-10 justify-between">
          <div className="flex flex-col w-[60%] h-full">
            <div className="flex flex-row justify-between">
              <p className="font-roboto font-bold text-[#f57c00] text-2xl">Pending Student Requests</p>
              <NotificationsActive
                sx={{
                  fontSize: 25,
                  justifyItems: "center",
                  color: "#f57c00",
                }}
              />
            </div>
              
            {/* Container with flex column */}
            <div className="w-full h-[90%] border-4 border-[#f57c00] rounded-xl p-2 flex flex-col">
              {/* Appointment list (scrollable) */}
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
              
              {/* Bottom button (always visible, never overlapped) */}
              <div className="mt-2 flex justify-end">
                <Button onClick={() => navigation("/scheduler")}>
                  <p className="bg-[#1e3a8a] py-1 px-3 text-white rounded-lg">View Request</p>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-[40%] h-full p-2">
            <div className="flex w-full flex-row justify-between items-center">
              <p className="text-[#10b981] font-bold font-roboto">Active Students</p>
                        
              <div className="relative flex items-center bg-[#b7cde3] rounded-lg px-2 py-1">
                {/* Prefix text */}
                <span className="text-black text-sm mr-1">{SAText} |</span>
                        
                {/* Real date input (keeps the calendar icon) */}
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
              {/* Circular progress */}
              <div className="w-[60%] max-w-xs aspect-square relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius="60%"
                      outerRadius="80%"
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? "#10b981" : "#d1fae5"}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                    
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xl font-bold text-green-600">{todayPct}%</p>
                </div>
              </div>
            </div>
                  
            {/* Yesterday stats */}
            <div className="flex flex-col w-full -mt-[20%]  px-4">
              {/* Label + Value */}
              <div className="flex flex-col mb-1">
                <p className="font-bold text-lg text-black">{yesterdayPct}%</p>
                <p className="text-sm text-gray-600">{SAYText}</p>
              </div>
                  
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#10b981] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${yesterdayPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
    );
}