import { useContext, useState, useEffect } from 'react';
import Layout from "../components/Layout";
import { OpenContext } from '../contexts/OpenContext';
import StaffDashboard from '../components/dashboardComponents/GuidanceStaffDashboard';
import { Edit, Close } from '@mui/icons-material';
import axios from 'axios';
import { API, RootAPI } from '../api';
import { Dialog, DialogTitle, DialogActions, DialogContent, IconButton, Button, TextField, Tabs, Tab, Badge, Box, Typography, Select, MenuItem } from '@mui/material';
import RichTextEditor from '../components/contentManagementComponents/contentDialogComponents';
import Calendar from '../components/dashboardComponents/adviserDashboardComponents/AdviserCalendar';
import { format } from "date-fns";

/**
 * ===========================================
 * Screen: Dashboard/Home
 * Author: Ronald M. Villarde
 * Created: 2025-02-20
 * Last Updated: 2025-04-28
 * 
 * Description:
 * - This allow users to quickly analyize the analysis of datas from students for guidance management
 * - This is the landing page after loging in
 * 
 * Purpose:
 * - The purpose of this is to quickly give a summarize or graphical of any analysis for management of students for guidance use
 * 
 * Navigation:
 * - Schedule Management System
 * - Content Management System
 * - User Management System
 * 
 * State Variables:
 * - open (bool): Track whether the drawer is open or close
 * 
 * Functions:
 * - handleDrawerToggle: toggle or inverts the current open state
 * 
 * API Calls:
 * - [Endpoint] - [Purpose of the API call]
 * 
 * Error Handling:
 * - [How errors are handled, especially if fetching or submitting data]
 * 
 * Notes:
 * - [Anything extra devs or reviewers should know about this screen]
 * ===========================================
 */

const ScheduledCard = ({ student_name, sched_date }) => {
  const dateObj = new Date(sched_date);

  const weekday = format(dateObj, "EEE"); // Mon, Tue, Wed
  const shortDate = format(dateObj, "MM/dd"); // 09/10
  const fullFormat = format(dateObj, "hh:mm a 'of' MMM dd, yyyy"); 
  // 👉 e.g. 02:30 PM of Sep 10, 2025

  return (
    <div className="flex flex-row w-full gap-4 mb-4">
      {/* Date box */}
      <div className="bg-transparent w-[10%] flex flex-col items-center justify-center text-center text-black font-bold text-lg p-2">
        <span>{weekday.toUpperCase()}</span>
        <span>{shortDate}</span>
      </div>

      {/* Notification content */}
      <div className="bg-[#b7cde3] w-[90%] p-3 flex flex-col justify-center rounded-xl">
        <h1 className="font-bold font-roboto text-lg mb-1">
          Student is Scheduled for an Appointment
        </h1>
        <p className="text-sm font-roboto">
          Your student, {student_name}, is scheduled for an appointment with the
          guidance office at {fullFormat}.
        </p>
      </div>
    </div>
  );
};

