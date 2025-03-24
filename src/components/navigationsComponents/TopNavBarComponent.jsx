import { AppBar, Toolbar, IconButton, Typography, Badge } from "@mui/material";
import { Menu as MenuIcon, Notifications, CrisisAlert } from "@mui/icons-material";
import PropTypes from "prop-types";

export default function Navbar({ onMenuClick }) {
  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#5bb780", boxShadow: 1 }}>
      <Toolbar className="flex justify-between items-center">
        <IconButton color="inherit" edge="start" onClick={onMenuClick} className="mr-4">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className="font-bold text-xl">
          <span className="ml-4">MIND U</span>
        </Typography>
        <div className="flex gap-4">
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
