import { AppBar, Toolbar, IconButton, Typography, Badge } from "@mui/material";
import { Menu as MenuIcon, Notifications, CrisisAlert } from "@mui/icons-material";
import PropTypes from "prop-types";
import "../../styles/usermanagement.css";

export default function Navbar({ onMenuClick }) {
  return (
    <AppBar position="fixed" className="top-navbar" sx={{ backgroundColor: "#5bb780" }}>
      <Toolbar className="toolbar">
        <IconButton color="inherit" edge="start" onClick={onMenuClick} className="menu-button">
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
  );
}

Navbar.propTypes = {
  onMenuClick: PropTypes.func.isRequired,
};
