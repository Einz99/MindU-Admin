import { useContext, useState, useEffect } from 'react';
import Layout from "../components/Layout";
import { OpenContext } from '../contexts/OpenContext';
import { Close } from '@mui/icons-material';
import axios from 'axios';
import { API, RootAPI } from '../api';
import { Dialog, DialogTitle, DialogActions, DialogContent, IconButton, Button, TextField } from '@mui/material';
import RichTextEditor from '../components/contentManagementComponents/contentDialogComponents';
import AdviserFullDashboard from '../components/dashboardComponents/adviserDashboardComponents/AdviserFullDashboard';
import AdminStaffDashboard from '../components/dashboardComponents/AdminStaffDashboard';
import StaffDashboard from '../components/dashboardComponents/GuidanceStaffDashboard';

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
  const [proposalId, setProposalId] = useState(0);

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

  const renderBasedOnRole = () => {
    if (staff.position === "Adviser") {
        return <AdviserFullDashboard backlogs={backlogs}/>;
    } else if (staff.position === "Guidance Advocate") {
      return <StaffDashboard />;
    } else if (staff.position === "Admin" || staff.position === "Guidance Counselor") {
      return (
        <>
          <AdminStaffDashboard filterBacklogs={filterBacklogs} handleViewingRequest={handleViewingRequest} />
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
        </>
      );
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
        } mt-20`}
        style={{ height: "calc(100vh - 64px)"}}
      >
        <div 
          className="flex flex-col flex-grow gap-[clamp(0.75rem,1.5vw,2rem)] px-[clamp(1rem,2vw,4rem)] pt-4"
          style={{ height: "100%"}}
        >
          <div 
            className="bg-[#64748b] w-full px-4 pt-4 flex flex-col"
            style={{height: '100%'}}
          >
            <div 
              className="bg-[#f8fbfd] p-4 h-full overflow-y-auto"
            >
              {renderBasedOnRole()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
