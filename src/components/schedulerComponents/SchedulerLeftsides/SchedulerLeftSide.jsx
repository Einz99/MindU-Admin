import { useState } from "react";
import { addHours } from "date-fns";
import { API } from "../../../api";
import SchedulerTab from "./SchedulerTab";
import SchedulerTable from "./SchedulerTable";
import SchedulerActionModals from "./SchedulerActionModals";
import axios from "axios";
import { Dialog, DialogTitle, DialogActions, DialogContent, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

/**
 * ===========================================
 * Component: Left side of Scheduler
 * Author: Ronald M. Villarde
 * Created: 2025-03-01
 * Last Updated: 2025-05-04
 * 
 * Description:
 * - [Brief description of what the component does.]
 * - [If needed, mention any important libraries, APIs, or context it uses.]
 * 
 * Purpose:
 * - [List main goals or functionality.]
 * 
 * Props:
 * - [PropName] (type): [Short description] (optional section if your component uses props)
 * 
 * State Variables:
 * - [StateName] (type): [Short description]
 * 
 * Functions:
 * - [FunctionName]: [Short description of what the function does]
 * - [FunctionName]: [Short description...]
 * 
 * API Calls:
 * - [Endpoint] - [Purpose of the API call]
 * 
 * Error Handling:
 * - [Brief description of how errors are managed]
 * 
 * Notes:
 * - [Any important notes for future developers or groupmates]
 * ===========================================
 */
export default function SchedulerLeftSide({ initial = [], updateBacklogs, sortType, filterType, onTabChange }) {
  const [open, setOpen] = useState(false);
  /**
   * actionState Dictionary
   * - 0: Cancelling
   * - 1: Scheduling
   * - 2: Completing
   * - 3: See Details
   * - 4: Add Events
   * - 5: Trashing
   * - 6: Restoring
   * - 7: Permanently Delete
   */
  const [actionState, setActionState] = useState(0);
  const [selectedData, setSelectedData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [openConfirmTrash, setOpenConfirmTrash] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRequest, setIsRequest] = useState(false);
  const [blob, setBlob] = useState(null);
  const [openError, setOpenError] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (onTabChange) {
      onTabChange(newTab);
    }
  };

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

  const [newName, setNewName] = useState("");
  const [newMessage, setNewMessage] = useState("");
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
      setSelectedDate(newValue);
    } else {
      // Optionally, ignore invalid change or reset to last valid value
      // For example: Do nothing or force clamp
      setNewSchedDate(clampDate(newValue));
      setSelectedDate(newValue);
    }
  };


  // Function to update the backlog record in the database for Cancel, Edit, or Mark Complete
  const handleSave = async () => {
    let payload = {};

    const staff = JSON.parse(localStorage.getItem("staff"));
    
    if (actionState === 1 && selectedDate) { // Reschedule
      const UTC8 = addHours(selectedDate, 8);
      payload = { 
        sched_date: new Date(UTC8).toISOString().slice(0, 19).replace('T', ' '),
        student_id: selectedData.student_id,
        original_date: selectedData.sched_date,
        action: "Edit",
        name: selectedData.name,
        staff_position : staff.position,
        staff_name : staff.name,
        from_cancel: selectedData.status === "Cancelled",
      };
    } else if (actionState === 0) {
      payload = {
        action: "Cancel",
        student_id: selectedData.student_id,
        original_date: selectedData.sched_date,
        name: selectedData.name,
        staff_position : staff.position,
        staff_name : staff.name,
      };
    } else if (actionState === 2) {
      payload = { 
        action: "Mark Complete",
        name: selectedData.name,
        original_date: selectedData.sched_date,
        student_id: selectedData.student_id,
        staff_position : staff.position,
        staff_name : staff.name,
      };
    } else if (actionState === 5) { // Trash
      payload = {
        action: "Trash",
        name: selectedData.name,
        student_id: selectedData.student_id,
        staff_position : staff.position,
        staff_name : staff.name,
      };
    } else if (actionState === 6) {
      payload = {
        action: "Restore",
        name: selectedData.name,
        student_id: selectedData.student_id,
        staff_position : staff.position,
        staff_name : staff.name,
      };
    } else if (actionState === 7) {
      payload = {
        action: "Delete",
        name: selectedData.name,
        student_id: selectedData.student_id,
        staff_position : staff.position,
        staff_name : staff.name,
      };
    }
    setLoading(true);

    try {
      const response = await axios.put(`${API}/backlogs/${selectedData.id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (!response.data.success) {
        throw new Error("Failed to update event");
      }

      updateBacklogs();
      setLoading(false);
    } catch (error) {
      console.error("Error updating event:", error.response?.data || error.message);
    }

    setOpen(false);
    setOpenConfirmTrash(false);
  };
  
  // When the admin clicks + Add Event, open modal in "Add Event" mode (actionState 4)
  const handleOpenAddEvent = () => {
    setActionState(4);
    // Clear any previous inputs
    setNewName("");
    setNewMessage("");
    setNewSchedDate(null);
    setOpen(true);
  };

  // Open modal for other actions (view, cancel, edit, mark complete)
  const handleOpen = (data, type) => {
    // If event is Completed or Cancelled, open in view-only mode.
    setActionState(type);
    if (type === 5) {
      setOpenConfirmTrash(true)
    } 
    else {
      setOpen(true);
    }
    setSelectedData(data);
  };

  // Handle submission for Add Event modal
  const handleAddEvent = async () => {
    if (!newName || !newSchedDate) return;
    setLoading(true);
    const staff = JSON.parse(localStorage.getItem("staff"));
    const UTC8 = addHours(newSchedDate, 8);
    try {
      if (isRequest) {
        if (!blob) return;
        // Build payload for proposing events
        const file = new File([blob], `${newName.replace(/\s+/g, '_')}_proposal.html`, { type: "text/html" });
        const formData = new FormData();
        formData.append("name", newName);
        formData.append("sched_date", new Date(UTC8).toISOString().slice(0, 19).replace('T', ' '));
        formData.append("file", file);
        formData.append("staff_name", staff.name);
        formData.append("staff_position", staff.position);

        const response = await axios.post(`${API}/backlogs/request`, formData);

        if (response.data.success) {
          updateBacklogs();
          setOpen(false);
          setSelectedDate(null);
          setLoading(true);
        }
      }
      else {
        // Build payload if walk in appointment
        const payload = {
          name: newName,
          message: newMessage,
          sched_date: new Date(UTC8).toISOString().slice(0, 19).replace('T', ' '),
          staff_position : staff.position,
          staff_name : staff.name,
        };

        const response = await axios.post(`${API}/backlogs`, payload, {
          headers: { "Content-Type": "application/json" },
        });

        if (response.data.success) {
          updateBacklogs();
          setOpen(false);
          setSelectedDate(null);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Create error:", error);
      setAlertMessage("Failed to create appointment/request try again.");
      setIsSuccessful(false);
      setOpenError(true);
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      {/* The date and search part of left side */}
      <SchedulerTab 
        handleOpenAddEvent={handleOpenAddEvent} 
        handleSearchChange={handleSearchChange}
        setIsRequest={setIsRequest}
        tab={tab}
        setTab={handleTabChange}
      />
      {/* The table of left side */}
      <SchedulerTable
        initial={initial} 
        handleOpen={handleOpen} 
        searchTerm={searchTerm}
        tab={tab}
        filterType={filterType}
        sortType={sortType}
      />
      
      {/* Modals of all actions in table */}
      <SchedulerActionModals
        open={open}
        setOpen={setOpen}
        actionState={actionState}
        selectedData={selectedData}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        openConfirmTrash={openConfirmTrash}
        setOpenConfirmTrash={setOpenConfirmTrash}
        newName={newName}
        setNewName={setNewName}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        newSchedDate={newSchedDate}
        handleSave={handleSave}
        handleAddEvent={handleAddEvent}
        handleDateChange={handleDateChange}
        isRequest={isRequest}
        setBlob={setBlob}
        blob={blob}
        loading={loading}
        setIsSuccessful={setIsSuccessful}
        setAlertMessage={setAlertMessage}
        setOpenError={setOpenError}
      />

      <Dialog
        open={openError}
        onClose={() => {setOpenError(false); setAlertMessage(''); setIsSuccessful(false)}}
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "white",
            color: "#000",
            borderRadius: "25px",
          },
        }}
      >
        <DialogTitle className={`${isSuccessful ? "bg-[#b7e3cc]" : "bg-[#e3b7b7]"} relative`}>
          {isSuccessful ? "Successful" : "Error"}
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={() => {setOpenError(false); setAlertMessage(''); setIsSuccessful(false);}} className="rounded-full">
              <Close sx={{ fontSize: 40, color: "black" }} />
            </IconButton>
          </DialogActions>
        </DialogTitle>
        
        <DialogContent>
          {alertMessage}
        </DialogContent>
        <DialogActions>
          <button onClick={() => {setOpenError(false); setAlertMessage(''); setIsSuccessful(false);}}>
            <p className="text-base font-roboto font-bold text-[#64748b] p-2 px-6">OK</p>
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
}