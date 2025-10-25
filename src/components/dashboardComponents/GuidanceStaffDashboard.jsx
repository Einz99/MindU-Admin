import { useState, useEffect, useRef } from "react";
import { FileDownload } from '@mui/icons-material';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import axios from 'axios';
import { API, RootAPI } from '../../api';
import { UsageUtilization, CompSchedules, LowerRight, AlertsOvertime, CalmiTriggerAlert } from "./guidanceStaffDashboardComponent/Graphs";
import io from "socket.io-client";

export default function StaffDashboard() {
  const [backlog, setBacklogs] = useState([]);
  const [topResources, setTopResources] = useState([]);
  const [topWellness, setTopWellness] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const socketRef = useRef(null);

  // Fetch alerts function - extracted so we can reuse it
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
  
      fetchBacklogs();
    }, []);

  const filterBacklog = backlog.filter((item) => (item.status === "Pending" && item.student_id));
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/resources/top`);
        setTopResources(res.data.topResources);
        setTopWellness(res.data.topWellness);
      } catch (err) {
        console.error("Error fetching top resources/wellness:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
      <div 
        className="w-full h-full grid"
        style={{ gridTemplateColumns: '40% 60%'}}
      >
        <div 
          className="grid gap-4" 
          style={{ gridTemplateRows: '40% 35% 35%' }}
        >
          <UsageUtilization />
          <AlertsOvertime alerts={alerts} />
          <CompSchedules backlog={backlog} />
        </div>
        
        <div 
          className="grid gap-4" 
          style={{ gridTemplateRows: '30% 30% 50%' }}
        >
          <LowerRight filterBacklog={filterBacklog} />
          <CalmiTriggerAlert alerts={alerts} padding={true} />
          <div className="flex items-center justify-center p-5">
            <div className="w-full h-full border-4 border-[#41b8d5] rounded-xl flex flex-col gap-20  overflow-y-auto">
              <div>
                <div className="flex w-full flex-row justify-between p-4">
                  <p className="font-roboto font-bold text-[#1e3a8a] text-2xl">Resource Library</p>
                  <FileDownload sx={{
                    fontSize: 25,
                    justifyItems: 'center',
                    color: '#64748b',
                  }}/>
                </div>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow className="border-t-2 border-b-2 border-[#636363] h-8">
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
                      {topResources.map((row, index) => (
                        <TableRow key={index} className="h-4">
                          <TableCell className="py-0 px-2 text-sm w-[65%]">
                            <p className="leading-none">{row.title}</p>
                          </TableCell>
                          <TableCell className="py-0 px-2 text-sm w-[25%] text-center">
                            <p className="text-center">{row.category}</p>
                          </TableCell>
                          <TableCell className="py-0 px-2 text-sm w-[10%] text-center">
                            <p className="text-center">{row.views}</p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
                
              <div>
                <div className="flex w-full flex-row justify-between p-4">
                  <p className="font-roboto font-bold text-[#1e3a8a] text-2xl">Wellness Tools</p>
                  <FileDownload sx={{
                    fontSize: 25,
                    justifyItems: 'center',
                    color: '#64748b',
                  }}/>
                </div>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow className="border-t-2 border-b-2 border-[#636363] h-8">
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
                      {topWellness.map((row, index) => (
                        <TableRow key={index} className="h-4">
                          <TableCell className="py-0 px-2 text-sm w-[75%]">
                            <p className="leading-none">{row.title}</p>
                          </TableCell>
                          <TableCell className="py-0 px-2 text-sm w-[15%] text-center">
                            <p className="text-center">{row.category}</p>
                          </TableCell>
                          <TableCell className="py-0 px-2 text-sm w-[10%] text-center">
                            <p className="text-center">{row.views}</p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}