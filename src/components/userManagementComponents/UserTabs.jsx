import { Tabs, Tab, TextField, IconButton, Tooltip } from "@mui/material";
import { Search, Delete, UploadFile, Add, FileDownload, FilterAlt } from "@mui/icons-material";

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
  searchTerm,
  students,
  staffs,
  setFilterOpen,
  filterOpen,
  filterType,
  handleFilter,
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

  // ADD THESE HELPER FUNCTIONS HERE:
  const convertToCSV = (data, headers) => {
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportToExcel = () => {
    let formattedData = [];
    let filename = '';
    
    if (tab === 0) {
      formattedData = students.map(student => ({
        Name: `${student.firstName} ${student.lastName}`,
        Section: student.section,
        Adviser: student.adviser,
        Email: student.email
      }));
      filename = 'Students.csv';
    } else if (tab === 1) {
      const advisers = staffs.filter(s => s.position === "Adviser");
      formattedData = advisers.map(adviser => ({
        Name: adviser.name,
        Position: adviser.position,
        Section: adviser.section,
        Email: adviser.email
      }));
      filename = 'Advisers.csv';
    } else {
      const guidanceStaffs = staffs.filter(
        s => !(s.name === "Mind-U" && s.position !== "Admin") && s.position !== "Adviser"
      );
      formattedData = guidanceStaffs.map(staff => ({
        Name: staff.name,
        Position: staff.position,
        Email: staff.email
      }));
      filename = 'Guidance_Staffs.csv';
    }

    if (formattedData.length === 0) {
      setOpenError(true);
      setIsSuccessful(false);
      setAlertMessage('No data available for export.');
      return;
    }

    const headers = Object.keys(formattedData[0]);
    const csvContent = convertToCSV(formattedData, headers);
    downloadCSV(csvContent, filename);
    
    setOpenError(true);
    setIsSuccessful(true);
    setAlertMessage('The file is downloaded successfully. Please check your downloads.');
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
          value={searchTerm}
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
          {(!isAdviser && tab === 0) && (
            <div className="relative -ml-4 -mr-8">
              <Tooltip title={"Filter"} arrow>
                <IconButton
                  className="z-50"
                  onClick={() => {setFilterOpen(prev => !prev);}}
                    sx={{
                    color: '#64748b',
                    '&:hover': {
                      color: 'black',
                    },
                  }}
                >
                  <FilterAlt 
                    sx={{ 
                      fontSize: '2rem',
                      pointerEvents: 'none'
                    }} 
                  />
                </IconButton>
              </Tooltip>
              {filterOpen && (
                <div className="z-50">
                  <div className="absolute right-3 w-fit bg-[#b7cde3] rounded-s-xl shadow-lg border-4 border-[#1e3a8a] -mt-0.5 z-40">
                    <ul className="text-right">
                      <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer rounded-tl-xl ${filterType === 0 && "text-black"}`} onClick={() => handleFilter(0)}>All</li>
                      <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer ${filterType === 1 && "text-black"}`} onClick={() => handleFilter(1)}>ABM</li>
                      <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer ${filterType === 2 && "text-black"}`} onClick={() => handleFilter(2)}>HE</li>
                      <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${filterType === 3 && "text-black"}`} onClick={() => handleFilter(3)}>HUMSS</li>
                      <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${filterType === 4 && "text-black"}`} onClick={() => handleFilter(4)}>ICT</li>
                      <li className={`px-4 py-0.5 text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${filterType === 5 && "text-black"}`} onClick={() => handleFilter(5)}>STEM</li>
                    </ul>
                  </div>
                  <div className="absolute right-4 top-[8px] w-4 h-10  border-x-8 border-b-8 border-b-[#1e3a8a] border-x-transparent z-40" />
                  <div className="absolute right-4 top-[20px] w-4 h-8  border-x-8 border-b-8 border-b-[#b7cde3] border-x-transparent z-40" />
                </div>
              )}
            </div>
          )}
          <Tooltip title={"Download"} arrow>
            <IconButton
              className="z-50"
              onClick={handleExportToExcel}
              sx={{
                color: '#64748b',
                '&:hover': {
                  color: 'black',
                },
              }}
            >
              <FileDownload 
                sx={{ 
                  fontSize: '2rem',
                  pointerEvents: 'none'
                }} 
              />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
