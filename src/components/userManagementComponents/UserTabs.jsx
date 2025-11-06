import { Tabs, Tab, TextField } from "@mui/material";
import { Search, Delete, UploadFile, Add } from "@mui/icons-material";

export default function UserTabs({ 
  tab, 
  setTab, 
  handleAddButtonClick,
  setOpenBulkDelete,
  checked,
  handleSearchChange,  // <-- receive the handler as a prop
  setBulkUploadOpen,
  staff,
  setOpenError,
  setAlertMessage,
  setIsSuccessful,
}) {
  const isAdviser = staff?.position === "Adviser";
  const isStaff = staff?.position === "Guidance Staff";

  const visibleTabs = isAdviser 
    ? [{ label: "Students" }] 
    : isStaff ? 
      [
        { label: "Students" },
        { label: "Advisers" },
      ] 
    : [
        { label: "Students" },
        { label: "Advisers" },
        { label: "Guidance Staffs" }
      ];
      
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
        {visibleTabs.map((t, idx) => (
          <Tab key={idx} label={t.label} className="user-tab" />
        ))}
      </Tabs>

      {/* Action Buttons and Search Bar */}
      <div className={`flex items-center gap-2 flex-shrink-0 h-full ${tab === 2 ? "-mr-4" : "mr-5"}`}>
        <TextField
          className="search-bar"
          placeholder={`Search ${tab === 0 ? "Students" : tab === 1 ? "Advisers" : "Guidance Staffs"}`}
          variant="outlined"
          size="small"
          InputProps={{ endAdornment: <Search className="text-gray-500" /> }}
          sx={{ maxWidth: "30%", minWidth: "30%"}}
          onChange={handleSearchChange}
        />
        <div className="ml-4 flex gap-5">
          <button 
          className="text-white flex items-center bg-gradient-to-r from-[#EF4444] to-[#B91C1C] rounded-3xl px-7 py-1 my-2 border border-black text-nowrap" 
          onClick={() => {
            if (checked.length === 0) {
              setOpenError(true);
              setAlertMessage("Please select at least one user to delete.");
              setIsSuccessful(false);
              return;
            }
            setOpenBulkDelete(true)}}>
            Delete Selected
            <Delete sx={{
                  fontSize: 17,
                  color: 'White',
                  backgroundColor: 'transparent',
                  borderRadius: 9999,
                  marginLeft: '8px',
                }}/>
          </button>
          {(tab === 0 || tab === 1 )&& (
            <>
              <button onClick={() => setBulkUploadOpen(true)} className="text-white flex items-center bg-gradient-to-r from-[#60a5fa] to-[#4f46e5] rounded-3xl px-7 py-1 my-2 border border-black text-nowrap">
                Bulk Creation
                <UploadFile sx={{
                  fontSize: 17,
                  color: 'white',
                  backgroundColor: 'transparent',
                  borderRadius: 9999,
                  marginLeft: '8px',
                }}/>
              </button>
            </>
          )}
          <button className="text-white flex items-center bg-gradient-to-r from-[#60a5fa] to-[#4f46e5] rounded-3xl px-7 py-1 my-2 border border-black text-nowrap" variant="contained" onClick={handleAddButtonClick}>
            {`Add`}
            <Add sx={{
              fontSize: 15,
              color: '#4f46e5',
              backgroundColor: 'white',
              borderRadius: 9999,
              marginLeft: '8px',
            }}/>
          </button>
        </div>
      </div>
    </div>
  );
}
