import { useState } from "react";
import { Tabs, Tab, TextField } from "@mui/material";
import { Search, Add, DescriptionOutlined, VideoCallOutlined, Delete } from "@mui/icons-material";
import '../../handsontable.css'

export default function ContentTabs({ tab, setTab, setIsDialogOpen, handleDeleteOpen, setIsVideo, setVideoDialog, setIsArticle, handleSearchChange, setEditMode}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const staff = JSON.parse(localStorage.getItem("staff"));

  const searchPlaceholder = () => {
    switch(tab) {
      case 0:
        return "Search Resources";
      case 1:
        return "Search Wellness";
      case 2:
        return "Search Announcements";
      case 3: 
        return "Search FAQ";
      case 4:
        return "Search Trigger";
      default:
        return "Search";
    }
  };

  return (
    <div className="flex items-center justify-between w-full h-12 mb-5"> 
      {/* Tab Navigation */}
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
            padding: "4px 16px",
            fontSize: "clamp(0.7rem, 1.05vw, 1.225rem)",
            textTransform: "none",
            fontFamily: "roboto",
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
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#b7cde3",
                color: "#000",
              },
            },
          },
        }}
      >
        <Tab label="Resources" />
        <Tab label="Wellness" />
        <Tab label="Announcements" />
        {staff.position === "Admin" && (
          <Tab label="FAQ" />
        )}
        {staff.position === "Admin" && (
          <Tab label="Trigger" />
        )}
      </Tabs>

      {/* Action Buttons and Search Bar */}
      <div className="flex items-center gap-2 flex-shrink-0 h-full">
        {/* Left-aligned Search Bar */}
        <TextField
          className="search-bar"
          placeholder={searchPlaceholder()}
          variant="outlined"
          size="small"
          InputProps={{ endAdornment: <Search className="text-gray-500" /> }}
          sx={{ maxWidth: "50%" }} // Smaller width
          onChange={handleSearchChange}
        />

        {/* Right-aligned Buttons */}
        <div className="ml-4 flex gap-5">
          <button
            onClick={handleDeleteOpen}
            className="text-white flex items-center bg-gradient-to-r from-[#EF4444] to-[#B91C1C] rounded-3xl px-7 py-1 my-2 border border-black"
          >
            {`Delete`}
            <Delete sx={{
                  fontSize: 17,
                  color: 'White',
                  backgroundColor: 'transparent',
                  borderRadius: 9999,
                  marginLeft: '8px',
                }}/>
          </button>
          <div className="relative">
            <div className="relative text-white flex items-center bg-gradient-to-r from-[#60a5fa] to-[#4f46e5] rounded-3xl px-9 py-1 my-2 border border-black z-20"
                onMouseEnter={() => {
                  if(tab !== 0) return;
                  setIsDropdownOpen(true)}}
                onMouseLeave={() => setIsDropdownOpen(false)}
                onClick={() => {
                  switch(tab) {
                    case 0:
                      return;
                    case 1:
                      setVideoDialog(true);
                      setIsVideo(true);
                      setEditMode(false);
                      return;
                    case 2:
                      setIsDialogOpen(true);
                      setIsVideo(false);
                      setEditMode(false);
                      return;
                    case 3:
                      setIsDialogOpen(true);
                      setIsVideo(false);
                      setEditMode(false);
                      return;
                    case 4:
                      setIsDialogOpen(true);
                      setIsVideo(false);
                      setEditMode(false);
                      return;
                    default:
                      return;
                }}}
            >
                Create
                <Add sx={{
                  fontSize: 15,
                  color: '#4f46e5',
                  backgroundColor: 'white',
                  borderRadius: 9999,
                  marginLeft: '8px',
                }}/>
            </div>
            {isDropdownOpen && (
              <div 
                className={`absolute top-5 right-0 mt-2 w-full bg-[#b7cde3] shadow-lg rounded-md z-10`}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <ul className="py-2 text-start mt-2">
                  <li
                    className={`group p-2 hover:text-[#334155] ${
                      tab === 0 ? "text-[#334155]" : "text-[#64748b]"
                    }`}
                  >
                    <button
                      sx={{
                        borderColor: `${tab === 0 ? "rbg(75 85 99)" : "white" }`,
                        borderWidth: 1,
                        borderStyle: "solid",
                        color: `${tab === 0 ? "rbg(75 85 99)" : "white" }`,
                        marginRight: "10px",
                        padding: 0,
                      }}
                      className="group-hover:text-gray-600 group-hover:border-gray-600 flex items-center gap-1"
                      onClick={() => {setTab(0); setIsArticle(true); setVideoDialog(false); setEditMode(false);}}
                    >
                      <DescriptionOutlined 
                        sx={{
                        fontSize: 17,
                        color: '#334155',
                        marginLeft: '8px',
                      }}/>
                      <p className="text-[1rem] ml-2">Article</p>
                    </button>

                    <button
                      sx={{
                        borderColor: `${tab === 0 ? "rbg(75 85 99)" : "white" }`,
                        borderWidth: 1,
                        borderStyle: "solid",
                        color: `${tab === 0 ? "rbg(75 85 99)" : "white" }`,
                        marginRight: "10px",
                        padding: 0,
                      }}
                      className="group-hover:text-gray-600 group-hover:border-gray-600 flex items-center gap-1"
                      onClick={() => {setTab(0); setVideoDialog(true); setIsVideo(true); setEditMode(false);}}
                    >
                      <VideoCallOutlined 
                        sx={{
                        fontSize: 17,
                        color: '#334155',
                        marginLeft: '8px',
                      }}/>
                      <p className="text-[1rem] ml-2">Video</p>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
