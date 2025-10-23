import { useState, useEffect } from "react";
import { FileDownload, Edit } from '@mui/icons-material';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import axios from 'axios';
import { API } from '../../api';
import { UsageUtilization, CompSchedules, PendingStudentRequests, ActiveStudentsPieChart } from "./guidanceStaffDashboardComponent/Graphs";

export default function AdminStaffDashboard({filterBacklogs, handleViewingRequest}) {
  const [backlog, setBacklogs] = useState([]);
  const [topResources, setTopResources] = useState([]);
  const [topWellness, setTopWellness] = useState([]);

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

    fetchData(); // initial fetch
    const interval = setInterval(fetchData, 10 * 60 * 1000); // repeat every 10 minutes

    return () => clearInterval(interval); // cleanup
  }, []);

  return (
      <div 
        className="w-full h-full grid"  // 👈 ensures grid has a real height
        style={{ gridTemplateColumns: '40% 60%', gridTemplateRows: '60% 40% 50%' }}
      > 
        <UsageUtilization />

        <div className="w-full p-3">
          <div className="flex w-full flex-row justify-between">
            <p className="font-roboto font-bold text-[#bc3f8d] text-2xl">Pending Events Proposal</p>
            <Edit sx={{
              fontSize: 25,
              justifyItems: 'center',
              color: '#64748b',
            }}/>
          </div>
          <div className="w-full h-[90%] border-4 border-[#bc3f8d] rounded-xl p-2 flex flex-col gap-3 overflow-y-auto">
            {filterBacklogs.map((item) => (
              <div key={item.id} className="flex flex-row justify-between border-b-2 border-[#94a3b8]">
                <p>
                  {item.name} Proposal
                </p>
                <button className="mr-5" onClick={() => handleViewingRequest(item)}><p className="bg-[#1e3a8a] text-white px-3 rounded-lg mb-0.5">View</p></button>
              </div>
            ))}
          </div>
        </div>
        
        <CompSchedules backlog={backlog} />
        <PendingStudentRequests filterBacklog={filterBacklog} padding={true}/>
        <ActiveStudentsPieChart width={100} padding={10} marginTop={false}/>

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
    )
}