import { useState } from "react";
import { Tabs, Tab, TextField } from "@mui/material";
import { Search, Add, DescriptionOutlined, VideoCallOutlined, Delete } from "@mui/icons-material";
import '../../handsontable.css'

export default function ContentTabs({ tab, setTab, setIsDialogOpen, handleDeleteOpen, setIsVideo, setVideoDialog, setIsArticle, handleSearchChange, setEditMode}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
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
        <Tab label="Resources" />
        <Tab label="Wellness" />
        <Tab label="Announcements" />
      </Tabs>

      {/* Action Buttons and Search Bar */}
      <div className="flex items-center gap-2 flex-shrink-0 h-full">
        {/* Left-aligned Search Bar */}
        <TextField
          className="search-bar"
          placeholder={`Search ${tab === 0 ? "Resources" : tab === 1 ? "Wellness" : "Announcements"}`}
          variant="outlined"
          size="small"
          InputProps={{ endAdornment: <Search className="text-gray-500" /> }}
          sx={{ maxWidth: "50%" }} // Smaller width
          onChange={handleSearchChange}
        />

        {/* Right-aligned Buttons */}
        <div className="flex gap-5">
          <button
            onClick={handleDeleteOpen}
            className="text-white flex items-center bg-gradient-to-r from-[#EF4444] to-[#B91C1C] rounded-3xl px-7 py-1 my-2 border border-black"
          >
            {`Delete ${tab === 0 ? "Resources" : tab === 1 ? "Wellness" : "Announcements"}`}
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
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}>
                Create New
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
                className={`absolute top-5 right-0 mt-2 w-full ${isSubmenuOpen === true ? "h-44" : "h-32"} bg-[#b7cde3] shadow-lg rounded-md z-10`}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <ul className="py-2 text-start">
                  <li
                    className={`group p-2 hover:text-[#334155] ${
                      tab === 0 ? "text-[#334155]" : "text-[#64748b]"
                    }`}
                    onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
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
                    >
                      <Add sx={{
                        fontSize: 17,
                        color: '#334155',
                        backgroundColor: 'transparent',
                        borderColor: '#334155',
                        borderWidth: 1,
                        borderRadius: 9999,
                        marginLeft: '8px',
                      }}/>
                      <p className="text-[1rem]">Resource Library</p>
                    </button>
                      {isSubmenuOpen && (
                        <ul className=""
                          onMouseEnter={() => {setIsSubmenuOpen(true); setIsDropdownOpen(true)}}
                          onMouseLeave={() => {setIsSubmenuOpen(false);}}
                        >
                          <li className="group px-4 hover:text-gray-600 text-white flex items-center gap-5"
                            onClick={() => {setTab(0); setIsArticle(true); setVideoDialog(false); setEditMode(false);}}
                          >
                            <button 
                             className="group-hover:text-gray-600">
                              <DescriptionOutlined 
                                sx={{
                                fontSize: 17,
                                color: '#334155',
                                marginLeft: '8px',
                              }}/>
                            </button>
                            Article
                          </li>
                          <li className="group px-4 hover:text-gray-600 text-white flex items-center gap-5"
                            onClick={() => {setTab(0); setVideoDialog(true); setIsVideo(true); setEditMode(false);}}
                          >
                            <button 
                             className="group-hover:text-gray-600">
                              <VideoCallOutlined 
                                sx={{
                                fontSize: 17,
                                color: '#334155',
                                marginLeft: '8px',
                              }}/>
                            </button>
                            Video
                          </li>
                        </ul>
                      )}
                  </li>
                  <li
                    className={`group p-2 hover:text-[#334155] ${
                      tab === 1 ? "text-[#334155]" : "text-[#64748b]"
                    }`}
                    onClick={() => {setTab(1); setVideoDialog(true); setIsVideo(true); setEditMode(false);}}
                  >
                    <button
                      sx={{
                        borderColor: `${tab === 1 ? "rbg(75 85 99)" : "white" }`,
                        borderWidth: 1,
                        borderStyle: "solid",
                        color: `${tab === 1 ? "rbg(75 85 99)" : "white" }`,
                        marginRight: "10px",
                        padding: 0,
                      }}
                      className="group-hover:text-[#334155] flex items-center gap-1"
                    >
                      <Add sx={{
                        fontSize: 17,
                        color: '#334155',
                        backgroundColor: 'transparent',
                        borderColor: '#334155',
                        borderWidth: 1,
                        borderRadius: 9999,
                        marginLeft: '8px',
                      }}/>
                      <p className="text-[1rem]">Wellness Library</p>
                    </button>
                  </li>
                  <li
                    className={`group p-2 hover:text-[#334155] ${
                      tab === 2 ? "text-[#334155]" : "text-[#64748b]"
                    }`}
                    onClick={() => {setTab(2); setIsDialogOpen(true); setIsVideo(false); setEditMode(false);}}
                  >
                    <button
                      sx={{
                        borderColor: `${tab === 2 ? "rbg(75 85 99)" : "white" }`,
                        borderWidth: 1,
                        borderStyle: "solid",
                        color: `${tab === 2 ? "rbg(75 85 99)" : "white" }`,
                        marginRight: "10px",
                        padding: 0,
                      }}
                      className="group-hover:text-[#334155] flex items-center gap-1"
                    >
                      <Add sx={{
                        fontSize: 17,
                        color: '#334155',
                        backgroundColor: 'transparent',
                        borderColor: '#334155',
                        borderWidth: 1,
                        borderRadius: 9999,
                        marginLeft: '8px',
                      }}/>
                      <p className="text-[1rem]">Annoucement</p>
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
