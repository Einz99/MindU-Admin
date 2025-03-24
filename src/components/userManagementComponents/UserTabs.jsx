import { useState, useEffect, useCallback } from "react";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.css";
import { Tabs, Tab, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import { Search, Delete, UploadFile } from "@mui/icons-material";

export default function UserTabs({ 
  tab, 
  setTab, 
  handleAddButtonClick, 
  handleBulkDelete, 
  handleBulkUpload,
  checked 
}) {
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [data, setData] = useState([["", "", "", "", ""]]); // Start with one row
  const [colWidths, setColWidths] = useState([]);

  // Define column headers dynamically
  const columnHeaders = tab === 0 
    ? ["First Name", "Last Name", "Section", "Adviser", "Email"] 
    : ["Name", "Email", "Role"];

  // Dynamically calculate column widths based on modal size
  const calculateColWidths = useCallback(() => {
    if (typeof window === "undefined") return []; // Prevent SSR errors

    const modalWidth = window.innerWidth * 0.55; // 55% of the screen width
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
        newData[row] = newData[row] || Array(columnHeaders.length).fill(""); // Ensure row exists
        newData[row][col] = newVal;

        // Check if the last row is fully filled
        if (row === newData.length - 1 && newData[row].every(cell => cell !== "")) {
          shouldAddRow = true;
        }
      });

      if (shouldAddRow) newData.push(Array(columnHeaders.length).fill("")); // Add new empty row

      setData(newData);
    }
  };

  const handleConfirmUpload = () => {
    const trimmedData = data.filter(row => row.some(cell => cell && cell.trim() !== "")); 
  
    if (trimmedData.length === 0) {
      alert("No valid data to upload.");
      return;
    }
  
    handleBulkUpload(trimmedData);
    setBulkUploadOpen(false);
    setData([["", "", "", "", ""]]); // Reset after upload
  };
  

  return (
    <>
      {/* Tab Navigation */}
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} className="database-tabs border-b border-gray-300">
        <Tab label="Students" className="user-tab" />
        <Tab label="Guidance Staffs" className="user-tab" />
      </Tabs>

      {/* Action Buttons and Search Bar */}
      <div className="flex items-center justify-between mt-4 mb-2">
        <TextField
          className="search-bar"
          placeholder={`Search ${tab === 0 ? "Students" : "Guidance Staffs"}`}
          variant="outlined"
          size="small"
          InputProps={{ endAdornment: <Search className="text-gray-500" /> }}
          sx={{ maxWidth: "50%", minWidth: "40%" }}
        />
        <div className="flex gap-5">
          <Button variant="contained" color="error" onClick={handleBulkDelete} disabled={checked.length === 0} startIcon={<Delete />}>
            Delete Selected
          </Button>
          {tab === 0 ? 
          <>
            <Button variant="contained" color="primary" startIcon={<UploadFile />} onClick={() => setBulkUploadOpen(true)}>
              Bulk Insert
            </Button>
          </> : null}
          <Button className="add-button" variant="contained" onClick={handleAddButtonClick}>
            {`Add ${tab === 0 ? "Student" : "Guidance Staff"}`}
          </Button>
        </div>
      </div>

      {/* Bulk Upload Dialog */}
      <Dialog 
        open={bulkUploadOpen} 
        onClose={() => setBulkUploadOpen(false)} 
        maxWidth="md" 
        fullWidth 
        sx={{ "& .MuiDialog-paper": { width: "60%", maxWidth: "none" } }} 
      >
        <DialogTitle>Bulk Insert</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Copy and paste your spreadsheet data below (new rows will be added automatically as needed):
          </Typography>
          <div className="w-[100%] h-[400px] overflow-y-auto">
            <HotTable
              data={data}
              colHeaders={columnHeaders}
              rowHeaders={true}
              manualColumnResize={true}
              manualRowResize={true}
              columnSorting={true}
              contextMenu={true}
              minRows={16}
              minCols={tab === 0 ? 5 : 3}
              maxCols={tab === 0 ? 5 : 3}
              width="100%" // Takes full modal width
              height="auto"
              stretchH="all"
              colWidths={colWidths} // Dynamically sized columns
              licenseKey="non-commercial-and-evaluation"
              afterChange={handleDataChange}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkUploadOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleConfirmUpload} color="primary" disabled={data.length === 0}>Confirm Upload</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
