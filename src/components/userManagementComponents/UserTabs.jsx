import { useState } from "react";
import { Tabs, Tab, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Input } from "@mui/material";
import { Search, Delete, UploadFile } from "@mui/icons-material";
import * as XLSX from "xlsx";

const UserTabs = ({ 
  tab, 
  setTab, 
  handleAddButtonClick, 
  handleBulkDelete, 
  handleBulkUpload,
  checked 
}) => {
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const expectedHeaders = {
    0: ["First Name", "Last Name", "Section", "Adviser", "Email"],
    1: ["Name", "Email", "Role"]
  };

  const normalizeHeader = (header) => header.trim().toLowerCase().replace(/\s+/g, " ");
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0]; // Read first sheet
      const sheet = workbook.Sheets[sheetName];
  
      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
      if (jsonData.length === 0) {
        setErrorMessage("The file is empty.");
        return;
      }
  
      // Read headers and normalize
      const headers = jsonData[0].map(normalizeHeader);
      const validHeaders = expectedHeaders[tab].map(normalizeHeader);
  
      if (JSON.stringify(headers) !== JSON.stringify(validHeaders)) {
        setErrorMessage("Invalid headers. Please ensure your file matches the required format.");
        return;
      }
  
      setErrorMessage(""); // Clear errors
      setSelectedFile(file);
    };
  
    reader.readAsArrayBuffer(file); // Use ArrayBuffer to support Excel files
  };
  
  const handleConfirmUpload = () => {
    if (!selectedFile) return;
    handleBulkUpload(selectedFile);
    setBulkUploadOpen(false);
    setSelectedFile(null);
  };
  
  return (
    <>
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} className="user-tabs">
        <Tab label="Students" className="user-tab" />
        <Tab label="Guidance Staffs" className="user-tab" />
      </Tabs>
      <div className="user-actions">
        <TextField
          className="search-bar"
          placeholder={`Search ${tab === 0 ? "Students" : "Guidance Staffs"}`}
          variant="outlined"
          size="small"
          InputProps={{ endAdornment: <Search /> }}
        />
        <Button 
          className="delete-button"
          variant="contained" 
          color="error" 
          onClick={handleBulkDelete} 
          disabled={checked.length === 0}
          startIcon={<Delete />}
        >
          Delete Selected
        </Button>
        <Button
          className="bulk-upload-button"
          variant="contained"
          color="primary"
          startIcon={<UploadFile />}
          onClick={() => setBulkUploadOpen(true)}
        >
          Bulk Upload
        </Button>
        <Button className="add-button" variant="contained" onClick={handleAddButtonClick}>
          {`Add ${tab === 0 ? "Student" : "Guidance Staff"}`}
        </Button>
      </div>
      
      <Dialog open={bulkUploadOpen} onClose={() => setBulkUploadOpen(false)}>
        <DialogTitle>Bulk Upload Instructions</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Please upload a CSV or Excel file with the following format and header:
          </Typography>
          {tab === 0 ? 
          <Typography variant="body2">
            - Column 1: First Name
            <br />- Column 2: Last Name
            <br />- Column 3: Section
            <br />- Column 4: Adviser
            <br />- Column 5: Email
          </Typography> : 
          <Typography variant="body2">
            - Column 1: Name
            <br />- Column 2: Email
            <br />- Column 3: Role (Student/Guidance Staff)
          </Typography>}
          <Input type="file" accept=".csv, .xlsx" onChange={handleFileChange} />
          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkUploadOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleConfirmUpload} color="primary" disabled={!selectedFile}>Upload</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserTabs;