const RequestCard = ({ student_name, sched_date }) => {
  const dateObj = sched_date ? new Date(sched_date) : null;

  const weekday = dateObj ? format(dateObj, "EEE").toUpperCase() : "—";
  const shortDate = dateObj ? format(dateObj, "MM/dd") : "—";
  const fullFormat = dateObj
    ? format(dateObj, "hh:mm a 'of' MMM dd, yyyy")
    : null;

  return (
    <div className="flex flex-row w-full gap-4 mb-4">
      {/* Date box */}
      <div className="bg-transparent w-[10%] flex flex-col items-center justify-center text-center text-black font-bold text-lg p-2">
        <span>{weekday}</span>
        <span>{shortDate}</span>
      </div>

      {/* Notification content */}
      <div className="bg-[#b7cde3] w-[90%] p-3 flex flex-col justify-center rounded-xl">
        {!sched_date ? (
          <>
            <h1 className="font-bold font-roboto text-lg mb-1">
              Guidance Appointment Request Received
            </h1>
            <p className="text-sm font-roboto">
              A request for an appointment with the Guidance Office for{" "}
              <span className="font-semibold">{student_name}</span> has been received.
              Please wait for confirmation of the schedule.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-bold font-roboto text-lg mb-1">
              Guidance Appointment Scheduled
            </h1>
            <p className="text-sm font-roboto">
              An appointment for{" "}
              <span className="font-semibold">{student_name}</span> with the Guidance Office
              is scheduled at{" "}
              <span className="font-semibold">{fullFormat}</span>.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default function Landingpage() {
  const { open, setOpen } = useContext(OpenContext);
  const handleDrawerToggle = () => {
    setOpen(prev => !prev);
  };
  const [backlogs, setBacklogs] = useState([]);
  const [openProposal, setOpenProposal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('')
  const [editorData, setEditorData] = useState(null);
  const [proposedSchedule, setProposedSchedule] = useState('');
  const [proposalId, setProposalId] = useState(0);
  const [studentRequests, setStudentRequests] = useState([]);
  const [staffRequests, setStaffRequests] = useState([]);

  const [tab, setTab] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const staff = JSON.parse(localStorage.getItem("staff"));
  
  useEffect(() => {
    const fetchBacklogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API}/backlogs`);
        setBacklogs(response.data); 
      } catch (error) {
        console.error("Error fetching backlogs:", error.response?.data || error.message);
      }
    };
    fetchBacklogs();
    setLoading(false);
  }, [openProposal]);

  const filterBacklogs = backlogs.filter((item) => (item.status === "Pending" && item.proposal));

  const formatScheduleDate = (rawDate) => {
    const date = new Date(rawDate);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Mon"
    const formattedDate = date.toLocaleDateString('en-US'); // e.g., "5/22/2025"
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // 24-hour format
    }); // e.g., "14:30"

    return `${weekday}, ${formattedDate} at ${formattedTime}`;
  };
  
  const handleViewingRequest  = async (item) => {
    try {
      console.log(`${RootAPI}/${item.proposal}`);
      const response = await axios.get(`${RootAPI}/public/${item.proposal}`, {
        responseType: 'text',
      });
      setEditorData(response.data);
      setProposalId(item.id);
      console.log(item.id);
      setOpenProposal(true);
      setProposedSchedule(formatScheduleDate(item.sched_date));
    } catch (error) {
      console.error("Error loading file:", error);
    }
  }

  const handleDenial = async () => { 
    setLoading(true);
    try {
      await axios.patch(`${API}/backlogs/update-status/${proposalId}`, {
        status: "Denied",
        comment: newMessage
      });
      handleDialogClose();
      setLoading(false);
    } catch (error) {
      console.error(error.response?.data || error.message);
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    setLoading(true);
    try {
      await axios.patch(`${API}/backlogs/update-status/${proposalId}`, {
        status: "Approved",
        comment: newMessage
      });
      handleDialogClose();
      setLoading(false);
    } catch (error) {
      console.error(error.response?.data || error.message);
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setOpenProposal(false);
    setNewMessage('');
    setEditorData(null);
    setProposedSchedule('');
    setProposalId(0);
  };

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

  const totalPages = Math.ceil((tab === 0 ? studentRequests.length : staffRequests) / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedRequests = tab === 0
    ? studentRequests.slice(startIndex, startIndex + rowsPerPage)
    : staffRequests.slice(startIndex, startIndex + rowsPerPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(e.target.value);
    setPage(1); // reset to page 1 when rows per page changes
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="flex bg-[#f8fafc] flex-1 overflow-hidden">
      {/* The Top and Left Bar */}
      <Layout open={open} onMenuClick={handleDrawerToggle} />

      {/* Main Content */}
      <main
        className={`flex-1 bg-[#f8fafc] transition-all ${
          open ? "ml-60" : "ml-16"
        } mt-16`}
        style={{ height: "calc(100vh - 64px)"}}
      >
        <div 
          className="flex flex-col flex-grow gap-[clamp(0.75rem,1.5vw,2rem)] px-[clamp(1rem,2vw,4rem)] pt-4"
          style={{ height: "100%"}}
        >
        {/* For Adviser: Full-space Image */}
        {staff.position === "Adviser" && (
          <div 
            className="w-full px-2 pt-4 flex flex-row gap-10"
            style={{height: '100%'}}
          >
            {/* Left panel */}
            <div className="bg-[#b7cde3] w-[75%] px-4 pt-4 h-full overflow-y-auto">
              <h1 className="text-center font-norwester text-5xl mb-5">Notifications</h1>
              <div className="bg-[#f8fafc] w-full max-h-[92.3%] px-4 pb-4 pt-6">
                <Tabs
                  value={tab}
                  onChange={(e, newValue) => setTab(newValue)}
                  TabIndicatorProps={{ style: { display: "none" } }}
                  sx={{
                    height: "100%",
                    "& .MuiTabs-scroller": {
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                    },
                    "& .MuiTabs-flexContainer": {
                      height: "100%",
                      alignItems: "center",
                    },
                    "& .MuiTab-root": {
                      justifyContent: "center",
                      padding: "4px 16px",
                      fontSize: "clamp(0.7rem, 1.05vw, 1.225rem)",
                      textTransform: "none",
                      fontFamily: "norwester",
                      borderRadius: "9999px",
                      color: "#000",
                      transition: "all 0.2s ease-in-out",
                      minHeight: "unset",
                      minWidth: "80px",
                      position: "relative",
                    
                      // Hover
                      "&:hover": {
                        color: "#1E3A8A",
                      },
                    
                      // Selected
                      "&.Mui-selected": {
                        backgroundColor: "transparent",
                        color: "#1E3A8A",
                        "&:hover": {
                          backgroundColor: "transparent",
                          color: "#1E3A8A",
                        },
                      },
                    },
                  }}
                >
                  {/* STUDENT Tab */}
                  <Tab
                    key={0}
                    label={
                      <Box display="flex" alignItems="center" gap={2}>
                        STUDENT
                        <Badge
                          badgeContent={studentRequests.length}
                          sx={{
                            "& .MuiBadge-badge": {
                              backgroundColor: "#ed4040",
                              color: "#fff",
                              fontSize: "0.7rem",
                              minWidth: "20px",
                              height: "20px",
                              borderRadius: "9999px",
                            },
                          }}
                        />
                      </Box>
                    }
                  />

                  {/* Divider */}
                  <Typography
                    component="span"
                    sx={{ mx: 2, color: "#999", fontWeight: "bold", userSelect: "none", fontSize: "1.5rem" }}
                  >
                    |
                  </Typography>
                  
                  {/* REQUEST Tab */}
                  <Tab
                    key={1}
                    label={
                      <Box display="flex" alignItems="center" gap={2}>
                        REQUEST
                        <Badge
                          badgeContent={staffRequests.length}
                          sx={{
                            "& .MuiBadge-badge": {
                              backgroundColor: "#ed4040",
                              color: "#fff",
                              fontSize: "0.7rem",
                              minWidth: "20px",
                              height: "20px",
                              borderRadius: "9999px",
                            },
                          }}
                        />
                      </Box>
                    }
                  />
                </Tabs>
                {tab === 0 ? (
                  paginatedRequests.length > 0 ? (
                  studentRequests.map((req) => (
                    <ScheduledCard
                      key={req.id}
                      student_name={req.student_name || req.name}
                      sched_date={req.sched_date}
                    />
                  ))
                ) : (
                  <p className='text-center'>No scheduled requests.</p>
                )
                ) : (
                  staffRequests.length > 0 ? (
                    staffRequests.map((req) => (
                      <RequestCard
                        key={req.id}
                        student_name={`${req.firstName} ${req.lastName}`}
                        sched_date={req.sched_date}
                        status={req.status}
                      />
                    ))
                  ) : (
                    <p className='text-center'>No requests found</p>
                  )
                )}

                {/* Show pagination only if requests > 5 */}
                {(tab === 0 ? studentRequests.length > 5 : staffRequests.length > 5) && (
                  <div className="flex items-center justify-end p-2">
                    <span className="pr-5">Show: </span>
                    <Select
                      value={rowsPerPage}
                      onChange={handleRowsPerPageChange}
                      size="small"
                    >
                      {[5, 10, 15, 20, 25, 30].map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </Select>
                    
                    <div className="flex justify-center items-center p-2">
                      <Button onClick={handlePreviousPage} disabled={page === 1}>
                        <p
                          className={`${
                            page === 1 ? "text-gray-500" : "text-black"
                          } text-2xl font-extrabold`}
                        >
                          {"<"}
                        </p>
                      </Button>
                      <span className="mx-2">
                        Page {page} of {totalPages}
                      </span>
                      <Button onClick={handleNextPage} disabled={page === totalPages}>
                        <p
                          className={`${
                            page === totalPages ? "text-gray-500" : "text-black"
                          } text-2xl font-extrabold`}
                        >
                          {">"}
                        </p>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right panel */}
            <div className="flex flex-col gap-10 w-[25%] h-full overflow-y-auto pb-10">
              <Calendar
                studentRequests={studentRequests}
                staffRequests={staffRequests}
              />
              <div className='border-8 border-[#da2f47] h-[35%] rounded-2xl p-4 overflow-auto'>
                <h1 className='text-4xl text-[#317873] font-bold mb-4'>Your student is in need of guidance office services?</h1>
                <p className='text-xl text-black font-semibold mb-8'>Request an appointment now!</p>
                <button
                  className='bg-[#ff9059] py-2 px-6 text-white rounded-3xl font-bold text-lg'
                >
                  Request
                </button>
              </div>
            </div>
          </div>
        )}

        {staff.position !== "Adviser" && (
        /* Admin and Guidance Staffs */
          <div 
            className="bg-[#64748b] w-full px-4 pt-4 flex flex-col"
            style={{height: '100%'}}
          >
            <div 
              className="bg-[#f8fbfd] p-4 h-full overflow-y-auto"
            >
              <StaffDashboard />
              {staff.position === "Admin" && (
              <div className="w-full h-2/5 p-3">
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
            )}
            </div>
          </div>
        )}
          <Dialog
            open={openProposal}
            onClose={() => {handleDialogClose();}}
            maxWidth="md"
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
            <DialogTitle className="bg-[#b7e3cc] relative">
              Pending Event Proposal
              <DialogActions className="absolute -top-1 right-0">
                <IconButton onClick={() => {handleDialogClose()}} className="rounded-full">
                  <Close sx={{ fontSize: 40, color: "black" }} />
                </IconButton>
              </DialogActions>
            </DialogTitle>

            <DialogContent>
              <p className="mt-3 font-roboto font-bold">Proposed Schedule: {proposedSchedule}</p>
              <RichTextEditor editorData={editorData} readOnly={true}/>
              <p className="mt-3 font-roboto font-bold">Comment</p>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    padding: 0, 
                    "& fieldset": {
                      borderRadius: "20px", 
                    },
                  },
                  "& textarea": {
                    color: "#000",
                    backgroundColor: "#e8e9eb", 
                    borderRadius: "20px", 
                    padding: "16px", 
                  },
                }}
              />
            </DialogContent>
            <DialogActions>
              <button onClick={() => {handleDialogClose();}}>
                <p className="text-base font-roboto font-bold text-[#64748b] p-2 px-6">BACK</p>
              </button>
              <Button 
                sx={{
                  paddingX: "3rem",
                  bgcolor:  "#e85d5d",
                  color: "white",
                  borderRadius: "100px",
                  marginRight: "1rem",
                }}
                onClick={handleDenial}
                disabled={loading}
              >
                {loading ? "Sending Back..." : "Decline"}
              </Button>
              <Button 
                sx={{
                  paddingX: "3rem",
                  bgcolor:  "#60a5fa",
                  color: "white",
                  borderRadius: "100px",
                  marginRight: "1rem",
                }}
                onClick={handleApproval}
                disabled={loading}
              >
                {loading ? "Sending Back..." : "Approve"}
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
