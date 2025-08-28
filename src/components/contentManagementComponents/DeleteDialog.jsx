import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

export default function DeleteDialog({ open, onClose, onConfirm, deleteTarget, selectedItems, data, loading }) {

  const dataDetails = data.find((item) => item.ID === deleteTarget);
  return (
    <Dialog open={open} onClose={onClose}
      sx={{
        "& .MuiPaper-root": {
          backgroundColor: "white", // Light blue for Restore, Light red for Delete
          color: "#000", // Text color
          borderRadius: "25px", // Optional: rounded corners
        },
      }}
    >
      <DialogTitle className="bg-[#e3b7b7] relative">
        Event Details
        <DialogActions className="absolute -top-1 right-0">
          <IconButton onClick={onClose} className="rounded-full ">
            <Close  sx={{fontSize: 40, color: 'black'}}></Close>
          </IconButton>
        </DialogActions>
      </DialogTitle>
      <DialogContent>
          {deleteTarget ? (
                <div className="text-center items-center mb-3">
                  <p className="my-3">Are you sure you want to delete this item?</p>
                  <p className="font-bold">{dataDetails.title}</p> 
                </div>
            ) : (
                <div className="text-center items-center mb-3">
                  <p className="my-3">Are you sure you want to delete {selectedItems.length} selected item(s)?</p>
                  {selectedItems.map((item) => {
                    const itemDetails = data.find((dataItem) => dataItem.ID === item);
                    return (
                      <p key={item} className="font-bold">{itemDetails.title}</p>
                    );
                  })}
                </div>
            )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <p className="text-base font-roboto font-bold text-[#64748b] p-2">Cancel</p>
        </Button>
        <Button 
          onClick={onConfirm} 
          className="py-20 px-10"
          disabled={loading}
        >
          <p className="text-base bg-[#ef4444] py-2 px-4 text-white rounded-full">{loading ? "Deleting..." : "Delete"}</p>
        </Button>
      </DialogActions>
    </Dialog>
  );
}
