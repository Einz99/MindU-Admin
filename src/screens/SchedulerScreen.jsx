import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Calendar from "../components/schedulerComponents/SchedulerRightSides/CalendarComponent";
import Requests from "../components/schedulerComponents/SchedulerRightSides/RequestsComponent";
import SchedulerLeftSide from "../components/schedulerComponents/SchedulerLeftsides/SchedulerLeftSide";
import { API } from "../api";
import axios from "axios";
import { useContext } from 'react';
import { OpenContext } from '../contexts/OpenContext';
import { FilterAlt, Sort } from "@mui/icons-material";

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
  // const [availableTimes, setAvailableTime] = useState([])

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

  return (
    <div className="flex bg-[#f8fafc] flex-1 overflow-hidden">
      {/* The Top and Left Bar */}
      <Layout open={open} onMenuClick={handleDrawerToggle} />

      {/* Main Content */}
      <main
        className={`flex-1 bg-[#f8fafc] transition-all ${
          open ? "ml-60" : "ml-16"
        } mt-16`}
        style={{ height: "calc(100vh - 64px)"}}
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
                  className="font-norwester font-bold px-4 py-3 text-black -mb-3"
                  style={{
                    left: 0,
                    fontSize: "clamp(1.4rem, 2.1vw, 2.45rem)", // ~70% of 2rem → 3.5rem
                  }}
                >
                  Appointments & Events List
                </div>
                <div className="flex items-center justify-center" style={{ height: '100%' }}>
                  <div className="flex gap-4">
                    <div className="relative">
                      <FilterAlt 
                        style={{ fontSize: '2rem' }}
                        onClick={() => {setFilterOpen(prev => !prev); setSortOpen(false)}}
                      />
                      {filterOpen && (
                        <div className="z-50">
                          <div className="absolute right-1 w-fit bg-[#b7cde3] rounded-s-xl shadow-lg border-4 border-[#1e3a8a] mt-2 z-40">
                            <ul className="text-right">
                              <li className={`px-4 py-2 hover:bg-blue-300 cursor-pointer rounded-tl-xl ${filterType === 0 && "bg-blue-300"}`} onClick={() => handleFilter(0)}>All</li>
                              <li className={`px-4 py-2 hover:bg-blue-300 cursor-pointer ${filterType === 1 && "bg-blue-300"}`} onClick={() => handleFilter(1)}>Scheduled</li>
                              <li className={`px-4 py-2 hover:bg-blue-300 cursor-pointer ${filterType === 2 && "bg-blue-300"}`} onClick={() => handleFilter(2)}>Cancelled</li>
                              <li className={`px-4 py-2 hover:bg-blue-300 cursor-pointer rounded-bl-xl ${filterType === 3 && "bg-blue-300"}`} onClick={() => handleFilter(3)}>Completed</li>
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
                              <li className={`px-4 py-2 hover:bg-blue-300 cursor-pointer rounded-tl-xl ${sortType === 0 && "bg-blue-300"}`} onClick={() => handleSort(0)}>A - Z</li>
                              <li className={`px-4 py-2 hover:bg-blue-300 cursor-pointer ${sortType === 1 && "bg-blue-300"}`} onClick={() => handleSort(1)}>Z - A</li>
                              <li className={`px-4 py-2 hover:bg-blue-300 cursor-pointer rounded-bl-xl ${sortType === 2 && "bg-blue-300"}`} onClick={() => handleSort(2)}>By Date</li>
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
