"use client";
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import axiosInstance from "@/shared/helpers/axiosInstance";
import {
  GETSELECTEDMESSAGE,
  GETUSERMESSAGE,
  INSERTMESSAGE,
  MESSAGEUPDATE,
  SKILLPAYMENT,
} from "@/shared/helpers/endpoints";
import { io, Socket } from "socket.io-client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import useRazorpay from "@/shared/hooks/useRazorpay";
import { toast, Toaster } from "sonner";

interface User {
  _id: string;
  username: string;
  email: string;
}

interface Message {
  _id: string;
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
  const [offerAmount, setOfferAmount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isRazorpayLoaded = useRazorpay();

  useEffect(() => {
    const ownerEmail = JSON.parse(
      localStorage.getItem("userData") || "{}"
    ).email;
    const fetchAcceptedProposals = async () => {
      try {
        const response = await axiosInstance.get(
          `${GETUSERMESSAGE}?ownerEmail=${ownerEmail}`
        );
        console.log("GETUSERMESSAGE", response);
        setUsers(response.data.response.receiverDetails);
        setCurrentUser(response.data.response.senderEmail);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedProposals();

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5004";
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
    if (socket && currentUser) {
      socket.emit("user_connected", currentUser);

      socket.on("new_message", (newMessage: Message) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      socket.on("offer_update", (updatedMessage: Message) => {
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            m._id === updatedMessage._id ? updatedMessage : m
          )
        );
      });

      return () => {
        socket.off("new_message");
        socket.off("offer_update");
      };
    }
  }, [socket, currentUser]);

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${GETSELECTEDMESSAGE}?sender=${currentUser}&receiver=${user.email}`
      );
      console.log("GETSELECTEDMESSAGE", response);
      setMessages(response.data.response);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUser || (!newMessage.trim() && !offerAmount) || !currentUser)
      return;

    let content = newMessage.trim();
    if (offerAmount) {
      content = `OFFER:${offerAmount}:${content || "No message"}`;
    }

    const messageToSend: Partial<Message> = {
      sender: currentUser,
      receiver: selectedUser.email,
      content: content,
      timestamp: new Date(),
    };

    try {
      const response = await axiosInstance.post(INSERTMESSAGE, messageToSend);
      const newMessage: Message = response.data.message;

      // Update local state immediately
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Emit the new message to the socket
      socket?.emit("new_message", newMessage);

      setNewMessage("");
      setOfferAmount("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleOfferResponse = async (
    message: Message,
    status: "accepted" | "rejected"
  ) => {
    try {
      const updatedMessage = {
        ...message,
        content: `${message.content}:${status.toUpperCase()}`,
      };
      const response = await axiosInstance.post(
        `${MESSAGEUPDATE}`,
        updatedMessage
      );
      console.log("MESSAGEUPDATE", response);

      setMessages((prevMessages) =>
        prevMessages.map((m) =>
          m._id === message._id ? response.data.message : m
        )
      );

      socket?.emit("offer_response", response.data.message);

      if (status === "accepted") {
        initiatePayment(message);
      }
    } catch (error) {
      console.error("Error updating offer status:", error);
    }
  };

  const initiatePayment = (message: Message) => {
    if (!isRazorpayLoaded) {
      console.error("Razorpay SDK is not loaded yet");
      return;
    }

    const offerAmount = parseFloat(message.content.split(":")[1]);
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: offerAmount * 100,
      currency: "INR",
      name: "AlMidan",
      description: "Payment for accepted offer",
      handler: async (response: any) => {
        try {
          const responses = await axiosInstance.post(SKILLPAYMENT, {
            sender: message.sender,
            receiver: message.receiver,
            amount: offerAmount,
            paymentId: response.razorpay_payment_id,
            timestamp: new Date(),
          });
          console.log("SKILLPAYMENT", responses);

          toast.success("Payment successful!");
        } catch (error) {
          console.error("Error saving transaction:", error);
          toast.error("Error processing payment");
        }
      },
      prefill: {
        email: currentUser,
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const renderMessage = (message: Message) => {
    if (!message || typeof message.content !== "string") {
      console.error("Invalid message:", message);
      return null;
    }

    const isOffer = message.content.startsWith("OFFER:");
    const [, amount, text, status] = isOffer ? message.content.split(":") : [];
    const isCurrentUserSender = message.sender === currentUser;

    return (
      <div
        className={`mb-4 ${isCurrentUserSender ? "text-right" : "text-left"}`}
      >
        <div
          className={cn(
            "inline-block p-3 rounded-lg",
            isCurrentUserSender ? "bg-purple-600" : "bg-gray-700"
          )}
        >
          {isOffer ? (
            <div className="offer-container">
              <p className="text-lg font-semibold">Offer: ${amount}</p>
              <p className="text-sm mt-1">{text}</p>
              {status && (
                <p className="text-sm italic mt-2">
                  Status: <span className="font-bold">{status}</span>
                </p>
              )}
              {!status && !isCurrentUserSender && (
                <div className="mt-3 flex justify-center space-x-2">
                  <button
                    onClick={() => handleOfferResponse(message, "accepted")}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors duration-200"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleOfferResponse(message, "rejected")}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors duration-200"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p>{message.content}</p>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    );
  };
  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white">
      <Toaster />
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
                <span className="font-bold text-purple-400">
                  {selectedUser.username}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : messages.length > 0 ? (
                messages.map((message, index) => (
                  <div key={index}>{renderMessage(message)}</div>
                ))
              ) : (
                <div className="flex justify-center items-center h-full text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="bg-gradient-to-r from-gray-900 to-black p-4">
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-gray-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Type a message..."
                />
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Enter offer amount"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-all duration-200"
                  >
                    {offerAmount ? "Send Offer" : "Send"}
                  </button>
                </div>
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
