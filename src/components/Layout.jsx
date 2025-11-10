import { useEffect, useState, useRef } from "react";
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Badge, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { 
  Menu as MenuIcon, 
  Home, 
  CalendarToday, 
  Folder, 
  People, 
  NavigateBefore, 
  PhotoCamera, 
  Edit, 
  Logout,
  Close,
  ArrowBack,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { API, RootAPI } from "../api"; // Import the API URL from the api.js file
import axios from "axios";
import io from "socket.io-client";

// Sidebar menu items
const menuItems = [
  { text: "Dashboard", icon: <Home />, link: "/landing-page" },
  { text: "Scheduler", icon: <CalendarToday />, link: "/scheduler" },
  { text: "Content Management", icon: <Folder />, link: "/content-management" },
  { text: "User Management", icon: <People />, link: "/user-management" },
];

/**
 * Layout Component
 * 
 * This component serves as the main layout structure for the dashboard, containing:
 * - **Topbar**: A fixed AppBar at the top of the screen, used for global navigation and actions like notifications and alerts.
 * - **Sidebar**: A collapsible and scrollable navigation drawer, used to navigate between different sections like Home, Scheduler, Content Management, and User Management.
 * 
 * Props:
 * - `open` (boolean): Controls the open/close state of the sidebar.
 * - `onMenuClick` (function): A callback function to toggle the sidebar's open/close state when the menu button is clicked.
 * 
 * State:
 * - None (The `open` state is passed from the parent component).
 * 
 * Features:
 * - **Topbar**: Displays the app’s title and icons for notifications and alerts.
 * - **Sidebar**: Contains navigation links with icons and text. The width of the sidebar adjusts based on whether it's open or collapsed.
 * - The sidebar is sticky and stays in place even when scrolling.
 * - The component uses Material-UI’s `Drawer`, `AppBar`, and `List` components to structure the layout.
 */

export default function Layout({ open, onMenuClick }) {
  const location = useLocation();
  const staffData = JSON.parse(localStorage.getItem("staff"));
  const [staff, setStaff] = useState({});
  const [openProfile, setOpenProfile] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [changeInputs, setChangeInputs] = useState(true);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [state, setState] = useState(0);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [robitBadge, setRobitBadge] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current) {
      const newSocket = io(RootAPI);
      socketRef.current = newSocket;

      newSocket.on('connect', () => {
        console.log('✅ Layout connected to server:', newSocket.id);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Layout disconnected from server');
      });

      // Listen for new help requests
      newSocket.on('new-help-request', () => {
        console.log('🆕 New help request received');
        setRobitBadge(prev => prev + 1);
      });

      // Listen for completed help requests
      newSocket.on('help-request-completed', () => {
        console.log('✅ Help request completed');
        setRobitBadge(prev => Math.max(0, prev - 1));
      });
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('new-help-request');
        socketRef.current.off('help-request-completed');
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await axios.get(`${API}/staffs/${staffData.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        const data = response.data;
        const hashedPassword = '#'.repeat(data.passwordLength);
        setStaff(data);
        setEmail(data.email);
        setPassword(hashedPassword);
        setTempEmail(data.email);
        setTempPassword(hashedPassword);
      } catch (error) {
        console.error("Error fetching staff data:", error);
        alert("Failed to fetch staff data. Please log in again.");
      }
    };
    const fetchLength = async () => {
      try {
        const res = await axios.get(`${API}/students`);
      
        // Check if isAskingHelp is truthy (1) and chatStatus is 'Pending'
        const filteredStudents = res.data.filter(student => student.isAskingHelp && student.chatStatus === 'Pending');
      
        // Get the length of filtered students
        const length = filteredStudents.length;
        
        setRobitBadge(length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchStaffData();
    fetchLength();
  }, [staffData.id]);
        
  
  const handleCloseDrawer = () => {
    requestAnimationFrame(() => {
      if (document.activeElement) {
        document.activeElement.blur();
      }
      setTimeout(() => setOpenProfile(false), 50);
    });
    setEmail(tempEmail);
    setPassword(tempPassword);
    setEditEmail(false);
    setEditPassword(false);
    setChangeInputs(true);
  };

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputEmail)) {
      setEmailError(true);   // Invalid email format
    } else {
      setEmailError(false);  // Valid email format
    }
  };

  const handlePasswordChange = (e) => {
    const input = e.target.value;
    setPassword(input);

    // Validation checks
    const hasMinLength = input.length >= 10;
    const hasUppercase = /[A-Z]/.test(input);
    const hasLowercase = /[a-z]/.test(input);
    const hasNumber    = /[0-9]/.test(input);
    const hasSpecial   = /[!@#$%^&*(),.?":{}|<>]/.test(input);

    // If any check fails, it's an error
    const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
    setPasswordError(!isValid);
    setChangeInputs(false);
  };

  const handleCurrentPasswordChange = (e) => {
    const inputCurrentPassword = e.target.value;
    setCurrentPassword(inputCurrentPassword);
  }

  const handleConfirmPasswordChange = (e) => {
    const inputConfirmPassword = e.target.value;
    setConfirmPassword(inputConfirmPassword);
  }

  const handleLogout = () => {
    // Clear local storage and redirect to login page
    localStorage.removeItem("staff");
    localStorage.removeItem("authToken");
    window.location.href = "/";
  }

  const handleCancel = () => {
    setOpenEditDialog(false);
    setEditEmail(false);
    setEditPassword(false);
    setEmail(tempEmail);
    setPassword(tempPassword);
    setPreviewImage(null);
    setCurrentPassword("");
    setChangeInputs(true);
  }

  const handlePictureChange = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        setSelectedFile(file); // Save the actual file
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewImage(reader.result); // base64 for preview only
          setOpenEditDialog(true);
          setState(2); // State 2 for picture change
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (state === 0) {
        // Save email change
        if (emailError) {
          alert("Invalid email format. Please enter a valid email.");
        } else {
          await axios.put(`${API}/staffs/email/${staffData.id}`, { email }, {
            ...config,
            headers: {
              ...config.headers,
              "Content-Type": "application/json",
            },
          });

          setOpenEditDialog(false);
          setEditEmail(false);
          setTempEmail(email);
          setEmail(email);
          alert("Email changed successfully!");
        }
      } else if (state === 1) {
        if (!currentPassword || !password || !confirmPassword) {
          alert("Password is missing, old password does not match, password and confirm password does not match or not in format\nPassword must have:\nAtleast 10 characters\ncontains Special Caracter(eg. !@#$%^&*)\nAtleast one uppercase and lowercase letter.");
        } else if (password !== confirmPassword) {
          alert("New passwords do not match.");
        } else {
          await axios.put(`${API}/staffs/password/${staffData.id}`, {
            currentPassword,
            newPassword: password,
          }, {
            ...config,
            headers: {
              ...config.headers,
              "Content-Type": "application/json",
            },
          });
        
          setOpenEditDialog(false);
          setEditPassword(false);
          setTempPassword(password);
          setPassword(password);
          alert("Password changed successfully!");
        }
      } else if (state === 2) {
        // Profile picture change
        if (!selectedFile) {
          alert("No file selected.");
          return;
        }

        const formData = new FormData();
        formData.append("picture", selectedFile);

        const response = await axios.put(`${API}/staffs/picture/${staffData.id}`, formData, config);

        // Assuming the backend returns the updated picture filename (relative path)
        const updatedPicturePath = `${response.data.data.picturePath}`;  // Full URL/path to the new picture
        // Update staff.picture directly
        setStaff((prevStaff) => ({
          ...prevStaff,
          picture: updatedPicturePath,  // Set the new picture path
        }));

        setOpenEditDialog(false);
        alert("Profile picture changed successfully!");
        setPreviewImage(null);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert(error.response?.data?.message || "An error occurred while updating.");
    }
  };

  return (
    <div>
      {/* Topbar */}
      <AppBar position="fixed" sx={{ backgroundColor: "#1E3A8A", boxShadow: 1 }}>
        <Toolbar className="h-20 flex justify-between items-center">
          <div className="flex gap-2 align-middle">
            <img src={"/MIND U WEB Icon.png"} alt="Logo" className="w-12 h-12"/>
            <Typography
              variant="h6"
              className="flex items-center justify-center"
            >
              <span className="text-3xl font-norwester">MIND U</span>
            </Typography>
          </div>
          <div className="flex gap-4 items-center">
            {staff.position !== 'Adviser' && (
              <Link to="/Chat">
                <IconButton color="inherit">
                  <Badge badgeContent={robitBadge} color="error">
                    <img src={"/Robo.png"} alt="Chat" className="w-7 h-7"/>
                  </Badge>
                </IconButton>
              </Link>
            )}
            <div className="w-0.5 h-8 bg-white my-auto"></div>
            <div className="flex items-end flex-col px-2">
              <p className="text-base font-bold">{staff.name}</p>
              <p className="text-base text-[#f8fafc] font-bold">{staff.position}{staff.section && ` - ${staff.section}`}</p>
            </div>
            <div className="w-0.5 h-8 bg-white my-auto"></div>
            <img src={staff.picture ? `${RootAPI}${staff.picture}` : "/defaultProfile.png"}   alt="Profile" className="w-10 h-10 rounded-full my-auto" onClick={() => setOpenProfile(true)}/>
          </div>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          "& .MuiDrawer-paper": {
            backgroundColor: "#1E3A8A",
            width: open ? 240 : 65,
            transition: "width 0.3s ease",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "20px 0",
            zIndex: 1000,
            top: "64px",
            height: "calc(100vh - 64px)",
            position: "fixed",
            scrollbarWidth: "none",
          },
        }}
      >
        <div className={`w-full absolute top-0 left-0 p-5 ${open ? "text-end" : "text-center"}`}>
          {location.pathname === "/Chat" ? (
            <Link to="/landing-page">
              <IconButton color="inherit" edge="start">
                <ArrowBack className="text-white"/>
              </IconButton>
            </Link>
          ) : 
          open ? (
            <IconButton color="inherit" edge="start" onClick={onMenuClick}>
              <ArrowBack className="text-white"/>
            </IconButton>
          ) : (
            <IconButton color="inherit" edge="start" onClick={onMenuClick}>
              <MenuIcon className="text-white"/>
            </IconButton>
          )}
        </div>
        <Box className="flex flex-col w-full gap-4">
          <List className="w-full flex flex-col gap-4">
            {menuItems.map((item, index) => ((
              (index === 0) ||   
              ((index === 2 || index === 1) && staffData.position !== "Adviser") || 
              (index === 3)) && (
              <ListItem key={index} disablePadding className="w-full">
                <ListItemButton
                  component={Link}
                  to={item.link}
                  selected={location.pathname === item.link}
                  sx={{
                    "&.Mui-selected": { backgroundColor: "#b7cde3", color: "black" },
                    marginBottom: "12px",
                    borderRadius: "8px",
                  }}
                >
                  <ListItemIcon sx={{ color: location.pathname === item.link ? "Black" : "#F8FAFC" }}>
                    {item.icon}
                  </ListItemIcon>
                  {open && <ListItemText primary={item.text} className={`${location.pathname === item.link ? "text-black" : "text-[#F8FAFC]"}`} />}
                </ListItemButton>
              </ListItem>
            )))}
          </List>
        </Box>
      </Drawer>

      {/* Profile Sidebar */}
      <Drawer
        anchor="right"
        variant="temporary"
        open={openProfile}
        onClose={handleCloseDrawer}
        ModalProps={{
          keepMounted: true, // ✅ prevents unmount flicker
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "#1E3A8AA0",
          },
        }}
        sx={{
          "& .MuiDrawer-paper": {
            backgroundColor: "#1E3A8A",
            width: "min(500px, 90vw)",
            transition: "width 0.3s ease",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "20px 0",
            zIndex: 1000,
            height: "100vh",
          },
        }}
      >
        <div className="flex flex-col items-center h-full gap-4 relative">
          <div className="relative w-full py-4 text-white text-3xl font-bold">
            <IconButton
              className="!absolute left-4 top-1/2 -translate-y-1/2"
              onClick={handleCloseDrawer}
            >
              <NavigateBefore sx={{ color: "white", fontSize: 50 }} />
            </IconButton>
            <p className="text-center">PROFILE SETTINGS</p>
          </div>
          <div className="w-60 h-60 rounded-full border-4 border-[#60a5fa] relative mb-14 max-w-[40%] max-h-[21%] ">
            <img src={previewImage ? previewImage : staff.picture ? `${RootAPI}${staff.picture}` : "/defaultProfile.png"} alt="Profile" className="w-full h-full rounded-full" />
            <IconButton className="absolute bottom-6 left-1/2 -translate-x-1/2" onClick={handlePictureChange}>
              <PhotoCamera className="text-white bg-[#60a5fa] rounded-full p-2" sx={{fontSize: 40}} />
            </IconButton>
          </div>
          <div className="text-center">
            <p className="font-bold text-4xl text-white">{staff.name}</p>
            <p className="font-bold text-2xl text-gray-400">{staff.position}</p>
          </div>
          <div className="w-full flex flex-col items-center text-start gap-2 mt-8">
            <div className="w-5/6 items-center flex justify-between">
              <p className="font-bold text-lg text-white">Email</p>
              {editEmail && (
                <p className="font-bold text-lg text-[#60a5fa] cursor-pointer" onClick={() => {
                  if (!email || emailError || changeInputs) {
                    alert("Missing Email or Invalid email format. Please enter a valid email.");
                  } else {
                    setOpenEditDialog(true);
                    setState(0);
                  }}
                }>Save</p>
              )}
            </div>
            <div className="w-full relative items-center flex justify-center gap-2">
            <input
              type="email"
              className={`w-5/6 h-10 bg-[#b7cde3] border ${
                emailError ? "focus:border-red-700" : "focus:border-[#60a5fa]"
              } text-black placeholder-gray-400 focus:outline-none border-[#60a5fa] p-2 rounded-md`}
              value={email}
              onChange={handleEmailChange}
              onKeyDown={(e => {
                if (e.key === "Enter") {
                  if (!email || emailError || changeInputs) {
                    alert("Missing Email or Invalid email format. Please enter a valid email.");
                  } else {
                    setOpenEditDialog(true);
                    setState(0);
                  }
                }
              })}
              disabled={!editEmail}
            />
              {(!editEmail && !editPassword) && (
                <Edit className="absolute right-12 top-2" sx={{fontSize: 15}} onClick={() => setEditEmail(true)}></Edit>
              )}
            </div>
            <div className="w-5/6 items-center flex justify-between">
              <p className="font-bold text-lg text-white">Password</p>
              {editPassword && (
                <p className="font-bold text-lg text-[#60a5fa] cursor-pointer" onClick={() => {
                  if (!password || passwordError || changeInputs) {
                    alert("Password is missing or not in format\nPassword must have:\nAtleast 10 characters\ncontains Special Caracter(eg. !@#$%^&*)\nAtleast one uppercase and lowercase letter.");
                  } else {
                    setOpenEditDialog(true);
                    setState(1);
                  }}
                }>Save</p>
              )}
            </div>
            <div className="w-full relative items-center flex justify-center gap-2">
            <input
              type="password"
              className={`w-5/6 h-10 bg-[#b7cde3] border ${
                !password ? "focus:border-red-700" : "focus:border-[#60a5fa]"
              } text-black placeholder-gray-400 focus:outline-none border-[#60a5fa] p-2 rounded-md`}
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={(e => {
                if (e.key === "Enter") {
                  if (!password || passwordError || changeInputs) {
                    alert("Password is missing or not in format\nPassword must have:\nAtleast 10 characters\ncontains Special Caracter(eg. !@#$%^&*)\nAtleast one uppercase and lowercase letter.");
                  } else {
                    setOpenEditDialog(true);
                    setState(1);
                  }
                }
              })}
              disabled={!editPassword}
            />
              {(!editEmail && !editPassword) && (
                <Edit className="absolute right-12 top-2" sx={{fontSize: 15}} onClick={() => setEditPassword(true)}></Edit>
              )}
            </div>
          </div>
          <div className="w-full absolute bottom-10 flex items-center justify-between px-20 mt-8">
            <p className="font-bold text-lg text-white cursor-pointer" onClick={handleCloseDrawer}>BACK</p>
            <button
              className="bg-[#ef4444] text-white px-4 py-2 rounded-full flex flex-row items-center gap-x-2"
              onClick={() => setOpenLogoutDialog(true)}
            >
              <Logout className="text-white" style={{ fontSize: 25 }} />
              <p className="font-bold text-lg">LOG OUT</p>
            </button>
          </div>
        </div>
      </Drawer>

      {/* Confirm Dialog */}
      {/* Email and Password change confirmation dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth 
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "white",
            color: "#000",
            borderRadius: "25px",
          },
        }}
      >
        <DialogTitle className="bg-[#b7cde3] relative">
          {state === 0 ? "Confirm Email Change" : state === 1 ? "Confirm Password Change" : "Confirm Picture Change"}
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={handleCancel} className="rounded-full ">
              <Close sx={{ fontSize: 40, color: 'black' }}></Close>
            </IconButton>
          </DialogActions>
        </DialogTitle>
        <DialogContent className="my-5">
          {state === 0 ? (
            <Typography variant="body1" className="text-center mt-4">
              Are you sure you want to change your email to <span className="font-bold">{email}</span>?
            </Typography>
          ) : state === 1 ? (
            <>
              <Typography variant="body1" className="text-center mt-4">
                Are you sure you want to change your password?
              </Typography>
              <input type="password" className="w-full h-10 bg-[#b7cde3] border text-black placeholder-gray-400 focus:outline-none border-[#60a5fa] p-2 rounded-md mt-4" placeholder="Current Password" value={currentPassword} onChange={handleCurrentPasswordChange} /> 
              <Typography variant="body1" className="text-center mt-4">
                Please enter confirm the changed password:
              </Typography>
              <input type="password" disabled className="w-full h-10 bg-[#b7cde3] border text-black placeholder-gray-400 focus:outline-none border-[#60a5fa] p-2 rounded-md mt-4" placeholder="New Password" value={password} onChange={handlePasswordChange} />
              <input type="password" className="w-full h-10 bg-[#b7cde3] border text-black placeholder-gray-400 focus:outline-none border-[#60a5fa] p-2 rounded-md mt-4" placeholder="Confirm Password" value={confirmPassword} onChange={handleConfirmPasswordChange} />
            </>
          ) : (
            <Typography variant="body1" className="text-center mt-4">
              Are you sure you want to change your profile picture?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>
            <p className="text-base font-roboto font-bold text-[#64748b] p-2">Back</p>
          </Button>
          <Button 
            onClick={handleSave} 
            sx={{
              paddingX: "3rem",
              bgcolor: "#60a5fa",
              color: "white",
              borderRadius: "100px",
            }}
          >
            <p>{state === 0 ? "Save Email" : state === 1 ? "Save Password" : "Save Picture"}</p>
          </Button>
        </DialogActions>
      </Dialog>


      {/* Logout Dialog */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        maxWidth="xs"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "white",
            color: "#000",
            borderRadius: "25px",
          },
        }}
      >
        <DialogTitle className="bg-[#ef4444] relative">
          Confirm Logout
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={() => setOpenLogoutDialog(false)} className="rounded-full ">
              <Close sx={{ fontSize: 40, color: 'black' }}></Close>
            </IconButton>
          </DialogActions>
        </DialogTitle>
        <dialogContent className="my-5">
          <Typography variant="body1" className="text-center mt-4">
            Are you sure you want to log out?
          </Typography>
        </dialogContent>
        <DialogActions>
            <Button onClick={() => setOpenLogoutDialog(false)}>
              <p className="text-base font-roboto font-bold text-[#64748b] p-2">Back</p>
            </Button>
            <Button 
              onClick={handleLogout} 
              sx={{
                paddingX: "3rem",
                bgcolor: "#ef4444",
                color: "white",
                borderRadius: "100px",
              }}
            >
              <Logout className="text-white" style={{ fontSize: 25 }} />
              <p className="font-bold text-lg">LOG OUT</p>
            </Button>
          </DialogActions>
      </Dialog>
    </div>
  );
}

Layout.propTypes = {
  open: PropTypes.bool.isRequired,
  onMenuClick: PropTypes.func.isRequired,
};
