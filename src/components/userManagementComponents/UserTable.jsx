import React from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const styles = {
    boldBorder: { 
        fontWeight: "bold", 
        borderTop: "2px solid #000", 
        borderLeft: "1px solid #ddd", 
        borderRight: "1px solid #ddd" 
    },
    bordering : { 
        border: "1px solid #ddd" 
    }
}

const UserTable = ({
  tab,
  students,
  staffs,
  allChecked,
  checked,
  handleCheckAll,
  handleCheck,
  handleEditButtonClick,
  handleDeleteButtonClick,
}) => {
  return (
    <TableContainer className="table-container" sx={{ borderBottom: "2px solid #000" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" sx={{ borderTop: "2px solid #000", borderLeft: "1px solid #ddd" }}>
              <Checkbox checked={allChecked} onChange={handleCheckAll} />
            </TableCell>
            {tab === 0 ? (
              <>
                <TableCell sx={styles.boldBorder}>
                  First Name
                </TableCell>
                <TableCell align="center" sx={styles.boldBorder}>
                  Last Name
                </TableCell>
                <TableCell align="center" sx={styles.boldBorder}>
                  Section
                </TableCell>
                <TableCell align="center" sx={styles.boldBorder}>
                  Adviser
                </TableCell>
                <TableCell align="center" sx={styles.boldBorder}>
                  Email
                </TableCell>
                <TableCell align="center" sx={styles.boldBorder}>
                  Actions
                </TableCell>
              </>
            ) : (
              <>
                <TableCell sx={styles.boldBorder}>
                  Name
                </TableCell>
                <TableCell align="center" sx={styles.boldBorder}>
                  Position
                </TableCell>
                <TableCell align="center" sx={styles.boldBorder}>
                  Email
                </TableCell>
                <TableCell align="center" sx={styles.boldBorder}>
                  Actions
                </TableCell>
              </>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {tab === 0
            ? students.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell padding="checkbox" sx={styles.bordering}>
                    <Checkbox checked={checked.includes(index)} onChange={(event) => handleCheck(event, index)} />
                  </TableCell>
                  <TableCell sx={styles.bordering}>{student.firstName}</TableCell>
                  <TableCell align="center" sx={styles.bordering}>{student.lastName}</TableCell>
                  <TableCell align="center" sx={styles.bordering}>{student.section}</TableCell>
                  <TableCell align="center" sx={styles.bordering}>{student.adviser}</TableCell>
                  <TableCell align="center" sx={styles.bordering}>{student.email}</TableCell>
                  <TableCell align="center" sx={styles.bordering}>
                    <IconButton className="edit-button" onClick={() => handleEditButtonClick(index)}>
                      <Edit />
                    </IconButton>
                    <IconButton className="delete-button" onClick={() => handleDeleteButtonClick(index)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            : staffs.map((staff, index) => (
                <TableRow key={staff.ID}>
                  <TableCell padding="checkbox" sx={styles.bordering}>
                    <Checkbox checked={checked.includes(index)} onChange={(event) => handleCheck(event, index)} />
                  </TableCell>
                  <TableCell sx={styles.bordering}>{staff.name}</TableCell>
                  <TableCell align="center" sx={styles.bordering}>{staff.position}</TableCell>
                  <TableCell align="center" sx={styles.bordering}>{staff.email}</TableCell>
                  <TableCell align="center" sx={styles.bordering}>
                    <IconButton className="edit-button" onClick={() => handleEditButtonClick(index)}>
                      <Edit />
                    </IconButton>
                    <IconButton className="delete-button" onClick={() => handleDeleteButtonClick(index)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
