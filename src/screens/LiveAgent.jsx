import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { useContext } from 'react';
import { OpenContext } from '../contexts/OpenContext';
import { Send } from "@mui/icons-material";
import axios from "axios";
import { API } from "../api";
import io from "socket.io-client"

export default function LiveAgent() {
  const { open, setOpen } = useContext(OpenContext);
  const [selected, setSelected] = useState(null);
  const [student_id, setStudentId] = useState(0);
  const [chatData, setChatData] = useState([]);
  const messagesEndRef = useRef(null); // Reference to scroll to the end
  const messagesContainerRef = useRef(null);
  const [socket, setSocket] = useState(null);

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
          console.log(response.data.studentHistory);
        } else {
          setChatData([]); // fallback if no data
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setChatData([]); // Set empty array if there's an error fetching data
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
    
    // Scroll to bottom after sending message
    setTimeout(() => {
      scrollToBottom();
    }, 50);

    e.target.reset();

    // Send the message to the server with is_from_office set to true
    sendMessageToServer(newMessage);
  };

  const sendMessageToServer = async (message) => {
    try {
      const response = await axios.post(`${API}/chatbot/insert-chat-message`, {
        student_id: student_id, // This comes from the selected student
        message: message,
        is_from_office: true, // Always true as it's from the office
      });

      socket.emit('new-chat-message', {
        student_id,
        message,
        is_from_office: true,
      });

      console.log("Message sent successfully:", response.data);// Clean up the socket connection on component unmount
    } catch (error) {
      console.error('Error sending office chat message:', error);
    }
  };

  useEffect(() => {
    const newSocket = io(); // Connect to the server
    setSocket(newSocket);

    // Clean up the socket connection on component unmount
    return () => newSocket.close();
  }, []);

  const handleAcceptChat = async () => {
    if (socket) {
      // Emit the event to accept the chat
      socket.emit('join-chat', student_id); // Emit event to accept the chat

      socket.emit('new-chat-message', {
        student_id,
        message: "Hello! You’ve reached the Guidance Office. How can I assist you today?",
        is_from_office: true,
      });
      // API call to update the student's chat status
      try {
        const response = await axios.put(`${API}/chatbot/updateStatus/${student_id}`);

        // You can handle the response if necessary, e.g., showing a success message or updating UI
        console.log('Chat status updated successfully:', response.data);

        // Update the chat state to reflect that the chat has been accepted
        const updatedChatData = [...chatData];
        const chatIndex = updatedChatData.findIndex(chat => chat.id === student_id);
        if (chatIndex >= 0) {
          updatedChatData[chatIndex].status = 'On-going'; // Update status to 'On-going'
        }

        const newMessageObject = {
          sender: "agent",
          text: "Hello! You’ve reached the Guidance Office. How can I assist you today?",
          timestamp: new Date().toLocaleString()
        };

        updatedChatData[selected].messages.push(newMessageObject);
        updatedChatData[selected].lastMessage = "Hello! You’ve reached the Guidance Office. How can I assist you today?";
      
        setChatData(updatedChatData);

        sendMessageToServer("Hello! You’ve reached the Guidance Office. How can I assist you today?");
      } catch (error) {
        console.error('Error updating chat status:', error);
      }
    }
  };

  // Listen for real-time updates for chat status change
  useEffect(() => {
    if (socket) {
      socket.on('agent-available', () => {
        const updatedChatData = [...chatData];
        updatedChatData[selected].status = 'ongoing'; // Set status to ongoing when agent is available
        setChatData(updatedChatData);
      });
    }

    return () => {
      if (socket) {
        socket.off('agent-available');
      }
    };
  }, [chatData, selected, socket]);

  useEffect(() => {
    if (socket) {
      // Listen for chat status updates
      socket.on('student-chatStatus-updated', (data) => {
        console.log('Chat status updated for user:', data.userId);
        // Update your chat data or UI here
        // Example: You can change the chat status to 'On-going' in the UI
        const updatedChatData = [...chatData];
        const chatIndex = updatedChatData.findIndex((chat) => chat.id === data.userId);
        if (chatIndex >= 0) {
          updatedChatData[chatIndex].status = data.status; // Update status
          setChatData(updatedChatData); // Update the state
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('student-chatStatus-updated');
      }
    };
  }, [socket, chatData]);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Reconnected to server');
    });

    // Listen for the new chat message event from the server
    newSocket.on('new-chat-message', (data) => {
      console.log('New chat message received:', data);
      // Add the new message to the chat history
      setChatData((prevMessages) => [
        ...prevMessages,
        {
          sender: data.is_from_office ? 'agent' : 'student', // Determine sender based on is_from_office
          text: data.message,
          timestamp: new Date().toLocaleString(),
        },
      ]);
      // Scroll to the newest message
      scrollToBottom();
    });

    // Clean up the socket connection on component unmount
    return () => {
      newSocket.close();
    };
  }, []);

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
                <div className="mt-auto border-t pt-4">
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
