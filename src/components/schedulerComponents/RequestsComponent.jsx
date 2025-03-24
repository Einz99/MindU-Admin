import React, { useState, useEffect } from "react";
import { Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { addHours, format } from "date-fns";
import { API } from "../../api";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function Requests({ initial, SelectedDate }) {
  const [tab, setTab] = useState(0);
  const [logs, setLogs] = useState([]);
  // State for schedule modal
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newSchedDate, setNewSchedDate] = useState(null);

  const formattedDate = format(
    new Date(SelectedDate || new Date()),
    "MMMM dd, yyyy"
  ).toUpperCase();

  // Fetch activity logs on mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${API}/activity-logs`);
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      }
    };
    fetchLogs();
  }, []);

  // Handler when "Schedule" is clicked on a pending request
  const handleScheduleClick = (request) => {
    setSelectedRequest(request);
    setNewSchedDate(null);
    setOpenScheduleModal(true);
  };

  // Handler for confirming schedule update
  const handleConfirmSchedule = async () => {
    if (!newSchedDate || !selectedRequest) return;
    // Build payload for scheduling update: explicitly set status to "Scheduled"
    const UTC8 = addHours(newSchedDate, 8);
    const payload = {
      sched_date: UTC8.toISOString(),
      status: "Scheduled",
      action: "Schedule",
    };
    try {
      // Send update request to update the request's scheduled date
      const updateResponse = await fetch(`${API}/backlogs/${selectedRequest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updateResult = await updateResponse.json();
      if (!updateResponse.ok) {
        throw new Error(updateResult.error || "Failed to update schedule");
      }
      console.log("Schedule updated successfully:", updateResult);
  
      // Build activity log payload for "Schedule" action
      const logPayload = {
        action: "Schedule",
        initial: selectedRequest,
        updated: { sched_date: payload.sched_date },
      };
      const logResponse = await fetch(`${API}/activity-logs/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logPayload),
      });
      const logResult = await logResponse.json();
      if (!logResponse.ok) {
        throw new Error(logResult.error || "Failed to insert activity log");
      }
      console.log("Activity log inserted successfully:", logResult);
      setOpenScheduleModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error scheduling request:", error);
    }
  };
  

  return (
    <div className="min-w-[100%] max-w-[100%]">
      <div className="p4 max-w-max mx-auto">
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          className="database-tabs px-20 min-w-max"
        >
          <Tab label="Request" className="database-tab" />
          <p className="text-3xl text-gray-500"> | </p>
          <Tab label="Activity Logs" className="database-tab" />
        </Tabs>
      </div>

      {tab === 0 ? (
        <div className="px-2 py-6 h-[16.5rem] min-w-[90%] max-w-max mx-auto mt-7 overflow-y-auto flex flex-col gap-5">
          {initial
            .filter(
              (item) =>
                item.status === "Pending" && item.title === "Request Meeting"
            )
            .map((item, index) => (
              <div
                key={item.id || index}
                className="relative bg-[#b7e3cc] rounded-2xl py-1 pl-3"
              >
                <div className="bg-white rounded-2xl h-52 py-2 pl-5">
                  <h1 className="text-3xl font-medium">{item.title}</h1>
                  <h1 className="text-2xl font-medium">{item.name}</h1>
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
      ) : (
        <div className="px-2 py-2.5 h-[16.5rem] max-w-[100%] mx-[5%] bg-[#b7e3cc] shadow rounded-3xl mt-7 overflow-y-auto">
          <div className="p-4 h-[15rem] min-w-full mx-auto bg-white shadow overflow-y-auto">
            <p>{formattedDate}</p>
            {logs.map((item, index) => {
              const itemDate = new Date(item.created_at);
              const selectedDateObj = new Date(SelectedDate || new Date());
              if (
                !isNaN(itemDate.getTime()) &&
                format(itemDate, "MMMM dd, yyyy") ===
                  format(selectedDateObj, "MMMM dd, yyyy")
              ) {
                return (
                  <div
                    key={item.id || index}
                    className="relative flex flex-row"
                  >
                    <div className="absolute top-2.5 w-2 h-2 bg-black rounded-full"></div>
                    <p className="text-xl font-medium pl-5 mb-5">
                      {item.message}
                    </p>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Modal for scheduling a request */}
      <Dialog
        open={openScheduleModal}
        onClose={() => setOpenScheduleModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule Request</DialogTitle>
        <DialogContent>
          <p>
            Schedule meeting for <strong>{selectedRequest ? selectedRequest.name : ""}</strong>
          </p>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Select Date & Time"
              value={newSchedDate}
              onChange={(newValue) => setNewSchedDate(newValue)}
              renderInput={(params) => (
                <TextField {...params} fullWidth margin="normal" />
              )}
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
            disabled={!newSchedDate}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
