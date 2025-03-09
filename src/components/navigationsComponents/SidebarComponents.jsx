import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { Home, CalendarToday, Folder, People } from "@mui/icons-material";
import "../../styles/usermanagement.css";

const menuItems = [
  { text: "Home", icon: <Home />, link: "/" },
  { text: "Scheduler", icon: <CalendarToday />, link: "/scheduler" },
  { text: "Content Management", icon: <Folder />, link: "/content-management" },
  { text: "User Management", icon: <People />, link: "/user-management" },
];

export default function Sidebar({ open, onToggle }) {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      open={open}
      onClose={onToggle}
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
  );
}

Sidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};
