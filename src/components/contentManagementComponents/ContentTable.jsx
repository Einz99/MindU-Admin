import { useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, IconButton } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

export default function ContentTable({ tab, data, setSelectedItems, setDeleteTarget, setIsDeleteOpen, setNewItem, setEditMode, setEditId, setIsDialogOpen, setIsArticle, setVideoDialog, setIsVideo }) {
  const [selectedRows, setSelectedRows] = useState([]);

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

  const handleEditClick = (item) => {
    setEditMode(true);
    setEditId(item.ID);
    setNewItem(item);
    // Check file type if available
    if (item.filepath) {
      const lowerPath = item.filepath.toLowerCase();
      if (lowerPath.includes("pdf") || lowerPath.includes("docs")) {
        setIsArticle(true);
      } else if (lowerPath.includes("mp4") || (item.resourceType && item.resourceType.toLowerCase() === "video")) {
        setVideoDialog(true);
        setIsVideo(true);
      }
    }
    setIsDialogOpen(true);
  };

  return (
    <TableContainer className="border border-black">
      <Table>
        {/* Table Head */}
        <TableHead>
          <TableRow className="bg-white border-b border-black">
            <TableCell className="p-3 border-r font-bold w-[40px]">
              <Checkbox
                indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                checked={selectedRows.length === data.length && data.length > 0}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell className="p-3 border-r font-bold text-center">Title</TableCell>
            <TableCell className="p-3 border-r font-bold text-center">Category</TableCell>
            {tab === 0 ? (
              <>
                <TableCell className="p-3 border-r font-bold text-center">Type</TableCell>
                <TableCell className="p-3 border-r font-bold text-center">Description</TableCell>
                <TableCell className="p-3 border-r font-bold text-center">Date Created</TableCell>
              </>
            ) : tab === 1 ? (
              <>
                <TableCell className="p-3 border-r font-bold text-center">Description</TableCell>
                <TableCell className="p-3 border-r font-bold text-center">Date Created</TableCell>
              </>
            ) : (
              <>
                <TableCell className="p-3 border-r font-bold text-center">Content</TableCell>
                <TableCell className="p-3 border-r font-bold text-center">Date Modified</TableCell>
                <TableCell className="p-3 border-r font-bold text-center">Date Created</TableCell>
              </>
            )}
            <TableCell className="p-1 text-center w-[12.5%]">
                          <p className="m-auto text-center">Actions</p>
            </TableCell>
          </TableRow>
        </TableHead>

        {/* Table Body */}
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.ID || index} className="border-b">
              <TableCell className="p-3 border-r font-bold w-[40px]">
                <div className="flex justify-center">
                <Checkbox
                  checked={selectedRows.includes(item.ID)}
                  onChange={() => handleSelectRow(item.ID)}
                />
                </div>
              </TableCell>
              <TableCell className="p-3 border-r text-center">{item.title}</TableCell>
              <TableCell className="p-3 border-r text-center">{item.category}</TableCell>
              {tab === 0 ? (
                <>
                  <TableCell className="p-3 border-r text-center">{item.resourceType}</TableCell>
                  <TableCell className="p-3 border-r text-center">{item.description}</TableCell>
                  <TableCell className="p-3 border-r text-center">{item.created_at}</TableCell>
                </>
              ) : tab === 1 ? (
                <>
                  <TableCell className="p-3 border-r text-center">{item.description}</TableCell>
                  <TableCell className="p-3 border-r text-center">{item.created_at}</TableCell>
                </>
              ) : (
                <>
                  <TableCell className="p-3 border-r text-center">{item.announcementContent}</TableCell>
                  <TableCell className="p-3 border-r text-center">{item.modified_at}</TableCell>
                  <TableCell className="p-3 border-r text-center">{item.created_at}</TableCell>
                </>
              )}
              <TableCell className="p-3 text-center">
                <div className="flex justify-center">
                <IconButton className="text-blue-500" onClick={() => handleEditClick(item)}>
                  <Edit />
                </IconButton>
                <IconButton className="text-red-500" onClick={() => handleDeleteClick(item.ID)}>
                  <Delete />
                </IconButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
