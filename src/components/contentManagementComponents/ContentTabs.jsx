import { useState } from "react";
import { Tabs, Tab, TextField, Button, IconButton } from "@mui/material";
import { Search, Add, DescriptionOutlined, VideoCallOutlined } from "@mui/icons-material";

export default function ContentTabs({ tab, setTab, setIsDialogOpen, handleDeleteOpen, setIsVideo, setVideoDialog, setIsArticle }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  return (
    <>
      {/* Tab Navigation */}
      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        className="database-tabs border-b border-gray-300"
      >
        <Tab label="Resources" className="database-tab" />
        <Tab label="Wellness" className="database-tab" />
        <Tab label="Announcements" className="database-tab" />
      </Tabs>

      {/* Action Buttons and Search Bar */}
      <div className="flex items-center justify-between mt-4 mb-2">
        {/* Left-aligned Search Bar */}
        <TextField
          className="search-bar"
          placeholder={`Search ${tab === 0 ? "Resources" : tab === 1 ? "Wellness" : "Announcements"}`}
          variant="outlined"
          size="small"
          InputProps={{ endAdornment: <Search className="text-gray-500" /> }}
          sx={{ maxWidth: "50%" }} // Smaller width
        />

        {/* Right-aligned Buttons */}
        <div className="flex gap-5">
          <Button
            className="delete-button-large"
            variant="contained"
            color="error"
            onClick={handleDeleteOpen}
            sx={{ borderRadius: "100px" }}
          >
            {`Delete ${tab === 0 ? "Resources" : tab === 1 ? "Wellness" : "Announcements"}`}
          </Button>
          <div className="relative bg-gradient-to-r from-[#00a651] to-[#8dc63f] rounded-3xl text-center px-10 text-xl" 
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}>
            <IconButton
              className="add-button"
              variant="contained"
              color="primary"
              sx={{gap: "20px"}}
            >
              <p className="text-white text-center">Create</p><Add sx={{borderRadius: "100px", bgcolor: "white", color: "#8dc63f"}}></Add>
            </IconButton>
            
              {isDropdownOpen && (
              <div 
                className="absolute top-9 left-6 mt-2 w-56 h-40 bg-[#b7e3cc] shadow-lg rounded-md z-20"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <ul className="py-2 text-start">
                <li
                  className={`group px-4 py-2 hover:bg-gray-200 hover:text-gray-600 ${
                    tab === 0 ? "text-gray-600" : "text-white"
                  }`}
                  onMouseEnter={() => setIsSubmenuOpen(true)}
                  onMouseLeave={() => setIsSubmenuOpen(false)}
                >
                  <IconButton
                    sx={{
                      borderColor: `${tab === 0 ? "rbg(75 85 99)" : "white" }`, // Default border color
                      borderWidth: 1,
                      borderStyle: "solid",
                      color: `${tab === 0 ? "rbg(75 85 99)" : "white" }`,
                      marginRight: "10px",
                      padding: 0,
                    }}
                    className="group-hover:text-gray-600 group-hover:border-gray-600"
                  >
                    <Add />
                  </IconButton>
                    Resource Library
                </li>
                    {isSubmenuOpen && (
                      <div 
                        className="absolute w-36 h-32 bg-[#b7e3cc] right-full top-0 rounded-md z-10  before:absolute before:top-0 before:right-0 before:h-full before:w-1 before:bg-black before:opacity-10 before:rounded-t-md"
                        onMouseEnter={() => {setIsSubmenuOpen(true); setIsDropdownOpen(true)}}
                        onMouseLeave={() => {setIsSubmenuOpen(false); setIsDropdownOpen(false)}}
                      >
                      <ul className="py-2">
                        <li className="group px-4 py-2 hover:text-gray-600 text-white flex items-center gap-5"
                          onClick={() => {setTab(0); setIsArticle(true); setVideoDialog(false);}}>
                          <IconButton sx={{color:"white"}} className="group-hover:text-gray-600">
                            <DescriptionOutlined />
                          </IconButton>
                          Article
                        </li>
                        <li 
                          className="group px-4 py-2 hover:text-gray-600 text-white flex items-center gap-5"
                          onClick={() => {setTab(0); setVideoDialog(true); setIsVideo(true)}}
                        >
                          <IconButton sx={{color:"white"}} className="group-hover:text-gray-600">
                            <VideoCallOutlined />
                          </IconButton>
                          Video
                        </li>
                      </ul>
                      </div>
                    )}
                  <li
                    className={`group px-4 py-2 hover:bg-gray-200 hover:text-gray-600 ${
                      tab === 1 ? "text-gray-600" : "text-white"
                    }`}
                    onClick={() => {setTab(1); setVideoDialog(true); setIsVideo(true)}}
                  >
                    <IconButton
                      sx={{
                        borderColor: `${tab === 1 ? "rbg(75 85 99)" : "white" }`, // Default border color
                        borderWidth: 1,
                        borderStyle: "solid",
                        color: `${tab === 1 ? "rbg(75 85 99)" : "white" }`,
                        marginRight: "10px",
                        padding: 0,
                      }}
                      className="group-hover:text-gray-600 group-hover:border-gray-600"
                    >
                      <Add />
                    </IconButton>
                      Wellness Library
                  </li>
                  <li
                    className={`group px-4 py-2 hover:bg-gray-200 hover:text-gray-600 ${
                      tab === 2 ? "text-gray-600" : "text-white"
                    }`}
                    onClick={() => {setTab(2); setIsDialogOpen(true); setIsVideo(false)}}
                  >
                    <IconButton
                      sx={{
                        borderColor: `${tab === 2 ? "rbg(75 85 99)" : "white" }`, // Default border color
                        borderWidth: 1,
                        borderStyle: "solid",
                        color: `${tab === 2 ? "rbg(75 85 99)" : "white" }`,
                        marginRight: "10px",
                        padding: 0,
                      }}
                      className="group-hover:text-gray-600 group-hover:border-gray-600"
                    >
                      <Add />
                    </IconButton>
                      Announcement
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          
        </div>
      </div>
    </>
  );
}
