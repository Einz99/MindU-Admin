import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import ContentTabs from "../components/contentManagementComponents/ContentTabs";
import ContentTable from "../components/contentManagementComponents/ContentTable";
import ContentDialog from "../components/contentManagementComponents/ContentDialog";
import DeleteDialog from "../components/contentManagementComponents/DeleteDialog";
import { API } from "../api";
import { useContext } from 'react';
import { OpenContext } from '../contexts/OpenContext';
import { Dialog, DialogTitle, DialogActions, DialogContent, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

export default function ContentManagement() {
  const { open, setOpen } = useContext(OpenContext);
  const [tab, setTab] = useState(0);
  const [data, setData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [videoDialog, setVideoDialog] = useState(false);
  const [isArticle, setIsArticle] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // <-- search state
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAdd, setIsAdd] = useState(true);
  const [viewMode, setViewMode] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const endpoints = [
        `${API}/resources/`,
        `${API}/resources/wellness`,
        `${API}/announcements`,
        `${API}/chatbotSettings/admin/all`,
        `${API}/chatbotSettings/admin/all-triggers`
      ];
      const response = await axios.get(endpoints[tab]);
      if(tab === 3) {
        setData(response.data.faqs);
        return;
      }
      if (tab === 4) {
        setData(response.data.triggers);
        return;
      }
      setData(response.data);
    } catch (error) {
    }
  }, [tab]);

  const filterData = data?.filter((item) => (
    (item?.title && item.title.toLowerCase().includes(searchTerm?.toLowerCase() || "")) ||
    (item?.question && item.question.toLowerCase().includes(searchTerm?.toLowerCase() || "")) ||
    (item?.category && item.category.toLowerCase().includes(searchTerm?.toLowerCase() || "")) ||
    (item?.resourceType && item.resourceType.toLowerCase().includes(searchTerm?.toLowerCase() || ""))
  )) || [];

  const handleDrawerToggle = () => setOpen((prev) => !prev);

  useEffect(() => {
    fetchData();
  }, [fetchData, reloadKey]);

  useEffect(() => {
    fetchData(); // initial fetch
    
    const interval = setInterval(() => {
      fetchData(); // refetch every 60 seconds
    }, 60000); // 60,000ms = 60s
  
    return () => clearInterval(interval); // cleanup on unmount
  }, [fetchData]);

  const updateContent = () => {
    setReloadKey((prev) => prev + 1);
  }

  const handleDeleteConfirm = async () => {
  try {
    const deleteEndpoints = [
      `${API}/resources/`,
      `${API}/resources/`,
      `${API}/announcements/`,
      `${API}/chatbotSettings/admin/`, // FAQ endpoint
      `${API}/chatbotSettings/admin/trigger/`  // Triggers endpoint
    ];
    setLoading(true);
    const staff = JSON.parse(localStorage.getItem("staff"));
    
    if (deleteTarget) {
      // Single delete
      await axios.post(`${deleteEndpoints[tab]}delete-multiple`, { 
        ids: [deleteTarget], 
        staff_name: staff.name, 
        staff_position: staff.position 
      });
      setData((prevData) => prevData.filter((item) => (item.ID || item.id) !== deleteTarget));
      setDeleteTarget(null);
      updateContent();
      onCloseDelete();
      setLoading(false);
    } else if (selectedItems.length > 0) {
      // Bulk delete
      await axios.post(`${deleteEndpoints[tab]}delete-multiple`, { 
        ids: selectedItems, 
        staff_name: staff.name, 
        staff_position: staff.position 
      });
      setData((prevData) => prevData.filter((item) => !selectedItems.includes(item.ID || item.id)));
      setSelectedItems([]);
      updateContent();
      onCloseDelete();
      setLoading(false);
    }
    
    setIsDeleteOpen(false);
    setLoading(false);
    
    const messages = [
      "Resource Deleted Successfully",
      "Wellness Deleted Successfully",
      "Announcement Deleted Successfully",
      "FAQ Deleted Successfully"
    ];
    
    setAlertMessage(messages[tab]);
    setIsSuccessful(true);
    setOpenError(true);
  } catch (error) {
    console.error("Error deleting content:", error);
    setAlertMessage("Failed to delete content.");
    setIsSuccessful(false);
    setOpenError(true);
    setLoading(false);
  }
};

  const handleDeleteOpen = () => {
    if (selectedItems.length === 0) {
      setAlertMessage("No items selected for deletion.");
      setIsSuccessful(false);
      setOpenError(true);
      return;
    }
    setIsDeleteOpen(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const onCloseDelete = () => {
    setIsDeleteOpen(false);
    setSelectedItems([]);
    setSelectedRows([]);
  }
  
  return (
    <div className="flex bg-[#f8fafc] flex-1 overflow-hidden">
      {/* The Top and Left Bar */}
      <Layout open={open} onMenuClick={handleDrawerToggle} />

      {/* Main Content */}
      <main
        className={`flex-1 bg-[#f8fafc] transition-all ${
          open ? "ml-60" : "ml-16"
        } mt-20`}
        style={{ height: "calc(100vh - 64px)"}}
      >
        <div 
          className="flex flex-col flex-grow gap-[clamp(0.75rem,1.5vw,2rem)] px-[clamp(1rem,2vw,4rem)] pt-4"
          style={{ height: "100%"}}
        >
        <h1
          className="text-[clamp(2rem,3vw,3.5rem)] font-roboto font-bold tracking-[1rem] text-[#1e3a8a] text-center"
          style={{
            textShadow: "4px 4px 0px rgba(0,0,0,0.5)"
          }}
        >
          CONTENT MANAGEMENT
        </h1>
          <div 
            className="bg-[#b7cde3] w-full p-4 flex flex-col"
            style={{height: '90%'}}
          >
            <div 
              className="bg-[#f8fbfd] p-4 overflow-y-auto"
            >
              <ContentTabs
                tab={tab}
                setTab={setTab}
                setIsDialogOpen={setIsDialogOpen}
                handleDeleteOpen={handleDeleteOpen}
                selectedItems={selectedItems}
                setIsVideo={setIsVideo}
                setVideoDialog={setVideoDialog}
                setIsArticle={setIsArticle}
                handleSearchChange={handleSearchChange}
                setEditMode={setEditMode}
              />
              <ContentTable
                tab={tab}
                data={filterData}
                setSelectedItems={setSelectedItems}
                setDeleteTarget={setDeleteTarget}
                setIsDeleteOpen={setIsDeleteOpen}
                setNewItem={setNewItem}
                setEditMode={setEditMode}
                setEditId={setEditId}
                setIsDialogOpen={setIsDialogOpen}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                // New props passed to enable proper dialog opening based on file type:
                setIsArticle={setIsArticle}
                setVideoDialog={setVideoDialog}
                setIsVideo={setIsVideo}
                setIsAdd={setIsAdd}
                setViewMode={setViewMode}
              />
            </div>
          </div>
        </div>
      </main>
      <ContentDialog
        tab={tab}
        open={isDialogOpen}
        setDialogOpen={setIsDialogOpen}
        newItem={newItem}
        setNewItem={setNewItem}
        setData={setData}
        editMode={editMode}
        setEditMode={setEditMode}
        setEditID={setEditId}
        editId={editId}
        isVideo={isVideo}
        videoDialog={videoDialog}
        setIsVideo={setIsVideo}
        setVideoDialog={setVideoDialog}
        isArticle={isArticle}
        setIsArticle={setIsArticle}
        isAdd={isAdd}
        setIsAdd={setIsAdd}
        viewMode={viewMode}
        setViewMode={setViewMode}
        updateContent={updateContent}
        setAlertMessage={setAlertMessage}
        setIsSuccessful={setIsSuccessful}
        setOpenError={setOpenError}
        setLoading={setLoading}
        loading={loading}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onClose={onCloseDelete}
        onConfirm={handleDeleteConfirm}
        deleteTarget={deleteTarget}
        selectedItems={selectedItems}
        data={data}
        loading={loading}
        tab={tab}
      />

      <Dialog
        open={openError}
        onClose={() => {setOpenError(false); setAlertMessage(''); setIsSuccessful(false)}}
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "white",
            color: "#000",
            borderRadius: "25px",
          },
        }}
      >
        <DialogTitle className={`${isSuccessful ? "bg-[#b7e3cc]" : "bg-[#e3b7b7]"} relative`}>
          {isSuccessful ? "Successful" : "Error"}
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={() => {setOpenError(false); setAlertMessage(''); setIsSuccessful(false);}} className="rounded-full">
              <Close sx={{ fontSize: 40, color: "black" }} />
            </IconButton>
          </DialogActions>
        </DialogTitle>
        
        <DialogContent>
          {alertMessage}
        </DialogContent>
        <DialogActions>
          <button onClick={() => {setOpenError(false); setAlertMessage(''); setIsSuccessful(false);}}>
            <p className="text-base font-roboto font-bold text-[#64748b] p-2 px-6">OK</p>
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
