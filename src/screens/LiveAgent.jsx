import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { useContext } from 'react';
import { OpenContext } from '../contexts/OpenContext';
import { Send, Visibility, Close, Search, Archive as ArchiveIcon, Chat as ChatIcon } from "@mui/icons-material";
import axios from "axios";
import { API, RootAPI } from "../api";
import io from "socket.io-client";
import { Dialog, DialogTitle, DialogActions, Button, IconButton, Typography, Tabs, Tab, TextField, InputAdornment } from "@mui/material";

export default function LiveAgent() {
  const { open, setOpen } = useContext(OpenContext);
  const [selected, setSelected] = useState(null);
  const [student_id, setStudentId] = useState(0);
  const [chatData, setChatData] = useState([]);
  const [archivedChats, setArchivedChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0); // 0 = Active Chats, 1 = Archive
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const [profilePath, setProfilePath] = useState();
  const [studentName, setStudentName] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [isViewOnly, setIsViewOnly] = useState(true);
  const [openDisconnectModal, setOpenDisconnectModal] = useState(false);
  const [agentInRoom, setAgentInRoom] = useState({});

  const staffData = JSON.parse(localStorage.getItem("staff"));
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "end",
        inline: "nearest"
      });
    }
  };

  const fetchChatData = async () => {
    try {
      const response = await axios.get(`${API}/chatbot/students-asking-for-help`);
      if (response.data.studentHistory) {
        const filteredChatData = response.data.studentHistory.map(chat => {
          const filteredMessages = chat.messages.filter(msg => msg.text !== "Connect to guidance");
          return { ...chat, messages: filteredMessages };
        });
        setChatData(filteredChatData);
      } else {
        setChatData([]);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setChatData([]);
    }
  };

  const fetchArchivedChats = async () => {
    console.log('[fetchArchivedChats] Starting to fetch archived chats...');
    try {
      const response = await axios.get(`${API}/chatbot/archived-chats`);
      console.log('[fetchArchivedChats] Response received:', response.data);
      
      if (response.data.archivedChats) {
        console.log('[fetchArchivedChats] Archived chats count:', response.data.archivedChats.length);
        const filteredArchived = response.data.archivedChats.map(chat => {
          const filteredMessages = chat.messages.filter(msg => msg.text !== "Connect to guidance");
          return { ...chat, messages: filteredMessages };
        });
        console.log('[fetchArchivedChats] Filtered archived chats:', filteredArchived.length);
        setArchivedChats(filteredArchived);
      } else {
        console.log('[fetchArchivedChats] No archived chats in response');
        setArchivedChats([]);
      }
    } catch (error) {
      console.error('[fetchArchivedChats] Error fetching archived chats:', error);
      console.error('[fetchArchivedChats] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setArchivedChats([]);
    }
  };

  useEffect(() => {
    fetchChatData();
    fetchArchivedChats();
  }, []);

  useEffect(() => {
    async function getProfile() {
      try {
        const response = await axios.get(`${API}/students/${student_id}`);
        setStudentName(`${response.data.firstName} ${response.data.lastName}`);
        
        if (response.data && response.data.profilePic) {
          setProfilePath(`${response.data.profilePic}`);
        } else {
          console.error("Profile picture not found in response");
        }
        
        const alertResponse = await axios.get(`${API}/chatbot/alerts`)
        if (alertResponse.data) {
          setAlerts(alertResponse.data);
          console.log(alertResponse.data)
        } else {
          setAlerts([]);
        }
      } catch (error) {
        console.error("Error fetching student profile:", error);
      }
    }

    if (student_id) {
      getProfile();
    }
  }, [student_id]);

  const checkAgentInRoom = (studentId) => {
    if (socketRef.current && studentId) {
      socketRef.current.emit('check-agent-in-room', studentId);
    }
  };

  useEffect(() => {
    if (selected !== null) {
      const currentList = activeTab === 0 ? chatData : archivedChats;
      if (currentList[selected]) {
        const studentId = currentList[selected].id;
        if (activeTab === 0) {
          checkAgentInRoom(studentId);
        } else {
          setIsViewOnly(true); // Archive is always view-only
        }
      }
    } else {
      setIsViewOnly(true);
    }
  }, [selected, chatData, archivedChats, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [chatData, archivedChats, selected, activeTab]);

  const handleDrawerToggle = () => {
    setOpen(prev => !prev);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (isViewOnly) {
      alert("This chat is being handled by another agent. You can only view.");
      return;
    }

    const newMessage = e.target.elements.message.value;

    if (newMessage.trim() === "") return;

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
    const newSocket = io(RootAPI);
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('✅ Agent connected to server:', newSocket.id);
      newSocket.emit('join-agent');
      
      if (chatData.length > 0) {
        console.log('🔄 Rejoining rooms after connection...');
        chatData.forEach(chat => {
          console.log('🔗 Rejoining room for student:', chat.id);
          newSocket.emit('join-room', chat.id);
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Agent disconnected from server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    newSocket.on('agent-room-status', (data) => {
      const { student_id, hasActiveAgent, agentCount } = data;
      console.log(`📊 Agent room status for ${student_id}: ${agentCount} agents`);
      
      setAgentInRoom(prev => ({
        ...prev,
        [student_id]: hasActiveAgent && agentCount > 1
      }));

      if (selected !== null && chatData[selected]?.id === student_id) {
        setIsViewOnly(hasActiveAgent && agentCount > 1);
      }
    });

    newSocket.on('new-chat-message', (data) => {
      console.log('📨 Received new-chat-message:', data);
      const { student_id: msgStudentId, message, is_from_office } = data;

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

          console.log(`✅ Message added to chat ${msgStudentId}`);
          
          if (updatedChatData[chatIndex].id === student_id) {
            setTimeout(() => scrollToBottom(), 50);
          }
        } else {
          console.warn(`⚠️ Chat index not found for student ${msgStudentId}`);
        }

        return updatedChatData;
      });

      // Also update archived chats if message comes in
      setArchivedChats((prevArchived) => {
        const updatedArchived = [...prevArchived];
        const archiveIndex = updatedArchived.findIndex(chat => chat.id === msgStudentId);

        if (archiveIndex >= 0) {
          const newMessageObject = {
            sender: is_from_office ? "agent" : "student",
            text: message,
            timestamp: new Date().toLocaleString()
          };

          updatedArchived[archiveIndex].messages.push(newMessageObject);
          updatedArchived[archiveIndex].lastMessage = message;
        }

        return updatedArchived;
      });
    });

    newSocket.on('new-help-request', async (data) => {
      console.log('🆕 New help request received:', data);
      await fetchChatData();
    });

    newSocket.on('help-request-completed', async (data) => {
      console.log('✅ Help request completed:', data);
      await fetchChatData();
      await fetchArchivedChats();
      
      if (student_id === data.userId) {
        setSelected(null);
        setStudentId(0);
        setIsViewOnly(false);
      }
    });

    newSocket.on('chat-accepted-by-another-agent', (data) => {
      console.log('👁️ Chat accepted by another agent:', data);
      
      setChatData((prevChatData) => {
        const updatedChatData = [...prevChatData];
        const chatIndex = updatedChatData.findIndex(chat => chat.id === data.student_id);
        
        if (chatIndex >= 0) {
          updatedChatData[chatIndex].status = 'on-going';
          
          if (selected === chatIndex) {
            setIsViewOnly(true);
            setAgentInRoom(prev => ({
              ...prev,
              [data.student_id]: true
            }));
          }
        }
        
        return updatedChatData;
      });
    });

    newSocket.on('agent-available', () => {
      setChatData((prevChatData) => {
        const updatedChatData = [...prevChatData];
        if (selected !== null && updatedChatData[selected]) {
          updatedChatData[selected].status = 'on-going'; 
        }
        return updatedChatData;
      });
    });

    newSocket.on('student-chatStatus-updated', (data) => {
      console.log('Chat status updated for user:', data.userId);
      setChatData((prevChatData) => {
        const updatedChatData = [...prevChatData];
        const chatIndex = updatedChatData.findIndex((chat) => chat.id === data.userId);
        if (chatIndex >= 0) {
          updatedChatData[chatIndex].status = data.status;
        }
        return updatedChatData;
      });
    });
  }

  return () => {
    if (socketRef.current) {
      console.log('🧹 Cleaning up socket listeners');
      socketRef.current.off('new-help-request');
      socketRef.current.off('help-request-completed');
      socketRef.current.off('chat-accepted-by-another-agent');
      socketRef.current.off('agent-room-status');
      socketRef.current.off('new-chat-message');
      socketRef.current.off('agent-available');
      socketRef.current.off('student-chatStatus-updated');
      socketRef.current.close();
      socketRef.current = null;
    }
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

useEffect(() => {
  if (socketRef.current?.connected && chatData.length > 0) {
    console.log('🔗 Joining rooms for all active chats:', chatData.length);
    chatData.forEach(chat => {
      console.log('📍 Emitting join-room for student:', chat.id);
      socketRef.current.emit('join-room', chat.id);
    });
  }
}, [chatData]);

useEffect(() => {
  if (socketRef.current?.connected && student_id && activeTab === 0) {
    console.log('🔗 Agent joining room for selected student:', student_id);
    socketRef.current.emit('join-room', student_id);
    checkAgentInRoom(student_id);
  }
}, [student_id, activeTab]);

  useEffect(() => {
    const selectedStudentId = localStorage.getItem('selectedStudentId');
    
    if (selectedStudentId && chatData.length > 0) {
      const studentIdNum = parseInt(selectedStudentId);
      const chatIndex = chatData.findIndex(chat => chat.id === studentIdNum);
      
      if (chatIndex >= 0) {
        setActiveTab(0);
        setSelected(chatIndex);
        setStudentId(studentIdNum);
        localStorage.removeItem('selectedStudentId');
        console.log('Auto-selected student from alert:', studentIdNum);
      }
    }
  }, [chatData]);

  const handleAcceptChat = async () => {
    if (socketRef.current) {
      console.log('Agent accepting chat for student:', student_id);
    
      socketRef.current.emit('agent-accept-chat', { student_id });
    
      try {
        const response = await axios.put(`${API}/chatbot/updateStatus/${student_id}`);
        console.log('Chat status updated successfully:', response.data);
      
        const updatedChatData = [...chatData];
        const chatIndex = updatedChatData.findIndex(chat => chat.id === student_id);
        if (chatIndex >= 0) {
          updatedChatData[chatIndex].status = 'on-going';
          setChatData(updatedChatData);
        }

        setIsViewOnly(false);
        setAgentInRoom(prev => ({
          ...prev,
          [student_id]: false
        }));
      
        const isInAlerts = alerts.data?.some(alert => alert.student_id === chatData[selected].id && alert.is_resolved === 0);
      
        let message;
        if (isInAlerts) {
          message = `Hello, this is ${staffData.name} from the Guidance Office.\n\nI just received your message from Calmi, and I want you to know that I'm here for you.\n\nYou're not alone — we can talk about whatever's been bothering you at your own pace.\n\nHow are you feeling right now?`;
        } else {
          const firstName = studentName.split(' ')[0];
          message = `Hi there, ${firstName}!`;
        }
      
        sendMessageToServer(message);
        
      } catch (error) {
        console.error('Error updating chat status:', error);
      }
    }
  };

  const handleDisconnecting = async () => {
    if (isViewOnly) {
      alert("You cannot disconnect a chat handled by another agent.");
      return;
    }

    if (socketRef.current) {
      console.log('Agent disconnecting chat for student:', student_id);
      sendMessageToServer("Your session has expired.")
      try {
        const isInAlerts = alerts.data?.some(alert => alert.student_id === chatData[selected].id && alert.is_resolved === 0);
        
        console.log("isInAlerts: " + isInAlerts)
        if (isInAlerts) {
          await axios.put(`${API}/chatbot/resolve/${student_id}`);
          console.log('Alerts resolved for student:', student_id);
        }

        const response = await axios.put(`${API}/chatbot/deactivateStatus/${student_id}`);
        console.log('Chat status updated successfully:', response.data);

        await fetchChatData();
        await fetchArchivedChats();

        setSelected(null);
        setStudentId(0);
        setIsViewOnly(false);
        setOpenDisconnectModal(false);
        socketRef.current.emit('agent-disconnecting', { student_id });
      } catch (error) {
        console.error('Error updating chat status:', error);
      }
    }
  };

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('agent-available', () => {
        const updatedChatData = [...chatData];
        if (selected !== null && updatedChatData[selected]) {
          updatedChatData[selected].status = 'ongoing'; 
          setChatData(updatedChatData);
        }
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

    if (diffInDays === 0) {
      if (diffInHours > 12) {
        return `Today ${chatDate.getHours()}:${chatDate.getMinutes().toString().padStart(2, '0')}`;
      }
      if (diffInHours > 0) {
        return `${diffInHours}h`;
      }
      return `${diffInMinutes}m`;
    }

    if (diffInDays > 0) {
      return `${diffInDays}d`;
    }
  };

  const ifNotif = (text) => {
    return (text.toLowerCase().trim().includes(('You’ve been disconnected from the guidance office.').toLowerCase()) ||
    text.toLowerCase().trim().includes(('Someone responded from the guidance office.').toLowerCase()) ||
    text.toLowerCase().trim().includes(('Your session has expired.').toLowerCase()));
  };

  // Filter chats based on search query
  const getFilteredChats = () => {
    const currentList = activeTab === 0 ? chatData : archivedChats;
    if (!searchQuery.trim()) return currentList;
    
    return currentList.filter(chat => 
      chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredChats = getFilteredChats();

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelected(null);
    setStudentId(0);
    setIsViewOnly(true);
  };

  // Get current chat data based on active tab and selection
  const getCurrentChat = () => {
    if (selected === null) return null;
    const filteredList = getFilteredChats();
    return filteredList[selected];
  };

  const currentChat = getCurrentChat();

  return (
    <div className="flex bg-[#f8fafc] flex-1 overflow-hidden">
      <Layout open={open} onMenuClick={handleDrawerToggle} />

      <main
        className={`flex-1 bg-[#1E3A8A] transition-all ${
          open ? "ml-60" : "ml-16"
        } mt-20`}
        style={{ height: "calc(100vh - 80px)"}}
      >
        <div className="flex flex-row flex-grow gap-[clamp(0.75rem,1.5vw,2rem)] px-[clamp(1rem,2vw,4rem)] pt-4" style={{ height: "98%" }}>
          
          {/* Left Panel - Chat List with Search and Tabs */}
          <div className="flex min-w-[35%] max-w-[35%] bg-[#b7cde3] rounded-xl p-4 flex-col" style={{ height: "100%" }}>
            {/* Search Bar */}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: '25px',
                  '& fieldset': {
                    borderColor: '#94a3b8',
                  },
                  '&:hover fieldset': {
                    borderColor: '#64748b',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1e3a8a',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="text-gray-500" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Tabs */}
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                mb: 2,
                minHeight: '40px',
                '& .MuiTab-root': {
                  minHeight: '40px',
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#64748b',
                  '&.Mui-selected': {
                    color: '#1e3a8a',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1e3a8a',
                },
              }}
            >
              <Tab 
                icon={<ChatIcon />} 
                iconPosition="start" 
                label="Active Chats" 
              />
              <Tab 
                icon={<ArchiveIcon />} 
                iconPosition="start" 
                label="Archive" 
              />
            </Tabs>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto scrollbar-custom">
              {filteredChats.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-600 text-lg">
                    {searchQuery ? "No students found" : activeTab === 0 ? "No pending chats" : "No archived chats"}
                  </p>
                </div>
              ) : (
                filteredChats.map((chat, index) => (
                  <div key={chat.id}
                    className={`flex flex-row p-4 mb-4 rounded-lg cursor-pointer ${selected === index && 'bg-[#94a3b8]'} hover:bg-[#94a3b8]`}
                    onClick={() => { setSelected(index); setStudentId(chat.id); }}
                  >
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                      <img src={chat.id === student_id && profilePath ? `${RootAPI}${profilePath}` : "/defaultProfile.png"} alt="Profile" className="w-10 h-10 rounded-full" />
                    </div>
                    <div className="flex flex-col justify-between w-full relative">
                      <h3 className="text-lg font-semibold">{chat.name}</h3>
                      <p className="text-sm text-gray-600">
                        {chat.lastMessage.length > 30 ? `${chat.lastMessage.slice(0, 40)}...` : chat.lastMessage} - {formatDate(chat.dateTime)}
                      </p>
                      {activeTab === 0 && chat.status === "pending" && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full"></div>
                      )}
                      {activeTab === 0 && agentInRoom[chat.id] && (
                        <Visibility className="absolute bottom-0 right-0 text-blue-500" sx={{ fontSize: 16 }} />
                      )}
                      {activeTab === 1 && (
                        <ArchiveIcon className="absolute bottom-0 right-0 text-gray-500" sx={{ fontSize: 16 }} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Chat Messages */}
          <div className="flex min-w-[63.5%] max-w-[63.5%] bg-white rounded-lg p-4" style={{ height: "100%" }}>
            {!currentChat ? (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <h2 className="text-2xl font-semibold text-gray-700">Select a chat to start messaging</h2>
                <p className="text-gray-500 mt-2">You have no chat selected</p>
              </div>
            ) : (
              <div className="flex flex-col h-full w-full">
                
                {/* View-Only Banner */}
                {(isViewOnly || activeTab === 1) && (
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg mb-2 flex items-center gap-2">
                    <Visibility />
                    <p className="font-semibold">
                      {activeTab === 1 ? "Archive - View Only" : "View Only - Another agent is handling this chat"}
                    </p>
                  </div>
                )}

                {/* Messages Container */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-grow overflow-y-auto mb-4 p-4 rounded-lg"
                  style={{ maxHeight: 'calc(100% - 80px)' }}
                > 
                  {currentChat.messages && currentChat.messages.length > 0 ? (
                    <>
                      {currentChat.messages.slice(1).map((msg, idx) => (
                        <div 
                          key={idx} 
                          className={`mb-2 flex ${
                            ifNotif(msg.text) 
                              ? 'justify-center' 
                              : msg.sender === 'agent' 
                                ? 'justify-end' 
                                : 'justify-start flex-row w-fit'
                          }`}
                        >
                          {msg.sender !== 'agent' && !ifNotif(msg.text) && (
                            <img src={profilePath ? `${RootAPI}${profilePath}` : "/defaultProfile.png"} alt="Profile" className="w-10 h-10 rounded-full" />
                          )}
                          <div className={`${msg.sender !== 'agent' && !ifNotif(msg.text) && "ml-3"}`}>
                            {msg.sender !== 'agent' && !ifNotif(msg.text) && (
                              <p className="text-sm ml-1">{studentName}</p>
                            )}
                            <div className={`py-2 px-4 rounded-lg max-w-xs ${
                              ifNotif(msg.text) 
                                ? 'font-roboto italic text-gray-500' 
                                : msg.sender === 'agent' 
                                  ? 'bg-[#506e9a] text-white' 
                                  : 'bg-[#1e3a8a] text-white'
                            }`}>
                              <p className="text-sm">{msg.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p>No messages available.</p>
                  )}
                  {activeTab === 0 && currentChat.status === 'pending' && (
                    <div className="mb-2 flex justify-start flex-col w-fit">
                      <div className="py-2 px-4 rounded-lg max-w-md bg-[#1e3a8a] text-white">
                        {alerts.data?.some(alert => alert.student_id === currentChat.id && alert.is_resolved === 0) ? (
                          <>
                            <p className="text-sm font-bold">⚠️ Alert: Possible student in distress.</p>
                            <br />
                            <p className="text-xs mt-1">This conversation was flagged for potential emotional distress. Please respond with empathy and assess if the student is safe.</p>
                          </>
                        ) : (
                          <p className="text-sm">A request to connect to the guidance has been sent by {currentChat.name}</p>
                        )}
                      </div>

                      <button className="flex" onClick={handleAcceptChat}>
                        <p className="w-fit ml-2 text-lg font-semibold text-[#10b981]">ACCEPT</p>
                      </button>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Form - Fixed at bottom (only for Active Chats) */}
                {activeTab === 0 && (
                  <div className="mt-auto border-t pt-4 relative">
                    {currentChat.status === 'on-going' && !isViewOnly && (
                      <button 
                        className="absolute right-[45%] left-[45%] -top-10 text-lg font-bold text-red-500 px-2 py-1 rounded-full hover:underline"
                        onClick={() => setOpenDisconnectModal(true)}
                      >
                        Disconnect
                      </button>
                    )}
                    <form className="flex gap-4 px-2" onSubmit={handleSendMessage}>
                      <input
                        type="text"
                        name="message"
                        className={`flex-grow rounded-full bg-[#1e3a8a] px-4 py-2 text-white placeholder-gray-300 ${
                          isViewOnly ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        placeholder={
                          isViewOnly 
                            ? "View only mode - Cannot send messages" 
                            : currentChat.status === 'pending'
                              ? "Accept the chat to start messaging..."
                              : "Type your message..."
                        }
                        autoComplete="off"
                        disabled={isViewOnly || currentChat.status === 'pending'}
                      />
                      <button 
                        type="submit" 
                        className={`hover:scale-110 transition-transform ${
                          isViewOnly ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isViewOnly}
                      >
                        <Send className="text-[#2d8bba]" />
                      </button>
                    </form>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
        <Dialog
          open={openDisconnectModal}
          onClose={() => setOpenDisconnectModal(false)}
          maxWidth="xs"
          fullWidth
          sx={{
            "& .MuiPaper-root": {
              backgroundColor: "white",
              color: "#000",
              borderRadius: "25px",
            },
          }}
        >
          <DialogTitle className="bg-[#ef4444] relative font-bold">
            Confirm Disconnect
            <DialogActions className="absolute -top-1 right-0">
              <IconButton onClick={() => setOpenDisconnectModal(false)} className="rounded-full ">
                <Close sx={{ fontSize: 40, color: 'black' }}></Close>
              </IconButton>
            </DialogActions>
          </DialogTitle>
          <div className="my-5 px-6">
            <Typography variant="body1" className="text-center mt-4">
              Are you sure you want to disconnect from this chat?
            </Typography>
          </div>
          <DialogActions>
              <Button onClick={() => setOpenDisconnectModal(false)}>
                <p className="text-base font-roboto font-bold text-[#64748b] p-2">CANCEL</p>
              </Button>
              <Button 
                onClick={handleDisconnecting} 
                sx={{
                  paddingX: "3rem",
                  bgcolor: "#ef4444",
                  color: "white",
                  borderRadius: "100px",
                }}
              >
                <p className="font-bold text-lg">DISCONNECT</p>
              </Button>
            </DialogActions>
        </Dialog>
      </main>
    </div>
  );
}