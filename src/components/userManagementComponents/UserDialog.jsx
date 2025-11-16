import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { Close } from "@mui/icons-material"
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.css";
import * as XLSX from "xlsx";
import Papa from "papaparse";

const UserDialog = ({
  isModalOpen,
  handleModalClose,
  isEditMode,
  tab,
  newStudent,
  newStaff,
  handleInputChange,
  handleFormSubmit,
  bulkUploadOpen,
  setBulkUploadOpen,
  handleBulkUpload,
  handleBulkDelete,
  OpenBulkDelete,
  setOpenBulkDelete,
  checked,
  students,
  handleDeleteButtonClick,
  selectedStudent,
  setSelectedStudent,
  openDeleteModal,
  setOpenDeleteModal,
  isViewMode,
  staffs,
  loading,
  setOpenError,
  setIsSuccessful,
  setAlertMessage,
}) => {
  const [data, setData] = useState([]);
  const [colWidths, setColWidths] = useState([]);
  const [isTableValid, setIsTableValid] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const fileInputRef = useRef(null);
  const hotRef = useRef(null);
  const staff = JSON.parse(localStorage.getItem("staff") || "{}");
  const isAdviser = staff.position === "Adviser";

  const columnHeaders = useMemo(() => (
    tab === 0 ? ["Email", "First Name", "Last Name", "Section"] : ["Email", "Name", "Section"]
  ), [tab]);

  useEffect(() => {
    const colCount = tab === 0 ? 4 : 3;
    const newRow = Array(colCount).fill("");
    setData([newRow]);
    setIsTableValid(true);
  }, [tab]);

  const calculateColWidths = useCallback(() => {
    if (typeof window === "undefined") return [];
    const modalWidth = window.innerWidth * 0.56;
    const padding = 32;
    const availableWidth = modalWidth - padding;
    const columnCount = columnHeaders.length;
    return Array(columnCount).fill(Math.max(availableWidth / columnCount, 120));
  }, [columnHeaders.length]);

  useEffect(() => {
    setColWidths(calculateColWidths());
    const handleResize = () => setColWidths(calculateColWidths());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [columnHeaders.length, calculateColWidths]);

  const handleDataChange = (changes, source) => {
    if (changes && source !== "loadData") {
      const newData = [...data];
      let shouldAddRow = false;
  
      changes.forEach(([row, col, , newVal]) => {
        newData[row] = newData[row] || Array(columnHeaders.length).fill("");
        newData[row][col] = newVal;
  
        if (row === newData.length - 1 && newData[row].every(cell => cell !== "")) {
          shouldAddRow = true;
        }
      });
  
      if (shouldAddRow) newData.push(Array(columnHeaders.length).fill(""));
      setData(newData);
      validateTable(newData);
    }
  };

  const validateName = (name) => {
    // Only letters, spaces, hyphens, and apostrophes allowed
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    return nameRegex.test(name) && name.trim().length > 0;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkDuplicateEmail = (email, existingData, currentId = null) => {
    return existingData.some(item => 
      item.email.toLowerCase() === email.toLowerCase() && 
      item.id !== currentId
    );
  };

  const validateTable = (tableData) => {
    let valid = true;
  
    for (let i = 0; i < tableData.length; i++) {
      const row = tableData[i];
      const hasAnyInput = row.some(cell => cell && cell.trim() !== '');
  
      if (!hasAnyInput) continue;
  
      for (let j = 0; j < row.length; j++) {
        const cellValue = row[j]?.trim() || "";
  
        if (cellValue === "") {
          valid = false;
          break;
        }
  
        const emailCol = 0;
        if (j === emailCol && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cellValue)) {
          valid = false;
          break;
        }
      }
      if (!valid) break;
    }
  
    setIsTableValid(valid);
  };

  // Update the handleConfirmUpload function
  const handleConfirmUpload = () => {
    const trimmedData = data.filter(row => Array.isArray(row) && row.some(cell => cell && cell.trim() !== "")); 

    if (trimmedData.length === 0) {
      setAlertMessage("No valid data to upload.");
      setIsSuccessful(false);
      setOpenError(true);
      return;
    }

    // Validate bulk data
    const errors = [];
    const validRows = [];
    const existingEmails = new Set(
      (tab === 0 ? students : staffs).map(item => item.email.toLowerCase())
    );
    const uploadEmails = new Set();

    trimmedData.forEach((row, index) => {
      const rowNumber = index + 1;
      const rowErrors = [];

      if (tab === 0) {
        // Student validation
        const [email, firstName, lastName, section] = row;

        // Validate email
        if (!email || !validateEmail(email)) {
          rowErrors.push(`Invalid email format`);
        } else {
          const emailLower = email.toLowerCase();
          if (existingEmails.has(emailLower)) {
            rowErrors.push(`Email already exists in the system`);
          } else if (uploadEmails.has(emailLower)) {
            rowErrors.push(`Duplicate email in upload`);
          } else {
            uploadEmails.add(emailLower);
          }
        }

        // Validate first name
        if (!firstName || !validateName(firstName)) {
          rowErrors.push(`Invalid first name (only letters, spaces, hyphens, apostrophes allowed)`);
        }

        // Validate last name
        if (!lastName || !validateName(lastName)) {
          rowErrors.push(`Invalid last name (only letters, spaces, hyphens, apostrophes allowed)`);
        }

        // Validate section exists
        if (!section) {
          rowErrors.push(`Section is required`);
        } else {
          const sectionExists = filteredAdvisers.some(adviser => adviser.section === section);
          if (!sectionExists) {
            rowErrors.push(`Section "${section}" does not exist`);
          }
        }
      } else {
        // Adviser validation
        const [email, name, section] = row;

        // Validate email
        if (!email || !validateEmail(email)) {
          rowErrors.push(`Invalid email format`);
        } else {
          const emailLower = email.toLowerCase();
          if (existingEmails.has(emailLower)) {
            rowErrors.push(`Email already exists in database`);
          } else if (uploadEmails.has(emailLower)) {
            rowErrors.push(`Duplicate email in upload`);
          } else {
            uploadEmails.add(emailLower);
          }
        }

        // Validate name
        if (!name || !validateName(name)) {
          rowErrors.push(`Invalid name (only letters, spaces, hyphens, apostrophes allowed)`);
        }

        // Validate section
        if (!section) {
          rowErrors.push(`Section is required for advisers`);
        }
      }

      if (rowErrors.length > 0) {
        errors.push(`Row ${rowNumber}: ${rowErrors.join(', ')}`);
      } else {
        validRows.push(row);
      }
    });

    if (errors.length > 0) {
      const errorMessage = `Bulk upload failed:\n\n${errors.join('\n')}`;
      setAlertMessage(errorMessage);
      setIsSuccessful(false);
      setOpenError(true);
      return;
    }

    if (validRows.length === 0) {
      setAlertMessage("No valid rows to upload after validation.");
      setIsSuccessful(false);
      setOpenError(true);
      return;
    }

    handleBulkUpload(validRows, columnHeaders);
    setBulkUploadOpen(false);
    setData([]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isCSV = file.name.endsWith('.csv');

    reader.onload = (event) => {
      const content = event.target.result;
      let parsedData = [];

      if (isCSV) {
        parsedData = Papa.parse(content, {
          skipEmptyLines: true,
          header: false,
        }).data;
      } else if (isExcel) {
        const workbook = XLSX.read(content, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      } else {
        setAlertMessage("Unsupported file type. Please upload a CSV or Excel file.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      const [, ...withoutHeader] = parsedData;
      const cleaned = withoutHeader.filter(row =>
        Array.isArray(row) && row.some(cell => cell?.toString().trim() !== '')
      );

      if (cleaned.length === 0) {
        setAlertMessage("No valid rows found in the file.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      const newData = [...data];
      let insertIndex = 0;

      for (let i = 0; i < newData.length; i++) {
        const isEmpty = newData[i].every(cell => !cell || cell.toString().trim() === '');
        if (isEmpty) {
          insertIndex = i;
          break;
        }
      }

      cleaned.forEach((row, idx) => {
        const paddedRow = [...row].slice(0, columnHeaders.length);
        while (paddedRow.length < columnHeaders.length) {
          paddedRow.push("");
        }
        newData[insertIndex + idx] = paddedRow;
      });

      const requiredLength = insertIndex + cleaned.length;
      while (newData.length <= requiredLength) {
        newData.push(Array(columnHeaders.length).fill(""));
      }

      setData(newData);
    };

    if (isCSV) {
      reader.readAsText(file);
    } else if (isExcel) {
      reader.readAsBinaryString(file);
    } else {
      setAlertMessage("No valid rows found in the file.");
      setIsSuccessful(false);
      setOpenError(true);
    }

    e.target.value = null;
  };

  const filteredAdvisers = staffs.filter((staff) => staff.position === "Adviser");

  const convertToCSV = (data, headers) => {
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    data.forEach(row => {
      const values = row.map(cell => {
        const value = cell || '';
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportHotTableToCSV = (hotInstance, columnHeaders, filename = tab === 0
    ? "Mind-U Bulk Creation Students Draft.csv"
    : "Mind-U Bulk Creation Advisers Draft.csv") => {
    
    const allData = hotInstance.getData();
    
    const dataRows = allData.filter(row =>
      Array.isArray(row) && row.some(cell => cell && cell.toString().trim() !== "")
    );

    if (dataRows.length === 0) {
      setAlertMessage("No data to export.");
      setIsSuccessful(false);
      setOpenError(true);
      return;
    }

    const csvContent = convertToCSV(dataRows, columnHeaders);
        
    const currentDate = new Date().toISOString().split('T')[0];
    const finalFilename = `${filename.replace(".csv", "")}_${currentDate}.csv`;

    downloadCSV(csvContent, finalFilename);
  };

  const handleFormSubmitting = (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (tab === 0) {
      // Validate first name
      if (!newStudent.firstName) {
        setAlertMessage("First name is required.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }
      if (!validateName(newStudent.firstName)) {
        setAlertMessage("First name can only contain letters, spaces, hyphens, and apostrophes.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      // Validate last name
      if (!newStudent.lastName) {
        setAlertMessage("Last name is required.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }
      if (!validateName(newStudent.lastName)) {
        setAlertMessage("Last name can only contain letters, spaces, hyphens, and apostrophes.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      // Validate section
      if (!newStudent.section) {
        setAlertMessage("Section is required.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      // Check if section exists (has an adviser)
      const sectionExists = filteredAdvisers.some(adviser => adviser.section === newStudent.section);
      if (!sectionExists && !isAdviser) {
        setAlertMessage(`Section "${newStudent.section}" does not exist. Please select a valid section.`);
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      // Validate email
      if (!newStudent.email) {
        setAlertMessage("Email is required.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }
      if (!validateEmail(newStudent.email)) {
        setAlertMessage("Invalid email format (e.g. name@domain.com)");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      // Check for duplicate email
      if (checkDuplicateEmail(newStudent.email, students, newStudent.id)) {
        setAlertMessage("This email is already registered to another student.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }
    } else {
      // Validate name
      if (!newStaff.name) {
        setAlertMessage("Name is required.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }
      if (!validateName(newStaff.name)) {
        setAlertMessage("Name can only contain letters, spaces, hyphens, and apostrophes.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      // Validate position
      if (!newStaff.position) {
        setAlertMessage("Position is required.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      // Validate section (ONLY for Advisers)
      if (newStaff.position === "Adviser" && !newStaff.section) {
        setAlertMessage("Section is required for advisers.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      // Validate email
      if (!newStaff.email) {
        setAlertMessage("Email is required.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }
      if (!validateEmail(newStaff.email)) {
        setAlertMessage("Invalid email format (e.g. name@domain.com)");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      // Check for duplicate email in ALL staff (advisers + guidance staff)
      if (checkDuplicateEmail(newStaff.email, staffs, newStaff.id)) {
        setAlertMessage("This email is already registered to another staff member.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      // Additional validation: Prevent duplicate section for Advisers
      if (newStaff.position === "Adviser" && !isEditMode) {
        const sectionExists = staffs.some(
          staff => staff.position === "Adviser" && 
          staff.section === newStaff.section &&
          staff.id !== newStaff.id
        );

        if (sectionExists) {
          setAlertMessage(`Section "${newStaff.section}" already has an assigned adviser.`);
          setIsSuccessful(false);
          setOpenError(true);
          return;
        }
      }
    }

    handleFormSubmit();
  };

  useEffect(() => {
    setFormSubmitted(false);
  }, [isModalOpen, isEditMode]);
  
  return (
    <>
      <Dialog
        open={isModalOpen}
        onClose={() => {handleModalClose(); setFormSubmitted(false)}}
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "white",
            color: "#000",
            borderRadius: "25px",
          },
        }}
      >
        <DialogTitle className="bg-[#b7cde3] relative">
          <p className="font-bold">
            {`${isEditMode ? "Edit" : isViewMode ? "View" : "Add"} ${
              tab === 0 ? "Student" : tab === 1 ? "Adviser" : "Guidance Staff"
            }`}
          </p>
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={handleModalClose} className="rounded-full">
              <Close sx={{ fontSize: 40, color: "black" }} />
            </IconButton>
          </DialogActions>
        </DialogTitle>
          
        <DialogContent>
          {tab === 0 ? (
            <>
              <h1 className="mt-3 text-lg font-medium">First Name</h1>
              <TextField
                autoFocus
                margin="dense"
                name="firstName"
                type="text"
                fullWidth
                variant="outlined"
                value={newStudent.firstName}
                onChange={(e) => {
                  setFormSubmitted(false);
                  handleInputChange(e);
                }}
                error={formSubmitted && !newStudent.firstName}
                helperText={
                  !isViewMode && formSubmitted && !newStudent.firstName && "Input is required"
                }
                disabled={isViewMode}
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "black",
                    color: "black",
                  }
                }}
              />
              <h1 className="text-lg font-medium">Last Name</h1>
              <TextField
                margin="dense"
                name="lastName"
                type="text"
                fullWidth
                variant="outlined"
                value={newStudent.lastName}
                onChange={(e) => {
                  setFormSubmitted(false);
                  handleInputChange(e);
                }}
                error={formSubmitted && !newStudent.lastName}
                helperText={
                  !isViewMode && formSubmitted && !newStudent.lastName && "Input is required"
                }
                disabled={isViewMode}
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "black",
                    color: "black",
                  }
                }}
              />
              <h1 className="text-lg font-medium">Section</h1>
              <FormControl
                fullWidth
                margin="dense"
                variant="outlined"
                error={formSubmitted && !newStudent.section}
                disabled={isViewMode}
              >
                {isAdviser ? (
                  <Select
                    value={staff.section}
                    disabled
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                        color: "black",
                      },
                    }}
                  >
                    <MenuItem value={staff.section}>{staff.section}</MenuItem>
                  </Select>
                ) : (
                  <Select
                    labelId="section-label"
                    name="section"
                    value={newStudent.section}
                    onChange={(e) => {
                      setFormSubmitted(false);
                      handleInputChange(e);
                    }}
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                        color: "black",
                      },
                    }}
                  >
                    {filteredAdvisers.map((adviser) => (
                      <MenuItem key={adviser.id} value={adviser.section}>
                        {adviser.section}
                      </MenuItem>
                    ))}
                  </Select>
                )}
                {
                  !isViewMode && formSubmitted && !newStudent.section && (
                    <FormHelperText>Input is required</FormHelperText>
                  )
                }
              </FormControl>
              {isViewMode && (
                <>
                  <h1 className="text-lg font-medium">Adviser</h1>
                  <TextField
                    margin="dense"
                    name="adviser"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={newStudent.adviser}
                    disabled={isViewMode}
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                        color: "black",
                      }
                    }}
                  />
                </>
                )}
              <h1 className="text-lg font-medium">Email</h1>
              <TextField
                margin="dense"
                name="email"
                type="email"
                fullWidth
                variant="outlined"
                value={newStudent.email}
                onChange={(e) => {
                  setFormSubmitted(false);
                  handleInputChange(e);
                }}
                error={
                  formSubmitted && (
                    !newStudent.email ||
                    (newStudent.email !== "" && !/@.+\..+/.test(newStudent.email))
                  )
                }
                helperText={
                  !isViewMode && formSubmitted && (
                    newStudent.email !== "" && !/@.+\..+/.test(newStudent.email)
                      ? "Invalid email format (eg. name.domain.com)"
                      : !newStudent.email && "Input is required"
                  )
                }
                required
                disabled={isViewMode}
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "black",
                    color: "black",
                  }
                }}
              />
            </>
          ) : (
            <>
              <h1 className="text-lg font-medium">Name</h1>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                type="text"
                fullWidth
                variant="outlined"
                value={newStaff.name}
                onChange={(e) => {
                  setFormSubmitted(false);
                  handleInputChange(e);
                }}
                error={formSubmitted && !newStaff.name}
                helperText={
                  !isViewMode && formSubmitted && !newStaff.name && "Input is required"
                }
                disabled={isViewMode}
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "black",
                    color: "black",
                  }
                }}
              />
              <h1 className="text-lg font-medium">Position</h1>
              {tab === 1 ? (
                <>
                  <Select
                    margin="dense"
                    name="position"
                    value={newStaff.position}
                    fullWidth
                    variant="outlined"
                    disabled={true}
                  >
                    <MenuItem value="Adviser">Adviser</MenuItem>
                  </Select>
                  <h1 className="text-lg font-medium">Section</h1>
                  <TextField
                    margin="dense"
                    name="section"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={newStaff.section}
                    onChange={(e) => {
                      setFormSubmitted(false);
                      handleInputChange(e);
                    }}
                    helperText={
                      !isViewMode && formSubmitted && !newStaff.section && "Input is required"
                    }
                    disabled={isViewMode}
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                        color: "black",
                      }
                    }}
                  />
                </>
              ) : (
                <FormControl
                  margin="dense"
                  fullWidth
                  error={formSubmitted && !newStaff.position}
                  disabled={isViewMode}
                  variant="outlined"
                  sx={{
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "black",
                      color: "black",
                    }
                  }}
                >
                  <Select
                    name="position"
                    value={newStaff.position}
                    onChange={(e) => {
                      setFormSubmitted(false);
                      handleInputChange(e);
                    }}
                    displayEmpty
                  >
                    <MenuItem value="" disabled hidden>Select position</MenuItem>
                    <MenuItem value="Guidance Staff">Guidance Staff</MenuItem>
                    {staff.position === "Admin" && 
                      <MenuItem value="Guidance Counselor">Guidance Counselor</MenuItem>
                    }
                  </Select>
                  
                  {!isViewMode && formSubmitted && !newStaff.position && (
                    <FormHelperText>Input is required</FormHelperText>
                  )}
                </FormControl>
              )}
              <h1 className="text-lg font-medium">Email</h1>
              <TextField
                margin="dense"
                name="email"
                type="email"
                fullWidth
                variant="outlined"
                value={newStaff.email}
                onChange={(e) => {
                  setFormSubmitted(false);
                  handleInputChange(e);
                }}
                error={formSubmitted && (
                  !newStaff.email ||
                  (newStaff.email !== "" && !/@.+\..+/.test(newStaff.email))
                )}
                helperText={
                  !isViewMode && formSubmitted && (
                    newStaff.email !== "" && !/@.+\..+/.test(newStaff.email)
                      ? "Invalid email format (eg. name.domain.com)"
                      : !newStaff.email && "Input is required"
                  )
                }
                required
                disabled={isViewMode}
                sx={{
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "black",
                    color: "black",
                  }
                }}
              />
              {(!isViewMode && isEditMode) && (
                <>
                  <h1 className="text-lg font-medium">Password {isEditMode && <p className="text-sm text-gray-500">(Leave blank if no changes)</p>}</h1>
                  <TextField
                    margin="dense"
                    name="password"
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={newStaff.password}
                    onChange={(e) => {
                      setFormSubmitted(false);
                      handleInputChange(e);
                    }}
                    error={formSubmitted && (!isEditMode && !newStaff.password)}
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                        color: "black",
                      }
                    }}
                  />
                </>
              )}
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <button onClick={handleModalClose}>
            <p className="text-base font-roboto font-bold text-[#64748b] p-2">Cancel</p>
          </button>
          {isViewMode ? null : (
            <button 
              onClick={handleFormSubmitting}
              disabled={loading}
            >
              <p className={`text-white text-lg rounded-3xl px-8 py-1 bg-[#60a5fa] ${loading && "opacity-50"}`}>
                {loading ? isEditMode ? "Saving..." : "Adding..." : isEditMode ? "Save" : "Add"}
              </p>
            </button>
          )}
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog 
        open={bulkUploadOpen} 
        onClose={() => setBulkUploadOpen(false)} 
        maxWidth="md" 
        fullWidth 
        sx={{ "& .MuiDialog-paper": { 
          width: "61%",
          maxWidth: "none",
          backgroundColor: "white",
          color: "#000",
          borderRadius: "25px",
        } }} 
      >
        <DialogTitle className="bg-[#b7cde3] relative">
          <p className="font-bold">Bulk Creation</p>
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={() => setBulkUploadOpen(false)} className="rounded-full ">
              <Close sx={{fontSize: 40, color: 'black'}}/>
            </IconButton>
          </DialogActions>
        </DialogTitle>
        <DialogContent>
          <div className="my-4 flex flex-rows justify-between mr-8">
            <div className="w-[45%]">
              <p>Write or Copy and paste your spreadsheet data below</p>
              <p>(New rows will be added automatically as needed</p>
              <p>when all cell in last rows is filled)</p>
              <p>You can insert a file by exporting format,</p>
              <p>filling it and inserting the said file</p>
              <p>Follow the guide on how to insert student </p>
            </div>
            <div className="w-[45%] text-end flex flex-col justify-end">
              <p className="text-red-500 font-medium">Red - Cell has Invalid Input </p>
              <p className="text-yellow-400 font-medium">Yellow - Missing column within the filled rows</p>
              <p className="text-red-700 font-bold">Note: Save by drafting if planning to reload page</p>
            </div>
          </div>
          <div className="w-[100%] h-[400px] overflow-y-auto">
          <HotTable
            key={tab}
            data={data}
            ref={hotRef}
            colHeaders={columnHeaders}
            rowHeaders={true}
            manualColumnResize={true}
            manualRowResize={true}
            columnSorting={true}
            contextMenu={true}
            minRows={8}
            minCols={tab === 0 ? 4 : 3}
            maxCols={tab === 0 ? 4 : 3}
            width="100%"
            height="auto"
            stretchH="all"
            colWidths={colWidths}
            licenseKey="non-commercial-and-evaluation"
            afterChange={handleDataChange}
            className="custom-hot-table"
            rowHeights={40}
            copyPaste={{
              enabled: true,
              pasteMode: 'overwrite',
              rowsLimit: 1000,
              columnsLimit: 1000
            }}
            cells={(row, col) => {
              const cellProperties = {
                className: 'htCenter htMiddle',
              };
              
              // Get row data safely
              const rowData = data[row];
              
              // Handle header cells
              if (col === -1 || row === -1) {
                cellProperties.className = 'highlighted-cell';
                return cellProperties;
              }
            
              // Check if rowData exists and is an array
              if (!rowData || !Array.isArray(rowData)) {
                return cellProperties;
              }
            
              // Check if row has any input
              const hasAnyInput = rowData.some(cell => cell && cell.trim() !== '');
              if (!hasAnyInput) {
                return cellProperties;
              }
                          
              // Get cell value safely
              const cellValue = rowData[col] || "";
                          
              // Check if cell is empty when row has input
              if (cellValue.trim() === "") {
                cellProperties.className = 'incomplete-cell';
              }
            
              // Validate email column
              const emailCol = 0;
              if (col === emailCol && cellValue.trim() !== "") {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(cellValue)) {
                  cellProperties.className = (cellProperties.className || '') + ' invalid-email-cell';
                }
              }
            
              return cellProperties;
            }}
            columns={
              tab === 0
                ? [
                    {
                      type: 'text',
                      validator: function (value, callback) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        callback(emailRegex.test(value) || value === '');
                      }
                    },
                    {}, {}, {}, {}
                  ]
                : tab === 1
                && [
                    {
                      type: 'text',
                      validator: function (value, callback) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        callback(emailRegex.test(value) || value === '');
                      }
                    },
                    {}, {}
                  ]
            }
          />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkUploadOpen(false)}>
            <p className="text-base font-roboto font-bold text-[#64748b] p-2">Cancel</p>
          </Button>
          <Button onClick={() => exportHotTableToCSV(hotRef.current.hotInstance, columnHeaders)} disabled={loading}>
            <p className="text-white text-lg rounded-3xl px-8 py-1 bg-green-500">{loading ? "Exporting..." : "Export to CSV"}</p>
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={loading}>
            <p className="text-white text-lg rounded-3xl px-8 py-1 bg-[#60a5fa]">{loading ? "Inserting..." : "Insert From File"}</p>
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              ref={fileInputRef}
              hidden
              onChange={handleFileUpload}
            />
          </Button>
          <Button 
            onClick={() => {
              if (data.length === 1 || !isTableValid)
              {
                setAlertMessage("Empty Table or Invalid Input please check the table again");
                setIsSuccessful(false);
                setOpenError(true);
                return;
              }
              handleConfirmUpload();
            }}
            disabled={loading}
          >
            <p className="text-white text-lg rounded-3xl px-8 py-1 bg-[#60a5fa]">{loading ? "Adding..." : "Confirm Creation"}</p>
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog
        open={OpenBulkDelete}
        onClose={() => setOpenBulkDelete(false)}
        maxWidth="sm"
        sx={{ 
          "& .MuiPaper-root": { 
            color: "#000", 
            borderRadius: "24px", 
            width: "70%", 
            height: "auto",  
            overflowX: "hidden", 
            overflowY: "auto", 
            display: "flex"
          }
        }}
      >
        <DialogTitle className="bg-[#e3b7b7] relative">
          <p className="font-bold">Bulk Delete</p>
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={() => setOpenBulkDelete(false)} className="rounded-full ">
              <Close sx={{fontSize: 40, color: 'black'}}/>
            </IconButton>
          </DialogActions>
        </DialogTitle>
        <DialogContent>
          <div className="justify-center align-middle text-center">
            <p className="font-bold my-5">Are you sure you want to delete the following {tab === 0 ? "student/s" : "staff/s"} ?</p>
            {checked.map((id) => {
              const item = tab === 0 
                ? students.find(s => s.id === id)
                : staffs.find(s => s.id === id);
              
              if (!item) return null;
              
              return tab === 0 
                ? <p key={id}>{item.firstName} {item.lastName}</p>
                : <p key={id}>{item.name}</p>;
            })}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDelete(false)}>
            <p className="text-base font-roboto font-bold text-[#64748b] p-2">Cancel</p>
          </Button>
          <Button onClick={handleBulkDelete} disabled={loading}>
            <p className="text-base bg-[#ef4444] py-2 px-4 text-white rounded-full">{loading ? "Deleting..." : "Delete"}</p>
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog
        open={openDeleteModal}
        onClose={() => {setOpenDeleteModal(false); setSelectedStudent(null)}}
        maxWidth="sm"
        sx={{ 
          "& .MuiPaper-root": { 
            color: "#000", 
            borderRadius: "24px", 
            width: "70%", 
            height: "auto",  
            overflowX: "hidden", 
            overflowY: "auto", 
            display: "flex"
          }
        }}
      >
        <DialogTitle className="bg-[#e3b7b7] relative">
          Delete
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={() => {setOpenDeleteModal(false); setSelectedStudent(null)}} className="rounded-full ">
              <Close sx={{fontSize: 40, color: 'black'}}/>
            </IconButton>
          </DialogActions>
        </DialogTitle>
        <DialogContent>
          <div className="justify-center align-middle text-center">
            <p className="font-bold my-5">Are you sure you want to delete the following {tab === 0 ? "student" : "staff"}?</p>
            {selectedStudent && (tab === 0 ? 
              (<p>{selectedStudent.firstName} {selectedStudent.lastName}</p>) :
              (<p>{selectedStudent.name}</p>))
              }
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)}>
            <p className="text-base font-roboto font-bold text-[#64748b] p-2">Cancel</p>
          </Button>
          <Button
            onClick={() => {
              if (selectedStudent) {
                handleDeleteButtonClick(selectedStudent);
                setOpenDeleteModal(false);
              }
            }}
          >
            <p className="text-base bg-[#ef4444] py-2 px-4 text-white rounded-full">Delete {tab === 0 ? "Student" : "Staff"}</p>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserDialog;