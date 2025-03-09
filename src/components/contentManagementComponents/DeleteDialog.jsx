import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";

export default function DeleteDialog({ open, onClose, onConfirm, deleteTarget, selectedItems }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {deleteTarget
            ? "Are you sure you want to delete this item?"
            : `Are you sure you want to delete ${selectedItems.length} selected item(s)?`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
      </DialogActions>
    </Dialog>
  );
}
