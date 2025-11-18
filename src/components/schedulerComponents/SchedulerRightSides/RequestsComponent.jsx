import React, { useState } from "react";
import { Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton } from "@mui/material";
import { Close } from '@mui/icons-material';
import { addHours } from "date-fns";
import { API } from "../../../api";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";

/**
 * ===========================================
 * Component: Request
 * Author: Ronald M. Villarde
 * Created: 2025-03-01
 * Last Updated: 2025-04-30
 * 
 * Description:
 * - Card of request from students that the admin will able to schedule upon pressing schedule
 * 
 * Purpose:
 * - To show and to schedule the unscheduled request of meeting from students based on status
 * 
 * Props:
 * - initial (array): Is the data from screen that fetches data from database via backend API
 * 
 * State Variables:
 * - openScheduleModal (bool): Tracks the scheduling modal that scheduled unscheduled request
 * - selectedRequest ({ id: number, title: string, name: string, message: string, status: string, sched_date?: string|null } | null): Represents a single request row to be scheduled
 * - newSchedDate (date): the selected date from the scheduling of unscheduling request
 * 
 * Functions:
 * - handleConfirmSchedule: updates the selected unscheduled request
 * 
 * API Calls:
 * - None - initial is props that uses a backend API to fetch data from database via backend
 * 
 * Error Handling:
 * - logs whether the submissions fails and if any error occur is logged.
 * 
 * Notes:
 * - [Any important notes for future developers or groupmates]
 * ===========================================
 */
