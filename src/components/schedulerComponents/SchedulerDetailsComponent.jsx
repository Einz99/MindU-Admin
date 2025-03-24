import React, { useState, useEffect } from "react";
import {
  TextField,
  Table,
  TableCell,
  TableRow,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { FilterList, Search, CheckCircle, Cancel, Edit, Delete, Summarize } from "@mui/icons-material";
import { addHours, format } from "date-fns";
import { API } from "../../api";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function SchedulerTable({ SelectedDate, initial = [], setIsTrash }) {
  const [open, setOpen] = useState(false);
  // actionState: 0 = Cancel, 1 = Edit/Reschedule, 2 = Mark Complete, 3 = View-only, 4 = Add Event
  const [actionState, setActionState] = useState(0);
  const [selectedData, setSelectedData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [openConfirmTrash, setOpenConfirmTrash] = useState(false);

  // States for new event inputs (when adding an event)
  const [newName, setNewName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newSchedDate, setNewSchedDate] = useState(null);

  // Debug: Log incoming initial data
  useEffect(() => {
    console.log("SchedulerTable: initial data from backend:", initial);
  }, [initial]);

  // Helper: safely get formatted date ("yyyy-MM-dd") from a date string
  const getFormattedDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(String(dateStr));
      return format(d, "yyyy-MM-dd");
    } catch (e) {
      return "";
    }
  };

  // Format the header date using SelectedDate (or fallback to today)
  const headerDate = format(new Date(SelectedDate || new Date()), "EEEE, MMMM dd, yyyy").toUpperCase();

  // Function to update the backlog record in the database for Cancel, Edit, or Mark Complete
  const handleSave = async (data) => {
    let payload = {};

    if (actionState === 1 && selectedDate) { // Reschedule
      const UTC8 = addHours(selectedDate, 8);
      payload = { sched_date: UTC8.toISOString(), action: "Edit" };
      
    } else if (actionState === 0) {
      payload = { action: "Cancel" };
    } else if (actionState === 2) {
      payload = { action: "Mark Complete" };
    } else if (actionState === 5) { // Trash action
      payload = { action: "Trash" };
    }

    try {
      const updateResponse = await fetch(`${API}/backlogs/${selectedData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updateResult = await updateResponse.json();
      if (!updateResponse.ok) throw new Error(updateResult.error);
      
      var action = "";
      if (actionState === 1 && selectedDate) { // Reschedule
        action = "Edit";
      } else if (actionState === 0) {
        action = "Cancel";
      } else if (actionState === 2) {
        action = "Mark Complete";
      } else if (actionState === 5) { // Trash action
        action = "Trash"
      }

      const logPayload = {
        action: action,
        initial: selectedData, // The event created
        updated: updateResult,
      };

      const logResponse = await fetch(`${API}/activity-logs/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logPayload),
      });
      const logResult = await logResponse.json();
      if (!logResponse.ok)
        throw new Error(logResult.error || "Failed to insert activity log");
      
      window.location.reload();
    } catch (error) {
      console.error("Error updating event:", error);
    }
    setOpen(false);
    setOpenConfirmTrash(false);
  };

  const handleDelete = (data) => {
    setSelectedData(data);
    setOpenConfirmTrash(true);
    setActionState(5);
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
    setOpen(true);
    // If event is Completed or Cancelled, open in view-only mode.
    if (data.status === "Completed") {
      setActionState(3);
    } else {
      setActionState(type);
    }
    setSelectedData(data);
    setSelectedDate(null);
  };

  // Handle submission for Add Event modal
  const handleAddEvent = async () => {
    if (!newName || !newSchedDate) return;
    // Build payload for admin-created event:
    const UTC8 = addHours(newSchedDate, 8);
    const payload = {
      name: newName,
      message: newMessage,
      sched_date: UTC8.toISOString(),
      // student_id is undefined so backend sets title to "Guidance Related Events" and status "Scheduled"
    };
    try {
      // Create the event
      const response = await fetch(`${API}/backlogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to add event");
      console.log("Event added successfully:", result);
      
      // Build activity log payload for "Add" action
      const logPayload = {
        action: "Add",
        initial: result, // The event created
        updated: null,
      };
  
      // Insert activity log
      const logResponse = await fetch(`${API}/activity-logs/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logPayload),
      });
      const logResult = await logResponse.json();
      if (!logResponse.ok)
        throw new Error(logResult.error || "Failed to insert activity log");
      console.log("Activity log inserted successfully:", logResult);
      
      window.location.reload();
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };
  

  // Filtering: Compare the date portion only.
  const filteredData = (initial || []).filter((data) => {
    if (!data.sched_date || data.status === "Trash" || data.status === "Permanent") return false;
    const rowDate = getFormattedDate(data.sched_date);
    const selectedFormatted = getFormattedDate(SelectedDate || new Date());
    return rowDate === selectedFormatted;
  });

  return (
    <div className="p-5 flex-grow w-[70%]">
      <h1 className="text-7xl tracking-widest mb-8">GUIDANCE SCHEDULER</h1>
      <div className="flex flex-row justify-between items-center gap-5 w-full">
        {/* Left-aligned search bar */}
        <TextField
          className="search-bar"
          placeholder="Search"
          variant="outlined"
          size="small"
          InputProps={{ endAdornment: <Search className="text-gray-500" /> }}
          sx={{ maxWidth: "50%", marginLeft: "2%", marginBottom: "2%" }}
        />
        {/* Right-aligned buttons */}
        <div className="flex flex-row gap-3">
          <button
            onClick={handleOpenAddEvent}
            className="bg-[#b7e3cc] rounded-3xl px-7 my-2 border border-black"
          >
            + Add Event
          </button>
          <button className="bg-white rounded-3xl px-7 my-2 border border-black flex items-center gap-2">
            Filter <FilterList />
          </button>
        </div>
      </div>
      <div className="relative bg-[#b7e3cc] h-[75%] w-[100%]">
        <div className="absolute bottom-0 right-0 bg-white h-[95%] w-[97.5%] p-5">
          <h1 className="text-4xl mb-8">{headerDate}</h1>
          <div className="h-[80%] overflow-y-auto">
            <Table>
              <TableRow className="border-y-2 border border-x-0">
                <TableCell className="text-center" align="center">
                  <p className="text-lg">Names/Event</p>
                </TableCell>
                <TableCell className="text-center" align="center">
                  <p className="text-lg">Date & Time</p>
                </TableCell>
                <TableCell className="text-center" align="center">
                  <p className="text-lg">Status</p>
                </TableCell>
                <TableCell className="text-center" align="center">
                  <p className="text-lg">Action</p>
                </TableCell>
              </TableRow>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((data, index) => (
                    <TableRow
                      key={data.id || index}
                      className={
                        data.title === "Guidance Related Events"
                          ? "bg-purple-400"
                          : "bg-white"
                      }
                    >
                      {/* Name */}
                      <TableCell className="text-center" align="center">
                        {data.name}
                      </TableCell>
                      {/* Date & Time */}
                      <TableCell className="text-center" align="center">
                        {data.sched_date ? (
                          <>
                            {format(new Date(String(data.sched_date)), "MM/dd/yyyy")}
                            <br />
                            {format(new Date(String(data.sched_date)), "h:mm a")}
                          </>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      {/* Status */}
                      <TableCell className="text-center" align="center">
                        <div
                          className={`py-1 rounded-3xl text-white 
                            ${data.status === "Scheduled" ? "bg-yellow-400 text-black" : ""}
                            ${data.status === "Completed" ? "bg-green-600" : ""}
                            ${data.status === "Cancelled" ? "bg-red-500" : ""}`}
                        >
                          {data.status}
                        </div>
                      </TableCell>
                      {/* Action */}
                      <TableCell className="text-center" align="center">
                        {data.status === "Scheduled" ? (
                          <div className="flex gap-2 justify-center">
                            <IconButton onClick={() => handleOpen(data, 0)} className="rounded-full">
                              <Cancel className="text-red-400 bg-white rounded-full" />
                            </IconButton>
                            <IconButton onClick={() => handleOpen(data, 1)} className="rounded-full">
                              <Edit className="text-yellow-400 bg-white rounded-full" />
                            </IconButton>
                            <IconButton onClick={() => handleOpen(data, 2)} className="rounded-full">
                              <CheckCircle className="text-green-500 bg-white rounded-full" />
                            </IconButton>
                          </div>
                        ) : data.status === "Completed" ? (<div className="flex justify-center">
                          <IconButton onClick={() => handleOpen(data, 3)} className="rounded-full">
                            <Summarize className="text-gray-400 bg-white rounded-full" />
                          </IconButton>
                        </div>) :(
                          <div className="flex justify-center">
                            <IconButton onClick={() => handleOpen(data, 1)} className="rounded-full">
                              <Edit className="text-gray-400 bg-white rounded-full" />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(data)} className="rounded-full">
                              <Delete className="text-gray-400 bg-white rounded-full" />
                            </IconButton>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No records found for {headerDate}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Modal for actions */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth 
      sx={{
        "& .MuiPaper-root": {
          backgroundColor: "#b7e3cc", // Light blue for Restore, Light red for Delete
          color: "#000", // Text color
          borderRadius: "10px", // Optional: rounded corners
        },
      }}>
        {actionState === 4 ? (
          // Modal for adding a new event (admin-created)
          <>
            <DialogTitle>Add New Guidance Event</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                margin="normal"
                label="Event Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Message"
                multiline
                rows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Select Date & Time"
                  value={newSchedDate}
                  onChange={(newValue) => setNewSchedDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                />
              </LocalizationProvider>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)} style={{ fontSize: "1rem", padding: "10px 20px" }}>
                Back
              </Button>
              <Button
                onClick={handleAddEvent}
                style={{ fontSize: "1rem", padding: "10px 20px" }}
                disabled={!newName || !newSchedDate}
              >
                Add Event
              </Button>
            </DialogActions>
          </>
        ) : actionState === 3 ? (
          // View-only mode: show details with a Close button
          <>
            <div className="flex flex-row justify-between">
              <DialogTitle>Event Details</DialogTitle> 
              <DialogActions>
                <IconButton onClick={() => setOpen(false)} className="rounded-full">
                  <Cancel sx={{fontSize: 40, color: "#b7e3cc", background: "white", borderRadius: "100px"}}></Cancel>
                </IconButton>
              </DialogActions>
            </div>
            <div className="bg-white w-[95%] mx-auto my-1 rounded-xl">
              <DialogContent className="text-center">
                {selectedData && (
                  <div style={{ fontSize: "1.2rem", padding: "10px" }}>
                    <p><strong>Name/Event:</strong> {selectedData.name}</p>
                    <p>
                      <strong>Date & Time:</strong>{" "}
                      {selectedData.sched_date
                        ? format(new Date(String(selectedData.sched_date)), "MM/dd/yyyy h:mm a")
                        : "N/A"}
                    </p>
                    <p><strong>Message:</strong> {selectedData.message}</p>
                    <p><strong>Status:</strong> {selectedData.status}</p>
                  </div>
                )}
              </DialogContent>
            </div>
          </>
        ) : (
          // Action mode for Cancel, Reschedule, or Mark Complete
          <>
          <div className="flex flex-row justify-between">
            <DialogTitle>
              {actionState === 0
                ? "Cancelling Schedule"
                : actionState === 1
                ? "Rescheduling"
                : "Mark Complete"}
            </DialogTitle>
            <DialogActions>
              <IconButton onClick={() => setOpen(false)} className="rounded-full">
                <Cancel sx={{fontSize: 40, color: "#b7e3cc", background: "white", borderRadius: "100px"}}></Cancel>
              </IconButton>
            </DialogActions>
          </div>
          <div className="bg-white w-[95%] mx-auto my-1 rounded-xl">
            <DialogContent className="text-center">
              {selectedData && (
                <div style={{ fontSize: "1.2rem", padding: "10px" }}>
                  <p><strong>Name/Event:</strong> {selectedData.name}</p>
                  <p>
                    <strong>Date & Time:</strong>{" "}
                    {selectedData.sched_date
                      ? format(new Date(String(selectedData.sched_date)), "MM/dd/yyyy h:mm a")
                      : "N/A"}
                  </p>
                  <p><strong>Message:</strong> {selectedData.message}</p>
                  <p><strong>Status:</strong> {selectedData.status}</p>
                </div>
              )}
              {actionState === 1 && (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Select New Date & Time"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                  />
                </LocalizationProvider>
              )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center" }}>
              <Button
                onClick={handleSave}
                sx={{paddingX: "3rem",
                     bgcolor: `${actionState === 0 ? "#ed4040" : actionState === 1 ? "#ffde59" : "#00a651"}`,
                     color: "white",
                     borderRadius: "100px",
                }}
                disabled={actionState === 1 && !selectedDate}
              >
                {actionState === 0
                  ? "Cancel Schedule"
                  : actionState === 1
                  ? "Reschedule"
                  : "Mark Complete"}
              </Button>
            </DialogActions>
          </div>    
          </>
        )}
      </Dialog>
      <Dialog open={openConfirmTrash} onClose={() => setOpenConfirmTrash(false)} maxWidth="sm" fullWidth 
      sx={{
        "& .MuiPaper-root": {
          backgroundColor: "#b7e3cc", // Light blue for Restore, Light red for Delete
          color: "#000", // Text color
          borderRadius: "10px", // Optional: rounded corners
        },
      }}>
        <div className="flex flex-row justify-between">
          <DialogTitle>Move to Trash</DialogTitle>
          <IconButton onClick={() => setOpenConfirmTrash(false)} className="rounded-full">
            <Cancel sx={{fontSize: 40, color: "#b7e3cc", background: "white", borderRadius: "100px"}}></Cancel>
          </IconButton>
        </div>
        <div className="bg-white w-[95%] mx-auto my-1 rounded-xl">
          <DialogContent className="text-center">
            <p>Are you sure you want to move this event to trash?</p>
            <p><strong>Name/Event:</strong> {selectedData.name}</p>
            <p>
              <strong>Date & Time:</strong> {selectedData.sched_date ? format(new Date(String(selectedData.sched_date)), "MM/dd/yyyy h:mm a") : "N/A"}
            </p>
            <p><strong>Message:</strong> {selectedData.message}</p>
            <p><strong>Status:</strong> {selectedData.status}</p>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center" }}>
            <IconButton onClick={() => handleSave() } 
              sx={{paddingX: "3rem",
                bgcolor: "#ed4040",
                color: "white",
                borderRadius: "100px",
              }}
           ><Delete></Delete>Move to Trash</IconButton>
          </DialogActions></div>
      </Dialog>
      <IconButton onClick={() => setIsTrash(1)}><Delete></Delete>Trash</IconButton>
    </div>
  );
}
