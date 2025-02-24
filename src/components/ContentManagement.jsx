import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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

export default function ContentManagement() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const location = useLocation();
  const [resources, setResources] = useState([
    { title: "Resource 1", category: "", type: "PDF", id: "", created: "mm/dd/yyyy", modified: "mm/dd/yyyy" }
  ]);
  const [wellnessTools, setWellnessTools] = useState([
    { title: "Mindfulness Guide", category: "Breathing Exercise", id: "", created: "mm/dd/yyyy", modified: "mm/dd/yyyy" }
  ]);
  const [announcements, setAnnouncements] = useState([
    { title: "Announcement", category: "Informational",  id: "", created: "mm/dd/yyyy", modified: "mm/dd/yyyy" }
  ]);
  const [checked, setChecked] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", description: "", category: "", type: "Resource Library" });
  const [file, setFile] = useState(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleAddButtonClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSave = () => {
    const newItemWithDates = {
      ...newItem,
      id: Date.now().toString(),
      created: new Date().toLocaleDateString(),
      modified: new Date().toLocaleDateString(),
    };

    if (newItem.type === "Resource Library") {
      setResources([...resources, newItemWithDates]);
    } else if (newItem.type === "Wellness Tool") {
      setWellnessTools([...wellnessTools, newItemWithDates]);
    } else if (newItem.type === "Announcement") {
      setAnnouncements([...announcements, newItemWithDates]);
    }

    console.log("New Item:", newItemWithDates);
    if (file) {
      console.log("Uploaded File:", file.name);
    }

    setIsDialogOpen(false);
    setNewItem({ title: "", description: "", category: "", type: "Resource Library" });
    setFile(null);
  };

  const handleEditButtonClick = (index) => {
    console.log(`Edit item at index ${index}`);
  };

  const handleDeleteButtonClick = (index) => {
    console.log(`Delete item at index ${index}`);
  };

  const tabData = [resources, wellnessTools, announcements];

  const handleCheckAll = (event) => {
    const isChecked = event.target.checked;
    setAllChecked(isChecked);
    if (isChecked) {
      const allIds = tabData[tab].map((_, index) => index);
      setChecked(allIds);
    } else {
      setChecked([]);
    }
  };

  const handleCheck = (event, id) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      setChecked((prev) => [...prev, id]);
    } else {
      setChecked((prev) => prev.filter((item) => item !== id));
    }
  };

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
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            className="menu-button"
          >
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
        className={`sidebar ${open ? '' : 'mini'}`}
        sx={{ '& .MuiDrawer-paper': { backgroundColor: '#5bb780', width: open ? 240 : 60, transition: 'width 0.3s ease' } }}
      >
        <List className="sidebar-list">
          {menuItems.map((item, index) => ( 
            <ListItem key={index} disablePadding> 
              <ListItemButton
                component={Link}
                to={item.link}
                selected={location.pathname === item.link}
                sx={{ '&.Mui-selected': { backgroundColor: '#4caf50', color: 'white' } }}>
                <ListItemIcon sx={{ color: location.pathname === item.link ? 'white' : 'inherit' }}> 
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <div className={`main-content ${open ? 'shifted' : 'mini'}`}>
        {/* Database Container */}
        <Container className="database-container">
          <Typography className="database-title" style={{ fontWeight: 'bold' }}>CONTENT MANAGEMENT</Typography>
          <Card className="database-card">
            <CardContent>
              <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} className="database-tabs">
                <Tab label="Resources" className="database-tab" />
                <Tab label="Wellness Tools" className="database-tab" />
                <Tab label="Announcements" className="database-tab" />
              </Tabs>
              
              <div className="database-actions">
                <TextField className="search-bar" placeholder={`Search ${tab === 0 ? 'Resources' : tab === 1 ? 'Wellness Tools' : 'Announcements'}`} variant="outlined" size="small" InputProps={{ endAdornment: <Search /> }} />
                <Button className="add-button" variant="contained" onClick={handleAddButtonClick}>{`Add ${tab === 0 ? 'Resource' : tab === 1 ? 'Wellness Tool' : 'Announcement'}`}</Button>
              </div>
              
              <TableContainer className="table-container" style={{ borderBottom: '2px solid #000' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" style={{ borderTop: '2px solid #000', borderLeft: '1px solid #ddd'}}>
                        <Checkbox
                          checked={allChecked}
                          onChange={handleCheckAll}
                        />
                      </TableCell>
                      {tab === 0 ? (
                        <>
                      <TableCell className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Title</TableCell>
                      <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Category</TableCell>
                      <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Type</TableCell>

                      <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Date Created</TableCell>
                      <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Date Modified</TableCell>
                      <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Actions</TableCell>
                      </>
                       ) : tab === 1 ?  (
                        <>
                          <TableCell className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Title</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Category</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000',borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>ID</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Date Created</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Date Modified</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000',  borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Actions</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Title</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Category</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Classification</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Date Created</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Date Modified</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Actions</TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tabData[tab].map((item, index) => (
                      <TableRow key={index}>
                        <TableCell padding="checkbox" style={{ border: '1px solid #ddd' }}>
                          <Checkbox
                            checked={checked.includes(index)}
                            onChange={(event) => handleCheck(event, index)}
                          />
                        </TableCell>
                        <TableCell style={{ border: '1px solid #ddd' }}>{item.title}</TableCell>
                        <TableCell align="center" style={{ border: '1px solid #ddd' }}>{item.category}</TableCell>
                        <TableCell align="center" style={{ border: '1px solid #ddd' }}>{item.type}</TableCell>
                        <TableCell align="center" style={{ border: '1px solid #ddd' }}>{item.created}</TableCell>
                        <TableCell align="center" style={{ border: '1px solid #ddd' }}>{item.modified}</TableCell>
                        <TableCell align="center" style={{ border: '1px solid #ddd' }}>
                          <IconButton className="edit-button" onClick={() => handleEditButtonClick(index)}><Edit /></IconButton>
                          <IconButton className="delete-button" onClick={() => handleDeleteButtonClick(index)}><Delete /></IconButton>
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

      {/* Floating Card for Input */}
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
            <RadioGroup
              name="type"
              value={newItem.type}
              onChange={handleInputChange}
            >
              <FormControlLabel value="Resource Library" control={<Radio />} label="Resource Library" />
              <FormControlLabel value="Wellness Tool" control={<Radio />} label="Wellness Tool" />
              <FormControlLabel value="Announcement" control={<Radio />} label="Announcement" />
            </RadioGroup>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={newItem.category}
              onChange={handleInputChange}
            >
              <MenuItem value="Category 1">Category 1</MenuItem>
              <MenuItem value="Category 2">Category 2</MenuItem>
              <MenuItem value="Category 3">Category 3</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            component="label"
            fullWidth
            margin="dense"
          >
            Upload File
            <input
              type="file"
              hidden
              onChange={handleFileChange}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
