import { useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, IconButton } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const cmStyles = {
  boldBorderStyle: {
    fontWeight: "bold",
    borderTop: "2px solid #000",
    borderLeft: "1px solid #ddd",
    borderRight: "1px solid #ddd",
  },
  bordering: {
    border: "1px solid #ddd",
  }
};

export default function ContentTable({ tab, data, setSelectedItems, setDeleteTarget, setIsDeleteOpen, setNewItem, setEditMode, setEditId, setIsDialogOpen }) {
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
    setNewItem(item);  // Load selected item into dialog
    setIsDialogOpen(true);
  };

  return (
    <TableContainer className="table-container" sx={{ borderBottom: "2px solid #000" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" sx={cmStyles.boldBorderStyle}>
              <Checkbox
                indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                checked={selectedRows.length === data.length && data.length > 0}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell sx={cmStyles.boldBorderStyle}>Title</TableCell>
            <TableCell align="center" sx={cmStyles.boldBorderStyle}>Category</TableCell>
            {tab === 0 ? (
              <>
                <TableCell align="center" sx={cmStyles.boldBorderStyle}>Type</TableCell>
                <TableCell align="center" sx={cmStyles.boldBorderStyle}>Description</TableCell>
                <TableCell align="center" sx={cmStyles.boldBorderStyle}>Date Created</TableCell>
              </>
            ) : tab === 1 ? (
              <>
                <TableCell align="center" sx={cmStyles.boldBorderStyle}>Description</TableCell>
                <TableCell align="center" sx={cmStyles.boldBorderStyle}>Date Created</TableCell>
              </>
            ) : (
              <>
              <TableCell align="center" sx={cmStyles.boldBorderStyle}>Content</TableCell>
              <TableCell align="center" sx={cmStyles.boldBorderStyle}>Date Modified</TableCell>
              <TableCell align="center" sx={cmStyles.boldBorderStyle}>Date Created</TableCell>
              </>
              
            )}
            <TableCell align="center" sx={cmStyles.boldBorderStyle}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.ID || index}>
              <TableCell padding="checkbox" sx={cmStyles.bordering}>
                <Checkbox
                  checked={selectedRows.includes(item.ID)}
                  onChange={() => handleSelectRow(item.ID)}
                />
              </TableCell>
              <TableCell sx={cmStyles.bordering}>{item.title}</TableCell>
              <TableCell align="center" sx={cmStyles.bordering}>{item.category}</TableCell>
              {tab === 0 ? (
                <>
                  <TableCell align="center" sx={cmStyles.bordering}>{item.resourceType}</TableCell>
                  <TableCell align="center" sx={cmStyles.bordering}>{item.description}</TableCell>
                  <TableCell align="center" sx={cmStyles.bordering}>{item.created_at}</TableCell>
                  <TableCell align="center" sx={cmStyles.bordering}>
                    <IconButton className="delete-button" onClick={() => handleDeleteClick(item.ID)}>
                    <Delete />
                    </IconButton>
                  </TableCell>
                </>
              ) : tab === 1 ? (
                <>
                  <TableCell align="center" sx={cmStyles.bordering}>{item.description}</TableCell>
                  <TableCell align="center" sx={cmStyles.bordering}>{item.created_at}</TableCell>
                  <TableCell align="center" sx={cmStyles.bordering}>
                    <IconButton className="delete-button" onClick={() => handleDeleteClick(item.ID)}>
                    <Delete />
                    </IconButton>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell align="center" sx={cmStyles.bordering}>{item.announcementContent}</TableCell>
                  <TableCell align="center" sx={cmStyles.bordering}>{item.modified_at}</TableCell>
                  <TableCell align="center" sx={cmStyles.bordering}>{item.created_at}</TableCell>
                  <TableCell align="center" sx={cmStyles.bordering}>
                    <IconButton className="edit-button" onClick={() => handleEditClick(item)}>
                    <Edit />
                    </IconButton>
                    <IconButton className="delete-button" onClick={() => handleDeleteClick(item.ID)}>
                    <Delete />
                    </IconButton>
                  </TableCell>
                </>
              )}
              
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
