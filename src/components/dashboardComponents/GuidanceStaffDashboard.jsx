import { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { API, RootAPI } from '../../api';
import { UsageUtilization, CompSchedules, ActiveStudentsPieChart, AlertsOvertime, CalmiTriggerAlert, Resource, Wellness } from "./guidanceStaffDashboardComponent/Graphs";
import io from "socket.io-client";

export default function StaffDashboard() {
  const [backlog, setBacklogs] = useState([]);
  const [topResources, setTopResources] = useState([]);
  const [topWellness, setTopWellness] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const socketRef = useRef(null);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API}/chatbot/alerts`);
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // 🆕 Socket.IO for real-time alert updates
  useEffect(() => {
    if (!socketRef.current) {
      const newSocket = io(RootAPI);
      socketRef.current = newSocket;

      newSocket.on('connect', () => {
        console.log('✅ Dashboard connected to server:', newSocket.id);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Dashboard disconnected from server');
      });

      // Listen for new alerts
      newSocket.on('new-alert-created', async (data) => {
        console.log('🆕 New alert created:', data);
        await fetchAlerts();
      });

      // Listen for resolved alerts
      newSocket.on('alerts-resolved', async (data) => {
        console.log('✅ Alerts resolved:', data);
        await fetchAlerts();
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('new-alert-created');
        socketRef.current.off('alerts-resolved');
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
      const fetchBacklogs = async () => {
        try {
          const response = await axios.get(`${API}/backlogs`);
          setBacklogs(response.data);
        } catch (error) {
          console.error("Error fetching backlogs:", error.response?.data || error.message);
        }
      };
  
      fetchBacklogs(); // run when reloadKey changes
    }, []);

  const filterBacklog = backlog.filter((item) => (item.status === "Pending" && (item.student_id || item.proposal)));
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/resources/top`);
        setTopResources(res.data.resources);
        setTopWellness(res.data.wellness);
      } catch (err) {
        console.error("Error fetching top resources/wellness:", err);
      }
    };

    fetchData(); // initial fetch
    const interval = setInterval(fetchData, 10 * 60 * 1000); // repeat every 10 minutes

    return () => clearInterval(interval); // cleanup
  }, []);

  // 🔹 Helper function to convert array to CSV string
  const convertToCSV = (data, headers) => {
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape values that contain commas, quotes, or newlines
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  };

  // 🔹 Helper function to download CSV
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🔹 Export Resources to CSV
  const exportResourcesToCSV = () => {
    if (!topResources.length) return alert("No Resource Library data to export.");
    
    const data = topResources.map(row => ({
      Title: row.title,
      Category: row.category,
      Views: row.views,
    }));
    
    const csvContent = convertToCSV(data, ['Title', 'Category', 'Views']);
    const filename = `Resource_Library_${new Date().toISOString().slice(0,10)}.csv`;
    
    downloadCSV(csvContent, filename);
  };
  
  // 🔹 Export Wellness Tools to CSV
  const exportWellnessToCSV = () => {
    if (!topWellness.length) return alert("No Wellness Tools data to export.");
  
    const data = topWellness.map(row => ({
      Title: row.title,
      Category: row.category,
      Views: row.views,
    }));
    
    const csvContent = convertToCSV(data, ['Title', 'Category', 'Views']);
    const filename = `Wellness_Tools_${new Date().toISOString().slice(0,10)}.csv`;
    
    downloadCSV(csvContent, filename);
  };

  return (
      <div 
        className="w-full h-full grid"
        style={{ gridTemplateColumns: '40% 60%'}}
      >
        <div 
          className="grid gap-4" 
          style={{ gridTemplateRows: '35% 30% 30% 30%' }}
        >
          <UsageUtilization />
          <AlertsOvertime alerts={alerts} />
          <CompSchedules backlog={backlog} />
          <ActiveStudentsPieChart width={100} padding={10} marginTop={false} circleWidth={45}/>
        </div>
        
        <div 
          className="grid gap-4" 
          style={{ gridTemplateRows: '40% 85%' }}
        >
          <div className="flex flex-col flex-grow">
            <CalmiTriggerAlert alerts={alerts} padding={true} filterBacklog={filterBacklog}/>
          </div>
          <div className="flex items-center justify-center p-5 flex-col">
            <Resource exportResourcesToExcel={exportResourcesToCSV} topResources={topResources} />
            <Wellness exportWellnessToExcel={exportWellnessToCSV} topWellness={topWellness} />
          </div>
        </div>
      </div>
    )
}