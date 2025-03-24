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

export default function UserTable( {
  tab,
  students,
  staffs,
  allChecked,
  checked,
  handleCheckAll,
  handleCheck,
  handleEditButtonClick,
  handleDeleteButtonClick,
  }
  ) {
  return (
    <TableContainer className="border border-black">
      <Table>
        <TableHead>
          <TableRow className="bg-white border-b border-black">
          <TableCell className="p-3 border-r font-bold w-[40px]">
              <Checkbox checked={allChecked} onChange={handleCheckAll} />
            </TableCell>
            {tab === 0 ? (
              <>
                <TableCell className="p-3 border-r font-bold text-center">
                  First Name
                </TableCell>
                <TableCell className="p-3 border-r font-bold text-center">
                  Last Name
                </TableCell>
                <TableCell className="p-3 border-r font-bold text-center">
                  Section
                </TableCell>
                <TableCell className="p-3 border-r font-bold text-center">
                  Adviser
                </TableCell>
                <TableCell className="p-3 border-r font-bold text-center">
                  Email
                </TableCell>
              </>
            ) : (
              <>
                <TableCell className="p-3 border-r font-bold text-center">
                  Name
                </TableCell>
                <TableCell className="p-3 border-r font-bold text-center">
                  Position
                </TableCell>
                <TableCell className="p-3 border-r font-bold text-center">
                  Email
                </TableCell>
              </>
            )}
            <TableCell className="p-1 text-center w-[12.5%]">
              <p className="m-auto text-center">Actions</p>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tab === 0
            ? students.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell className="p-3 border-r font-bold w-[40px]">
                    <Checkbox checked={checked.includes(index)} onChange={(event) => handleCheck(event, index)} />
                  </TableCell>
                  <TableCell sx={styles.bordering}>{student.firstName}</TableCell>
                  <TableCell className="p-3 border-r text-center">{student.lastName}</TableCell>
                  <TableCell className="p-3 border-r text-center">{student.section}</TableCell>
                  <TableCell className="p-3 border-r text-center">{student.adviser}</TableCell>
                  <TableCell className="p-3 border-r text-center">{student.email}</TableCell>
                  <TableCell className="p-3 border-r text-center">
                    <div className="flex justify-center">
                    <IconButton className="edit-button" onClick={() => handleEditButtonClick(index)}>
                      <Edit />
                    </IconButton>
                    <IconButton className="delete-button" onClick={() => handleDeleteButtonClick(index)}>
                      <Delete />
                    </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            : staffs.map((staff, index) => (
                <TableRow key={staff.ID}>
                  <TableCell padding="checkbox" sx={styles.bordering}>
                    <Checkbox checked={checked.includes(index)} onChange={(event) => handleCheck(event, index)} />
                  </TableCell>
                  <TableCell sx={styles.bordering}>{staff.name}</TableCell>
                  <TableCell className="p-3 border-r text-center">{staff.position}</TableCell>
                  <TableCell className="p-3 border-r text-center">{staff.email}</TableCell>
                  <TableCell className="p-3 border-r text-center">
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
