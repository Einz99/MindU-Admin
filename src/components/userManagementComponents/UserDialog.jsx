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
}) => {
  const [data, setData] = useState([]); // start empty
  const [colWidths, setColWidths] = useState([]);
  const [isTableValid, setIsTableValid] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const fileInputRef = useRef(null);
  const hotRef = useRef(null);
  const staff = JSON.parse(localStorage.getItem("staff") || "{}");
  const isAdviser = staff.position === "Adviser";

  // Define column headers dynamically
  const columnHeaders = useMemo(() => (
    tab === 0 ? ["Email", "First Name", "Last Name", "Section"] : ["Email", "Name", "Section"]
  ), [tab]);


  useEffect(() => {
    const colCount = tab === 0 ? 4 : 3;
    const newRow = Array(colCount).fill("");
    setData([newRow]);
    setIsTableValid(true);
  }, [tab]);
  
  useEffect(() => {
  const placeholderRow = tab === 0
    ? ["example@student.com", "John", "Doe", "Section A"]
    : ["example@adviser.com", "Jane Doe", "Section A"]
      

  const isEmptyRow = (row) => row.every(cell => cell === "");
    const isPlaceholder = (row) =>
      JSON.stringify(row) === JSON.stringify(["example@student.com", "John", "Doe", "Section A"]) ||
      JSON.stringify(row) === JSON.stringify(["example@adviser.com", "Jane Doe", "Section A"]);

    if (data.length === 1 && isEmptyRow(data[0])) {
      // Case: blank table — insert placeholder
      setData([placeholderRow, ...data]);
    } else if (data.length >= 1 && isPlaceholder(data[0])) {
      // Case: already has a placeholder — replace it
      const newData = [...data];
      newData[0] = placeholderRow;
      setData(newData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Dynamically calculate column widths based on modal size
  const calculateColWidths = useCallback(() => {
    if (typeof window === "undefined") return []; // Prevent SSR errors

    const modalWidth = window.innerWidth * 0.56; // 55% of the screen width
    const padding = 32; // Account for modal padding
    const availableWidth = modalWidth - padding;
    const columnCount = columnHeaders.length;

    // Ensure each column has a minimum width of 120px
    return Array(columnCount).fill(Math.max(availableWidth / columnCount, 120));
  }, [columnHeaders.length]);

  // Update column widths on mount and window resize
  useEffect(() => {
    setColWidths(calculateColWidths()); // Set initial column widths

    const handleResize = () => setColWidths(calculateColWidths());
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, [columnHeaders.length, calculateColWidths]);

  // Handle data changes and auto-add new rows
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
  
      // Run validation on the whole table
      validateTable(newData);
    }
  };

  const validateTable = (tableData) => {
    let valid = true;
  
    for (let i = 0; i < tableData.length; i++) {
      const row = tableData[i];
      const hasAnyInput = row.some(cell => cell && cell.trim() !== '');
  
      if (!hasAnyInput) continue; // Skip empty rows
  
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
      console.log("Validating row", i, row);
      console.log("isTableValid?", valid);
      if (!valid) break;
    }
  
    setIsTableValid(valid);
  };

  const handleConfirmUpload = () => {
    const trimmedData = data.filter(row => row.some(cell => cell && cell.trim() !== "")); 
  
    if (trimmedData.length === 0) {
      alert("No valid data to upload.");
      return;
    }
  
    handleBulkUpload(trimmedData, columnHeaders);
    setBulkUploadOpen(false);
    setData([tab === 0 ? ["example@student.com", "John", "Doe", "Section A"] : ["example@adviser.com", "Jane Doe", "Section A"]]); // Reset after upload
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
  
    reader.onload = (event) => {
      const content = event.target.result;
      let parsedData = [];
  
      if (isExcel) {
        const workbook = XLSX.read(content, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      } else {
        parsedData = Papa.parse(content, {
          skipEmptyLines: true,
          header: false,
        }).data;
      }
  
      // Skip the header row and remove completely empty rows
      const [, ...withoutHeader] = parsedData;
      const cleaned = withoutHeader.filter(row =>
        row.some(cell => cell?.toString().trim() !== '')
      );
  
      if (cleaned.length === 0) {
        alert("No valid rows found in the file.");
        return;
      }
  
      const newData = [...data];
      let insertIndex = 1;
  
      // Find the first empty row (starting after placeholder)
      for (let i = 1; i < newData.length; i++) {
        const isEmpty = newData[i].every(cell => !cell || cell.toString().trim() === '');
        if (isEmpty) {
          insertIndex = i;
          break;
        }
      }
  
      // Insert cleaned rows
      cleaned.forEach((row, idx) => {
        const paddedRow = [...row].slice(0, columnHeaders.length); // Limit to column count
        while (paddedRow.length < columnHeaders.length) {
          paddedRow.push(""); // Fill missing cells
        }
        newData[insertIndex + idx] = paddedRow;
      });
  
      // Pad table if needed
      const requiredLength = insertIndex + cleaned.length;
      while (newData.length <= requiredLength) {
        newData.push(Array(columnHeaders.length).fill(""));
      }
  
      setData(newData);
    };
  
    if (isExcel) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  
    e.target.value = null; // Reset file input
  };

  const filteredAdvisers = staffs.filter((staff) => staff.position === "Adviser");

  function exportHotTableToExcelWithHeaders(hotInstance, columnHeaders, filename = tab === 0 ? "Mind-U Bulk Creation Students Draft.xlsx" : "Mind-U Bulk Creation Advisers Draft.xlsx") {
    // Get full table data
    const allData = hotInstance.getData();
  
    // Skip first row (your placeholder row)
    const dataRows = allData.slice(1).filter(row =>
      row.some(cell => cell && cell.toString().trim() !== "")
    );
  
    if (dataRows.length === 0) {
      alert("No data to export.");
      return;
    }
  
    // Add headers as the first row
    const exportData = [columnHeaders, ...dataRows];
  
    const worksheet = XLSX.utils.aoa_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  
    XLSX.writeFile(workbook, filename);
  }

  const handleFormSubmitting = (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    // validation already handled by the button's `disabled` logic
    if (tab === 0) {
      // Student Form Validation
      if (!newStudent.firstName) return alert("First name is required.");
      if (!newStudent.lastName) return alert("Last name is required.");
      if (!newStudent.section) return alert("Section is required.");
      if (!newStudent.email) return alert("Email is required.");
      if (!/@.+\..+/.test(newStudent.email)) return alert("Invalid email format (e.g. name@domain.com)");
    } else {
      // Staff Form Validation
      if (!newStaff.name) return alert("Name is required.");
      if (!newStaff.position) return alert("Position is required.");
      if (!newStaff.email) return alert("Email is required.");
      if (!/@.+\..+/.test(newStaff.email)) return alert("Invalid email format (e.g. name@domain.com)");
    }

    handleFormSubmit();
  };

  
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
          {`${isEditMode ? "Edit" : isViewMode ? "View" : "Add"} ${
            tab === 0 ? "Student" : tab === 1 ? "Adviser" : "Guidance Staff"
          }`}
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
                    WebkitTextFillColor: "black", // For Safari
                    color: "black",               // For other browsers
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
                    WebkitTextFillColor: "black", // For Safari
                    color: "black",               // For other browsers
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
                  // Adviser: locked value
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
                  // Admin/Guidance: normal dropdown
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
                        WebkitTextFillColor: "black", // For Safari
                        color: "black",               // For other browsers
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
                    WebkitTextFillColor: "black", // For Safari
                    color: "black",               // For other browsers
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
                    WebkitTextFillColor: "black", // For Safari
                    color: "black",               // For other browsers
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
                        WebkitTextFillColor: "black", // For Safari
                        color: "black",               // For other browsers
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
                      WebkitTextFillColor: "black", // For Safari
                      color: "black",               // For other browsers
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
                    <MenuItem value="Guidance Advocate">Guidance Advocate</MenuItem>
                    <MenuItem value="Guidance Counselor">Guidance Counselor</MenuItem>
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
                    WebkitTextFillColor: "black", // For Safari
                    color: "black",               // For other browsers
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
                        WebkitTextFillColor: "black", // For Safari
                        color: "black",               // For other browsers
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
        onClose={() => {setBulkUploadOpen(false); setData([["example@student.com", "John", "Doe", "Section A"]]);}} 
        maxWidth="md" 
        fullWidth 
        sx={{ "& .MuiDialog-paper": { 
          width: "61%",
          maxWidth: "none",
          backgroundColor: "white", // Light blue for Restore, Light red for Delete
          color: "#000", // Text color
          borderRadius: "25px",
        } }} 
      >
        <DialogTitle className="bg-[#b7cde3] relative">
          Bulk Creation
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
            className="custom-hot-table" // custom class for scoping
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
              const rowData = data[row];

              if (col === -1 || row === -1) {
                cellProperties.className = 'highlighted-cell';
                return cellProperties
              } 

              if (row === 0) {
                cellProperties.readOnly = true; // 👈 Make placeholder row read-only
                cellProperties.className = 'placeholder-row';
              } 

              const hasAnyInput = rowData.some(cell => cell && cell.trim() !== '');
              if (!hasAnyInput) return cellProperties; // Skip highlight if whole row is empty
                        
              const cellValue = rowData[col] || "";
                        
              // Highlight empty cells (only if something else in row is filled)
              if (cellValue.trim() === "") {
                cellProperties.className = 'incomplete-cell';
              }
            
              // Validate email if this is the email column
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
          <Button onClick={() => exportHotTableToExcelWithHeaders(hotRef.current.hotInstance, columnHeaders)} disabled={loading}>
            <p className="text-white text-lg rounded-3xl px-8 py-1 bg-green-500">{loading ? "Exporting..." : "Export to Excel"}</p>
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
                return alert("Empty Table or Invalid Input please check the table again")
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
          Bulk Delete
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={() => setOpenBulkDelete(false)} className="rounded-full ">
              <Close sx={{fontSize: 40, color: 'black'}}/>
            </IconButton>
          </DialogActions>
        </DialogTitle>
        <DialogContent>
          <div className="justify-center align-middle text-center">
            <p className="font-bold my-5">Are you sure you want to delete the following {tab === 0 ? "student/s" : "staff/s"} ?</p>
            {checked.map((index) => (
              tab === 0 ? (<p key={index}>{students[index].firstName} {students[index].lastName}</p>) :
              (<p key={index}>{staffs[index].name}</p>) 
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDelete(false)}>
            <p className="text-base font-roboto font-bold text-[#64748b] p-2">Cancel</p>
          </Button>
          <Button onClick={handleBulkDelete} disabled={loading}>
            <p className="text-base bg-[#ef4444] py-2 px-4 text-white rounded-full">{loading ? "Deleting..." : `Delete ${tab === 0 ? "Student/s" : "Staff/s"}`}</p>
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
                handleDeleteButtonClick(selectedStudent);  // Call parent's delete function
                setOpenDeleteModal(false);  // Close modal after delete
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