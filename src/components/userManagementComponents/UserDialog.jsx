import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const UserDialog = ({
  isModalOpen,
  handleModalClose,
  isEditMode,
  tab,
  newStudent,
  newStaff,
  handleInputChange,
  handleFormSubmit,
}) => {
  return (
    <Dialog open={isModalOpen} onClose={handleModalClose}>
      <DialogTitle>{`${isEditMode ? "Edit" : "Add"} ${tab === 0 ? "Student" : "Guidance Staff"}`}</DialogTitle>
      <DialogContent>
        {tab === 0 ? (
          <>
            <TextField
              autoFocus
              margin="dense"
              name="firstName"
              label="First Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newStudent.firstName}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="lastName"
              label="Last Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newStudent.lastName}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="section"
              label="Section"
              type="text"
              fullWidth
              variant="outlined"
              value={newStudent.section}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="adviser"
              label="Adviser"
              type="text"
              fullWidth
              variant="outlined"
              value={newStudent.adviser}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={newStudent.email}
              onChange={handleInputChange}
            />
          </>
        ) : (
          <>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newStaff.name}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="position"
              label="Position"
              type="text"
              fullWidth
              variant="outlined"
              value={newStaff.position}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={newStaff.email}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="password"
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={newStaff.password}
              onChange={handleInputChange}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleModalClose}>Cancel</Button>
        <Button onClick={handleFormSubmit}>{isEditMode ? "Save" : "Add"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDialog;