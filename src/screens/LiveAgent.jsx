import { useState } from "react";
import Layout from "../components/Layout";
import { useContext } from 'react';
import { OpenContext } from '../contexts/OpenContext';
import { Send } from "@mui/icons-material";

const initialChatData = [
  { id: 1, 
    name: "John Doe", 
    lastMessage: "Hello, I need help with my account.",
    dateTime : "2023-10-01 10:30 AM",
    status: "ongoing",
    messages: [
        { sender: "user", text: "Hello, I need help with my account.", timestamp: "2023-10-01 10:30 AM" },
        { sender: "agent", text: "Sure, I'd be happy to assist you. What seems to be the issue?", timestamp: "2023-10-01 10:32 AM" },
        { sender: "user", text: "I can't log in to my account.", timestamp: "2023-10-01 10:33 AM" },
    ],
  },
  { id: 2,
    name: "Jane Smith",
    lastMessage: "Thank you for your assistance!",
    dateTime : "2023-10-01 09:15 AM",
    status: "completed",
    messages: [
        { sender: "user", text: "Thank you for your assistance!", timestamp: "2023-10-01 09:15 AM" },
        { sender: "agent", text: "You're welcome! If you have any more questions, feel free to ask.", timestamp: "2023-10-01 09:16 AM" },
    ],    
  },
  { id: 3,
    name: "Alice Johnson",
    lastMessage: "Can you help me with my order?",
    dateTime : "2023-09-30 04:45 PM",
    status: "ongoing",
    messages: [
        { sender: "user", text: "Can you help me with my order?", timestamp: "2023-09-30 04:45 PM" },
        { sender: "agent", text: "Of course! Please provide your order number.", timestamp: "2023-09-30 04:46 PM" },
    ],
  },
    { id: 4,
    name: "Bob Brown",
    lastMessage: "I have a question about billing.",
    dateTime : "2023-09-30 03:20 PM",
    status: "pending",
    messages: [
        { sender: "user", text: "I have a question about billing.", timestamp: "2023-09-30 03:20 PM" },
    ],
  },
  { id: 5, 
    name: "John Doe", 
    lastMessage: "Hello, I need help with my account.",
    dateTime : "2023-10-01 10:30 AM",
    status: "ongoing",
    messages: [
        { sender: "user", text: "Hello, I need help with my account.", timestamp: "2023-10-01 10:30 AM" },
        { sender: "agent", text: "Sure, I'd be happy to assist you. What seems to be the issue?", timestamp: "2023-10-01 10:32 AM" },
        { sender: "user", text: "I can't log in to my account.", timestamp: "2023-10-01 10:33 AM" },
    ],
  },
  { id: 6,
    name: "Jane Smith",
    lastMessage: "Thank you for your assistance!",
    dateTime : "2023-10-01 09:15 AM",
    status: "completed",
    messages: [
        { sender: "user", text: "Thank you for your assistance!", timestamp: "2023-10-01 09:15 AM" },
        { sender: "agent", text: "You're welcome! If you have any more questions, feel free to ask.", timestamp: "2023-10-01 09:16 AM" },
    ],    
  },
  { id: 7,
    name: "Alice Johnson",
    lastMessage: "Can you help me with my order?",
    dateTime : "2023-09-30 04:45 PM",
    status: "ongoing",
    messages: [
        { sender: "user", text: "Can you help me with my order?", timestamp: "2023-09-30 04:45 PM" },
        { sender: "agent", text: "Of course! Please provide your order number.", timestamp: "2023-09-30 04:46 PM" },
    ],
  },
    { id: 8,
    name: "Bob Brown",
    lastMessage: "I have a question about billing.",
    dateTime : "2023-09-30 03:20 PM",
    status: "pending",
    messages: [
        { sender: "user", text: "I have a question about billing.", timestamp: "2023-09-30 03:20 PM" },
    ],
  },
  { id: 9, 
    name: "John Doe", 
    lastMessage: "Hello, I need help with my account.",
    dateTime : "2023-10-01 10:30 AM",
    status: "ongoing",
    messages: [
        { sender: "user", text: "Hello, I need help with my account.", timestamp: "2023-10-01 10:30 AM" },
        { sender: "agent", text: "Sure, I'd be happy to assist you. What seems to be the issue?", timestamp: "2023-10-01 10:32 AM" },
        { sender: "user", text: "I can't log in to my account.", timestamp: "2023-10-01 10:33 AM" },
    ],
  },
  { id: 10,
    name: "Jane Smith",
    lastMessage: "Thank you for your assistance!",
    dateTime : "2023-10-01 09:15 AM",
    status: "completed",
    messages: [
        { sender: "user", text: "Thank you for your assistance!", timestamp: "2023-10-01 09:15 AM" },
        { sender: "agent", text: "You're welcome! If you have any more questions, feel free to ask.", timestamp: "2023-10-01 09:16 AM" },
    ],    
  },
  { id: 11,
    name: "Alice Johnson",
    lastMessage: "Can you help me with my order?",
    dateTime : "2023-09-30 04:45 PM",
    status: "ongoing",
    messages: [
        { sender: "user", text: "Can you help me with my order?", timestamp: "2023-09-30 04:45 PM" },
        { sender: "agent", text: "Of course! Please provide your order number.", timestamp: "2023-09-30 04:46 PM" },
    ],
  },
    { id: 12,
    name: "Bob Brown",
    lastMessage: "I have a question about billing.",
    dateTime : "2023-09-30 03:20 PM",
    status: "pending",
    messages: [
        { sender: "user", text: "I have a question about billing.", timestamp: "2023-09-30 03:20 PM" },
    ],
  },
]

