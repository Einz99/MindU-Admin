import { Tabs, Tab, TextField, Button } from "@mui/material";
import { Search } from "@mui/icons-material";

export default function ContentTabs({ tab, setTab, setIsDialogOpen, handleDeleteOpen }) {
  return (
    <>
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} className="database-tabs">
        <Tab label="Resources" className="database-tab" />
        <Tab label="Wellness" className="database-tab" />
        <Tab label="Announcements" className="database-tab" />
      </Tabs>

      <div className="database-actions">
        <TextField
          className="search-bar"
          placeholder={`Search ${tab === 0 ? "Resources" : tab === 1? "Wellness" : "Announcements"}`}
          variant="outlined"
          size="small"
          InputProps={{ endAdornment: <Search /> }}
        />
        
        <Button className="delete-button-large" variant="contained" onClick={() => handleDeleteOpen()}>
        {`Delete ${tab === 0 ? "Resources" : tab === 1 ? "Wellness" : "Announcements"}`}
        </Button>
        <Button className="add-button" variant="contained" onClick={() => setIsDialogOpen(true)}>
        {`Add ${tab === 0 ? "Resource" : tab === 1 ? "Wellness" : "Announcement"}`}
        </Button>
      </div>
    </>
  );
}