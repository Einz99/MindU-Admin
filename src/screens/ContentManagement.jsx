import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Typography,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import Navbar from "../components/navigationsComponents/TopNavBarComponent";
import Sidebar from "../components/navigationsComponents/SidebarComponents";
import ContentTabs from "../components/contentManagementComponents/ContentTabs";
import ContentTable from "../components/contentManagementComponents/ContentTable";
import ContentDialog from "../components/contentManagementComponents/ContentDialog";
import DeleteDialog from "../components/contentManagementComponents/DeleteDialog";
import { API } from "../api";
import "../styles/contentmanagement.css";

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

  const fetchData = useCallback(async () => {
    if (tab === 0) {
      axios
        .get(`${API}/api/resources/`)
        .then((res) => {
          setData(res.data);
          console.log("Fetched resources:", res.data);
        })
        .catch((err) => console.error("Error fetching resources:", err));
    } else if (tab === 1) {
      axios
        .get(`${API}/api/resources/wellness`)
        .then((res) => {
          setData(res.data);
          console.log("Fetched resources:", res.data);
        })
        .catch((err) => console.error("Error fetching resources:", err));
    }
     else if (tab === 2) {
      axios
        .get(`${API}/api/announcements`)
        .then((res) => {
          setData(res.data);
          console.log("Fetched announcements:", res.data);
        })
        .catch((err) => console.error("Error fetching announcements:", err));
    }
  }, [tab]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setNewItem({});
    setFile(null);
    setEditMode(false);
    setEditId(null);
  };
  

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteConfirm = async () => {
    try {
      if (deleteTarget) {
        // **Individual delete (Single Item)**
        let endpoint = "";
        if (tab === 0) {
          endpoint = `${API}/api/resources/${deleteTarget}`;
        } else if (tab === 1) {
          endpoint = `${API}/api/documents/${deleteTarget}`;
        } else if (tab === 2) {
          endpoint = `${API}/api/announcements/${deleteTarget}`;
        }
  
        await axios.delete(endpoint);
        setData((prevData) => prevData.filter((item) => item.ID !== deleteTarget));
        setDeleteTarget(null);
      } else if (selectedItems.length > 0) {
        // **Bulk delete (Multiple Items)**
        let bulkEndpoint = "";
        if (tab === 0) {
          bulkEndpoint = `${API}/api/resources/delete-multiple`;
        } else if (tab === 1) {
          bulkEndpoint = `${API}/api/documents/delete-multiple`;
        } else if (tab === 2) {
          bulkEndpoint = `${API}/api/announcements/delete-multiple`;
        }
  
        await axios.post(bulkEndpoint, { ids: selectedItems });
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
    <div className="content-container">
      <Navbar onMenuClick={handleDrawerToggle} />
      <Sidebar open={open} onToggle={handleDrawerToggle} />
      <div className={`main-content ${open ? "shifted" : "mini"}`}>
        <Container className="database-container">
          <Typography className="database-title" fontWeight="bold">
            CONTENT MANAGEMENT
          </Typography>
          <Card className="database-card">
            <CardContent>
              <ContentTabs tab={tab} setTab={setTab} setIsDialogOpen={setIsDialogOpen} 
                handleDeleteOpen={handleDeleteOpen} 
                selectedItems={selectedItems}/>
              <ContentTable 
                tab={tab} 
                data={data} 
                setSelectedItems={setSelectedItems} 
                setDeleteTarget={setDeleteTarget} 
                setIsDeleteOpen={setIsDeleteOpen} 
                setNewItem={setNewItem}
                setEditMode={setEditMode}
                setEditId={setEditId}
                setIsDialogOpen={setIsDialogOpen}/>
            </CardContent>
          </Card>
        </Container>
      </div>
      <ContentDialog
        tab={tab}
        open={isDialogOpen}
        handleClose={handleDialogClose}
        newItem={newItem}
        setNewItem={setNewItem}
        file={file}
        setFile={setFile}
        setData={setData}
        editMode={editMode}
        setEditMode={setEditMode}
        editId={editId}
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
