import React, { useEffect, useState } from "react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    IconButton, 
    Select, 
    MenuItem, 
    Button,
    Tooltip,
  } from "@mui/material";
import { CheckCircle, Cancel, Edit, Delete, Summarize, Restore } from "@mui/icons-material";
import { format } from "date-fns";

export default function SchedulerTable({ initial, handleOpen, searchTerm, tab, filterType, sortType }) {
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const staff = JSON.parse(localStorage.getItem("staff"));
    const staffPosition = staff.position;

    const statusOrder = {
      Scheduled: 0,
      Completed: 1,
      Cancelled: 2,
      Trash: 3,
    };

    // Filtering: Compare the date portion only.
    const filteredData = (initial || [])
      .filter((data) => {
        if (searchTerm && data.name && !data.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (!data.sched_date || (tab === 0 && data.status === "Pending")) return false;

        if (tab === 0 && data.student_id == null) return false;
        if (tab === 1 && data.student_id != null) return false;
        if (filterType === 1 && data.status !== "Scheduled") return false;
        if (filterType === 2 && data.status !== "Cancelled") return false;
        if (filterType === 3 && data.status !== "Missed") return false;
        if (filterType === 4 && data.status !== "Completed") return false;
        if (filterType === 5 && data.status !== "Trash") return false;
        if (filterType === 6 && data.status !== "Pending") return false;
        if (filterType === 7 && data.status !== "Denied") return false;
        return true;
      })
      .sort((a, b) => {
        // First: group by whether student_id exists
        const isAAppointment = a.student_id != null;
        const isBAppointment = b.student_id != null;
        if (isAAppointment !== isBAppointment) {
          return isAAppointment ? 1 : -1; // Events (no student_id) come first
        }

        // Second: sort by status
        const statusA = statusOrder[a.status] ?? 999;
        const statusB = statusOrder[b.status] ?? 999;
        if (statusA !== statusB) return statusA - statusB;

        // Sorting based on `sortType` value
        if (sortType === 0) {
          // Sort by name A-Z
          return a.name.localeCompare(b.name);
        }
        if (sortType === 1) {
          // Sort by name Z-A
          return b.name.localeCompare(a.name);
        }
        if (sortType === 2) {
          // Sort by scheduled date
          const dateA = new Date(a.sched_date);
          const dateB = new Date(b.sched_date);
          return  dateB - dateA;
        }
      
        // Default: Sort alphabetically by name (this is for the case if `sortType` isn't set)
        return a.name.localeCompare(b.name);
      });
    
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const handlePreviousPage = () => {
      if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
      if (page < totalPages) setPage(page + 1);
    };

    const handleRowsPerPageChange = (event) => {
      setRowsPerPage(event.target.value);
      setPage(1);
    };

    const getLabel = (action) => {
      return {
        view: "View Appointment Details",
        cancel: "Cancel Appointment",
        reschedule: "Reschedule Appointment",
        complete: "Mark Appointment as Complete",
        trash: "Move to Trash",
        restore: "Restore to Cancelled",
        delete: "Permanently Delete Appointment",
        proposal: "View Proposal Details",
        editproposal: "Edit Proposal",
        deleteproposal: "Permanently Delete Proposal",
        completeevent: "Mark Event as Complete",
        repropose: "Repropose Event",
      }[action];
    };

    useEffect(() => {
      setPage(1);
    }, [searchTerm, tab, filterType, sortType]);


    return (
      <div className="max-h-[calc(100vh-22rem)] overflow-y-auto">
        <TableContainer className="border-b border-black">
          <Table sx={{ borderCollapse: "collapse" }}>
            <TableHead>
              <TableRow className="bg-white border-y border-black">
                <TableCell className="p-3 font-bold " sx={{ borderBottom: "none" }}>
                  <p className="mx-auto text-center font-roboto font-bold">{tab === 0 ? "Names" : "Events"}</p>
                </TableCell>
                <TableCell className="p-3 font-bold" sx={{ borderBottom: "none" }}>
                  <p className="mx-auto text-center font-roboto font-bold">Date & Time</p>
                </TableCell>
                <TableCell className="p-3 font-bold" sx={{ borderBottom: "none" }}>
                  <p className="mx-auto text-center font-roboto font-bold">Status</p>
                </TableCell>
                <TableCell className="p-3 font-bold" sx={{ borderBottom: "none" }}>
                  <p className="mx-auto text-center font-roboto font-bold">Actions</p>
                </TableCell>
              </TableRow>
            </TableHead>

            {/* Table Body: Map through filteredData and display each row */}
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((data) => (
                  <TableRow key={data.id} className="border-b border-white">
                    <TableCell className="p-3 font-bold" sx={{ borderBottom: "none" }}>
                      <p className="mx-auto text-center font-roboto">{data.name}</p>
                    </TableCell>
                    <TableCell className="p-3 font-bold" sx={{ borderBottom: "none" }}>
                      <p className="mx-auto text-center font-roboto">{format(new Date(data.sched_date), "MMMM dd, yyyy hh:mm a")}</p>
                    </TableCell>
                    <TableCell className="p-3 font-bold" sx={{ borderBottom: "none" }}>
                      <p className={`
                        mx-auto 
                        text-center
                        rounded-full
                        ${data.status === "Scheduled" && (!data.title === "Guidance Related Events" ? "bg-[#4f46e5]" : "bg-[#60a5fa]")}
                        ${data.status === "Completed" && "bg-[#10b981]"}
                        ${data.status === "Cancelled" && "bg-[#ef4444]"}
                        ${data.status === "Missed" && "bg-[#ef4444]"}
                        ${data.status === "Trash" && "bg-red-900"}
                        ${data.status === "Pending" && "bg-yellow-400"}
                        ${data.status === "Denied" && "bg-gray-600 text-white"}
                        `}>{data.status}</p>
                    </TableCell>
                    {staffPosition !== "Adviser" && (
                      <TableCell className="p-3 font-bold z-0" sx={{ borderBottom: "none" }}>
                        {/* Action buttons based on status */}
                        {data.status === "Scheduled" ? (
                          <div className="flex gap-2 justify-center">
                            <Tooltip title={tab === 0 ? getLabel("view") : getLabel('proposal')} arrow>
                              <IconButton onClick={() => handleOpen(data, 3, tab === 1)} className="rounded-full z-0">
                                <Summarize className="text-[#4F46E5] bg-white rounded-full" />
                              </IconButton>
                            </Tooltip>

                            {tab === 0 && (
                            <Tooltip title={getLabel("cancel")} arrow>
                              <IconButton onClick={() => handleOpen(data, 0, false)} className="rounded-full z-0">
                                <Cancel className="text-red-400 bg-white rounded-full" />
                              </IconButton>
                            </Tooltip>
                            )} 

                            <Tooltip title={tab === 0 ? getLabel("reschedule") : getLabel('editproposal')} arrow>
                              <IconButton onClick={() => handleOpen(data, 1, tab === 1)} className="rounded-full z-0">
                                <Edit className="text-yellow-400 bg-white rounded-full" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={tab === 0 ? getLabel("complete") : getLabel("completeevent")} arrow>
                              <IconButton onClick={() => handleOpen(data, 2, tab === 1)} className="rounded-full z-0">
                                <CheckCircle className="text-green-500 bg-white rounded-full" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        ) : data.status === "Completed" ? (
                          <div className="flex justify-center">
                            <Tooltip title={tab === 0 ? getLabel("view") : getLabel('proposal')} arrow>
                              <IconButton onClick={() => handleOpen(data, 3, tab === 1)} className="rounded-full z-0">
                                <Summarize className="text-[#4F46E5] bg-white rounded-full" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        ) : (data.status === "Cancelled" || data.status === "Missed" || data.status === "Pending" || data.status === "Denied") ? (
                          <div className="flex justify-center">
                            <Tooltip title={tab === 0 ? getLabel("view") : getLabel('proposal')} arrow>
                              <IconButton onClick={() => handleOpen(data, 3, tab === 1)} className="rounded-full z-0">
                                <Summarize className="text-[#4F46E5] bg-white rounded-full" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={tab === 0 ? getLabel("reschedule") : getLabel('editproposal')} arrow>
                              <IconButton onClick={() => handleOpen(data, 1, tab === 1)} className="rounded-full z-0">
                                <Edit className="text-yellow-400 bg-white rounded-full" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={tab === 0 ? getLabel("trash") : getLabel('deleteproposal')} arrow>
                              <IconButton onClick={() => handleOpen(data, 5, tab === 1)} className="rounded-full z-0">
                                <Delete className="text-red-400 bg-white rounded-full" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-center">
                            <Tooltip title={tab === 0 ? getLabel("restore") : getLabel('repropose')} arrow>
                              <IconButton onClick={() => handleOpen(data, 6, tab === 1)} className="rounded-full z-0">
                                <Restore className="text-green-500 bg-white rounded-full" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={tab === 0 ? getLabel("trash") : getLabel('deleteproposal')} arrow>
                              <IconButton onClick={() => handleOpen(data, 7, tab === 1)} className="rounded-full z-0">
                                <Delete className="text-red-500 bg-white rounded-full" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        )
                      }
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell sx={{alignItems: "center", textAlign: "center"}} colSpan={4} className="text-center p-3">No {tab === 0 ? "Appointments" : "Events"}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredData.length > 5 && (
          <div className="flex items-center justify-end p-2">
            <span className="pr-5">Show: </span>
            <Select value={rowsPerPage} onChange={handleRowsPerPageChange} size="small">
              {[5, 10, 15, 20, 25, 30].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
              <div className="flex justify-center items-center p-2">
                <Button onClick={handlePreviousPage} disabled={page === 1}><p className={`${page === 1 ? "text-gray-500" : "text-black"} text-2xl font-extrabold`}>{"<"}</p></Button>
                <span className="mx-2">Page {page} of {totalPages}</span>
                <Button onClick={handleNextPage} disabled={page === totalPages}><p className={`${page === totalPages ? "text-gray-500" : "text-black"} text-2xl font-extrabold`}>{">"}</p></Button>
              </div>
          </div>
        )}
      </div>
    );
}