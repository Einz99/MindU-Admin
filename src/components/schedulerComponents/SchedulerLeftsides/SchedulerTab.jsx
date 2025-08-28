import React from "react";
import { Tabs, Tab, TextField } from "@mui/material";
import { Search, Add } from "@mui/icons-material";

export default function SchedulerTab({ handleOpenAddEvent, handleSearchChange, setIsRequest, tab, setTab }) {
  return (
    <div className="flex items-center justify-between w-full h-12 mb-5"> 
    {/* Tabs container */}
    <div className="flex-shrink-0 flex items-center h-full overflow-x-auto">
      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{
          height: "100%", // parent div height
          "& .MuiTabs-scroller": {
            height: "100%", 
            display: "flex", 
            alignItems: "center",
          },
          "& .MuiTabs-flexContainer": {
            height: "100%",
            alignItems: "center",
          },
          "& .MuiTab-root": {
            justifyContent: 'center',
            padding: "4px 8px",
            fontSize: "clamp(0.7rem, 1.05vw, 1.225rem)",
            textTransform: "none",
            fontWeight: "bold",
            fontFamily: "norwester",
            borderRadius: "9999px",
            color: "#000",
            transition: "all 0.2s ease-in-out",
            minHeight: "unset",
            minWidth: "60px",
            "&:hover": {
              backgroundColor: "#b7cde3",
              color: "#1E3A8A",
            },
            "&.Mui-selected": {
              backgroundColor: "#b7cde3",
              color: "#000",
              "&:hover": {
                backgroundColor: "#b7cde3",
                color: "#000",
              },
            },
          },
        }}
      >
        <Tab label="Appointments" />
        <Tab label="Events" />
      </Tabs>
    </div>

    {/* Right side: Search + Buttons */}
    <div className="flex items-center gap-2 flex-shrink-0 h-full">
      <div
        className="flex-shrink-0 flex items-center h-full"
        style={{ width: "clamp(150px, 15vw, 250px)" }}
      >
        <TextField
          placeholder="Search Names/Event"
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: <Search className="text-gray-500" />,
            style: { fontSize: "clamp(0.56rem, 0.84vw, 0.98rem)" },
          }}
          fullWidth
          onChange={handleSearchChange}
        />
      </div>

      <div className="flex flex-row gap-2 items-center h-full">
        <button
          onClick={() => { handleOpenAddEvent(); setIsRequest(false); }}
          className="text-white flex items-center bg-gradient-to-r from-[#60a5fa] to-[#4f46e5] rounded-3xl px-4 py-1 border border-black"
          style={{ fontSize: "clamp(0.56rem, 0.84vw, 0.98rem)"}}
        >
          Walk In
          <Add sx={{ fontSize: "clamp(0.56rem, 0.84vw, 0.98rem)", color: '#4f46e5', backgroundColor: 'white', borderRadius: 9999, marginLeft: '4px' }} />
        </button>
        <button
          onClick={() => { handleOpenAddEvent(); setIsRequest(true); }}
          className="text-white flex items-center bg-gradient-to-r from-[#60a5fa] to-[#4f46e5] rounded-3xl px-4 py-1 border border-black"
          style={{ fontSize: "clamp(0.56rem, 0.84vw, 0.98rem)" }}
        >
          Propose Event
          <Add sx={{ fontSize: "clamp(0.56rem, 0.84vw, 0.98rem)", color: '#4f46e5', backgroundColor: 'white', borderRadius: 9999, marginLeft: '4px' }} />
        </button>
      </div>
    </div>
  </div>
  );
} 
