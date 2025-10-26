import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Checkbox, 
  IconButton,
  Select,
  MenuItem,
  Button,
  Tooltip,
 } from "@mui/material";
import { Edit, Delete, Summarize } from "@mui/icons-material";

export default function ContentTable({ tab, data, setSelectedItems, setDeleteTarget, setIsDeleteOpen, setNewItem, setEditMode, setEditId, setIsDialogOpen, setIsArticle, setVideoDialog, setIsVideo, selectedRows, setSelectedRows, setIsAdd, setViewMode}) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(data.length / rowsPerPage)

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

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = data.map((item) => item.ID);
      setSelectedRows(allIds);
      setSelectedItems(allIds);
    } else {
      setSelectedRows([]);
      setSelectedItems([]);
    }
  };

  const handleSelectRow = (id) => {
    let newSelectedRows = [...selectedRows];
    if (newSelectedRows.includes(id)) {
      newSelectedRows = newSelectedRows.filter((rowId) => rowId !== id);
    } else {
      newSelectedRows.push(id);
    }
    setSelectedRows(newSelectedRows);
    setSelectedItems(newSelectedRows);
  };

  const handleDeleteClick = (id) => {
    setDeleteTarget(id);
    setIsDeleteOpen(true);
  };

  const handleEditClick = (item, Editmode, view) => {
    setIsAdd(false);
    setEditMode(Editmode);
    setEditId(item.ID);
    setNewItem(item);
    setViewMode(view)
    // Check file type if available
    if (item.isResource === 1) {
      if(item.resourceType === "Document") {
        setIsArticle(true);
      } else {
        setIsVideo(true);
        setIsDialogOpen(true);
      }
    } else if (item.isResource === 0) {
      setIsVideo(true);
      setIsDialogOpen(true);
    } else {
      setIsVideo(false);
      setIsDialogOpen(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return ""; // Handle null/undefined cases
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // const filteredUnexpiredAnnouncements = () => {
  //   if (tab === 2) {
  //     const now = new Date();
  //     return data.filter((item) => {
  //       const modifiedDate = new Date(item.modified_at);
  //       const createdDate = new Date(item.created_at);
  //       return createdDate <= now && modifiedDate >= now;
  //     });
  //   }
  //   return data; // return full data for other tabs if needed
  // };

  const getLabel = (action) => {
    const target =
      tab === 0 ? "Resource" :
      tab === 1 ? "Wellness" :
      tab === 2 ? "Announcement" :
      "Record";

    return {
      view: `View ${target} Details`,
      edit: `Edit ${target} Details`,
      delete: `Remove ${target}`
    }[action];
  };

  return (
    <div>
      <TableContainer className="border-b border-black">
        <Table 
        sx={{ borderCollapse: "collapse" }}>
          {/* Table Head */}
          <TableHead>
            <TableRow className="bg-[#f8fbfd] border-y border-black">
              <TableCell className="p-3 font-bold w-[40px]">
                <Checkbox
                  indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell className="p-3 font-bold">
                <p className="mx-auto font-roboto font-bold">Title</p>
              </TableCell>
              <TableCell className="p-3 font-bold text-center">
                <p className="mx-auto font-roboto font-bold text-center">Category</p>
              </TableCell>
              {tab === 0 ? (
                <>
                  <TableCell className="p-3 font-bold text-center">
                    <p className="mx-auto font-roboto font-bold text-center">Type</p>
                  </TableCell>
                  <TableCell className="p-3 font-bold text-center">
                    <p className="mx-auto font-roboto font-bold text-center">Description</p>
                  </TableCell>
                  <TableCell className="p-3 font-bold text-center">
                    <p className="mx-auto font-roboto font-bold text-center">Status</p>
                  </TableCell>
                  <TableCell className="p-3 font-bold text-center">
                    <p className="mx-auto font-roboto font-bold text-center">Date Posted</p>
                  </TableCell>
                  <TableCell className="p-3 font-bold text-center">
                    <p className="mx-auto font-roboto font-bold text-center">Date Created</p>
                  </TableCell>
                </>
              ) : tab === 1 ? (
                <>
                  <TableCell className="p-3 font-bold text-center">
                    <p className="mx-auto font-roboto font-bold text-center">Description</p>
                  </TableCell>
                  <TableCell className="p-3 font-bold text-center">
                    <p className="mx-auto font-roboto font-bold text-center">Status</p>
                  </TableCell>
                  <TableCell className="p-3 font-bold text-center">
                    <p className="mx-auto font-roboto font-bold text-center">Date Posted</p>
                  </TableCell>
                  <TableCell className="p-3 font-bold text-center">
                    <p className="mx-auto font-roboto font-bold text-center">Date Created</p>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell className="p-3 font-bold text-center">
                    <p className="mx-auto font-roboto font-bold text-center">Content</p>
                  </TableCell>
                  <TableCell className="p-3 font-bold text-center">
                    <p className="mx-auto font-roboto font-bold text-center">End Date</p>
                  </TableCell>
                  <TableCell className="p-3 font-bold text-center">
                    <p className="mx-auto font-roboto font-bold text-center">Date Modified</p>
                  </TableCell>
                  <TableCell className="p-3 font-bold text-center">
                    <p className="mx-auto font-roboto font-bold text-center">Date Created</p>
                  </TableCell>
                </>
              )}
              <TableCell className="p-1 text-center w-[12.5%]">
                <p className="mx-auto font-roboto font-bold text-center">Actions</p>
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody sx={{ borderCollapse: "collapse" }} className="font-roboto">
            {data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={tab === 0 ? 10 : tab === 1 ? 9 : 9} 
                  sx={{ borderBottom: "none" }}
                  className="text-center py-10 text-gray-500"
                >
                  <p className="text-center font-roboto font-bold">No {tab === 0 ? "Resources Found" : tab === 1 ? "Wellness Found" : "Announcement Found"}</p>
                </TableCell>
              </TableRow>
            ) : (
              data.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((item, index) => (
                <TableRow key={item.ID || index}>
                  <TableCell 
                    className="p-3 font-bold w-[40px]"
                    sx={{ borderBottom: "none" }}
                  >
                    <div className="flex justify-center">
                    <Checkbox
                      checked={selectedRows.includes(item.ID)}
                      onChange={() => handleSelectRow(item.ID)}
                    />
                    </div>
                  </TableCell>
                  <TableCell 
                    className="p-3 text-center"
                    sx={{ borderBottom: "none" }}
                  >
                    {item.title}
                  </TableCell>
                  <TableCell 
                    className="p-3 text-center"
                    sx={{ borderBottom: "none" }}
                  >
                    <p className="text-center">{item.category}</p>
                  </TableCell>
                  {tab === 0 ? (
                    <>
                      <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.resourceType}</p></TableCell>
                      <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.description ? item.description : "No Description Available"}</p></TableCell>
                      <TableCell className="p-3 font-bold text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.status}</p></TableCell>
                      <TableCell className="p-3 font-bold text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.posted_at)}</p></TableCell>
                      <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.created_at)}</p></TableCell>
                    </>
                  ) : tab === 1 ? (
                    <>
                      <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.description}</p></TableCell>
                    <TableCell className="p-3 font-bold text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.status}</p></TableCell>
                    <TableCell className="p-3 font-bold text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.posted_at)}</p></TableCell>
                      <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.created_at)}</p></TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.announcementContent}</p></TableCell>
                      <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.end_date)}</p></TableCell>
                      <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.modified_at)}</p></TableCell>
                      <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.created_at)}</p></TableCell>
                    </>
                  )}
                  <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}>
                    <div className="flex justify-center">
                      <Tooltip title={getLabel("view")} arrow>
                        <IconButton onClick={() => handleEditClick(item, false, true)}>
                          <Summarize className="text-[#4F46E5] bg-[#f8fbfd] rounded-full" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={getLabel("edit")} arrow>
                        <IconButton onClick={() => handleEditClick(item, true, false)}>
                          <Edit className="text-yellow-400 bg-[#f8fbfd] rounded-full" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={getLabel("delete")} arrow>
                        <IconButton onClick={() => handleDeleteClick(item.ID)}>
                          <Delete className="text-red-400 bg-[#f8fbfd] rounded-full" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              )))}
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