export default function LiveAgent() {
  const { open, setOpen } = useContext(OpenContext);
  const [selected, setSelected] = useState(0);
  const [student_id, setStudentId] = useState(0);
  const [chatData, setChatData] = useState(initialChatData); // Store chat data in state
  
  const handleDrawerToggle = () => {
    setOpen(prev => !prev);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const newMessage = e.target.elements.message.value;

    if (newMessage.trim() === "") return;

    // Create new message object
    const newMessageObject = {
      sender: "agent",
      text: newMessage,
      timestamp: new Date().toLocaleString()
    };

    // Update chatData with the new message
    const updatedChatData = [...chatData]; // Make a shallow copy of chatData
    updatedChatData[selected].messages.push(newMessageObject); // Add new message to the selected chat

    // Update the last message of the chat
    updatedChatData[selected].lastMessage = newMessage;

    // Update chatData state
    setChatData(updatedChatData);

    e.target.reset();
  };

  return (
    <div className="flex bg-[#f8fafc] flex-1 overflow-hidden">
      {/* The Top and Left Bar */}
      <Layout open={open} onMenuClick={handleDrawerToggle} />

      {/* Main Content */}
      <main
        className={`flex-1 bg-[#1E3A8A] transition-all ${
          open ? "ml-60" : "ml-16"
        } mt-16`}
        style={{ height: "calc(100vh - 64px)"}}
      >
        <div 
          className="flex flex-row flex-grow gap-[clamp(0.75rem,1.5vw,2rem)] px-[clamp(1rem,2vw,4rem)] pt-4"
          style={{ height: "100%"}}
        >
          {/* Left Panels */}
          <div 
            className="flex min-w-[35%] max-w-[35%] bg-[#b7cde3] rounded-xl p-4 overflow-y-auto flex-col scrollbar-custom"
            style={{ height: "100%"}}
          >
            {chatData.map((chat, index) => (
                <div key={chat.id}
                    className={`flex flex-row p-4 mb-4 rounded-lg cursor-pointer ${selected === index && 'bg-[#94a3b8]'} hover:bg-[#94a3b8]`}
                    onClick={() => {setSelected(index); setStudentId(chat.id);}}
                >   
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                      <img src={"/defaultProfile.png"} alt="Profile" className="w-10 h-10 rounded-full"/>
                    </div>
                    <div className="flex flex-col justify-between w-full relative">
                      <h3 className="text-lg font-semibold">{chat.name}</h3>
                      <p className="text-sm text-gray-600">
                        {chat.lastMessage.length > 30 ? `${chat.lastMessage.slice(0, 40)}...` : chat.lastMessage} - {chat.dateTime}
                      </p>

                      {/* Red dot at the bottom-right */}
                      {chat.status === "pending" && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
                    </div>
                </div>
            ))
            }
          </div>
          {/* Right Panels */}
          <div 
            className="flex min-w-[63.5%] max-w-[63.5%] bg-white rounded-lg p-4 overflow-y-auto"
            style={{ height: "100%"}}
          >
            {selected === null ? (
                <div className="flex flex-col items-center justify-center h-full w-full">
                    <h2 className="text-2xl font-semibold text-gray-700">Select a chat to start messaging</h2>
                    <p className="text-gray-500 mt-2">You have no chat selected</p>
                </div>
            ) : (
                <div className="flex flex-col h-full w-full">
                    <div className="flex-grow overflow-y-auto mb-4 p-4 rounded-lg">
                        {chatData[selected].messages.map((msg, idx) => (
                            <div key={idx} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`py-2 px-4 rounded-full max-w-xs ${msg.sender === 'agent' ? 'bg-[#506e9a] text-white' : 'bg-[#1e3a8a] text-white'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto">
                        <form className="flex gap-10 px-5" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                name="message"
                                className="flex-grow rounded-full bg-[#1e3a8a] px-4 py-2 text-white"
                                placeholder="Type your message..."
                            />
                            <button type="submit">
                                <Send className="text-[#2d8bba]"/>
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