import { useState, useEffect } from "react";
import { FileDownload } from '@mui/icons-material';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import axios from 'axios';
import { API } from '../../api';
import { UsageUtilization, CompSchedules, LowerRight } from "./guidanceStaffDashboardComponent/Graphs";

export default function StaffDashboard() {
  const [backlog, setBacklogs] = useState([]);

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

  return (
      <div 
        className="w-full h-full grid"  // 👈 ensures grid has a real height
        style={{ gridTemplateColumns: '40% 60%', gridTemplateRows: '60% 40%' }}
      >
        
        <UsageUtilization />

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
                    <TableRow className="h-4">
                      <TableCell className="py-0 px-2 text-sm w-[75%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none">4-7-8 Breathing Technique</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[15%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">Breathing</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[10%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">50</p>
                      </TableCell>
                    </TableRow>
                    <TableRow className="h-4">
                      <TableCell className="py-0 px-2 text-sm w-[75%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none">Box Breathing Method</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[15%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">Breathing</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[10%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">112</p>
                      </TableCell>
                    </TableRow>
                    <TableRow className="h-4">
                      <TableCell className="py-0 px-2 text-sm w-[75%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none">Exam Stress Meditation</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[15%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">Meditation</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[10%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">35</p>
                      </TableCell>
                    </TableRow>
                    <TableRow className="h-4">
                      <TableCell className="py-0 px-2 text-sm w-[75%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none">Sleep Meditation</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[15%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">Meditation</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[10%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">138</p>
                      </TableCell>
                    </TableRow>
                    <TableRow className="h-4">
                      <TableCell className="py-0 px-2 text-sm w-[75%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none">Nature Sounds Meditation</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[15%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">Meditation</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[10%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">85</p>
                      </TableCell>
                    </TableRow>
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
                    <TableRow className="h-4">
                      <TableCell className="py-0 px-2 text-sm w-[75%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none">Dealing with Bullying</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[15%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">Social</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[10%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">50</p>
                      </TableCell>
                    </TableRow>
                    <TableRow className="h-4">
                      <TableCell className="py-0 px-2 text-sm w-[75%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none">Smart Budgeting for Students</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[15%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">Financial</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[10%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">112</p>
                      </TableCell>
                    </TableRow>
                    <TableRow className="h-4">
                      <TableCell className="py-0 px-2 text-sm w-[75%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none">Stretching and Desk Exercises</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[15%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">Physical</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[10%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">35</p>
                      </TableCell>
                    </TableRow>
                    <TableRow className="h-4">
                      <TableCell className="py-0 px-2 text-sm w-[75%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none">Finding Meaning and Purpose</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[15%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">Spiritual</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[10%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">138</p>
                      </TableCell>
                    </TableRow>
                    <TableRow className="h-4">
                      <TableCell className="py-0 px-2 text-sm w-[75%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none">Decluttering for Mental Clarity</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[15%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">Environmental</p>
                      </TableCell>
                      <TableCell className="py-0 px-2 text-sm w-[10%]" sx={{paddingY: '4px', border: 'none'}}>
                        <p className="leading-none text-center">85</p>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        </div>
        
        <CompSchedules />
        <LowerRight 
          filterBacklog={filterBacklog}
        />
      </div>
    )
}