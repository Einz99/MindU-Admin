import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { useContext } from 'react';
import { OpenContext } from '../contexts/OpenContext';
import { Send, Visibility, Close } from "@mui/icons-material";
import axios from "axios";
import { API, RootAPI } from "../api";
import io from "socket.io-client";
import { Dialog, DialogTitle, DialogActions, Button, IconButton, Typography } from "@mui/material";

export default function LiveAgent() {
  const { open, setOpen } = useContext(OpenContext);
  const [selected, setSelected] = useState(null);
  const [student_id, setStudentId] = useState(0);
  const [chatData, setChatData] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const [profilePath, setProfilePath] = useState();
  const [studentName, setStudentName] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [openDisconnectModal, setOpenDisconnectModal] = useState(false);
  const [agentInRoom, setAgentInRoom] = useState({}); // Track agents per room

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
        setChatData(response.data.studentHistory);
      } else {
        setChatData([]);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setChatData([]);
    }
  };

  useEffect(() => {
    fetchChatData();
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
          setAlerts(alertResponse);
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

  // Check if there's an agent in the room via socket
  const checkAgentInRoom = (studentId) => {
    if (socketRef.current && studentId) {
      socketRef.current.emit('check-agent-in-room', studentId);
    }
  };

  // Update view-only status when selection changes
  useEffect(() => {
    if (selected !== null && chatData[selected]) {
      const studentId = chatData[selected].id;
      checkAgentInRoom(studentId);
    } else {
      setIsViewOnly(false);
    }
  }, [selected, chatData]);

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
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Agent disconnected from server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });

      // Listen for agent room status
      newSocket.on('agent-room-status', (data) => {
        const { student_id, hasActiveAgent, agentCount } = data;
        console.log(`Agent room status for ${student_id}: ${agentCount} agents`);
        
        setAgentInRoom(prev => ({
          ...prev,
          [student_id]: hasActiveAgent && agentCount > 1 // View-only if more than 1 agent
        }));

        // Update view-only status if this is the selected chat
        if (selected !== null && chatData[selected]?.id === student_id) {
          setIsViewOnly(hasActiveAgent && agentCount > 1);
        }
      });

      // Listen for new help requests
      newSocket.on('new-help-request', async (data) => {
        console.log('🆕 New help request received:', data);
        await fetchChatData();
      });

      // Listen for completed help requests
      newSocket.on('help-request-completed', async (data) => {
        console.log('✅ Help request completed:', data);
        await fetchChatData();
        
        if (student_id === data.userId) {
          setSelected(null);
          setStudentId(0);
          setIsViewOnly(false);
        }
      });

      // Listen for chat accepted by another agent
      newSocket.on('chat-accepted-by-another-agent', (data) => {
        console.log('👁️ Chat accepted by another agent:', data);
        
        setChatData((prevChatData) => {
          const updatedChatData = [...prevChatData];
          const chatIndex = updatedChatData.findIndex(chat => chat.id === data.student_id);
          
          if (chatIndex >= 0) {
            updatedChatData[chatIndex].status = 'on-going';
            
            // Set to view-only if this is the currently selected chat
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
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('new-help-request');
        socketRef.current.off('help-request-completed');
        socketRef.current.off('chat-accepted-by-another-agent');
        socketRef.current.off('agent-room-status');
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [selected, student_id, chatData]);

  useEffect(() => {
    if (socketRef.current && student_id) {
      console.log('🔗 Agent joining room for student:', student_id);
      socketRef.current.emit('join-room', student_id);
      
      // Check if agent already in room
      checkAgentInRoom(student_id);
    }
  }, [student_id]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('new-chat-message', (data) => {
        const { student_id: msgStudentId, message, is_from_office } = data;

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
          socketRef.current.off('new-chat-message');
        }
      };
    }
  }, [selected, student_id]);

  useEffect(() => {
    const selectedStudentId = localStorage.getItem('selectedStudentId');
    
    if (selectedStudentId && chatData.length > 0) {
      const studentIdNum = parseInt(selectedStudentId);
      const chatIndex = chatData.findIndex(chat => chat.id === studentIdNum);
      
      if (chatIndex >= 0) {
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
      
        const isInAlerts = alerts.data?.some(alert => alert.student_id === student_id && alert.is_resolved === false);
      
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
      socketRef.current.emit('agent-disconnecting', { student_id });

      try {
        const isInAlerts = alerts.data?.some(alert => alert.student_id === student_id && alert.is_resolved === false);

        if (isInAlerts) {
          await axios.put(`${API}/chatbot/resolve/${student_id}`)
        }
        
        const response = await axios.put(`${API}/chatbot/deactivateStatus/${student_id}`);
        console.log('Chat status updated successfully:', response.data);
        
        await fetchChatData();
        
        setSelected(null);
        setStudentId(0);
        setIsViewOnly(false);
        setOpenDisconnectModal(false);
        setOpenDisconnectModal(false);
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
          
          {/* Left Panel - Chat List */}
          <div className="flex min-w-[35%] max-w-[35%] bg-[#b7cde3] rounded-xl p-4 overflow-y-auto flex-col scrollbar-custom" style={{ height: "100%" }}>
            {chatData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 text-lg">No pending chats</p>
              </div>
            ) : (
              chatData.map((chat, index) => (
                <div key={chat.id}
                  className={`flex flex-row p-4 mb-4 rounded-lg cursor-pointer ${selected === index && 'bg-[#94a3b8]'} hover:bg-[#94a3b8]`}
                  onClick={() => { setSelected(index); setStudentId(chat.id); }}
                >
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                    <img src={chat.id === student_id && profilePath ? `${RootAPI}/${profilePath}` : "/defaultProfile.png"} alt="Profile" className="w-10 h-10 rounded-full" />
                  </div>
                  <div className="flex flex-col justify-between w-full relative">
                    <h3 className="text-lg font-semibold">{chat.name}</h3>
                    <p className="text-sm text-gray-600">
                      {chat.lastMessage.length > 30 ? `${chat.lastMessage.slice(0, 40)}...` : chat.lastMessage} - {formatDate(chat.dateTime)}
                    </p>
                    {chat.status === "pending" && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                    {/* Show eye icon if another agent is in the room */}
                    {agentInRoom[chat.id] && (
                      <Visibility className="absolute bottom-0 right-0 text-blue-500" sx={{ fontSize: 16 }} />
                    )}
                  </div>
                </div>
              ))
            )}
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
                
                {/* View-Only Banner */}
                {isViewOnly && (
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg mb-2 flex items-center gap-2">
                    <Visibility />
                    <p className="font-semibold">View Only - This chat is being handled by another agent</p>
                  </div>
                )}

                {/* Messages Container */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-grow overflow-y-auto mb-4 p-4 rounded-lg"
                  style={{ maxHeight: 'calc(100% - 80px)' }}
                > 
                  {chatData[selected].messages && chatData[selected].messages.length > 0 ? (
                    <>
                      {chatData[selected].messages.slice(1).map((msg, idx) => (
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
                            <img src={profilePath ? `${RootAPI}/${profilePath}` : "/defaultProfile.png"} alt="Profile" className="w-10 h-10 rounded-full" />
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
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <p>No messages available.</p>
                  )}
                  {chatData[selected].status === 'pending' && (
                    <div className="mb-2 flex justify-start flex-col w-fit">
                      <div className="py-2 px-4 rounded-lg max-w-md bg-[#1e3a8a] text-white">
                        {alerts.data?.some(alert => alert.student_id === chatData[selected].id && alert.is_resolved === false) ? (
                          <>
                            <p className="text-sm font-bold">⚠️ Alert: Possible student in distress.</p>
                            <p className="text-xs mt-1">This conversation was flagged for potential emotional distress. Please respond with empathy and assess if the student is safe.</p>
                          </>
                        ) : (
                          <p className="text-sm">Incoming live agent request from {chatData[selected].name}</p>
                        )}
                      </div>

                      <button className="flex" onClick={handleAcceptChat}>
                        <p className="w-fit ml-2 text-lg font-semibold text-[#10b981]">ACCEPT</p>
                      </button>
                    </div>
                  )}
                </div>

                {/* Input Form - Fixed at bottom */}
                <div className="mt-auto border-t pt-4 relative">
                  {chatData[selected].status === 'on-going' && !isViewOnly && (
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
                      placeholder={isViewOnly ? "View only mode - Cannot send messages" : "Type your message..."}
                      autoComplete="off"
                      disabled={isViewOnly}
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
          <DialogTitle className="bg-[#ef4444] relative">
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