import { useContext, useState, useEffect } from 'react';
import Layout from "../components/Layout";
import { OpenContext } from '../contexts/OpenContext';
import StaffDashboard from '../components/dashboardComponents/GuidanceStaffDashboard';
import { Edit, Close } from '@mui/icons-material';
import axios from 'axios';
import { API, RootAPI } from '../api';
import { Dialog, DialogTitle, DialogActions, DialogContent, IconButton, Button, TextField } from '@mui/material';
import RichTextEditor from '../components/contentManagementComponents/contentDialogComponents';
import Calendar from '../components/dashboardComponents/adviserDashboardComponents/AdviserCalendar';
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
    setLoading(false);
    fetchBacklogs(); // run when reloadKey changes
  }, []);

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
      setOpenProposal(true);
      setProposedSchedule(formatScheduleDate(item.sched_date));
    } catch (error) {
      console.error("Error loading file:", error);
    }
  }

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
                <div className="flex flex-row w-full gap-4">
                  {/* Date box */}
                  <div className="bg-transparent w-[10%] flex flex-col items-center justify-center text-center text-black font-bold text-lg p-2">
                    <span>TUES</span>
                    <span>MM/DD</span>
                  </div>

                  {/* Notification content */}
                  <div className="bg-[#b7cde3] w-[90%] p-3 flex flex-col justify-center rounded-xl">
                    <h1 className="font-bold font-roboto text-lg mb-1">Guidance Appointment Request Received</h1>
                    <p className="text-sm font-roboto">
                      Your request for an appointment with the Guidance Office has been received. 
                      Please wait for confirmation of your schedule.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="flex flex-col gap-10 w-[25%] h-full overflow-y-auto pb-10">
              <Calendar />
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
                <div className="w-full h-[90%] border-4 border-[#bc3f8d] rounded-xl p-2 flex flex-col gap-3">
                  {filterBacklogs.map((item) => (
                    <div key={item.id} className="flex flex-row justify-between border-b-2 border-[#94a3b8]">
                      <p>
                        New event proposal title {item.name}
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
            onClose={() => {setOpenProposal(false);}}
            maxWidth="md"
            fullWidth
            sx={{
              "& .MuiPaper-root": {
                backgroundColor: "white",
                color: "#000",
                borderRadius: "25px",
              },
            }}
          >
            <DialogTitle className="bg-[#b7e3cc] relative">
              Pending Event Proposal
              <DialogActions className="absolute -top-1 right-0">
                <IconButton onClick={() => {setOpenProposal(false);}} className="rounded-full">
                  <Close sx={{ fontSize: 40, color: "black" }} />
                </IconButton>
              </DialogActions>
            </DialogTitle>

            <DialogContent>
              <p className="mt-3 font-roboto font-bold">Proposed Schedule: {proposedSchedule}</p>
              <RichTextEditor editorData={editorData} />
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
              <button onClick={() => {setOpenProposal(false);}}>
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
                // onClick={handleSave}
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
                // onClick={handleSave}
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
