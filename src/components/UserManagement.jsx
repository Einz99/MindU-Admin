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
import "../styles/usermanagement.css";

// Local API URL
const API_URL = "http://192.168.1.7:3000";

export default function DashboardLayout() {
  // UI states
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0); // 0 = Students, 1 = Guidance Staffs
  const [checked, setChecked] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Data states (fetched from API)
  const [students, setStudents] = useState([]);
  const [staffs, setStaffs] = useState([]);

  // Form states
  const [newStudent, setNewStudent] = useState({
    id: null,
    firstName: "",
    lastName: "",
    adviser: "",
    username: "",
    password: "",
  });
  const [newStaff, setNewStaff] = useState({
    id: null,
    name: "",
    position: "",
    email: "",
    password: "",
  });

  const location = useLocation();

  // Fetch data when component mounts or when tab changes
  useEffect(() => {
    if (tab === 0) {
      axios
        .get(`${API_URL}/api/students`)
        .then((res) => {
          setStudents(res.data);
        })
        .catch((err) => console.error("Error fetching students:", err));
    } else {
      axios
        .get(`${API_URL}/api/staffs`)
        .then((res) => {
          setStaffs(res.data);
        })
        .catch((err) => console.error("Error fetching staffs:", err));
    }
  }, [tab]);

  // Drawer toggle
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Checkbox handlers
  const handleCheckAll = (event) => {
    const isChecked = event.target.checked;
    setAllChecked(isChecked);
    if (isChecked) {
      const allIds =
        tab === 0 ? students.map((_, index) => index) : staffs.map((_, index) => index);
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

  // Open modal for adding a record
  const handleAddButtonClick = () => {
    setIsEditMode(false);
    if (tab === 0) {
      setNewStudent({
        id: null,
        firstName: "",
        lastName: "",
        adviser: "",
        username: "",
        password: "",
      });
    } else {
      setNewStaff({
        id: null,
        name: "",
        position: "",
        email: "",
        password: "",
      });
    }
    setIsModalOpen(true);
  };

  // Open modal for editing a record (pre-fill the form)
  const handleEditButtonClick = (index) => {
    setIsEditMode(true);
    setEditIndex(index);
    if (tab === 0) {
      const selectedStudent = students[index];
      setNewStudent({
        id: selectedStudent.id,
        firstName: selectedStudent.firstName,
        lastName: selectedStudent.lastName,
        adviser: selectedStudent.adviser,
        username: selectedStudent.username,
        password: "", // leave blank unless changing it
      });
    } else {
      const selectedStaff = staffs[index];
      setNewStaff({
        id: selectedStaff.ID,
        name: selectedStaff.name,
        position: selectedStaff.position, // NEW: position field included
        email: selectedStaff.email,
        password: "",
      });
    }
    setIsModalOpen(true);
  };

  // Delete a record
  const handleDeleteButtonClick = (index) => {
    if (tab === 0) {
      const studentId = students[index].id;
      axios
        .delete(`${API_URL}/api/students/${studentId}`)
        .then(() => {
          setStudents((prev) => prev.filter((_, i) => i !== index));
        })
        .catch((err) => console.error("Error deleting student:", err));
    } else {
      const staffId = staffs[index].ID;
      axios
        .delete(`${API_URL}/api/staffs/${staffId}`)
        .then(() => {
          setStaffs((prev) => prev.filter((_, i) => i !== index));
        })
        .catch((err) => console.error("Error deleting staff:", err));
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (tab === 0) {
      setNewStudent((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewStaff((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit form for add or update
  const handleFormSubmit = () => {
    if (tab === 0) {
      if (isEditMode) {
        axios
          .put(`${API_URL}/api/students/${newStudent.id}`, newStudent)
          .then(() => {
            setStudents((prev) =>
              prev.map((student, index) =>
                index === editIndex ? { ...student, ...newStudent } : student
              )
            );
            setIsModalOpen(false);
          })
          .catch((err) => console.error("Error updating student:", err));
      } else {
        axios
          .post(`${API_URL}/api/students`, newStudent)
          .then((res) => {
            setStudents((prev) => [...prev, res.data.student]);
            setIsModalOpen(false);
          })
          .catch((err) => console.error("Error adding student:", err));
      }
    } else {
      if (isEditMode) {
        axios
          .put(`${API_URL}/api/staffs/${newStaff.id}`, newStaff)
          .then(() => {
            setStaffs((prev) =>
              prev.map((staff, index) =>
                index === editIndex ? { ...staff, ...newStaff } : staff
              )
            );
            setIsModalOpen(false);
          })
          .catch((err) => console.error("Error updating staff:", err));
      } else {
        axios
          .post(`${API_URL}/api/staffs`, newStaff)
          .then((res) => {
            setStaffs((prev) => [...prev, res.data.staff]);
            setIsModalOpen(false);
          })
          .catch((err) => console.error("Error adding staff:", err));
      }
    }
  };

  // Sidebar menu items
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
        <Container className="user-management-container">
          <Typography className="user-management-title" sx={{ fontWeight: "bold" }}>
            USER MANAGEMENT
          </Typography>
          <Card className="user-management-card">
            <CardContent>
              <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} className="user-tabs">
                <Tab label="Students" className="user-tab" />
                <Tab label="Guidance Staffs" className="user-tab" />
              </Tabs>
              <div className="user-actions">
                <TextField
                  className="search-bar"
                  placeholder={`Search ${tab === 0 ? "Students" : "Guidance Staffs"}`}
                  variant="outlined"
                  size="small"
                  InputProps={{ endAdornment: <Search /> }}
                />
                <Button className="add-button" variant="contained" onClick={handleAddButtonClick}>
                  {`Add ${tab === 0 ? "Student" : "Guidance Staff"}`}
                </Button>
              </div>
              <TableContainer className="table-container" sx={{ borderBottom: "2px solid #000" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ borderTop: "2px solid #000", borderLeft: "1px solid #ddd" }}>
                        <Checkbox checked={allChecked} onChange={handleCheckAll} />
                      </TableCell>
                      {tab === 0 ? (
                        <>
                          <TableCell sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            First Name
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Last Name
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Adviser
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Username
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Actions
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Name
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Position
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", borderTop: "2px solid #000", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd" }}>
                            Email
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
                      ? students.map((student, index) => (
                          <TableRow key={student.id}>
                            <TableCell padding="checkbox" sx={{ border: "1px solid #ddd" }}>
                              <Checkbox checked={checked.includes(index)} onChange={(event) => handleCheck(event, index)} />
                            </TableCell>
                            <TableCell sx={{ border: "1px solid #ddd" }}>{student.firstName}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{student.lastName}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{student.adviser}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{student.username}</TableCell>
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
                      : staffs.map((staff, index) => (
                          <TableRow key={staff.ID}>
                            <TableCell padding="checkbox" sx={{ border: "1px solid #ddd" }}>
                              <Checkbox checked={checked.includes(index)} onChange={(event) => handleCheck(event, index)} />
                            </TableCell>
                            <TableCell sx={{ border: "1px solid #ddd" }}>{staff.name}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{staff.position}</TableCell>
                            <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{staff.email}</TableCell>
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

      {/* Modal for Add/Edit */}
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
                name="username"
                label="Username"
                type="username"
                fullWidth
                variant="outlined"
                value={newStudent.username}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="password"
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={newStudent.password}
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
              {/* NEW: Field for position */}
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
    </div>
  );
}
