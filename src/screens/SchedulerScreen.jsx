import React, { useState, useEffect } from "react";
import Navbar from "../components/navigationsComponents/TopNavBarComponent";
import Sidebar from "../components/navigationsComponents/SidebarComponents";
import Calendar from "../components/schedulerComponents/CalendarComponent";
import Requests from "../components/schedulerComponents/RequestsComponent";
import SchedulerTable from "../components/schedulerComponents/SchedulerDetailsComponent";
import { API } from "../api";
import TrashTable from "../components/schedulerComponents/TrashDetailsComponent";

export default function Scheduler() {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [backlogs, setBacklogs] = useState([]);
  const [isTrash, setIsTrash] = useState(0);

  // Fetch backlog records from the backend on mount
  useEffect(() => {
    const fetchBacklogs = async () => {
      try {
        const response = await fetch(`${API}/backlogs`);
        if (!response.ok) throw new Error("Failed to fetch backlogs");
        const data = await response.json();
        setBacklogs(data);
      } catch (error) {
        console.error("Error fetching backlogs:", error);
      }
    };
    fetchBacklogs();
  }, []);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <div className="flex bg-gray-200">
      <Navbar onMenuClick={handleDrawerToggle} />
      <Sidebar open={open} onToggle={handleDrawerToggle} />

      {/* Main Content */}
      <main
        className={`flex justify-center flex-row flex-grow p-4 bg-gray-200 transition-all ${
          open ? "ml-60" : "ml-16"
        } mt-16`}
      >
        <div className="p-4 flex flex-col gap-4 w-[30%]">
          <Calendar setSelectedDate={setSelectedDate} initial={backlogs} />
          <Requests initial={backlogs} SelectedDate={selectedDate} />
        </div>
        {isTrash === 0 ? (
          <SchedulerTable setIsTrash={setIsTrash} SelectedDate={selectedDate} initial={backlogs} />
        ) : <TrashTable setIsTrash={setIsTrash} SelectedDate= {selectedDate} initial={backlogs} />
      }
        
      </main>
    </div>
  );
}
