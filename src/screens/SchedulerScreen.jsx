import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Calendar from "../components/schedulerComponents/SchedulerRightSides/CalendarComponent";
import Requests from "../components/schedulerComponents/SchedulerRightSides/RequestsComponent";
import SchedulerLeftSide from "../components/schedulerComponents/SchedulerLeftsides/SchedulerLeftSide";
import { API } from "../api";
import axios from "axios";
import { useContext } from 'react';
import { OpenContext } from '../contexts/OpenContext';
import { Download, FilterAlt, Sort } from "@mui/icons-material";
import { format } from "date-fns";

/**
 * ===========================================
 * Screen: Schedule Management System
 * Author: Ronald M. Villarde
 * Created: 2025-02-20
 * Last Updated: 2025-04-28
 * 
 * Description:
 * - This screens shows the scheduling system in place where in the student request can be scheduled
 * - Add a new schedule for events that is unrelated to individual student
 * 
 * Purpose:
 * - Is to mainstream the schedule of guidance management.
 * - This is done via status.
 * 
 * Navigation:
 * - Dashboard/Home
 * - Content Management System
 * - User Management System
 * 
 * State Variables:
 * open (bool) - Track whether the drawer is open or close
 * selectedDate (string) - The selected date in calendar, defaulted to the current date
 * backlogs (array) - List of scheduled event or meetings fetched from database.
 * 
 * Functions:
 * - handleDrawerToggle: Toggles/Inverts the drawer whether its open or close
 * 
 * API Calls:
 * - Backend API: Get the data from database via backend specifically the backlogs
 * 
 * Error Handling:
 * - If no response from fetch: logs "Failed to fetch backlogs".
 * - If an error occurs: logs the specific error.
 * 
 * Notes:
 * - [Anything extra devs or reviewers should know about this screen]
 * ===========================================
 */