export default function Requests({ initial, updateBacklogs }) {
  // State for schedule modal
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);

  const clampDate = (date) => {
    const now = new Date();
    const selected = new Date(date);

    const sevenAM = new Date(selected);
    sevenAM.setHours(7, 0, 0, 0);

    const sixPM = new Date(selected);
    sixPM.setHours(18, 0, 0, 0);

    const isToday = now.toDateString() === selected.toDateString();

    if (isToday) {
      const minTime = now > sevenAM ? now : sevenAM;
      if (selected < minTime) return minTime;
      if (selected > sixPM) return sixPM;
      return selected;
    } else {
      if (selected < sevenAM) return sevenAM;
      if (selected > sixPM) return sixPM;
      return selected;
    }
  };

  const [newSchedDate, setNewSchedDate] = useState(clampDate(new Date()));

  const isValidTime = (date) => {
    const now = new Date();
    const selected = new Date(date);

    const sevenAM = new Date(selected);
    sevenAM.setHours(7, 0, 0, 0);

    const sixPM = new Date(selected);
    sixPM.setHours(18, 0, 0, 0);

    const isToday = now.toDateString() === selected.toDateString();

    if (isToday) {
      const minTime = now > sevenAM ? now : sevenAM;
      return selected >= minTime && selected <= sixPM;
    } else {
      return selected >= sevenAM && selected <= sixPM;
    }
  };

  const handleDateChange = (newValue) => {
    if (!newValue) return;

    if (isValidTime(newValue)) {
      setNewSchedDate(newValue);
    } else {
      // Optionally, ignore invalid change or reset to last valid value
      // For example: Do nothing or force clamp
      setNewSchedDate(clampDate(newValue));
    }
  };

  // Handler when "Schedule" is clicked on a pending request
  const handleScheduleClick = (request) => {
    setSelectedRequest(request);
    setNewSchedDate(null);
    setOpenScheduleModal(true);
  };

  // Handler for confirming schedule update
  const handleConfirmSchedule = async () => {
    if (!newSchedDate || !selectedRequest) return;
    setLoading(true);
    const staff = JSON.parse(localStorage.getItem("staff"));

    // Build payload for scheduling update
    const UTC8 = addHours(newSchedDate, 8);
    const requestName = selectedRequest.name;
    const requestID = selectedRequest.student_id;
    const payload = {
      sched_date: new Date(UTC8).toISOString().slice(0, 19).replace('T', ' '), // ← converts to "YYYY-MM-DD HH:mm:ss"
      status: "Scheduled",
      action: "Schedule",
      name: requestName,
      student_id: requestID,
      message: selectedRequest.message,
      staff_position : staff.position,
      staff_name : staff.name,
      from_pending: true,
    };
    
    try {
      const response = await axios.put(`${API}/backlogs/${selectedRequest.id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Schedule updated successfully:", response.data);
      setOpenScheduleModal(false);
      updateBacklogs();
      setLoading(false);
    } catch (error) {
      console.error("Error scheduling request:", error.response?.data || error.message);
    }
  };

  const getInitialDateTime = () => {
    const now = new Date();
    const sevenAM = new Date();
    sevenAM.setHours(7, 0, 0, 0); // Set 7:00 AM today

    if (now.getHours() >= 18) {
      // If it's already past 6 PM, set the initial date to tomorrow at 7 AM
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(7, 0, 0, 0);
      return tomorrow;
    } else if (now.getHours() >= 7) {
      // If it's between 7 AM and 6 PM, set the initial date to now
      return now;
    } else {
      // If it's before 7 AM, set the initial date to 7 AM today
      return sevenAM;
    }
  };

  const initialSchedDate = getInitialDateTime();

  return (
    <div className="min-w-[100%] max-w-[100%]">
      <div className="max-w-max mx-auto">
        <Tabs
          value={0}
          className="database-tabs min-w-max"
        >
          <Tab label="Request" className="database-tab" />
        </Tabs>
      </div>
  
      <div className="px-2 py-6 min-w-[90%] max-w-max mx-auto overflow-y-auto flex flex-col gap-6 h-[clamp(10rem,35vh,25rem)] mb-10">
        {initial
          .filter(
            (item) =>
              item.status === "Pending" && item.student_id
          )
          .map((item, index) => (
            <div
              key={item.id || index}
              className="relative bg-[#ff9059] rounded-2xl py-1 pl-3"
            >
              <div className="bg-white rounded-2xl h-44 py-2 pl-5">
                <h1 className="text-3xl font-roboto font-bold">REQUEST MEETING</h1>
                <h1 className="text-2xl font-roboto font-bold italic">{item.name}</h1>
                <p className="text-lg line-clamp-3 overflow-hidden text-ellipsis">
                  {item.message}
                </p>
                <button
                  onClick={() => handleScheduleClick(item)}
                  className="rounded-3xl bg-[#10aa4f] px-5 py-1 absolute bottom-3 right-3"
                >
                  Schedule
                </button>
              </div>
            </div>
          ))}
      </div>
        
      {/* Modal for scheduling a request */}
      <Dialog
        open={openScheduleModal}
        onClose={() => setOpenScheduleModal(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "white", // Light blue for Restore, Light red for Delete
            color: "#000", // Text color
            borderRadius: "25px", // Optional: rounded corners
          },
        }}>
        <DialogTitle className="bg-[#ebc0ab] relative">
          Schedule Appointment Request
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={() => setOpenScheduleModal(false)} className="rounded-full ">
              <Close  sx={{fontSize: 40, color: 'black'}}></Close>
            </IconButton>
          </DialogActions>
        </DialogTitle>
        <DialogContent className="font-roboto">
            <p className="mt-3 font-roboto font-bold">Student Name</p>
            <TextField
              fullWidth
              value={selectedRequest ? selectedRequest.name : ""}
              disabled={true}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& input": {
                    color: "#000", // Ensure text is visible (black color for the input text)
                    bgcolor: "#e8e9eb",
                    borderRadius: "20px",
                  },
                  "& fieldset": {
                    borderRadius: "20px", // Border color
                  },
                  "&.Mui-disabled": {
                    "& input": {
                      color: "#000",
                      WebkitTextFillColor: "#000",
                    },
                  },
                },
              }}
            />
            <p className="mt-3 font-roboto font-bold">Message</p>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={selectedRequest ? selectedRequest.message : ""}
              disabled={true}
              sx={{
                "& .MuiOutlinedInput-root": {
                  padding: 0,
                  "& fieldset": {
                    borderRadius: "20px",
                  },
                  "&.Mui-disabled": {
                    "& textarea": {
                      color: "#000",
                      WebkitTextFillColor: "#000",
                    },
                  },
                },
                "& textarea": {
                  color: "#000",
                  backgroundColor: "#e8e9eb",
                  borderRadius: "20px",
                  padding: "16px",
                  WebkitTextFillColor: "#000",
                },
              }}
            />
            <p className="mt-3 font-roboto font-bold">Schedule Date & Time</p>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              value={newSchedDate || initialSchedDate}
              onChange={handleDateChange}
              shouldDisableDate={(date) => {
                const day = date.getDay();
                return day === 0 || day === 6; // Disable Sundays (0) & Saturdays (6)
              }}
              minDate={new Date()}
              minTime={(() => {
                const now = new Date();
                const selected = new Date(newSchedDate);
                // Create 7:00 AM on selected date
                const sevenAM = new Date(selected);
                sevenAM.setHours(7, 0, 0, 0);
                // Create "now" time but on the selected date
                const nowOnSelectedDate = new Date(selected);
                nowOnSelectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
                // Check if selected date is today
                const isToday = now.toDateString() === selected.toDateString();
                if (isToday) {
                  // If now is after 7 AM, minTime = now (on today's date)
                  return nowOnSelectedDate > sevenAM ? nowOnSelectedDate : sevenAM;
                } else {
                  // For future dates minTime is 7 AM of selected date
                  return sevenAM;
                }
              })()}  // Set minimum time to 7 AM
              maxTime={new Date(new Date().setHours(18, 0, 0, 0))} // Set maximum time to 6 PM
              sx={{
                width: '100%',
                '& .MuiTextField-root': {
                  width: '100%',
                },
                '& .MuiOutlinedInput-root': {
                  width: '100%',
                  backgroundColor: '#e8e9eb',
                  borderRadius: '20px',
                }
              }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenScheduleModal(false)}
            style={{ fontSize: "1rem", padding: "10px 20px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSchedule}
            style={{ fontSize: "1rem", padding: "10px 20px" }}
            disabled={!newSchedDate || loading}
          >
            {loading ? "Scheduling..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
