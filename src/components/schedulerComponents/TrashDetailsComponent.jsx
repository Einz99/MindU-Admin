import React, { useState } from "react";
import {
  Table,
  TableCell,
  TableRow,
  TableBody,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { FilterList, Search, Delete, Restore, ArrowBack } from "@mui/icons-material";
import { format } from "date-fns";
import { API } from "../../api";

export default function TrashTable({ SelectedDate, initial = [], setIsTrash }) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [actionState, setActionState] = useState(null);

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return format(new Date(String(dateStr)), "yyyy-MM-dd");
    } catch (e) {
      return "";
    }
  };
  

  const headerDate = format(new Date(SelectedDate || new Date()), "EEEE, MMMM dd, yyyy").toUpperCase();

  // Filter only "Trash" status events
  const filteredData = (initial || []).filter((data) => {
    if (!data.sched_date || data.status !== "Trash" || data.status === "Permanent") return false;
    const rowDate = getFormattedDate(data.sched_date);
    const selectedFormatted = getFormattedDate(SelectedDate || new Date());
    return rowDate === selectedFormatted;
  });

  const handleAction = async () => {
    if (!selectedData) return;

    let payload = {};
    let action = "";

    if (actionState === "Restore") {
      payload = { action: "Restore" };
      action = "Restore";
    } else if (actionState === "Delete") {
      payload = { action: "Permanent" };
      action = "Permanent";
    }

    try {
      const updateResponse = await fetch(`${API}/backlogs/${selectedData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updateResult = await updateResponse.json();
      if (!updateResponse.ok) throw new Error(updateResult.error);

      // Log the action
      const logPayload = {
        action: action,
        initial: selectedData,
        updated: updateResult,
      };

      const logResponse = await fetch(`${API}/activity-logs/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logPayload),
      });
      if (!logResponse.ok) throw new Error("Failed to insert activity log");

      // Reload to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error updating event:", error);
    }
    setOpenConfirm(false);
  };

  const openConfirmModal = (data, action) => {
    setSelectedData(data);
    setActionState(action);
    setOpenConfirm(true);
  };

  return (
    <div className="p-5 flex-grow w-[70%]">
      <h1 className="text-7xl tracking-widest mb-8">GUIDANCE SCHEDULER</h1>
      <div className="flex flex-row justify-between items-center gap-5 w-full">
        <TextField
          className="search-bar"
          placeholder="Search"
          variant="outlined"
          size="small"
          InputProps={{ endAdornment: <Search className="text-gray-500" /> }}
          sx={{ maxWidth: "50%", marginLeft: "2%", marginBottom: "2%" }}
        />
        <button className="bg-white rounded-3xl px-7 my-2 border border-black flex items-center gap-2">
          Filter <FilterList />
        </button>
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
                    <TableRow key={data.id || index} className="bg-white">
                      <TableCell className="text-center" align="center">{data.name}</TableCell>
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
                      <TableCell className="text-center" align="center">
                        <div className="text-white bg-red-900 py-1 rounded-3xl">{data.status}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <IconButton onClick={() => openConfirmModal(data, "Restore")}>
                            <Restore className="text-green-500 bg-white rounded-full" />
                          </IconButton>
                          <IconButton onClick={() => openConfirmModal(data, "Delete")}>
                            <Delete className="text-red-500 bg-white rounded-full" />
                          </IconButton>
                        </div>
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
      <IconButton onClick={() => setIsTrash(0)}>
        <ArrowBack /> Back to Schedule List
      </IconButton>

      {/* Confirmation Modal */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionState === "Restore" ? "Restore Event" : "Delete Permanently"}
        </DialogTitle>
        <DialogContent>
          <p>Are you sure you want to {actionState} this event?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={handleAction} color={actionState === "Delete" ? "secondary" : "primary"}>
            {actionState}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
