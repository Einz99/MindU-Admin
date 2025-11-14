
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
import { useNavigate } from 'react-router-dom';

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
 * - **Topbar**: Displays the app's title and icons for notifications and alerts.
 * - **Sidebar**: Contains navigation links with icons and text. The width of the sidebar adjusts based on whether it's open or collapsed.
 * - The sidebar is sticky and stays in place even when scrolling.
 * - The component uses Material-UI's `Drawer`, `AppBar`, and `List` components to structure the layout.
 */

export default function Layout({ open, onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const staffData = JSON.parse(localStorage.getItem("staff"));
  const [staff, setStaff] = useState({});
  const [openProfile, setOpenProfile] = useState(false);
  const [email, setEmail] = useState("");
  const [displayEmail, setDisplayEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openPictureDialog, setOpenPictureDialog] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [robitBadge, setRobitBadge] = useState(0);
  const [openError, setOpenError] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (openError) return;

    const timer = setTimeout(() => {
      setAlertMessage('');
      setIsSuccessful(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [openError]);

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
        setDisplayEmail(data.email);
        setPassword(hashedPassword);
      } catch (error) {
        console.error("Error fetching staff data:", error);
        
        // Clear authentication data
        localStorage.removeItem("authToken");
        localStorage.removeItem("staff");
        
        // Redirect to login page using React Router
        navigate("/", { replace: true });
      }
    };
    
    const fetchLength = async () => {
      try {
        const res = await axios.get(`${API}/students`);
        const filteredStudents = res.data.filter(student => student.isAskingHelp && student.chatStatus === 'Pending');
        const length = filteredStudents.length;
        setRobitBadge(length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  
    fetchStaffData();
    fetchLength();
  }, [staffData.id, navigate]);
        
  
  const handleCloseDrawer = () => {
    requestAnimationFrame(() => {
      if (document.activeElement) {
        document.activeElement.blur();
      }
      setTimeout(() => setOpenProfile(false), 50);
    });
  };

  const handleEmailDialogOpen = () => {
    setNewEmail(email);
    setEmailError(false);
    setOpenEmailDialog(true);
  };

  const handleEmailDialogClose = () => {
    setOpenEmailDialog(false);
    setNewEmail("");
    setEmailError(false);
  };

  const handlePasswordDialogOpen = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(false);
    setOpenPasswordDialog(true);
  };

  const handlePasswordDialogClose = () => {
    setOpenPasswordDialog(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(false);
  };

  const handleNewEmailChange = (e) => {
    const inputEmail = e.target.value;
    setNewEmail(inputEmail);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputEmail)) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
  };

  const handleNewPasswordChange = (e) => {
    const input = e.target.value;
    setNewPassword(input);

    const hasMinLength = input.length >= 10;
    const hasUppercase = /[A-Z]/.test(input);
    const hasLowercase = /[a-z]/.test(input);
    const hasNumber    = /[0-9]/.test(input);
    const hasSpecial   = /[!@#$%^&*(),.?":{}|<>]/.test(input);

    const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
    setPasswordError(!isValid);
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

  const handlePictureChange = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewImage(reader.result);
          setOpenPictureDialog(true);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSaveEmail = async () => {
    try {
      if (emailError || !newEmail || !currentPassword) {
        setAlertMessage("Please provide current password and a valid email address.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      // Sending currentPassword along with the email for validation
      await axios.put(`${API}/staffs/email/${staffData.id}`, 
        { email: newEmail, currentPassword }, config
      );

      setEmail(newEmail);
      setDisplayEmail(newEmail);
      setOpenEmailDialog(false);
      setAlertMessage("Email changed successfully!");
      setIsSuccessful(true);
      setOpenError(true);
    } catch (error) {
      console.error("Email update failed:", error);
      setAlertMessage(error.response?.data?.message || "An error occurred while updating email.");
      setIsSuccessful(false);
      setOpenError(true);
    }
  };

  const handleSavePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setAlertMessage("All password fields are required.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      if (newPassword !== confirmPassword) {
        setAlertMessage("New passwords do not match.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      if (passwordError) {
        setAlertMessage("Password must have:\n• At least 10 characters\n• Special character (e.g., !@#$%^&*)\n• At least one uppercase and lowercase letter\n• At least one number");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      await axios.put(`${API}/staffs/password/${staffData.id}`, {
        currentPassword,
        newPassword: newPassword,
      }, config);

      const hashedPassword = '#'.repeat(newPassword.length);
      setPassword(hashedPassword);
      setOpenPasswordDialog(false);
      setAlertMessage("Password changed successfully!");
      setIsSuccessful(true);
      setOpenError(true);
    } catch (error) {
      console.error("Password update failed:", error);
      setAlertMessage(error.response?.data?.message || "An error occurred while updating password.");
      setIsSuccessful(false);
      setOpenError(true);
    }
  };

  const handleSavePicture = async () => {
    try {
      if (!selectedFile) {
        setAlertMessage("No file selected.");
        setIsSuccessful(false);
        setOpenError(true);
        return;
      }

      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("picture", selectedFile);

      const response = await axios.put(`${API}/staffs/picture/${staffData.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedPicturePath = `${response.data.data.picturePath}`;
      setStaff((prevStaff) => ({
        ...prevStaff,
        picture: updatedPicturePath,
      }));

      setOpenPictureDialog(false);
      setPreviewImage(null);
      setSelectedFile(null);
      setAlertMessage("Profile picture changed successfully!");
      setIsSuccessful(true);
      setOpenError(true);
    } catch (error) {
      console.error("Picture update failed:", error);
      setAlertMessage(error.response?.data?.message || "An error occurred while updating picture.");
      setIsSuccessful(false);
      setOpenError(true);
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
            <img src={staff.picture ? `${RootAPI}${staff.picture}` : "/defaultProfile.png"}   alt="Profile" className="w-10 h-10 rounded-full my-auto cursor-pointer" onClick={() => setOpenProfile(true)}/>
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
          <div className="w-60 aspect-square rounded-full border-4 border-[#60a5fa] relative mb-14 max-w-[40%]">
            <img 
              src={previewImage ? previewImage : staff.picture ? `${RootAPI}${staff.picture}` : "/defaultProfile.png"} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover" 
            />
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
              <Edit className="cursor-pointer text-white" sx={{fontSize: 20}} onClick={handleEmailDialogOpen} />
            </div>
            <div className="w-full relative items-center flex justify-center gap-2">
              <input
                type="email"
                className="w-5/6 h-10 bg-[#b7cde3] text-black placeholder-gray-400 focus:outline-none border border-[#60a5fa] p-2 rounded-md"
                value={displayEmail}
                disabled
              />
            </div>
            <div className="w-5/6 items-center flex justify-between mt-4">
              <p className="font-bold text-lg text-white">Password</p>
              <Edit className="cursor-pointer text-white" sx={{fontSize: 20}} onClick={handlePasswordDialogOpen} />
            </div>
            <div className="w-full relative items-center flex justify-center gap-2">
              <input
                type="password"
                className="w-5/6 h-10 bg-[#b7cde3] text-black placeholder-gray-400 focus:outline-none border border-[#60a5fa] p-2 rounded-md"
                value={password}
                disabled
              />
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

      {/* Email Change Dialog */}
      <Dialog
        open={openEmailDialog}
        onClose={handleEmailDialogClose}
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
          Change Email
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={handleEmailDialogClose} className="rounded-full">
              <Close sx={{ fontSize: 40, color: 'black' }}></Close>
            </IconButton>
          </DialogActions>
        </DialogTitle>
        <DialogContent className="my-5">
          <Typography variant="body1" className="mt-4 mb-4">
            Enter your new email address:
          </Typography>
          <input 
            type="email" 
            className={`w-full h-10 border ${
              emailError ? "border-red-700" : "border-[#60a5fa]"
            } text-black placeholder-gray-400 focus:outline-none p-2 rounded-md mb-4`}
            placeholder="New Email" 
            value={newEmail} 
            onChange={handleNewEmailChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveEmail();
              }
            }}
          />
          <Typography variant="body1" className="mt-4 mb-4">
            Enter your current password to confirm changes
          </Typography>
          <input 
            type="password" 
            className="w-full h-10 border text-black placeholder-gray-400 focus:outline-none border-[#60a5fa] p-2 rounded-md" 
            placeholder="Current Password" 
            value={currentPassword} 
            onChange={handleCurrentPasswordChange}
          />
          {emailError && (
            <Typography variant="caption" className="text-red-700 mt-2">
              Please enter a valid email address
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEmailDialogClose}>
            <p className="text-base font-roboto font-bold text-[#64748b] p-2">Cancel</p>
          </Button>
          <Button 
            onClick={handleSaveEmail} 
            sx={{
              paddingX: "3rem",
              bgcolor: "#60a5fa",
              color: "white",
              borderRadius: "100px",
            }}
          >
            <p className="font-bold">Confirm</p>
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={handlePasswordDialogClose}
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
          Change Password
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={handlePasswordDialogClose} className="rounded-full">
              <Close sx={{ fontSize: 40, color: 'black' }}></Close>
            </IconButton>
          </DialogActions>
        </DialogTitle>
        <DialogContent className="my-5">
          <Typography variant="body1" className="text-center mt-4 mb-4">
            Are you sure you want to change your password?
          </Typography>
          <input 
            type="password" 
            className="w-full h-10 border text-black placeholder-gray-400 focus:outline-none border-[#60a5fa] p-2 rounded-md mt-4" 
            placeholder="Current Password" 
            value={currentPassword} 
            onChange={handleCurrentPasswordChange}
          />
          <input 
            type="password" 
            className={`w-full h-10 border ${
              passwordError ? "border-red-700" : "border-[#60a5fa]"
            } text-black placeholder-gray-400 focus:outline-none p-2 rounded-md mt-4`}
            placeholder="New Password" 
            value={newPassword} 
            onChange={handleNewPasswordChange}
          />
          <input 
            type="password" 
            className="w-full h-10 border text-black placeholder-gray-400 focus:outline-none border-[#60a5fa] p-2 rounded-md mt-4" 
            placeholder="Confirm New Password" 
            value={confirmPassword} 
            onChange={handleConfirmPasswordChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSavePassword();
              }
            }}
          />
          {passwordError && (
            <Typography variant="caption" className="text-red-700 mt-2 block">
              Password must have at least 10 characters, one uppercase, one lowercase, one number, and one special character
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordDialogClose}>
            <p className="text-base font-roboto font-bold text-[#64748b] p-2">Cancel</p>
          </Button>
          <Button 
            onClick={handleSavePassword} 
            sx={{
              paddingX: "3rem",
              bgcolor: "#60a5fa",
              color: "white",
              borderRadius: "100px",
            }}
          >
            <p>Save Password</p>
          </Button>
        </DialogActions>
      </Dialog>

      {/* Picture Change Dialog */}
      <Dialog
        open={openPictureDialog}
        onClose={() => {
          setOpenPictureDialog(false);
          setPreviewImage(null);
          setSelectedFile(null);
        }}
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
          Change Profile Picture
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={() => {
              setOpenPictureDialog(false);
              setPreviewImage(null);
              setSelectedFile(null);
            }} className="rounded-full">
              <Close sx={{ fontSize: 40, color: 'black' }}></Close>
            </IconButton>
          </DialogActions>
        </DialogTitle>
        <DialogContent className="my-5">
          <Typography variant="body1" className="text-center mt-4 mb-4">
            Are you sure you want to change your profile picture?
          </Typography>
          {previewImage && (
            <div className="flex justify-center">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="w-40 h-40 rounded-full object-cover border-4 border-[#60a5fa]" 
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenPictureDialog(false);
            setPreviewImage(null);
            setSelectedFile(null);
          }}>
            <p className="text-base font-roboto font-bold text-[#64748b] p-2">Cancel</p>
          </Button>
          <Button 
            onClick={handleSavePicture} 
            sx={{
              paddingX: "3rem",
              bgcolor: "#60a5fa",
              color: "white",
              borderRadius: "100px",
            }}
          >
            <p>Save Picture</p>
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openError}
        onClose={() => {setOpenError(false);}}
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "white",
            color: "#000",
            borderRadius: "25px",
          },
        }}
        maxWidth="xs"
      >
        <DialogTitle className={`${isSuccessful ? "bg-[#b7e3cc]" : "bg-[#e3b7b7]"} relative`}>
          <p className="font-bold">{isSuccessful ? "Successful" : "Error"}</p>
          <DialogActions className="absolute -top-1 right-0">
            <IconButton onClick={() => {setOpenError(false);}} className="rounded-full">
              <Close sx={{ fontSize: 40, color: "black" }} />
            </IconButton>
          </DialogActions>
        </DialogTitle>
        
        <DialogContent className="text-center text-base py-6 px-10 mt-2">
          <p className="font-roboto font-medium text-xl">{alertMessage}</p>
        </DialogContent>
        <DialogActions>
          <button onClick={() => {setOpenError(false);}}>
            <p className="text-base font-roboto font-bold text-[#64748b] p-2 px-6">OK</p>
          </button>
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