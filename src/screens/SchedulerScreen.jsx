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
import { Add, ArrowForwardIos } from "@mui/icons-material";

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

const availableTimes = [
  {
    date: "2025-09-15",
    Time: {
      Morning: [
        { id: 1, time: "08:00 AM" },
        { id: 2, time: "09:30 AM" },
        { id: 3, time: "10:00 AM" }
      ],
      Afternoon: [
        { id: 4, time: "01:00 PM" },
        { id: 5, time: "02:30 PM" },
        { id: 6, time: "04:00 PM" }
      ]
    }
  },
  {
    date: "2025-09-16",
    Time: {
      Morning: [
        { id: 7, time: "08:30 AM" },
        { id: 8, time: "09:00 AM" }
      ],
      Afternoon: [
        { id: 9, time: "01:00 PM" },
        { id: 10, time: "03:00 PM" },
        { id: 11, time: "05:00 PM" }
      ]
    }
  },
  {
    date: "2025-09-17",
    Time: {
      Morning: [
        { id: 12, time: "08:00 AM" },
        { id: 13, time: "09:00 AM" },
        { id: 14, time: "10:30 AM" }
      ],
      Afternoon: [
        { id: 15, time: "01:30 PM" },
        { id: 16, time: "03:30 PM" }
      ]
    }
  },
  {
    date: "2025-09-18",
    Time: {
      Morning: [
        { id: 17, time: "08:30 AM" },
        { id: 18, time: "09:30 AM" },
        { id: 19, time: "11:00 AM" }
      ],
      Afternoon: [
        { id: 20, time: "02:00 PM" },
        { id: 21, time: "04:00 PM" }
      ]
    }
  },
  {
    date: "2025-09-19",
    Time: {
      Morning: [
        { id: 22, time: "08:00 AM" },
        { id: 23, time: "09:30 AM" }
      ],
      Afternoon: [
        { id: 24, time: "01:30 PM" },
        { id: 25, time: "02:30 PM" },
        { id: 26, time: "04:00 PM" }
      ]
    }
  }
];

export default function Scheduler() {
  const { open, setOpen } = useContext(OpenContext);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [backlogs, setBacklogs] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [showTimeAvailability, setShowTimeAvailability] = useState(false);
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
            <div className="flex flex-col w-full flex-1 flex-grow relative">
              <Calendar
                setSelectedDate={setSelectedDate}
                initial={backlogs}
                selectedDate={selectedDate}
                setShowTimeAvailability={setShowTimeAvailability}
              />
              <div
                className={`bg-[#1e3a8a] absolute w-[105%] h-full top-0 right-0 z-10 transition-all rounded-xl duration-1000 ease-in-out flex flex-row p-5 ${
                  showTimeAvailability
                    ? "opacity-100 pointer-events-auto transform translate-x-[8%]"
                    : "opacity-0 pointer-events-none transform translate-x-[100%]"
                }`}
              >
                <div className="h-full w-[5%]">
                  <div
                    className="h-full w-full flex items-center justify-center cursor-pointer"
                    onClick={() => setShowTimeAvailability(false)}
                  >
                    <span className="material-symbols-outlined text-white text-3xl select-none">
                      <ArrowForwardIos />
                    </span>
                  </div>
                </div>

                <div className="text-white text-end w-full pr-[5%] flex flex-col justify-between">
                  <p className="text-4xl font-bold">Time Availability</p>
                  <p className="text-2xl">{format(new Date(selectedDate), "MMM dd, yyyy")}</p>
                  <div className="border-b border-white w-full my-2 ml-2" />
                  {/* Use flex to divide space evenly between Morning and Afternoon */}
                  <div className="flex flex-col h-full justify-between">
                    {/* Morning Section */}
                    <div className="flex-grow">
                      <p className="text-xl font-bold mb-5">Morning</p>
                      <div
                        className="h-[calc(100%-3rem)]"
                        style={{ maxHeight: "50%" }}
                      >
                        {/* Horizontal Scroll for Morning Time Slots */}
                        <div className="flex justify-self-end overflow-x-auto space-x-4 scrollbar-custom1">
                          <div 
                            className="text-black my-auto p-1 rounded-full text-center h-fit border border-black text-xs"
                            style={{
                              background: "linear-gradient(90deg, #60a5fa, #4f46e5)", // Gradient from #60a5fa to #4f46e5
                            }}
                          >
                            <Add />
                          </div>
                          {availableTimes
                            .find((item) => item.date === selectedDate)
                            ?.Time.Morning.map((time, index) => (
                              <div key={index} className="flex-shrink-0 bg-[#b7cde3] border border-black text-black px-6 py-2 rounded-lg text-center">
                                {time.time} {/* Accessing the `time` property from the time object */}
                              </div>
                          ))}
                        </div>
                      </div>
                    </div>
                          
                    {/* Afternoon Section */}
                    <div className="flex-grow">
                      <p className="text-xl font-bold mb-5">Afternoon</p>
                      <div className="h-[calc(100%-3rem)]" style={{ maxHeight: "50%" }}>
                        {/* Horizontal Scroll for Afternoon Time Slots */}
                        <div className="flex justify-self-end overflow-x-auto space-x-4 scrollbar-custom1">
                          {/* Add Button */}
                          <div
                            className="flex my-auto items-center justify-center text-black p-1 rounded-full text-center h-fit border border-black text-xs cursor-pointer"
                            style={{
                              background: "linear-gradient(90deg, #60a5fa, #4f46e5)", // Gradient from #60a5fa to #4f46e5
                            }}
                          >
                            <Add />
                          </div>
                          
                          {/* Time slots for afternoon */}
                          {availableTimes
                            .find((item) => item.date === selectedDate)
                            ?.Time.Afternoon.map((time, index) => (
                              <div key={index} className="flex-shrink-0 bg-[#b7cde3] border border-black text-black px-6 py-2 rounded-lg text-center">
                                {time.time} {/* Accessing the `time` property from the time object */}
                              </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Requests initial={backlogs} updateBacklogs={updateBacklogs} setSelectedDate={setSelectedDate} />
          </div>
        </div>
      </main>
    </div>
  );
}
