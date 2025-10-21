import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { useContext } from 'react';
import { OpenContext } from '../contexts/OpenContext';
import { Send } from "@mui/icons-material";
import axios from "axios";
import { API, RootAPI } from "../api";
import io from "socket.io-client";

export default function LiveAgent() {
  const { open, setOpen } = useContext(OpenContext);
  const [selected, setSelected] = useState(null);
  const [student_id, setStudentId] = useState(0);
  const [chatData, setChatData] = useState([]);
  const messagesEndRef = useRef(null); // Reference to scroll to the end
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null); // Using useRef to keep the socket connection persistent

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "end",
        inline: "nearest"
      });
    }
  };

  useEffect(() => {
    async function getChatData() {
      try {
        const response = await axios.get(`${API}/chatbot/students-asking-for-help`);
        if (response.data.studentHistory) {
          setChatData(response.data.studentHistory);
        } else {
          setChatData([]);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setChatData([]);
      }
    }
    getChatData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [chatData, selected]);

  const handleDrawerToggle = () => {
    setOpen(prev => !prev);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const newMessage = e.target.elements.message.value;

    if (newMessage.trim() === "") return;

    const newMessageObject = {
      sender: "agent",
      text: newMessage,
      timestamp: new Date().toLocaleString()
    };

    const updatedChatData = [...chatData];
    updatedChatData[selected].messages.push(newMessageObject);
    updatedChatData[selected].lastMessage = newMessage;

    setChatData(updatedChatData);

    setTimeout(() => {
      scrollToBottom();
    }, 50);

    e.target.reset();

    sendMessageToServer(newMessage);
  };

  const sendMessageToServer = async (message) => {
    try {
      const response = await axios.post(`${API}/chatbot/insert-chat-message`, {
        student_id: student_id, 
        message: message,
        is_from_office: true, 
      });
      console.log("Message sent successfully:", response.data);
    } catch (error) {
      console.error('Error sending office chat message:', error);
    }
  };

  useEffect(() => {
    if (!socketRef.current) {
      // Initialize socket connection only once
      const newSocket = io(RootAPI);
      socketRef.current = newSocket;

      newSocket.on('connect', () => {
        console.log('✅ Agent connected to server:', newSocket.id);
        newSocket.emit('join-agent');
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Agent disconnected from server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }

    // Cleanup socket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []); // Only initialize socket connection once

  useEffect(() => {
    if (socketRef.current && student_id) {
      console.log('🔗 Agent joining room for student:', student_id);
      socketRef.current.emit('join-room', student_id);
    }
  }, [student_id]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('new-chat-message', (data) => {
        const { student_id: msgStudentId, message, is_from_office } = data;

        // Ensure the message only updates the chat for the selected student
        if (msgStudentId === student_id) {
          setChatData((prevChatData) => {
            const updatedChatData = [...prevChatData];
            const chatIndex = updatedChatData.findIndex(chat => chat.id === msgStudentId);

            if (chatIndex >= 0) {
              const newMessageObject = {
                sender: is_from_office ? "agent" : "student",
                text: message,
                timestamp: new Date().toLocaleString()
              };

              updatedChatData[chatIndex].messages.push(newMessageObject);
              updatedChatData[chatIndex].lastMessage = message;

              // Scroll to the bottom if this is the active chat
              if (selected === chatIndex) {
                setTimeout(() => scrollToBottom(), 50);
              }
            }

            return updatedChatData;
          });
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.off('new-chat-message'); // Ensure this runs only when socket is initialized
        }
      };
    }
  }, [selected, student_id]); // Reattach listener when selected or student_id changes

  const handleAcceptChat = async () => {
    if (socketRef.current) {
      console.log('Agent accepting chat for student:', student_id);

      socketRef.current.emit('agent-available', { student_id });

      try {
        const response = await axios.put(`${API}/chatbot/updateStatus/${student_id}`);
        console.log('Chat status updated successfully:', response.data);

        const updatedChatData = [...chatData];
        const chatIndex = updatedChatData.findIndex(chat => chat.id === student_id);
        if (chatIndex >= 0) {
          updatedChatData[chatIndex].status = 'On-going';
        }

        const newMessageObject = {
          sender: "agent",
          text: "Hello! You've reached the Guidance Office. How can I assist you today?",
          timestamp: new Date().toLocaleString()
        };

        updatedChatData[selected].messages.push(newMessageObject);
        updatedChatData[selected].lastMessage = "Hello! You've reached the Guidance Office. How can I assist you today?";
      
        setChatData(updatedChatData);

        sendMessageToServer("Hello! You've reached the Guidance Office. How can I assist you today?");
      } catch (error) {
        console.error('Error updating chat status:', error);
      }
    }
  };

  const handleDisconnecting = async () => {
    if (socketRef.current) {
      console.log('Agent accepting chat for student:', student_id);

      socketRef.current.emit('agent-disconnecting', { student_id });

      try {
        const response = await axios.put(`${API}/chatbot/deactivateStatus/${student_id}`);
        console.log('Chat status updated successfully:', response.data);

        const updatedChatData = [...chatData];
        const chatIndex = updatedChatData.findIndex(chat => chat.id === student_id);
        if (chatIndex >= 0) {
          updatedChatData[chatIndex].status = 'Completed';
        }
        setSelected(null);
        setStudentId(0);
      
        setChatData(updatedChatData);

      } catch (error) {
        console.error('Error updating chat status:', error);
      }
    }
  };

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('agent-available', () => {
        const updatedChatData = [...chatData];
        updatedChatData[selected].status = 'ongoing'; 
        setChatData(updatedChatData);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('agent-available');
      }
    };
  }, [chatData, selected]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('student-chatStatus-updated', (data) => {
        console.log('Chat status updated for user:', data.userId);
        const updatedChatData = [...chatData];
        const chatIndex = updatedChatData.findIndex((chat) => chat.id === data.userId);
        if (chatIndex >= 0) {
          updatedChatData[chatIndex].status = data.status;
          setChatData(updatedChatData);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('student-chatStatus-updated');
      }
    };
  }, [socketRef, chatData]);

  const formatDate = (dateTime) => {
    const now = new Date();
    const chatDate = new Date(dateTime);

    const diffInMilliseconds = now - chatDate;
    const diffInMinutes = Math.floor(diffInMilliseconds / 60000);
    const diffInHours = Math.floor(diffInMilliseconds / 3600000);
    const diffInDays = Math.floor(diffInMilliseconds / 86400000);

    // If the date is today (within the last 24 hours)
    if (diffInDays === 0) {
      if (diffInHours > 12) {
        // Show the time of the day if it's more than 12 hours ago
        return `Today ${chatDate.getHours()}:${chatDate.getMinutes()}`;
      }
      if (diffInHours > 0) {
        // Show the number of hours ago
        return `${diffInHours}h`;
      }
      // Show minutes ago if less than an hour
      return `${diffInMinutes}m`;
    }

    // If it's more than 1 day ago
    if (diffInDays > 0) {
      return `${diffInDays}d`;
    }
  };

  return (
    <div className="flex bg-[#f8fafc] flex-1 overflow-hidden">
      <Layout open={open} onMenuClick={handleDrawerToggle} />

      <main
        className={`flex-1 bg-[#1E3A8A] transition-all ${open ? "ml-60" : "ml-16"} mt-16`}
        style={{ height: "calc(100vh - 64px)" }}
      >
        <div className="flex flex-row flex-grow gap-[clamp(0.75rem,1.5vw,2rem)] px-[clamp(1rem,2vw,4rem)] pt-4" style={{ height: "100%" }}>
          
          {/* Left Panel - Chat List */}
          <div className="flex min-w-[35%] max-w-[35%] bg-[#b7cde3] rounded-xl p-4 overflow-y-auto flex-col scrollbar-custom" style={{ height: "100%" }}>
            {chatData.map((chat, index) => (
              <div key={chat.id}
                className={`flex flex-row p-4 mb-4 rounded-lg cursor-pointer ${selected === index && 'bg-[#94a3b8]'} hover:bg-[#94a3b8]`}
                onClick={() => { setSelected(index); setStudentId(chat.id); }}
              >
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                  <img src={"/defaultProfile.png"} alt="Profile" className="w-10 h-10 rounded-full" />
                </div>
                <div className="flex flex-col justify-between w-full relative">
                  <h3 className="text-lg font-semibold">{chat.name}</h3>
                  <p className="text-sm text-gray-600">
                    {chat.lastMessage.length > 30 ? `${chat.lastMessage.slice(0, 40)}...` : chat.lastMessage} - {formatDate(chat.dateTime)}
                  </p>
                  {chat.status === "pending" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right Panel - Chat Messages */}
          <div className="flex min-w-[63.5%] max-w-[63.5%] bg-white rounded-lg p-4" style={{ height: "100%" }}>
            {selected === null || !chatData[selected] ? (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <h2 className="text-2xl font-semibold text-gray-700">Select a chat to start messaging</h2>
                <p className="text-gray-500 mt-2">You have no chat selected</p>
              </div>
            ) : (
              <div className="flex flex-col h-full w-full">
                
                {/* Messages Container - This is the scrollable area */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-grow overflow-y-auto mb-4 p-4 rounded-lg"
                  style={{ maxHeight: 'calc(100% - 80px)' }} // Leave space for input
                > 
                  {chatData[selected].messages && chatData[selected].messages.length > 0 ? (
                    <>
                      {chatData[selected].messages.slice(1).map((msg, idx) => (
                        <div key={idx} className={`mb-2 flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start flex-col w-fit'}`}>
                          <div className={`py-2 px-4 rounded-full max-w-xs ${msg.sender === 'agent' ? 'bg-[#506e9a] text-white' : 'bg-[#1e3a8a] text-white'}`}>
                            <p className="text-sm">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                      {/* Invisible div to scroll to */}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <p>No messages available.</p>
                  )}
                  {chatData[selected].status === 'pending' && (
                    <div className="mb-2 flex justify-start flex-col w-fit">
                      <div className="py-2 px-4 rounded-full max-w-xs bg-[#1e3a8a] text-white">
                        <p className="text-sm">Incoming live agent request from {chatData[selected].name}</p>
                      </div>
                                      

                      <button className="flex" onClick={handleAcceptChat}>
                        <p className="w-fit ml-2 text-lg font-semibold text-[#10b981]">ACCEPT</p>
                      </button>
                    </div>
                  )}
                </div>

                {/* Input Form - Fixed at bottom */}
                <div className="mt-auto border-t pt-4 relative">
                  <button 
                    className="absolute right-[45%] left-[45%] -top-10 text-white text-lg font-bold bg-red-500 px-2 py-1 rounded-full"
                    onClick={handleDisconnecting}
                  >
                    Disconnect
                  </button>
                  <form className="flex gap-4 px-2" onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      name="message"
                      className="flex-grow rounded-full bg-[#1e3a8a] px-4 py-2 text-white placeholder-gray-300"
                      placeholder="Type your message..."
                      autoComplete="off"
                    />
                    <button type="submit" className="hover:scale-110 transition-transform">
                      <Send className="text-[#2d8bba]" />
                    </button>
                  </form>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
