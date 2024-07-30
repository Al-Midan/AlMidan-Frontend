"use client"
import { useState, useEffect, useRef } from 'react'
import axiosInstance from '@/shared/helpers/axiosInstance'
import { GETSELECTEDMESSAGE, GETUSERMESSAGE, INSERTMESSAGE } from '@/shared/helpers/endpoints'
import { io, Socket } from 'socket.io-client'
import Image from 'next/image'

interface User {
  _id: string
  username: string
  email: string
}

interface Message {
  sender: string
  receiver: string
  content: string
  timestamp: Date
}

const ChatPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setcurrentUser] = useState<string | null>()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ownerEmail = JSON.parse(localStorage.getItem('userData') || '{}').email
    const fetchAcceptedProposals = async () => {
      try {
        const response = await axiosInstance.get(`${GETUSERMESSAGE}?ownerEmail=${ownerEmail}`)
        setUsers(response.data.response.receiverDetails)
        setcurrentUser(response.data.response.senderEmail)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAcceptedProposals()

    const newSocket = io('http://localhost:3001') 
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user)
    setLoading(true)
    try {
      const response = await axiosInstance.get(`${GETSELECTEDMESSAGE}?sender=${currentUser}&receiver=${user.email}`)
      setMessages(response.data.response)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return

    const message = {
      sender: currentUser!,
      receiver: selectedUser.email,
      content: newMessage,
      timestamp: new Date(),
    }

    try {
      await axiosInstance.post(INSERTMESSAGE, message)
      setMessages([...messages, message])
      setNewMessage('')
      socket?.emit('new_message', message)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Users list */}
      <div className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Chats</h2>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <ul>
            {users.map((user) => (
              <li
                key={user._id}
                className={`flex items-center p-2 cursor-pointer hover:bg-gray-700 rounded ${
                  selectedUser?._id === user._id ? 'bg-gray-700' : ''
                }`}
                onClick={() => handleUserSelect(user)}
              >
                <Image
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`}
                  alt={user.username}
                  width={40}
                  height={40}
                  className="rounded-full mr-2"
                />
                <span>{user.username}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="bg-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Image
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${selectedUser.username}`}
                  alt={selectedUser.username}
                  width={40}
                  height={40}
                  className="rounded-full mr-2"
                />
                <span className="font-bold">{selectedUser.username}</span>
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      message.sender === JSON.parse(localStorage.getItem('userData') || '{}').email
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-2 rounded-lg ${
                        message.sender === JSON.parse(localStorage.getItem('userData') || '{}').email
                          ? 'bg-blue-500'
                          : 'bg-gray-700'
                      }`}
                    >
                      {message.content}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
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
            <div className="bg-gray-800 p-4">
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-l focus:outline-none"
                  placeholder="Type a message..."
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r"
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
  )
}

export default ChatPage