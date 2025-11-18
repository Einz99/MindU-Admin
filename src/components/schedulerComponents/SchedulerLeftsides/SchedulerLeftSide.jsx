import { useState } from "react";
import { addHours } from "date-fns";
import { API } from "../../../api";
import SchedulerTab from "./SchedulerTab";
import SchedulerTable from "./SchedulerTable";
import SchedulerActionModals from "./SchedulerActionModals";
import axios from "axios";
import { Dialog, DialogTitle, DialogActions, DialogContent, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

export default function SchedulerLeftSide({ initial = [], updateBacklogs, sortType, filterType, onTabChange, tab, setTab }) {
  const [open, setOpen] = useState(false);
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
  const [isProposal, setIsProposal] = useState(false);

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
      setNewSchedDate(clampDate(newValue));
      setSelectedDate(newValue);
    }
  };

  // Function to update the backlog record in the database
  const handleSave = async () => {
    let payload = {};
    const staff = JSON.parse(localStorage.getItem("staff"));
    
    if (actionState === 1 && selectedDate) { // Reschedule/Edit
      const UTC8 = addHours(selectedDate, 8);
      
      if (isProposal) {
        // Edit proposal - behavior depends on current status
        const currentStatus = selectedData.status;
        
        // If Scheduled: only update date, no file change needed
        if (currentStatus === "Scheduled") {
          const formData = new FormData();
          formData.append("name", selectedData.name);
          formData.append("sched_date", new Date(UTC8).toISOString().slice(0, 19).replace('T', ' '));
          formData.append("staff_name", staff.name);
          formData.append("staff_position", staff.position);
          formData.append("action", "EditDateOnly");
          formData.append("current_status", currentStatus);

          setLoading(true);
          try {
            const response = await axios.put(`${API}/backlogs/proposal/${selectedData.id}`, formData);
            if (response.data.success) {
              updateBacklogs();
              setOpen(false);
              setSelectedDate(null);
            }
          } catch (error) {
            console.error("Edit proposal date error:", error);
            setAlertMessage("Failed to update proposal date.");
            setIsSuccessful(false);
            setOpenError(true);
          }
          setLoading(false);
          return;
        } 
        // If Pending/Denied/Trash: update file and date, set to Pending
        else {
          if (!blob) {
            setIsSuccessful(false);
            setAlertMessage("Please provide the updated proposal content.");
            setOpenError(true);
            return;
          }

          const file = new File([blob], `${selectedData.name.replace(/\s+/g, '_')}_proposal.html`, { type: "text/html" });
          const formData = new FormData();
          formData.append("name", selectedData.name);
          formData.append("sched_date", new Date(UTC8).toISOString().slice(0, 19).replace('T', ' '));
          formData.append("file", file);
          formData.append("staff_name", staff.name);
          formData.append("staff_position", staff.position);
          formData.append("action", "Edit");
          formData.append("original_proposal", selectedData.proposal);
          formData.append("current_status", currentStatus);

          setLoading(true);
          try {
            const response = await axios.put(`${API}/backlogs/proposal/${selectedData.id}`, formData);
            if (response.data.success) {
              updateBacklogs();
              setOpen(false);
              setSelectedDate(null);
              setBlob(null);
            }
          } catch (error) {
            console.error("Edit proposal error:", error);
            setAlertMessage("Failed to update proposal.");
            setIsSuccessful(false);
            setOpenError(true);
          }
          setLoading(false);
          return;
        }
      } else {
        // Regular appointment reschedule
        payload = { 
          sched_date: new Date(UTC8).toISOString().slice(0, 19).replace('T', ' '),
          student_id: selectedData.student_id,
          original_date: selectedData.sched_date,
          action: "Edit",
          name: selectedData.name,
          staff_position: staff.position,
          staff_name: staff.name,
          from_cancel: selectedData.status === "Cancelled",
        };
      }
    } else if (actionState === 0) {
      payload = {
        action: "Cancel",
        student_id: selectedData.student_id,
        original_date: selectedData.sched_date,
        name: selectedData.name,
        staff_position: staff.position,
        staff_name: staff.name,
      };
    } else if (actionState === 2) {
      payload = { 
        action: "Mark Complete",
        name: selectedData.name,
        original_date: selectedData.sched_date,
        student_id: selectedData.student_id,
        staff_position: staff.position,
        staff_name: staff.name,
      };
    } else if (actionState === 5) { // Trash
      payload = {
        action: "Trash",
        name: selectedData.name,
        student_id: selectedData.student_id,
        staff_position: staff.position,
        staff_name: staff.name,
      };
    } else if (actionState === 6) { // Restore/Repropose
      const UTC8 = addHours(selectedDate, 8);
      
      if (isProposal) {
        // Repropose - update file and set to pending
        if (!blob) {
          setIsSuccessful(false);
          setAlertMessage("Please provide the updated proposal content.");
          setOpenError(true);
          return;
        }

        const file = new File([blob], `${selectedData.name.replace(/\s+/g, '_')}_proposal.html`, { type: "text/html" });
        const formData = new FormData();
        formData.append("name", selectedData.name);
        formData.append("sched_date", new Date(UTC8).toISOString().slice(0, 19).replace('T', ' '));
        formData.append("file", file);
        formData.append("staff_name", staff.name);
        formData.append("staff_position", staff.position);
        formData.append("action", "Repropose");
        formData.append("original_proposal", selectedData.proposal);

        setLoading(true);
        try {
          const response = await axios.put(`${API}/backlogs/proposal/${selectedData.id}`, formData);
          if (response.data.success) {
            updateBacklogs();
            setOpen(false);
            setSelectedDate(null);
            setBlob(null);
          }
        } catch (error) {
          console.error("Repropose error:", error);
          setAlertMessage("Failed to repropose event.");
          setIsSuccessful(false);
          setOpenError(true);
        }
        setLoading(false);
        return;
      } else {
        // Regular restore
        payload = {
          action: "Restore",
          name: selectedData.name,
          student_id: selectedData.student_id,
          staff_position: staff.position,
          staff_name: staff.name,
        };
      }
    } else if (actionState === 7) {
      payload = {
        action: "Delete",
        name: selectedData.name,
        student_id: selectedData.student_id,
        staff_position: staff.position,
        staff_name: staff.name,
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
  
  const handleOpenAddEvent = () => {
    setActionState(4);
    setNewName("");
    setNewMessage("");
    setNewSchedDate(null);
    setOpen(true);
  };

  const handleOpen = (data, type, isProposal = false) => {
    setActionState(type);
    setIsProposal(isProposal);
    if (type === 5) {
      setOpenConfirmTrash(true);
    } else {
      setOpen(true);
    }
    setSelectedData(data);
  };

  const handleAddEvent = async () => {
    if (!newName || !newSchedDate) return;
    setLoading(true);
    const staff = JSON.parse(localStorage.getItem("staff"));
    const UTC8 = addHours(newSchedDate, 8);
    try {
      if (isRequest) {
        if (!blob) return;
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
          setLoading(false);
        }
      } else {
        const payload = {
          name: newName,
          message: newMessage,
          sched_date: new Date(UTC8).toISOString().slice(0, 19).replace('T', ' '),
          staff_position: staff.position,
          staff_name: staff.name,
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
      <SchedulerTab 
        handleOpenAddEvent={handleOpenAddEvent} 
        handleSearchChange={handleSearchChange}
        setIsRequest={setIsRequest}
        tab={tab}
        setTab={handleTabChange}
      />
      <SchedulerTable
        initial={initial} 
        handleOpen={handleOpen} 
        searchTerm={searchTerm}
        tab={tab}
        filterType={filterType}
        sortType={sortType}
      />
      
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
        setIsProposal={setIsProposal}
        isProposal={isProposal}
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
          <p className="font-bold">{isSuccessful ? "Successful" : "Error"}</p>
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={() => {setOpenError(false); setAlertMessage(''); setIsSuccessful(false);}} className="rounded-full">
              <Close sx={{ fontSize: 40, color: "black" }} />
            </IconButton>
          </DialogActions>
        </DialogTitle>
        
        <DialogContent>
          <img src={isSuccessful ? "/success.png" : "/failed.png"} alt="Chat" className="w-40 h-40 mx-auto"/>
          <p className="font-roboto font-medium text-xl">{alertMessage}</p>
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