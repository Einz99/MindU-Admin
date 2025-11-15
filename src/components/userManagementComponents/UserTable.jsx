import React, { useState, useEffect } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  IconButton,
  Select,
  MenuItem,
  Button,
  Tooltip,
} from "@mui/material";
import { Edit, Delete, Summarize, ArrowUpward, ArrowDownward } from "@mui/icons-material";

export default function UserTable({
  tab,
  students,
  staffs,
  checked,
  handleCheckAll,
  handleCheck,
  handleEditButtonClick,
  setSelectedStudent,
  setOpenDeleteModal,
  page,
  setPage
}) {
  const staff = JSON.parse(localStorage.getItem("staff") || "{}");
  
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  
  const filteredAdvisers = staffs.filter((staff) => staff.position === "Adviser");
  const filteredGuidanceStaffs = staffs.filter(
    (staff) => !(staff.name === "Mind-U" && staff.position !== "Admin") && staff.position !== "Adviser"
  );

  const filteredStudents =
    staff.position === "Adviser"
      ? students.filter((s) => s.section === staff.section)
      : students;

  const data = tab === 0
    ? filteredStudents
    : tab === 1
    ? filteredAdvisers
    : filteredGuidanceStaffs;

  useEffect(() => {
    setPage(1);
    setSortField(null);
    setSortDirection('asc');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedData = () => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      let aVal, bVal;

      // Handle name field specially
      if (sortField === 'name') {
        aVal = tab === 0 
          ? `${a.firstName || ''} ${a.lastName || ''}`.trim()
          : a.name || '';
        bVal = tab === 0 
          ? `${b.firstName || ''} ${b.lastName || ''}`.trim()
          : b.name || '';
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }

      // Handle null/undefined values
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      // Convert to lowercase for string comparison
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedData = getSortedData();
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1);
  };

  const getLabel = (action) => {
    const target =
      tab === 0 ? "Student" :
      tab === 1 ? "Adviser" :
      tab === 2 ? "Guidance Staff" :
      "Record";

    return {
      view: `View ${target} Details`,
      edit: `Edit ${target} Details`,
      delete: `Remove ${target}`
    }[action];
  };

  const SortHeader = ({ field, label }) => {
    const isActive = sortField === field;
    
    return (
      <div 
        className={`flex items-center gap-2 cursor-pointer ${field === 'name' ? "justify-between" : "justify-center" } `}
        onClick={() => handleSort(field)}
      >
        <p className="font-roboto font-bold text-center">{label}</p>
        <div className="flex flex-col">
          <ArrowUpward 
            sx={{ fontSize: 14 }} 
            className={isActive && sortDirection === 'asc' ? 'text-black' : 'text-gray-300'} 
          />
          <ArrowDownward 
            sx={{ fontSize: 14, marginTop: '-4px' }} 
            className={isActive && sortDirection === 'desc' ? 'text-black' : 'text-gray-300'} 
          />
        </div>
      </div>
    );
  };

  // Check if all visible items are checked
  const allVisibleChecked = sortedData.length > 0 && sortedData.every(item => checked.includes(item.id));

  return (
    <div>
      <TableContainer className="border-y border-black">
        <Table sx={{ borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow className="bg-[#f8fbfd] border-y border-black">
              <TableCell className="p-3 font-bold w-[40px]">
                <Tooltip title={"Select All"} arrow >
                  <Checkbox 
                    onChange={handleCheckAll} 
                    checked={allVisibleChecked}
                  />
                </Tooltip>
              </TableCell>
              <TableCell className="p-3 font-bold text-center">
                <SortHeader field="name" label="Name" />
              </TableCell>
              {tab === 0 ? (
                <>
                  <TableCell className="p-3 font-bold text-center">
                    <SortHeader field="section" label="Strand/Grade/Section" />
                  </TableCell>
                  <TableCell className="p-3 font-bold text-center">
                    <SortHeader field="adviser" label="Adviser" />
                  </TableCell>
                </>
              ) : tab === 1 ? (
                <>
                  <TableCell className="p-3 font-bold text-center">
                    <p className="mx-auto font-roboto font-bold text-center">Position</p>
                  </TableCell>
                  <TableCell className="p-3 font-bold text-center">
                    <SortHeader field="section" label="Strand/Grade/Section" />
                  </TableCell>
                </>
              ) : (
                <TableCell className="p-3 font-bold text-center">
                  <SortHeader field="position" label="Position" />
                </TableCell>
              )}
              <TableCell className="p-3 font-bold text-center">
                <p className="mx-auto font-roboto font-bold text-center">Email</p>
              </TableCell>
              <TableCell className="p-1 text-center w-[15%]">
                <p className="mx-auto font-roboto font-bold text-center">Actions</p>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((item, index) => (
              <TableRow key={item.id || item.ID}>
                <TableCell 
                  className="p-3 font-bold w-[40px]"
                  sx={{ borderBottom: "none" }}
                >
                  <Checkbox checked={checked.includes(item.id)} onChange={(event) => handleCheck(event, item.id)} />
                </TableCell>
                <TableCell 
                  className="p-3 text-center"
                  sx={{ borderBottom: "none" }}
                >
                  {item.firstName || item.name} {item.lastName || ""}
                </TableCell>
                {tab === 0 ? (
                  <>
                    <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}>
                      <p className="text-center">{item.section}</p>
                    </TableCell>
                    <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}>
                      <p className="text-center">{item.adviser}</p>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}>
                      <p className="text-center">{item.position}</p>
                    </TableCell>
                    {tab === 1 && (
                      <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}>
                        <p className="text-center">{item.section}</p>
                      </TableCell>
                    )}
                  </>
                )}
                <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}>
                  <p className="text-center">{item.email}</p>
                </TableCell>
                <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}>
                  <div className="flex justify-center">
                    <Tooltip title={getLabel("view")} arrow>
                      <IconButton onClick={() => handleEditButtonClick(item.id, false)}>
                        <Summarize className="text-[#4F46E5] bg-[#f8fbfd] rounded-full" />
                      </IconButton>
                    </Tooltip>
                                
                    <Tooltip title={getLabel("edit")} arrow>
                      <IconButton onClick={() => handleEditButtonClick(item.id, true)}>
                        <Edit className="text-yellow-400 bg-[#f8fbfd] rounded-full" />
                      </IconButton>
                    </Tooltip>
                                
                    <Tooltip title={getLabel("delete")} arrow>
                      <IconButton onClick={() => { setSelectedStudent(item); setOpenDeleteModal(true); }}>
                        <Delete className="text-red-400 bg-[#f8fbfd] rounded-full" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {data.length > 5 && (
        <div className="flex items-center justify-end p-2">
          <span className="pr-5">Show: </span>
          <Select value={rowsPerPage} onChange={handleRowsPerPageChange} size="small">
            {[5, 10, 15, 20, 25, 30].map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
          <div className="flex justify-center items-center p-2">
            <Button onClick={handlePreviousPage} disabled={page === 1}>
              <p className={`${page === 1 ? "text-gray-500" : "text-black"} text-2xl font-extrabold`}>{"<"}</p>
            </Button>
            <span className="mx-2">Page {page} of {totalPages}</span>
            <Button onClick={handleNextPage} disabled={page === totalPages}>
              <p className={`${page === totalPages ? "text-gray-500" : "text-black"} text-2xl font-extrabold`}>{">"}</p>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}