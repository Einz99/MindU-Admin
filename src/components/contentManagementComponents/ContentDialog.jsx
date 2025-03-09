import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, RadioGroup, FormControlLabel, Radio, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { API } from "../../api";

export default function ContentDialog({ tab, open, handleClose, newItem, setNewItem, file, setFile, setData, editMode, setEditMode, editId }) {
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (event) => {
    setNewItem((prev) => ({ ...prev, category: event.target.value }));
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setNewItem((prev) => ({ ...prev, filePath: uploadedFile.name }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
  
    console.log("Saving data:", newItem);
    console.log("Selected file:", file);
  
    const formData = new FormData();
    formData.append("title", newItem.title || ""); // Prevent null values
    formData.append("category", newItem.category || "");
    
    if (tab === 0 || tab === 1) {
      formData.append("isResource", tab === 0 ? 1 : 0);
      formData.append("description", newItem.description || "");
      formData.append("filepath", newItem.filePath || "");
      
      if (tab === 0) {
        formData.append("resourceType", newItem.type || "");
      }
      
      if (file) {
        formData.append("file", file);
      }
    } else if (tab === 2) {
      formData.append("announcementContent", newItem.content || "");
    }
  
    try {
      let response;
      if (tab === 2) {
        // Send JSON for announcements
        const requestBody = {
          title: newItem.title || "",
          category: newItem.category || "",
          announcementContent: newItem.content || "",
        };
  
        if (editMode) {
          response = await axios.put(`${API}/api/announcements/${editId}`, requestBody, {
            headers: { "Content-Type": "application/json" },
          });
        } else {
          response = await axios.post(`${API}/api/announcements`, requestBody, {
            headers: { "Content-Type": "application/json" },
          });
        }
      } else {
        // Use FormData only for resources (tab 0 and 1)
        const formData = new FormData();
        formData.append("title", newItem.title || "");
        formData.append("category", newItem.category || "");
        formData.append("isResource", tab === 0 ? 1 : 0);
        formData.append("description", newItem.description || "");
        formData.append("filepath", newItem.filePath || "");
        
        if (tab === 0) {
          formData.append("resourceType", newItem.type || "");
        }
        
        if (file) {
          formData.append("file", file);
        }
  
        const endpoint = tab === 0 ? `${API}/api/resources` : `${API}/api/resources`;
        response = editMode
          ? await axios.put(`${endpoint}/${editId}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
          : await axios.post(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
  
      setData((prev) => editMode ? prev.map((item) => (item.ID === editId ? response.data : item)) : [...prev, response.data]);
      
      alert("Data saved successfully!");
      handleClose();
      setEditMode(false);
    } catch (error) {
      console.error("Error saving data:", error.response ? error.response.data : error);
      alert("Failed to save data.");
    } finally {
      setLoading(false);
    }
  };
  
  // Define category options based on tab
  const categoryOptions = tab === 0
    ? ["Self-Care", "Business"]
    : tab === 1
    ? ["Breathing Exercises", "Meditation Guide"]
    : ["Important", "General", "Update", "Advisory"];

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New Item</DialogTitle>
      <DialogContent>
        <TextField margin="dense" label="Title" name="title" fullWidth variant="outlined" value={newItem.title || ""} onChange={handleInputChange} />

        {/* Category Selection Based on Tab */}
        <FormControl fullWidth margin="dense">
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            name="category"
            value={newItem.category || ""}
            onChange={handleCategoryChange}
          >
            {categoryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Type Selection for Tab 0 Only */}
        {tab === 0 && (
          <FormControl component="fieldset" margin="dense">
            <RadioGroup name="type" value={newItem.type || ""} onChange={handleInputChange}>
              <FormControlLabel value="Article" control={<Radio />} label="Article" />
              <FormControlLabel value="Video" control={<Radio />} label="Video" />
            </RadioGroup>
          </FormControl>
        )}

        {/* Description for Tab 0 & 1 Only */}
        {(tab === 0 || tab === 1) && (
          <TextField margin="dense" label="Description" name="description" fullWidth variant="outlined" value={newItem.description || ""} onChange={handleInputChange} />
        )}

        {/* Content Field for Tab 2 */}
        {tab === 2 && (
          <TextField margin="dense" label="Content" name="content" fullWidth variant="outlined" multiline rows={4} value={newItem.content || ""} onChange={handleInputChange} />
        )}

        {/* File Upload for Tabs 0 and 1 */}
        {(tab === 0 || tab === 1) && (
          <>
            <TextField margin="dense" label="File Path" name="filePath" fullWidth variant="outlined" value={newItem.filePath || ""} disabled />
            <Button variant="contained" component="label" fullWidth>
              Upload File
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
      </DialogActions>
    </Dialog>
  );
}
