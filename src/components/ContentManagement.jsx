/* eslint-disable no-undef */
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications,
  Home,
  CalendarToday,
  Folder,
  People,
  Edit,
  Delete,
  Search,
  CrisisAlert,
} from "@mui/icons-material";
import "../styles/contentmanagement.css";

// Local API URL
const API_URL = "http://192.168.1.7:3000";

export default function ContentManagement() {
  // UI States
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0); // 0 = Resources, 2 = Announcements
  const location = useLocation();

  // Data states
  const [resources, setResources] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Dialog and form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    category: "",
    type: "Resource Library", // or "Announcement"
  });
  const [file, setFile] = useState(null);

  // Fetch data on mount or tab change
  useEffect(() => {
    if (tab === 0) {
      axios
        .get(`${API_URL}/api/resources`)
        .then((res) => {
          setResources(res.data);
          console.log("Fetched resources:", res.data);
        })
        .catch((err) => console.error("Error fetching resources:", err));
    } else if (tab === 1) {
      axios
        .get(`${API_URL}/api/announcements`)
        .then((res) => {
          setAnnouncements(res.data);
          console.log("Fetched announcements:", res.data);
        })
        .catch((err) => console.error("Error fetching announcements:", err));
    }
  }, [tab]);

  // Drawer toggle
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Dialog handlers
  const handleAddButtonClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setNewItem({ title: "", description: "", category: "", type: "Resource Library" });
    setFile(null);
  };

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  // File change handler
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Save handler for Resource or Announcement
  const handleSave = async () => {
    if (newItem.type === "Resource Library") {
      // Use FormData to send file and resource data
      const formData = new FormData();
      formData.append("title", newItem.title);
      formData.append("description", newItem.description);
      formData.append("category", newItem.category);
      formData.append("resourceType", newItem.type); // You can customize if needed
      if (file) {
        formData.append("file", file);
      }
      try {
        const res = await axios.post(`${API_URL}/api/resources`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // Assuming backend returns created resource as res.data.resource
        setResources((prev) => [...prev, res.data.resource]);
      } catch (err) {
        console.error("Error uploading resource:", err);
      }
    } else if (newItem.type === "Announcement") {
      // Send JSON for announcements
      const announcementData = {
        title: newItem.title,
        category: newItem.category,
        announcementContent: newItem.description,
      };
      try {
        const res = await axios.post(`${API_URL}/api/announcements`, announcementData);
        // Assuming backend returns created announcement as res.data.announcement
        setAnnouncements((prev) => [...prev, res.data.announcement]);
      } catch (err) {
        console.error("Error creating announcement:", err);
      }
    }
    handleDialogClose();
  };

  // Sidebar menu items
  const menuItems = [
    { text: "Home", icon: <Home />, link: "/" },
    { text: "Scheduler", icon: <CalendarToday />, link: "/scheduler" },
    { text: "Content Management", icon: <Folder />, link: "/content-management" },
    { text: "User Management", icon: <People />, link: "/user-management" },
  ];

  return (
    <div className="content-container">
      {/* Top Navbar */}
      <AppBar position="fixed" className="top-navbar" sx={{ backgroundColor: "#5bb780" }}>
        <Toolbar className="toolbar">
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} className="menu-button">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className="title">
            <span className="mind-u-text">MIND U</span>
          </Typography>
          <div className="icons-container">
            <IconButton color="inherit">
              <CrisisAlert />
            </IconButton>
            <IconButton color="inherit">
              <Badge badgeContent={0} color="secondary">
                <Notifications />
              </Badge>
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        open={open}
        onClose={handleDrawerToggle}
        className={`sidebar ${open ? "" : "mini"}`}
        sx={{
          "& .MuiDrawer-paper": {
            backgroundColor: "#5bb780",
            width: open ? 240 : 60,
            transition: "width 0.3s ease",
          },
        }}
      >
        <List className="sidebar-list">
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                component={Link}
                to={item.link}
                selected={location.pathname === item.link}
                sx={{ "&.Mui-selected": { backgroundColor: "#4caf50", color: "white" } }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.link ? "white" : "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <div className={`main-content ${open ? "shifted" : "mini"}`}>
        <Container className="database-container">
          <Typography className="database-title" style={{ fontWeight: "bold" }}>
            CONTENT MANAGEMENT
          </Typography>
          <Card className="database-card">
            <CardContent>
              <Tabs
                value={tab}
                onChange={(e, newValue) => setTab(newValue)}
                className="database-tabs"
              >
                <Tab label="Resources" className="database-tab" />
                <Tab label="Announcements" className="database-tab" />
              </Tabs>
              
              <div className="database-actions">
                <TextField
                  className="search-bar"
                  placeholder={`Search ${tab === 0 ? "Resources" : "Announcements"}`}
                  variant="outlined"
                  size="small"
                  InputProps={{ endAdornment: <Search /> }}
                />
                <Button className="add-button" variant="contained" onClick={handleAddButtonClick}>
                  {`Add ${tab === 0 ? "Resource" : "Announcement"}`}
                </Button>
              </div>
              
              <TableContainer className="table-container" sx={{ borderBottom: "2px solid #000" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ borderTop: "2px solid #000", borderLeft: "1px solid #ddd" }}>
                        <Checkbox /* Bulk selection if needed */ />
                      </TableCell>
                      {tab === 0 ? (
                        <>
                          <TableCell sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Title
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Category
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Type
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Date Created
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Date Modified
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Actions
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Title
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Category
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Content
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Date Created
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Date Modified
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Actions
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tab === 0
                      ? resources.map((item, index) => (
                          <TableRow key={item.ID || index}>
                            <TableCell padding="checkbox" sx={{ border: "1px solid #ddd" }}>
                              <Checkbox /* individual selection */ />
                            </TableCell>
                            <TableCell sx={{ border: "1px solid #ddd" }}>{item.title}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{item.category}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{item.resourceType}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #ddd" }}>
                              {item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
                            </TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #ddd" }}>
                              {item.modified_at ? new Date(item.modified_at).toLocaleDateString() : ""}
                            </TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #ddd" }}>
                              <IconButton className="edit-button" onClick={() => handleEditButtonClick(index)}>
                                <Edit />
                              </IconButton>
                              <IconButton className="delete-button" onClick={() => handleDeleteButtonClick(index)}>
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      : announcements.map((item, index) => (
                          <TableRow key={item.ID || index}>
                            <TableCell padding="checkbox" sx={{ border: "1px solid #ddd" }}>
                              <Checkbox /* individual selection */ />
                            </TableCell>
                            <TableCell sx={{ border: "1px solid #ddd" }}>{item.title}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{item.category}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{item.announcementContent}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #ddd" }}>
                              {item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
                            </TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #ddd" }}>
                              {item.modified_at ? new Date(item.modified_at).toLocaleDateString() : ""}
                            </TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #ddd" }}>
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
            </CardContent>
          </Card>
        </Container>
      </div>

      {/* Dialog for Adding New Item */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            name="title"
            fullWidth
            variant="outlined"
            value={newItem.title}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            fullWidth
            variant="outlined"
            value={newItem.description}
            onChange={handleInputChange}
          />
          <FormControl component="fieldset" margin="dense">
            <RadioGroup name="type" value={newItem.type} onChange={handleInputChange}>
              <FormControlLabel value="Resource Library" control={<Radio />} label="Resource Library" />
              <FormControlLabel value="Announcement" control={<Radio />} label="Announcement" />
            </RadioGroup>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select name="category" value={newItem.category} onChange={handleInputChange}>
              <MenuItem value="Category 1">Category 1</MenuItem>
              <MenuItem value="Category 2">Category 2</MenuItem>
              <MenuItem value="Category 3">Category 3</MenuItem>
            </Select>
          </FormControl>
          {newItem.type === "Resource Library" && (
            <Button variant="contained" component="label" fullWidth>
              Upload File
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