export default function Scheduler() {
  const { open, setOpen } = useContext(OpenContext);
  const [backlogs, setBacklogs] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterType, setFilterType] = useState(0);
  const [sortType, setSortType] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);
  /**
   * useEffect hook to fetch backlogs data from the database via backend API.
   * 
   * Effect:
   * - Fetches data from backend
   * - Saves the fetched data into the 'backlogs' state.
   * 
   * Error Handling:
   * - If no response from fetch: logs "Failed to fetch backlogs".
   * - If an error occurs: logs the specific error.
   */
  useEffect(() => {
    const fetchBacklogs = async () => {
      try {
        const response = await axios.get(`${API}/backlogs`);
        setBacklogs(response.data);
      } catch (error) {
        console.error("Error fetching backlogs:", error.response?.data || error.message);
      }
    };

    fetchBacklogs(); // initial load

    const interval = setInterval(fetchBacklogs, 60 * 1000); // auto-refresh every 60s

    return () => clearInterval(interval); // cleanup on unmount
  }, []); // <- run once on mount

  // Manual refresh trigger
  useEffect(() => {
    const fetchBacklogs = async () => {
      try {
        const response = await axios.get(`${API}/backlogs`);
        setBacklogs(response.data);
      } catch (error) {
        console.error("Error fetching backlogs:", error.response?.data || error.message);
      }
    };

    fetchBacklogs(); // run when reloadKey changes
  }, [reloadKey]);

  // Toggle the sidebar open/close state
  const handleDrawerToggle = () => {
    setOpen(prev => !prev);
  };

  const updateBacklogs = () => {
    setReloadKey((prev) => prev + 1);
  }
  
  const handleFilter = (type) => {
    setFilterOpen(prev => !prev);
    setFilterType(type);
  }

  const handleSort = (type) => {
    setSortOpen(prev => !prev);
    setSortType(type);
  }

  // 🔹 Helper function to convert array to CSV string
  const convertToCSV = (data, headers) => {
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape values that contain commas, quotes, or newlines
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  };

  // 🔹 Helper function to download CSV
  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add this function inside your Scheduler component
  const handleDownload = () => {
    // Get the filtered and sorted data from the table
    const statusOrder = {
      Scheduled: 0,
      Completed: 1,
      Cancelled: 2,
      Trash: 3,
    };

    const filteredData = (backlogs || [])
      .filter((data) => {
        if (!data.sched_date || data.status === "Pending") return false;
        if (filterType === 1 && data.status !== "Scheduled") return false;
        if (filterType === 2 && data.status !== "Cancelled") return false;
        if (filterType === 3 && data.status !== "Completed") return false;
        return true;
      })
      .sort((a, b) => {
        const isAAppointment = a.student_id != null;
        const isBAppointment = b.student_id != null;
        if (isAAppointment !== isBAppointment) {
          return isAAppointment ? 1 : -1;
        }

        const statusA = statusOrder[a.status] ?? 999;
        const statusB = statusOrder[b.status] ?? 999;
        if (statusA !== statusB) return statusA - statusB;

        if (sortType === 0) {
          return a.name.localeCompare(b.name);
        }
        if (sortType === 1) {
          return b.name.localeCompare(a.name);
        }
        if (sortType === 2) {
          const dateA = new Date(a.sched_date);
          const dateB = new Date(b.sched_date);
          return dateA - dateB;
        }

        return a.name.localeCompare(b.name);
      });

    // Format data for CSV
    const csvData = filteredData.map((data) => ({
      'Name/Event': data.name,
      'Date & Time': format(new Date(data.sched_date), "MMMM dd, yyyy hh:mm a"),
      'Status': data.status,
      'Message': data.message || 'N/A',
    }));

    const filterNames = {
      0: 'All',
      1: 'Scheduled',
      2: 'Cancelled',
      3: 'Completed'
    };

    const tabName = currentTab === 0 ? 'Appointments' : 'Events';
    const filterName = filterNames[filterType] || 'All';
    const currentDate = format(new Date(), "yyyy-MM-dd");

    // Generate CSV content
    const csvContent = convertToCSV(csvData, ['Name/Event', 'Date & Time', 'Status', 'Message']);

    // Generate filename with current date
    const filename = `Scheduler_${tabName}_${filterName}_${currentDate}.csv`;

    // Download file
    downloadCSV(csvContent, filename);
  };

  return (
    <div className="flex bg-[#f8fafc] flex-1 overflow-hidden">
      {/* The Top and Left Bar */}
      <Layout open={open} onMenuClick={handleDrawerToggle} />

      {/* Main Content */}
      <main
        className={`flex-1 bg-[#f8fafc] transition-all ${
          open ? "ml-60" : "ml-16"
        } mt-20`}
        style={{ height: "calc(100vh - 80px)"}}
      >
        <div 
          className="flex flex-row flex-grow gap-[clamp(0.75rem,1.5vw,2rem)] px-[clamp(1rem,2vw,4rem)] pt-4"
          style={{ height: "100%"}}
        >
          {/**
           * Modularized Components:
           * The Tabs and Table of schedule
           * 70% of the whole screen in the left side 
           */}
          <div className="flex flex-col w-[70%]">
            <h1
              className="text-[clamp(2rem,3vw,3.5rem)] font-roboto font-bold tracking-[1rem] text-[#1e3a8a] text-center"
              style={{
                textShadow: "4px 4px 0px rgba(0,0,0,0.5)"
              }}
            >
              GUIDANCE SCHEDULER
            </h1>
            <div className="bg-[#b7cde3] w-full p-4 flex flex-col flex-1">
              <div className="flex justify-between">
                <div
                  className="font-norwester font-bold px-4 py-3 text-black -my-3"
                  style={{
                    left: 0,
                    fontSize: "clamp(1.4rem, 2.1vw, 2.45rem)", // ~70% of 2rem → 3.5rem
                  }}
                >
                  Appointments & Events List
                </div>
                <div className="flex items-center justify-center" style={{ height: '100%' }}>
                  <div className="flex gap-4">
                    <div className="cursor-pointer" onClick={handleDownload}>
                      <Download 
                        style={{ fontSize: '2rem' }}
                      />
                    </div>
                    <div className="relative">
                      <FilterAlt 
                        style={{ fontSize: '2rem' }}
                        onClick={() => {setFilterOpen(prev => !prev); setSortOpen(false)}}
                      />
                      {filterOpen && (
                        <div className="z-50">
                          <div className="absolute right-1 w-fit bg-[#b7cde3] rounded-s-xl shadow-lg border-4 border-[#1e3a8a] mt-2 z-40">
                            <ul className="text-right">
                              <li className={`px-4 py-2 text-[#64748b] hover:text-[#334155] cursor-pointer rounded-tl-xl ${filterType === 0 && "text-black"}`} onClick={() => handleFilter(0)}>All</li>
                              <li className={`px-4 py-2 text-[#64748b] hover:text-[#334155] cursor-pointer ${filterType === 1 && "text-black"}`} onClick={() => handleFilter(1)}>Scheduled</li>
                              <li className={`px-4 py-2 text-[#64748b] hover:text-[#334155] cursor-pointer ${filterType === 2 && "text-black"}`} onClick={() => handleFilter(2)}>Cancelled</li>
                              <li className={`px-4 py-2 text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${filterType === 3 && "text-black"}`} onClick={() => handleFilter(3)}>Completed</li>
                            </ul>
                          </div>
                          <div className="absolute right-2 top-[-0.5px] w-4 h-10  border-x-8 border-b-8 border-b-[#1e3a8a] border-x-transparent z-50" />
                          <div className="absolute right-2 top-[12px] w-4 h-8  border-x-8 border-b-8 border-b-[#b7cde3] border-x-transparent z-50" />
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <Sort 
                        style={{ fontSize: '2rem' }} 
                        onClick={() => {setSortOpen(prev => !prev); setFilterOpen(false)}}
                      />
                      {sortOpen && (
                        <div className="z-50">
                          <div className="absolute right-1 w-[5.903rem] bg-[#b7cde3] rounded-s-xl shadow-lg border-4 border-[#1e3a8a] mt-2 z-40">
                            <ul className="text-right">
                              <li className={`px-4 py-2  text-[#64748b] hover:text-[#334155] cursor-pointer rounded-tl-xl ${sortType === 0 && "text-black"}`} onClick={() => handleSort(0)}>A - Z</li>
                              <li className={`px-4 py-2  text-[#64748b] hover:text-[#334155] cursor-pointer ${sortType === 1 && "text-black"}`} onClick={() => handleSort(1)}>Z - A</li>
                              <li className={`px-4 py-2  text-[#64748b] hover:text-[#334155] cursor-pointer rounded-bl-xl ${sortType === 2 && "text-black"}`} onClick={() => handleSort(2)}>By Date</li>
                            </ul>
                          </div>
                          <div className="absolute right-2 top-[-0.5px] w-4 h-10  border-x-8 border-b-8 border-b-[#1e3a8a] border-x-transparent z-50" />
                          <div className="absolute right-2 top-[12px] w-4 h-8  border-x-8 border-b-8 border-b-[#b7cde3] border-x-transparent z-50" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4">
                  <SchedulerLeftSide 
                    initial={backlogs} 
                    updateBacklogs={updateBacklogs} 
                    filterType={filterType}
                    sortType={sortType}
                    onTabChange={setCurrentTab}
                  />
              </div>
            </div>
          </div>
          
          {/**
           * Modularized Components:
           * The Calendar and Unscheduled meeting request cards
           * 30% of the whole screen in the right side 
           */}
          <div className="flex flex-col gap-4 flex-[1] min-w-[30%]">
              <Calendar
                initial={backlogs}
              />
            <Requests initial={backlogs} updateBacklogs={updateBacklogs} />
          </div>
        </div>
      </main>
    </div>
  );
}