import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Calendar from "../components/schedulerComponents/SchedulerRightSides/CalendarComponent";
import Requests from "../components/schedulerComponents/SchedulerRightSides/RequestsComponent";
import SchedulerLeftSide from "../components/schedulerComponents/SchedulerLeftsides/SchedulerLeftSide";
import { API } from "../api";
import axios from "axios";
import { useContext } from 'react';
import { OpenContext } from '../contexts/OpenContext';
import { format, } from "date-fns";

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
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [backlogs, setBacklogs] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
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

  const headerDate = format(new Date(selectedDate || new Date()), "EEEE, MMMM dd, yyyy").toUpperCase();

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
            <div className="bg-[#b7cde3] w-full p-4 flex flex-col flex-1 overflow-auto">
              <div className="relative">
                <div
                  className="font-norwester font-bold px-4 py-3 text-black -mb-3"
                  style={{
                    left: 0,
                    fontSize: "clamp(1.4rem, 2.1vw, 2.45rem)", // ~70% of 2rem → 3.5rem
                  }}
                >
                  {headerDate}
                </div>
              </div>
              <div className="bg-white p-4">
                  <SchedulerLeftSide 
                    initial={backlogs} 
                    updateBacklogs={updateBacklogs} 
                    calendarDate={setSelectedDate}
                    SelectedDate={selectedDate}
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
                setSelectedDate={setSelectedDate}
                initial={backlogs}
                selectedDate={selectedDate}
              />
            <Requests initial={backlogs} updateBacklogs={updateBacklogs} setSelectedDate={setSelectedDate} />
          </div>
        </div>
      </main>
    </div>
  );
}
