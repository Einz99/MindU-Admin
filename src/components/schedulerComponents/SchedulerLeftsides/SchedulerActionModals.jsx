import React, { useRef, useEffect, useState } from "react";
import { format } from "date-fns";
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Autocomplete
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import RichTextEditor from "../../contentManagementComponents/contentDialogComponents";
import * as mammoth from "mammoth/mammoth.browser";
import * as pdfjsLib from "pdfjs-dist";
import { getDocument } from "pdfjs-dist";
import axios from "axios";
import { API, RootAPI } from "../../../api";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function SchedulerActionModals({
  open,
  setOpen,
  actionState,
  selectedData,
  selectedDate,
  openConfirmTrash,
  setOpenConfirmTrash,
  newName,
  setNewName,
  newMessage,
  setNewMessage,
  newSchedDate,
  handleSave,
  handleAddEvent,
  handleDateChange,
  isRequest,
  setBlob,
  blob,
  loading,
  setIsSuccessful,
  setAlertMessage,
  setOpenError,
  setIsProposal,
  isProposal
}) {
  const [students, setStudents] = useState({});
  const [editorData, setEditorData] = useState(null);

  useEffect(() => {
    async function getAllStudents() {
      try {
        const response = await axios.get(`${API}/students`);
        setStudents(response.data);
      } catch (error) {
        console.error("Unable to get students");
      }
    }
    getAllStudents();
  }, [])

  useEffect(() => {
    const loadProposalContent = async () => {
      if (isProposal && selectedData && selectedData.proposal) {
        try {
          const response = await axios.get(`${RootAPI}/public/${selectedData.proposal}`, {
            responseType: 'text',
          });
          setEditorData(response.data);
        } catch (error) {
          console.error("Error loading proposal:", error);
        }
      }
    };
    
    if (open && isProposal) {
      loadProposalContent();
    } else {
      setEditorData(null);
      setBlob(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProposal])

  const fileInputRef = useRef();

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop().toLowerCase();

    if (fileExt === "docx") {
      await handleDocx(file);
    } else if (fileExt === "pdf") {
      await handlePdf(file);
    } else {
      setIsSuccessful(false);
      setAlertMessage("Only .docx files are supported.");
      setOpenError(true);
    }
  };

  const handleDocx = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value.trim();
        const newblob = new Blob([html], { type: "text/html" });
        setBlob(newblob);
        console.log("DOCX to HTML success");
      } catch (err) {
        console.error("DOCX conversion error:", err);
        setIsSuccessful(false);
        setAlertMessage("Failed to convert .docx to HTML.");
        setOpenError(true);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handlePdf = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const typedArray = new Uint8Array(e.target.result);
      try {
        const pdf = await getDocument({ data: typedArray }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item) => item.str);
          fullText += `<p>${strings.join(" ")}</p>`;
        }

        const htmlBlob = new Blob([fullText], { type: "text/html" });
        setBlob(htmlBlob);
        console.log("PDF to HTML success");
      } catch (err) {
        console.error("PDF conversion error:", err);
        setIsSuccessful(false);
        setAlertMessage("Failed to convert PDF to HTML.");
        setOpenError(true);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if (blob && isRequest) {
      const error = validateNewEvent();
      if (!error) {
        handleAddEvent();
      } else {
        setIsSuccessful(false);
        setAlertMessage(error);
        setOpenError(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validateNewEvent = () => {
    if (!newName) return "Please enter a name.";
    if (isRequest && !blob) return "Please propose a event";
    if (!isRequest && !newMessage) return "Please enter message.";
    if (!newSchedDate) return "Please select a schedule date.";
    if (newSchedDate < new Date()) return "Scheduled time cannot be in the past.";
    if (newSchedDate.getHours() < 7) return "Scheduled time cannot be before 7 AM.";
    if (newSchedDate.getHours() > 18) return "Scheduled time cannot be after 6 PM.";
    return null; // no error
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

  useEffect(() => {
    if (!open) {
      setEditorData(null);
      setNewName('');
      setNewMessage('');
      setIsProposal(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!openConfirmTrash) {
      setEditorData(null);
      setNewName('');
      setNewMessage('');
      setIsProposal(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openConfirmTrash]);

  return (
    <>
      {/* Modal for actions */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth={`${((isRequest && actionState === 4) || isProposal) ? "md" : "sm"}`} 
        fullWidth 
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "white",
            color: "#000",
            borderRadius: "25px",
          },
        }}
        key={editorData ? editorData : 'empty'}
      >
        {actionState === 4 ? (
          // Modal for adding a new event (admin-created)
          <>
            <DialogTitle className="bg-[#b7cde3] relative">
              {isRequest ? "Proposing Event" : "Walk In Appointment"}
              <DialogActions className="absolute -top-1 right-0">
                <IconButton onClick={() => setOpen(false)} className="rounded-full ">
                  <Close sx={{ fontSize: 40, color: 'black' }}></Close>
                </IconButton>
              </DialogActions>
            </DialogTitle>
            <DialogContent className="mt-2 font-roboto">
              <p className="mt-3 font-roboto font-bold">{isRequest ? "Event Name" : "Student Name"}</p>
              {isRequest ? (
                <TextField
                  fullWidth
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& input": {
                        color: "#000", 
                        bgcolor: "#e8e9eb",
                        borderRadius: "20px",
                      },
                      "& fieldset": {
                        borderRadius: "20px", 
                      },
                    },
                  }}
                />
              ) : (
                <>
                  <Autocomplete
                    freeSolo
                    options={students.map((student) => `${student.firstName} ${student.lastName}`)}
                    value={newName}
                    onChange={(event, newValue) => setNewName(newValue || '')}
                    onInputChange={(event, newInputValue) => setNewName(newInputValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Student Name"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#e8e9eb",
                            borderRadius: "20px",
                            "& fieldset": {
                              borderRadius: "20px",
                            },
                          },
                        }}
                      />
                    )}
                    sx={{
                      "& .MuiAutocomplete-listbox": {
                        maxHeight: "100px",
                        backgroundColor: "white",
                        "& .MuiAutocomplete-option": {
                          '&:hover': {
                            backgroundColor: "#f3f4f6",
                          },
                          '&[aria-selected="true"]': {
                            backgroundColor: "#e5e7eb",
                          },
                        },
                      },
                    }}
                  />
                </>
              )}
              {isRequest ? (
                <>
                  <p className="mt-3 font-roboto font-bold">Proposal or Insert Proposal</p>
                  <p className="font-roboto text-sm">(Inserting proposal(.docx) ensure file is final and requires propose date before submitting)</p>
                  <RichTextEditor setBlob={setBlob} />
                </>
              ) : (
              <>
                <p className="mt-3 font-roboto font-bold">Message</p>
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
              </>
              )}
              <p className="mt-3 font-roboto font-bold">{isRequest ? "Propose Date & Time" : "Walk In Date & Time"}</p>
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
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        ...params.inputProps,
                        readOnly: true,
                      }}
                    />
                  )}
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
              <Button onClick={() => setOpen(false)}>
                <p className="text-base font-roboto font-bold text-[#64748b] p-2">Back</p>
              </Button>
              {isRequest &&
                <>
                  <input
                    type="file"
                    //accept=".docx,.pdf"
                    accept=".docx"
                    onChange={handleUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                
                  <Button onClick={handleUploadButtonClick} className="py-20 px-10" disabled={loading}>
                    <p className="text-base bg-[#60a5fa] py-2 px-4 text-white rounded-full">
                      {loading ? "Inserting" : "Insert Proposal"}
                    </p>
                  </Button>
                </>
              }
              <Button
                onClick={() => {
                  const error = validateNewEvent();
                  if (error) {
                    setIsSuccessful(false);
                    setAlertMessage(error);
                    setOpenError(true);
                    return;
                  }
                  handleAddEvent();
                }}
                className="py-20 px-10"
                disabled={loading}
              >
                <p className="text-base bg-[#60a5fa] py-2 px-4 text-white rounded-full">
                  {loading ? isRequest ? "Proposing..." : "Scheduling..." : isRequest ? "Propose Event" : "Walk In"}
                </p>
              </Button>
            </DialogActions>
          </>
        ) : actionState === 3 ? (
          // View-only mode: show details with a Close button
          <>
            <DialogTitle className="bg-[#b7e3cc] relative">
              {isProposal ? "Event Details" : "Schedule Details"}
              <DialogActions className="absolute -top-1 right-0">
                <IconButton onClick={() => setOpen(false)} className="rounded-full ">
                  <Close sx={{ fontSize: 40, color: 'black' }}></Close>
                </IconButton>
              </DialogActions>
            </DialogTitle>
            <div className="bg-white w-[95%] mx-auto my-1 rounded-xl">
              <DialogContent className={`${!isProposal && "text-center"}`}>
                {isProposal ? (
                  <>
                    <p className="mt-3 font-roboto font-bold">Proposal Name: {selectedData.name}</p>
                    <p className="mt-3 font-roboto font-bold">Proposed Schedule: {formatScheduleDate(selectedData.sched_date)}</p>
                    <RichTextEditor editorData={editorData} readOnly={true}/>
                    {selectedData.comment && (
                      <>
                        <p className="mt-3 font-roboto font-bold">Comment</p>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          value={selectedData.comment}
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
                          disabled={true}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <div className="font-roboto" style={{ fontSize: "1.2rem", padding: "10px" }}>
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
              <DialogActions>
                <Button onClick={() => setOpen(false)}>
                  <p className="text-base font-roboto font-bold text-[#64748b] p-2">Back</p>
                </Button>
              </DialogActions>
            </div>
          </>
        ) : actionState === 6 || actionState === 7 ? (
          <>
            <DialogTitle className={`
              ${actionState === 6 ? "bg-[#b7e3cc]" : "bg-[#e3b7b7]"}
              relative`}
            >
              {isProposal && actionState === 6 ? "Repropose Event" : isProposal && actionState !== 6 ? "Delete Event Permanently" : actionState === 6 ? "Restore Appointment" : "Delete Appointment Permanently"}
            </DialogTitle>
            <DialogContent className={`${!isProposal && "text-center"}`}>
              {isProposal ? (
                <>
                  <p className="mt-3 font-roboto font-bold">Proposal Name: {selectedData.name}</p>
                  <p className="mt-3 font-roboto font-bold">Proposed Schedule: {formatScheduleDate(selectedData.sched_date)}</p>
                  <RichTextEditor setBlob={actionState === 6 && isProposal ? setBlob : null} editorData={editorData} readOnly={true}/>
                  {selectedData.comment && (
                    <>
                      <p className="mt-3 font-roboto font-bold">Comment</p>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={selectedData.comment}
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
                        disabled={true}
                      />
                    </>
                  )}
                  <div className="w-[95%] m-auto">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        label="Select New Date & Time"
                        value={selectedDate || initialSchedDate}
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
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            onKeyDown={(e) => e.preventDefault()}         // Block all key presses
                            onPaste={(e) => e.preventDefault()}           // Block pasting
                            inputProps={{
                              ...params.inputProps,
                              readOnly: true,                             // Prevent direct typing
                              style: { cursor: 'pointer' },               // Show pointer cursor
                            }}
                          />
                        )}
                        slots={{ textField: TextField }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            margin: "normal",
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </>
              ) : (
                <div className="font-roboto" style={{ fontSize: "1.2rem", padding: "10px" }}>
                  <p>Are you sure you want to {actionState === 6 ? "restore event" : "delete permanently"} this appointment?</p>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>
                <p className="text-base font-roboto font-bold text-[#64748b] p-2">Cancel</p>
              </Button>
              <Button 
                sx={{
                  paddingX: "3rem",
                  bgcolor: `${actionState === 6 ? "#60a5fa" :  "#ef4444"}`,
                  color: "white",
                  borderRadius: "100px",
                  marginRight: "1rem",
                }}
                color={actionState === 6 ? "secondary" : "primary"} onClick={handleSave}
                disabled={loading}
              >
                {loading ? actionState === 6 ? "Restoring..." : "Deleting..." : actionState === 6 ? "Restore" : "Delete"}
              </Button>
            </DialogActions>
          </>
        ) : (
          // Action mode for Cancel, Reschedule, or Mark Complete
          <>
            <DialogTitle className={`
              ${actionState === 1 && "bg-[#ffde59]"}
              ${actionState === 0 && "bg-[#e3b7b7]"}
              ${actionState === 2 && "bg-[#b7e3cc]"}
              relative`}
            >
              {actionState === 0
                ? "Cancelling Schedule"
                : (actionState === 1 && isProposal) ? 
                  "Reproposing Event"  
                :  (actionState === 2 && isProposal) ?
                  "Marking Event Complete" 
                : actionState === 1
                ? "Rescheduling"
                : "Mark Complete"}
              <DialogActions className="absolute -top-1 right-0">
                <IconButton onClick={() => setOpen(false)} className="rounded-full ">
                  <Close sx={{ fontSize: 40, color: 'black' }}></Close>
                </IconButton>
              </DialogActions>
            </DialogTitle>
            <div className="bg-white w-[95%] mx-auto my-1 rounded-xl">
              <DialogContent className="text-center">
                {isProposal ? (
                  <>
                    <p className="mt-3 font-roboto font-bold">Proposal Name: {selectedData.name}</p>
                    <p className="mt-3 font-roboto font-bold">Proposed Schedule: {formatScheduleDate(selectedData.sched_date)}</p>
                    <RichTextEditor 
                      setBlob={(actionState === 1 && selectedData.status !== 'Scheduled') ? setBlob : null} 
                      editorData={editorData} 
                      readOnly={actionState !== 1 || selectedData.status === 'Scheduled'}
                    />
                    {selectedData.comment && (
                      <>
                        <p className="mt-3 font-roboto font-bold">Comment</p>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          value={selectedData.comment}
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
                          disabled={true}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <div className="font-roboto"style={{ fontSize: "1.2rem", padding: "10px" }}>
                    <p className="mb-4 text-gray-500">Are you sure you want to cancel this Name/Event Schedule</p>
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
                      value={selectedDate || initialSchedDate}
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
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          onKeyDown={(e) => e.preventDefault()}         // Block all key presses
                          onPaste={(e) => e.preventDefault()}           // Block pasting
                          inputProps={{
                            ...params.inputProps,
                            readOnly: true,                             // Prevent direct typing
                            style: { cursor: 'pointer' },               // Show pointer cursor
                          }}
                        />
                      )}
                      slots={{ textField: TextField }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          margin: "normal",
                        },
                      }}
                    />
                  </LocalizationProvider>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)}>
                  <p className="text-base font-roboto font-bold text-[#64748b] p-2">Back</p>
                </Button>
                <Button
                  onClick={() => {
                    if (actionState === 1 && !selectedDate) {
                      setIsSuccessful(false);
                      setAlertMessage("Please select a date.");
                      setOpenError(true);
                      return;
                    }
                    if (isProposal && actionState === 1 && !blob) {
                      setIsSuccessful(false);
                      setAlertMessage("Please insert the proposal document.");
                      setOpenError(true);
                      return;
                    }
                    handleSave();
                  }}
                  sx={{
                    paddingX: "3rem",
                    bgcolor: actionState === 0 ? "#ed4040" : actionState === 1 ? "#ffde59" : "#ef4444",
                    color: "white",
                    borderRadius: "100px",
                  }}
                  disabled={loading}
                >
                  {loading ? 
                    (actionState === 0
                    ? "Cancelling..."
                    : actionState === 1
                    ? "Rescheduling..."
                    : "Marking Complete...")

                    : (actionState === 0
                    ? "Cancel Schedule"
                    : actionState === 1
                    ? "Reschedule"
                    : "Mark Complete")}
                </Button>
              </DialogActions>
            </div>    
          </>
        )}
      </Dialog>

      {/* Trash Confirmation Dialog */}
      <Dialog 
        open={openConfirmTrash} 
        onClose={() => setOpenConfirmTrash(false)} 
        maxWidth={isProposal ? "md" :"sm"}
        fullWidth 
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "white",
            color: "#000",
            borderRadius: "25px",
          },
        }}
      >
        <DialogTitle className="bg-[#e3b7b7] relative">
          Move to Trash
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={() => setOpenConfirmTrash(false)} className="rounded-full ">
              <Close sx={{ fontSize: 40, color: 'black' }}></Close>
            </IconButton>
          </DialogActions>
        </DialogTitle>
        <div className="bg-white w-[95%] mx-auto my-1 rounded-xl">
          <DialogContent className="text-center font-roboto" style={{ fontSize: '1.2rem'}}>
            {isProposal ? (
              <>
                <p className="mt-3 font-roboto font-bold">Proposal Name: {selectedData.name}</p>
                <p className="mt-3 font-roboto font-bold">Proposed Schedule: {formatScheduleDate(selectedData.sched_date)}</p>
                <RichTextEditor editorData={editorData} readOnly={true}/>
                {selectedData.comment && (
                  <>
                    <p className="mt-3 font-roboto font-bold">Comment</p>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={selectedData.comment}
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
                      disabled={true}
                    />
                  </>
                )}
              </>
            ) : (
              <div>
                <p className="mb-2 text-gray-500">Are you sure you want to move this event to trash?</p>
                <p><strong>Name/Event:</strong> {selectedData.name}</p>
                <p>
                  <strong>Date & Time:</strong> {selectedData.sched_date ? format(new Date(String(selectedData.sched_date)), "MM/dd/yyyy h:mm a") : "N/A"}
                </p>
                <p><strong>Message:</strong> {selectedData.message}</p>
                <p><strong>Status:</strong> {selectedData.status}</p>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirmTrash(false)}>
              <p className="text-base font-roboto font-bold text-[#64748b] p-2">Back</p>
            </Button>
            <Button 
              onClick={handleSave} 
              sx={{
                paddingX: "3rem",
                bgcolor: "#ef4444",
                color: "white",
                borderRadius: "100px",
              }}
              disabled={loading}
            >
              <p>{loading ? "Moving to Trash..." : "Move to Trash"}</p>
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </>
  );
}