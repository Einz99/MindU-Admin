import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { Home, CalendarToday, Folder, People } from "@mui/icons-material";

const menuItems = [
  { text: "Home", icon: <Home />, link: "/" },
  { text: "Scheduler", icon: <CalendarToday />, link: "/scheduler" },
  { text: "Content Management", icon: <Folder />, link: "/content-management" },
  { text: "User Management", icon: <People />, link: "/user-management" },
];

export default function Sidebar({ open }) {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        "& .MuiDrawer-paper": {
          backgroundColor: "#5bb780",
          width: open ? 240 : 65,
          transition: "width 0.3s ease",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center", // Centers items vertically
          padding: "20px 0",
          zIndex: 1000, // Ensures it's below the navbar
          top: "64px", // Adjust for Navbar height
          height: "calc(100vh - 64px)", // Prevents overlaying the Navbar
          position: "fixed",
          scrollbarWidth: "none", // Hides scrollbar
        },
      }}
    >
      <Box className="flex flex-col items-center w-full gap-4"> {/* Added gap for spacing */}
        <List className="w-full flex flex-col gap-4">
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding className="w-full">
              <ListItemButton
                component={Link}
                to={item.link}
                selected={location.pathname === item.link}
                sx={{
                  "&.Mui-selected": { backgroundColor: "#4caf50", color: "white" },
                  marginBottom: "12px", // Adds spacing between items
                  borderRadius: "8px", // Optional: Adds rounded corners
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.link ? "white" : "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
};
