import React, { useState } from "react";
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
import { Edit, Delete, Summarize } from "@mui/icons-material";

export default function UserTable({
  tab,
  students,
  staffs,
  allChecked,
  checked,
  handleCheckAll,
  handleCheck,
  handleEditButtonClick,
  setSelectedStudent,
  setOpenDeleteModal,
}) {
  const staff = JSON.parse(localStorage.getItem("staff") || "{}");
  
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  
  const filteredAdvisers = staffs.filter((staff) => staff.position === "Adviser");
  const filteredGuidanceStaffs = staffs.filter(
    (staff) => staff.position !== "Adviser" && staff.name !== "Mind-U"
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

  const totalPages = Math.ceil(data.length / rowsPerPage);

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

  return (
    <div>
      <TableContainer className="border-y border-black">
        <Table
        sx={{ borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow className="bg-[#f8fbfd] border-y border-black">
              <TableCell className="p-3 font-bold w-[40px]">
                <Checkbox checked={allChecked} onChange={handleCheckAll} />
              </TableCell>
              <TableCell className="p-3 font-bold text-center"><p className="mx-auto font-roboto font-bold">Name</p></TableCell>
              {tab === 0 ? (
                <>
                  <TableCell className="p-3 font-bold text-center"><p className="mx-auto font-roboto font-bold text-center">Section</p></TableCell>
                  <TableCell className="p-3 font-bold text-center"><p className="mx-auto font-roboto font-bold text-center">Adviser</p></TableCell>
                </>
              ) : (
                <>
                  <TableCell className="p-3 font-bold text-center"><p className="mx-auto font-roboto font-bold text-center">Position</p></TableCell>
                  {tab === 1 && (
                    <TableCell className="p-3 font-bold text-center"><p className="mx-auto font-roboto font-bold text-center">Section</p></TableCell>
                  )}
                </>
              )}
              <TableCell className="p-3 font-bold text-center"><p className="mx-auto font-roboto font-bold text-center">Email</p></TableCell>
              <TableCell className="p-1 text-center w-[15%]"><p className="mx-auto font-roboto font-bold text-center">Actions</p></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((item, index) => (
              <TableRow key={item.id || item.ID}>
                <TableCell 
                  className="p-3 font-bold w-[40px]"
                  sx={{ borderBottom: "none" }}
                >
                  <Checkbox checked={checked.includes(index)} onChange={(event) => handleCheck(event, index)} />
                </TableCell>
                <TableCell 
                  className="p-3 text-center"
                  sx={{ borderBottom: "none" }}
                >
                  {item.firstName || item.name} {item.lastName || ""}
                </TableCell>
                {tab === 0 ? (
                  <>
                    <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.section}</p></TableCell>
                    <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.adviser}</p></TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.position}</p></TableCell>
                    {tab === 1 && (
                      <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.section}</p></TableCell>
                    )}
                  </>
                )}
                <TableCell className="p-3 text-center"  sx={{ borderBottom: "none" }}><p className="text-center">{item.email}</p></TableCell>
                <TableCell className="p-3 text-center"  sx={{ borderBottom: "none" }}>
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
              <Button onClick={handlePreviousPage} disabled={page === 1}><p className={`${page === 1 ? "text-gray-500" : "text-black"} text-2xl font-extrabold`}>{"<"}</p></Button>
              <span className="mx-2">Page {page} of {totalPages}</span>
              <Button onClick={handleNextPage} disabled={page === totalPages}><p className={`${page === totalPages ? "text-gray-500" : "text-black"} text-2xl font-extrabold`}>{">"}</p></Button>
            </div>
        </div>
      )}
    </div>
  );
}
