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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { type } from "@testing-library/user-event/dist/type";

const initialResources = [
  { title: "Sample Title", category: "Sample Category", type: "Sample Type", id: 1, created: "mm/dd/yyyy", modified: "mm/dd/yyyy" }
];

const initialWellness= [
    { title: "Sample Title", category: "Sample Category", type: "Sample Type", id: 1, created: "mm/dd/yyyy", modified: "mm/dd/yyyy" }
];
const initialAnnouncements = [
  { title: "Sample Title", content: "Sample Content", id: 1, created: "mm/dd/yyyy", modified: "mm/dd/yyyy" }
];

export default function ContentManagement() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [checked, setChecked] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
    const [resource, setResources] = useState(initialResources);
    const [wellness, setWellness] = useState(initialWellness);
    const [announcement,setAnnouncements] = useState(initialAnnouncements);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newResource, setNewResource] = useState({
    title: "",
    category: "",
    type: "",
    id: "",
    created: new Date().toLocaleDateString(),
    modified: new Date().toLocaleDateString(),
});
   const [newWellness, setNewWellness] = useState({
    title: "",
    category: "",
    id: "",
    created: new Date().toLocaleDateString(),
    modified: new Date().toLocaleDateString(),
});
   const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    category: "",
    classificaiton: "",
    id: "",
    created: new Date().toLocaleDateString(),
    modified: new Date().toLocaleDateString(),
});

  const location = useLocation();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleCheckAll = (event) => {
    const isChecked = event.target.checked;
    setAllChecked(isChecked);
    if (isChecked) {
      const allIds = tab === 0 ? resource.map((_, index) => index) : tab === 1 ? wellness.map((_, index) => index) : announcement.map((_, index) => index);
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

  const handleAddButtonClick = () => {
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditButtonClick = (index) => {
    setIsEditMode(true);
    setEditIndex(index);
    if (tab === 0) {
      setNewResource(resource[index]);
    } else if (tab === 1) {
      setNewWellness(wellness[index]);
    }
    else{setNewAnnouncement(announcement[index]);}
    setIsModalOpen(true);
  };

  const handleDeleteButtonClick = (index) => {
    if (tab === 0) {
      setResources((prev) => prev.filter((_, i) => i !== index));
    } else if (tab === 1) {
      setWellness((prev) => prev.filter((_, i) => i !== index));
    }
    else{
      setAnnouncements((prev) => prev.filter((_, i) => i !== index));}
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (tab === 0) {
      setNewResource((prev) => ({ ...prev, [name]: value }));
    } else if (tab === 1) {
      setNewWellness((prev) => ({ ...prev, [name]: value }));
    }
    else{
      setNewAnnouncement((prev) => ({ ...prev, [name]: value }));}
  };

  const handleFormSubmit = () => {
    if (tab === 0) {
      if (isEditMode) {
        setStudents((prev) => prev.map((student, index) => (index === editIndex ? newStudent : student)));
      } else {
        setStudents((prev) => [...prev, newStudent]);
      }
      setNewStudent({
        name: "",
        section: "",
        adviser: "",
        email: "",
        created: new Date().toLocaleDateString(),
        modified: new Date().toLocaleDateString(),
      });
    } else {
      if (isEditMode) {
        setStaffs((prev) => prev.map((staff, index) => (index === editIndex ? newStaff : staff)));
      } else {
        setStaffs((prev) => [...prev, newStaff]);
      }
      setNewStaff({
        name: "",
        position: "",
        email: "",
        created: new Date().toLocaleDateString(),
        modified: new Date().toLocaleDateString(),
      });
    }
    setIsModalOpen(false);
  };

  const menuItems = [
    { text: "Home", icon: <Home />, link: "/" },
    { text: "Scheduler", icon: <CalendarToday />, link: "/scheduler" },
    { text: "Content Management", icon: <Folder />, link: "/content-management" },
    { text: "User Management", icon: <People />, link: "/user-management" },
  ];

  return (
    <div className="dashboard-container">
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
                sx={{ '&.Mui-selected': { backgroundColor: '#4caf50', color: 'white' } }}
              >
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
        {/* Content Management Content */}
        <Container className="content-management-container">
          <Typography className="content-management-title" style={{ fontWeight: 'bold' }}>CONTENT MANAGEMENT</Typography>
          <Card className="content-management-card">
            <CardContent>
              <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} className="content-tabs">
                <Tab label="Resource Library" className="content-tab" />
                <Tab label="Welc" className="content-tab" />
              </Tabs>
              
              <div className="content-actions">
                <TextField className="search-bar" placeholder={`Search ${tab === 0 ? 'Students' : 'Guidance Staffs'}`} variant="outlined" size="small" InputProps={{ endAdornment: <Search /> }} />
                <Button className="add-button" variant="contained" onClick={handleAddButtonClick}>{`Add ${tab === 0 ? 'Students' : 'Guidance Staffs'}`}</Button>
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
                          <TableCell className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Names</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Section</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Adviser</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Email</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Date Created</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Date Modified</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Actions</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Names</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Position</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000',borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Email</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Date Created</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Date Modified</TableCell>
                          <TableCell align="center" className="table-header" style={{ fontWeight: 'bold', borderTop: '2px solid #000',  borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }}>Actions</TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tab === 0 ? (
                      students.map((student, index) => (
                        <TableRow key={index}>
                          <TableCell padding="checkbox" style={{ border: '1px solid #ddd' }}>
                            <Checkbox
                              checked={checked.includes(index)}
                              onChange={(event) => handleCheck(event, index)}
                            />
                          </TableCell>
                          <TableCell style={{ border: '1px solid #ddd' }}>{student.name}</TableCell>
                          <TableCell align="center" style={{ border: '1px solid #ddd' }}>{student.section}</TableCell>
                          <TableCell align="center" style={{ border: '1px solid #ddd' }}>{student.adviser}</TableCell>
                          <TableCell align="center" style={{ border: '1px solid #ddd' }}>{student.email}</TableCell>
                          <TableCell align="center" style={{ border: '1px solid #ddd' }}>{student.created}</TableCell>
                          <TableCell align="center" style={{ border: '1px solid #ddd' }}>{student.modified}</TableCell>
                          <TableCell align="center" style={{ border: '1px solid #ddd' }}>
                            <IconButton className="edit-button" onClick={() => handleEditButtonClick(index)}><Edit /></IconButton>
                            <IconButton className="delete-button" onClick={() => handleDeleteButtonClick(index)}><Delete /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      staffs.map((staff, index) => (
                        <TableRow key={index}>
                          <TableCell padding="checkbox" style={{ border: '1px solid #ddd' }}>
                            <Checkbox
                              checked={checked.includes(index)}
                              onChange={(event) => handleCheck(event, index)}
                            />
                          </TableCell>
                          <TableCell style={{ border: '1px solid #ddd' }}>{staff.name}</TableCell>
                          <TableCell align="center" style={{ border: '1px solid #ddd' }}>{staff.position}</TableCell>
                          <TableCell align="center" style={{ border: '1px solid #ddd' }}>{staff.email}</TableCell>
                          <TableCell align="center" style={{ border: '1px solid #ddd' }}>{staff.created}</TableCell>
                          <TableCell align="center" style={{ border: '1px solid #ddd' }}>{staff.modified}</TableCell>
                          <TableCell align="center" style={{ border: '1px solid #ddd' }}>
                            <IconButton className="edit-button" onClick={() => handleEditButtonClick(index)}><Edit /></IconButton>
                            <IconButton className="delete-button" onClick={() => handleDeleteButtonClick(index)}><Delete /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Container>
      </div>

      {/* Add/Edit Student/Staff Modal */}
      <Dialog open={isModalOpen} onClose={handleModalClose}>
        <DialogTitle>{`${isEditMode ? 'Edit' : 'Add'} ${tab === 0 ? 'Student' : 'Guidance Staff'}`}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={tab === 0 ? newStudent.name : newStaff.name}
            onChange={handleInputChange}
          />
          {tab === 0 ? (
            <>
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
            </>
          ) : (
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
          )}
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={tab === 0 ? newStudent.email : newStaff.email}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Cancel</Button>
          <Button onClick={handleFormSubmit}>{isEditMode ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}