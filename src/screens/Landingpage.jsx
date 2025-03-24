import { useState } from "react";
import Navbar from "../components/navigationsComponents/TopNavBarComponent"
import Sidebar from "../components/navigationsComponents/SidebarComponents";

export default function Landingpage() {
  const [open, setOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <div className="dashboard-container">
      <Navbar onMenuClick={handleDrawerToggle}/>
      <Sidebar open={open} onToggle={handleDrawerToggle} />

      {/* Main Content */}
      <main className={`main-content ${open ? 'shifted' : ''}`}>
        {/* Your main content goes here */}
      </main>
    </div>
  );
}
