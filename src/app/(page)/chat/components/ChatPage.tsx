"use client";
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import axiosInstance from "@/shared/helpers/axiosInstance";
import {
  GETSELECTEDMESSAGE,
  GETUSERMESSAGE,
  INSERTMESSAGE,
} from "@/shared/helpers/endpoints";
import { io, Socket } from "socket.io-client";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface User {
  _id: string;
  username: string;
  email: string;
}

interface Message {
  sender: string;
  receiver: string;
  content: string;
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ownerEmail = JSON.parse(
      localStorage.getItem("userData") || "{}"
    ).email;
    const fetchAcceptedProposals = async () => {
      try {
        const response = await axiosInstance.get(
          `${GETUSERMESSAGE}?ownerEmail=${ownerEmail}`
        );
        setUsers(response.data.response.receiverDetails);
        setCurrentUser(response.data.response.senderEmail);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedProposals();

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5004';
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("new_message", (message: Message) => {
        if (
          selectedUser &&
          (message.sender === selectedUser.email ||
            message.receiver === selectedUser.email)
        ) {
          setMessages((prevMessages) => {
            if (!prevMessages.some(m => m.timestamp === message.timestamp)) {
              return [...prevMessages, message];
            }
            return prevMessages;
          });
        }
      });
    }
  }, [socket, selectedUser]);

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${GETSELECTEDMESSAGE}?sender=${currentUser}&receiver=${user.email}`
      );
      setMessages(response.data.response);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !newMessage.trim() || !currentUser) return;

    const message = {
      sender: currentUser,
      receiver: selectedUser.email,
      content: newMessage,
      timestamp: new Date(),
    };

    try {
      await axiosInstance.post(INSERTMESSAGE, message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage("");
      socket?.emit("new_message", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white">
      {/* Users list */}
      <div className="w-1/4 bg-gradient-to-b from-gray-900 to-black p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">Chats</h2>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <ul>
            {users.map((user) => (
              <li
                key={user._id}
                className={cn(
                  "flex items-center p-2 cursor-pointer rounded transition-all duration-200",
                  selectedUser?._id === user._id
                    ? "bg-gradient-to-r from-purple-900 to-gray-900"
                    : "hover:bg-gray-800"
                )}
                onClick={() => handleUserSelect(user)}
              >
                <Image
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`}
                  alt={user.username}
                  width={40}
                  height={40}
                  className="rounded-full mr-2"
                />
                <span className="text-purple-300">{user.username}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 to-black">
        {selectedUser ? (
          <>
            <div className="bg-gradient-to-r from-gray-900 to-black p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Image
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${selectedUser.username}`}
                  alt={selectedUser.username}
                  width={40}
                  height={40}
                  className="rounded-full mr-2"
                />
                <span className="font-bold text-purple-400">{selectedUser.username}</span>
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-all duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      message.sender ===
                      JSON.parse(localStorage.getItem("userData") || "{}").email
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    <div
                      className={cn(
                        "inline-block p-2 rounded-lg",
                        message.sender ===
                        JSON.parse(localStorage.getItem("userData") || "{}")
                          .email
                          ? "bg-purple-600"
                          : "bg-gray-700"
                      )}
                    >
                      {message.content}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center h-full text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="bg-gradient-to-r from-gray-900 to-black p-4">
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-l focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Type a message..."
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r transition-all duration-200"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;