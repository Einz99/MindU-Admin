import { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { API, RootAPI } from '../../api';
import { UsageUtilization, CompSchedules, ActiveStudentsPieChart, AlertsOvertime, CalmiTriggerAlert, Resource, Wellness } from "./guidanceStaffDashboardComponent/Graphs";
import io from "socket.io-client";
import { FilterAlt } from "@mui/icons-material";

export default function AdminStaffDashboard({filterBacklogs, handleViewingRequest}) {
  const [backlog, setBacklogs] = useState([]);
  const [topResources, setTopResources] = useState([]);
  const [topWellness, setTopWellness] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const socketRef = useRef(null);

  const [filteringDateType, setFilteringDateType] = useState('today');
  const [filteringSection, setFilteringSection] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDateOpen, setFilterDateOpen] = useState(false);
  const [filterSectionOpen, setFilterSectionOpen] = useState(false);
  const [sendFilterDate, setSendFilterDate] = useState('today');
  const [sendFilterSection, setSendFilterSection] = useState('all');

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

  const filterBacklog = backlog.filter((item) => (item.status === "Pending" && (item.student_id || !item.proposal)));
  
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

  const handleApplyFilters = () => {
    setSendFilterDate(filteringDateType);
    setSendFilterSection(filteringSection);
    setFilterOpen(false);
  };

  return (
      <div 
        className="w-full h-full grid"  // 👈 ensures grid has a real height
        style={{ gridTemplateColumns: '40% 60%'}}
      > 
        <div 
          className="grid gap-4 relative" 
          style={{ gridTemplateRows: '0.5% 35% 30% 30% 30%' }}
        >
          {filterOpen && (
            <div className="absolute top-5 right-2 z-40 bg-white border-[1px] border-[#1e3a8a] rounded-md shadow-lg text-[#1e3a8a] w-60 pt-2">
              <p className="font-bold p-2">Filter Date</p>
              <div 
                className="relative -mt-2"
                onClick={() => {setFilterDateOpen(!filterDateOpen); setFilterSectionOpen(false);}}
              >
                {filterDateOpen && (
                  <div className="bg-white text-[#1e3a8a] border-[1px] border-[#1e3a8a] rounded-md shadow-lg absolute top-8 right-2 w-36 z-0">
                    <div
                      onClick={() => {setFilteringDateType("today");}}
                      className="p-2 hover:bg-[#1e3a8a] hover:text-white cursor-pointer rounded-t-md"
                    >
                      Today
                    </div>
                    <div
                      onClick={() => {setFilteringDateType("last7days");}}
                      className="p-2 hover:bg-[#1e3a8a] hover:text-white cursor-pointer"
                    >
                      Last 7 Days
                    </div>
                    <div
                      onClick={() => {setFilteringDateType("lastMonth");}}
                      className="p-2 hover:bg-[#1e3a8a] hover:text-white cursor-pointer"
                    >
                      Last 30 Days
                    </div>
                    <div
                      onClick={() => {setFilteringDateType("last3Months");}}
                      className="p-2 hover:bg-[#1e3a8a] hover:text-white cursor-pointer"
                    >
                      Last 3 Months
                    </div>
                    <div
                      onClick={() => {setFilteringDateType("last6Months");}}
                      className="p-2 hover:bg-[#1e3a8a] hover:text-white cursor-pointer"
                    >
                      Last 6 Months
                    </div>
                    <div
                      onClick={() => {setFilteringDateType("lastYear");}}
                      className="p-2 hover:bg-[#1e3a8a] hover:text-white cursor-pointer rounded-b-md"
                    >
                      Last 1 Year
                    </div>
                  </div>
                )}
                <div className="z-50">
                  <p className="bg-[#1e3a8a] text-white p-2 border-b-2 cursor-pointer rounded-md mx-2">
                    {filteringDateType === 'today' ? 'Today' :
                      filteringDateType === 'last7days' ? 'Last 7 Days' :
                      filteringDateType === 'lastMonth' ? 'Last 30 Days' :
                      filteringDateType === 'last3Months' ? 'Last 3 Months' :
                      filteringDateType === 'last6Months' ? 'Last 6 Months' :
                      filteringDateType === 'lastYear' ? 'Last 1 Year' :
                      'Select Date Range'}
                  </p>
                </div>
              </div>
              <p className="font-bold p-2">Filter Section</p>
              <div 
                className={`relative -mt-2 ${filterDateOpen ? '-z-50' : 'z-50'}`}
                onClick={() => {setFilterDateOpen(false); setFilterSectionOpen(!filterSectionOpen);}}
              >
                {filterSectionOpen && (
                  <div className="bg-white text-[#1e3a8a] border-[1px] border-[#1e3a8a] rounded-md shadow-lg absolute top-8 right-2 w-36 -z-10">
                    <div
                      onClick={() => {setFilteringSection("All");}}
                      className="p-2 hover:bg-[#1e3a8a] hover:text-white cursor-pointer rounded-t-md"
                    >
                      All Sections
                    </div>
                    <div
                      onClick={() => {setFilteringSection("ABM");}}
                      className="p-2 hover:bg-[#1e3a8a] hover:text-white cursor-pointer"
                    >
                      ABM
                    </div>
                    <div
                      onClick={() => {setFilteringSection("HE");}}
                      className="p-2 hover:bg-[#1e3a8a] hover:text-white cursor-pointer"
                    >
                      HE
                    </div>
                    <div
                      onClick={() => {setFilteringSection("HUMSS");}}
                      className="p-2 hover:bg-[#1e3a8a] hover:text-white cursor-pointer"
                    >
                      HUMSS
                    </div>
                    <div
                      onClick={() => {setFilteringSection("ICT");}}
                      className="p-2 hover:bg-[#1e3a8a] hover:text-white cursor-pointer"
                    >
                      ICT
                    </div>
                    <div
                      onClick={() => {setFilteringSection("STEM");}}
                      className="p-2 hover:bg-[#1e3a8a] hover:text-white cursor-pointer rounded-b-md"
                    >
                      STEM
                    </div>
                  </div>
                )}
                <div className={`${filterDateOpen ? '-z-50' : 'z-50'}`}>
                  <p className="bg-[#1e3a8a] text-white p-2 border-b-2 cursor-pointer rounded-md mx-2">
                    {filteringSection === 'all' ? 'All Sections' : filteringSection}
                  </p>
                </div>
              </div>
              <div className="flex justify-end p-2">
                <button
                  className="text-red-500"
                  onClick={() => setFilterOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="text-[#1e3a8a] px-4 py-2 rounded-md"
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
          <div 
            className="absolute w-fit h-fit bg-white rounded-full z-50 border-2 border-[#1e3a8a] top-0 right-2 flex flex-row items-center justify-center py-1 px-3 gap-2 text-[#1e3a8a]"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <p className="italic">Filter Options</p>
            <FilterAlt />
          </div>
          <div />
          <UsageUtilization filteringDateType={sendFilterDate} filteringSection={sendFilterSection} />
          <ActiveStudentsPieChart width={100} padding={10} marginTop={false} circleWidth={45} filteringDateType={sendFilterDate} filteringSection={sendFilterSection} />
          <AlertsOvertime alerts={alerts} />
          <CompSchedules backlog={backlog} />
        </div>
        <div 
          className="grid gap-4" 
          style={{ gridTemplateRows: '40% 85%' }}
        >
          <div className="flex flex-col flex-grow">
            <CalmiTriggerAlert alerts={alerts} padding={true} filterBacklog={filterBacklog} filterBacklogs={filterBacklogs} handleViewingRequest={handleViewingRequest}/>
          </div>
          <div className="flex items-center justify-center p-5 flex-col">
            <Resource exportResourcesToExcel={exportResourcesToCSV} topResources={topResources} />
            <Wellness exportWellnessToExcel={exportWellnessToCSV} topWellness={topWellness} />
          </div>
        </div>
      </div>
    )
}