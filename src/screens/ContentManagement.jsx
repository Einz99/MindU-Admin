import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/navigationsComponents/TopNavBarComponent";
import Sidebar from "../components/navigationsComponents/SidebarComponents";
import ContentTabs from "../components/contentManagementComponents/ContentTabs";
import ContentTable from "../components/contentManagementComponents/ContentTable";
import ContentDialog from "../components/contentManagementComponents/ContentDialog";
import DeleteDialog from "../components/contentManagementComponents/DeleteDialog";
import { API } from "../api";

export default function ContentManagement() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [data, setData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [file, setFile] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [videoDialog, setVideoDialog] = useState(false);
  const [isArticle, setIsArticle] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const endpoints = [
        `${API}/resources/`,
        `${API}/resources/wellness`,
        `${API}/announcements`
      ];
      const response = await axios.get(endpoints[tab]);
      setData(response.data);
      console.log("Fetched data:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [tab]);

  const handleDrawerToggle = () => setOpen((prev) => !prev);
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setFile(null);
    setEditMode(false);
    setEditId(null);
    setIsArticle(false);
    setVideoDialog(false);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteConfirm = async () => {
    try {
      const deleteEndpoints = [
        `${API}/resources/`,
        `${API}/documents/`,
        `${API}/announcements/`
      ];
      
      if (deleteTarget) {
        await axios.delete(`${deleteEndpoints[tab]}${deleteTarget}`);
        setData((prevData) => prevData.filter((item) => item.ID !== deleteTarget));
        setDeleteTarget(null);
      } else if (selectedItems.length > 0) {
        await axios.post(`${deleteEndpoints[tab]}delete-multiple`, { ids: selectedItems });
        setData((prevData) => prevData.filter((item) => !selectedItems.includes(item.ID)));
        setSelectedItems([]);
      }
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  const handleDeleteOpen = () => {
    if (selectedItems.length === 0) {
      alert("No items selected for deletion.");
      return;
    }
    setIsDeleteOpen(true);
  };
  
  return (
    <div className="flex h-screen">
      <Navbar onMenuClick={handleDrawerToggle} />
      <Sidebar open={open} onToggle={handleDrawerToggle} />
      <div className={`flex-grow p-4 bg-gray-200 transition-all ${open ? 'ml-60' : 'ml-16'}  mt-16`}>
        <div className="container mx-auto">
          <h1 className="text-lg font-bold py-5">CONTENT MANAGEMENT</h1>
          <div className="bg-white shadow-md rounded-lg p-4">
            <ContentTabs
              tab={tab}
              setTab={setTab}
              setIsDialogOpen={setIsDialogOpen}
              handleDeleteOpen={handleDeleteOpen}
              selectedItems={selectedItems}
              setIsVideo={setIsVideo}
              setVideoDialog={setVideoDialog}
              setIsArticle={setIsArticle}
            />
            <ContentTable
              tab={tab}
              data={data}
              setSelectedItems={setSelectedItems}
              setDeleteTarget={setDeleteTarget}
              setIsDeleteOpen={setIsDeleteOpen}
              setNewItem={setNewItem}
              setEditMode={setEditMode}
              setEditId={setEditId}
              setIsDialogOpen={setIsDialogOpen}
              // New props passed to enable proper dialog opening based on file type:
              setIsArticle={setIsArticle}
              setVideoDialog={setVideoDialog}
              setIsVideo={setIsVideo}
            />
          </div>
        </div>
      </div>
      <ContentDialog
        tab={tab}
        open={isDialogOpen}
        setDialogOpen={setIsDialogOpen}
        handleClose={handleDialogClose}
        newItem={newItem}
        setNewItem={setNewItem}
        file={file}
        setFile={setFile}
        setData={setData}
        editMode={editMode}
        setEditMode={setEditMode}
        editId={editId}
        isVideo={isVideo}
        videoDialog={videoDialog}
        isArticle={isArticle}
      />
      <DeleteDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        deleteTarget={deleteTarget}
        selectedItems={selectedItems}
      />
    </div>
  );
}
