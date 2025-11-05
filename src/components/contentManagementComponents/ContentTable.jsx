import { useEffect, useState } from "react";
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
import { Edit, Delete, Summarize, ArrowUpward, ArrowDownward } from "@mui/icons-material";

export default function ContentTable({ tab, data, setSelectedItems, setDeleteTarget, setIsDeleteOpen, setNewItem, setEditMode, setEditId, setIsDialogOpen, setIsArticle, setVideoDialog, setIsVideo, selectedRows, setSelectedRows, setIsAdd, setViewMode}) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  useEffect(() => {
    setPage(1);
    setSortField(null);
    setSortDirection('asc');
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
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null/undefined values
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      // Convert to lowercase for string comparison
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      // Handle date fields
      if (sortField.includes('_at') || sortField === 'end_date') {
        aVal = new Date(aVal).getTime() || 0;
        bVal = new Date(bVal).getTime() || 0;
      }

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

  const getLabel = (action) => {
    const target =
      tab === 0 ? "Resource" :
      tab === 1 ? "Wellness" :
      tab === 2 ? "Announcement" :
      tab === 3 ? "FAQ" :
      tab === 4 ? "Trigger" :
      "Record";

    return {
      view: `View ${target} Details`,
      edit: `Edit ${target} Details`,
      delete: `Remove ${target}`
    }[action];
  };

  const SortHeader = ({ field, label, isTitle = false }) => {
    const isActive = sortField === field;
    
    return (
      <div 
        className={`flex items-center gap-1 cursor-pointer ${isTitle ? 'justify-between' : 'justify-center'}`}
        onClick={() => handleSort(field)}
      >
        <p className={`font-roboto font-bold ${isTitle ? '' : 'text-center'}`}>{label}</p>
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

  const TableHeadCells = (tab) => {
    switch (tab) {
      case 0:
        return (
          <>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="resourceType" label="Type" />
            </TableCell>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="description" label="Description" />
            </TableCell>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="status" label="Status" />
            </TableCell>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="posted_at" label="Posted" />
            </TableCell>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="created_at" label="Created" />
            </TableCell>
          </>
        );
      case 1:
        return (
          <>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="description" label="Description" />
            </TableCell>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="status" label="Status" />
            </TableCell>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="posted_at" label="Posted" />
            </TableCell>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="created_at" label="Created" />
            </TableCell>
          </>
        );
      case 2:
        return (
          <>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="announcementContent" label="Content" />
            </TableCell>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="end_date" label="End Date" />
            </TableCell>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="modified_at" label="Date Modified" />
            </TableCell>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="created_at" label="Date Created" />
            </TableCell>
          </>
        );
      case 3:
        return (
          <>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="answer" label="Answer" />
            </TableCell>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="status" label="Status" />
            </TableCell>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="posted_at" label="Date Posted" />
            </TableCell>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="created_at" label="Date Created" />
            </TableCell>
          </>
        );
      case 4:
        return (
          <>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="status" label="Status" />
            </TableCell>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="posted_at" label="Date Posted" />
            </TableCell>
            <TableCell className="p-3 font-bold text-center">
              <SortHeader field="created_at" label="Date Created" />
            </TableCell>
          </>
        );
      default:
        return null;
    }
  };

  const noFoundMessage = () => {
    switch (tab) {
      case 0:
        return "No Resources Found";
      case 1:
        return "No Wellness Found";
      case 2:
        return "No Announcements Found";
      case 3:
        return "No FAQs Found";
      case 4:
        return "No Triggers Found"; 
      default:
        return "No Items Found";
    }
  };

  const tableBodyCells = (item, tab) => {
    switch (tab) {
      case 0:
        return (
          <>
            <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.resourceType}</p></TableCell>
            <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.description ? item.description : "No Description Available"}</p></TableCell>
            <TableCell className="p-3 font-bold text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.status}</p></TableCell>
            <TableCell className="p-3 font-bold text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.posted_at)}</p></TableCell>
            <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.created_at)}</p></TableCell>
          </>
        );
      case 1:
        return (
          <>
            <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.description}</p></TableCell>
            <TableCell className="p-3 font-bold text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.status}</p></TableCell>
            <TableCell className="p-3 font-bold text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.posted_at)}</p></TableCell>
            <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.created_at)}</p></TableCell>
          </>
        );
      case 2:
        return (
          <>
            <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.announcementContent}</p></TableCell>
            <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.end_date)}</p></TableCell>
            <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.modified_at)}</p></TableCell>
            <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.created_at)}</p></TableCell>
          </>
        );
      case 3:
        return (
          <>
            <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.answer}</p></TableCell>
            <TableCell className="p-3 font-bold text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.status}</p></TableCell>
            <TableCell className="p-3 font-bold text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.posted_at)}</p></TableCell>
            <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.created_at)}</p></TableCell>
          </>
        );
      case 4: 
        return (
          <>
            <TableCell className="p-3 font-bold text-center" sx={{ borderBottom: "none" }}><p className="text-center">{item.status}</p></TableCell>
            <TableCell className="p-3 font-bold text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.posted_at)}</p></TableCell>
            <TableCell className="p-3 text-center" sx={{ borderBottom: "none" }}><p className="text-center">{formatDate(item.created_at)}</p></TableCell>
          </>
        )
      default:
        return null;
    }
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
              <TableCell className="p-3 font-bold text-center">
                {tab === 3 ? (
                  <SortHeader field="question" label="Question" isTitle />
                ) : tab === 4 ? (
                  <SortHeader field="chatTriggers" label="Trigger" isTitle />
                ) : (
                  <SortHeader field="title" label="Title" isTitle />
                )}
              </TableCell>
              <TableCell className="p-3 font-bold text-center">
                <SortHeader field="category" label="Category" />
              </TableCell>
              {TableHeadCells(tab)}
              <TableCell className="p-1 text-center w-[12.5%]">
                <p className="mx-auto font-roboto font-bold text-center">Actions</p>
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody sx={{ borderCollapse: "collapse" }} className="font-roboto">
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={tab === 0 ? 10 : tab === 1 ? 9 : 9} 
                  sx={{ borderBottom: "none" }}
                  className="text-center py-10 text-gray-500"
                >
                  <p className="text-center font-roboto font-bold">{noFoundMessage(tab)}</p>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((item, index) => (
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
                    {tab === 3 ? item.question : tab === 4 ? item.chatTriggers : item.title}
                  </TableCell>
                  <TableCell 
                    className="p-3 text-center"
                    sx={{ borderBottom: "none" }}
                  >
                    <p className="text-center">{item.category}</p>
                  </TableCell>
                  {tableBodyCells(item, tab)}
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
      {sortedData.length > 5 && (
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