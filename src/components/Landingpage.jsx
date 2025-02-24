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
  Badge,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications,
  Home,
  CalendarToday,
  Folder,
  People,
  CrisisAlert,
} from "@mui/icons-material";
import "../styles/usermanagement.css";

export default function Landingpage() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setOpen(!open);
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
      <main className={`main-content ${open ? 'shifted' : ''}`}>
        {/* Your main content goes here */}
      </main>
    </div>
  );
}
