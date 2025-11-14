import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { API } from '../../../api';
import { ActiveStudentsPieChart, CompSchedules } from '../guidanceStaffDashboardComponent/Graphs';
import AdviserCalendar from './AdviserCalendar';
import { Dialog, DialogTitle, DialogActions, DialogContent, IconButton, Button, Autocomplete, TextField } from '@mui/material';
import { Close, FilterAlt } from '@mui/icons-material';

export default function AdviserFullDashboard({ backlogs }) {
  const [students, setStudents] = useState([]);
  const [filteredBacklogs, setFilteredBacklogs] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [openRequest, setOpenRequest] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [viewId, setViewId] = useState(0);
  const [selectedBacklog, setSelectedBacklog] = useState([]);
  const staff = JSON.parse(localStorage.getItem("staff"));

  const [filteringDateType, setFilteringDateType] = useState('today');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDateOpen, setFilterDateOpen] = useState(false);
  const [sendFilterDate, setSendFilterDate] = useState('today');

  const handleApplyFilters = () => {
    setSendFilterDate(filteringDateType);
    setFilterOpen(false);
  };

  // Fetch students data for the logged-in staff (Adviser)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${API}/students`);
        // Filter students based on the staff's name (staff.adviser === student.adviser)
        const filteredStudents = response.data.filter(student => student.adviser === staff.name);
        setStudents(filteredStudents);
      } catch (error) {
        console.error("Error fetching students data:", error);
      }
    };

    fetchStudents();
  }, [staff.name]);

  // Filter backlogs related to the students of the staff
  useEffect(() => {
    if (students.length > 0) {
      const studentIds = students.map(student => student.id); // Get all student IDs related to the staff
      // Filter backlogs related to the students (either with student_id matching)
      const filteredBacklogs = backlogs.filter(backlog => 
        studentIds.includes(backlog.student_id) // Match the student_id
      );
      setFilteredBacklogs(filteredBacklogs);
    }
  }, [students, backlogs]);

  // Handle the message input change
  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  // Handle student selection
  const handleStudentChange = (event) => {
    setSelectedStudent(event.target.value);
  };

  // Handle send request (for now just logging the data)
  const handleSendRequest = async () => {
    setLoading(true);

    // Get student ID based on selected name (from the students list)
    const student = students.find((student) =>
      `${student.firstName} ${student.lastName}` === selectedStudent
    );

    if (!student) {
      setLoading(false);
      alert("Please select a valid student.");
      return;
    }

    // Create the backlog object
    const backlogData = {
      student_id: student.id,
      staff_id: staff.id,
      message: message,
      StaffRequest: 1,
      status: 'Pending',
    };

    try {
      // Send request to create backlog
      await axios.post(`${API}/backlogs`, backlogData);
      setLoading(false);
      handleCloseRequest(); // Close the modal after sending the request
    } catch (error) {
      console.error("Error sending request:", error);
      setLoading(false);
    }
  };


  const handleCloseRequest = () => {
    setOpenRequest(false);
    setSelectedStudent('');
    setMessage('');
  }


  useEffect(() => {
    if (viewId !== 0) {
      const selectedBacklog = filteredBacklogs.find(backlog => backlog.id === viewId);
      setSelectedBacklog(selectedBacklog);  // Set selected backlog details
    }
  }, [viewId, filteredBacklogs]);

  return (
    <div 
      className="w-full px-2"
      style={{ height: '100%' }}
    >
      <div 
        className="grid grid-cols-3 gap-4"  // Using grid layout
        style={{ gridTemplateColumns: "45% 55%" }}  // Set the width for the two main columns
      >
        {/* First Column (40% width) */}
        <div className="w-full h-full flex flex-col gap-4 p-5 relative">
          {filterOpen && (
            <div className="absolute top-5 right-2 z-50 bg-white border-[1px] border-[#1e3a8a] rounded-md shadow-lg text-[#1e3a8a] w-60 pt-2">
              <p className="font-bold p-2">Filter Date</p>
              <div 
                className="relative -mt-2"
                onClick={() => {
                  setFilterDateOpen(!filterDateOpen); 
                }}
              >
                {filterDateOpen && (
                  <div className="bg-white text-[#1e3a8a] border-[1px] border-[#1e3a8a] rounded-md shadow-lg absolute top-8 right-2 w-36 z-50">
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
            className="absolute w-fit h-fit bg-white rounded-full z-50 border-2 border-[#1e3a8a] top-0 right-2 flex flex-row items-center justify-center py-1 px-3 gap-2 text-[#1e3a8a] cursor-pointer"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <p className="italic">Filter Options</p>
            <FilterAlt />
          </div>
          <div className="grid grid-rows-2 gap-4">  {/* Divide the left side into 2 rows */}
              <CompSchedules backlog={filteredBacklogs} isAdviser={true} filteringDateType={sendFilterDate} />
              <ActiveStudentsPieChart width={100} padding={5} marginTop={false} filteringDateType={sendFilterDate} />
          </div>
        </div>

        {/* Second Column (60% width) */}
        <div className="w-full h-full flex flex-col gap-4 p-5">
          {/* This column is divided into 3 equal parts */}
          <div className="h-[50%]">
            {/* You can add more content here */}
            <AdviserCalendar />
          </div>
          <div className="h-fit">
            {/* You can add more content here */}
            <div className='border-8 border-[#da2f47] h-full rounded-2xl py-4 px-8'>
                <h1 className='text-3xl text-[#317873] font-bold'>Your student is in need of guidance office services?</h1>
                <p className='text-2xl text-black font-semibold mb-2'>Request an appointment now!</p>
                <button
                  className='bg-[#ff9059] py-2 px-6 text-white rounded-3xl font-bold text-lg'
                  onClick={() => {setOpenRequest(true);}}
                >
                  Request
                </button>
              </div>
              <Dialog
                open={openRequest}
                onClose={() => {handleCloseRequest();}}
                maxWidth="xs"
                fullWidth
                sx={{
                  "& .MuiPaper-root": {
                    backgroundColor: "white",
                    color: "#000",
                    borderRadius: "25px",
                    overflowX: "hidden",
                  },
                }}
              >
                <DialogTitle className="bg-[#ff9059] relative">
                  Schedule Request
                  <DialogActions className="absolute -top-1 right-0">
                    <IconButton onClick={() => {handleCloseRequest()}} className="rounded-full">
                      <Close sx={{ fontSize: 40, color: "black" }} />
                    </IconButton>
                  </DialogActions>
                </DialogTitle>
                  
                <DialogContent>
                  <p className="font-bold mt-3 text-lg">Student Name</p>
                  <Autocomplete
                    freeSolo
                    options={students.map((student) => `${student.firstName} ${student.lastName}`)}
                    value={selectedStudent}
                    onChange={(event, newValue) => {
                      // Trigger the same logic as your original handleStudentChange
                      handleStudentChange({ target: { value: newValue || '' } });
                    }}
                    onInputChange={(event, newInputValue) => {
                      // Handle typing in the input
                      handleStudentChange({ target: { value: newInputValue } });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Enter student name"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "0.5rem",
                            "& fieldset": {
                              borderRadius: "0.5rem",
                            },
                          },
                        }}
                      />
                    )}
                    sx={{
                      width: "100%",
                      "& .MuiAutocomplete-listbox": {
                        maxHeight: "200px",
                        backgroundColor: "white",
                        "& .MuiAutocomplete-option": {
                          '&:hover': {
                            backgroundColor: "#f3f4f6",
                          },
                          '&[aria-selected="true"]': {
                            backgroundColor: "#e5e7eb",
                          },
                        },
                      },
                    }}
                  />
                  <p className="font-bold mt-3 text-lg">Message</p>
                  <textarea
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="Enter a message"
                    className="w-full p-2 border rounded-lg h-32 resize-none"
                  />
                </DialogContent>

                <DialogActions>
                  <button onClick={() => {handleCloseRequest();}}>
                    <p className="text-base font-roboto font-bold text-[#64748b] p-2 px-6">BACK</p>
                  </button>
                  <Button 
                    sx={{
                      paddingX: "3rem",
                      bgcolor:  "#ff9059",
                      color: "white",
                      borderRadius: "100px",
                      marginRight: "1rem",
                    }}
                    onClick={handleSendRequest}
                    disabled={loading}
                  >
                    {loading ? "Sending Request" : "Send Requests"}
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          <div className="h-[25%]">
            <p className='text-[#f57c00] text-2xl font-bold mb-3'>Student Scheduled Appointments</p>
            <div className='w-full h-[75%] border-4 border-[#f57c00] rounded-lg mb-4 overflow-y-auto p-4'>
              {filteredBacklogs.length > 0 ? (
              filteredBacklogs.map((item, index) => (
                <div
                  key={index}
                  className="w-full flex flex-row items-center justify-between border-b-2 border-[#94a3b8]"
                >
                  <p className="font-roboto text-lg whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.name}
                  </p>
                  <button 
                    className='bg-[#1e3a8a] py-0.5 px-3 rounded-lg m-0.5 text-white'
                    onClick={() => {setOpenView(true); setViewId(item.id)}}
                  >
                    VIEW
                  </button>
                </div>
              ))) : (
                <div className='flex items-center justify-center h-full'>
                  <p className='text-center'>No students scheduled in guidance office to consult</p>
                </div>
              )}
              <Dialog
                open={openView}
                onClose={() => {setOpenView(false); setViewId(0)}}
                maxWidth="xs"
                fullWidth
                sx={{
                  "& .MuiPaper-root": {
                    backgroundColor: "white",
                    color: "#000",
                    borderRadius: "25px",
                    overflowX: "hidden",
                  },
                }}
              >
                <DialogTitle className="bg-[#ff9059] relative">
                  Schedule Details
                  <DialogActions className="absolute -top-1 right-0">
                    <IconButton onClick={() => {setOpenView(false); setViewId(0)}} className="rounded-full">
                      <Close sx={{ fontSize: 40, color: "black" }} />
                    </IconButton>
                  </DialogActions>
                </DialogTitle>
                  
                <DialogContent className='mt-4'>
                  <p className='text-center'><strong>Name:</strong> {selectedBacklog.name}</p>
                  <p className='text-center'><strong>Message:</strong> {selectedBacklog.message}</p>
                  <p className='text-center'><strong>Scheduled:</strong> {selectedBacklog.sched_date}</p>
                </DialogContent>

                <DialogActions>
                  <button onClick={() => {setOpenView(false); setViewId(0)}}>
                    <p className="text-base font-roboto font-bold text-[#64748b] p-2 px-6">BACK</p>
                  </button>
                </DialogActions>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
